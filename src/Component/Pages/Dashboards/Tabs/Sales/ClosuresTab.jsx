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
import { getAllLeads, updateLead, deleteLead } from '../../../service/api';
import ClosureOnboardingForm from './ClosureOnboardingForm';

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

const StatusDropdown = ({ inProgress, onChange, clientId, disabled = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  const currentStatus = inProgress ? 'In-Progress' : 'Closed';
  
  return (
    <div className="relative inline-block" onClick={e => e.stopPropagation()}>
      <button
        id={`status-btn-closure-${clientId}`}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={`flex items-center justify-between gap-2 px-3 py-2 rounded-xl text-[11px] uppercase tracking-widest font-black transition-all min-w-[110px] ${
          inProgress 
            ? 'bg-[#10B981]/10 text-[#10B981] hover:bg-[#10B981]/20 border border-[#10B981]/20' 
            : 'bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-200'
        }`}
      >
        <div className="flex items-center gap-2">
          <div className={`w-1.5 h-1.5 rounded-full ${inProgress ? 'bg-[#10B981] animate-pulse' : 'bg-slate-400'}`} />
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
              const btn = document.getElementById(`status-btn-closure-${clientId}`);
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
              className={`w-full text-left px-4 py-3 text-[11px] font-black uppercase tracking-widest flex items-center gap-2 transition-all hover:bg-[#10B981]/10 text-[#10B981] ${inProgress ? 'bg-[#10B981]/10' : 'hover:text-[#10B981] text-slate-600'}`}
            >
              <div className="w-1.5 h-1.5 rounded-full bg-[#10B981]" />
              In-Progress
            </button>
            <button
              onClick={() => { onChange(false); setIsOpen(false); }}
              className={`w-full text-left px-4 py-3 text-[11px] font-black uppercase tracking-widest flex items-center gap-2 transition-all hover:bg-slate-100 text-slate-600 ${!inProgress ? 'bg-slate-100' : 'hover:text-slate-600 text-slate-600'}`}
            >
              <div className="w-1.5 h-1.5 rounded-full bg-slate-400" />
              Closed
            </button>
          </div>
        </>,
        document.body
      )}
    </div>
  );
};

