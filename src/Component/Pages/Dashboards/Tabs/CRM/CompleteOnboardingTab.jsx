import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiSearch, 
  FiChevronDown, 
  FiUsers, 
  FiRefreshCw,
  FiMapPin,
  FiPhone,
  FiArrowRight,
  FiCheckCircle,
  FiEdit2,
  FiSave,
  FiX,
  FiActivity,
  FiMapPin as FiMapIcon,
  FiUser,
  FiCheck
} from 'react-icons/fi';
import { getAllClients, editClient } from '../../../service/api';
import { toast } from 'react-hot-toast';
import { createPortal } from 'react-dom';
import ClientOnboardingForm from './ClientOnboardingForm';

const STAGE_STYLE = {
  "Lead Stage": {
    dot: "bg-[#F59E0B]",
    badge: "bg-[#FFF9EB] text-[#B45309]",
    label: "Lead Stage",
  },
  "Finalize": {
    dot: "bg-[#3B82F6]",
    badge: "bg-[#EFF6FF] text-[#1D4ED8]",
    label: "Finalize",
  },
  "Onboarding Complete": {
    dot: "bg-[#8B5CF6]",
    badge: "bg-[#F5F3FF] text-[#6D28D9]",
    label: "Onboarding",
    icon: true,
  },
};

const DetailCard = ({ label, value }) => (
  <div className="p-4 bg-[#FAFAF9] rounded-2xl border border-[#F4F3EF] space-y-1">
    <p className="text-[9px] font-black text-[#9B9BAD] uppercase tracking-wider">{label}</p>
    <p className="text-[13px] font-bold text-[#1A1A2E] truncate">{value || '—'}</p>
  </div>
);

