import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiSearch, FiPlus, FiChevronRight, FiChevronDown,
  FiActivity, FiBriefcase, FiUsers, FiTrash,
  FiX, FiUser, FiCheckCircle, FiCheck,
  FiEdit2, FiRefreshCw, FiCamera, FiDatabase,
  FiDownload, FiUpload
} from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import * as XLSX from 'xlsx';
import LeadOnboardingForm from './LeadOnboardingForm';
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

const StatusDropdown = ({ active, onChange, clientId, disabled = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  const currentStatus = active ? 'Active' : 'Inactive';
  
  return (
    <div className="relative inline-block" onClick={e => e.stopPropagation()}>
      <button
        id={`status-btn-lead-${clientId}`}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={`flex items-center justify-between gap-2 px-3 py-2 rounded-xl text-[11px] uppercase tracking-widest font-black transition-all w-[130px] ${
          active 
            ? 'bg-[#10B981]/10 text-[#10B981] hover:bg-[#10B981]/20 border border-[#10B981]/20' 
            : 'bg-white text-slate-700 hover:bg-slate-50 border border-[#E2E8F0]'
        }`}
      >
        <div className="flex items-center gap-2">
          <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${active ? 'bg-[#10B981] animate-pulse' : 'bg-slate-300'}`} />
          <span className="truncate text-left">{currentStatus}</span>
        </div>
        <FiChevronDown size={14} className={`transition-transform opacity-60 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && createPortal(
        <>
          <div className="fixed inset-0 z-[1100] bg-transparent" onClick={() => setIsOpen(false)} />
          <div
            className="fixed z-[1101] w-36 bg-white rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.12)] border border-[#F4F3EF] py-2 flex flex-col"
            style={(() => {
              const btn = document.getElementById(`status-btn-lead-${clientId}`);
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

const LeadsTab = ({ notificationBell, readOnly = false }) => {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [selectedLeadDetail, setSelectedLeadDetail] = useState(null);
  const [isOnboardModalOpen, setIsOnboardModalOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isBulkDeleteModalOpen, setIsBulkDeleteModalOpen] = useState(false);
  const [leadToDelete, setLeadToDelete] = useState(null);
  const [isEditingInDetail, setIsEditingInDetail] = useState(false);
  const [isSavingDetail, setIsSavingDetail] = useState(false);
  const [editableLead, setEditableLead] = useState(null);
  const [leadToEdit, setLeadToEdit] = useState(null);

  const fetchLeads = async () => {
    setLoading(true);
    try {
      const response = await getAllLeads();
      if (response && response.data && response.data.leads) {
        const mapped = response.data.leads.map(lead => ({
          ...lead,
          id: lead.id,
          companyName: lead.companyName,
          ownerName: lead.owner || 'N/A',
          spocName: lead.contactPerson || 'N/A',
          strengthOfEmployees: lead.strengthOfEmployees || 'N/A',
          status: lead.status || 'Active',
          source: lead.source || 'N/A',
          reason: lead.reason || 'N/A'
        }));
        setLeads(mapped);
      }
    } catch (err) {
      console.error('Error fetching leads:', err);
      toast.error('Failed to load leads from database');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  const handleExportTemplate = () => {
    const templateData = [
      {
        companyName: "Example Corp",
        ownerName: "John Doe",
        strengthOfEmployees: "500",
        industry: "IT",
        status: "Active"
      }
    ];
    const ws = XLSX.utils.json_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Leads Template");
    XLSX.writeFile(wb, "Leads_Import_Template.xlsx");
  };

  const handleImportLeads = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json(ws);
        
        if (data.length === 0) {
          toast.error("No data found in the file");
          return;
        }

        const newLeads = data.map((row, i) => ({
          id: `imported-lead-${Date.now()}-${i}`,
          companyName: row.companyName || row["Company Name"] || "Unknown Company",
          ownerName: row.ownerName || row["Owner Name"] || "Unknown Owner",
          strengthOfEmployees: row.strengthOfEmployees || row["Strength"] || "N/A",
          status: row.status || row["Status"] || "Active",
          industry: row.industry || row["Industry"] || "Other"
        }));

        setLeads(prev => [...prev, ...newLeads]);
        toast.success(`Successfully imported ${newLeads.length} leads`);
      } catch (error) {
        console.error("Import error:", error);
        toast.error("Failed to parse the file");
      }
    };
    reader.readAsBinaryString(file);
    e.target.value = null; // reset input
  };

  const handleSaveLeadDetails = async () => {
    setIsSavingDetail(true);
    try {
      const leadId = selectedLeadDetail.id;
      const finalSource = editableLead.sourceDropdown === 'Other' ? editableLead.customSource : editableLead.sourceDropdown;
      const finalReason = editableLead.reasonDropdown === 'Other' ? editableLead.customReason : editableLead.reasonDropdown;

      const updatedLeadData = {
        companyName: editableLead.companyName,
        owner: editableLead.ownerName || '',
        contactPerson: editableLead.spocName || '',
        value: editableLead.value || 0,
        strengthOfEmployees: editableLead.strengthOfEmployees || '',
        status: editableLead.status,
        email: editableLead.email || '',
        phone: editableLead.phone || '',
        segment: editableLead.industry || 'General',
        location: editableLead.location || '',
        source: finalSource || '',
        reason: finalReason || '',
        notes: editableLead.notes || ''
      };
      
      const response = await updateLead(leadId, updatedLeadData);
      if (response && response.success) {
        const updatedLead = { 
          ...selectedLeadDetail, 
          ...editableLead,
          ownerName: editableLead.ownerName || 'N/A',
          spocName: editableLead.spocName || 'N/A',
          source: finalSource || 'N/A',
          reason: finalReason || 'N/A'
        };
        setSelectedLeadDetail(updatedLead);
        setLeads(prev => prev.map(c => (c.id === leadId) ? updatedLead : c));
        setIsEditingInDetail(false);
        toast.success('Lead details updated in database successfully');
      } else {
        throw new Error('Update failed');
      }
    } catch (error) {
      console.error('Update error:', error);
      toast.error('Failed to update lead details in database');
    } finally {
      setIsSavingDetail(false);
    }
  };

  const handleToggleStatus = async (lead, newStatus) => {
    const statusLabel = newStatus ? 'Active' : 'Inactive';
    const leadId = lead.id;
    try {
      await updateLead(leadId, { status: statusLabel });
      setLeads(prev => prev.map(c => 
        (c.id === leadId) ? { ...c, status: statusLabel } : c
      ));

      if (selectedLeadDetail && selectedLeadDetail.id === leadId) {
        setSelectedLeadDetail(prev => ({ ...prev, status: statusLabel }));
      }

      toast.success(`${lead.companyName} status is now ${statusLabel}`);
    } catch (error) {
      console.error('Failed to toggle status:', error);
      toast.error('Failed to update status in database');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!leadToDelete) return;
    try {
      setLoading(true);
      await deleteLead(leadToDelete.id);
      
      setLeads(prev => prev.filter(c => c.id !== leadToDelete.id));
      toast.success('Lead deleted from database successfully');
      
      setIsDeleteModalOpen(false);
      setLeadToDelete(null);
      setSelectedLeadDetail(null);
    } catch (err) {
      toast.error('Failed to delete lead from database');
    } finally {
      setLoading(false);
    }
  };

  const handleBulkStatusUpdate = async (status) => {
    const loadingToast = toast.loading(`Updating ${selectedIds.length} leads in database...`);
    try {
      await Promise.all(selectedIds.map(id => updateLead(id, { status })));
      setLeads(prev => prev.map(c => {
        return selectedIds.includes(c.id) ? { ...c, status } : c;
      }));
      
      setSelectedIds([]);
      toast.success(`${selectedIds.length} leads updated to ${status} in database`, { id: loadingToast });
    } catch (err) {
      toast.error('Failed to update some leads in database', { id: loadingToast });
    }
  };

  const handleBulkDelete = async () => {
    const loadingToast = toast.loading(`Deleting ${selectedIds.length} leads from database...`);
    try {
      await Promise.all(selectedIds.map(id => deleteLead(id)));
      setLeads(prev => prev.filter(c => !selectedIds.includes(c.id)));
      
      setSelectedIds([]);
      setIsBulkDeleteModalOpen(false);
      toast.success(`${selectedIds.length} leads removed from database`, { id: loadingToast });
    } catch (err) {
      toast.error('Failed to delete some leads from database', { id: loadingToast });
    }
  };

  const filteredLeads = leads.filter(c => {
    const matchesSearch = (c.companyName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.ownerName || '').toLowerCase().includes(searchQuery.toLowerCase());
    
    const isLeadActive = !['inactive', 'lost'].includes((c.status || 'Active').toLowerCase().trim());
    const matchesStatus = selectedStatus === 'ALL' || 
      (selectedStatus === 'ACTIVE' && isLeadActive) || 
      (selectedStatus === 'INACTIVE' && !isLeadActive);
      
    return matchesSearch && matchesStatus;
  });

  return (
    <>
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8 animate-in fade-in duration-500 text-left">
        <div className="flex items-center justify-between mb-8 text-left">
          <div className="flex flex-col text-left">
            <h1 className="text-3xl font-bold text-[#1A1A2E] tracking-tight font-syne">
              Leads
            </h1>
          </div>
          <div className="flex items-center gap-3">
            {notificationBell}
            {!readOnly && (
              <>
                <button
                  onClick={handleExportTemplate}
                  className="w-full sm:w-auto flex items-center justify-center px-4 py-3 rounded-2xl bg-[#F4F3EF] hover:bg-[#E5E3D8] text-[#1A1A2E] transition-all duration-300 shadow-sm active:scale-95 group"
                >
                  <FiDownload className="mr-2 text-lg transition-transform group-hover:-translate-y-1" />
                  <span className="font-bold uppercase tracking-widest text-[11px]">Export</span>
                </button>
                <label className="w-full sm:w-auto flex items-center justify-center px-4 py-3 rounded-2xl bg-[#F4F3EF] hover:bg-[#E5E3D8] text-[#1A1A2E] transition-all duration-300 shadow-sm active:scale-95 group cursor-pointer">
                  <FiUpload className="mr-2 text-lg transition-transform group-hover:-translate-y-1" />
                  <span className="font-bold uppercase tracking-widest text-[11px]">Import</span>
                  <input type="file" onChange={handleImportLeads} className="hidden" accept=".xlsx, .xls, .csv" />
                </label>
                <button
                  onClick={() => setIsOnboardModalOpen(true)}
                  className="w-full sm:w-auto flex items-center justify-center px-6 py-3 rounded-2xl bg-[#1B4DA0] hover:bg-[#153D80] text-white transition-all duration-300 shadow-xl shadow-blue-500/20 active:scale-95 group"
                >
                  <FiPlus className="mr-2 text-lg transition-transform" />
                  <span className="font-bold uppercase tracking-widest text-[11px]">Add Lead</span>
                </button>
              </>
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
              placeholder="Search leads by company or owner..."
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
              <option value="ACTIVE">ACTIVE</option>
              <option value="INACTIVE">INACTIVE</option>
            </select>
            <FiChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#1B4DA0] opacity-50 group-hover:opacity-100 transition-all pointer-events-none" />
          </div>
        </div>

        <div className="bg-white rounded-[32px] shadow-sm border border-[#F4F3EF] overflow-hidden">
          <div className="overflow-x-auto min-h-[400px] flex flex-col">
            {loading ? (
              <div className="flex-1 flex flex-col items-center justify-center py-20">
                <div className="w-12 h-12 border-4 border-[#1B4DA0] border-t-transparent rounded-full animate-spin mb-4" />
                <p className="text-[#6B6B7E] font-medium">Loading leads...</p>
              </div>
            ) : filteredLeads.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center py-20 text-center px-8">
                <div className="w-20 h-20 bg-[#F4F3EF] rounded-full flex items-center justify-center mb-6 text-[#1B4DA0]">
                  <FiDatabase size={32} />
                </div>
                <h3 className="text-xl font-bold text-[#1A1A2E] mb-2">No leads found</h3>
                <p className="text-[#6B6B7E] max-w-xs mx-auto mb-8">
                  {searchQuery ? `No leads match your search "${searchQuery}"` : "We couldn't find any leads."}
                </p>
                <button 
                  onClick={fetchLeads}
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
                            selectedIds.length === filteredLeads.length && filteredLeads.length > 0
                              ? 'bg-[#1B4DA0] border-[#1B4DA0] text-white shadow-lg' 
                              : 'bg-white border-[#E2E8F0] hover:border-gray-400'
                          }`}
                          onClick={() => {
                            if (selectedIds.length === filteredLeads.length) {
                              setSelectedIds([]);
                            } else {
                              setSelectedIds(filteredLeads.map(c => c.id));
                            }
                          }}
                        >
                          {selectedIds.length === filteredLeads.length && filteredLeads.length > 0 && <FiCheck size={14} strokeWidth={4} />}
                        </div>
                      </th>
                    )}
                    <th className="px-8 py-4 text-[11px] font-bold text-[#94a3b8] uppercase tracking-widest text-left">Company Name</th>
                    <th className="px-8 py-4 text-[11px] font-bold text-[#94a3b8] uppercase tracking-widest text-left">Owner Name</th>
                    <th className="px-8 py-4 text-[11px] font-bold text-[#94a3b8] uppercase tracking-widest text-center">Strength of Employees</th>
                    <th className="px-8 py-4 text-[11px] font-bold text-[#94a3b8] uppercase tracking-widest text-center">Status</th>
                    <th className="px-8 py-4"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F4F3EF]">
                  {filteredLeads.map((lead) => {
                    const leadId = lead.id;
                    const isSelected = selectedIds.includes(leadId);
                    return (
                      <tr
                        key={leadId}
                        onClick={() => setSelectedLeadDetail(lead)}
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
                                  setSelectedIds(prev => prev.filter(id => id !== leadId));
                                } else {
                                  setSelectedIds(prev => [...prev, leadId]);
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
                              {(lead.companyName || 'C').substring(0, 2).toUpperCase()}
                            </div>
                            <p className="text-[14px] font-bold text-[#1A1A2E]">{lead.companyName}</p>
                          </div>
                        </td>
                        <td className="px-8 py-4 text-left">
                          <div className="flex items-center gap-2">
                             <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
                                <FiUser size={12} />
                             </div>
                             <p className="text-[13px] font-bold text-[#1A1A2E]">{lead.ownerName || 'N/A'}</p>
                          </div>
                        </td>
                        <td className="px-8 py-4 text-center">
                          <p className="text-[13px] font-bold text-[#6B6B7E] bg-slate-50 inline-flex px-3 py-1 rounded-lg border border-slate-100">{lead.strengthOfEmployees || 'N/A'}</p>
                        </td>
                        <td className="px-8 py-4 text-center">
                          <StatusDropdown 
                            clientId={leadId}
                            active={!['inactive', 'lost'].includes((lead.status || 'Active').toLowerCase().trim())} 
                            onChange={(val) => handleToggleStatus(lead, val)}
                            disabled={readOnly}
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
              {(() => {
                const selectedLeadsData = leads.filter(c => selectedIds.includes(c.id));
                const allSelectedActive = selectedLeadsData.length > 0 && selectedLeadsData.every(c => !['inactive', 'lost'].includes((c.status || 'Active').toLowerCase().trim()));
                const allSelectedInactive = selectedLeadsData.length > 0 && selectedLeadsData.every(c => ['inactive', 'lost'].includes((c.status || 'Active').toLowerCase().trim()));
                
                return (
                  <>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-blue-500 text-white rounded-xl flex items-center justify-center font-black text-sm">
                  {selectedIds.length}
                </div>
                <div>
                  <p className="text-xs font-black uppercase tracking-widest">Leads Selected</p>
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
                {(!allSelectedActive || allSelectedInactive) && (
                  <button
                    onClick={() => handleBulkStatusUpdate('Active')}
                    className="flex items-center gap-2 group px-4 py-2 rounded-2xl transition-all hover:bg-white/5 active:scale-95"
                  >
                    <FiCheckCircle size={16} className="text-emerald-400 group-hover:text-white" />
                    <span className="text-[11px] font-bold uppercase tracking-widest">Mark Active</span>
                  </button>
                )}

                {(!allSelectedInactive || allSelectedActive) && (
                  <button
                    onClick={() => handleBulkStatusUpdate('Inactive')}
                    className="flex items-center gap-2 group px-4 py-2 rounded-2xl transition-all hover:bg-white/5 active:scale-95"
                  >
                    <FiX size={16} className="text-amber-400 group-hover:text-white" />
                    <span className="text-[11px] font-bold uppercase tracking-widest">Mark Inactive</span>
                  </button>
                )}

                <button
                  onClick={() => setIsBulkDeleteModalOpen(true)}
                  className="flex items-center gap-2 group px-4 py-2 rounded-2xl transition-all hover:bg-white/5 active:scale-95"
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
              </>
                );
              })()}
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}

      {/* Side Detail Drawer */}
      {createPortal(
        <AnimatePresence>
          {selectedLeadDetail && (
            <React.Fragment>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-[#1A1A2E]/40 backdrop-blur-md z-[200000]"
                onClick={() => setSelectedLeadDetail(null)}
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
                  <h3 className="text-xl font-bold text-[#1A1A2E] font-syne">Lead Details</h3>
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
                          onClick={handleSaveLeadDetails}
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
                                const lead = selectedLeadDetail;
                                const standardSources = ['LinkedIn', 'Referral', 'Cold Email', 'Website', 'Direct Walk-in'];
                                const isOtherSource = lead.source && lead.source !== 'N/A' && !standardSources.includes(lead.source);
                                
                                const standardReasons = ['Recruitment', 'Operation', 'Recruitment + Operation', 'HR Services'];
                                const isOtherReason = lead.reason && lead.reason !== 'N/A' && !standardReasons.includes(lead.reason);

                                setEditableLead({
                                  ...lead,
                                  sourceDropdown: isOtherSource ? 'Other' : (lead.source && lead.source !== 'N/A' ? lead.source : ''),
                                  customSource: isOtherSource ? lead.source : '',
                                  reasonDropdown: isOtherReason ? 'Other' : (lead.reason && lead.reason !== 'N/A' ? lead.reason : ''),
                                  customReason: isOtherReason ? lead.reason : ''
                                });
                                setIsEditingInDetail(true);
                              }}
                              className="w-10 h-10 rounded-2xl flex items-center justify-center text-[#9B9BAD] hover:text-[#1B4DA0] hover:bg-blue-50 transition-all duration-300"
                              title="Edit Lead"
                            >
                              <FiEdit2 size={18} />
                            </button>
                            <button 
                              onClick={() => {
                                setLeadToDelete(selectedLeadDetail);
                                setIsDeleteModalOpen(true);
                              }}
                              className="w-10 h-10 rounded-2xl flex items-center justify-center text-[#9B9BAD] hover:text-red-500 hover:bg-red-50 transition-all duration-300"
                              title="Delete Lead"
                            >
                              <FiTrash size={18} />
                            </button>
                          </>
                        )}
                        <button onClick={() => setSelectedLeadDetail(null)} className="w-10 h-10 rounded-2xl flex items-center justify-center text-[#9B9BAD] hover:text-red-500 hover:bg-red-50 transition-all duration-300">
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
                        <span>{(selectedLeadDetail.companyName || 'C').substring(0, 2).toUpperCase()}</span>
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
                          value={editableLead?.companyName || ''}
                          onChange={(e) => setEditableLead({ ...editableLead, companyName: e.target.value })}
                        />
                      ) : (
                        <h4 className="text-2xl font-bold text-[#1A1A2E] tracking-tight font-syne">{selectedLeadDetail.companyName}</h4>
                      )}
                    </div>
                  </div>

                  {/* Information Grid */}
                  <div className="bg-[#FAFAF8] rounded-[32px] border border-[#F4F3EF] p-8 space-y-8 shadow-sm">
                    
                    {/* Basic Info */}
                    <div className="space-y-6">
                      <div className="flex items-center gap-3 border-b border-[#F4F3EF] pb-4">
                        <FiActivity className="text-[#1B4DA0]" size={18} />
                        <h5 className="text-[12px] font-black text-[#1A1A2E] uppercase tracking-wider">Lead Information</h5>
                      </div>
                      <div className="grid grid-cols-2 gap-x-4 gap-y-6">
                        <InfoItem 
                          label="Company Name" 
                          value={isEditingInDetail ? editableLead?.companyName : selectedLeadDetail.companyName} 
                          isEditing={isEditingInDetail}
                          fullWidth
                          onChange={(val) => setEditableLead({ ...editableLead, companyName: val })}
                        />
                        <InfoItem 
                          label="Owner Name" 
                          value={isEditingInDetail ? editableLead?.ownerName : selectedLeadDetail.ownerName} 
                          isEditing={isEditingInDetail}
                          onChange={(val) => setEditableLead({ ...editableLead, ownerName: val })}
                        />
                        <InfoItem 
                          label="SPOC Name" 
                          value={isEditingInDetail ? editableLead?.spocName : selectedLeadDetail.spocName} 
                          isEditing={isEditingInDetail}
                          onChange={(val) => setEditableLead({ ...editableLead, spocName: val })}
                        />
                        <InfoItem 
                          label="Email Address" 
                          value={isEditingInDetail ? editableLead?.email : selectedLeadDetail.email} 
                          isEditing={isEditingInDetail}
                          type="email"
                          fullWidth
                          onChange={(val) => setEditableLead({ ...editableLead, email: val })}
                        />
                        <InfoItem 
                          label="Phone Number" 
                          value={isEditingInDetail ? editableLead?.phone : selectedLeadDetail.phone} 
                          isEditing={isEditingInDetail}
                          type="tel"
                          onChange={(val) => {
                            const cleanVal = val.replace(/\D/g, '').slice(0, 10);
                            setEditableLead({ ...editableLead, phone: cleanVal });
                          }}
                        />
                        <InfoItem 
                          label="Industry" 
                          value={isEditingInDetail ? editableLead?.industry : selectedLeadDetail.industry} 
                          isEditing={isEditingInDetail}
                          onChange={(val) => setEditableLead({ ...editableLead, industry: val })}
                        />
                        <InfoItem 
                          label="Location" 
                          value={isEditingInDetail ? editableLead?.location : selectedLeadDetail.location} 
                          isEditing={isEditingInDetail}
                          fullWidth
                          onChange={(val) => setEditableLead({ ...editableLead, location: val })}
                        />
                        <InfoItem 
                          label="Strength of Employees" 
                          value={isEditingInDetail ? editableLead?.strengthOfEmployees : selectedLeadDetail.strengthOfEmployees} 
                          isEditing={isEditingInDetail}
                          type="number"
                          onChange={(val) => setEditableLead({ ...editableLead, strengthOfEmployees: val })}
                        />
                        {isEditingInDetail ? (
                          <div className="space-y-6 col-span-full grid grid-cols-1 md:grid-cols-2 gap-x-4">
                            <div className="space-y-1.5">
                              <label className="text-[10px] font-bold text-[#9B9BAD] uppercase tracking-[2px]">Lead Source</label>
                              <div className="bg-white px-4 py-3 rounded-xl border border-[#F4F3EF]">
                                <select
                                  value={editableLead?.sourceDropdown || ''}
                                  onChange={(e) => setEditableLead({ ...editableLead, sourceDropdown: e.target.value })}
                                  className="w-full text-sm font-bold text-[#1A1A2E] bg-transparent border-none focus:outline-none cursor-pointer"
                                >
                                  <option value="" disabled>Select Lead Source</option>
                                  {['LinkedIn', 'Referral', 'Cold Email', 'Website', 'Direct Walk-in', 'Other'].map((opt, idx) => (
                                    <option key={idx} value={opt}>{opt}</option>
                                  ))}
                                </select>
                              </div>
                            </div>
                            <div className="space-y-1.5">
                              <label className="text-[10px] font-bold text-[#9B9BAD] uppercase tracking-[2px]">Reason for Lead</label>
                              <div className="bg-white px-4 py-3 rounded-xl border border-[#F4F3EF]">
                                <select
                                  value={editableLead?.reasonDropdown || ''}
                                  onChange={(e) => setEditableLead({ ...editableLead, reasonDropdown: e.target.value })}
                                  className="w-full text-sm font-bold text-[#1A1A2E] bg-transparent border-none focus:outline-none cursor-pointer"
                                >
                                  <option value="" disabled>Select Reason for Lead</option>
                                  {['Recruitment', 'Operation', 'Recruitment + Operation', 'HR Services', 'Other'].map((opt, idx) => (
                                    <option key={idx} value={opt}>{opt}</option>
                                  ))}
                                </select>
                              </div>
                            </div>
                            {editableLead?.sourceDropdown === 'Other' && (
                              <div className="space-y-1.5 mt-2">
                                <label className="text-[10px] font-bold text-[#9B9BAD] uppercase tracking-[2px]">Custom Lead Source</label>
                                <div className="bg-white px-4 py-3 rounded-xl border border-[#F4F3EF]">
                                  <input
                                    type="text"
                                    value={editableLead?.customSource || ''}
                                    onChange={(e) => setEditableLead({ ...editableLead, customSource: e.target.value })}
                                    className="w-full text-sm font-bold text-[#1A1A2E] bg-transparent border-none focus:outline-none"
                                    placeholder="Enter custom source"
                                  />
                                </div>
                              </div>
                            )}
                            {editableLead?.reasonDropdown === 'Other' && (
                              <div className="space-y-1.5 mt-2">
                                <label className="text-[10px] font-bold text-[#9B9BAD] uppercase tracking-[2px]">Custom Reason for Lead</label>
                                <div className="bg-white px-4 py-3 rounded-xl border border-[#F4F3EF]">
                                  <input
                                    type="text"
                                    value={editableLead?.customReason || ''}
                                    onChange={(e) => setEditableLead({ ...editableLead, customReason: e.target.value })}
                                    className="w-full text-sm font-bold text-[#1A1A2E] bg-transparent border-none focus:outline-none"
                                    placeholder="Enter custom reason"
                                  />
                                </div>
                              </div>
                            )}
                          </div>
                        ) : (
                          <>
                            <InfoItem 
                              label="Lead Source" 
                              value={selectedLeadDetail.source} 
                              isEditing={false}
                            />
                            <InfoItem 
                              label="Reason for Lead" 
                              value={selectedLeadDetail.reason} 
                              isEditing={false}
                            />
                          </>
                        )}
                        <InfoItem 
                          label="Primary Requirement / Notes" 
                          value={isEditingInDetail ? editableLead?.notes : selectedLeadDetail.notes} 
                          isEditing={isEditingInDetail}
                          fullWidth
                          onChange={(val) => setEditableLead({ ...editableLead, notes: val })}
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

      {/* Add Lead Modal */}
      <LeadOnboardingForm 
        isOpen={isOnboardModalOpen} 
        initialData={leadToEdit}
        onClose={() => {
          setIsOnboardModalOpen(false);
          setLeadToEdit(null);
        }}
        onComplete={(newLead) => {
          setLeads(prev => [newLead, ...prev]);
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
                  <h3 className="text-2xl font-bold text-[#1A1A2E] mb-2 font-syne">Delete Lead?</h3>
                  <p className="text-sm text-[#6B6B7E] mb-8 leading-relaxed">
                    Are you sure you want to delete <span className="font-bold text-[#1A1A2E]">{leadToDelete?.companyName}</span>? This action cannot be undone.
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
                  <h3 className="text-2xl font-bold text-[#1A1A2E] mb-2 font-syne">Delete {selectedIds.length} Leads?</h3>
                  <p className="text-sm text-[#6B6B7E] mb-8 leading-relaxed">
                    Are you sure you want to delete <span className="font-bold text-[#1A1A2E]">{selectedIds.length} selected leads</span>? This action cannot be undone.
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

export default LeadsTab;
