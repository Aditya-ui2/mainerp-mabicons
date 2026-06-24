import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiSearch, FiPlus, FiChevronRight, FiChevronDown,
  FiX, FiCheckCircle, FiCheck, FiTrash, FiTarget,
  FiActivity, FiTrendingUp, FiRefreshCw, FiPieChart,
  FiUser, FiDatabase
} from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import { getAllCampaigns, createCampaign, updateCampaign, deleteCampaign } from '../../../service/api';

const InfoItem = ({ label, value, subValue, fullWidth = false, isEditing, onChange, type = "text" }) => (
  <div className={`space-y-1.5 ${fullWidth ? 'col-span-full' : ''}`}>
    <label className="text-[10px] font-bold text-[#9B9BAD] uppercase tracking-[2px]">{label}</label>
    <div className="bg-white px-4 py-3 rounded-xl border border-[#F4F3EF]">
      {isEditing ? (
        <input
          type={type}
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          className="w-full text-sm font-bold text-[#1A1A2E] bg-transparent border-none focus:outline-none"
        />
      ) : (
        <>
          <p className="text-sm font-bold text-[#1A1A2E]">{value || 'N/A'}</p>
          {subValue && <p className="text-[10px] font-medium text-[#6B6B7E] mt-0.5">{subValue}</p>}
        </>
      )}
    </div>
  </div>
);

const StatusDropdown = ({ active, onChange, campaignId }) => {
  const [isOpen, setIsOpen] = useState(false);
  const currentStatus = active ? 'Active' : 'Inactive';
  
  return (
    <div className="relative inline-block" onClick={e => e.stopPropagation()}>
      <button
        id={`status-btn-campaign-${campaignId}`}
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center justify-between gap-2 px-3 py-2 rounded-xl text-[11px] uppercase tracking-widest font-black transition-all min-w-[110px] ${
          active 
            ? 'bg-[#10B981]/10 text-[#10B981] hover:bg-[#10B981]/20 border border-[#10B981]/20' 
            : 'bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-200'
        }`}
      >
        <div className="flex items-center gap-2">
          <div className={`w-1.5 h-1.5 rounded-full ${active ? 'bg-[#10B981] animate-pulse' : 'bg-slate-400'}`} />
          <span className="truncate">{currentStatus}</span>
        </div>
        <FiChevronDown size={14} className={`transition-transform opacity-60 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && createPortal(
        <>
          <div className="fixed inset-0 z-[1100] bg-transparent" onClick={() => setIsOpen(false)} />
          <div
            className="fixed z-[1101] w-36 bg-white rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.12)] border border-[#F4F3EF] py-2 flex flex-col"
            style={(() => {
              const btn = document.getElementById(`status-btn-campaign-${campaignId}`);
              if (!btn) return { top: 0, left: 0 };
              const rect = btn.getBoundingClientRect();
              const spaceBelow = window.innerHeight - rect.bottom;
              if (spaceBelow < 120) {
                return { bottom: window.innerHeight - rect.top + 6, left: rect.left };
              }
              return { top: rect.bottom + 6, left: rect.left };
            })()}
          >
            <button
              onClick={() => { onChange(true); setIsOpen(false); }}
              className={`w-full text-left px-4 py-3 text-[11px] font-black uppercase tracking-widest flex items-center gap-2 transition-all hover:bg-[#10B981]/10 text-[#10B981] ${active ? 'bg-[#10B981]/10' : 'hover:text-[#10B981] text-slate-600'}`}
            >
              <div className="w-1.5 h-1.5 rounded-full bg-[#10B981]" />
              Active
            </button>
            <button
              onClick={() => { onChange(false); setIsOpen(false); }}
              className={`w-full text-left px-4 py-3 text-[11px] font-black uppercase tracking-widest flex items-center gap-2 transition-all hover:bg-slate-100 text-slate-600 ${!active ? 'bg-slate-100' : 'hover:text-slate-600 text-slate-600'}`}
            >
              <div className="w-1.5 h-1.5 rounded-full bg-slate-400" />
              Inactive
            </button>
          </div>
        </>,
        document.body
      )}
    </div>
  );
};

