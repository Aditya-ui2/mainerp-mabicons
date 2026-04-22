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
  FiVideo, FiCopy, FiCheckCircle, FiX, FiRefreshCcw, FiLock
} from 'react-icons/fi';

const PIPELINE_STAGES = ["All Clients", "Finalize", "Generate Password"];

const STAGE_COLORS = {
  "All Clients": {
    bg: "bg-gray-50",
    border: "border-gray-200",
    dot: "bg-gray-400",
    count: "bg-gray-100 text-gray-600",
  },
  "Finalize": {
    bg: "bg-orange-50",
    border: "border-orange-100",
    dot: "bg-orange-400",
    count: "bg-orange-200 text-orange-600",
  },
  "Generate Password": {
    bg: "bg-purple-50",
    border: "border-purple-100",
    dot: "bg-purple-400",
    count: "bg-purple-200 text-purple-600",
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

export default function ClientPipelineTab() {
  const [clients, setClients] = useState(MOCK_CLIENTS);
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

  const PipelineCard = ({ client }) => (
    <motion.div
      layoutId={client.id}
      draggable
      onDragStart={(e) => handleDragStart(e, client.id)}
      onClick={() => setSelectedClient(client)}
      className="bg-white p-5 rounded-[24px] border border-[#F4F3EF] shadow-sm hover:shadow-xl hover:border-[#1B4DA0]/20 transition-all cursor-grab active:cursor-grabbing group mb-4"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#F8FAFF] text-[#1B4DA0] flex items-center justify-center font-black text-base border border-[#E8E7E2]">
            {client.avatar}
          </div>
          <div className="text-left">
            <h4 className="text-sm font-black text-[#1A1A2E] group-hover:text-[#1B4DA0] transition-colors line-clamp-1">{client.companyName}</h4>
            <p className="text-[10px] text-[#9B9BAD] font-black uppercase tracking-wider">{client.industry}</p>
          </div>
        </div>
      </div>

      <div className="space-y-3 mb-4">
        <div className="flex items-center gap-2.5 text-[#6B6B7E]">
          <div className="w-5 h-5 rounded-lg bg-[#F4F3EF] flex items-center justify-center">
            <User size={12} className="text-[#9B9BAD]" />
          </div>
          <span className="text-[11px] font-bold text-[#1A1A2E]">{client.contactPerson}</span>
        </div>
        <div className="flex items-center gap-2.5">
          <div className="w-5 h-5 rounded-lg bg-emerald-50 flex items-center justify-center">
            <DollarSign size={12} className="text-emerald-500" />
          </div>
          <span className="text-[12px] font-black text-[#1A1A2E]">{client.value}</span>
        </div>
      </div>

      {/* Show credentials if in Generate Password stage */}
      {client.stage === "Generate Password" && client.portalPassword && (
        <div className="mb-5 p-4 bg-purple-50 rounded-[20px] border border-purple-100/50 space-y-3 relative overflow-hidden group/cred">
          <div className="absolute top-0 right-0 w-12 h-12 bg-purple-100/30 rounded-bl-[40px] -mr-4 -mt-4 transition-all group-hover/cred:scale-110" />

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
              <span className="text-[9px] font-black text-purple-500 uppercase tracking-[2px]">System Access</span>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                navigator.clipboard.writeText(`Email: ${client.portalEmail}\nPassword: ${client.portalPassword}`);
                toast.success("Credentials copied!");
              }}
              className="p-1.5 rounded-lg bg-white shadow-sm border border-purple-100 text-purple-500 hover:bg-purple-500 hover:text-white transition-all"
            >
              <FiCopy size={12} />
            </button>
          </div>

          <div className="space-y-2.5 relative z-10">
            <div className="flex items-center justify-between group/email">
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-lg bg-white flex items-center justify-center shadow-sm border border-purple-50">
                  <FiMail size={12} className="text-purple-500" />
                </div>
                <span className="text-[11px] font-bold text-gray-700 truncate max-w-[180px]">{client.portalEmail}</span>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  navigator.clipboard.writeText(client.portalEmail);
                  toast.success("Email copied!");
                }}
                className="opacity-0 group-hover/email:opacity-100 p-1 text-purple-400 hover:text-purple-600 transition-all"
              >
                <FiCopy size={10} />
              </button>
            </div>

            <div className="flex items-center justify-between group/pass">
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-lg bg-white flex items-center justify-center shadow-sm border border-purple-50">
                  <FiLock size={12} className="text-purple-500" />
                </div>
                <code className="text-[11px] font-black text-purple-600 tracking-[3px] bg-white px-2 py-0.5 rounded border border-purple-50 shadow-sm">
                  {client.portalPassword}
                </code>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  navigator.clipboard.writeText(client.portalPassword);
                  toast.success("Password copied!");
                }}
                className="opacity-0 group-hover/pass:opacity-100 p-1 text-purple-400 hover:text-purple-600 transition-all"
              >
                <FiCopy size={10} />
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between pt-4 border-t border-[#F4F3EF]">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-[#1B4DA0] text-white flex items-center justify-center text-[10px] font-black border-2 border-white shadow-sm">
            {client.owner.split(' ').map(n => n[0]).join('')}
          </div>
          <span className="text-[9px] font-black text-[#9B9BAD] uppercase tracking-wider">{client.owner}</span>
        </div>
        <div className="flex items-center gap-1.5 px-2 py-1 bg-[#F4F3EF] rounded-lg border border-transparent group-hover:border-[#E8E7E2] transition-all">
          <Clock size={10} className="text-[#9B9BAD]" />
          <span className="text-[9px] font-black text-[#6B6B7E]">{client.lastContact}</span>
        </div>
      </div>
    </motion.div>
  );

  return (
    <div className="space-y-6 relative" style={{ fontFamily: "'Calibri', sans-serif" }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold text-[#1A1A2E] tracking-tight" style={{ fontFamily: '"Syne", sans-serif' }}>Client Pipeline</h1>
          </div>
          <p className="text-sm font-medium text-[#9B9BAD] mt-1">{filteredClients.length} Active Opportunities</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-white p-1 rounded-2xl border border-[#F4F3EF] shadow-sm flex items-center">
            <button
              onClick={() => setViewMode('kanban')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === 'kanban' ? 'bg-[#1B4DA0] text-white shadow-md shadow-[#1B4DA0]/20' : 'text-[#9B9BAD] hover:text-[#1B4DA0]'
                }`}
            >
              <LayoutGrid size={14} /> Kanban
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === 'list' ? 'bg-[#1B4DA0] text-white shadow-md shadow-[#1B4DA0]/20' : 'text-[#9B9BAD] hover:text-[#1B4DA0]'
                }`}
            >
              <List size={14} /> List
            </button>
          </div>
          <button
            onClick={() => setIsAddClientOpen(true)}
            className="flex items-center gap-2 px-6 py-3 bg-[#1B4DA0] text-white rounded-xl text-sm font-bold hover:bg-[#1a3a82] transition-all shadow-lg shadow-[#1B4DA0]/20 active:scale-95"
          >
            <Plus size={18} />
            Add new client
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
        <div className="overflow-x-auto pb-6 -mx-4 px-4 custom-scrollbar">
          <div className="flex gap-8 min-w-[1200px] h-[calc(100vh-350px)] min-h-[600px]">
            {PIPELINE_STAGES.map((stage) => (
              <div
                key={stage}
                onDragOver={(e) => handleDragOver(e, stage)}
                onDrop={(e) => handleDrop(e, stage)}
                className={`flex flex-col w-[380px] flex-shrink-0 h-full rounded-[32px] border-2 transition-all p-5 ${dragOverStage === stage
                  ? "bg-blue-50/50 border-[#1B4DA0] border-dashed scale-[1.01]"
                  : `${STAGE_COLORS[stage]?.bg || "bg-[#FAFBFF]"} border-transparent`
                  }`}
              >
                <div className="flex items-center justify-between mb-8 px-2">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${STAGE_COLORS[stage]?.dot || "bg-gray-400"} shadow-sm`} />
                    <h3 className="text-[11px] font-black text-[#1A1A2E] uppercase tracking-[3px]">{stage}</h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 rounded-xl bg-white text-[#1B4DA0] text-[10px] font-black border border-[#F4F3EF] shadow-sm">
                      {filteredClients.filter(c => c.stage === stage).length}
                    </span>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar pr-1 space-y-4">
                  {filteredClients.filter(c => c.stage === stage).map((client) => (
                    <motion.div
                      key={client.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="cursor-move active:cursor-grabbing"
                    >
                      <PipelineCard client={client} />
                    </motion.div>
                  ))}
                </div>
              </div>
            ))}
          </div>
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
