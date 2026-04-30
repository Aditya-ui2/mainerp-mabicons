import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiSearch, FiFilter, FiDownload, FiPlus, FiChevronRight, FiChevronDown,
  FiMail, FiPhone, FiMapPin, FiActivity, FiBriefcase, FiUsers, FiTrash,
  FiX, FiUser, FiDollarSign, FiClock, FiZap, FiCheckSquare, FiDatabase
} from 'react-icons/fi';
import { Plus } from 'lucide-react';
import { getAllClients, deleteClient } from '../../../service/api';
import { toast } from 'react-hot-toast';

const STAGE_COLORS = {
  'FINALIZE': { bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-100' },
  'Finalize': { bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-100' },
  'Onboarding Complete': { bg: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-100' },
  'LEAD STAGE': { bg: 'bg-amber-50', text: 'text-amber-600', border: 'border-amber-100' }
};

const ClientsTab = () => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIndustry, setSelectedIndustry] = useState('ALL');
  const [selectedStage, setSelectedStage] = useState('ALL');
  const [selectedClientDetail, setSelectedClientDetail] = useState(null);

  const fetchClients = async () => {
    setLoading(true);
    try {
      const res = await getAllClients();
      const clientList = res.data?.clients || res.clients || res || [];
      setClients(Array.isArray(clientList) ? clientList : []);
    } catch (err) {
      console.error('Error fetching clients:', err);
      toast.error('Failed to load clients');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  const handleDelete = async (clientId) => {
    if (!window.confirm('Are you sure you want to delete this client?')) return;
    try {
      await deleteClient(clientId);
      toast.success('Client deleted successfully');
      fetchClients();
    } catch (err) {
      toast.error('Failed to delete client');
    }
  };

  const filteredClients = clients.filter(c => {
    const matchesSearch = (c.companyName || c.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.spocName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.spocEmail || '').toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesIndustry = selectedIndustry === 'ALL' || c.industry === selectedIndustry;
    const matchesStage = selectedStage === 'ALL' || c.stage === selectedStage;

    return matchesSearch && matchesIndustry && matchesStage;
  });

  const industries = ['ALL', ...new Set(clients.map(c => c.industry).filter(Boolean))];
  const stages = ['ALL', ...new Set(clients.map(c => c.stage).filter(Boolean))];

  const getAvatarColor = (name) => {
    return 'bg-[#EEF2FB] text-[#1B4DA0] border border-[#DBEAFE]';
  };

  return (
    <>
      <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <div className="flex flex-col gap-1 text-left">
          <h1 className="text-3xl font-black text-[#1A1A2E] tracking-tight uppercase" style={{ fontFamily: "'Syne', sans-serif" }}>
            Client Directory
          </h1>
          <p className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-[0.3em]">
            {clients.length} Clients • Manage records
          </p>
        </div>
        <div className="flex gap-4 items-center flex-wrap">
          <button 
            onClick={fetchClients}
            className="group flex items-center gap-3 px-6 py-3 bg-white text-[#1B4DA0] border border-[#F4F3EF] rounded-[20px] text-[11px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all shadow-sm"
            disabled={loading}
          >
            <FiDatabase size={18} className={`text-emerald-500 transition-transform group-hover:scale-110 ${loading ? 'animate-spin' : ''}`} />
            Sync Data
          </button>

          {/* Add Client button - using the standardized style */}
          <button
            className="flex items-center gap-3 px-8 py-4 bg-[#1B4DA0] text-white rounded-[20px] text-[13px] font-black uppercase tracking-widest hover:bg-[#153e82] transition-all shadow-xl shadow-blue-500/20 active:scale-95"
          >
            <Plus size={20} /> Add Client
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-[24px] p-2 border border-[#F4F3EF] shadow-sm flex items-center gap-3 mb-8 flex-wrap">
        <div className="relative flex-1 group min-w-[200px]">
          <FiSearch className="absolute left-5 top-1/2 -translate-y-1/2 text-[#9B9BAD] transition-colors" size={18} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, company, email..."
            className="w-full bg-[#F4F3EF] border-none rounded-2xl py-4 pl-14 pr-5 text-sm font-bold text-[#1A1A2E] focus:ring-2 focus:ring-[#F4F3EF] outline-none transition-all placeholder:text-[#9B9BAD] placeholder:font-bold"
          />
        </div>

        <div className="flex items-center gap-3">
          <div className="relative group">
            <select 
              value={selectedIndustry}
              onChange={(e) => setSelectedIndustry(e.target.value)}
              className="bg-[#F4F3EF] text-[11px] font-black uppercase tracking-widest text-[#1A1A2E] rounded-xl pl-5 pr-12 py-3 outline-none border-0 cursor-pointer appearance-none min-w-[170px] hover:bg-[#EEF2FB] transition-all"
            >
              <option value="ALL">ALL INDUSTRIES</option>
              {industries.filter(i => i !== 'ALL').map(ind => (
                <option key={ind} value={ind}>{ind.toUpperCase()}</option>
              ))}
            </select>
            <FiChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-[#1B4DA0] opacity-50 group-hover:opacity-100 transition-all pointer-events-none" size={14} />
          </div>

          <div className="relative group">
            <select 
              value={selectedStage}
              onChange={(e) => setSelectedStage(e.target.value)}
              className="bg-[#F4F3EF] text-[11px] font-black uppercase tracking-widest text-[#1A1A2E] rounded-xl pl-5 pr-12 py-3 outline-none border-0 cursor-pointer appearance-none min-w-[170px] hover:bg-[#EEF2FB] transition-all"
            >
              <option value="ALL">ALL STAGES</option>
              {stages.filter(s => s !== 'ALL').map(stg => (
                <option key={stg} value={stg}>{stg.toUpperCase()}</option>
              ))}
            </select>
            <FiChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-[#1B4DA0] opacity-50 group-hover:opacity-100 transition-all pointer-events-none" size={14} />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-[32px] shadow-sm border border-[#F4F3EF] overflow-hidden">
        <div className="overflow-x-auto min-h-[400px]">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#F4F3EF] bg-gray-50/50">
                <th className="px-8 py-5 text-[11px] font-bold text-[#9B9BAD] uppercase tracking-widest text-left">Company</th>
                <th className="px-8 py-5 text-[11px] font-bold text-[#9B9BAD] uppercase tracking-widest text-left">SPOC Details</th>
                <th className="px-8 py-5 text-[11px] font-bold text-[#9B9BAD] uppercase tracking-widest text-left">Industry</th>
                <th className="px-8 py-5 text-[11px] font-bold text-[#9B9BAD] uppercase tracking-widest text-left">Location</th>
                <th className="px-8 py-5 text-[11px] font-bold text-[#9B9BAD] uppercase tracking-widest text-left">Stage</th>
                <th className="px-8 py-5 text-right"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F4F3EF]">
              {loading ? (
                <tr>
                  <td colSpan="6" className="py-20 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-8 h-8 border-4 border-[#1B4DA0] border-t-transparent rounded-full animate-spin" />
                      <p className="text-[11px] font-black text-[#9B9BAD] uppercase tracking-widest">Loading Directory...</p>
                    </div>
                  </td>
                </tr>
              ) : filteredClients.length > 0 ? filteredClients.map((client) => {
                if (!client) return null;
                return (
                  <tr 
                    key={client.id || client._id} 
                    onClick={() => {
                      toast.success(`Opening ${client.companyName || client.name}`);
                      setSelectedClientDetail(client);
                    }}
                    className="hover:bg-[#F8FAFF] transition-all group cursor-pointer"
                  >
                    <td className="px-8 py-4">
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-black shadow-sm ${getAvatarColor(client.companyName || client.name)}`}>
                          {(client.companyName || client.name || 'C').substring(0, 2).toUpperCase()}
                        </div>
                        <div className="text-left">
                          <p className="text-[14px] font-bold text-[#1A1A2E]">{client.companyName || client.name}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-4 text-left">
                      <p className="text-[13px] font-bold text-[#1A1A2E]">{client.spocName || 'N/A'}</p>
                      <div className="flex items-center gap-2 text-[11px] text-[#9B9BAD]">
                        <FiMail size={10} /> {client.spocEmail || client.email}
                      </div>
                    </td>
                    <td className="px-8 py-4 text-left">
                      <span className="text-[12px] font-bold text-[#6B6B7E]">{client.industry || 'General'}</span>
                    </td>
                    <td className="px-8 py-4 text-left">
                      <div className="flex items-center gap-1.5 text-[12px] font-bold text-[#6B6B7E]">
                        <FiMapPin size={12} className="text-[#1B4DA0]" />
                        {client.city || client.location || 'N/A'}
                      </div>
                    </td>
                    <td className="px-8 py-4 text-left">
                      <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
                        (() => {
                          const s = (client.stage || '').toUpperCase().trim();
                          if (s === 'ONBOARDING COMPLETE') return 'bg-emerald-50 text-emerald-600 border border-emerald-100';
                          if (s === 'FINALIZE') return 'bg-blue-50 text-blue-600 border border-blue-100';
                          if (s === 'LEAD STAGE') return 'bg-amber-50 text-amber-600 border border-amber-100';
                          return 'bg-slate-50 text-slate-600 border border-slate-100';
                        })()
                      } border`}>
                        {client.stage || 'Lead Stage'}
                      </span>
                    </td>
                    <td className="px-8 py-4">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all">
                        <button 
                          onClick={(e) => { e.stopPropagation(); handleDelete(client.id || client._id); }}
                          className="p-2 rounded-lg text-rose-500 hover:bg-rose-50 transition-all"
                        >
                          <FiTrash size={16} />
                        </button>
                        <button 
                          onClick={(e) => { e.stopPropagation(); setSelectedClientDetail(client); }}
                          className="p-2 rounded-lg text-[#1B4DA0] hover:bg-blue-50 transition-all"
                        >
                          <FiChevronRight size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              }) : (
                <tr>
                  <td colSpan="6" className="py-24 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <FiUsers size={32} className="text-[#F4F3EF]" />
                      <p className="text-[11px] font-black text-[#9B9BAD] uppercase tracking-widest">No clients found in directory</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>

      <AnimatePresence>
        {selectedClientDetail && (
          <div className="fixed inset-0 z-[200000]">
            <motion.div
              key="client-drawer-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-[#0F172A]/40 backdrop-blur-[12px]"
            onClick={() => setSelectedClientDetail(null)}
          />
          <motion.div
            key="client-drawer-content"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="absolute right-0 top-0 h-full w-full sm:w-[680px] bg-white overflow-y-auto shadow-[-20px_0_80px_rgba(0,0,0,0.2)] flex flex-col"
          >
            <div className="sticky top-0 bg-white border-b border-[#F4F3EF] px-10 py-10 flex items-center justify-between z-20">
              <div className="flex-1 text-left">
                <h2 className="text-xl font-bold text-[#1A1A2E] leading-none" style={{ fontFamily: "'Syne', sans-serif" }}>
                  Client Profile
                </h2>
              </div>
              <button
                onClick={() => setSelectedClientDetail(null)}
                className="w-10 h-10 rounded-xl bg-[#F4F3EF] text-[#6B6B7E] flex items-center justify-center hover:bg-red-50 hover:text-red-500 transition-all border border-[#E8E7E2] shadow-sm outline-none"
              >
                <FiX size={20} />
              </button>
            </div>

            <div className="flex-1 p-8 space-y-12 custom-scrollbar">
              <div className="flex flex-col items-center justify-center text-center py-6">
                <div className="relative group">
                  <div className={`w-28 h-28 rounded-[32px] flex items-center justify-center text-3xl font-bold shadow-xl transition-transform duration-500 border-2 border-white ${getAvatarColor(selectedClientDetail.companyName || selectedClientDetail.name)}`}>
                    {String(selectedClientDetail.companyName || selectedClientDetail.name || 'C').substring(0, 2).toUpperCase()}
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-9 h-9 rounded-xl bg-white border border-[#E8E7E2] shadow-lg flex items-center justify-center text-emerald-500">
                    <div className="absolute inset-0 bg-emerald-500 rounded-xl flex items-center justify-center">
                      <FiCheckSquare size={16} className="text-white" />
                    </div>
                  </div>
                </div>
                <div className="mt-8 space-y-2 w-full text-center">
                  <h3 className="text-2xl font-bold text-[#1A1A2E] tracking-tight flex items-center justify-center gap-3" style={{ fontFamily: "'Syne', sans-serif" }}>
                    {selectedClientDetail.companyName || selectedClientDetail.name}
                  </h3>
                  <div className="flex items-center justify-center gap-4 mt-2">
                    <span className="text-[11px] font-bold text-[#1B4DA0] uppercase tracking-[3px]">{selectedClientDetail.industry || 'CLIENT'}</span>
                    <span className="w-1 h-1 rounded-full bg-[#E8E7E2]" />
                    <span className={`text-[10px] font-bold uppercase tracking-[3px] ${
                      (() => {
                        const s = (selectedClientDetail.stage || '').toUpperCase().trim();
                        if (s === 'ONBOARDING COMPLETE') return 'text-emerald-600';
                        if (s === 'FINALIZE') return 'text-blue-600';
                        return 'text-amber-600';
                      })()
                    }`}>
                      {selectedClientDetail.stage || 'ALL CLIENTS'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-[#FAFAF9] rounded-[48px] border border-[#F4F3EF] p-10 space-y-10 shadow-sm">
                <div className="grid grid-cols-2 gap-x-12 gap-y-8">
                  <div className="space-y-2 text-left">
                    <span className="text-[10px] font-bold text-[#9B9BAD] uppercase tracking-[3px] block">Location</span>
                    <p className="text-base font-bold text-[#1A1A2E] flex items-center gap-2">
                      <FiMapPin size={16} className="text-[#1B4DA0] shrink-0" /> {selectedClientDetail.city || selectedClientDetail.location || "Not specified"}
                    </p>
                  </div>
                  <div className="space-y-2 text-left">
                    <span className="text-[10px] font-bold text-[#9B9BAD] uppercase tracking-[3px] block">Contact Person</span>
                    <p className="text-base font-bold text-[#1A1A2E] flex items-center gap-2">
                      <FiUser size={16} className="text-[#1B4DA0] shrink-0" /> {selectedClientDetail.spocName || "N/A"}
                    </p>
                  </div>
                  <div className="space-y-2 text-left">
                    <span className="text-[10px] font-bold text-[#9B9BAD] uppercase tracking-[3px] block">Deal Value</span>
                    <p className="text-base font-bold text-emerald-600 flex items-center gap-2">
                      <FiDollarSign size={16} className="shrink-0" /> {selectedClientDetail.value || '₹0'}
                    </p>
                  </div>
                  <div className="space-y-2 text-left">
                    <span className="text-[10px] font-bold text-[#9B9BAD] uppercase tracking-[3px] block">Last Activity</span>
                    <p className="text-base font-bold text-[#1A1A2E] flex items-center gap-2">
                      <FiClock size={16} className="text-[#1B4DA0] shrink-0" /> {selectedClientDetail.lastContact || "Updated Today"}
                    </p>
                  </div>
                </div>

                {(selectedClientDetail.portalPassword || selectedClientDetail.portalEmail) && (
                  <div className="p-8 bg-purple-50 rounded-[40px] border border-purple-100/50 space-y-6 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-purple-100/30 rounded-bl-[80px] -mr-8 -mt-8" />
                    <div className="flex items-center gap-3 relative z-10">
                      <FiZap className="text-purple-500 fill-purple-500" size={20} />
                      <h4 className="text-base font-bold text-purple-700 uppercase tracking-widest text-left">Portal Access Summary</h4>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 relative z-10 text-left">
                      <div className="bg-white p-4 rounded-3xl border border-purple-100 shadow-sm text-left">
                        <p className="text-[9px] font-bold text-[#9B9BAD] uppercase tracking-widest mb-1.5 text-left">User Email</p>
                        <p className="text-sm font-bold text-gray-800 break-all">{selectedClientDetail.portalEmail}</p>
                      </div>
                      <div className="bg-white p-4 rounded-3xl border border-purple-100 shadow-sm text-left">
                        <p className="text-[9px] font-bold text-[#9B9BAD] uppercase tracking-widest mb-1.5">Default Password</p>
                        <p className="text-sm font-bold text-purple-600 tracking-[4px]">{selectedClientDetail.portalPassword}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between p-8 bg-[#FAFAF9] rounded-[32px] border border-[#F4F3EF] gap-6">
                <div className="flex items-center gap-4 flex-1 text-left">
                  <div className="w-12 h-12 rounded-2xl bg-white border border-[#F4F3EF] flex items-center justify-center text-[#1B4DA0]">
                    <FiMail size={18} />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-[#9B9BAD] uppercase tracking-widest">Official Email</p>
                    <p className="text-sm font-bold text-[#1A1A2E] leading-tight break-all">{selectedClientDetail.spocEmail || selectedClientDetail.email || 'N/A'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 flex-1 text-left">
                  <div className="w-12 h-12 rounded-2xl bg-white border border-[#F4F3EF] flex items-center justify-center text-[#1B4DA0]">
                    <FiPhone size={18} />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-[#9B9BAD] uppercase tracking-widest">Phone Record</p>
                    <p className="text-sm font-bold text-[#1A1A2E]">{selectedClientDetail.spocContact || selectedClientDetail.phone || 'N/A'}</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  </>
);
};

export default ClientsTab;