const GenericCampaignTab = ({ campaignType, notificationBell }) => {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [selectedCampaignDetail, setSelectedCampaignDetail] = useState(null);
  const [selectedIds, setSelectedIds] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [addForm, setAddForm] = useState({ name: '', ownerName: '', targetReach: '', engagement: '', budget: '', duration: '', roas: '' });
  const [addLoading, setAddLoading] = useState(false);

  const title = campaignType || 'Campaigns';

  const fetchCampaigns = async () => {
    setLoading(true);
    try {
      const res = await getAllCampaigns(campaignType);
      let list = [];
      if (Array.isArray(res)) list = res;
      else if (Array.isArray(res?.campaigns)) list = res.campaigns;
      else if (Array.isArray(res?.data)) list = res.data;
      setCampaigns(list);
    } catch (err) {
      console.error('Error fetching campaigns:', err);
      toast.error('Failed to load campaigns');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCampaigns();
    setSelectedIds([]);
  }, [campaignType]);

  const handleToggleStatus = async (camp, newStatus) => {
    const statusLabel = newStatus ? 'Active' : 'Inactive';
    const campId = camp.id;
    setCampaigns(prev => prev.map(c => (c.id === campId) ? { ...c, status: statusLabel } : c));
    if (selectedCampaignDetail?.id === campId) setSelectedCampaignDetail(prev => ({ ...prev, status: statusLabel }));
    try {
      await updateCampaign(campId, { status: statusLabel });
      toast.success(`${camp.name} is now ${statusLabel}`);
    } catch { toast.error('Failed to update status'); }
  };

  const handleAddCampaign = async () => {
    if (!addForm.name.trim()) { toast.error('Campaign name is required'); return; }
    setAddLoading(true);
    try {
      const res = await createCampaign({ ...addForm, type: campaignType || 'Email Campaigns' });
      const newCamp = res?.data || res;
      if (newCamp) setCampaigns(prev => [newCamp, ...prev]);
      setShowAddModal(false);
      setAddForm({ name: '', ownerName: '', targetReach: '', engagement: '', budget: '', duration: '', roas: '' });
      toast.success('Campaign added successfully!');
    } catch { toast.error('Failed to add campaign'); }
    finally { setAddLoading(false); }
  };

  const handleBulkStatusUpdate = async (status) => {
    const loadingToast = toast.loading(`Updating ${selectedIds.length} campaigns...`);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      setCampaigns(prev => prev.map(c => {
        return selectedIds.includes(c.id) ? { ...c, status } : c;
      }));
      
      setSelectedIds([]);
      toast.success(`${selectedIds.length} campaigns updated to ${status}`, { id: loadingToast });
    } catch (err) {
      toast.error('Failed to update some campaigns', { id: loadingToast });
    }
  };

  const handleBulkDelete = async () => {
    const loadingToast = toast.loading(`Deleting ${selectedIds.length} campaigns...`);
    try {
      await Promise.all(selectedIds.map(id => deleteCampaign(id)));
      setCampaigns(prev => prev.filter(c => !selectedIds.includes(c.id)));
      setSelectedIds([]);
      toast.success(`${selectedIds.length} campaigns removed`, { id: loadingToast });
    } catch { toast.error('Failed to delete some campaigns', { id: loadingToast }); }
  };

  const filteredCampaigns = campaigns.filter(c => {
    const matchesSearch = (c.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.ownerName || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = selectedStatus === 'ALL' || (c.status || 'Active').toUpperCase() === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <>
      <motion.div key={campaignType} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8 animate-in fade-in duration-500 text-left">
        <div className="flex items-center justify-between mb-8 text-left">
          <div className="flex flex-col text-left">
            <h1 className="text-3xl font-bold text-[#1A1A2E] tracking-tight font-syne">
              {title}
            </h1>
          </div>
          <div className="flex items-center gap-3">
            {notificationBell}
            <button
              onClick={() => setShowAddModal(true)}
              className="w-full sm:w-auto flex items-center justify-center px-6 py-3 rounded-2xl bg-[#1B4DA0] hover:bg-[#153D80] text-white transition-all duration-300 shadow-xl shadow-blue-500/20 active:scale-95 group"
            >
              <FiPlus className="mr-2 text-lg transition-transform" />
              <span className="font-bold uppercase tracking-widest text-[11px]">Add Campaign</span>
            </button>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="bg-white rounded-[24px] p-2 border border-[#F4F3EF] shadow-sm flex items-center gap-3 flex-wrap mb-8">
          <div className="relative flex-1 group min-w-[200px]">
            <FiSearch className="absolute left-5 top-1/2 -translate-y-1/2 text-[#9B9BAD] transition-colors" size={18} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={`Search ${title.toLowerCase()}...`}
              className="w-full pl-12 pr-4 py-3 bg-transparent border-none focus:outline-none text-sm font-bold text-[#1A1A2E] placeholder:text-[#9B9BAD]"
            />
          </div>
          
          <div className="w-[1px] h-8 bg-[#F4F3EF] hidden sm:block"></div>

          <div className="flex gap-2 p-1 bg-[#F4F3EF]/50 rounded-xl">
            {['ALL', 'ACTIVE', 'INACTIVE'].map(status => (
              <button
                key={status}
                onClick={() => setSelectedStatus(status)}
                className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                  selectedStatus === status 
                    ? 'bg-white text-[#1B4DA0] shadow-sm' 
                    : 'text-[#9B9BAD] hover:text-[#1A1A2E]'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        {/* Campaign Table */}
        <div className="bg-white rounded-[32px] border border-[#F4F3EF] overflow-hidden shadow-sm">
          <div className="overflow-x-auto custom-scrollbar">
            {loading ? (
              <div className="p-12 flex flex-col items-center justify-center text-center space-y-4">
                <div className="w-12 h-12 border-4 border-[#F4F3EF] border-t-[#1B4DA0] rounded-full animate-spin"></div>
                <p className="text-[#9B9BAD] font-bold text-sm">Loading campaigns...</p>
              </div>
            ) : filteredCampaigns.length === 0 ? (
              <div className="p-16 flex flex-col items-center justify-center text-center">
                <div className="w-20 h-20 bg-[#FAFAF8] rounded-[24px] flex items-center justify-center mb-6">
                  <FiTarget className="text-[#D4AF37] opacity-50" size={32} />
                </div>
                <h3 className="text-xl font-bold text-[#1A1A2E] mb-2 font-syne">No Campaigns Found</h3>
                <p className="text-[#6B6B7E] font-medium text-sm">Try adjusting your filters or create a new campaign.</p>
              </div>
            ) : (
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-[#F4F3EF]">
                    <th className="pl-8 pr-4 py-4 w-10">
                      <div 
                        className={`w-5 h-5 rounded-md border-2 flex items-center justify-center cursor-pointer transition-all ${
                          selectedIds.length === filteredCampaigns.length && filteredCampaigns.length > 0
                            ? 'bg-[#1B4DA0] border-[#1B4DA0] text-white shadow-lg' 
                            : 'bg-white border-[#E2E8F0] hover:border-gray-400'
                        }`}
                        onClick={() => {
                          if (selectedIds.length === filteredCampaigns.length) {
                            setSelectedIds([]);
                          } else {
                            setSelectedIds(filteredCampaigns.map(c => c.id));
                          }
                        }}
                      >
                        {selectedIds.length === filteredCampaigns.length && filteredCampaigns.length > 0 && <FiCheck size={14} strokeWidth={4} />}
                      </div>
                    </th>
                    <th className="px-8 py-4 text-[11px] font-bold text-[#94a3b8] uppercase tracking-widest text-left">Campaign Name</th>
                    <th className="px-8 py-4 text-[11px] font-bold text-[#94a3b8] uppercase tracking-widest text-left">Manager</th>
                    <th className="px-8 py-4 text-[11px] font-bold text-[#94a3b8] uppercase tracking-widest text-left">Target Reach</th>
                    <th className="px-8 py-4 text-[11px] font-bold text-[#94a3b8] uppercase tracking-widest text-left">Engagement</th>
                    <th className="px-8 py-4 text-[11px] font-bold text-[#94a3b8] uppercase tracking-widest text-left">Status</th>
                    <th className="px-8 py-4"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F4F3EF]">
                  {filteredCampaigns.map((camp) => {
                    const isSelected = selectedIds.includes(camp.id);
                    return (
                      <tr
                        key={camp.id}
                        onClick={() => setSelectedCampaignDetail(camp)}
                        className={`hover:bg-[#F8FAFF] transition-all group cursor-pointer ${isSelected ? 'bg-blue-50/50' : ''}`}
                      >
                        <td className="pl-8 pr-4 py-4">
                          <div 
                            className={`w-5 h-5 rounded-md border-2 flex items-center justify-center cursor-pointer transition-all ${
                              isSelected 
                                ? 'bg-[#1B4DA0] border-[#1B4DA0] text-white' 
                                : 'bg-white border-[#E2E8F0] hover:border-gray-400'
                            }`}
                            onClick={(e) => {
                              e.stopPropagation();
                              if (isSelected) {
                                setSelectedIds(prev => prev.filter(id => id !== camp.id));
                              } else {
                                setSelectedIds(prev => [...prev, camp.id]);
                              }
                            }}
                          >
                            {isSelected && <FiCheck size={14} strokeWidth={4} />}
                          </div>
                        </td>
                        <td className="px-8 py-4">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-pink-50 text-pink-500 flex items-center justify-center font-black text-lg">
                              <FiTarget size={20} />
                            </div>
                            <p className="text-[14px] font-bold text-[#1A1A2E]">{camp.name}</p>
                          </div>
                        </td>
                        <td className="px-8 py-4 text-left">
                          <div className="flex items-center gap-2">
                             <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
                                <FiUser size={12} />
                             </div>
                             <p className="text-[13px] font-bold text-[#1A1A2E]">{camp.ownerName || 'N/A'}</p>
                          </div>
                        </td>
                        <td className="px-8 py-4 text-left">
                          <p className="text-[13px] font-bold text-[#6B6B7E] bg-slate-50 inline-flex px-3 py-1 rounded-lg border border-slate-100">{camp.targetReach}</p>
                        </td>
                        <td className="px-8 py-4 text-left">
                          <div className="flex items-center gap-2">
                            <FiActivity className="text-emerald-500" size={14} />
                            <span className="text-[13px] font-bold text-emerald-600">{camp.engagement}</span>
                          </div>
                        </td>
                        <td className="px-8 py-4 text-left">
                          <StatusDropdown 
                            campaignId={camp.id}
                            active={['active', 'accepted'].includes((camp.status || 'Active').toLowerCase().trim())} 
                            onChange={(val) => handleToggleStatus(camp, val)} 
                          />
                        </td>
                        <td className="px-8 py-4 text-right">
                          <FiChevronRight className="inline-block text-[#9B9BAD]" size={18} />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </motion.div>

      {/* Bulk Selection Bar */}
      {createPortal(
        <AnimatePresence>
          {selectedIds.length > 0 && (
            <motion.div
              initial={{ y: 100, x: '-50%', opacity: 0 }}
              animate={{ y: 0, x: '-50%', opacity: 1 }}
              exit={{ y: 100, x: '-50%', opacity: 0 }}
              className="fixed bottom-10 left-1/2 -translate-x-1/2 bg-[#1A1A2E] text-white px-8 py-5 rounded-[28px] shadow-2xl flex items-center gap-10 z-[1000] border border-white/10"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-pink-500 text-white rounded-xl flex items-center justify-center font-black text-sm">
                  {selectedIds.length}
                </div>
                <div>
                  <p className="text-xs font-black uppercase tracking-widest">Campaigns Selected</p>
                  <button 
                    onClick={() => setSelectedIds([])}
                    className="text-[10px] font-bold text-red-400 hover:text-red-300 uppercase tracking-widest mt-0.5"
                  >
                    Deselect All
                  </button>
                </div>
              </div>

              <div className="h-10 w-[1px] bg-white/10" />

              <div className="flex items-center gap-4">
                <button
                  onClick={() => handleBulkStatusUpdate('Active')}
                  className="flex items-center gap-2 group px-4 py-2 rounded-2xl transition-all hover:bg-white/5 active:scale-95"
                >
                  <FiCheckCircle size={16} className="text-emerald-400 group-hover:text-white" />
                  <span className="text-[11px] font-bold uppercase tracking-widest">Mark Active</span>
                </button>

                <button
                  onClick={() => handleBulkStatusUpdate('Inactive')}
                  className="flex items-center gap-2 group px-4 py-2 rounded-2xl transition-all hover:bg-white/5 active:scale-95"
                >
                  <FiX size={16} className="text-amber-400 group-hover:text-white" />
                  <span className="text-[11px] font-bold uppercase tracking-widest">Mark Inactive</span>
                </button>

                <button
                  onClick={handleBulkDelete}
                  className="flex items-center gap-2 group px-4 py-2 rounded-2xl transition-all hover:bg-white/5 active:scale-95"
                >
                  <FiTrash size={16} className="text-red-400 group-hover:text-white" />
                  <span className="text-[11px] font-bold uppercase tracking-widest">Delete</span>
                </button>
              </div>

              <button
                onClick={() => setSelectedIds([])}
                className="p-3 rounded-xl bg-white/5 hover:bg-white/10 hover:text-white transition-all text-[#9B9BAD]"
              >
                <FiX size={20} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}

      {/* Side Detail Drawer */}
      {createPortal(
        <AnimatePresence>
          {selectedCampaignDetail && (
            <React.Fragment>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-[#1A1A2E]/40 backdrop-blur-md z-[200000]"
                onClick={() => setSelectedCampaignDetail(null)}
              />
              <motion.div
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: "spring", damping: 30, stiffness: 200 }}
                className="fixed inset-y-0 right-0 w-full max-w-[500px] bg-white shadow-2xl border-l border-[#F4F3EF] flex flex-col z-[200001] overflow-hidden"
              >
                {/* Drawer Header */}
                <div className="p-6 border-b border-[#F4F3EF] flex items-center justify-between bg-gradient-to-r from-pink-50/30 to-white">
                  <h3 className="text-xl font-bold text-[#1A1A2E] font-syne">Campaign Details</h3>
                  <button 
                    onClick={() => setSelectedCampaignDetail(null)}
                    className="w-10 h-10 rounded-xl bg-white border border-[#F4F3EF] flex items-center justify-center text-[#9B9BAD] hover:text-[#1A1A2E] hover:border-[#E8E7E2] transition-all shadow-sm"
                  >
                    <FiX size={18} />
                  </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                  <div className="space-y-8">
                    <div className="flex items-center gap-5">
                      <div className="w-16 h-16 rounded-[20px] bg-pink-100 flex items-center justify-center border border-pink-200">
                        <FiPieChart className="text-pink-500 w-8 h-8" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-[#1A1A2E]">{selectedCampaignDetail.name}</h2>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-widest ${selectedCampaignDetail.status === 'Active' ? 'bg-[#10B981]/10 text-[#10B981]' : 'bg-slate-100 text-slate-500'}`}>
                            {selectedCampaignDetail.status}
                          </span>
                          <span className="text-[11px] font-bold text-[#9B9BAD] uppercase tracking-widest">
                            {campaignType}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-5 rounded-[20px] bg-[#F8FAFF] border border-[#F0F5FF]">
                        <p className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-widest mb-1">Target Reach</p>
                        <p className="text-xl font-bold text-[#1A1A2E]">{selectedCampaignDetail.targetReach}</p>
                      </div>
                      <div className="p-5 rounded-[20px] bg-[#F8FAFF] border border-[#F0F5FF]">
                        <p className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-widest mb-1">Engagement Rate</p>
                        <p className="text-xl font-bold text-emerald-600 flex items-center gap-2">
                          <FiTrendingUp /> {selectedCampaignDetail.engagement}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h4 className="text-[11px] font-black text-[#1A1A2E] uppercase tracking-widest">Campaign Information</h4>
                      <div className="grid gap-4">
                        <InfoItem label="Manager" value={selectedCampaignDetail.ownerName} />
                        <InfoItem label="Campaign Duration" value="Q1 2026" />
                        <InfoItem label="Budget Allocated" value="₹1,50,000" />
                        <InfoItem label="ROAS" value="3.2x" />
                      </div>
                    </div>

                  </div>
                </div>
              </motion.div>
            </React.Fragment>
          )}
        </AnimatePresence>,
        document.body
      )}
      {createPortal(
        <AnimatePresence>
          {showAddModal && (
            <React.Fragment>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="fixed inset-0 bg-[#1A1A2E]/40 backdrop-blur-md z-[200000]"
                onClick={() => setShowAddModal(false)} />
              <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
                transition={{ type: 'spring', damping: 30, stiffness: 200 }}
                className="fixed inset-y-0 right-0 w-full max-w-[480px] bg-white shadow-2xl border-l border-[#F4F3EF] flex flex-col z-[200001]">
                <div className="p-6 border-b border-[#F4F3EF] flex items-center justify-between">
                  <h3 className="text-xl font-bold text-[#1A1A2E] font-syne">Add New Campaign</h3>
                  <button onClick={() => setShowAddModal(false)} className="w-10 h-10 rounded-xl bg-white border border-[#F4F3EF] flex items-center justify-center text-[#9B9BAD] hover:text-[#1A1A2E] transition-all shadow-sm"><FiX size={18} /></button>
                </div>
                <div className="flex-1 overflow-y-auto p-8 space-y-5">
                  {[
                    { label: 'Campaign Name *', key: 'name', placeholder: 'e.g. Summer Email Blast' },
                    { label: 'Manager / Owner', key: 'ownerName', placeholder: 'e.g. Ravi Kumar' },
                    { label: 'Target Reach', key: 'targetReach', placeholder: 'e.g. 50,000' },
                    { label: 'Engagement Rate', key: 'engagement', placeholder: 'e.g. 15%' },
                    { label: 'Budget Allocated', key: 'budget', placeholder: 'e.g. ₹1,50,000' },
                    { label: 'Campaign Duration', key: 'duration', placeholder: 'e.g. Q2 2026' },
                    { label: 'ROAS', key: 'roas', placeholder: 'e.g. 3.2x' },
                  ].map(({ label, key, placeholder }) => (
                    <div key={key} className="space-y-1.5">
                      <label className="text-[10px] font-bold text-[#9B9BAD] uppercase tracking-[2px]">{label}</label>
                      <input
                        type="text"
                        value={addForm[key]}
                        onChange={e => setAddForm(prev => ({ ...prev, [key]: e.target.value }))}
                        placeholder={placeholder}
                        className="w-full px-4 py-3 rounded-xl border border-[#F4F3EF] text-sm font-bold text-[#1A1A2E] focus:outline-none focus:border-[#1B4DA0] transition-colors"
                      />
                    </div>
                  ))}
                </div>
                <div className="p-6 border-t border-[#F4F3EF] flex gap-3">
                  <button onClick={() => setShowAddModal(false)} className="flex-1 py-3 rounded-2xl border border-[#F4F3EF] text-sm font-bold text-[#6B6B7E] hover:bg-[#FAFAF8] transition-all">Cancel</button>
                  <button onClick={handleAddCampaign} disabled={addLoading}
                    className="flex-1 py-3 rounded-2xl bg-[#1B4DA0] text-white text-sm font-bold hover:bg-[#153D80] transition-all disabled:opacity-60 shadow-lg">
                    {addLoading ? 'Saving...' : 'Add Campaign'}
                  </button>
                </div>
              </motion.div>
            </React.Fragment>
          )}
        </AnimatePresence>,
        document.body
      )}
    </>
  );
};

export default GenericCampaignTab;
