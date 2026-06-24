import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiSearch, FiPlus, FiChevronRight, FiChevronDown,
  FiActivity, FiBriefcase, FiUsers, FiTrash,
  FiX, FiUser, FiCheckCircle, FiCheck,
  FiEdit2, FiRefreshCw, FiCamera, FiDatabase
} from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import FollowUpOnboardingForm from './FollowUpOnboardingForm';
import ProposalOnboardingForm from './ProposalOnboardingForm';
import { getAllLeads, updateLead, deleteLead } from '../../../service/api';

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

const StatusDropdown = ({ pending, onChange, clientId, disabled = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  const currentStatus = pending ? 'Pending' : 'Completed';
  
  return (
    <div className="relative inline-block" onClick={e => e.stopPropagation()}>
      <button
        id={`status-btn-followUp-${clientId}`}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={`flex items-center justify-between gap-2 px-3 py-2 rounded-xl text-[11px] uppercase tracking-widest font-black transition-all min-w-[110px] ${
          pending 
            ? 'bg-[#10B981]/10 text-[#10B981] hover:bg-[#10B981]/20 border border-[#10B981]/20' 
            : 'bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-200'
        }`}
      >
        <div className="flex items-center gap-2">
          <div className={`w-1.5 h-1.5 rounded-full ${pending ? 'bg-[#10B981] animate-pulse' : 'bg-slate-400'}`} />
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
              const btn = document.getElementById(`status-btn-followUp-${clientId}`);
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
              className={`w-full text-left px-4 py-3 text-[11px] font-black uppercase tracking-widest flex items-center gap-2 transition-all hover:bg-[#10B981]/10 text-[#10B981] ${pending ? 'bg-[#10B981]/10' : 'hover:text-[#10B981] text-slate-600'}`}
            >
              <div className="w-1.5 h-1.5 rounded-full bg-[#10B981]" />
              Pending
            </button>
            <button
              onClick={() => { onChange(false); setIsOpen(false); }}
              className={`w-full text-left px-4 py-3 text-[11px] font-black uppercase tracking-widest flex items-center gap-2 transition-all hover:bg-slate-100 text-slate-600 ${!pending ? 'bg-slate-100' : 'hover:text-slate-600 text-slate-600'}`}
            >
              <div className="w-1.5 h-1.5 rounded-full bg-slate-400" />
              Completed
            </button>
          </div>
        </>,
        document.body
      )}
    </div>
  );
};

