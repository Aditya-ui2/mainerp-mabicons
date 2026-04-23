import React, { useState, useMemo } from "react";
import { createPortal } from "react-dom";
import {
  X, Mail, Phone, Calendar, ChevronRight, ChevronDown, Plus, Download, Search, Filter,
  User, Briefcase, Tag, AlignLeft, LayoutGrid, List, AlertCircle,
  CheckSquare, Square, Trash2, Send, MapPin, DollarSign, Clock, Award,
  FileText, Upload, Eye, Video, Star, Zap, Building2, BarChart3, Edit2, Pencil
} from "lucide-react";
import { toast } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiDatabase, FiRefreshCw, FiUser, FiMail, FiBriefcase, FiCalendar, FiClock,
  FiVideo, FiCopy, FiCheckCircle, FiX, FiRefreshCcw, FiLock, FiActivity
} from 'react-icons/fi';

const PIPELINE_STAGES = ["All Clients", "Finalize", "Generate Password"];

const STAGE_COLORS = {
  "All Clients": {
    bg: "bg-slate-50",
    border: "border-slate-200",
    dot: "bg-slate-400",
    count: "bg-slate-100 text-slate-600",
  },
  "Finalize": {
    bg: "bg-amber-50",
    border: "border-amber-200",
    dot: "bg-amber-400",
    count: "bg-amber-100 text-amber-600",
  },
  "Generate Password": {
    bg: "bg-purple-50",
    border: "border-purple-200",
    dot: "bg-purple-400",
    count: "bg-purple-100 text-purple-600",
  },
};

const MOCK_CLIENTS = [
  {
    id: "1",
    companyName: "TechNova Solutions",
    contactPerson: "Rajesh Kumar",
    email: "rajesh@technova.com",
    phone: "+91 98765 43210",
    industry: "Information Technology",
    value: "₹25,00,000",
    stage: "Finalize",
    dealSize: "Enterprise",
    location: "Bangalore",
    lastContact: "2024-03-20",
    probability: 75,
    avatar: "TN",
    owner: "Sanya Gupta"
  },
  {
    id: "2",
    companyName: "Global Retail Corp",
    contactPerson: "Anita Sharma",
    email: "anita.s@globalretail.com",
    phone: "+91 87654 32109",
    industry: "Retail",
    value: "₹12,50,000",
    stage: "All Clients",
    dealSize: "Mid-Market",
    location: "Delhi",
    lastContact: "2024-03-21",
    probability: 20,
    avatar: "GR",
    owner: "Rahul Mehta"
  },
  {
    id: "3",
    companyName: "Zenith Manufacturing",
    contactPerson: "Vikram Singh",
    email: "vikram@zenithmfg.in",
    phone: "+91 76543 21098",
    industry: "Manufacturing",
    value: "₹45,00,000",
    stage: "Finalize",
    dealSize: "Large Enterprise",
    location: "Pune",
    lastContact: "2024-03-18",
    probability: 50,
    avatar: "ZM",
    owner: "Sanya Gupta"
  },
  {
    id: "4",
    companyName: "BlueSky Logistics",
    contactPerson: "Priya Verma",
    email: "p.verma@bluesky.com",
    phone: "+91 65432 10987",
    industry: "Logistics",
    value: "₹8,00,000",
    stage: "All Clients",
    dealSize: "SME",
    location: "Hyderabad",
    lastContact: "2024-03-22",
    probability: 40,
    avatar: "BL",
    owner: "Rahul Mehta"
  },
  {
    id: "5",
    companyName: "Evergreen Wellness",
    contactPerson: "Dr. Arun Joshi",
    email: "arun@evergreen.org",
    phone: "+91 54321 09876",
    industry: "Healthcare",
    value: "₹30,00,000",
    stage: "Generate Password",
    dealSize: "Enterprise",
    location: "Chennai",
    lastContact: "2024-03-15",
    probability: 100,
    avatar: "EW",
    owner: "Sanya Gupta"
  }
];

