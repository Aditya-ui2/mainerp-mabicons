import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiSearch, FiPlus, FiChevronRight, FiChevronDown,
  FiActivity, FiTrash, FiX, FiCheckCircle, FiCheck,
  FiEdit2, FiRefreshCw, FiDatabase, FiCalendar, FiClock, FiVideo, FiAlignLeft
} from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import MeetingOnboardingForm from './MeetingOnboardingForm';
import { getAllMeetings, updateMeetingStatus, deleteMeeting } from '../../../service/api';

const InfoItem = ({ label, value, subValue, fullWidth = false, isEditing, onChange, type = "text", isLink = false }) => (
  <div className={`space-y-1.5 ${fullWidth ? 'col-span-full' : ''}`}>
    <label className="text-[10px] font-bold text-[#9B9BAD] uppercase tracking-[2px]">{label}</label>
    <div className="bg-white px-4 py-3 rounded-xl border border-[#F4F3EF] overflow-hidden">
      {isEditing ? (
        <input
          type={type}
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          className="w-full text-sm font-bold text-[#1A1A2E] bg-transparent border-none focus:outline-none"
        />
      ) : (
        <>
          {isLink && value ? (
            <a href={value} target="_blank" rel="noreferrer" className="text-sm font-bold text-[#1B4DA0] hover:underline truncate block">{value}</a>
          ) : (
            <p className="text-sm font-bold text-[#1A1A2E] truncate block">{value || 'N/A'}</p>
          )}
          {subValue && <p className="text-[10px] font-medium text-[#6B6B7E] mt-0.5">{subValue}</p>}
        </>
      )}
    </div>
  </div>
);

const StatusBadge = ({ status }) => {
  let bg = 'bg-slate-100', text = 'text-slate-600', dot = 'bg-slate-400';
  if (status === 'Scheduled') { bg = 'bg-blue-50'; text = 'text-blue-600'; dot = 'bg-blue-500'; }
  else if (status === 'Completed') { bg = 'bg-emerald-50'; text = 'text-emerald-600'; dot = 'bg-emerald-500'; }
  else if (status === 'Cancelled') { bg = 'bg-red-50'; text = 'text-red-600'; dot = 'bg-red-500'; }

  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-[11px] uppercase tracking-widest font-black ${bg} ${text}`}>
      <div className={`w-1.5 h-1.5 rounded-full ${dot} ${status === 'Scheduled' ? 'animate-pulse' : ''}`} />
      <span>{status}</span>
    </div>
  );
};

const StatusDropdown = ({ currentStatus, onChange, meetingId, disabled = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  
  let bg = 'bg-slate-100', text = 'text-slate-600', dot = 'bg-slate-400';
  if (currentStatus === 'Scheduled') { bg = 'bg-blue-50'; text = 'text-blue-600'; dot = 'bg-blue-500'; }
  else if (currentStatus === 'Completed') { bg = 'bg-emerald-50'; text = 'text-emerald-600'; dot = 'bg-emerald-500'; }
  else if (currentStatus === 'Cancelled') { bg = 'bg-red-50'; text = 'text-red-600'; dot = 'bg-red-500'; }

  return (
    <div className="relative inline-block" onClick={e => e.stopPropagation()}>
      <button
        id={`status-btn-meet-${meetingId}`}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={`flex items-center justify-between gap-2 px-3 py-2 rounded-xl text-[11px] uppercase tracking-widest font-black transition-all w-[130px] ${bg} ${text} hover:opacity-80`}
      >
        <div className="flex items-center gap-2">
          <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${dot} ${currentStatus === 'Scheduled' ? 'animate-pulse' : ''}`} />
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
              const btn = document.getElementById(`status-btn-meet-${meetingId}`);
              if (!btn) return { top: 0, left: 0 };
              const rect = btn.getBoundingClientRect();
              const spaceBelow = window.innerHeight - rect.bottom;
              if (spaceBelow < 120) {
                return { bottom: window.innerHeight - rect.top + 6, left: rect.left };
              }
              return { top: rect.bottom + 6, left: rect.left };
            })()}
          >
            {['Scheduled', 'Completed', 'Cancelled'].map(status => (
              <button
                key={status}
                onClick={() => { onChange(status); setIsOpen(false); }}
                className={`w-full text-left px-4 py-3 text-[11px] font-black uppercase tracking-widest flex items-center gap-2 transition-all hover:bg-slate-50 text-slate-600 ${currentStatus === status ? 'bg-slate-50 text-blue-600' : ''}`}
              >
                <div className={`w-1.5 h-1.5 rounded-full ${status === 'Scheduled' ? 'bg-blue-500' : status === 'Completed' ? 'bg-emerald-500' : 'bg-red-500'}`} />
                {status}
              </button>
            ))}
          </div>
        </>,
        document.body
      )}
    </div>
  );
};