const FollowUpsTab = ({ notificationBell, readOnly = false }) => {
  const [followUps, setFollowUps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [selectedFollowUpDetail, setSelectedFollowUpDetail] = useState(null);
  const [isOnboardModalOpen, setIsOnboardModalOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isBulkDeleteModalOpen, setIsBulkDeleteModalOpen] = useState(false);
  const [followUpToDelete, setFollowUpToDelete] = useState(null);
  const [isEditingInDetail, setIsEditingInDetail] = useState(false);
  const [isSavingDetail, setIsSavingDetail] = useState(false);
  const [editableFollowUp, setEditableFollowUp] = useState(null);
  const [followUpToEdit, setFollowUpToEdit] = useState(null);
  const [isProposalModalOpen, setIsProposalModalOpen] = useState(false);
  const formatDisplayDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const cleanDate = dateString.includes('T') ? dateString.split('T')[0] : dateString;
      const parts = cleanDate.split('-');
      if (parts.length === 3) {
        const [year, month, day] = parts;
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const monthIdx = parseInt(month, 10) - 1;
        if (monthIdx >= 0 && monthIdx < 12) {
          return `${day} ${monthNames[monthIdx]} ${year}`;
        }
      }
      return cleanDate;
    } catch (e) {
      return dateString;
    }
  };

  const [proposalClientData, setProposalClientData] = useState(null);

  const fetchFollowUps = async () => {
    setLoading(true);
    try {
      const response = await getAllLeads();
      if (response && response.data && response.data.leads) {
        const filteredLeads = response.data.leads.filter(lead => 
          ['qualified', 'follow up', 'proposal', 'negotiation'].includes((lead.status || '').toLowerCase().trim())
        );
        const mapped = filteredLeads.map(lead => ({
          id: lead.id,
          clientName: lead.companyName,
          date: lead.lastContactDate || (lead.createdAt ? lead.createdAt.split('T')[0] : ''),
          contactPerson: lead.contactPerson || 'N/A',
          status: ['qualified', 'follow up'].includes((lead.status || '').toLowerCase().trim()) ? 'Pending' : 'Completed'
        }));
        setFollowUps(mapped);
      }
    } catch (err) {
      console.error('Error fetching followUps:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFollowUps();
  }, []);

  const handleSaveFollowUpDetails = async () => {
    setIsSavingDetail(true);
    try {
      const followUpId = selectedFollowUpDetail.id;
      const updatedFollowUp = { ...selectedFollowUpDetail, ...editableFollowUp };
      
      // Update details in database
      await updateLead(followUpId, {
        companyName: updatedFollowUp.clientName,
        lastContactDate: updatedFollowUp.date,
        contactPerson: updatedFollowUp.contactPerson
      });
      
      setSelectedFollowUpDetail(updatedFollowUp);
      setFollowUps(prev => prev.map(c => 
        (c.id === followUpId) ? updatedFollowUp : c
      ));
      
      setIsEditingInDetail(false);
      toast.success('Follow-up details updated successfully');
    } catch (error) {
      console.error('Update error:', error);
      toast.error('Failed to update follow-up details in database');
    } finally {
      setIsSavingDetail(false);
    }
  };

  const handleToggleStatus = async (followUp, newStatus) => {
    const statusLabel = newStatus ? 'Pending' : 'Completed';
    const followUpId = followUp.id;
    const dbStatus = newStatus ? 'Qualified' : 'Proposal';
    
    try {
      await updateLead(followUpId, { status: dbStatus });
      
      setFollowUps(prev => prev.map(c => 
        (c.id === followUpId) ? { ...c, status: statusLabel } : c
      ));

      if (selectedFollowUpDetail && selectedFollowUpDetail.id === followUpId) {
        setSelectedFollowUpDetail(prev => ({ ...prev, status: statusLabel }));
      }

      toast.success(`${followUp.clientName} is now ${statusLabel}`);
      
      if (statusLabel === 'Completed') {
        setProposalClientData({ clientName: followUp.clientName });
        setIsProposalModalOpen(true);
      }
    } catch (error) {
      console.error('Toggle status error:', error);
      toast.error('Failed to update status in database');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!followUpToDelete) return;
    try {
      setLoading(true);
      await deleteLead(followUpToDelete.id);
      
      setFollowUps(prev => prev.filter(c => c.id !== followUpToDelete.id));
      toast.success('Follow-up deleted successfully from database');
      
      setIsDeleteModalOpen(false);
      setFollowUpToDelete(null);
      setSelectedFollowUpDetail(null);
    } catch (err) {
      console.error('Delete error:', err);
      toast.error('Failed to delete follow-up from database');
    } finally {
      setLoading(false);
    }
  };

  const handleBulkStatusUpdate = async (status) => {
    const loadingToast = toast.loading(`Updating ${selectedIds.length} follow-ups...`);
    try {
      const dbStatus = status === 'Pending' ? 'Qualified' : 'Proposal';
      
      // Update each selected lead in parallel in database
      await Promise.all(selectedIds.map(id => updateLead(id, { status: dbStatus })));
      
      setFollowUps(prev => prev.map(c => {
        return selectedIds.includes(c.id) ? { ...c, status } : c;
      }));
      
      // Clear selection
      setSelectedIds([]);
      toast.success(`Successfully updated ${selectedIds.length} follow-ups in database`, { id: loadingToast });
    } catch (err) {
      console.error('Bulk status update error:', err);
      toast.error('Failed to perform bulk update in database', { id: loadingToast });
    }
  };

  const handleBulkDelete = async () => {
    const loadingToast = toast.loading(`Deleting ${selectedIds.length} follow-ups...`);
    try {
      // Delete selected leads in parallel in database
      await Promise.all(selectedIds.map(id => deleteLead(id)));
      
      setFollowUps(prev => prev.filter(c => !selectedIds.includes(c.id)));
      
      setSelectedIds([]);
      setIsBulkDeleteModalOpen(false);
      toast.success(`Successfully deleted ${selectedIds.length} follow-ups from database`, { id: loadingToast });
      setSelectedFollowUpDetail(null);
    } catch (err) {
      console.error('Bulk delete error:', err);
      toast.error('Failed to perform bulk delete in database', { id: loadingToast });
    }
  };

  const filteredFollowUps = followUps.filter(c => {
    const matchesSearch = (c.clientName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.date || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = selectedStatus === 'ALL' || (c.status || 'Pending').toUpperCase() === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <>
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8 animate-in fade-in duration-500 text-left">
        <div className="flex items-center justify-between mb-8 text-left">
          <div className="flex flex-col text-left">
            <h1 className="text-3xl font-bold text-[#1A1A2E] tracking-tight font-syne">
              Follow-ups
            </h1>
          </div>
          <div className="flex items-center gap-3">
            {notificationBell}
            {!readOnly && (
              <button
                onClick={() => setIsOnboardModalOpen(true)}
                className="w-full sm:w-auto flex items-center justify-center px-6 py-3 rounded-2xl bg-[#1B4DA0] hover:bg-[#153D80] text-white transition-all duration-300 shadow-xl shadow-blue-500/20 pending:scale-95 group"
              >
                <FiPlus className="mr-2 text-lg transition-transform" />
                <span className="font-bold uppercase tracking-widest text-[11px]">Add Follow-up</span>
              </button>
            )}
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
              placeholder="Search followUps by company or owner..."
              className="w-full bg-[#F4F3EF] border-none rounded-2xl py-3 pl-14 pr-5 text-sm font-medium focus:ring-2 focus:ring-[#F4F3EF] outline-none transition-all placeholder:text-[#9B9BAD]"
            />
          </div>

          <div className="relative group">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="bg-[#F4F3EF] text-[11px] font-black uppercase tracking-widest text-[#1A1A2E] rounded-xl pl-4 pr-10 py-2.5 outline-none border-0 cursor-pointer appearance-none min-w-[150px] hover:bg-[#EEF2FB] transition-all"
            >
              <option value="ALL">ALL STATUS</option>
              <option value="PENDING">PENDING</option>
              <option value="COMPLETED">COMPLETED</option>
            </select>
            <FiChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#1B4DA0] opacity-50 group-hover:opacity-100 transition-all pointer-events-none" />
          </div>
        </div>

        <div className="bg-white rounded-[32px] shadow-sm border border-[#F4F3EF] overflow-hidden">
          <div className="overflow-x-auto min-h-[400px] flex flex-col">
            {loading ? (
              <div className="flex-1 flex flex-col items-center justify-center py-20">
                <div className="w-12 h-12 border-4 border-[#1B4DA0] border-t-transparent rounded-full animate-spin mb-4" />
                <p className="text-[#6B6B7E] font-medium">Loading followUps...</p>
              </div>
            ) : filteredFollowUps.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center py-20 text-center px-8">
                <div className="w-20 h-20 bg-[#F4F3EF] rounded-full flex items-center justify-center mb-6 text-[#1B4DA0]">
                  <FiDatabase size={32} />
                </div>
                <h3 className="text-xl font-bold text-[#1A1A2E] mb-2">No followUps found</h3>
                <p className="text-[#6B6B7E] max-w-xs mx-auto mb-8">
                  {searchQuery ? `No followUps match your search "${searchQuery}"` : "We couldn't find any followUps."}
                </p>
                <button 
                  onClick={fetchFollowUps}
                  className="px-6 py-3 bg-[#1B4DA0] text-white rounded-xl font-bold text-sm hover:bg-[#153a7a] transition-all shadow-lg"
                >
                  Refresh Data
                </button>
              </div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#F4F3EF] bg-transparent">
                    {!readOnly && (
                      <th className="pl-8 pr-4 py-4 w-10">
                        <div 
                          className={`w-5 h-5 rounded-md border-2 flex items-center justify-center cursor-pointer transition-all ${
                            selectedIds.length === filteredFollowUps.length && filteredFollowUps.length > 0
                              ? 'bg-[#1B4DA0] border-[#1B4DA0] text-white shadow-lg' 
                              : 'bg-white border-[#E2E8F0] hover:border-gray-400'
                          }`}
                          onClick={() => {
                            if (selectedIds.length === filteredFollowUps.length) {
                              setSelectedIds([]);
                            } else {
                              setSelectedIds(filteredFollowUps.map(c => c.id));
                            }
                          }}
                        >
                          {selectedIds.length === filteredFollowUps.length && filteredFollowUps.length > 0 && <FiCheck size={14} strokeWidth={4} />}
                        </div>
                      </th>
                    )}
                    <th className="px-8 py-4 text-[11px] font-bold text-[#94a3b8] uppercase tracking-widest text-left">Client Name</th>
                    <th className="px-8 py-4 text-[11px] font-bold text-[#94a3b8] uppercase tracking-widest text-left">Date & Time</th>
                    <th className="px-8 py-4 text-[11px] font-bold text-[#94a3b8] uppercase tracking-widest text-center">Contact Person</th>
                    <th className="px-8 py-4 text-[11px] font-bold text-[#94a3b8] uppercase tracking-widest text-center">Status</th>
                    <th className="px-8 py-4"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F4F3EF]">
                  {filteredFollowUps.map((followUp) => {
                    const followUpId = followUp.id;
                    const isSelected = selectedIds.includes(followUpId);
                    return (
                      <tr
                        key={followUpId}
                        onClick={() => setSelectedFollowUpDetail(followUp)}
                        className={`hover:bg-[#F8FAFF] transition-all group cursor-pointer ${isSelected ? 'bg-blue-50/50' : ''}`}
                      >
                        {!readOnly && (
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
                                  setSelectedIds(prev => prev.filter(id => id !== followUpId));
                                } else {
                                  setSelectedIds(prev => [...prev, followUpId]);
                                }
                              }}
                            >
                              {isSelected && <FiCheck size={14} strokeWidth={4} />}
                            </div>
                          </td>
                        )}
                        <td className="px-8 py-4">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-[#EEF2FB] text-[#1B4DA0] flex items-center justify-center font-black">
                              {(followUp.clientName || 'C').substring(0, 2).toUpperCase()}
                            </div>
                            <p className="text-[14px] font-bold text-[#1A1A2E]">{followUp.clientName}</p>
                          </div>
                        </td>
                        <td className="px-8 py-4 text-left">
                          <div className="flex items-center gap-2">
                             <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
                                <FiUser size={12} />
                             </div>
                             <p className="text-[13px] font-bold text-[#1A1A2E]">{formatDisplayDate(followUp.date)}</p>
                          </div>
                        </td>
                        <td className="px-8 py-4 text-center">
                          <p className="text-[13px] font-bold text-[#6B6B7E] bg-slate-50 inline-flex px-3 py-1 rounded-lg border border-slate-100">{followUp.contactPerson || 'N/A'}</p>
                        </td>
                        <td className="px-8 py-4 text-center">
                          <div className={`inline-flex items-center gap-2 px-3 py-2 rounded-xl text-[11px] uppercase tracking-widest font-black ${['pending', 'accepted'].includes((followUp.status || 'Pending').toLowerCase().trim()) ? 'bg-[#10B981]/10 text-[#10B981] border border-[#10B981]/20' : 'bg-slate-100 text-slate-600 border border-slate-200'}`}>
                            <div className={`w-1.5 h-1.5 rounded-full ${['pending', 'accepted'].includes((followUp.status || 'Pending').toLowerCase().trim()) ? 'bg-[#10B981] animate-pulse' : 'bg-slate-400'}`} />
                            <span className="truncate">{followUp.status || 'Pending'}</span>
                          </div>
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
                <div className="w-10 h-10 bg-blue-500 text-white rounded-xl flex items-center justify-center font-black text-sm">
                  {selectedIds.length}
                </div>
                <div>
                  <p className="text-xs font-black uppercase tracking-widest">Follow-ups Selected</p>
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
                  onClick={() => handleBulkStatusUpdate('Completed')}
                  className="flex items-center gap-2 group px-4 py-2 rounded-2xl transition-all hover:bg-white/5 pending:scale-95"
                >
                  <FiX size={16} className="text-amber-400 group-hover:text-white" />
                  <span className="text-[11px] font-bold uppercase tracking-widest">Mark Completed</span>
                </button>

                <button
                  onClick={() => setIsBulkDeleteModalOpen(true)}
                  className="flex items-center gap-2 group px-4 py-2 rounded-2xl transition-all hover:bg-white/5 pending:scale-95"
                >
                  <FiTrash size={16} className="text-red-400 group-hover:text-white" />
                  <span className="text-[11px] font-bold uppercase tracking-widest">Delete</span>
                </button>
              </div>

              {/* Close button */}
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
          {selectedFollowUpDetail && (
            <React.Fragment>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-[#1A1A2E]/40 backdrop-blur-md z-[200000]"
                onClick={() => setSelectedFollowUpDetail(null)}
              />
              <motion.div
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: "spring", damping: 30, stiffness: 200 }}
                className="fixed inset-y-0 right-0 w-full max-w-[500px] bg-white shadow-2xl border-l border-[#F4F3EF] flex flex-col z-[200001] overflow-hidden"
              >
                {/* Drawer Header */}
                <div className="p-6 border-b border-[#F4F3EF] flex items-center justify-between bg-gradient-to-r from-blue-50/30 to-white">
                  <h3 className="text-xl font-bold text-[#1A1A2E] font-syne">Follow-up Details</h3>
                  <div className="flex items-center gap-3">
                    {isEditingInDetail ? (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setIsEditingInDetail(false)}
                          className="px-4 py-2.5 rounded-xl text-xs font-bold text-[#6B6B7E] bg-[#F4F3EF] hover:bg-[#E8E7E2] transition-all"
                        >
                          Cancel
                        </button>
                        <button
                          disabled={isSavingDetail}
                          onClick={handleSaveFollowUpDetails}
                          className="px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-[#1B4DA0] hover:bg-[#153D80] transition-all flex items-center gap-2 shadow-md shadow-blue-500/10"
                        >
                          {isSavingDetail ? <FiRefreshCw className="animate-spin w-3.5 h-3.5" /> : <FiCheck className="w-3.5 h-3.5" />}
                          {isSavingDetail ? 'Saving...' : 'Save Changes'}
                        </button>
                      </div>
                    ) : (
                      <>
                        {!readOnly && (
                          <>
                            <button 
                              onClick={() => {
                                setEditableFollowUp(selectedFollowUpDetail);
                                setIsEditingInDetail(true);
                              }}
                              className="w-10 h-10 rounded-2xl flex items-center justify-center text-[#9B9BAD] hover:text-[#1B4DA0] hover:bg-blue-50 transition-all duration-300"
                              title="Edit Follow-up"
                            >
                              <FiEdit2 size={18} />
                            </button>
                            <button 
                              onClick={() => {
                                setFollowUpToDelete(selectedFollowUpDetail);
                                setIsDeleteModalOpen(true);
                              }}
                              className="w-10 h-10 rounded-2xl flex items-center justify-center text-[#9B9BAD] hover:text-red-500 hover:bg-red-50 transition-all duration-300"
                              title="Delete Follow-up"
                            >
                              <FiTrash size={18} />
                            </button>
                          </>
                        )}
                        <button onClick={() => setSelectedFollowUpDetail(null)} className="w-10 h-10 rounded-2xl flex items-center justify-center text-[#9B9BAD] hover:text-red-500 hover:bg-red-50 transition-all duration-300">
                          <FiX size={20} />
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* Drawer Content */}
                <div className="flex-1 overflow-y-auto px-8 py-8 space-y-8 custom-scrollbar text-left">
                  
                  {/* Profile Header (Centered) */}
                  <div className="flex flex-col items-center text-center">
                    <div className="relative mb-6">
                      <div className={`w-24 h-24 rounded-[32px] bg-[#1B4DA0] flex items-center justify-center text-white text-3xl font-extrabold shadow-xl shadow-blue-500/20 overflow-hidden ${isEditingInDetail ? 'cursor-pointer hover:scale-105 transition-all' : ''}`}
                           style={{ background: 'linear-gradient(135deg, #1B4DA0 0%, #0D47A1 100%)' }}>
                        <span>{(selectedFollowUpDetail.clientName || 'C').substring(0, 2).toUpperCase()}</span>
                        {isEditingInDetail && (
                          <div className="absolute inset-0 bg-black/50 backdrop-blur-[1px] flex flex-col items-center justify-center opacity-100 transition-opacity cursor-pointer border-2 border-white/20 rounded-[32px]">
                            <FiCamera className="text-white w-6 h-6 mb-1" />
                            <span className="text-[8px] font-black text-white uppercase tracking-widest">Change</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="space-y-1.5 w-full flex flex-col items-center">
                      {isEditingInDetail ? (
                        <input
                          type="text"
                          className="w-full max-w-[320px] text-2xl font-bold text-[#1A1A2E] bg-[#FAFAF8] border-none rounded-2xl py-2 px-4 text-center focus:outline-none transition-all font-syne"
                          value={editableFollowUp?.clientName || ''}
                          onChange={(e) => setEditableFollowUp({ ...editableFollowUp, clientName: e.target.value })}
                        />
                      ) : (
                        <h4 className="text-2xl font-bold text-[#1A1A2E] tracking-tight font-syne">{selectedFollowUpDetail.clientName}</h4>
                      )}
                    </div>
                  </div>

                  {/* Information Grid */}
                  <div className="bg-[#FAFAF8] rounded-[32px] border border-[#F4F3EF] p-8 space-y-8 shadow-sm">
                    
                    {/* Basic Info */}
                    <div className="space-y-6">
                      <div className="flex items-center gap-3 border-b border-[#F4F3EF] pb-4">
                        <FiActivity className="text-[#1B4DA0]" size={18} />
                        <h5 className="text-[12px] font-black text-[#1A1A2E] uppercase tracking-wider">Follow-up Information</h5>
                      </div>
                      <div className="grid grid-cols-1 gap-y-6">
                        <InfoItem 
                          label="Client Name" 
                          value={isEditingInDetail ? editableFollowUp?.clientName : selectedFollowUpDetail.clientName} 
                          isEditing={isEditingInDetail}
                          fullWidth
                          onChange={(val) => setEditableFollowUp({ ...editableFollowUp, clientName: val })}
                        />
                        <InfoItem 
                          label="Date & Time" 
                          value={isEditingInDetail ? editableFollowUp?.date : formatDisplayDate(selectedFollowUpDetail.date)} 
                          isEditing={isEditingInDetail}
                          fullWidth
                          onChange={(val) => setEditableFollowUp({ ...editableFollowUp, date: val })}
                        />
                        <InfoItem 
                          label="Contact Person" 
                          value={isEditingInDetail ? editableFollowUp?.contactPerson : selectedFollowUpDetail.contactPerson} 
                          isEditing={isEditingInDetail}
                          type="number"
                          fullWidth
                          onChange={(val) => setEditableFollowUp({ ...editableFollowUp, contactPerson: val })}
                        />
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

      {/* Add Follow-up Modal */}
      <FollowUpOnboardingForm 
        isOpen={isOnboardModalOpen} 
        initialData={followUpToEdit}
        onClose={() => {
          setIsOnboardModalOpen(false);
          setFollowUpToEdit(null);
        }}
        onComplete={(newFollowUp) => {
          setFollowUps(prev => {
            const exists = prev.some(c => c.id === newFollowUp.id);
            if (exists) {
              return prev.map(c => c.id === newFollowUp.id ? newFollowUp : c);
            }
            return [newFollowUp, ...prev];
          });
        }}
      />

      {/* Add Proposal Modal */}
      <ProposalOnboardingForm 
        isOpen={isProposalModalOpen}
        initialData={proposalClientData}
        onClose={() => {
          setIsProposalModalOpen(false);
          setProposalClientData(null);
        }}
      />

      {/* Delete Confirmation Modal */}
      {createPortal(
        <AnimatePresence>
          {isDeleteModalOpen && (
            <React.Fragment>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-[#1A1A2E]/60 backdrop-blur-xl z-[400000]"
                onClick={() => setIsDeleteModalOpen(false)}
              />
              <div className="fixed inset-0 flex items-center justify-center z-[400001] p-4">
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 20 }}
                  className="w-full max-w-md bg-white rounded-[40px] shadow-2xl p-10 text-center border border-[#F4F3EF]"
                >
                  <div className="w-20 h-20 bg-red-50 rounded-3xl flex items-center justify-center text-red-500 mx-auto mb-6 shadow-sm">
                    <FiTrash size={36} />
                  </div>
                  <h3 className="text-2xl font-bold text-[#1A1A2E] mb-2 font-syne">Delete Follow-up?</h3>
                  <p className="text-sm text-[#6B6B7E] mb-8 leading-relaxed">
                    Are you sure you want to delete <span className="font-bold text-[#1A1A2E]">{followUpToDelete?.clientName}</span>? This action cannot be undone.
                  </p>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      onClick={() => setIsDeleteModalOpen(false)}
                      className="py-4 bg-[#F8FAFC] border border-[#F4F3EF] rounded-2xl text-[11px] font-black uppercase tracking-widest text-[#1A1A2E] hover:bg-gray-50 transition-all"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleDeleteConfirm}
                      className="py-4 bg-red-500 rounded-2xl text-[11px] font-black uppercase tracking-widest text-white hover:bg-red-600 transition-all shadow-lg shadow-red-500/20"
                    >
                      Delete Forever
                    </button>
                  </div>
                </motion.div>
              </div>
            </React.Fragment>
          )}
        </AnimatePresence>,
        document.body
      )}
      {/* Bulk Delete Confirmation Modal */}
      {createPortal(
        <AnimatePresence>
          {isBulkDeleteModalOpen && (
            <React.Fragment>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-[#1A1A2E]/60 backdrop-blur-xl z-[400000]"
                onClick={() => setIsBulkDeleteModalOpen(false)}
              />
              <div className="fixed inset-0 flex items-center justify-center z-[400001] p-4">
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 20 }}
                  className="w-full max-w-md bg-white rounded-[40px] shadow-2xl p-10 text-center border border-[#F4F3EF]"
                >
                  <div className="w-20 h-20 bg-red-50 rounded-3xl flex items-center justify-center text-red-500 mx-auto mb-6 shadow-sm">
                    <FiTrash size={36} />
                  </div>
                  <h3 className="text-2xl font-bold text-[#1A1A2E] mb-2 font-syne">Delete Selected Follow-ups?</h3>
                  <p className="text-sm text-[#6B6B7E] mb-8 leading-relaxed">
                    Are you sure you want to delete <span className="font-bold text-[#1A1A2E]">{selectedIds.length}</span> selected follow-ups? This action cannot be undone.
                  </p>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      onClick={() => setIsBulkDeleteModalOpen(false)}
                      className="py-4 bg-[#F8FAFC] border border-[#F4F3EF] rounded-2xl text-[11px] font-black uppercase tracking-widest text-[#1A1A2E] hover:bg-gray-50 transition-all"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleBulkDelete}
                      className="py-4 bg-red-500 rounded-2xl text-[11px] font-black uppercase tracking-widest text-white hover:bg-red-600 transition-all shadow-lg shadow-red-500/20"
                    >
                      Delete Forever
                    </button>
                  </div>
                </motion.div>
              </div>
            </React.Fragment>
          )}
        </AnimatePresence>,
        document.body
      )}
    </>
  );
};

export default FollowUpsTab;
