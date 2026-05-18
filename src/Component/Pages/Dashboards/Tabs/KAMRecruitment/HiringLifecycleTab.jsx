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
import { getAllCandidates, getSharePointCandidates, addCandidate, getAllRecruitmentPositions, getRecruitmentClients, getSharePointClients, getAllClients } from '../../../service/api';
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
        getAllClients().catch(err => { console.error("getAllClients failed:", err); return { success: false }; }),
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
      const res = await addCandidate({
        ...formData,
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
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
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

const CandidateDetailDrawer = ({ candidate, onClose, onUpdateMilestone, onMarkLeft }) => {
  if (!candidate) return null;

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

          </div>
        </div>
      </motion.div>
    </div>,
    document.body
  );
};

const mockData = [
  {
    id: 'mock-1',
    candidate: 'Arjun Sharma',
    client: 'Reliance Industries',
    position: 'Technical Architect',
    joiningDate: format(new Date(), 'MMM dd, yyyy'),
    contact: '+91 98765 43210',
    performance: 'Active',
    status: 'Active',
    source: 'ERP',
    joiningDateRaw: new Date()
  },
  {
    id: 'mock-2',
    candidate: 'Priya Patel',
    client: 'Tata Consultancy Services',
    position: 'Lead UX Designer',
    joiningDate: format(new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), 'MMM dd, yyyy'),
    contact: 'priya.p@tcs.com',
    performance: 'Excellent',
    status: 'Active',
    source: 'ERP',
    joiningDateRaw: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
  },
  {
    id: 'mock-3',
    candidate: 'Rohan Gupta',
    client: 'Infosys Ltd',
    position: 'Senior Java Developer',
    joiningDate: format(new Date(Date.now() - 4 * 24 * 60 * 60 * 1000), 'MMM dd, yyyy'),
    contact: 'rohan.g@infosys.com',
    performance: 'Active',
    status: 'Active',
    source: 'SharePoint',
    joiningDateRaw: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000)
  },
  {
    id: 'mock-4',
    candidate: 'Ananya Iyer',
    client: 'HDFC Bank',
    position: 'Product Manager',
    joiningDate: format(new Date(Date.now() - 12 * 24 * 60 * 60 * 1000), 'MMM dd, yyyy'),
    contact: 'ananya.i@hdfc.com',
    performance: 'Outstanding',
    status: 'Active',
    source: 'ERP',
    joiningDateRaw: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000)
  },
  {
    id: 'mock-5',
    candidate: 'Vikram Singh',
    client: 'Zomato',
    position: 'Backend Engineer',
    joiningDate: format(new Date(Date.now() - 25 * 24 * 60 * 60 * 1000), 'MMM dd, yyyy'),
    contact: 'vikram.s@zomato.com',
    performance: 'Active',
    status: 'Active',
    source: 'ERP',
    joiningDateRaw: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000)
  },
  {
    id: 'mock-6',
    candidate: 'Sneha Reddy',
    client: 'Swiggy',
    position: 'Frontend Developer',
    joiningDate: format(new Date(2026, 3, 15), 'MMM dd, yyyy'),
    contact: 'sneha.r@swiggy.com',
    performance: 'Active',
    status: 'Past',
    source: 'SharePoint',
    joiningDateRaw: new Date(2026, 3, 15)
  },
  {
    id: 'mock-7',
    candidate: 'Rahul Verma',
    client: 'MakeMyTrip',
    position: 'Marketing Head',
    joiningDate: format(new Date(2026, 1, 10), 'MMM dd, yyyy'),
    contact: 'rahul.v@mmt.com',
    performance: 'Average',
    status: 'Past',
    source: 'ERP',
    joiningDateRaw: new Date(2026, 1, 10)
  },
  {
    id: 'mock-8',
    candidate: 'Ishita Kapoor',
    client: 'Paytm',
    position: 'Data Scientist',
    joiningDate: format(new Date(2025, 11, 20), 'MMM dd, yyyy'),
    contact: 'ishita.k@paytm.com',
    performance: 'Active',
    status: 'Past',
    source: 'ERP',
    joiningDateRaw: new Date(2025, 11, 20)
  },
  {
    id: 'mock-9',
    candidate: 'Manish Pandey',
    client: 'Airtel',
    position: 'Network Engineer',
    joiningDate: format(new Date(), 'MMM dd, yyyy'),
    contact: 'manish.p@airtel.com',
    performance: 'Active',
    status: 'Active',
    source: 'ERP',
    joiningDateRaw: new Date()
  },
  {
    id: 'mock-10',
    candidate: 'Kriti Sanon',
    client: 'Nykaa',
    position: 'Brand Manager',
    joiningDate: format(new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), 'MMM dd, yyyy'),
    contact: 'kriti.s@nykaa.com',
    performance: 'Excellent',
    status: 'Active',
    source: 'SharePoint',
    joiningDateRaw: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
  },
  {
    id: 'mock-11',
    candidate: 'Siddharth Malhotra',
    client: 'Ola Electric',
    position: 'R&D Lead',
    joiningDate: format(new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), 'MMM dd, yyyy'),
    contact: 'sid.m@ola.com',
    performance: 'Active',
    status: 'Active',
    source: 'ERP',
    joiningDateRaw: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
  },
  {
    id: 'mock-12',
    candidate: 'Kiara Advani',
    client: 'Myntra',
    position: 'Fashion Consultant',
    joiningDate: format(new Date(Date.now() - 40 * 24 * 60 * 60 * 1000), 'MMM dd, yyyy'),
    contact: 'kiara.a@myntra.com',
    performance: 'Good',
    status: 'Past',
    source: 'ERP',
    joiningDateRaw: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000)
  }
];

