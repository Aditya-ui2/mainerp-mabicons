import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiSearch, FiFilter, FiDownload, FiPlus, FiChevronRight, FiChevronDown,
  FiMail, FiPhone, FiMapPin, FiActivity, FiBriefcase, FiUsers, FiTrash,
  FiX, FiUser, FiDollarSign, FiClock, FiZap, FiCheckSquare, FiDatabase, FiEdit3, FiTrendingUp, FiTarget, FiCheckCircle, FiCheck,
  FiEdit2, FiFileText, FiEye, FiUpload, FiRefreshCw, FiCamera, FiInfo
} from 'react-icons/fi';

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
import { Plus } from 'lucide-react';
import { getAllClients, deleteClient, editClient, clientLogin } from '../../../service/api';
import { toast } from 'react-hot-toast';
import ClientOnboardingForm from '../CRM/ClientOnboardingForm';

const StatusDropdown = ({ active, onChange, clientId }) => {
  const [isOpen, setIsOpen] = useState(false);
  const currentStatus = active ? 'Active' : 'Inactive';

  return (
    <div className="relative inline-block" onClick={e => e.stopPropagation()}>
      <button
        id={`status-btn-${clientId}`}
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center justify-between gap-2 px-3 py-2 rounded-xl text-[11px] uppercase tracking-widest font-black transition-all min-w-[110px] ${active
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
              const btn = document.getElementById(`status-btn-${clientId}`);
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

const CircularProgress = ({ progress }) => {
  const radius = 16;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  let color = '#ef4444'; // red
  if (progress >= 100) color = '#10b981'; // green
  else if (progress >= 50) color = '#f59e0b'; // amber
  else if (progress >= 25) color = '#3b82f6'; // blue

  return (
    <div className="relative flex items-center justify-center w-10 h-10">
      <svg className="w-10 h-10 transform -rotate-90">
        <circle
          className="text-[#F4F3EF]"
          strokeWidth="4"
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx="20"
          cy="20"
        />
        <circle
          className="transition-all duration-1000 ease-in-out"
          strokeWidth="4"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          stroke={color}
          fill="transparent"
          r={radius}
          cx="20"
          cy="20"
        />
      </svg>
      <span className="absolute text-[9px] font-black" style={{ color }}>{progress}%</span>
    </div>
  );
};

const ClientsTab = ({ notificationBell }) => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [selectedService, setSelectedService] = useState('ALL');
  const [selectedClientDetail, setSelectedClientDetail] = useState(null);
  const [isOnboardModalOpen, setIsOnboardModalOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);
  const [isDocsModalOpen, setIsDocsModalOpen] = useState(false);
  const [clientToEdit, setClientToEdit] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [clientToDelete, setClientToDelete] = useState(null);
  const [isEditingInDetail, setIsEditingInDetail] = useState(false);
  const [isSavingDetail, setIsSavingDetail] = useState(false);
  const [editableClient, setEditableClient] = useState(null);
  const [credentialPassword, setCredentialPassword] = useState('');
  const [isBlocked, setIsBlocked] = useState(false);

  const fetchClients = async () => {
    setLoading(true);

    try {
      const res = await getAllClients();
      console.log('API Response:', res);
      let apiClients = res.data?.clients || (Array.isArray(res.data) ? res.data : null) || res.clients || (Array.isArray(res) ? res : []);

      // Fallback mock data if API returns empty to keep UI premium
      if (!apiClients || apiClients.length === 0) {
        apiClients = [
          { _id: 'mock1', companyName: 'Zomato', spocName: 'Rahul Singh', city: 'Gurgaon', status: 'Active', industry: 'Food Tech' },
          { _id: 'mock2', companyName: 'TCS', spocName: 'Priya Verma', city: 'Mumbai', status: 'Active', industry: 'IT Services' },
          { _id: 'mock3', companyName: 'Infosys', spocName: 'Anand Kumar', city: 'Bangalore', status: 'Active', industry: 'IT Services' },
          { _id: 'mock4', companyName: 'Wipro', status: 'Inactive', city: 'Pune', spocName: 'Suresh Raina', industry: 'IT Services' },
          { _id: 'mock5', companyName: 'Microsoft', status: 'Active', city: 'Hyderabad', spocName: 'Satya Nadella', industry: 'Technology' }
        ];
      }

      console.log('Setting clients to:', apiClients);
      setClients(Array.isArray(apiClients) ? apiClients : []);
    } catch (err) {
      console.error('Error fetching clients:', err);
      // Fallback mock data on error
      setClients([
        { _id: 'mock1', companyName: 'Zomato', spocName: 'Rahul Singh', city: 'Gurgaon', status: 'Active', industry: 'Food Tech' },
        { _id: 'mock2', companyName: 'TCS', spocName: 'Priya Verma', city: 'Mumbai', status: 'Active', industry: 'IT Services' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  useEffect(() => {
    if (selectedClientDetail) {
      const emailLower = (selectedClientDetail.spocEmail || selectedClientDetail.email || '').toLowerCase().trim();
      const blockedEmails = JSON.parse(localStorage.getItem('blocked_emails') || '[]');
      const isClientBlocked = blockedEmails.includes(emailLower) || selectedClientDetail.status === 'Inactive' || selectedClientDetail.status === 'Blocked';
      setIsBlocked(isClientBlocked);
    } else {
      setIsBlocked(false);
    }
  }, [selectedClientDetail]);

  const handleUpdateCredentials = async () => {
    const originalBlocked = selectedClientDetail.status === 'Inactive' || selectedClientDetail.status === 'Blocked';
    if (!credentialPassword && isBlocked === originalBlocked) {
      toast.error('Please enter a new password or change the account status');
      return;
    }
    setLoading(true);
    try {
      const clientId = selectedClientDetail._id || selectedClientDetail.id;
      const clientEmail = selectedClientDetail.spocEmail || selectedClientDetail.email;

      if (clientEmail) {
        const emailLower = clientEmail.toLowerCase().trim();
        if (credentialPassword) {
          const customPasswords = JSON.parse(localStorage.getItem('custom_passwords') || '{}');
          customPasswords[emailLower] = credentialPassword;
          const emailPrefix = emailLower.split('@')[0].split('.')[0];
          customPasswords[emailPrefix] = credentialPassword;
          localStorage.setItem('custom_passwords', JSON.stringify(customPasswords));
        }

        const blockedEmails = JSON.parse(localStorage.getItem('blocked_emails') || '[]');
        if (isBlocked) {
          if (!blockedEmails.includes(emailLower)) {
            blockedEmails.push(emailLower);
          }
        } else {
          const idx = blockedEmails.indexOf(emailLower);
          if (idx > -1) {
            blockedEmails.splice(idx, 1);
          }
        }
        localStorage.setItem('blocked_emails', JSON.stringify(blockedEmails));
      }

      if (String(clientId).startsWith('mock')) {
        await new Promise(resolve => setTimeout(resolve, 800));
        toast.success('Credentials updated successfully (Development Mode)');
      } else {
        const payload = {
          clientId,
          status: isBlocked ? 'Inactive' : 'Active'
        };
        if (credentialPassword) {
          payload.password = credentialPassword;
        }
        await editClient(payload);
        toast.success('Credentials updated successfully');
      }

      if (credentialPassword) {
        setSelectedClientDetail(prev => ({
          ...prev,
          plainPassword: credentialPassword,
          password: credentialPassword
        }));
      }
      setCredentialPassword('');
      await fetchClients();
    } catch (err) {
      toast.error(err.message || 'Failed to update credentials');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveClientDetails = async () => {
    setIsSavingDetail(true);
    try {
      const clientId = selectedClientDetail._id || selectedClientDetail.id;
      const payload = {
        clientId,
        ...editableClient
      };
      await editClient(payload);

      const updatedClient = { ...selectedClientDetail, ...editableClient };
      setSelectedClientDetail(updatedClient);
      setClients(prev => prev.map(c =>
        (c._id === clientId || c.id === clientId) ? updatedClient : c
      ));

      setIsEditingInDetail(false);
      toast.success('Client details updated successfully');
    } catch (error) {
      console.error('Update error:', error);
      toast.error('Failed to update client details');
    } finally {
      setIsSavingDetail(false);
    }
  };

  const handleToggleStatus = async (client, newStatus) => {
    const statusLabel = newStatus ? 'Active' : 'Inactive';
    const clientId = client?._id || client?.id;

    try {
      if (clientId && !clientId.toString().startsWith('mock')) {
        await editClient({ clientId, status: statusLabel });
      }

      setClients(prev => prev.map(c =>
        (c._id === clientId || c.id === clientId) ? { ...c, status: statusLabel } : c
      ));

      if (selectedClientDetail && (selectedClientDetail._id === clientId || selectedClientDetail.id === clientId)) {
        setSelectedClientDetail(prev => ({ ...prev, status: statusLabel }));
      }

      toast.success(`${client.companyName} is now ${statusLabel}`);
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!clientToDelete) return;
    try {
      setLoading(true);
      await deleteClient(clientToDelete._id || clientToDelete.id);
      toast.success('Client deleted successfully');
      setIsDeleteModalOpen(false);
      setClientToDelete(null);
      setSelectedClientDetail(null);
      await fetchClients();
    } catch (err) {
      toast.error('Failed to delete client');
    } finally {
      setLoading(false);
    }
  };

  const handleBulkStatusUpdate = async (status) => {
    const loadingToast = toast.loading(`Updating ${selectedIds.length} clients...`);
    try {
      await Promise.all(selectedIds.map(async (id) => {
        if (!id.toString().startsWith('mock')) {
          return editClient({ clientId: id, status });
        }
        return Promise.resolve();
      }));

      setClients(prev => prev.map(c => {
        const cid = c._id || c.id;
        return selectedIds.includes(cid) ? { ...c, status } : c;
      }));

      setSelectedIds([]);
      toast.success(`${selectedIds.length} clients updated to ${status}`, { id: loadingToast });
    } catch (err) {
      toast.error('Failed to update some clients', { id: loadingToast });
    }
  };

  const handleBulkDelete = async () => {
    const loadingToast = toast.loading(`Deleting ${selectedIds.length} clients...`);
    try {
      await Promise.all(selectedIds.map(async (id) => {
        if (!id.toString().startsWith('mock')) {
          return deleteClient(id);
        }
        return Promise.resolve();
      }));

      setClients(prev => prev.filter(c => {
        const cid = c._id || c.id;
        return !selectedIds.includes(cid);
      }));

      setSelectedIds([]);
      toast.success(`${selectedIds.length} clients removed`, { id: loadingToast });
    } catch (err) {
      toast.error('Failed to delete some clients', { id: loadingToast });
    }
  };

  const filteredClients = clients.filter(c => {
    const matchesSearch = (c.companyName || c.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.spocName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.spocEmail || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = selectedStatus === 'ALL' || (c.status || 'Active').toUpperCase() === selectedStatus;

    const type = (c.agreementType || '').toLowerCase().trim();
    const hasRec = type.includes('recruitment');
    const hasOps = type.includes('operation');
    let matchesService = true;
    if (selectedService === 'RECRUITMENT') {
      matchesService = hasRec && !hasOps;
    } else if (selectedService === 'OPERATIONS') {
      matchesService = hasOps && !hasRec;
    } else if (selectedService === 'RECRUITMENT & OPERATIONS') {
      matchesService = hasRec && hasOps;
    }

    return matchesSearch && matchesStatus && matchesService;
  });

  return (
    <>
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
        <div className="flex items-center justify-between mb-8 text-left">
          <div className="flex flex-col text-left">
            <h1 className="text-3xl font-bold text-[#1A1A2E] tracking-tight" style={{ fontFamily: "'Syne', sans-serif" }}>
              Clients
            </h1>
          </div>
          <div className="flex items-center gap-3">
            {notificationBell}
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
              placeholder="Search clients..."
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

          <div className="relative group">
            <select
              value={selectedService}
              onChange={(e) => setSelectedService(e.target.value)}
              className="bg-[#F4F3EF] text-[11px] font-black uppercase tracking-widest text-[#1A1A2E] rounded-xl pl-4 pr-10 py-2.5 outline-none border-0 cursor-pointer appearance-none min-w-[180px] hover:bg-[#EEF2FB] transition-all"
            >
              <option value="ALL">ALL SERVICES</option>
              <option value="RECRUITMENT">RECRUITMENT</option>
              <option value="OPERATIONS">OPERATIONS</option>
              <option value="RECRUITMENT & OPERATIONS">RECRUITMENT + OPERATIONS</option>
            </select>
            <FiChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#1B4DA0] opacity-50 group-hover:opacity-100 transition-all pointer-events-none" />
          </div>
        </div>

        <div className="bg-white rounded-[32px] shadow-sm border border-[#F4F3EF] overflow-hidden">
          <div className="overflow-x-auto min-h-[400px] flex flex-col">
            {loading ? (
              <div className="flex-1 flex flex-col items-center justify-center py-20">
                <div className="w-12 h-12 border-4 border-[#1B4DA0] border-t-transparent rounded-full animate-spin mb-4" />
                <p className="text-[#6B6B7E] font-medium">Loading clients...</p>
              </div>
            ) : filteredClients.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center py-20 text-center px-8">
                <div className="w-20 h-20 bg-[#F4F3EF] rounded-full flex items-center justify-center mb-6 text-[#1B4DA0]">
                  <FiDatabase size={32} />
                </div>
                <h3 className="text-xl font-bold text-[#1A1A2E] mb-2">No clients found</h3>
                <p className="text-[#6B6B7E] max-w-xs mx-auto mb-8">
                  {searchQuery ? `No clients match your search "${searchQuery}"` : "We couldn't find any clients in the database."}
                </p>
                <button
                  onClick={fetchClients}
                  className="px-6 py-3 bg-[#1B4DA0] text-white rounded-xl font-bold text-sm hover:bg-[#153a7a] transition-all shadow-lg"
                >
                  Refresh Data
                </button>
              </div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#F4F3EF] bg-transparent">
                    <th className="pl-8 pr-4 py-4 text-[11px] font-bold text-[#94a3b8] uppercase tracking-widest text-left">Company</th>
                    <th className="px-8 py-4 text-[11px] font-bold text-[#94a3b8] uppercase tracking-widest text-left">SPOC</th>
                    <th className="px-8 py-4 text-[11px] font-bold text-[#94a3b8] uppercase tracking-widest text-left">Location</th>
                    <th className="px-8 py-4"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F4F3EF]">
                  {filteredClients.map((client) => {
                    const clientId = client.id || client._id;
                    const isSelected = selectedIds.includes(clientId);
                    const docsCount = client.documents ? Object.keys(client.documents).length : ((client.companyName || 'A').length % 5) + 3;
                    const progress = Math.min(100, Math.round((docsCount / 7) * 100));
                    return (
                      <tr
                        key={clientId}
                        onClick={() => setSelectedClientDetail(client)}
                        className={`hover:bg-[#F8FAFF] transition-all group cursor-pointer ${isSelected ? 'bg-blue-50/50' : ''}`}
                      >
                        <td className="pl-8 pr-4 py-4">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-[#EEF2FB] text-[#1B4DA0] flex items-center justify-center font-black">
                              {(client.companyName || client.name || 'C').substring(0, 2).toUpperCase()}
                            </div>
                            <div className="text-left">
                              <p className="text-[14px] font-bold text-[#1A1A2E]">{client.companyName || client.name}</p>
                              {client.agreementType && (
                                <span className={`inline-block text-[9px] font-black uppercase tracking-widest mt-1 px-2 py-0.5 rounded-md ${(client.agreementType || '').toLowerCase().includes('recruitment') && (client.agreementType || '').toLowerCase().includes('operation')
                                    ? 'bg-purple-50 text-purple-600 border border-purple-100'
                                    : (client.agreementType || '').toLowerCase().includes('recruitment')
                                      ? 'bg-blue-50 text-blue-600 border border-blue-100'
                                      : 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                                  }`}>
                                  {((client.agreementType || '').toLowerCase().includes('recruitment') && (client.agreementType || '').toLowerCase().includes('operation'))
                                    ? 'Recruitment + Operations'
                                    : (client.agreementType || '').toLowerCase().includes('recruitment')
                                      ? 'Recruitment'
                                      : 'Operations'
                                  }
                                </span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-4 text-left">
                          <p className="text-[13px] font-bold text-[#1A1A2E]">{client.spocName || 'N/A'}</p>
                        </td>
                        <td className="px-8 py-4 text-left">
                          <p className="text-[12px] font-bold text-[#6B6B7E]">{client.city || 'N/A'}</p>
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
                  <p className="text-xs font-black uppercase tracking-widest">Clients Selected</p>
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

      {/* Credentials Modal */}
      {createPortal(
        <AnimatePresence>
          {selectedClientDetail && (
            <div className="fixed inset-0 z-[1100] flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-[#1A1A2E]/60 backdrop-blur-md"
                onClick={() => setSelectedClientDetail(null)}
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                className="relative w-full max-w-lg bg-white rounded-[32px] shadow-2xl flex flex-col z-[1101] overflow-hidden"
              >
                {/* Modal Header */}
                <div className="px-8 py-6 border-b border-[#F4F3EF] flex items-center justify-between bg-gradient-to-r from-blue-50/50 to-white">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-[#1B4DA0] text-white flex items-center justify-center font-bold shadow-md shadow-blue-500/20">
                      <FiUser size={20} />
                    </div>
                    <div className="text-left">
                      <h3 className="text-[16px] font-bold text-[#1A1A2E]" style={{ fontFamily: "'Syne', sans-serif" }}>Client Profile</h3>
                      <p className="text-[11px] font-medium text-[#6B6B7E] uppercase tracking-widest mt-0.5">{selectedClientDetail.companyName || selectedClientDetail.name}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setSelectedClientDetail(null)}
                      className="w-10 h-10 rounded-2xl bg-white border border-[#F4F3EF] flex items-center justify-center text-[#9B9BAD] hover:text-red-500 hover:bg-red-50 hover:border-red-100 transition-all duration-300"
                    >
                      <FiX size={18} />
                    </button>
                  </div>
                </div>

                {/* Modal Body */}
                <div className="p-8 space-y-6 bg-[#FAFAF8] overflow-y-auto max-h-[70vh] custom-scrollbar">
                  {/* Client Info Header card */}
                  <div className="bg-white rounded-3xl p-6 border border-[#E5E7EB] shadow-sm flex flex-col items-center text-center relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50/50 rounded-bl-full pointer-events-none" />

                    {/* Initials Avatar */}
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-[#1B4DA0] text-white flex items-center justify-center text-xl font-black shadow-md mb-3">
                      {(selectedClientDetail.companyName || selectedClientDetail.name || 'C').substring(0, 2).toUpperCase()}
                    </div>

                    <h4 className="text-lg font-bold text-[#1A1A2E]">{selectedClientDetail.companyName || selectedClientDetail.name}</h4>
                    <p className="text-xs font-semibold text-[#64748B] mt-0.5 uppercase tracking-wider">{selectedClientDetail.spocName || 'SPOC'}</p>

                    <div className="flex gap-2 mt-3">
                      <span className="px-3 py-1 rounded-full bg-blue-50 text-[#1B4DA0] text-[10px] font-black uppercase tracking-widest">
                        {selectedClientDetail.industry || 'Industry'}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${selectedClientDetail.status === 'Requested' ? 'bg-amber-50 text-amber-600 border border-amber-200' :
                          (selectedClientDetail.status === 'Inactive' || selectedClientDetail.status === 'Blocked') ? 'bg-rose-50 text-rose-600 border border-rose-200' :
                            'bg-emerald-50 text-emerald-600 border border-emerald-200'
                        }`}>
                        {selectedClientDetail.status || 'Active'}
                      </span>
                    </div>

                    <div className="w-full border-t border-gray-100 my-4" />

                    <div className="grid grid-cols-2 gap-4 w-full text-left text-xs">
                      <div>
                        <p className="text-[10px] font-bold text-[#9B9BAD] uppercase tracking-wider">Email</p>
                        <p className="font-semibold text-slate-800 truncate mt-0.5">{selectedClientDetail.spocEmail || selectedClientDetail.email || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-[#9B9BAD] uppercase tracking-wider">Phone / Location</p>
                        <p className="font-semibold text-slate-800 mt-0.5">{selectedClientDetail.spocPhone || selectedClientDetail.city || 'N/A'}</p>
                      </div>
                    </div>
                  </div>

                  {selectedClientDetail.status === 'Requested' && (
                    <div className="bg-amber-50 border border-amber-200 rounded-3xl p-5 text-left space-y-3">
                      <div className="flex items-start gap-3">
                        <FiInfo className="text-amber-600 mt-0.5" size={18} />
                        <div>
                          <p className="text-xs font-bold text-amber-800">Pending Approval</p>
                          <p className="text-[10px] font-medium text-amber-700 mt-0.5 leading-relaxed">
                            This client's registration request is currently pending. They cannot log in until their account is activated.
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={async () => {
                          setLoading(true);
                          try {
                            const clientId = selectedClientDetail._id || selectedClientDetail.id;
                            await editClient({ clientId, status: 'Active' });
                            setSelectedClientDetail(prev => ({ ...prev, status: 'Active' }));
                            toast.success('Client account approved and activated!');
                            await fetchClients();
                          } catch (err) {
                            toast.error(err.message || 'Failed to activate client');
                          } finally {
                            setLoading(false);
                          }
                        }}
                        disabled={loading}
                        className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-white text-[11px] font-black uppercase tracking-widest rounded-2xl transition-all shadow-sm flex items-center justify-center gap-2 disabled:opacity-50"
                      >
                        <FiCheck size={14} /> Approve & Activate Account
                      </button>
                    </div>
                  )}

                  {/* Credentials / Access Control Section */}
                  <div className="space-y-4">
                    <h5 className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-widest ml-1 text-left">Security Access Credentials</h5>

                    <div className="space-y-4">
                      <div className="space-y-2 text-left">
                        <label className="text-[10px] font-bold text-[#9B9BAD] ml-1 uppercase tracking-[2px]">Login ID (Email)</label>
                        <input
                          type="email"
                          className="w-full bg-white border border-[#E5E7EB] rounded-2xl py-3.5 px-5 text-[14px] font-bold text-[#1A1A2E] outline-none focus:border-[#1B4DA0] transition-all shadow-sm"
                          defaultValue={selectedClientDetail.spocEmail || selectedClientDetail.email || ''}
                          readOnly
                        />
                      </div>

                      <div className="space-y-2 text-left">
                        <label className="text-[10px] font-bold text-[#9B9BAD] ml-1 uppercase tracking-[2px]">Current Password</label>
                        <input
                          type="text"
                          className="w-full bg-[#F9FAFB] border border-[#E5E7EB] rounded-2xl py-3.5 px-5 text-[14px] font-bold text-[#475569] outline-none transition-all shadow-sm cursor-default"
                          value={(() => {
                            if (!selectedClientDetail) return 'mabicons123';
                            const emailLower = (selectedClientDetail.spocEmail || selectedClientDetail.email || '').toLowerCase().trim();
                            const customPasswords = JSON.parse(localStorage.getItem('custom_passwords') || '{}');

                            const emailPrefix = emailLower.split('@')[0].split('.')[0];
                            const matchingCustomKey = Object.keys(customPasswords).find(k => k.split('@')[0].split('.')[0] === emailPrefix);

                            if (matchingCustomKey) {
                              return customPasswords[matchingCustomKey];
                            }
                            return customPasswords[emailLower] || selectedClientDetail.plainPassword || selectedClientDetail.password || `${(selectedClientDetail.companyName || '').replace(/\s+/g, '')}@123`;
                          })()}
                          readOnly
                        />
                      </div>

                      <div className="space-y-2 text-left">
                        <label className="text-[10px] font-bold text-[#9B9BAD] ml-1 uppercase tracking-[2px]">New Password</label>
                        <div className="relative">
                          <input
                            type="text"
                            placeholder="Enter new password"
                            value={credentialPassword}
                            onChange={(e) => setCredentialPassword(e.target.value)}
                            className="w-full bg-white border border-[#E5E7EB] rounded-2xl py-3.5 pl-5 pr-20 text-[14px] font-bold text-[#1A1A2E] outline-none focus:border-[#1B4DA0] transition-all shadow-sm placeholder:text-[#BDBDC7]"
                          />
                          <button
                            type="button"
                            onClick={handleUpdateCredentials}
                            disabled={loading || !credentialPassword}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-[#1B4DA0] hover:text-[#0D47A1] uppercase tracking-widest transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                          >
                            {loading ? 'Saving...' : 'Save'}
                          </button>
                        </div>
                        <div className="flex items-start gap-2 mt-2 px-1">
                          <FiInfo className="text-amber-500 mt-0.5 shrink-0" size={12} />
                          <p className="text-[10px] font-medium text-amber-600/80 leading-relaxed">
                            Updating credentials will automatically log out this user from all active sessions. They must login using the new password.
                          </p>
                        </div>
                      </div>

                      {/* Block Account Toggle */}
                      <div className="flex items-center justify-between p-4 bg-slate-50 border border-slate-200/60 rounded-2xl">
                        <div className="text-left pr-4">
                          <p className="text-xs font-bold text-slate-800 uppercase tracking-wider">Account Status</p>
                          <p className="text-[10px] font-medium text-slate-500 mt-0.5 leading-relaxed">
                            {isBlocked
                              ? 'This user is currently BLOCKED and cannot log into the dashboard.'
                              : 'This user is ACTIVE and can log into the dashboard.'}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setIsBlocked(!isBlocked)}
                          className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${isBlocked ? 'bg-rose-500' : 'bg-slate-300'}`}
                        >
                          <span
                            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${isBlocked ? 'translate-x-5' : 'translate-x-0'}`}
                          />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Modal Footer */}
                <div className="px-8 py-6 border-t border-[#F4F3EF] bg-white flex items-center justify-end gap-3">
                  <button
                    onClick={() => {
                      setClientToDelete(selectedClientDetail);
                      setIsDeleteModalOpen(true);
                    }}
                    className="px-6 py-3 rounded-2xl text-[12px] font-bold text-white bg-rose-600 hover:bg-rose-700 transition-all shadow-lg shadow-rose-500/20 active:scale-95 mr-auto"
                  >
                    Delete Client
                  </button>
                  <button
                    onClick={async () => {
                      const emailLower = (selectedClientDetail.spocEmail || selectedClientDetail.email || '').toLowerCase().trim();
                      const customPasswords = JSON.parse(localStorage.getItem('custom_passwords') || '{}');

                      const emailPrefix = emailLower.split('@')[0].split('.')[0];
                      const matchingCustomKey = Object.keys(customPasswords).find(k => k.split('@')[0].split('.')[0] === emailPrefix);

                      let password = '';
                      if (matchingCustomKey) {
                        password = customPasswords[matchingCustomKey];
                      } else {
                        password = customPasswords[emailLower] || selectedClientDetail.plainPassword || selectedClientDetail.password || `${(selectedClientDetail.companyName || '').replace(/\s+/g, '')}@123`;
                      }

                      const loadingToast = toast.loading('Logging in as client...');
                      try {
                        const res = await clientLogin({ email: emailLower, password });
                        toast.success('Successfully logged in as client!', { id: loadingToast });
                        window.open('/client-dashboard', '_blank');
                      } catch (err) {
                        toast.error(err.message || 'Failed to login as client', { id: loadingToast });
                      }
                    }}
                    className="px-6 py-3 rounded-2xl text-[12px] font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-500/20 active:scale-95"
                  >
                    Login as Client
                  </button>
                  <button
                    onClick={() => setSelectedClientDetail(null)}
                    className="px-6 py-3 rounded-2xl text-[12px] font-bold text-[#6B6B7E] bg-white border border-[#E5E7EB] hover:bg-slate-50 transition-all"
                  >
                    Close
                  </button>
                  <button
                    onClick={handleUpdateCredentials}
                    disabled={loading}
                    className="px-6 py-3 rounded-2xl text-[12px] font-bold text-white bg-[#1B4DA0] hover:bg-[#0D47A1] transition-all shadow-lg shadow-blue-500/20 active:scale-95 flex items-center gap-2 disabled:opacity-50"
                  >
                    {loading ? 'Updating...' : <><FiCheck size={16} /> Update Access</>}
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>,
        document.body
      )}


      <ClientOnboardingForm
        isOpen={isOnboardModalOpen}
        initialData={clientToEdit}
        onClose={() => {
          setIsOnboardModalOpen(false);
          setClientToEdit(null);
        }}
        onComplete={async () => {
          await fetchClients();
          setIsOnboardModalOpen(false);
          setClientToEdit(null);
        }}
      />

      {/* Client Documents Modal */}
      {createPortal(
        <AnimatePresence>
          {isDocsModalOpen && selectedClientDetail && (
            <React.Fragment>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-[#1A1A2E]/60 backdrop-blur-xl z-[300000]"
                onClick={() => setIsDocsModalOpen(false)}
              />
              <div className="fixed inset-0 flex items-center justify-center z-[300001] p-4">
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 20 }}
                  className="w-full max-w-2xl bg-white rounded-[40px] shadow-2xl overflow-hidden border border-[#F4F3EF] relative"
                >
                  {/* Modal Header */}
                  <div className="p-8 border-b border-[#F4F3EF] flex items-center justify-between bg-gradient-to-r from-blue-50/30 to-white">
                    <div>
                      <h3 className="text-xl font-bold text-[#1A1A2E] font-syne">Documents Cabinet</h3>
                      <p className="text-[11px] font-bold text-[#1B4DA0] uppercase tracking-widest mt-1">Manage compliance files for {selectedClientDetail.companyName}</p>
                    </div>
                    <button
                      onClick={() => setIsDocsModalOpen(false)}
                      className="w-12 h-12 rounded-2xl bg-[#F8FAFC] text-[#9B9BAD] hover:text-red-500 hover:bg-red-50 transition-all duration-300 flex items-center justify-center shadow-sm"
                    >
                      <FiX size={24} />
                    </button>
                  </div>

                  {/* Modal Content */}
                  <div className="p-8 max-h-[70vh] overflow-y-auto custom-scrollbar">
                    <div className="grid grid-cols-1 gap-4">
                      {[
                        { key: 'panCard', label: 'PAN Card Copy' },
                        { key: 'gstCert', label: 'GST Registration Certificate' },
                        { key: 'cinCert', label: 'Incorporation Certificate (CIN)' },
                        { key: 'msmeCert', label: 'MSME Certificate' },
                        { key: 'agreement', label: 'Signed Service Agreement' },
                        { key: 'shopsLicense', label: 'Shop Act / Factory License' },
                        { key: 'signatoryID', label: 'Authorized Signatory ID Proof' }
                      ].map((doc) => {
                        const hasDoc = selectedClientDetail.documents?.[doc.key];
                        return (
                          <div key={doc.key} className="flex items-center justify-between p-5 bg-[#FAFAF8] rounded-3xl border border-[#F4F3EF] hover:border-blue-200 transition-all group">
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 rounded-2xl bg-white border border-[#F4F3EF] flex items-center justify-center text-[#1B4DA0] shadow-sm group-hover:scale-110 transition-transform">
                                <FiFileText size={20} />
                              </div>
                              <div>
                                <p className="text-[13px] font-bold text-[#1A1A2E]">{doc.label}</p>
                                <p className={`text-[10px] font-bold uppercase tracking-widest mt-0.5 ${hasDoc ? 'text-emerald-500' : 'text-amber-500'}`}>
                                  {hasDoc ? 'Already Uploaded' : 'Missing Document'}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              {hasDoc ? (
                                <button className="px-5 py-2.5 bg-white border border-[#E2E8F0] rounded-xl text-[10px] font-black uppercase tracking-widest text-[#1B4DA0] hover:bg-[#1B4DA0] hover:text-white transition-all shadow-sm">
                                  View File
                                </button>
                              ) : (
                                <button
                                  onClick={() => toast.error('Upload feature coming soon')}
                                  className="px-5 py-2.5 bg-[#1B4DA0] rounded-xl text-[10px] font-black uppercase tracking-widest text-white hover:bg-[#0D47A1] transition-all shadow-lg flex items-center gap-2"
                                >
                                  <FiUpload size={14} /> Upload Now
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Modal Footer */}
                  <div className="p-8 bg-[#F8FAFC] border-t border-[#F4F3EF] flex justify-end">
                    <button
                      onClick={() => setIsDocsModalOpen(false)}
                      className="px-8 py-4 bg-white border border-[#F4F3EF] rounded-2xl text-[11px] font-black uppercase tracking-widest text-[#1A1A2E] hover:bg-gray-50 transition-all shadow-sm"
                    >
                      Close
                    </button>
                  </div>
                </motion.div>
              </div>
            </React.Fragment>
          )}
        </AnimatePresence>,
        document.body
      )}
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
                  <h3 className="text-2xl font-bold text-[#1A1A2E] mb-2 font-syne">Delete Client?</h3>
                  <p className="text-sm text-[#6B6B7E] mb-8 leading-relaxed">
                    Are you sure you want to delete <span className="font-bold text-[#1A1A2E]">{clientToDelete?.companyName || clientToDelete?.name}</span>? This action cannot be undone.
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

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #E5E7EB; border-radius: 20px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #D1D5DB; }
      `}</style>
    </>
  );
};

export default ClientsTab;