const ClosuresTab = ({ notificationBell, readOnly = false }) => {
  const [closures, setClosures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [selectedClosureDetail, setSelectedClosureDetail] = useState(null);
  const [isOnboardModalOpen, setIsOnboardModalOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [closureToDelete, setClosureToDelete] = useState(null);
  const [isEditingInDetail, setIsEditingInDetail] = useState(false);
  const [isSavingDetail, setIsSavingDetail] = useState(false);
  const [editableClosure, setEditableClosure] = useState(null);
  const [closureToEdit, setClosureToEdit] = useState(null);

  const fetchClosures = async () => {
    setLoading(true);
    try {
      const res = await getAllLeads();
      let leadsList = [];
      if (res) {
        if (Array.isArray(res.data?.leads)) {
          leadsList = res.data.leads;
        } else if (Array.isArray(res.data)) {
          leadsList = res.data;
        } else if (Array.isArray(res.leads)) {
          leadsList = res.leads;
        } else if (Array.isArray(res)) {
          leadsList = res;
        }
      }
      
      const closureLeads = leadsList.filter(l => l.status === 'Converted');
      const mappedClosures = closureLeads.map(l => ({
        id: l.id || l._id,
        clientName: l.companyName,
        date: l.lastContactDate ? new Date(l.lastContactDate).toISOString().split('T')[0] : new Date(l.createdAt || Date.now()).toISOString().split('T')[0],
        contactPerson: l.contactPerson || 'Pending',
        time: l.value ? `₹${l.value.toLocaleString()}` : '₹0',
        notes: l.notes || '',
        status: l.notes?.includes('[Status: Closed]') ? 'Closed' : 'In-Progress'
      }));
      
      setClosures(mappedClosures);
    } catch (err) {
      console.error('Error fetching closures:', err);
      toast.error('Failed to load closures from database');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClosures();
  }, []);

  const handleSaveClosureDetails = async () => {
    setIsSavingDetail(true);
    try {
      const closureId = selectedClosureDetail.id;
      const updatedClosure = { ...selectedClosureDetail, ...editableClosure };
      
      let rawAmount = 0;
      if (updatedClosure.time) {
        const cleaned = updatedClosure.time.toString().replace(/[^\d.]/g, '');
        rawAmount = parseFloat(cleaned) || 0;
      }
      
      const cleanNotes = (updatedClosure.notes || '').replace(/\[Status: [^\]]+\]/g, '').trim();
      const notesWithStatus = cleanNotes + (updatedClosure.status === 'Closed' ? ' [Status: Closed]' : ' [Status: In-Progress]');

      const leadData = {
        companyName: updatedClosure.clientName,
        lastContactDate: updatedClosure.date,
        contactPerson: updatedClosure.contactPerson, // Payment Status
        value: rawAmount,
        notes: notesWithStatus,
        status: 'Converted'
      };
      
      await updateLead(closureId, leadData);
      
      const newClosureObj = {
        ...updatedClosure,
        notes: notesWithStatus
      };
      
      setSelectedClosureDetail(newClosureObj);
      setClosures(prev => prev.map(c => 
        (c.id === closureId) ? newClosureObj : c
      ));
      
      setIsEditingInDetail(false);
      toast.success('Closure details updated successfully! ✨');
    } catch (error) {
      console.error('Update error:', error);
      toast.error('Failed to update closure details');
    } finally {
      setIsSavingDetail(false);
    }
  };

  const handleToggleStatus = async (closure, newStatus) => {
    const statusLabel = newStatus ? 'In-Progress' : 'Closed';
    const closureId = closure.id;
    
    try {
      let rawAmount = 0;
      if (closure.time) {
        const cleaned = closure.time.toString().replace(/[^\d.]/g, '');
        rawAmount = parseFloat(cleaned) || 0;
      }
      
      const cleanNotes = (closure.notes || '').replace(/\[Status: [^\]]+\]/g, '').trim();
      const notesWithStatus = cleanNotes + (statusLabel === 'Closed' ? ' [Status: Closed]' : ' [Status: In-Progress]');

      const leadData = {
        companyName: closure.clientName,
        lastContactDate: closure.date,
        contactPerson: closure.contactPerson, // Payment Status
        value: rawAmount,
        notes: notesWithStatus,
        status: 'Converted'
      };
      
      await updateLead(closureId, leadData);
      
      setClosures(prev => prev.map(c => 
        (c.id === closureId) ? { ...c, status: statusLabel, notes: notesWithStatus } : c
      ));

      if (selectedClosureDetail && selectedClosureDetail.id === closureId) {
        setSelectedClosureDetail(prev => ({ ...prev, status: statusLabel, notes: notesWithStatus }));
      }

      toast.success(`${closure.clientName} status updated to ${statusLabel}! ✨`);
    } catch (err) {
      console.error('Toggle status error:', err);
      toast.error('Failed to update status in database');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!closureToDelete) return;
    try {
      setLoading(true);
      await deleteLead(closureToDelete.id);
      
      setClosures(prev => prev.filter(c => c.id !== closureToDelete.id));
      toast.success('Closure deleted successfully! 🗑️');
      
      setIsDeleteModalOpen(false);
      setClosureToDelete(null);
      setSelectedClosureDetail(null);
    } catch (err) {
      console.error('Delete error:', err);
      toast.error('Failed to delete closure');
    } finally {
      setLoading(false);
    }
  };

  const handleBulkStatusUpdate = async (status) => {
    const loadingToast = toast.loading(`Updating ${selectedIds.length} closures...`);
    try {
      for (const id of selectedIds) {
        const closure = closures.find(c => c.id === id);
        if (!closure) continue;
        
        let rawAmount = 0;
        if (closure.time) {
          const cleaned = closure.time.toString().replace(/[^\d.]/g, '');
          rawAmount = parseFloat(cleaned) || 0;
        }
        
        const cleanNotes = (closure.notes || '').replace(/\[Status: [^\]]+\]/g, '').trim();
        const notesWithStatus = cleanNotes + (status === 'Closed' ? ' [Status: Closed]' : ' [Status: In-Progress]');

        const leadData = {
          companyName: closure.clientName,
          lastContactDate: closure.date,
          contactPerson: closure.contactPerson,
          value: rawAmount,
          notes: notesWithStatus,
          status: 'Converted'
        };
        await updateLead(id, leadData);
      }
      
      setClosures(prev => prev.map(c => {
        if (selectedIds.includes(c.id)) {
          const cleanNotes = (c.notes || '').replace(/\[Status: [^\]]+\]/g, '').trim();
          const notesWithStatus = cleanNotes + (status === 'Closed' ? ' [Status: Closed]' : ' [Status: In-Progress]');
          return { ...c, status, notes: notesWithStatus };
        }
        return c;
      }));
      
      setSelectedIds([]);
      toast.success(`${selectedIds.length} closures updated in database! ✨`, { id: loadingToast });
    } catch (err) {
      console.error('Bulk update error:', err);
      toast.error('Failed to update closures', { id: loadingToast });
    }
  };

  const handleBulkDelete = async () => {
    const loadingToast = toast.loading(`Deleting ${selectedIds.length} closures...`);
    try {
      for (const id of selectedIds) {
        await deleteLead(id);
      }
      setClosures(prev => prev.filter(c => !selectedIds.includes(c.id)));
      
      setSelectedIds([]);
      toast.success(`${selectedIds.length} closures deleted successfully! 🗑️`, { id: loadingToast });
    } catch (err) {
      console.error('Bulk delete error:', err);
      toast.error('Failed to delete closures', { id: loadingToast });
    }
  };

  const filteredClosures = closures.filter(c => {
    const matchesSearch = (c.clientName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.date || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = selectedStatus === 'ALL' || (c.status || 'In-Progress').toUpperCase() === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <>
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8 animate-in fade-in duration-500 text-left">
        <div className="flex items-center justify-between mb-8 text-left">
          <div className="flex flex-col text-left">
            <h1 className="text-3xl font-bold text-[#1A1A2E] tracking-tight font-syne">
              Closures
            </h1>
          </div>
          <div className="flex items-center gap-3">
            {notificationBell}
            {!readOnly && (
              <button
                onClick={() => setIsOnboardModalOpen(true)}
                className="w-full sm:w-auto flex items-center justify-center px-6 py-3 rounded-2xl bg-[#1B4DA0] hover:bg-[#153D80] text-white transition-all duration-300 shadow-xl shadow-blue-500/20 inProgress:scale-95 group"
              >
                <FiPlus className="mr-2 text-lg transition-transform" />
                <span className="font-bold uppercase tracking-widest text-[11px]">Add Closure</span>
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
              placeholder="Search closures by company or owner..."
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
              <option value="IN-PROGRESS">IN-PROGRESS</option>
              <option value="CLOSED">CLOSED</option>
            </select>
            <FiChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#1B4DA0] opacity-50 group-hover:opacity-100 transition-all pointer-events-none" />
          </div>
        </div>

        <div className="bg-white rounded-[32px] shadow-sm border border-[#F4F3EF] overflow-hidden">
          <div className="overflow-x-auto min-h-[400px] flex flex-col">
            {loading ? (
              <div className="flex-1 flex flex-col items-center justify-center py-20">
                <div className="w-12 h-12 border-4 border-[#1B4DA0] border-t-transparent rounded-full animate-spin mb-4" />
                <p className="text-[#6B6B7E] font-medium">Loading closures...</p>
              </div>
            ) : filteredClosures.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center py-20 text-center px-8">
                <div className="w-20 h-20 bg-[#F4F3EF] rounded-full flex items-center justify-center mb-6 text-[#1B4DA0]">
                  <FiDatabase size={32} />
                </div>
                <h3 className="text-xl font-bold text-[#1A1A2E] mb-2">No closures found</h3>
                <p className="text-[#6B6B7E] max-w-xs mx-auto mb-8">
                  {searchQuery ? `No closures match your search "${searchQuery}"` : "We couldn't find any closures."}
                </p>
                <button 
                  onClick={fetchClosures}
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
                            selectedIds.length === filteredClosures.length && filteredClosures.length > 0
                              ? 'bg-[#1B4DA0] border-[#1B4DA0] text-white shadow-lg' 
                              : 'bg-white border-[#E2E8F0] hover:border-gray-400'
                          }`}
                          onClick={() => {
                            if (selectedIds.length === filteredClosures.length) {
                              setSelectedIds([]);
                            } else {
                              setSelectedIds(filteredClosures.map(c => c.id));
                            }
                          }}
                        >
                          {selectedIds.length === filteredClosures.length && filteredClosures.length > 0 && <FiCheck size={14} strokeWidth={4} />}
                        </div>
                      </th>
                    )}
                    <th className="px-8 py-4 text-[11px] font-bold text-[#94a3b8] uppercase tracking-widest text-left">Client Name</th>
                    <th className="px-8 py-4 text-[11px] font-bold text-[#94a3b8] uppercase tracking-widest text-left">Agreement Signed Date</th>
                    <th className="px-8 py-4 text-[11px] font-bold text-[#94a3b8] uppercase tracking-widest text-left">Payment Amount</th>
                    <th className="px-8 py-4 text-[11px] font-bold text-[#94a3b8] uppercase tracking-widest text-left">Payment Status</th>
                    <th className="px-8 py-4"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F4F3EF]">
                  {filteredClosures.map((closure) => {
                    const closureId = closure.id;
                    const isSelected = selectedIds.includes(closureId);
                    return (
                      <tr
                        key={closureId}
                        onClick={() => setSelectedClosureDetail(closure)}
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
                                  setSelectedIds(prev => prev.filter(id => id !== closureId));
                                } else {
                                  setSelectedIds(prev => [...prev, closureId]);
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
                              {(closure.clientName || 'C').substring(0, 2).toUpperCase()}
                            </div>
                            <p className="text-[14px] font-bold text-[#1A1A2E]">{closure.clientName}</p>
                          </div>
                        </td>
                        <td className="px-8 py-4 text-left">
                          <div className="flex items-center gap-2">
                             <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
                                <FiUser size={12} />
                             </div>
                             <p className="text-[13px] font-bold text-[#1A1A2E]">{closure.date || 'N/A'}</p>
                          </div>
                        </td>
                        <td className="px-8 py-4 text-left">
                          <p className="text-[13px] font-bold text-[#1B4DA0] bg-blue-50/40 inline-flex px-3 py-1 rounded-lg border border-blue-100">{closure.time || '₹0'}</p>
                        </td>
                        <td className="px-8 py-4 text-left">
                          <p className="text-[13px] font-bold text-[#6B6B7E] bg-slate-50 inline-flex px-3 py-1 rounded-lg border border-slate-100">{closure.contactPerson || 'N/A'}</p>
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
                  <p className="text-xs font-black uppercase tracking-widest">Closures Selected</p>
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
                  onClick={() => handleBulkStatusUpdate('In-Progress')}
                  className="flex items-center gap-2 group px-4 py-2 rounded-2xl transition-all hover:bg-white/5 inProgress:scale-95"
                >
                  <FiCheckCircle size={16} className="text-emerald-400 group-hover:text-white" />
                  <span className="text-[11px] font-bold uppercase tracking-widest">Mark In-Progress</span>
                </button>

                <button
                  onClick={() => handleBulkStatusUpdate('Closed')}
                  className="flex items-center gap-2 group px-4 py-2 rounded-2xl transition-all hover:bg-white/5 inProgress:scale-95"
                >
                  <FiX size={16} className="text-amber-400 group-hover:text-white" />
                  <span className="text-[11px] font-bold uppercase tracking-widest">Mark Closed</span>
                </button>

                <button
                  onClick={handleBulkDelete}
                  className="flex items-center gap-2 group px-4 py-2 rounded-2xl transition-all hover:bg-white/5 inProgress:scale-95"
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
          {selectedClosureDetail && (
            <React.Fragment>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-[#1A1A2E]/40 backdrop-blur-md z-[200000]"
                onClick={() => setSelectedClosureDetail(null)}
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
                  <h3 className="text-xl font-bold text-[#1A1A2E] font-syne">Closure Details</h3>
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
                          onClick={handleSaveClosureDetails}
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
                                setEditableClosure(selectedClosureDetail);
                                setIsEditingInDetail(true);
                              }}
                              className="w-10 h-10 rounded-2xl flex items-center justify-center text-[#9B9BAD] hover:text-[#1B4DA0] hover:bg-blue-50 transition-all duration-300"
                              title="Edit Closure"
                            >
                              <FiEdit2 size={18} />
                            </button>
                            <button 
                              onClick={() => {
                                setClosureToDelete(selectedClosureDetail);
                                setIsDeleteModalOpen(true);
                              }}
                              className="w-10 h-10 rounded-2xl flex items-center justify-center text-[#9B9BAD] hover:text-red-500 hover:bg-red-50 transition-all duration-300"
                              title="Delete Closure"
                            >
                              <FiTrash size={18} />
                            </button>
                          </>
                        )}
                        <button onClick={() => setSelectedClosureDetail(null)} className="w-10 h-10 rounded-2xl flex items-center justify-center text-[#9B9BAD] hover:text-red-500 hover:bg-red-50 transition-all duration-300">
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
                        <span>{(selectedClosureDetail.clientName || 'C').substring(0, 2).toUpperCase()}</span>
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
                          value={editableClosure?.clientName || ''}
                          onChange={(e) => setEditableClosure({ ...editableClosure, clientName: e.target.value })}
                        />
                      ) : (
                        <h4 className="text-2xl font-bold text-[#1A1A2E] tracking-tight font-syne">{selectedClosureDetail.clientName}</h4>
                      )}
                    </div>
                  </div>

                  {/* Information Grid */}
                  <div className="bg-[#FAFAF8] rounded-[32px] border border-[#F4F3EF] p-8 space-y-8 shadow-sm">
                    
                    {/* Basic Info */}
                    <div className="space-y-6">
                      <div className="flex items-center gap-3 border-b border-[#F4F3EF] pb-4">
                        <FiActivity className="text-[#1B4DA0]" size={18} />
                        <h5 className="text-[12px] font-black text-[#1A1A2E] uppercase tracking-wider">Closure Information</h5>
                      </div>
                      <div className="grid grid-cols-1 gap-y-6">
                        <InfoItem 
                          label="Client Name" 
                          value={isEditingInDetail ? editableClosure?.clientName : selectedClosureDetail.clientName} 
                          isEditing={isEditingInDetail}
                          fullWidth
                          onChange={(val) => setEditableClosure({ ...editableClosure, clientName: val })}
                        />
                        <InfoItem 
                          label="Agreement Signed Date" 
                          value={isEditingInDetail ? editableClosure?.date : selectedClosureDetail.date} 
                          isEditing={isEditingInDetail}
                          fullWidth
                          onChange={(val) => setEditableClosure({ ...editableClosure, date: val })}
                        />
                        <InfoItem 
                          label="Payment Amount" 
                          value={isEditingInDetail ? editableClosure?.time : selectedClosureDetail.time} 
                          isEditing={isEditingInDetail}
                          fullWidth
                          onChange={(val) => setEditableClosure({ ...editableClosure, time: val })}
                        />
                        <InfoItem 
                          label="Payment Status" 
                          value={isEditingInDetail ? editableClosure?.contactPerson : selectedClosureDetail.contactPerson} 
                          isEditing={isEditingInDetail}
                          type="text"
                          fullWidth
                          onChange={(val) => setEditableClosure({ ...editableClosure, contactPerson: val })}
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

      {/* Add Closure Modal */}
      <ClosureOnboardingForm 
        isOpen={isOnboardModalOpen} 
        initialData={closureToEdit}
        onClose={() => {
          setIsOnboardModalOpen(false);
          setClosureToEdit(null);
        }}
        onComplete={(newClosure) => {
          setClosures(prev => [newClosure, ...prev]);
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
                  <h3 className="text-2xl font-bold text-[#1A1A2E] mb-2 font-syne">Delete Closure?</h3>
                  <p className="text-sm text-[#6B6B7E] mb-8 leading-relaxed">
                    Are you sure you want to delete <span className="font-bold text-[#1A1A2E]">{closureToDelete?.clientName}</span>? This action cannot be undone.
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
    </>
  );
};

export default ClosuresTab;