const MeetingsTab = ({ notificationBell, readOnly = false }) => {
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [selectedMeetingDetail, setSelectedMeetingDetail] = useState(null);
  const [isOnboardModalOpen, setIsOnboardModalOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [meetingToDelete, setMeetingToDelete] = useState(null);
  const [isEditingInDetail, setIsEditingInDetail] = useState(false);
  const [isSavingDetail, setIsSavingDetail] = useState(false);
  const [editableMeeting, setEditableMeeting] = useState(null);
  const [meetingToEdit, setMeetingToEdit] = useState(null);

  const fetchMeetings = async () => {
    setLoading(true);
    try {
      const res = await getAllMeetings();
      if (res && res.success && res.data) {
        const mapped = res.data.map(meet => {
          const isUrl = meet.platform && meet.platform.startsWith('http');
          return {
            id: meet.id,
            subject: meet.title || 'Client Meeting',
            clientName: meet.companyName || 'Unknown Client',
            date: meet.meetingDate,
            time: meet.meetingTime,
            platform: isUrl ? 'Google Meet' : (meet.platform || 'Google Meet'),
            meetingLink: isUrl ? meet.platform : '',
            status: meet.status || 'Scheduled'
          };
        });
        setMeetings(mapped);
      }
    } catch (err) {
      console.error('Error fetching meetings:', err);
      toast.error('Failed to fetch meetings from database');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMeetings();
  }, []);

  const handleSaveMeetingDetails = async () => {
    setIsSavingDetail(true);
    try {
      const meetingId = selectedMeetingDetail.id;
      await updateMeetingStatus(meetingId, editableMeeting.status);
      
      const updatedMeeting = { ...selectedMeetingDetail, ...editableMeeting };
      setSelectedMeetingDetail(updatedMeeting);
      setMeetings(prev => prev.map(c => 
        (c.id === meetingId) ? updatedMeeting : c
      ));
      
      setIsEditingInDetail(false);
      toast.success('Meeting status updated successfully');
    } catch (error) {
      console.error('Update error:', error);
      toast.error('Failed to update meeting details');
    } finally {
      setIsSavingDetail(false);
    }
  };

  const handleToggleStatus = async (meeting, newStatus) => {
    const meetingId = meeting.id;
    try {
      await updateMeetingStatus(meetingId, newStatus);
      setMeetings(prev => prev.map(c => 
        (c.id === meetingId) ? { ...c, status: newStatus } : c
      ));

      if (selectedMeetingDetail && selectedMeetingDetail.id === meetingId) {
        setSelectedMeetingDetail(prev => ({ ...prev, status: newStatus }));
      }

      toast.success(`${meeting.subject} is now ${newStatus}`);
    } catch (e) {
      toast.error('Failed to toggle meeting status');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!meetingToDelete) return;
    try {
      setLoading(true);
      await deleteMeeting(meetingToDelete.id);
      
      setMeetings(prev => prev.filter(c => c.id !== meetingToDelete.id));
      toast.success('Meeting deleted successfully');
      
      setIsDeleteModalOpen(false);
      setMeetingToDelete(null);
      setSelectedMeetingDetail(null);
    } catch (err) {
      toast.error('Failed to delete meeting');
    } finally {
      setLoading(false);
    }
  };

  const handleBulkStatusUpdate = async (status) => {
    const loadingToast = toast.loading(`Updating ${selectedIds.length} meetings...`);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      setMeetings(prev => prev.map(c => {
        return selectedIds.includes(c.id) ? { ...c, status } : c;
      }));
      
      setSelectedIds([]);
      toast.success(`${selectedIds.length} meetings updated to ${status}`, { id: loadingToast });
    } catch (err) {
      toast.error('Failed to update some meetings', { id: loadingToast });
    }
  };

  const handleBulkDelete = async () => {
    const loadingToast = toast.loading(`Deleting ${selectedIds.length} meetings...`);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      setMeetings(prev => prev.filter(c => !selectedIds.includes(c.id)));
      
      setSelectedIds([]);
      toast.success(`${selectedIds.length} meetings removed`, { id: loadingToast });
    } catch (err) {
      toast.error('Failed to delete some meetings', { id: loadingToast });
    }
  };

  const filteredMeetings = meetings.filter(c => {
    const matchesSearch = (c.subject || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.clientName || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = selectedStatus === 'ALL' || (c.status || 'Scheduled').toUpperCase() === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <>
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8 animate-in fade-in duration-500 text-left">
        <div className="flex items-center justify-between mb-8 text-left">
          <div className="flex flex-col text-left">
            <h1 className="text-3xl font-bold text-[#1A1A2E] tracking-tight font-syne">
              Meetings
            </h1>
          </div>
          <div className="flex items-center gap-3">
            {notificationBell}
            {!readOnly && (
              <button
                onClick={() => setIsOnboardModalOpen(true)}
                className="w-full sm:w-auto flex items-center justify-center px-6 py-3 rounded-2xl bg-[#1B4DA0] hover:bg-[#153D80] text-white transition-all duration-300 shadow-xl shadow-blue-500/20 active:scale-95 group"
              >
                <FiPlus className="mr-2 text-lg transition-transform" />
                <span className="font-bold uppercase tracking-widest text-[11px]">Generate Meeting</span>
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
              placeholder="Search meetings by subject or client..."
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
              <option value="SCHEDULED">SCHEDULED</option>
              <option value="COMPLETED">COMPLETED</option>
              <option value="CANCELLED">CANCELLED</option>
            </select>
            <FiChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#1B4DA0] opacity-50 group-hover:opacity-100 transition-all pointer-events-none" />
          </div>
        </div>

        <div className="bg-white rounded-[32px] shadow-sm border border-[#F4F3EF] overflow-hidden">
          <div className="overflow-x-auto min-h-[400px] flex flex-col">
            {loading ? (
              <div className="flex-1 flex flex-col items-center justify-center py-20">
                <div className="w-12 h-12 border-4 border-[#1B4DA0] border-t-transparent rounded-full animate-spin mb-4" />
                <p className="text-[#6B6B7E] font-medium">Loading meetings...</p>
              </div>
            ) : filteredMeetings.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center py-20 text-center px-8">
                <div className="w-20 h-20 bg-[#F4F3EF] rounded-full flex items-center justify-center mb-6 text-[#1B4DA0]">
                  <FiDatabase size={32} />
                </div>
                <h3 className="text-xl font-bold text-[#1A1A2E] mb-2">No meetings found</h3>
                <p className="text-[#6B6B7E] max-w-xs mx-auto mb-8">
                  {searchQuery ? `No meetings match your search "${searchQuery}"` : "You haven't generated any meetings yet."}
                </p>
                <button 
                  onClick={fetchMeetings}
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
                            selectedIds.length === filteredMeetings.length && filteredMeetings.length > 0
                              ? 'bg-[#1B4DA0] border-[#1B4DA0] text-white shadow-lg' 
                              : 'bg-white border-[#E2E8F0] hover:border-gray-400'
                          }`}
                          onClick={() => {
                            if (selectedIds.length === filteredMeetings.length) {
                              setSelectedIds([]);
                            } else {
                              setSelectedIds(filteredMeetings.map(c => c.id));
                            }
                          }}
                        >
                          {selectedIds.length === filteredMeetings.length && filteredMeetings.length > 0 && <FiCheck size={14} strokeWidth={4} />}
                        </div>
                      </th>
                    )}
                    <th className="px-8 py-4 text-[11px] font-bold text-[#94a3b8] uppercase tracking-widest text-center">Subject</th>
                    <th className="px-8 py-4 text-[11px] font-bold text-[#94a3b8] uppercase tracking-widest text-left">Client</th>
                    <th className="px-8 py-4 text-[11px] font-bold text-[#94a3b8] uppercase tracking-widest text-left">Schedule</th>
                    <th className="px-8 py-4 text-[11px] font-bold text-[#94a3b8] uppercase tracking-widest text-center">Platform</th>
                    <th className="px-8 py-4 text-[11px] font-bold text-[#94a3b8] uppercase tracking-widest text-center">Status</th>
                    <th className="px-8 py-4"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F4F3EF]">
                  {filteredMeetings.map((meeting) => {
                    const meetingId = meeting.id;
                    const isSelected = selectedIds.includes(meetingId);
                    return (
                      <tr
                        key={meetingId}
                        onClick={() => setSelectedMeetingDetail(meeting)}
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
                                  setSelectedIds(prev => prev.filter(id => id !== meetingId));
                                } else {
                                  setSelectedIds(prev => [...prev, meetingId]);
                                }
                              }}
                            >
                              {isSelected && <FiCheck size={14} strokeWidth={4} />}
                            </div>
                          </td>
                        )}
                        <td className="px-8 py-4">
                          <div className="flex items-center gap-4 justify-center">
                            <div className="w-10 h-10 rounded-xl bg-[#EEF2FB] text-[#1B4DA0] flex items-center justify-center flex-shrink-0">
                              <FiVideo size={18} />
                            </div>
                            <p className="text-[14px] font-bold text-[#1A1A2E] w-[180px] truncate text-left">{meeting.subject}</p>
                          </div>
                        </td>
                        <td className="px-8 py-4 text-left">
                           <p className="text-[13px] font-bold text-[#1A1A2E]">{meeting.clientName}</p>
                        </td>
                        <td className="px-8 py-4 text-left">
                          <div className="flex flex-col">
                            <span className="text-[13px] font-bold text-[#1A1A2E]">{meeting.date}</span>
                            <span className="text-[10px] font-medium text-[#6B6B7E]">{meeting.time}</span>
                          </div>
                        </td>
                        <td className="px-8 py-4 text-center">
                          <p className="text-[13px] font-bold text-[#6B6B7E] bg-slate-50 inline-flex px-3 py-1 rounded-lg border border-slate-100">{meeting.platform}</p>
                        </td>
                        <td className="px-8 py-4 text-center">
                          <StatusDropdown 
                            meetingId={meetingId}
                            currentStatus={meeting.status} 
                            onChange={(val) => handleToggleStatus(meeting, val)} 
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
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-blue-500 text-white rounded-xl flex items-center justify-center font-black text-sm">
                  {selectedIds.length}
                </div>
                <div>
                  <p className="text-xs font-black uppercase tracking-widest">Meetings Selected</p>
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
                  className="flex items-center gap-2 group px-4 py-2 rounded-2xl transition-all hover:bg-white/5 active:scale-95"
                >
                  <FiCheckCircle size={16} className="text-emerald-400 group-hover:text-white" />
                  <span className="text-[11px] font-bold uppercase tracking-widest">Mark Completed</span>
                </button>

                <button
                  onClick={() => handleBulkStatusUpdate('Cancelled')}
                  className="flex items-center gap-2 group px-4 py-2 rounded-2xl transition-all hover:bg-white/5 active:scale-95"
                >
                  <FiX size={16} className="text-red-400 group-hover:text-white" />
                  <span className="text-[11px] font-bold uppercase tracking-widest">Mark Cancelled</span>
                </button>

                <button
                  onClick={handleBulkDelete}
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
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}

      {/* Side Detail Drawer */}
      {createPortal(
        <AnimatePresence>
          {selectedMeetingDetail && (
            <React.Fragment>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-[#1A1A2E]/40 backdrop-blur-md z-[200000]"
                onClick={() => setSelectedMeetingDetail(null)}
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
                  <h3 className="text-xl font-bold text-[#1A1A2E] font-syne">Meeting Details</h3>
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
                          onClick={handleSaveMeetingDetails}
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
                                setEditableMeeting({ ...selectedMeetingDetail });
                                setIsEditingInDetail(true);
                              }} 
                              className="w-10 h-10 rounded-2xl flex items-center justify-center text-[#1B4DA0] bg-blue-50 hover:bg-[#1B4DA0] hover:text-white transition-all duration-300"
                              title="Edit Meeting"
                            >
                              <FiEdit2 size={16} />
                            </button>
                            <button 
                              onClick={() => {
                                setMeetingToDelete(selectedMeetingDetail);
                                setIsDeleteModalOpen(true);
                              }}
                              className="w-10 h-10 rounded-2xl flex items-center justify-center text-[#9B9BAD] hover:text-red-500 hover:bg-red-50 transition-all duration-300"
                              title="Delete Meeting"
                            >
                              <FiTrash size={18} />
                            </button>
                          </>
                        )}
                        <button onClick={() => setSelectedMeetingDetail(null)} className="w-10 h-10 rounded-2xl flex items-center justify-center text-[#9B9BAD] hover:text-red-500 hover:bg-red-50 transition-all duration-300">
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
                      <div className={`w-24 h-24 rounded-[32px] bg-[#1B4DA0] flex items-center justify-center text-white text-3xl shadow-xl shadow-blue-500/20 overflow-hidden ${isEditingInDetail ? 'cursor-pointer hover:scale-105 transition-all' : ''}`}
                           style={{ background: 'linear-gradient(135deg, #1B4DA0 0%, #0D47A1 100%)' }}>
                        <FiCalendar size={32} />
                      </div>
                    </div>
                    <div className="space-y-1.5 w-full flex flex-col items-center">
                      {isEditingInDetail ? (
                        <input
                          type="text"
                          className="w-full max-w-[320px] text-2xl font-bold text-[#1A1A2E] bg-[#FAFAF8] border-none rounded-2xl py-2 px-4 text-center focus:outline-none transition-all font-syne"
                          value={editableMeeting?.subject || ''}
                          onChange={(e) => setEditableMeeting({ ...editableMeeting, subject: e.target.value })}
                        />
                      ) : (
                        <h4 className="text-2xl font-bold text-[#1A1A2E] tracking-tight font-syne">{selectedMeetingDetail.subject}</h4>
                      )}
                      
                      {!isEditingInDetail && (
                        <div className="mt-2">
                           <StatusBadge status={selectedMeetingDetail.status} />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Information Grid */}
                  <div className="bg-[#FAFAF8] rounded-[32px] border border-[#F4F3EF] p-8 space-y-8 shadow-sm">
                    
                    {/* Basic Info */}
                    <div className="space-y-6">
                      <div className="flex items-center gap-3 border-b border-[#F4F3EF] pb-4">
                        <FiActivity className="text-[#1B4DA0]" size={18} />
                        <h5 className="text-[12px] font-black text-[#1A1A2E] uppercase tracking-wider">Meeting Information</h5>
                      </div>
                      <div className="grid grid-cols-1 gap-y-6">
                        <InfoItem 
                          label="Subject" 
                          value={isEditingInDetail ? editableMeeting?.subject : selectedMeetingDetail.subject} 
                          isEditing={isEditingInDetail}
                          fullWidth
                          onChange={(val) => setEditableMeeting({ ...editableMeeting, subject: val })}
                        />
                        <InfoItem 
                          label="Client / Lead Name" 
                          value={isEditingInDetail ? editableMeeting?.clientName : selectedMeetingDetail.clientName} 
                          isEditing={isEditingInDetail}
                          fullWidth
                          onChange={(val) => setEditableMeeting({ ...editableMeeting, clientName: val })}
                        />
                        <div className="grid grid-cols-2 gap-4">
                          <InfoItem 
                            label="Date" 
                            type="date"
                            value={isEditingInDetail ? editableMeeting?.date : selectedMeetingDetail.date} 
                            isEditing={isEditingInDetail}
                            onChange={(val) => setEditableMeeting({ ...editableMeeting, date: val })}
                          />
                          <InfoItem 
                            label="Time" 
                            type="time"
                            value={isEditingInDetail ? editableMeeting?.time : selectedMeetingDetail.time} 
                            isEditing={isEditingInDetail}
                            onChange={(val) => setEditableMeeting({ ...editableMeeting, time: val })}
                          />
                        </div>
                        <InfoItem 
                          label="Platform / Location" 
                          value={isEditingInDetail ? editableMeeting?.platform : selectedMeetingDetail.platform} 
                          isEditing={isEditingInDetail}
                          fullWidth
                          onChange={(val) => setEditableMeeting({ ...editableMeeting, platform: val })}
                        />
                        <InfoItem 
                          label="Meeting Link" 
                          value={isEditingInDetail ? editableMeeting?.meetingLink : selectedMeetingDetail.meetingLink} 
                          isEditing={isEditingInDetail}
                          isLink={true}
                          fullWidth
                          onChange={(val) => setEditableMeeting({ ...editableMeeting, meetingLink: val })}
                        />
                      </div>
                    </div>
                  </div>

                  {selectedMeetingDetail.meetingLink && (
                    <div className="pt-4">
                      <a
                        href={selectedMeetingDetail.meetingLink}
                        target="_blank"
                        rel="noreferrer"
                        className="w-full py-4 bg-[#1B4DA0] text-white font-black text-[11px] uppercase tracking-[3px] rounded-2xl shadow-xl shadow-blue-500/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2"
                      >
                        <FiVideo size={16} /> Join Meeting
                      </a>
                    </div>
                  )}

                </div>
              </motion.div>
            </React.Fragment>
          )}
        </AnimatePresence>,
        document.body
      )}

      {/* Add Meeting Modal */}
      <MeetingOnboardingForm 
        isOpen={isOnboardModalOpen} 
        initialData={meetingToEdit}
        onClose={() => {
          setIsOnboardModalOpen(false);
          setMeetingToEdit(null);
        }}
        onComplete={(newMeeting) => {
          const isUrl = newMeeting.platform && newMeeting.platform.startsWith('http');
          const mapped = {
            id: newMeeting.id,
            subject: newMeeting.title || 'Client Meeting',
            clientName: newMeeting.companyName || 'Unknown Client',
            date: newMeeting.meetingDate,
            time: newMeeting.meetingTime,
            platform: isUrl ? 'Google Meet' : (newMeeting.platform || 'Google Meet'),
            meetingLink: isUrl ? newMeeting.platform : '',
            status: newMeeting.status || 'Scheduled'
          };
          setMeetings(prev => [mapped, ...prev]);
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
                  <h3 className="text-2xl font-bold text-[#1A1A2E] mb-2 font-syne">Delete Meeting?</h3>
                  <p className="text-sm text-[#6B6B7E] mb-8 leading-relaxed">
                    Are you sure you want to delete <span className="font-bold text-[#1A1A2E]">{meetingToDelete?.subject}</span>? This action cannot be undone.
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

export default MeetingsTab;