export default function ClientPipelineTab({ clients, setClients }) {
  const [viewMode, setViewMode] = useState("kanban");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [dragId, setDragId] = useState(null);
  const [dragOverStage, setDragOverStage] = useState(null);
  const [isAddClientOpen, setIsAddClientOpen] = useState(false);
  const [newClient, setNewClient] = useState({
    companyName: "",
    contactPerson: "",
    email: "",
    phone: "",
    industry: "",
    value: "",
    location: "",
    stage: "All Clients"
  });
  const [selectedClient, setSelectedClient] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [editClientData, setEditClientData] = useState(null);

  const getAvatarColor = (name) => {
    const colors = [
      'bg-blue-500', 'bg-emerald-500', 'bg-violet-500', 'bg-amber-500',
      'bg-rose-500', 'bg-indigo-500', 'bg-cyan-500', 'bg-teal-500'
    ];
    const charCodeSum = (name || '').split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
    return colors[charCodeSum % colors.length];
  };

  const filteredClients = useMemo(() => {
    return clients.filter(c =>
      c.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.contactPerson.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.industry.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [clients, searchTerm]);

  const handleDragStart = (e, id) => {
    setDragId(id);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e, stage) => {
    e.preventDefault();
    setDragOverStage(stage);
  };

  const handleDrop = (e, stage) => {
    e.preventDefault();
    if (!dragId) return;

    setClients(prev => prev.map(c => {
      if (c.id === dragId) {
        const newData = {
          ...c,
          stage,
          lastContact: new Date().toISOString().split('T')[0]
        };

        // Generate password if moving to 'Generate Password' and not already generated
        if (stage === "Generate Password" && !c.portalPassword) {
          newData.portalPassword = Math.random().toString(36).substring(2, 8).toUpperCase();
          newData.portalEmail = `${c.companyName.toLowerCase().replace(/\s+/g, '')}.admin@mabicons.com`;
          toast.success(`Generated credentials for ${c.companyName}`, { icon: '🔐' });
        }

        return newData;
      }
      return c;
    }));

    toast.success(`Moved to ${stage}`);
    setDragId(null);
    setDragOverStage(null);
  };

  const PipelineCard = ({ client }) => {
    const avatarColor = getAvatarColor(client.companyName);
    const progress = Math.round(((Math.max(0, PIPELINE_STAGES.indexOf(client.stage)) + 1) / PIPELINE_STAGES.length) * 100);

    return (
      <motion.div
        layoutId={client.id}
        draggable
        onDragStart={(e) => handleDragStart(e, client.id)}
        onClick={() => setSelectedClient(client)}
        className="bg-white rounded-xl p-2.5 cursor-grab active:cursor-grabbing transition-all duration-200 select-none group border-2 border-[#E8E7E2] relative hover:-translate-y-1 hover:shadow-lg hover:border-[#1B4DA0]/20 mb-3 shadow-sm"
      >
        <div className="flex items-start gap-2.5">
          <div className={`w-8 h-8 rounded-[10px] flex items-center justify-center text-[10px] font-bold flex-shrink-0 shadow-sm border border-white/20 text-white ${avatarColor}`}>
            {client.avatar}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex justify-between items-start">
              <p className="text-sm font-bold text-[#1A1A2E] truncate group-hover:text-[#1B4DA0] transition-colors pb-0.5">
                {client.companyName}
              </p>
              <div className="flex items-center justify-center p-1 rounded-md bg-blue-50 text-[#1B4DA0] opacity-0 group-hover:opacity-100 transition-opacity">
                <FiActivity size={10} />
              </div>
            </div>
            <p className="text-[10px] font-bold text-[#9B9BAD] uppercase tracking-[1px] truncate">
              {client.industry}
            </p>
          </div>
        </div>

        <div className="mt-3 space-y-2">
          <div className="flex items-center gap-2">
            <User size={10} className="text-[#9B9BAD]" />
            <span className="text-[10px] font-bold text-[#6B6B7E]">{client.contactPerson}</span>
          </div>
          <div className="flex items-center gap-2">
            <DollarSign size={10} className="text-emerald-500" />
            <span className="text-[11px] font-black text-[#1A1A2E]">{client.value}</span>
          </div>
        </div>

        {/* Progress Bar Section - Matching Candidate Pipeline */}
        <div className="mt-4 space-y-1.5">
          <div className="flex justify-between items-center text-[9px] font-bold uppercase tracking-widest text-[#9B9BAD]">
            <span className="flex items-center gap-1.5 opacity-70">
              <FiActivity size={10} />
              Pipeline Progress
            </span>
            <span>{progress}%</span>
          </div>
          <div className="h-1.5 bg-[#F4F3EF] rounded-full overflow-hidden shadow-inner">
            <div
              className={`h-full transition-all duration-700 rounded-full shadow-sm ${progress === 100 ? 'bg-emerald-500' : 'bg-[#1B4DA0]'}`}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Show credentials if in Generate Password stage - Refined Style */}
        {client.stage === "Generate Password" && client.portalPassword && (
          <div className="mt-4 p-3 bg-purple-50 rounded-2xl border border-purple-100/50 space-y-2 relative overflow-hidden group/cred">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[8px] font-black text-purple-500 uppercase tracking-[2px]">Portal Access</span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  navigator.clipboard.writeText(`Email: ${client.portalEmail}\nPassword: ${client.portalPassword}`);
                  toast.success("Credentials copied!");
                }}
                className="p-1 rounded-md bg-white border border-purple-100 text-purple-500 hover:bg-purple-500 hover:text-white transition-all scale-75"
              >
                <FiCopy size={12} />
              </button>
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <FiMail size={10} className="text-purple-400" />
                <span className="text-[9px] font-bold text-gray-600 truncate">{client.portalEmail}</span>
              </div>
              <div className="flex items-center gap-2">
                <FiLock size={10} className="text-purple-400" />
                <code className="text-[9px] font-black text-purple-600 tracking-[1px] bg-white px-1.5 py-0.5 rounded border border-purple-50 shadow-sm">
                  {client.portalPassword}
                </code>
              </div>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between mt-4 pt-3 border-t border-[#F4F3EF]">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-lg bg-[#1B4DA0] text-white flex items-center justify-center text-[8px] font-black border-2 border-white shadow-sm shrink-0">
              {client.owner.split(' ').map(n => n[0]).join('')}
            </div>
            <span className="text-[8px] font-black text-[#9B9BAD] uppercase tracking-wider truncate max-w-[80px]">{client.owner}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock size={10} className="text-[#9B9BAD]" />
            <span className="text-[9px] font-black text-[#6B6B7E]">{client.lastContact}</span>
          </div>
        </div>

        <button
          onClick={(e) => { e.stopPropagation(); setSelectedClient(client); }}
          className="mt-3 w-full flex items-center justify-center gap-1.5 px-2.5 py-1.5 bg-[#1B4DA0]/10 text-[#1B4DA0] rounded-lg text-[9px] font-bold hover:bg-[#1B4DA0] hover:text-white transition-all active:scale-95"
        >
          <Eye size={10} /> View Details
        </button>
      </motion.div>
    );
  };

  return (
    <div className="space-y-6 relative" style={{ fontFamily: "'Calibri', sans-serif" }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <div className="flex flex-col items-start text-left">
          <h1 className="text-3xl font-bold text-[#1A1A2E] tracking-tight" style={{ fontFamily: "'Syne', sans-serif" }}>Client Pipeline</h1>
          <p className="text-sm font-medium text-[#9B9BAD] mt-1">{filteredClients.length} Total Clients In Pipeline</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex bg-[#F4F3EF] p-1 rounded-xl border border-[#E8E7E2]">
            <button
              onClick={() => setViewMode('kanban')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${viewMode === 'kanban'
                ? "bg-white text-[#1B4DA0] shadow-sm"
                : "text-[#6B6B7E] hover:text-[#1A1A2E]"
                }`}
            >
              <LayoutGrid size={14} /> Kanban
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${viewMode === 'list'
                ? "bg-white text-[#1B4DA0] shadow-sm"
                : "text-[#6B6B7E] hover:text-[#1A1A2E]"
                }`}
            >
              <List size={14} /> List
            </button>
          </div>

          <button
            onClick={() => setIsAddClientOpen(true)}
            className="flex items-center gap-2 px-6 py-3 bg-[#1B4DA0] text-white rounded-xl text-sm font-bold hover:bg-[#1a3a82] transition-all shadow-lg active:scale-95"
          >
            <Plus size={18} />
            Add Client
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-[24px] p-2 border border-[#F4F3EF] shadow-sm flex items-center gap-3 flex-wrap mb-6">
        <div className="relative flex-1 group min-w-[200px]">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-[#9B9BAD] transition-colors" size={18} />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by company, contact or industry..."
            className="w-full bg-[#F4F3EF] border-none rounded-2xl py-3 pl-14 pr-5 text-sm font-medium focus:ring-2 focus:ring-[#F4F3EF] outline-none transition-all placeholder:text-[#9B9BAD]"
          />
        </div>
      </div>

      {viewMode === "kanban" ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 min-h-[500px]">
          {PIPELINE_STAGES.map((stage) => {
            const stageClients = filteredClients.filter((c) => c.stage === stage);
            const colors = STAGE_COLORS[stage];
            const isDragOver = dragOverStage === stage;

            return (
              <div
                key={stage}
                onDragOver={(e) => handleDragOver(e, stage)}
                onDrop={(e) => handleDrop(e, stage)}
                onDragLeave={() => setDragOverStage(null)}
                className={`rounded-[24px] border-2 transition-all duration-200 ${colors.border} ${isDragOver ? "ring-2 ring-[#1B4DA0]/40 scale-[1.01] bg-[#F8FAFF]" : colors.bg}`}
              >
                {/* Column Header */}
                <div className="px-4 py-4 flex items-center justify-between border-b border-black/5 rounded-t-[24px]">
                  <div className="flex items-center gap-2.5">
                    <span className={`w-2.5 h-2.5 rounded-full ${colors.dot} shadow-sm`} />
                    <span className="text-sm font-bold text-[#1A1A2E]" style={{ fontFamily: "'Syne', sans-serif" }}>
                      {stage}
                    </span>
                  </div>
                  <span className={`text-[10px] font-black px-2.5 py-1 rounded-xl bg-white border border-[#F4F3EF] shadow-sm ${colors.count.split(' ')[1]}`}>
                    {stageClients.length}
                  </span>
                </div>

                <div className="p-3 space-y-3 min-h-[400px]">
                  {stageClients.length > 0 ? stageClients.map((client) => (
                    <motion.div
                      key={client.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="cursor-move active:cursor-grabbing"
                    >
                      <PipelineCard client={client} />
                    </motion.div>
                  )) : (
                    <div
                      className={`h-24 rounded-2xl border-2 border-dashed flex items-center justify-center transition-all ${isDragOver ? "border-[#1B4DA0]/40 bg-[#1B4DA0]/5" : "border-[#F4F3EF] bg-transparent opacity-30"
                        }`}
                    >
                      <p className="text-[10px] font-bold text-[#9B9BAD] uppercase tracking-widest leading-none">
                        {isDragOver ? "Drop Here" : "No Records"}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white rounded-[32px] border border-[#F4F3EF] shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left font-['Calibri', sans-serif]">
              <thead>
                <tr className="bg-[#FDFDFD] border-b border-[#F4F3EF]">
                  <th className="px-6 py-5 text-[10px] font-black text-[#9B9BAD] uppercase tracking-[2px]">Company</th>
                  <th className="px-6 py-5 text-[10px] font-black text-[#9B9BAD] uppercase tracking-[2px]">Contact</th>
                  <th className="px-6 py-5 text-[10px] font-black text-[#9B9BAD] uppercase tracking-[2px]">Stage</th>
                  <th className="px-6 py-5 text-[10px] font-black text-[#9B9BAD] uppercase tracking-[2px]">Value</th>
                  <th className="px-6 py-5 text-[10px] font-black text-[#9B9BAD] uppercase tracking-[2px] text-right">Last Contact</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F4F3EF]">
                {filteredClients.map((client) => (
                  <tr
                    key={client.id}
                    onClick={() => setSelectedClient(client)}
                    className="hover:bg-[#F8FAFF] transition-colors group cursor-pointer"
                  >
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-sm font-bold text-[#1A1A2E]">{client.companyName}</p>
                        <p className="text-[10px] text-[#9B9BAD] font-bold uppercase">{client.industry}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-medium text-[#1A1A2E]">{client.contactPerson}</p>
                      <p className="text-[11px] text-[#9B9BAD]">{client.email}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${STAGE_COLORS[client.stage]?.bg} ${STAGE_COLORS[client.stage]?.border} ${STAGE_COLORS[client.stage]?.count}`}>
                        {client.stage}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm font-bold text-[#1A1A2E]">{client.value}</td>
                    <td className="px-6 py-4 text-sm font-medium text-[#6B6B7E] text-right">{client.lastContact}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Client Modal */}
      {isAddClientOpen && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="bg-white rounded-[40px] w-full max-w-2xl overflow-hidden shadow-[0_20px_70px_rgba(0,0,0,0.3)]"
          >
            {/* Modal Header */}
            <div className="px-10 py-8 border-b border-[#F4F3EF] flex items-center justify-between bg-gradient-to-r from-white to-[#F8FAFF]">
              <div>
                <h3 className="text-2xl font-bold text-[#1A1A2E] text-left" style={{ fontFamily: "'Syne', sans-serif" }}>Register New Client</h3>
                <p className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-[2px] mt-1 text-left">Onboard a new business partner</p>
              </div>
              <button
                onClick={() => setIsAddClientOpen(false)}
                className="w-12 h-12 rounded-2xl bg-[#F4F3EF] text-[#6B6B7E] hover:bg-red-50 hover:text-red-500 transition-all flex items-center justify-center shadow-sm"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Form */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const id = (clients.length + 1).toString();
                setClients([...clients, { ...newClient, id, avatar: newClient.companyName.substring(0, 2).toUpperCase(), owner: "Current User", lastContact: new Date().toISOString().split('T')[0] }]);
                setIsAddClientOpen(false);
                toast.success("Client registered successfully!");
              }}
              className="p-10 max-h-[70vh] overflow-y-auto custom-scrollbar space-y-6"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2 text-left">
                  <label className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-widest pl-1">Company Name *</label>
                  <div className="relative group">
                    <Building2 className="absolute left-6 top-1/2 -translate-y-1/2 text-[#9B9BAD] opacity-50 group-focus-within:text-[#1B4DA0] group-focus-within:opacity-100 transition-all" size={16} />
                    <input
                      required
                      className="w-full bg-[#F4F3EF] border-0 rounded-2xl pl-14 pr-6 py-4 text-sm font-bold text-[#1A1A2E] outline-none transition-all focus:bg-[#EEF2FB] focus:ring-2 focus:ring-[#1B4DA0]/10 placeholder:text-[#9B9BAD]/50"
                      placeholder="e.g. Acme Corp"
                      value={newClient.companyName}
                      onChange={(e) => setNewClient({ ...newClient, companyName: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-2 text-left">
                  <label className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-widest pl-1">Contact Person *</label>
                  <div className="relative group">
                    <User className="absolute left-6 top-1/2 -translate-y-1/2 text-[#9B9BAD] opacity-50 group-focus-within:text-[#1B4DA0] group-focus-within:opacity-100 transition-all" size={16} />
                    <input
                      required
                      className="w-full bg-[#F4F3EF] border-0 rounded-2xl pl-14 pr-6 py-4 text-sm font-bold text-[#1A1A2E] outline-none transition-all focus:bg-[#EEF2FB] focus:ring-2 focus:ring-[#1B4DA0]/10 placeholder:text-[#9B9BAD]/50"
                      placeholder="e.g. John Doe"
                      value={newClient.contactPerson}
                      onChange={(e) => setNewClient({ ...newClient, contactPerson: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-2 text-left">
                  <label className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-widest pl-1">Email Address *</label>
                  <div className="relative group">
                    <Mail className="absolute left-6 top-1/2 -translate-y-1/2 text-[#9B9BAD] opacity-50 group-focus-within:text-[#1B4DA0] group-focus-within:opacity-100 transition-all" size={16} />
                    <input
                      type="email"
                      required
                      className="w-full bg-[#F4F3EF] border-0 rounded-2xl pl-14 pr-6 py-4 text-sm font-bold text-[#1A1A2E] outline-none transition-all focus:bg-[#EEF2FB] focus:ring-2 focus:ring-[#1B4DA0]/10 placeholder:text-[#9B9BAD]/50"
                      placeholder="john@example.com"
                      value={newClient.email}
                      onChange={(e) => setNewClient({ ...newClient, email: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-2 text-left">
                  <label className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-widest pl-1">Phone Number</label>
                  <div className="relative group">
                    <Phone className="absolute left-6 top-1/2 -translate-y-1/2 text-[#9B9BAD] opacity-50 group-focus-within:text-[#1B4DA0] group-focus-within:opacity-100 transition-all" size={16} />
                    <input
                      className="w-full bg-[#F4F3EF] border-0 rounded-2xl pl-14 pr-6 py-4 text-sm font-bold text-[#1A1A2E] outline-none transition-all focus:bg-[#EEF2FB] focus:ring-2 focus:ring-[#1B4DA0]/10 placeholder:text-[#9B9BAD]/50"
                      placeholder="+91 00000 00000"
                      value={newClient.phone}
                      onChange={(e) => setNewClient({ ...newClient, phone: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-2 text-left">
                  <label className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-widest pl-1">Industry</label>
                  <div className="relative group">
                    <Briefcase className="absolute left-6 top-1/2 -translate-y-1/2 text-[#9B9BAD] opacity-50 group-focus-within:text-[#1B4DA0] group-focus-within:opacity-100 transition-all" size={16} />
                    <select
                      className="w-full bg-[#F4F3EF] border-0 rounded-2xl pl-14 pr-6 py-4 text-sm font-bold text-[#1A1A2E] outline-none transition-all focus:bg-[#EEF2FB] appearance-none cursor-pointer"
                      value={newClient.industry}
                      onChange={(e) => setNewClient({ ...newClient, industry: e.target.value })}
                    >
                      <option value="">Select Industry</option>
                      <option value="Information Technology">Information Technology</option>
                      <option value="Healthcare">Healthcare</option>
                      <option value="Manufacturing">Manufacturing</option>
                      <option value="Retail">Retail</option>
                      <option value="Logistics">Logistics</option>
                    </select>
                    <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 text-[#9B9BAD] pointer-events-none" size={16} />
                  </div>
                </div>

                <div className="space-y-2 text-left">
                  <label className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-widest pl-1">Deal Value (₹) *</label>
                  <div className="relative group">
                    <DollarSign className="absolute left-6 top-1/2 -translate-y-1/2 text-[#9B9BAD] opacity-50 group-focus-within:text-[#1B4DA0] group-focus-within:opacity-100 transition-all" size={16} />
                    <input
                      required
                      className="w-full bg-[#F4F3EF] border-0 rounded-2xl pl-14 pr-6 py-4 text-sm font-bold text-[#1A1A2E] outline-none transition-all focus:bg-[#EEF2FB] focus:ring-2 focus:ring-[#1B4DA0]/10 placeholder:text-[#9B9BAD]/50"
                      placeholder="e.g. 25,00,000"
                      value={newClient.value}
                      onChange={(e) => setNewClient({ ...newClient, value: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-2 text-left md:col-span-2">
                  <label className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-widest pl-1">Office Location</label>
                  <div className="relative group">
                    <MapPin className="absolute left-6 top-1/2 -translate-y-1/2 text-[#9B9BAD] opacity-50 group-focus-within:text-[#1B4DA0] group-focus-within:opacity-100 transition-all" size={16} />
                    <input
                      className="w-full bg-[#F4F3EF] border-0 rounded-2xl pl-14 pr-6 py-4 text-sm font-bold text-[#1A1A2E] outline-none transition-all focus:bg-[#EEF2FB] focus:ring-2 focus:ring-[#1B4DA0]/10 placeholder:text-[#9B9BAD]/50"
                      placeholder="City, State"
                      value={newClient.location}
                      onChange={(e) => setNewClient({ ...newClient, location: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              {/* Modal Actions */}
              <div className="pt-6 flex gap-4">
                <button
                  type="button"
                  onClick={() => setIsAddClientOpen(false)}
                  className="flex-1 py-4 rounded-2xl bg-[#F4F3EF] text-[#6B6B7E] text-sm font-bold hover:bg-[#E8E7E2] transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-4 rounded-2xl bg-[#1B4DA0] text-white text-sm font-bold shadow-lg shadow-blue-500/20 hover:bg-[#153D80] transition-all"
                >
                  Confirm Registration
                </button>
              </div>
            </form>
          </motion.div>
        </div>,
        document.body
      )}

      {/* Client Detail Drawer */}
      {selectedClient && createPortal(
        <>
          <div
            className="fixed inset-0 bg-[#1A1A2E]/40 backdrop-blur-md z-[99998] transition-all duration-300"
            onClick={() => { setSelectedClient(null); setEditMode(false); }}
          />
          <div
            className="fixed right-0 top-0 h-full w-full sm:w-[680px] bg-white z-[99999] overflow-y-auto shadow-[-16px_0_64px_rgba(0,0,0,0.15)] flex flex-col transition-transform duration-300 transform translate-x-0"
          >
            {/* Sticky Header */}
            <div className="sticky top-0 bg-white border-b border-[#F4F3EF] px-10 py-10 flex items-center justify-between z-20">
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-[#1A1A2E] leading-none" style={{ fontFamily: "'Syne', sans-serif" }}>
                  {editMode ? "Edit Client Profile" : "Client"}
                </h2>
              </div>
              <div className="flex items-center gap-3">

                <button
                  onClick={() => { setSelectedClient(null); setEditMode(false); }}
                  className="w-12 h-12 rounded-xl bg-[#F4F3EF] text-[#6B6B7E] flex items-center justify-center hover:bg-red-50 hover:text-red-500 transition-all border border-[#E8E7E2] shadow-sm"
                >
                  <X size={24} />
                </button>
              </div>
            </div>

            <div className="flex-1 p-8 space-y-10">
              {editMode && editClientData ? (
                <div className="space-y-6 pb-20">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2 col-span-2">
                      <label className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-widest pl-1 block text-left">Company Name</label>
                      <input
                        className="w-full bg-[#F4F3EF] rounded-2xl px-5 py-3.5 text-sm font-bold text-[#1A1A2E] outline-none border-2 border-transparent focus:border-[#1B4DA0]/20 transition-all"
                        value={editClientData.companyName}
                        onChange={(e) => setEditClientData({ ...editClientData, companyName: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-widest pl-1 block text-left">Contact Person</label>
                      <input
                        className="w-full bg-[#F4F3EF] rounded-2xl px-5 py-3.5 text-sm font-bold text-[#1A1A2E] outline-none border-2 border-transparent focus:border-[#1B4DA0]/20 transition-all"
                        value={editClientData.contactPerson}
                        onChange={(e) => setEditClientData({ ...editClientData, contactPerson: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-widest pl-1 block text-left">Email Address</label>
                      <input
                        className="w-full bg-[#F4F3EF] rounded-2xl px-5 py-3.5 text-sm font-bold text-[#1A1A2E] outline-none border-2 border-transparent focus:border-[#1B4DA0]/20 transition-all"
                        value={editClientData.email}
                        onChange={(e) => setEditClientData({ ...editClientData, email: e.target.value })}
                      />
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setClients(prev => prev.map(c => c.id === editClientData.id ? editClientData : c));
                      setSelectedClient(editClientData);
                      setEditMode(false);
                      toast.success("Profile updated!");
                    }}
                    className="w-full h-14 bg-[#1B4DA0] text-white rounded-2xl text-sm font-bold shadow-lg shadow-blue-500/20 hover:bg-[#153D80] transition-all flex items-center justify-center gap-3 active:scale-[0.98]"
                  >
                    <CheckSquare size={18} />
                    Save Client Changes
                  </button>
                </div>
              ) : (
                <>
                  <div className="space-y-10">
                    {/* Hero Profile Section */}
                    <div className="flex flex-col items-center justify-center text-center py-4">
                      <div className="relative group">
                        <div className={`w-32 h-32 rounded-[40px] flex items-center justify-center text-white text-4xl font-black shadow-2xl transform transition-transform duration-500 border-4 border-white ${getAvatarColor(selectedClient.companyName)}`}>
                          {selectedClient.companyName.substring(0, 2).toUpperCase()}
                        </div>
                        <div className="absolute -bottom-2 -right-2 w-10 h-10 rounded-2xl bg-white border border-[#E8E7E2] shadow-lg flex items-center justify-center text-emerald-500">
                          <div className="absolute inset-0 bg-emerald-500 rounded-2xl flex items-center justify-center">
                            <CheckSquare size={18} className="text-white" />
                          </div>
                        </div>
                      </div>

                      <div className="mt-8 space-y-1 w-full">
                        <h3
                          className="text-3xl font-black text-[#1A1A2E] tracking-tight group flex items-center justify-center gap-3"
                        >
                          {selectedClient.companyName}
                        </h3>
                        <div className="flex items-center justify-center gap-3 mt-1.5 overflow-hidden">
                          <span className="text-[12px] font-black text-[#1B4DA0] uppercase tracking-[4px]">{selectedClient.industry}</span>
                          <span className="w-1.5 h-1.5 rounded-full bg-[#E8E7E2]" />
                          <span className={`text-[11px] font-black uppercase tracking-[4px] ${STAGE_COLORS[selectedClient.stage]?.count?.split(' ')[1] || 'text-slate-600'}`}>
                            {selectedClient.stage}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Information Grid Container */}
                    <div className="bg-[#FAFAF9] rounded-[48px] border border-[#F4F3EF] p-12 space-y-12 shadow-sm">
                      <div className="grid grid-cols-2 gap-x-16 gap-y-10">
                        <div className="space-y-2 text-left">
                          <span className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-[3px] block">Location</span>
                          <p className="text-base font-black text-[#1A1A2E] flex items-center gap-2">
                            <MapPin size={16} className="text-[#1B4DA0] shrink-0" /> {selectedClient.location || "Not specified"}
                          </p>
                        </div>
                        <div className="space-y-2 text-left">
                          <span className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-[3px] block">Contact Person</span>
                          <p className="text-base font-black text-[#1A1A2E] flex items-center gap-2">
                            <User size={16} className="text-[#1B4DA0] shrink-0" /> {selectedClient.contactPerson}
                          </p>
                        </div>
                        <div className="space-y-2 text-left">
                          <span className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-[3px] block">Deal Value</span>
                          <p className="text-base font-black text-emerald-600 flex items-center gap-2">
                            <DollarSign size={16} className="shrink-0" /> {selectedClient.value}
                          </p>
                        </div>
                        <div className="space-y-2 text-left">
                          <span className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-[3px] block">Last Activity</span>
                          <p className="text-base font-black text-[#1A1A2E] flex items-center gap-2">
                            <Clock size={16} className="text-[#1B4DA0] shrink-0" /> {selectedClient.lastContact}
                          </p>
                        </div>
                      </div>

                      {/* Credentials Display if in 'Generate Password' stage */}
                      {selectedClient.stage === "Generate Password" && selectedClient.portalPassword && (
                        <div className="p-8 bg-purple-50 rounded-[40px] border border-purple-100/50 space-y-6 relative overflow-hidden">
                          <div className="absolute top-0 right-0 w-24 h-24 bg-purple-100/30 rounded-bl-[80px] -mr-8 -mt-8" />
                          <div className="flex items-center gap-3 relative z-10">
                            <Zap className="text-purple-500 fill-purple-500" size={20} />
                            <h4 className="text-base font-black text-purple-700 uppercase tracking-widest">Portal Access Summary</h4>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 relative z-10">
                            <div className="bg-white p-4 rounded-3xl border border-purple-100 shadow-sm">
                              <p className="text-[9px] font-black text-[#9B9BAD] uppercase tracking-widest mb-1.5">User Email</p>
                              <p className="text-sm font-bold text-gray-800 break-all">{selectedClient.portalEmail}</p>
                            </div>
                            <div className="bg-white p-4 rounded-3xl border border-purple-100 shadow-sm">
                              <p className="text-[9px] font-black text-[#9B9BAD] uppercase tracking-widest mb-1.5">Default Password</p>
                              <p className="text-sm font-black text-purple-600 tracking-[4px]">{selectedClient.portalPassword}</p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between p-8 bg-[#FAFAF9] rounded-[32px] border border-[#F4F3EF] gap-6">
                      <div className="flex items-center gap-4 flex-1">
                        <div className="w-12 h-12 rounded-2xl bg-white border border-[#F4F3EF] flex items-center justify-center text-[#1B4DA0]">
                          <Mail size={18} />
                        </div>
                        <div className="text-left">
                          <p className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-widest">Official Email</p>
                          <p className="text-sm font-black text-[#1A1A2E]">{selectedClient.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 flex-1">
                        <div className="w-12 h-12 rounded-2xl bg-white border border-[#F4F3EF] flex items-center justify-center text-[#1B4DA0]">
                          <Phone size={18} />
                        </div>
                        <div className="text-left">
                          <p className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-widest">Phone Record</p>
                          <p className="text-sm font-black text-[#1A1A2E]">{selectedClient.phone}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </>,
        document.body
      )}
    </div>
  );
}
