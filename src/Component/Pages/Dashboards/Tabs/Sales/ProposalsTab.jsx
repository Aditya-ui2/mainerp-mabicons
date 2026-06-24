import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiSearch, FiPlus, FiChevronRight, FiChevronDown,
  FiActivity, FiBriefcase, FiUsers, FiTrash,
  FiX, FiUser, FiCheckCircle, FiCheck,
  FiEdit2, FiRefreshCw, FiCamera, FiDatabase,
  FiFileText, FiEye
} from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import ProposalOnboardingForm from './ProposalOnboardingForm';
import ClosureOnboardingForm from './ClosureOnboardingForm';
import { getSalesLeads, updateLead, deleteLead } from '../../../service/api';

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

const StatusBadge = () => (
  <div className="inline-flex items-center gap-2 px-3 py-2 rounded-xl text-[11px] uppercase tracking-widest font-black bg-[#10B981]/10 text-[#10B981] border border-[#10B981]/20 min-w-[100px] justify-center">
    <div className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse flex-shrink-0" />
    <span className="truncate">Sent</span>
  </div>
);

const fileToBase64 = (file) => new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.readAsDataURL(file);
  reader.onload = () => resolve(reader.result);
  reader.onerror = error => reject(error);
});

const ProposalsTab = ({ notificationBell, readOnly = false }) => {
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [selectedProposalDetail, setSelectedProposalDetail] = useState(null);
  const [isOnboardModalOpen, setIsOnboardModalOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [proposalToDelete, setProposalToDelete] = useState(null);
  const [isEditingInDetail, setIsEditingInDetail] = useState(false);
  const [isSavingDetail, setIsSavingDetail] = useState(false);
  const [editableProposal, setEditableProposal] = useState(null);
  const [proposalToEdit, setProposalToEdit] = useState(null);
  const [isClosureModalOpen, setIsClosureModalOpen] = useState(false);
  const [proposalToClose, setProposalToClose] = useState(null);

  const fetchProposals = async () => {
    setLoading(true);
    try {
      const response = await getSalesLeads();
      if (response && response.data && response.data.leads) {
        const filtered = response.data.leads.filter(lead => ['proposal', 'negotiation'].includes((lead.status || '').toLowerCase().trim()));
        const mapped = filtered.map(lead => ({
          ...lead,
          id: lead.id || lead._id,
          clientName: lead.companyName,
          proposalTitle: lead.proposalTitle || lead.notes || 'Proposal Draft',
          proposalValue: lead.value || 0,
          date: lead.lastContactDate ? new Date(lead.lastContactDate).toISOString().split('T')[0] : 'N/A',
          contactPerson: lead.owner || 'N/A',
          status: lead.status === 'Negotiation' ? 'Accepted' : 'Sent',
          validUntil: lead.validUntil || 'N/A',
          time: lead.time || 'N/A',
          document: lead.document || null,
          notes: lead.notes || 'N/A'
        }));
        setProposals(mapped);
      }
    } catch (err) {
      console.error('Error fetching proposals:', err);
      toast.error('Failed to load proposals from database');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProposals();
  }, []);

  useEffect(() => {
    if (selectedProposalDetail) {
      console.log('Selected proposal detail updated:', selectedProposalDetail);
      console.log('Selected proposal document raw value:', selectedProposalDetail.document);
    }
  }, [selectedProposalDetail]);

  const handleViewDocument = (docObj) => {
    if (!docObj || !docObj.data) {
      toast.error('No document data available to view');
      return;
    }
    
    const newTab = window.open();
    if (!newTab) {
      toast.error('Popup blocked! Please allow popups for this website.');
      return;
    }
    
    newTab.document.title = docObj.name || "View Document";
    
    const isImage = docObj.type?.startsWith('image/');
    const isPdf = docObj.type === 'application/pdf';
    
    let htmlContent = '';
    if (isImage) {
      htmlContent = `
        <html>
          <head>
            <title>${docObj.name || "View Document"}</title>
            <style>
              body {
                margin: 0;
                background: #1A1A2E;
                display: flex;
                align-items: center;
                justify-content: center;
                min-height: 100vh;
                font-family: system-ui, sans-serif;
              }
              img {
                max-width: 100%;
                max-height: 100vh;
                object-fit: contain;
                box-shadow: 0 25px 50px -12px rgba(0,0,0,0.5);
                border-radius: 12px;
              }
            </style>
          </head>
          <body>
            <img src="${docObj.data}" alt="${docObj.name || 'Document'}" />
          </body>
        </html>
      `;
    } else if (isPdf) {
      htmlContent = `
        <html>
          <head>
            <title>${docObj.name || "View Document"}</title>
            <style>
              body {
                margin: 0;
                padding: 0;
                overflow: hidden;
                background: #1A1A2E;
              }
              iframe {
                width: 100%;
                height: 100vh;
                border: none;
              }
            </style>
          </head>
          <body>
            <iframe src="${docObj.data}"></iframe>
          </body>
        </html>
      `;
    } else {
      htmlContent = `
        <html>
          <head>
            <title>${docObj.name || "View Document"}</title>
            <style>
              body {
                margin: 0;
                background: #1A1A2E;
                color: white;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                min-height: 100vh;
                font-family: system-ui, sans-serif;
              }
              .container {
                text-align: center;
                background: rgba(255,255,255,0.05);
                padding: 40px;
                border-radius: 24px;
                border: 1px solid rgba(255,255,255,0.1);
                backdrop-filter: blur(10px);
              }
              a {
                color: #38bdf8;
                text-decoration: underline;
                margin-top: 15px;
                display: inline-block;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <h2>Preview not available for this file type</h2>
              <p>File Name: ${docObj.name || 'document'}</p>
              <p>File Type: ${docObj.type || 'unknown'}</p>
              <a href="${docObj.data}" download="${docObj.name || 'document'}">Download instead</a>
            </div>
          </body>
        </html>
      `;
    }
    
    newTab.document.write(htmlContent);
    newTab.document.close();
  };

  const handleSaveProposalDetails = async () => {
    setIsSavingDetail(true);
    try {
      const leadId = selectedProposalDetail.id;
      const updatedLeadData = {
        companyName: editableProposal.clientName,
        owner: editableProposal.contactPerson,
        value: parseFloat(editableProposal.proposalValue) || 0,
        status: editableProposal.status === 'Accepted' ? 'Negotiation' : 'Proposal',
        notes: editableProposal.notes || '',
        proposalTitle: editableProposal.proposalTitle || '',
        validUntil: editableProposal.validUntil || '',
        time: editableProposal.time || '',
        document: editableProposal.document || null
      };
      
      const response = await updateLead(leadId, updatedLeadData);
      if (response && response.success) {
        const updatedProposal = { ...selectedProposalDetail, ...editableProposal };
        setSelectedProposalDetail(updatedProposal);
        setProposals(prev => prev.map(c => (c.id === leadId) ? updatedProposal : c));
        setIsEditingInDetail(false);
        toast.success('Proposal details updated in database successfully');
      } else {
        throw new Error('Update failed');
      }
    } catch (error) {
      console.error('Update error:', error);
      toast.error('Failed to update proposal details in database');
    } finally {
      setIsSavingDetail(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!proposalToDelete) return;
    try {
      setLoading(true);
      await deleteLead(proposalToDelete.id);
      
      setProposals(prev => prev.filter(c => c.id !== proposalToDelete.id));
      toast.success('Proposal deleted from database successfully');
      
      setIsDeleteModalOpen(false);
      setProposalToDelete(null);
      setSelectedProposalDetail(null);
    } catch (err) {
      toast.error('Failed to delete proposal from database');
    } finally {
      setLoading(false);
    }
  };

  const handleBulkStatusUpdate = async (status) => {
    const loadingToast = toast.loading(`Updating ${selectedIds.length} proposals in database...`);
    try {
      const statusLabel = status === 'Accepted' ? 'Negotiation' : 'Proposal';
      await Promise.all(selectedIds.map(id => updateLead(id, { status: statusLabel })));
      setProposals(prev => prev.map(c => {
        return selectedIds.includes(c.id) ? { ...c, status } : c;
      }));
      
      setSelectedIds([]);
      toast.success(`${selectedIds.length} proposals updated to ${status} in database`, { id: loadingToast });
    } catch (err) {
      toast.error('Failed to update some proposals in database', { id: loadingToast });
    }
  };

  const handleBulkDelete = async () => {
    const loadingToast = toast.loading(`Deleting ${selectedIds.length} proposals from database...`);
    try {
      await Promise.all(selectedIds.map(id => deleteLead(id)));
      setProposals(prev => prev.filter(c => !selectedIds.includes(c.id)));
      
      setSelectedIds([]);
      toast.success(`${selectedIds.length} proposals removed from database`, { id: loadingToast });
    } catch (err) {
      toast.error('Failed to delete some proposals from database', { id: loadingToast });
    }
  };

  const filteredProposals = proposals.filter(c => {
    const matchesSearch = (c.clientName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.date || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = selectedStatus === 'ALL' || (c.status || 'Sent').toUpperCase() === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <>
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8 animate-in fade-in duration-500 text-left">
        <div className="flex items-center justify-between mb-8 text-left">
          <div className="flex flex-col text-left">
            <h1 className="text-3xl font-bold text-[#1A1A2E] tracking-tight font-syne">
              Proposals
            </h1>
          </div>
          <div className="flex items-center gap-3">
            {notificationBell}
            {!readOnly && (
              <button
                onClick={() => setIsOnboardModalOpen(true)}
                className="w-full sm:w-auto flex items-center justify-center px-6 py-3 rounded-2xl bg-[#1B4DA0] hover:bg-[#153D80] text-white transition-all duration-300 shadow-xl shadow-blue-500/20 sent:scale-95 group"
              >
                <FiPlus className="mr-2 text-lg transition-transform" />
                <span className="font-bold uppercase tracking-widest text-[11px]">Add Proposal</span>
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
              placeholder="Search proposals by company or owner..."
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
              <option value="SENT">SENT</option>
            </select>
            <FiChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#1B4DA0] opacity-50 group-hover:opacity-100 transition-all pointer-events-none" />
          </div>
        </div>

        <div className="bg-white rounded-[32px] shadow-sm border border-[#F4F3EF] overflow-hidden">
          <div className="overflow-x-auto min-h-[400px] flex flex-col">
            {loading ? (
              <div className="flex-1 flex flex-col items-center justify-center py-20">
                <div className="w-12 h-12 border-4 border-[#1B4DA0] border-t-transparent rounded-full animate-spin mb-4" />
                <p className="text-[#6B6B7E] font-medium">Loading proposals...</p>
              </div>
            ) : filteredProposals.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center py-20 text-center px-8">
                <div className="w-20 h-20 bg-[#F4F3EF] rounded-full flex items-center justify-center mb-6 text-[#1B4DA0]">
                  <FiDatabase size={32} />
                </div>
                <h3 className="text-xl font-bold text-[#1A1A2E] mb-2">No proposals found</h3>
                <p className="text-[#6B6B7E] max-w-xs mx-auto mb-8">
                  {searchQuery ? `No proposals match your search "${searchQuery}"` : "We couldn't find any proposals."}
                </p>
                <button 
                  onClick={fetchProposals}
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
                            selectedIds.length === filteredProposals.length && filteredProposals.length > 0
                              ? 'bg-[#1B4DA0] border-[#1B4DA0] text-white shadow-lg' 
                              : 'bg-white border-[#E2E8F0] hover:border-gray-400'
                          }`}
                          onClick={() => {
                            if (selectedIds.length === filteredProposals.length) {
                              setSelectedIds([]);
                            } else {
                              setSelectedIds(filteredProposals.map(c => c.id));
                            }
                          }}
                        >
                          {selectedIds.length === filteredProposals.length && filteredProposals.length > 0 && <FiCheck size={14} strokeWidth={4} />}
                        </div>
                      </th>
                    )}
                    <th className="px-8 py-4 text-[11px] font-bold text-[#94a3b8] uppercase tracking-widest text-left">Client Name</th>
                    <th className="px-8 py-4 text-[11px] font-bold text-[#94a3b8] uppercase tracking-widest text-left">Proposal Value</th>
                    <th className="px-8 py-4 text-[11px] font-bold text-[#94a3b8] uppercase tracking-widest text-left">Sent By</th>
                    <th className="px-8 py-4 text-[11px] font-bold text-[#94a3b8] uppercase tracking-widest text-center">Status</th>
                    <th className="px-8 py-4"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F4F3EF]">
                  {filteredProposals.map((proposal) => {
                    const proposalId = proposal.id;
                    const isSelected = selectedIds.includes(proposalId);
                    return (
                      <tr
                        key={proposalId}
                        onClick={() => setSelectedProposalDetail(proposal)}
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
                                  setSelectedIds(prev => prev.filter(id => id !== proposalId));
                                } else {
                                  setSelectedIds(prev => [...prev, proposalId]);
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
                              {(proposal.clientName || 'C').substring(0, 2).toUpperCase()}
                            </div>
                            <p className="text-[14px] font-bold text-[#1A1A2E]">{proposal.clientName}</p>
                          </div>
                        </td>
                        <td className="px-8 py-4 text-left">
                          <div className="flex items-center gap-2">
                             <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
                                <FiUser size={12} />
                             </div>
                             <p className="text-[13px] font-bold text-[#1A1A2E]">₹{proposal.proposalValue || proposal.date || 'N/A'}</p>
                          </div>
                        </td>
                        <td className="px-8 py-4 text-left">
                          <p className="text-[13px] font-bold text-[#6B6B7E] bg-slate-50 inline-flex px-3 py-1 rounded-lg border border-slate-100">{proposal.contactPerson || 'N/A'}</p>
                        </td>
                        <td className="px-8 py-4 text-center">
                          <StatusBadge />
                        </td>
                        <td className="px-8 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-end gap-2">
                            {!readOnly && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setProposalToDelete(proposal);
                                  setIsDeleteModalOpen(true);
                                }}
                                className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all opacity-0 group-hover:opacity-100 focus:opacity-100"
                                title="Delete Proposal"
                              >
                                <FiTrash size={15} />
                              </button>
                            )}
                            <FiChevronRight className="text-[#9B9BAD] group-hover:translate-x-0.5 transition-transform" size={18} />
                          </div>
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
                  <p className="text-xs font-black uppercase tracking-widest">Proposals Selected</p>
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
                {selectedIds.length === 1 && (
                  <button
                    onClick={() => {
                      const p = proposals.find(x => x.id === selectedIds[0]);
                      if (p) setSelectedProposalDetail(p);
                    }}
                    className="flex items-center gap-2 group px-4 py-2 rounded-2xl transition-all hover:bg-white/5 sent:scale-95"
                  >
                    <FiEye size={16} className="text-emerald-400 group-hover:text-white" />
                    <span className="text-[11px] font-bold uppercase tracking-widest">View</span>
                  </button>
                )}

                <button
                  onClick={() => {
                    if (window.confirm(`Are you sure you want to delete the selected ${selectedIds.length} proposal(s)?`)) {
                      handleBulkDelete();
                    }
                  }}
                  className="flex items-center gap-2 group px-4 py-2 rounded-2xl transition-all hover:bg-white/5 sent:scale-95"
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
          {selectedProposalDetail && (
            <React.Fragment>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-[#1A1A2E]/40 backdrop-blur-md z-[200000]"
                onClick={() => setSelectedProposalDetail(null)}
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
                  <h3 className="text-xl font-bold text-[#1A1A2E] font-syne">Proposal Details</h3>
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
                          onClick={handleSaveProposalDetails}
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
                                setEditableProposal(selectedProposalDetail);
                                setIsEditingInDetail(true);
                              }}
                              className="w-10 h-10 rounded-2xl flex items-center justify-center text-[#9B9BAD] hover:text-[#1B4DA0] hover:bg-blue-50 transition-all duration-300"
                              title="Edit Proposal"
                            >
                              <FiEdit2 size={18} />
                            </button>
                            <button 
                              onClick={() => {
                                setProposalToDelete(selectedProposalDetail);
                                setIsDeleteModalOpen(true);
                              }}
                              className="w-10 h-10 rounded-2xl flex items-center justify-center text-[#9B9BAD] hover:text-red-500 hover:bg-red-50 transition-all duration-300"
                              title="Delete Proposal"
                            >
                              <FiTrash size={18} />
                            </button>
                          </>
                        )}
                        <button onClick={() => setSelectedProposalDetail(null)} className="w-10 h-10 rounded-2xl flex items-center justify-center text-[#9B9BAD] hover:text-red-500 hover:bg-red-50 transition-all duration-300">
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
                        <span>{(selectedProposalDetail.clientName || 'C').substring(0, 2).toUpperCase()}</span>
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
                          value={editableProposal?.clientName || ''}
                          onChange={(e) => setEditableProposal({ ...editableProposal, clientName: e.target.value })}
                        />
                      ) : (
                        <h4 className="text-2xl font-bold text-[#1A1A2E] tracking-tight font-syne">{selectedProposalDetail.clientName}</h4>
                      )}
                    </div>
                  </div>

                  {/* Information Grid */}
                  <div className="bg-[#FAFAF8] rounded-[32px] border border-[#F4F3EF] p-8 space-y-8 shadow-sm">
                    
                    {/* Basic Info */}
                    <div className="space-y-6">
                      <div className="flex items-center gap-3 border-b border-[#F4F3EF] pb-4">
                        <FiActivity className="text-[#1B4DA0]" size={18} />
                        <h5 className="text-[12px] font-black text-[#1A1A2E] uppercase tracking-wider">Proposal Information</h5>
                      </div>
                      <div className="grid grid-cols-1 gap-y-6">
                        <InfoItem 
                          label="Proposal Title" 
                          value={isEditingInDetail ? editableProposal?.proposalTitle : selectedProposalDetail.proposalTitle} 
                          isEditing={isEditingInDetail}
                          fullWidth
                          onChange={(val) => setEditableProposal({ ...editableProposal, proposalTitle: val })}
                        />
                        <InfoItem 
                          label="Client Name" 
                          value={isEditingInDetail ? editableProposal?.clientName : selectedProposalDetail.clientName} 
                          isEditing={isEditingInDetail}
                          fullWidth
                          onChange={(val) => setEditableProposal({ ...editableProposal, clientName: val })}
                        />
                        <div className="grid grid-cols-2 gap-4">
                          <InfoItem 
                            label="Proposal Value (₹)" 
                            value={isEditingInDetail ? editableProposal?.proposalValue : selectedProposalDetail.proposalValue} 
                            isEditing={isEditingInDetail}
                            type="number"
                            onChange={(val) => setEditableProposal({ ...editableProposal, proposalValue: val })}
                          />
                          <InfoItem 
                            label="Sent By" 
                            value={isEditingInDetail ? editableProposal?.contactPerson : selectedProposalDetail.contactPerson} 
                            isEditing={isEditingInDetail}
                            onChange={(val) => setEditableProposal({ ...editableProposal, contactPerson: val })}
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <InfoItem 
                            label="Proposal Date" 
                            value={isEditingInDetail ? editableProposal?.date : selectedProposalDetail.date} 
                            isEditing={isEditingInDetail}
                            type="date"
                            onChange={(val) => setEditableProposal({ ...editableProposal, date: val })}
                          />
                          <InfoItem 
                            label="Proposal Time" 
                            value={isEditingInDetail ? editableProposal?.time : selectedProposalDetail.time} 
                            isEditing={isEditingInDetail}
                            type="time"
                            onChange={(val) => setEditableProposal({ ...editableProposal, time: val })}
                          />
                        </div>
                        <InfoItem 
                          label="Valid Until" 
                          value={isEditingInDetail ? editableProposal?.validUntil : selectedProposalDetail.validUntil} 
                          isEditing={isEditingInDetail}
                          type="date"
                          fullWidth
                          onChange={(val) => setEditableProposal({ ...editableProposal, validUntil: val })}
                        />
                        <InfoItem 
                          label="Notes / Remarks" 
                          value={isEditingInDetail ? editableProposal?.notes : selectedProposalDetail.notes} 
                          isEditing={isEditingInDetail}
                          fullWidth
                          onChange={(val) => setEditableProposal({ ...editableProposal, notes: val })}
                        />

                        {/* Proposal Document Preview / Download */}
                        {!isEditingInDetail && selectedProposalDetail.document && (() => {
                          try {
                            const docObj = typeof selectedProposalDetail.document === 'string' 
                              ? JSON.parse(selectedProposalDetail.document) 
                              : selectedProposalDetail.document;
                            
                            if (docObj && docObj.data) {
                              const isImage = docObj.type?.startsWith('image/');
                              return (
                                <div className="col-span-full space-y-3">
                                  <label className="text-[10px] font-bold text-[#9B9BAD] uppercase tracking-[2px]">Proposal Document</label>
                                  <div className="bg-white p-6 rounded-2xl border border-[#F4F3EF] flex flex-col gap-4">
                                    <div className="flex items-center gap-3 min-w-0">
                                      <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#1B4DA0] flex items-center justify-center flex-shrink-0">
                                        <FiFileText size={18} />
                                      </div>
                                      <div className="text-left min-w-0 flex-1">
                                        <p className="text-sm font-bold text-[#1A1A2E] truncate" title={docObj.name || 'document'}>{docObj.name || 'document'}</p>
                                        <p className="text-[10px] font-medium text-[#6B6B7E] uppercase tracking-wider">{docObj.type || 'unknown type'}</p>
                                      </div>
                                    </div>
                                    
                                    <div className="grid grid-cols-2 gap-3 mt-1">
                                      <button
                                        onClick={() => handleViewDocument(docObj)}
                                        className="py-3 bg-[#1B4DA0]/10 hover:bg-[#1B4DA0]/20 text-[#1B4DA0] font-black uppercase tracking-widest text-[10px] rounded-xl transition-all flex items-center justify-center gap-2"
                                      >
                                        <FiEye size={14} /> View
                                      </button>
                                      <a
                                        href={docObj.data}
                                        download={docObj.name || 'document'}
                                        className="py-3 bg-slate-50 hover:bg-slate-100 border border-[#F4F3EF] text-slate-700 font-black uppercase tracking-widest text-[10px] rounded-xl transition-all flex items-center justify-center gap-2"
                                      >
                                        Download
                                      </a>
                                    </div>
                                    
                                    {isImage && (
                                      <div className="w-full rounded-xl overflow-hidden border border-[#F4F3EF] max-h-[200px] flex items-center justify-center bg-slate-50">
                                        <img 
                                          src={docObj.data} 
                                          alt={docObj.name || 'Proposal Document'} 
                                          className="object-contain w-full h-full max-h-[200px]"
                                        />
                                      </div>
                                    )}
                                  </div>
                                </div>
                              );
                            } else {
                              return (
                                <div className="col-span-full p-4 bg-amber-50 text-amber-700 rounded-2xl text-xs font-bold border border-amber-200 text-left">
                                  ⚠️ Document data is empty or formatting is incorrect.
                                </div>
                              );
                            }
                          } catch (e) {
                            return (
                              <div className="col-span-full p-4 bg-red-50 text-red-700 rounded-2xl text-xs font-bold border border-red-200 text-left">
                                ❌ Error parsing document JSON: {e.message}
                              </div>
                            );
                          }
                          return null;
                        })()}

                        {isEditingInDetail && (
                          <div className="col-span-full space-y-2.5 text-left relative group">
                            <label className="text-[10px] font-bold text-[#9B9BAD] uppercase tracking-[2px]">Update Proposal Document</label>
                            <input
                              type="file"
                              onChange={async (e) => {
                                const file = e.target.files[0];
                                if (file) {
                                  const base64Data = await fileToBase64(file);
                                  const documentStr = JSON.stringify({
                                    name: file.name,
                                    type: file.type,
                                    data: base64Data
                                  });
                                  setEditableProposal({ ...editableProposal, document: documentStr });
                                  toast.success(`Selected new document: ${file.name}`);
                                }
                              }}
                              className="w-full bg-white border-[#F4F3EF] border-2 rounded-2xl py-3 px-5 text-[13px] font-bold text-[#1A1A2E] outline-none focus:border-[#1B4DA0]/30 transition-all file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-[11px] file:font-bold file:uppercase file:tracking-widest file:bg-blue-50 file:text-[#1B4DA0] hover:file:bg-blue-100 cursor-pointer shadow-sm focus:shadow-md"
                            />
                          </div>
                        )}
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

      {/* Add Proposal Modal */}
      <ProposalOnboardingForm 
        isOpen={isOnboardModalOpen} 
        initialData={proposalToEdit}
        onClose={() => {
          setIsOnboardModalOpen(false);
          setProposalToEdit(null);
        }}
        onComplete={(newProposal) => {
          setProposals(prev => [newProposal, ...prev]);
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
                  <h3 className="text-2xl font-bold text-[#1A1A2E] mb-2 font-syne">Delete Proposal?</h3>
                  <p className="text-sm text-[#6B6B7E] mb-8 leading-relaxed">
                    Are you sure you want to delete <span className="font-bold text-[#1A1A2E]">{proposalToDelete?.clientName}</span>? This action cannot be undone.
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

      {/* Closure Form Modal */}
      <ClosureOnboardingForm 
        isOpen={isClosureModalOpen} 
        initialData={proposalToClose}
        onClose={() => {
          setIsClosureModalOpen(false);
          setProposalToClose(null);
        }}
        onComplete={(newClosure) => {
          setProposals(prev => prev.filter(c => c.id !== proposalToClose.id));
          setSelectedProposalDetail(null);
          toast.success(`${proposalToClose.clientName} proposal has been moved to Closures! ✨`);
        }}
      />
    </>
  );
};

export default ProposalsTab;