const HiringLifecycleTab = ({ notificationBell }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterClient, setFilterClient] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);

  const [lifecycleData, setLifecycleData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeFilter, setTimeFilter] = useState('all');
  const [startDate, setStartDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [endDate, setEndDate] = useState(format(new Date(), 'yyyy-MM-dd'));

  React.useEffect(() => {
    fetchJoinedCandidates();
  }, []);

  const fetchJoinedCandidates = async () => {
    try {
      setLoading(true);
      const [erpRes, spRes] = await Promise.all([
        getAllCandidates({ stage: 'Joined' }).catch(err => { console.error("ERP fetch failed:", err); return { success: false }; }),
        getSharePointCandidates({ stage: 'Joined' }).catch(err => { console.error("SP fetch failed:", err); return { success: true, data: [] }; })
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
            contact: c.phone || c.email || 'N/A',
            performance: 'Active',
            status: 'Active',
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
          contact: c.phone || c.email || 'N/A',
          performance: 'Active',
          status: c.status || 'Active',
          source: 'SharePoint',
          completedMilestones: []
        }))];
      }

      // Merge and ensure at least mock data is present
      setLifecycleData([...allJoined, ...mockData]);
    } catch (err) {
      console.error('Critical error in fetchJoinedCandidates:', err);
      setLifecycleData(mockData);
    } finally {
      setLoading(false);
    }
  };



  const filteredData = lifecycleData.filter(item => {
    const matchesSearch = item.candidate.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.client.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesClient = filterClient === 'all' || item.client === filterClient;
    const matchesStatus = filterStatus === 'all' || item.status === filterStatus;

    // Time filtering logic
    let matchesTime = true;
    if (timeFilter !== 'all') {
      const joiningDate = item.joiningDateRaw || new Date(item.joiningDate);
      const today = new Date();

      if (timeFilter === 'this_week') {
        const startOfWeek = new Date();
        startOfWeek.setDate(today.getDate() - today.getDay());
        startOfWeek.setHours(0, 0, 0, 0);
        matchesTime = joiningDate >= startOfWeek;
      } else if (timeFilter === 'this_month') {
        matchesTime = joiningDate.getMonth() === today.getMonth() && joiningDate.getFullYear() === today.getFullYear();
      } else if (timeFilter === 'this_year') {
        matchesTime = joiningDate.getFullYear() === today.getFullYear();
      } else if (timeFilter === 'current') {
        matchesTime = item.status === 'Active';
      } else if (timeFilter === 'custom') {
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        matchesTime = joiningDate >= start && joiningDate <= end;
      }
    }

    return matchesSearch && matchesClient && matchesStatus && matchesTime;
  });

  const uniqueClients = [...new Set(lifecycleData.map(item => item.client))].filter(Boolean).sort();

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
            {uniqueClients.map(c => <option key={c} value={c}>{c}</option>)}
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
          <table className="w-full">
            <thead>
              <tr className="bg-white border-b border-[#F4F3EF]">
                <th className="px-8 py-5 text-[11px] font-black text-[#9B9BAD] uppercase tracking-[2px] text-left">Candidate</th>
                <th className="px-8 py-5 text-[11px] font-black text-[#9B9BAD] uppercase tracking-[2px] text-left">Client & Joining</th>
                <th className="px-8 py-5 text-[11px] font-black text-[#9B9BAD] uppercase tracking-[2px] text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F4F3EF]">
              {loading ? (
                <tr>
                  <td colSpan="3" className="px-8 py-24 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-8 h-8 border-4 border-[#1B4DA0] border-t-transparent rounded-full animate-spin" />
                      <p className="text-sm font-bold text-[#9B9BAD] uppercase tracking-widest">Loading candidates...</p>
                    </div>
                  </td>
                </tr>
              ) : filteredData.length === 0 ? (
                <tr>
                  <td colSpan="3" className="px-8 py-24 text-center">
                    <p className="text-sm font-bold text-[#9B9BAD] uppercase tracking-widest">No joined candidates found</p>
                  </td>
                </tr>
              ) : (
                filteredData.map((row) => (
                  <tr key={row.id} onClick={() => setSelectedCandidate(row)} className="hover:bg-[#F8FAFF] transition-all group cursor-pointer">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm border ${row.source === 'SharePoint' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-blue-50 text-[#0D47A1] border-blue-100'}`}>
                          {row.candidate?.charAt(0) || '?'}
                        </div>
                        <div className="text-left font-bold text-sm text-[#1A1A2E]">
                          {row.candidate}
                          {row.source === 'SharePoint' && (
                            <span className="ml-2 py-0.5 px-1.5 bg-emerald-100 text-emerald-700 text-[8px] rounded uppercase tracking-tighter">SP</span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="text-left">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-bold text-[#4B4B5E]">{row.client}</p>
                          <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-wider ${row.status === 'Active'
                            ? 'bg-blue-100 text-[#1B4DA0]'
                            : 'bg-slate-100 text-slate-500'
                            }`}>
                            {row.status}
                          </span>
                        </div>
                        <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest mt-0.5">Joined: {row.joiningDate}</p>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center justify-end">
                        <button className="p-2.5 bg-[#F4F3EF] text-[#1B4DA0] rounded-xl"><FiChevronRight size={18} /></button>
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
    </div>
  );
};

export default HiringLifecycleTab;
