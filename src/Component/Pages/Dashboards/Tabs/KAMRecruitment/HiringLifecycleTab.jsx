import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  FiSearch,
  FiFilter,
  FiPhone,
  FiMail,
  FiCheckCircle,
  FiClock,
  FiAlertCircle,
  FiCalendar,
  FiUser,
  FiChevronRight,
  FiChevronDown,
  FiX,
  FiPlus,
  FiUserPlus,
  FiBriefcase,
  FiMapPin
} from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { getAllCandidates, getSharePointCandidates, addCandidate, getAllRecruitmentPositions, getRecruitmentClients, getSharePointClients, getAllClients, updateCandidate } from '../../../service/api';
import { format } from 'date-fns';

// Modal for adding a joined candidate
const AddCandidateModal = ({ isOpen, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    clientId: '',
    positionId: '',
    joiningDate: format(new Date(), 'yyyy-MM-dd'),
    offeredCTC: '',
    location: '',
    experience: ''
  });

  const [clients, setClients] = useState([]);
  const [allPositions, setAllPositions] = useState([]);
  const [filteredPositions, setFilteredPositions] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchData();
    }
  }, [isOpen]);

  const fetchData = async () => {
    try {
      // Individually catch each request to prevent one failure from blocking everything
      const [allClientsRes, recClientsRes, positionsRes, spClientsRes] = await Promise.all([
        getAllClients({ service: 'recruitment' }).catch(err => { console.error("getAllClients failed:", err); return { success: false }; }),
        getRecruitmentClients().catch(err => { console.error("getRecruitmentClients failed:", err); return { success: false }; }),
        getAllRecruitmentPositions().catch(err => { console.error("getAllRecruitmentPositions failed:", err); return { success: false }; }),
        getSharePointClients().catch(err => { console.error("getSharePointClients failed:", err); return { success: true, data: [] }; })
      ]);

      // 1. Process ERP Clients (Combine from both endpoints for maximum coverage)
      let erpClients = [];
      const extractClients = (res) => {
        if (!res || !res.success) return [];
        const data = res.data?.clients || res.clients || res.data || [];
        return Array.isArray(data) ? data : [];
      };

      const clientsA = extractClients(allClientsRes);
      const clientsB = extractClients(recClientsRes);

      // Combine and filter duplicates by ID
      const combinedErp = [...clientsA];
      clientsB.forEach(cb => {
        if (!combinedErp.some(ca => ca.id === cb.id)) {
          combinedErp.push(cb);
        }
      });

      // 2. Process SharePoint Clients
      let spClients = [];
      if (spClientsRes && spClientsRes.data) {
        spClients = Array.isArray(spClientsRes.data) ? spClientsRes.data : [];
      }

      // 3. Final Client Merge (ERP takes priority)
      const finalClients = [...combinedErp];
      spClients.forEach(spc => {
        const name = (spc.companyName || spc.name || '').toLowerCase();
        const exists = finalClients.some(ec =>
          (ec.companyName || ec.name || '').toLowerCase() === name
        );
        if (!exists && name) {
          finalClients.push({
            ...spc,
            id: spc.id || spc.sharePointId || spc.name, // Ensure we have an ID for the value attribute
            isSharePoint: true
          });
        }
      });

      setClients(finalClients.sort((a, b) => (a.companyName || a.name || '').localeCompare(b.companyName || b.name || '')));

      // 4. Process Positions
      if (positionsRes && positionsRes.success) {
        const posData = positionsRes.data?.positions || positionsRes.data || [];
        setAllPositions(Array.isArray(posData) ? posData : []);
      }
    } catch (err) {
      console.error("Critical error in fetchData:", err);
      toast.error("Failed to load data from server");
    }
  };

  useEffect(() => {
    if (formData.clientId) {
      const selectedId = String(formData.clientId);
      const filtered = allPositions.filter(p =>
        String(p.clientId) === selectedId ||
        (p.client?.id && String(p.client.id) === selectedId)
      );
      setFilteredPositions(filtered);
    } else {
      setFilteredPositions([]);
    }
  }, [formData.clientId, allPositions]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.clientId || !formData.positionId || !formData.joiningDate) {
      toast.error("Please fill all required fields");
      return;
    }

    try {
      setIsSubmitting(true);
      const formatVal = (val, type) => {
        if (!val) return '';
        const trimmed = String(val).trim();
        if (!trimmed) return '';
        if (!isNaN(Number(trimmed))) {
          if (type === 'salary') return `${trimmed} LPA`;
          if (type === 'experience') return `${trimmed} ${parseFloat(trimmed) === 1 ? 'Year' : 'Years'}`;
        }
        return trimmed;
      };

      const res = await addCandidate({
        ...formData,
        offeredCTC: formatVal(formData.offeredCTC, 'salary'),
        experience: formatVal(formData.experience, 'experience'),
        stage: 'Joined',
        status: 'Selected'
      });
      if (res.success) {
        toast.success("Joined candidate added successfully");
        onSuccess();
        onClose();
        setFormData({
          name: '',
          email: '',
          phone: '',
          clientId: '',
          positionId: '',
          joiningDate: format(new Date(), 'yyyy-MM-dd'),
          offeredCTC: '',
          location: '',
          experience: ''
        });
      }
    } catch (err) {
      console.error("Error adding candidate:", err);
      toast.error(err.message || "Failed to add candidate");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[10001] flex items-center justify-center p-6 font-jakarta">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-[#1A1A2E66] backdrop-blur-md"
        onClick={onClose}
      />

      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        className="relative w-full max-w-[640px] bg-white rounded-[40px] shadow-[0_40px_80px_rgba(0,0,0,0.25)] overflow-hidden border border-white/20"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-10">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h2 className="text-3xl font-bold text-[#1A1A2E] font-syne">Add Joined Candidate</h2>
              <p className="text-sm text-[#9B9BAD] mt-1">Register a candidate who has already joined a client.</p>
            </div>
            <button
              onClick={onClose}
              className="w-12 h-12 rounded-2xl flex items-center justify-center border border-[#F4F3EF] text-[#6B6B7E] hover:bg-rose-50 hover:text-rose-500 transition-all duration-300"
            >
              <FiX size={24} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[11px] font-black text-[#9B9BAD] uppercase tracking-[2px] ml-1">Candidate Name *</label>
                <div className="relative group">
                  <FiUser className="absolute left-5 top-1/2 -translate-y-1/2 text-[#9B9BAD] group-focus-within:text-[#1B4DA0] transition-colors" size={18} />
                  <input
                    required
                    type="text"
                    placeholder="Enter full name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-[#F4F3EF] border-2 border-transparent focus:border-[#1B4DA0]/20 focus:bg-white rounded-2xl py-4 pl-14 pr-5 text-sm font-semibold outline-none transition-all"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[11px] font-black text-[#9B9BAD] uppercase tracking-[2px] ml-1">Joining Date *</label>
                <div className="relative group">
                  <FiCalendar className="absolute left-5 top-1/2 -translate-y-1/2 text-[#9B9BAD] group-focus-within:text-[#1B4DA0] transition-colors" size={18} />
                  <input
                    required
                    type="date"
                    value={formData.joiningDate}
                    onChange={(e) => setFormData({ ...formData, joiningDate: e.target.value })}
                    className="w-full bg-[#F4F3EF] border-2 border-transparent focus:border-[#1B4DA0]/20 focus:bg-white rounded-2xl py-4 pl-14 pr-5 text-sm font-semibold outline-none transition-all"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[11px] font-black text-[#9B9BAD] uppercase tracking-[2px] ml-1">Client *</label>
                <div className="relative group">
                  <FiBriefcase className="absolute left-5 top-1/2 -translate-y-1/2 text-[#9B9BAD] group-focus-within:text-[#1B4DA0] transition-colors" size={18} />
                  <select
                    required
                    value={formData.clientId}
                    onChange={(e) => setFormData({ ...formData, clientId: e.target.value, positionId: '' })}
                    className="w-full bg-[#F4F3EF] border-2 border-transparent focus:border-[#1B4DA0]/20 focus:bg-white rounded-2xl py-4 pl-14 pr-10 text-sm font-semibold outline-none appearance-none transition-all"
                  >
                    <option value="">Select Client</option>
                    {clients.map(c => (
                      <option key={c.id} value={c.id}>{c.companyName || c.name}</option>
                    ))}
                  </select>
                  <FiChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 text-[#9B9BAD] pointer-events-none" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[11px] font-black text-[#9B9BAD] uppercase tracking-[2px] ml-1">Position *</label>
                <div className="relative group">
                  <FiUserPlus className="absolute left-5 top-1/2 -translate-y-1/2 text-[#9B9BAD] group-focus-within:text-[#1B4DA0] transition-colors" size={18} />
                  <select
                    required
                    disabled={!formData.clientId}
                    value={formData.positionId}
                    onChange={(e) => setFormData({ ...formData, positionId: e.target.value })}
                    className="w-full bg-[#F4F3EF] border-2 border-transparent focus:border-[#1B4DA0]/20 focus:bg-white rounded-2xl py-4 pl-14 pr-10 text-sm font-semibold outline-none appearance-none transition-all disabled:opacity-50"
                  >
                    <option value="">Select Position</option>
                    {filteredPositions.map(p => (
                      <option key={p.id} value={p.id}>{p.title}</option>
                    ))}
                  </select>
                  <FiChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 text-[#9B9BAD] pointer-events-none" />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[11px] font-black text-[#9B9BAD] uppercase tracking-[2px] ml-1">Email</label>
                <div className="relative group">
                  <FiMail className="absolute left-5 top-1/2 -translate-y-1/2 text-[#9B9BAD] group-focus-within:text-[#1B4DA0] transition-colors" size={18} />
                  <input
                    type="email"
                    placeholder="example@email.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full bg-[#F4F3EF] border-2 border-transparent focus:border-[#1B4DA0]/20 focus:bg-white rounded-2xl py-4 pl-14 pr-5 text-sm font-semibold outline-none transition-all"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[11px] font-black text-[#9B9BAD] uppercase tracking-[2px] ml-1">Phone</label>
                <div className="relative group">
                  <FiPhone className="absolute left-5 top-1/2 -translate-y-1/2 text-[#9B9BAD] group-focus-within:text-[#1B4DA0] transition-colors" size={18} />
                  <input
                    type="tel"
                    placeholder="+91 XXXXX XXXXX"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                    className="w-full bg-[#F4F3EF] border-2 border-transparent focus:border-[#1B4DA0]/20 focus:bg-white rounded-2xl py-4 pl-14 pr-5 text-sm font-semibold outline-none transition-all"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[11px] font-black text-[#9B9BAD] uppercase tracking-[2px] ml-1">Offered CTC / Salary</label>
                <div className="relative group">
                  <div className="absolute left-5 top-1/2 -translate-y-1/2 text-[#9B9BAD] font-bold text-lg group-focus-within:text-[#1B4DA0] transition-colors">₹</div>
                  <input
                    type="text"
                    placeholder="e.g. 12 LPA"
                    value={formData.offeredCTC}
                    onChange={(e) => setFormData({ ...formData, offeredCTC: e.target.value })}
                    className="w-full bg-[#F4F3EF] border-2 border-transparent focus:border-[#1B4DA0]/20 focus:bg-white rounded-2xl py-4 pl-14 pr-5 text-sm font-semibold outline-none transition-all"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[11px] font-black text-[#9B9BAD] uppercase tracking-[2px] ml-1">Location</label>
                <div className="relative group">
                  <FiMapPin className="absolute left-5 top-1/2 -translate-y-1/2 text-[#9B9BAD] group-focus-within:text-[#1B4DA0] transition-colors" size={18} />
                  <input
                    type="text"
                    placeholder="e.g. Noida, Delhi"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full bg-[#F4F3EF] border-2 border-transparent focus:border-[#1B4DA0]/20 focus:bg-white rounded-2xl py-4 pl-14 pr-5 text-sm font-semibold outline-none transition-all"
                  />
                </div>
              </div>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-[#1B4DA0] text-white py-5 rounded-2xl text-xs font-black uppercase tracking-[3px] shadow-lg shadow-blue-500/20 hover:bg-blue-800 active:scale-[0.98] transition-all disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-3"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <FiCheckCircle size={18} />
                    Confirm Joining
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>,
    document.body
  );
};

// Sub-component defined above to avoid any hoisting confusion
const InfoItem = ({ label, value, valueNode }) => (
  <div>
    <p className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-widest mb-1.5">{label}</p>
    <div className="bg-white border border-[#F4F3EF] rounded-xl px-4 py-3 min-h-[44px] flex items-center">
      {valueNode ? valueNode : <span className="text-[13px] font-bold text-[#1A1A2E]">{value || 'N/A'}</span>}
    </div>
  </div>
);

const CandidateDetailDrawer = ({ candidate, onClose, onUpdateJoiningStatus }) => {
  if (!candidate) return null;

  const [tempStatus, setTempStatus] = useState(candidate.status || 'Pending');
  const [tempDate, setTempDate] = useState(
    candidate.joiningDateRaw && !isNaN(new Date(candidate.joiningDateRaw).getTime())
      ? format(new Date(candidate.joiningDateRaw), 'yyyy-MM-dd')
      : format(new Date(), 'yyyy-MM-dd')
  );
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (candidate) {
      setTempStatus(candidate.status || 'Pending');
      if (candidate.joiningDateRaw && !isNaN(new Date(candidate.joiningDateRaw).getTime())) {
        setTempDate(format(new Date(candidate.joiningDateRaw), 'yyyy-MM-dd'));
      }
    }
  }, [candidate]);

  const handleUpdate = async () => {
    setIsSaving(true);
    try {
      await onUpdateJoiningStatus(candidate.id, tempStatus, tempStatus === 'Rescheduled' ? tempDate : null);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[10001] flex justify-end font-jakarta pointer-events-none">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-[#1A1A2E66] backdrop-blur-md transition-opacity pointer-events-auto"
        onClick={onClose}
      />

      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 30, stiffness: 200 }}
        className="fixed inset-y-0 right-0 w-full max-w-[698px] bg-white shadow-2xl border-l border-[#F4F3EF] flex flex-col z-[200001] overflow-hidden pointer-events-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b border-[#F4F3EF] flex items-center justify-between bg-gradient-to-r from-blue-50/30 to-white">
          <h3 className="text-xl font-bold text-[#1A1A2E]" style={{ fontFamily: "'Syne', sans-serif" }}>Candidate Profile</h3>
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-2xl flex items-center justify-center text-[#9B9BAD] hover:text-red-500 hover:bg-red-50 transition-all duration-300"
            >
              <FiX size={20} />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-10 py-8 space-y-10 custom-scrollbar text-left">
          
          <div className="flex flex-col items-center text-center">
            <div className="relative mb-6">
              <div className="w-24 h-24 rounded-[32px] bg-[#1B4DA0] flex items-center justify-center text-white text-3xl font-extrabold shadow-xl shadow-blue-500/20 overflow-hidden"
                   style={{ background: 'linear-gradient(135deg, #1B4DA0 0%, #0D47A1 100%)' }}>
                <span>{(candidate.candidate || 'C').substring(0, 2).toUpperCase()}</span>
              </div>
            </div>
            <div className="space-y-1.5 w-full flex flex-col items-center">
              <h4 className="text-2xl font-bold text-[#1A1A2E] tracking-tight font-syne">{candidate.candidate}</h4>
              <p className="text-[11px] font-bold text-[#0D47A1] uppercase tracking-[3px]">{candidate.client}</p>
            </div>
          </div>

          <div className="bg-[#FAFAF8] rounded-[32px] border border-[#F4F3EF] p-8 space-y-10 shadow-sm">
            
            <div className="space-y-6">
              <div className="flex items-center gap-3 border-b border-[#F4F3EF] pb-4">
                <FiUser className="text-[#1B4DA0]" size={18} />
                <h5 className="text-[12px] font-black text-[#1A1A2E] uppercase tracking-wider">Professional Info</h5>
              </div>
              <div className="grid grid-cols-2 gap-x-8 gap-y-6">
                <InfoItem label="Position" value={candidate.position} />
                <InfoItem label="Client" value={candidate.client} />
                <InfoItem label="Joining Date" value={candidate.joiningDate} />
                <InfoItem label="Primary Contact" value={candidate.contact} />
              </div>
            </div>

            <div className="space-y-6">
              <div className="flex items-center gap-3 border-b border-[#F4F3EF] pb-4">
                <FiBriefcase className="text-[#1B4DA0]" size={18} />
                <h5 className="text-[12px] font-black text-[#1A1A2E] uppercase tracking-wider">Status & Performance</h5>
              </div>
              <div className="grid grid-cols-2 gap-x-8 gap-y-6">
                <InfoItem label="Status" value={candidate.status} />
                <InfoItem label="Performance Score" value={candidate.performance} />
              </div>
            </div>

            {candidate.source === 'ERP' && (
              <div className="space-y-6 bg-white p-6 rounded-2xl border border-[#F4F3EF] animate-in fade-in duration-300">
                <div className="flex items-center gap-3 border-b border-[#F4F3EF] pb-4">
                  <FiCheckCircle className="text-[#1B4DA0]" size={18} />
                  <h5 className="text-[12px] font-black text-[#1A1A2E] uppercase tracking-wider">Update Joining Status</h5>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-widest ml-1">Joining Status</label>
                    <div className="relative group">
                      <select
                        value={tempStatus}
                        disabled={candidate.status === 'Joined'}
                        onChange={(e) => setTempStatus(e.target.value)}
                        className="w-full bg-[#F4F3EF] border-2 border-transparent focus:border-[#1B4DA0]/20 focus:bg-white rounded-xl py-3.5 px-4 text-xs font-bold outline-none appearance-none transition-all disabled:opacity-75 disabled:cursor-not-allowed"
                      >
                        <option value="Pending">Pending</option>
                        <option value="Joined">Joined</option>
                        <option value="Not Joined">Not Joined</option>
                        <option value="Rescheduled">Rescheduled</option>
                      </select>
                      {candidate.status !== 'Joined' && (
                        <FiChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-[#9B9BAD] pointer-events-none" />
                      )}
                    </div>
                  </div>

                  {tempStatus === 'Rescheduled' ? (
                    <div className="space-y-2 animate-in slide-in-from-top-2 duration-200">
                      <label className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-widest ml-1">New Joining Date</label>
                      <input
                        type="date"
                        value={tempDate}
                        onChange={(e) => setTempDate(e.target.value)}
                        className="w-full bg-[#F4F3EF] border-2 border-transparent focus:border-[#1B4DA0]/20 focus:bg-white rounded-xl py-3 px-4 text-xs font-bold outline-none transition-all"
                      />
                    </div>
                  ) : (
                    <div className="hidden md:block" /> // spacer
                  )}
                </div>

                <div className="pt-2">
                  <button
                    onClick={handleUpdate}
                    disabled={isSaving || candidate.status === 'Joined'}
                    className="w-full bg-[#1B4DA0] text-white py-3.5 rounded-xl text-[10px] font-black uppercase tracking-[2px] shadow-md hover:bg-blue-800 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSaving ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <FiCheckCircle size={14} strokeWidth={3} />
                        Save Status
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      </motion.div>
    </div>,
    document.body
  );
};

const RescheduleModal = ({ candidate, onClose, onConfirm }) => {
  const [newDate, setNewDate] = useState(
    candidate.joiningDateRaw && !isNaN(new Date(candidate.joiningDateRaw).getTime())
      ? format(new Date(candidate.joiningDateRaw), 'yyyy-MM-dd')
      : format(new Date(), 'yyyy-MM-dd')
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onConfirm(candidate.id, 'Rescheduled', newDate);
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[10002] flex items-center justify-center p-6 font-jakarta">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-[#1A1A2E66] backdrop-blur-md"
        onClick={onClose}
      />
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 10 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 10 }}
        className="relative w-full max-w-[400px] bg-white rounded-[32px] p-8 shadow-2xl border border-slate-100 text-left"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
          <h4 className="text-xl font-bold text-[#1A1A2E] font-syne">Reschedule Joining</h4>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all"
          >
            <FiX size={18} />
          </button>
        </div>
        <p className="text-xs text-[#9B9BAD] mb-6 font-medium leading-relaxed font-jakarta">Select a new official joining date for <span className="font-bold text-slate-700">{candidate.candidate}</span>.</p>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-widest ml-1">New Joining Date</label>
            <input
              type="date"
              value={newDate}
              onChange={(e) => setNewDate(e.target.value)}
              className="w-full bg-[#F4F3EF] border-2 border-transparent focus:border-[#1B4DA0]/20 focus:bg-white rounded-2xl py-4 px-5 text-sm font-semibold outline-none transition-all"
              required
            />
          </div>
          
          <div className="flex gap-4 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-4 bg-[#F4F3EF] hover:bg-slate-200 text-slate-700 rounded-2xl text-xs font-bold transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 py-4 bg-[#1B4DA0] hover:bg-blue-800 text-white rounded-2xl text-xs font-black uppercase tracking-widest transition-all flex items-center justify-center gap-1.5"
            >
              {isSubmitting ? 'Saving...' : 'Confirm'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>,
    document.body
  );
};


const HiringLifecycleTab = ({ notificationBell }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterClient, setFilterClient] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [reschedulingCandidate, setReschedulingCandidate] = useState(null);

  const [lifecycleData, setLifecycleData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeFilter, setTimeFilter] = useState('all');
  const [startDate, setStartDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [endDate, setEndDate] = useState(format(new Date(), 'yyyy-MM-dd'));

  const [clients, setClients] = useState([]);

  React.useEffect(() => {
    fetchJoinedCandidates();
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      const [allClientsRes, recClientsRes, spClientsRes] = await Promise.all([
        getAllClients({ service: 'recruitment' }).catch(() => ({ success: false })),
        getRecruitmentClients().catch(() => ({ success: false })),
        getSharePointClients().catch(() => ({ success: true, data: [] }))
      ]);

      let erpClients = [];
      const extractClients = (res) => {
        if (!res || !res.success) return [];
        const data = res.data?.clients || res.clients || res.data || [];
        return Array.isArray(data) ? data : [];
      };

      const clientsA = extractClients(allClientsRes);
      const clientsB = extractClients(recClientsRes);

      const combinedErp = [...clientsA];
      clientsB.forEach(cb => {
        if (!combinedErp.some(ca => ca.id === cb.id)) {
          combinedErp.push(cb);
        }
      });

      let spClients = [];
      if (spClientsRes && spClientsRes.data) {
        spClients = Array.isArray(spClientsRes.data) ? spClientsRes.data : [];
      }

      const finalClients = [...combinedErp];
      spClients.forEach(spc => {
        const name = (spc.companyName || spc.name || '').toLowerCase();
        const exists = finalClients.some(ec =>
          (ec.companyName || ec.name || '').toLowerCase() === name
        );
        if (!exists && name) {
          finalClients.push({
            ...spc,
            id: spc.id || spc.sharePointId || spc.name,
            isSharePoint: true
          });
        }
      });

      const mappedClients = finalClients.map(c => {
        const name = c.companyName || c.name || c.displayName || '';
        return {
          id: c.id || c._id || '',
          name: name,
          companyName: c.companyName || c.name || ''
        };
      });

      // Ensure 'Internal' is an option
      if (!mappedClients.some(c => c.name.toLowerCase() === 'internal')) {
        mappedClients.push({ id: 'internal', name: 'Internal', companyName: 'Internal' });
      }

      setClients(mappedClients.sort((a, b) => a.name.localeCompare(b.name)));
    } catch (err) {
      console.error('Error fetching clients in HiringLifecycleTab:', err);
    }
  };

  const fetchJoinedCandidates = async () => {
    try {
      setLoading(true);
      const [erpRes, spRes] = await Promise.all([
        getAllCandidates({ stage: 'Joined,Offer Sent' }).catch(err => { console.error("ERP fetch failed:", err); return { success: false }; }),
        getSharePointCandidates({ stage: 'Joined,Offer Sent' }).catch(err => { console.error("SP fetch failed:", err); return { success: true, data: [] }; })
      ]);

      let allJoined = [];

      if (erpRes && erpRes.success) {
        const rawData = erpRes.data?.candidates || erpRes.candidates || erpRes.data || [];
        if (Array.isArray(rawData)) {
          allJoined = [...allJoined, ...rawData.map(c => ({
            id: c.id,
            candidate: c.name,
            client: c.client?.companyName || c.client?.name || 'Internal',
            position: c.position?.title || 'Unknown',
            joiningDate: c.joiningDate ? format(new Date(c.joiningDate), 'MMM dd, yyyy') : 'TBD',
            joiningDateRaw: c.joiningDate ? new Date(c.joiningDate) : null,
            contact: c.phone || c.email || 'N/A',
            performance: 'Active',
            status: c.joiningStatus || 'Pending',
            source: 'ERP',
            completedMilestones: []
          }))];
        }
      }

      if (spRes && spRes.success && spRes.data) {
        const rawData = Array.isArray(spRes.data) ? spRes.data : [];
        allJoined = [...allJoined, ...rawData.map(c => ({
          id: c.id || c.sharePointId,
          candidate: c.name,
          client: c.client || 'External',
          position: c.position || 'Unknown',
          joiningDate: c.joiningDate || c.sharePointCreatedAt ? format(new Date(c.joiningDate || c.sharePointCreatedAt), 'MMM dd, yyyy') : 'TBD',
          joiningDateRaw: c.joiningDate || c.sharePointCreatedAt ? new Date(c.joiningDate || c.sharePointCreatedAt) : null,
          contact: c.phone || c.email || 'N/A',
          performance: 'Active',
          status: c.status || 'Active',
          source: 'SharePoint',
          completedMilestones: []
        }))];
      }

      setLifecycleData(allJoined);
    } catch (err) {
      console.error('Critical error in fetchJoinedCandidates:', err);
      setLifecycleData([]);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateJoiningStatus = async (candidateId, newStatus, newDate) => {
    try {
      const payload = {
        joiningStatus: newStatus,
        stage: newStatus === 'Joined' ? 'Joined' : 'Offer Sent'
      };
      if (newStatus === 'Rescheduled' && newDate) {
        payload.joiningDate = newDate;
      }
      
      const response = await updateCandidate(candidateId, payload);
      
      if (response.success) {
        toast.success(`Joining status updated to ${newStatus}`);
        await fetchJoinedCandidates();
        
        // Update local selectedCandidate state to reflect changes instantly in the drawer
        setSelectedCandidate(prev => {
          if (!prev || prev.id !== candidateId) return prev;
          return {
            ...prev,
            status: newStatus,
            joiningDate: newStatus === 'Rescheduled' && newDate 
              ? format(new Date(newDate), 'MMM dd, yyyy') 
              : prev.joiningDate,
            joiningDateRaw: newStatus === 'Rescheduled' && newDate 
              ? new Date(newDate) 
              : prev.joiningDateRaw
          };
        });
      } else {
        toast.error(response.message || "Failed to update status");
      }
    } catch (err) {
      console.error("Error updating status:", err);
      toast.error(err.message || "Failed to update status");
    }
  };



  const filteredData = lifecycleData.filter(item => {
    const matchesSearch = item.candidate.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.client.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesClient = filterClient === 'all' || 
      (item.client || '').toLowerCase().trim() === filterClient.toLowerCase().trim();
    const matchesStatus = filterStatus === 'all' || item.status === filterStatus;

    // Time filtering logic
    let matchesTime = true;
    if (timeFilter !== 'all') {
      const joiningDate = item.joiningDateRaw || (item.joiningDate && item.joiningDate !== 'TBD' ? new Date(item.joiningDate) : null);
      const today = new Date();
      const isValidDate = joiningDate && !isNaN(joiningDate.getTime());

      if (timeFilter === 'this_week') {
        if (!isValidDate) {
          matchesTime = false;
        } else {
          const startOfWeek = new Date();
          startOfWeek.setDate(today.getDate() - today.getDay());
          startOfWeek.setHours(0, 0, 0, 0);
          matchesTime = joiningDate >= startOfWeek;
        }
      } else if (timeFilter === 'this_month') {
        matchesTime = isValidDate && joiningDate.getMonth() === today.getMonth() && joiningDate.getFullYear() === today.getFullYear();
      } else if (timeFilter === 'this_year') {
        matchesTime = isValidDate && joiningDate.getFullYear() === today.getFullYear();
      } else if (timeFilter === 'current') {
        matchesTime = item.status === 'Active';
      } else if (timeFilter === 'custom') {
        if (!isValidDate) {
          matchesTime = false;
        } else {
          const start = new Date(startDate);
          start.setHours(0, 0, 0, 0);
          const end = new Date(endDate);
          end.setHours(23, 59, 59, 999);
          matchesTime = joiningDate >= start && joiningDate <= end;
        }
      }
    }

    return matchesSearch && matchesClient && matchesStatus && matchesTime;
  });



  return (
    <div className="space-y-8 animate-in fade-in duration-500 font-jakarta">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-[#1A1A2E] font-syne">Joined Candidates</h1>
        <div className="flex items-center gap-3">
          {notificationBell}
        </div>
      </div>

      <div className="bg-white rounded-[24px] p-2 border border-[#F4F3EF] shadow-sm flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 group min-w-[200px]">
          <FiSearch className="absolute left-5 top-1/2 -translate-y-1/2 text-[#9B9BAD]" size={18} />
          <input
            type="text"
            placeholder="Search candidates..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#F4F3EF] border-none rounded-2xl py-3 pl-14 pr-5 text-sm font-medium outline-none transition-all placeholder:text-[#9B9BAD]"
          />
        </div>

        <div className="relative group min-w-[180px]">
          <select
            value={filterClient}
            onChange={(e) => setFilterClient(e.target.value)}
            className="w-full bg-[#F4F3EF] border-none rounded-2xl py-3 pl-12 pr-10 text-[11px] font-black uppercase tracking-wider outline-none appearance-none cursor-pointer transition-all hover:bg-[#EAE9E4] text-[#4B4B5E]"
          >
            <option value="all">ALL CLIENTS</option>
            {clients.map(c => <option key={c.id || c.name} value={c.name}>{c.name.toUpperCase()}</option>)}
          </select>
          <FiChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 text-[#9B9BAD] pointer-events-none" size={16} />
        </div>

        <div className="relative group min-w-[180px]">
          {/* <FiFilter className="absolute left-5 top-1/2 -translate-y-1/2 text-[#9B9BAD] pointer-events-none" size={16} /> */}
          <select
            value={timeFilter}
            onChange={(e) => setTimeFilter(e.target.value)}
            className="w-full bg-[#F4F3EF] border-none rounded-2xl py-3 pl-12 pr-10 text-[11px] font-black uppercase tracking-wider outline-none appearance-none cursor-pointer transition-all hover:bg-[#EAE9E4] text-[#4B4B5E]"
          >
            <option value="all">All Hires</option>
            <option value="this_week">This Week</option>
            <option value="this_month">This Month</option>
            <option value="this_year">This Year</option>
            <option value="current">Current Hires</option>
            <option value="custom">Custom Range</option>
          </select>
          <FiChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 text-[#9B9BAD] pointer-events-none" size={16} />
        </div>

        {timeFilter === 'custom' && (
          <div className="flex items-center gap-2 animate-in slide-in-from-right-2 duration-300">
            <div className="relative group">
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="bg-[#F4F3EF] border-none rounded-2xl py-3 px-4 text-[10px] font-bold uppercase outline-none transition-all hover:bg-[#EAE9E4] text-[#4B4B5E]"
              />
              <span className="absolute -top-6 left-1 text-[9px] font-black text-[#9B9BAD] uppercase tracking-widest">From</span>
            </div>
            <div className="w-2 h-[2px] bg-[#9B9BAD] rounded-full" />
            <div className="relative group">
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="bg-[#F4F3EF] border-none rounded-2xl py-3 px-4 text-[10px] font-bold uppercase outline-none transition-all hover:bg-[#EAE9E4] text-[#4B4B5E]"
              />
              <span className="absolute -top-6 left-1 text-[9px] font-black text-[#9B9BAD] uppercase tracking-widest">To</span>
            </div>
          </div>
        )}
      </div>

      <div className="bg-white rounded-[32px] border border-[#F4F3EF] overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full table-fixed">
            <thead>
              <tr className="bg-white border-b border-[#F4F3EF]">
                <th className="w-[25%] px-6 py-5 text-[11px] font-black text-[#9B9BAD] uppercase tracking-[2px] text-left">Candidate</th>
                <th className="w-[45%] px-6 py-5 text-[11px] font-black text-[#9B9BAD] uppercase tracking-[2px] text-left">Client & Joining</th>
                <th className="w-[20%] px-6 py-5 text-[11px] font-black text-[#9B9BAD] uppercase tracking-[2px] text-center">Status</th>
                <th className="w-[10%] px-6 py-5 text-[11px] font-black text-[#9B9BAD] uppercase tracking-[2px] text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F4F3EF]">
              {loading ? (
                <tr>
                  <td colSpan="4" className="px-6 py-24 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-8 h-8 border-4 border-[#1B4DA0] border-t-transparent rounded-full animate-spin" />
                      <p className="text-sm font-bold text-[#9B9BAD] uppercase tracking-widest">Loading candidates...</p>
                    </div>
                  </td>
                </tr>
              ) : filteredData.length === 0 ? (
                <tr>
                  <td colSpan="4" className="px-6 py-24 text-center">
                    <p className="text-sm font-bold text-[#9B9BAD] uppercase tracking-widest">No joined candidates found</p>
                  </td>
                </tr>
              ) : (
                filteredData.map((row) => (
                  <tr key={row.id} onClick={() => setSelectedCandidate(row)} className="hover:bg-[#F8FAFF] transition-all group cursor-pointer">
                    <td className="w-[25%] px-6 py-6 text-left">
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm border flex-shrink-0 ${row.source === 'SharePoint' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-blue-50 text-[#0D47A1] border-blue-100'}`}>
                          {row.candidate?.charAt(0) || '?'}
                        </div>
                        <div className="text-left font-bold text-sm text-[#1A1A2E] truncate">
                          {row.candidate}
                          {row.source === 'SharePoint' && (
                            <span className="ml-2 py-0.5 px-1.5 bg-emerald-100 text-emerald-700 text-[8px] rounded uppercase tracking-tighter">SP</span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="w-[45%] px-6 py-6 text-left">
                      <div className="text-left truncate">
                        <p className="text-sm font-bold text-[#4B4B5E] truncate">{row.client}</p>
                        <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest mt-0.5">Joined: {row.joiningDate}</p>
                      </div>
                    </td>
                    <td className="w-[20%] px-6 py-6 text-center">
                      <span className={`inline-block px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-wider ${
                        row.status === 'Joined'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                          : row.status === 'Not Joined'
                          ? 'bg-rose-50 text-rose-700 border border-rose-100'
                          : row.status === 'Rescheduled'
                          ? 'bg-amber-50 text-amber-700 border border-amber-100'
                          : 'bg-blue-50 text-[#1B4DA0] border border-blue-100'
                      }`}>
                        {row.status}
                      </span>
                    </td>
                    <td className="w-[10%] px-6 py-6 text-right">
                      <div className="flex items-center justify-end">
                        <button className="p-2.5 bg-[#F4F3EF] text-[#1B4DA0] rounded-xl hover:bg-[#EAE9E4] transition-all"><FiChevronRight size={18} /></button>
                      </div>
                    </td>
                  </tr>
                )))}
            </tbody>
          </table>
        </div>
      </div>

      <AnimatePresence>
        {selectedCandidate && (
          <CandidateDetailDrawer
            candidate={selectedCandidate}
            onClose={() => setSelectedCandidate(null)}
            onUpdateJoiningStatus={handleUpdateJoiningStatus}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showAddModal && (
          <AddCandidateModal
            isOpen={showAddModal}
            onClose={() => setShowAddModal(false)}
            onSuccess={fetchJoinedCandidates}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {reschedulingCandidate && (
          <RescheduleModal
            candidate={reschedulingCandidate}
            onClose={() => setReschedulingCandidate(null)}
            onConfirm={handleUpdateJoiningStatus}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default HiringLifecycleTab;