const CompleteOnboardingTab = () => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [dateFilter, setDateFilter] = useState({ filterType: 'all', date: '' });
  
  // Onboarding Modal State
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);

  // Detail Drawer State
  const [viewingClient, setViewingClient] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editForm, setEditForm] = useState({});

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      setLoading(true);
      const res = await getAllClients();
      if (res && res.success) {
        const clientList = res.data?.clients || res.data || [];
        setClients(Array.isArray(clientList) ? clientList : []);
      }
    } catch (err) {
      console.error('Failed to fetch onboarding clients:', err);
      toast.error('Failed to load clients from database');
    } finally {
      setLoading(false);
    }
  };

  const handleOnboardingSubmit = async (formData) => {
    try {
      if (!selectedClient) return;
      const res = await editClient({ 
        clientId: selectedClient.id, 
        ...formData, 
        stage: 'Onboarding Complete' 
      });
      
      if (res.success) {
        toast.success("Client onboarding completed successfully!");
        fetchClients();
        setIsOnboardingOpen(false);
      }
    } catch (err) {
      console.error("Onboarding failed:", err);
      toast.error("Failed to complete onboarding");
    }
  };

  const handleEditChange = (key, value) => {
    setEditForm(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      const res = await editClient({ clientId: viewingClient.id, ...editForm });
      if (res.success) {
        toast.success("Client updated successfully");
        setViewingClient({ ...viewingClient, ...res.data });
        setClients(prev => prev.map(c => c.id === viewingClient.id ? { ...c, ...res.data } : c));
        setIsEditing(false);
      }
    } catch (error) {
      toast.error("Failed to update client");
    } finally {
      setIsSaving(false);
    }
  };

  const filteredClients = (clients || []).filter(c => {
    if (!c) return false;
    const companyName = c.companyName || c.name || '';
    const spocName = c.spocName || '';
    const matchesSearch = 
      companyName.toLowerCase().includes(search.toLowerCase()) ||
      spocName.toLowerCase().includes(search.toLowerCase());
    if (!matchesSearch) return false;
    if (dateFilter.filterType === 'all') return true;
    const createdAt = c.createdAt || c.joiningDate;
    if (!createdAt) return true;
    const clientDate = new Date(createdAt).toDateString();
    if (dateFilter.filterType === 'today') return clientDate === new Date().toDateString();
    if (dateFilter.filterType === 'last7days') {
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        return new Date(createdAt) >= sevenDaysAgo;
    }
    return true;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Onboarding Form Modal */}
      <ClientOnboardingForm 
        isOpen={isOnboardingOpen}
        onClose={() => setIsOnboardingOpen(false)}
        onComplete={handleOnboardingSubmit}
        mode="full"
        initialData={selectedClient}
      />

      {/* Client Detail Drawer */}
      {createPortal(
        <AnimatePresence>
          {viewingClient && (
            <div key="client-drawer-portal" className="fixed inset-0 z-[1100]">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => {
                    setViewingClient(null);
                    setIsEditing(false);
                }}
                className="absolute inset-0 bg-[#1A1A2E]/40 backdrop-blur-md"
              />
              <motion.div
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                className="absolute inset-y-0 right-0 w-full max-w-[520px] bg-white shadow-2xl flex flex-col border-l border-[#F4F3EF]"
              >
                {/* Header */}
                <div className="px-10 py-10 border-b border-[#F4F3EF] flex items-center justify-between">
                  <div className="flex flex-col gap-1">
                    <h2 className="text-2xl font-black text-[#1A1A2E]" style={{ fontFamily: '"Syne", sans-serif' }}>Client Detail</h2>
                    {isEditing && <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">Editing Mode</p>}
                  </div>
                  <div className="flex gap-4">
                    {!isEditing ? (
                      <button
                        onClick={() => {
                            setIsEditing(true);
                            setEditForm(viewingClient);
                        }}
                        className="w-12 h-12 rounded-xl bg-blue-50 text-[#1B4DA0] flex items-center justify-center hover:bg-blue-100 transition-all shadow-sm"
                      >
                        <FiEdit2 size={20} />
                      </button>
                    ) : (
                      <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center hover:bg-emerald-100 transition-all shadow-sm"
                      >
                        {isSaving ? <FiRefreshCw className="animate-spin" size={20} /> : <FiSave size={20} />}
                      </button>
                    )}
                    <button
                      onClick={() => {
                        setViewingClient(null);
                        setIsEditing(false);
                      }}
                      className="w-12 h-12 rounded-xl bg-[#F4F3EF] text-[#6B6B7E] flex items-center justify-center hover:bg-rose-50 hover:text-rose-500 transition-all shadow-sm"
                    >
                      <FiX size={24} />
                    </button>
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-10 space-y-10 custom-scrollbar">
                  <div className="flex flex-col items-center">
                    <div
                      className="w-24 h-24 rounded-[40px] flex items-center justify-center text-3xl font-black shadow-xl mb-6 border-2 border-white ring-4 ring-[#EEF2FB]"
                      style={{ backgroundColor: '#EEF2FB', color: '#1B4DA0' }}
                    >
                      {(editForm.companyName || viewingClient.companyName || '?').slice(0, 2).toUpperCase()}
                    </div>
                    {isEditing ? (
                      <div className="w-full max-w-[300px] space-y-4">
                        <input
                          className="w-full text-center text-2xl font-black text-[#1A1A2E] bg-slate-50 rounded-xl py-2 border border-slate-100 outline-none focus:ring-2 focus:ring-blue-100 transition-all font-syne"
                          value={editForm.companyName || ''}
                          onChange={(e) => handleEditChange('companyName', e.target.value)}
                          placeholder="Company Name"
                        />
                        <input
                          className="w-full text-center text-[11px] font-black text-[#1B4DA0] uppercase tracking-[3px] bg-white border-b border-dashed border-slate-200 outline-none hover:border-blue-300 transition-colors"
                          value={editForm.industry || ''}
                          onChange={(e) => handleEditChange('industry', e.target.value)}
                          placeholder="Industry"
                        />
                      </div>
                    ) : (
                      <>
                        <h3 className="text-2xl font-black text-[#1A1A2E]">{viewingClient.companyName}</h3>
                        <p className="text-[11px] font-black text-[#1B4DA0] uppercase tracking-[3px] mt-1">{viewingClient.industry}</p>
                      </>
                    )}
                    <span className={`mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold ${(STAGE_STYLE[viewingClient.stage] || STAGE_STYLE['Onboarding Complete']).badge}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${(STAGE_STYLE[viewingClient.stage] || STAGE_STYLE['Onboarding Complete']).dot}`} />
                      {(STAGE_STYLE[viewingClient.stage] || STAGE_STYLE['Onboarding Complete']).label || viewingClient.stage}
                      {(STAGE_STYLE[viewingClient.stage] || STAGE_STYLE['Onboarding Complete']).icon && <FiCheck size={14} className="shrink-0" />}
                    </span>
                  </div>

                  {/* Info Table */}
                  <div className="bg-[#FAFAF9] rounded-[48px] border border-[#F4F3EF] p-10 space-y-8">
                    {[
                      { label: 'SPOC Name', key: 'spocName', val: viewingClient.spocName, icon: <FiUser size={14} /> },
                      { label: 'Assigned KAM', key: 'assignKAM', val: viewingClient.assignKAM || 'Not Assigned', icon: <FiUser size={14} />, highlight: true },
                      { label: 'Location', key: 'location', val: viewingClient.location || '—', icon: <FiMapIcon size={14} /> },
                      { label: 'GST Number', key: 'gstNumber', val: viewingClient.gstNumber || '—', icon: <FiActivity size={14} /> },
                    ].map(({ label, key, val, icon, highlight }) => (
                      <div key={label} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${highlight ? 'bg-[#1B4DA0]/10 text-[#1B4DA0]' : 'bg-white text-[#9B9BAD] shadow-sm'}`}>
                            {icon}
                          </div>
                          <span className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-[3px]">{label}</span>
                        </div>
                        {isEditing ? (
                          <input
                            className={`text-[13px] font-black text-right bg-white px-3 py-1 rounded-lg border border-slate-100 outline-none focus:ring-2 focus:ring-blue-50 transition-all ${highlight ? 'text-[#1B4DA0]' : 'text-[#1A1A2E]'}`}
                            value={editForm[key] || ''}
                            onChange={(e) => handleEditChange(key, e.target.value)}
                          />
                        ) : (
                          <span className={`text-[13px] font-black ${highlight ? 'text-[#1B4DA0]' : 'text-[#1A1A2E]'}`}>{val}</span>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Additional Sections */}
                  <div className="space-y-8">
                    {/* Agreement & Compliance */}
                    <div className="space-y-4">
                      <h4 className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-[3px] ml-4">Agreement & Compliance</h4>
                      <div className="grid grid-cols-2 gap-4">
                        {[
                          { label: 'Agreement', key: 'agreementType' },
                          { label: 'Effective', key: 'agreementEffectiveDate' },
                          { label: 'Fee', key: 'feeAmount' },
                          { label: 'Payment', key: 'paymentTerms' },
                          { label: 'MSME', key: 'msmeRegistered' },
                          { label: 'Shops', key: 'shopsLicense' },
                        ].map(field => (
                          isEditing ? (
                            <div key={field.key} className="p-4 bg-white rounded-2xl border-2 border-dashed border-slate-100 space-y-1 hover:border-blue-200 transition-all group/field">
                              <p className="text-[9px] font-black text-[#9B9BAD] uppercase tracking-wider group-hover/field:text-blue-400 transition-colors">{field.label}</p>
                              <input
                                className="w-full text-[13px] font-bold text-[#1A1A2E] bg-transparent outline-none"
                                value={editForm[field.key] || ''}
                                onChange={(e) => handleEditChange(field.key, e.target.value)}
                              />
                            </div>
                          ) : (
                            <DetailCard key={field.key} label={field.label} value={viewingClient[field.key]} />
                          )
                        ))}
                      </div>
                    </div>

                    {/* Payroll & Workforce */}
                    <div className="space-y-4">
                      <h4 className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-[3px] ml-4">Payroll & Workforce</h4>
                      <div className="grid grid-cols-2 gap-4">
                        {[
                          { label: 'Employees', key: 'totalEmployees' },
                          { label: 'Cycle', key: 'payrollCycle' },
                          { label: 'PF', key: 'pfApplicable' },
                          { label: 'ESIC', key: 'esicApplicable' },
                        ].map(field => (
                          isEditing ? (
                            <div key={field.key} className="p-4 bg-[#FAFAF9] rounded-2xl border border-[#F4F3EF] space-y-1">
                              <p className="text-[9px] font-black text-[#9B9BAD] uppercase tracking-wider">{field.label}</p>
                              <input
                                className="w-full text-[13px] font-bold text-[#1A1A2E] bg-transparent outline-none"
                                value={editForm[field.key] || ''}
                                onChange={(e) => handleEditChange(field.key, e.target.value)}
                              />
                            </div>
                          ) : (
                            <DetailCard key={field.key} label={field.label} value={viewingClient[field.key]} />
                          )
                        ))}
                      </div>
                    </div>

                    {/* Notes */}
                    {(viewingClient.onboardingNotes || isEditing) && (
                      <div className="p-6 bg-[#FAFAF9] rounded-3xl border border-[#F4F3EF] space-y-2">
                        <h4 className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-[3px]">Onboarding Notes</h4>
                        {isEditing ? (
                          <textarea
                            className="w-full text-sm text-[#4B4B5E] leading-relaxed bg-white p-4 rounded-2xl border border-slate-100 outline-none focus:ring-2 focus:ring-blue-50 min-h-[100px] transition-all"
                            value={editForm.onboardingNotes || ''}
                            onChange={(e) => handleEditChange('onboardingNotes', e.target.value)}
                            placeholder="Add internal notes about this client..."
                          />
                        ) : (
                          <p className="text-sm text-[#4B4B5E] leading-relaxed italic">"{viewingClient.onboardingNotes}"</p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>,
        document.body
      )}

      {/* Header Info */}
      <div className="flex items-center justify-between mb-2">
        <div className="text-left">
          <h2 className="text-2xl font-bold text-[#1A1A2E]" style={{ fontFamily: "'Syne', sans-serif" }}>Pending Onboarding</h2>
          <p className="text-[11px] font-black text-[#9B9BAD] uppercase tracking-[0.2em] mt-1">
            {clients.length} Clients awaiting final setup
          </p>
        </div>
      </div>

      {/* Standardized Search & Filter Bar */}
      <div className="bg-white border border-[#F4F3EF] rounded-[24px] p-2 shadow-sm mb-8 flex items-center gap-3 flex-wrap lg:flex-nowrap">
        {/* Search Field */}
        <div className="relative flex-[2.5] group min-w-[200px]">
          <FiSearch className="absolute left-6 top-1/2 -translate-y-1/2 text-[#9B9BAD]" size={18} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by company or SPOC..."
            className="w-full bg-[#F4F3EF] border-none rounded-2xl py-4 pl-16 pr-6 text-sm font-bold text-[#1A1A2E] focus:ring-2 focus:ring-[#1B4DA0]/5 outline-none transition-all placeholder:text-[#9B9BAD] placeholder:font-bold"
          />
        </div>

        {/* Date Filter (Standardized UI) */}
        <div className="relative flex-1 group min-w-[140px]">
          <select
            value={dateFilter.filterType}
            onChange={(e) => setDateFilter({ ...dateFilter, filterType: e.target.value })}
            className="w-full bg-[#F4F3EF] text-[10px] font-black uppercase tracking-widest text-[#1A1A2E] rounded-2xl pl-6 pr-12 py-4 outline-none border-0 cursor-pointer appearance-none hover:bg-[#EEF2FB] transition-all"
          >
            <option value="all">All Date</option>
            <option value="today">Today</option>
            <option value="last7days">Last 7 Days</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
          </select>
          <FiChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 text-[#1B4DA0] opacity-50 group-hover:opacity-100 transition-all pointer-events-none" size={14} />
        </div>
      </div>

      <div className="bg-white rounded-[32px] shadow-sm border border-[#F4F3EF] overflow-hidden">
        <div className="overflow-x-auto min-h-[400px]">
          <div className="grid grid-cols-[1.5fr_1.2fr_1.2fr_1fr_1fr_140px] gap-4 px-10 py-5 border-b border-[#F4F3EF] bg-gray-50/50">
            <div className="text-[11px] font-bold text-[#9B9BAD] uppercase tracking-widest text-left">Company</div>
            <div className="text-[11px] font-bold text-[#9B9BAD] uppercase tracking-widest text-left">SPOC Details</div>
            <div className="text-[11px] font-bold text-[#9B9BAD] uppercase tracking-widest text-left">Location</div>
            <div className="text-[11px] font-bold text-[#9B9BAD] uppercase tracking-widest text-left">Joined</div>
            <div className="text-[11px] font-bold text-[#9B9BAD] uppercase tracking-widest text-center">Status</div>
            <div className="text-[11px] font-bold text-[#9B9BAD] uppercase tracking-widest text-left">Action</div>
          </div>

          {loading ? (
            <div className="py-20 text-center">
              <FiRefreshCw className="w-8 h-8 text-[#1B4DA0] animate-spin mx-auto mb-4" />
              <p className="text-[11px] font-black text-[#9B9BAD] uppercase tracking-[3px]">Loading pending clients...</p>
            </div>
          ) : filteredClients.length === 0 ? (
            <div className="py-20 text-center flex flex-col items-center">
              <div className="w-20 h-20 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-500 mb-4">
                <FiUsers size={32} />
              </div>
              <p className="text-[11px] font-black text-[#9B9BAD] uppercase tracking-[3px]">No pending onboardings found</p>
            </div>
          ) : filteredClients.map(c => {
            const companyDisplay = c.companyName || c.name || 'Unknown';
            const industryDisplay = c.industry || 'General';
            const createdAt = c.createdAt || c.joiningDate;
            const dateStr = createdAt ? new Date(createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }) : 'N/A';
            const yearStr = createdAt ? new Date(createdAt).getFullYear() : '';

            return (
              <div key={c.id || Math.random()} className="grid grid-cols-[1.5fr_1.2fr_1.2fr_1fr_1fr_140px] gap-4 items-center px-10 py-8 border-b border-[#F4F3EF] last:border-0 hover:bg-[#F8FAFF] transition-all group">
                <div 
                  className="flex items-center gap-4 text-left cursor-pointer"
                  onClick={() => setViewingClient(c)}
                >
                  <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-blue-50 to-[#F4F3EF] flex items-center justify-center text-[#1B4DA0] font-black border border-[#F4F3EF] shrink-0 group-hover:scale-110 transition-transform">
                    {companyDisplay.charAt(0)}
                  </div>
                  <div className="min-w-0 text-left">
                    <p className="text-[14px] font-bold text-[#1A1A2E] truncate group-hover:text-[#1B4DA0] transition-colors">{companyDisplay}</p>
                    <p className="text-[10px] font-bold text-[#9B9BAD] uppercase tracking-wider mt-0.5">{industryDisplay}</p>
                  </div>
                </div>

                <div className="flex flex-col text-left">
                  <p className="text-[13px] font-bold text-[#1A1A2E]">{c.spocName || 'N/A'}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <FiPhone size={10} className="text-[#1B4DA0]" />
                    <p className="text-[11px] font-medium text-[#6B6B7E]">{c.contactNumber || 'N/A'}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-[#6B6B7E] text-left">
                  <FiMapIcon size={14} className="text-[#9B9BAD] shrink-0" />
                  <p className="text-[12px] font-medium truncate">{c.location || c.city || 'Pan India'}</p>
                </div>

                <div className="flex flex-col text-left">
                  <p className="text-[12px] font-bold text-[#1A1A2E]">{dateStr}</p>
                  <p className="text-[10px] font-medium text-[#9B9BAD] uppercase mt-0.5">{yearStr}</p>
                </div>

                <div className="flex justify-center">
                  {c.stage === 'Onboarding Complete' ? (
                    <span className="px-4 py-1.5 rounded-full bg-emerald-50 text-emerald-600 text-[10px] font-bold uppercase tracking-wider border border-emerald-100/50 flex items-center gap-1.5 w-fit">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      Onboarding Complete
                    </span>
                  ) : (
                    <span className="px-4 py-1.5 rounded-full bg-amber-50 text-amber-600 text-[10px] font-bold uppercase tracking-wider border border-amber-100/50 flex items-center gap-1.5 w-fit">
                      <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                      Setup Pending
                    </span>
                  )}
                </div>

                <div className="text-left">
                  {c.stage !== 'Onboarding Complete' && (
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedClient(c);
                        setIsOnboardingOpen(true);
                      }}
                      className="flex items-center gap-2 px-5 py-2.5 bg-[#F4F3EF] text-[#1B4DA0] rounded-xl hover:bg-[#1B4DA0] hover:text-white transition-all shadow-sm active:scale-95 text-[11px] font-black uppercase tracking-widest"
                    >
                      <FiCheckCircle size={15} /> Complete
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default CompleteOnboardingTab;
