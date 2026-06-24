import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiSearch, FiFilter, FiDownload, FiPlus, FiChevronRight, FiChevronDown,
  FiMail, FiPhone, FiMapPin, FiActivity, FiBriefcase, FiUsers, FiTrash,
  FiX, FiUser, FiDollarSign, FiClock, FiZap, FiCheckSquare, FiDatabase, FiEdit3, FiTrendingUp, FiTarget, FiCheckCircle, FiCheck,
  FiEdit2, FiFileText, FiEye, FiUpload, FiRefreshCw, FiCamera, FiEyeOff, FiKey
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
import { jwtDecode } from 'jwt-decode';
import { getAllClients, deleteClient, editClient } from '../../../service/api';
import { toast } from 'react-hot-toast';
import ClientOnboardingForm from './ClientOnboardingForm';

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

const CompleteOnboardingTab = ({ notificationBell }) => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
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
  const [showPassword, setShowPassword] = useState(false);
  const [isRequesterTech, setIsRequesterTech] = useState(false);

  useEffect(() => {
    setShowPassword(false);
  }, [selectedClientDetail]);
  const handleBulkUpload = async (e) => {
    const file = e.target.files[0];

    if (!file) return;

    console.log("Uploaded File:", file);

    toast.success("File selected successfully");
  };

  const downloadTemplate = () => {
    const csv = `companyName,industry,spocName,spocEmail,spocContact,
        gstNumber,panNumber,cinNumber,website,
        corporateAddress,city,state,pinCode,
        agreementType,paymentTerms,feeStructure,noticePeriod,
        totalEmployees,workingModel,pfApplicable,esicApplicable,status

        ABC Pvt Ltd,IT,Rahul Sharma,rahul@gmail.com,9876543210,
        22AAAAA0000A1Z5,ABCDE1234F,U12345RJ2025PTC123456,www.abc.com,
        Jaipur Office,Jaipur,Rajasthan,302001,
        Annual,30 Days,Fixed,60,
        100,Hybrid,Yes,Yes,Active`;

    const blob = new Blob([csv], {
      type: "text/csv;charset=utf-8;"
    });

    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "client_template.csv";
    link.click();
  };
  const fetchClients = async () => {
    setLoading(true);

    try {
      const res = await getAllClients();
      console.log('API Response:', res);
      let apiClients = res.data?.clients || (Array.isArray(res.data) ? res.data : null) || res.clients || (Array.isArray(res) ? res : []);

      if (!apiClients) {
        apiClients = [];
      }

      console.log('Setting clients to:', apiClients);
      setClients(Array.isArray(apiClients) ? apiClients : []);
    } catch (err) {
      console.error('Error fetching clients:', err);
      setClients([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded = jwtDecode(token);
        const role = decoded.role || decoded.userType || localStorage.getItem('userRole') || '';
        const requesterEmail = decoded.email || '';
        const isTech = String(role).toLowerCase().includes('tech') || String(requesterEmail).toLowerCase().includes('tech');
        setIsRequesterTech(isTech);
      } catch (e) { }
    }
  }, []);

  const handleSaveClientDetails = async () => {
    setIsSavingDetail(true);
    try {
      const clientId = selectedClientDetail._id || selectedClientDetail.id;
      const payload = {
        clientId,
        ...editableClient
      };
      await editClient(payload);

      const updatedClient = {
        ...selectedClientDetail,
        ...editableClient,
        plainPassword: editableClient.newPassword || selectedClientDetail.plainPassword
      };
      delete updatedClient.newPassword;

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
  const activeClients = clients.filter(
    c => (c.status || '').toLowerCase() === 'active'
  ).length;

  const inactiveClients = clients.filter(
    c => (c.status || '').toLowerCase() === 'inactive'
  ).length;

  const totalClients = clients.length;

  const filteredClients = clients.filter(c => {
    const matchesSearch = (c.companyName || c.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.spocName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.spocEmail || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = selectedStatus === 'ALL' || (c.status || 'Active').toUpperCase() === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <>
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
        <div className="flex items-center justify-between mb-8 text-left">
          <div className="flex flex-col text-left">
            <h1 className="text-3xl font-bold text-[#1A1A2E] tracking-tight" style={{ fontFamily: "'Syne', sans-serif" }}>
              Client Onboarding
            </h1>
          </div>
          <div className="flex items-center gap-3">
            {notificationBell}
            <button
              onClick={() => document.getElementById('bulkUpload')?.click()}
              className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-[#1A1A2E] hover:bg-[#111827] text-white transition-all"
            >
              <FiUpload size={16} />
              <span className="text-[11px] font-bold uppercase tracking-widest">
                Bulk Upload
              </span>
            </button>

            <button
              onClick={downloadTemplate}
              className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-[#1A1A2E] hover:bg-[#111827] text-white transition-all"
            >
              <FiDownload size={16} />
              <span className="text-[11px] font-bold uppercase tracking-widest">
                Template
              </span>
            </button>

            <input
              id="bulkUpload"
              type="file"
              accept=".csv,.xlsx"
              className="hidden"
              onChange={handleBulkUpload}
            />
            <button
              onClick={() => {
                setClientToEdit(null);
                setIsOnboardModalOpen(true);
              }}
              className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-[#1B4DA0] hover:bg-[#153D80] text-white transition-all shadow-lg"
            >
              <FiPlus size={18} />
              <span className="text-[11px] font-bold uppercase tracking-widest">
                Add Client
              </span>
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
                    <th className="pl-8 pr-4 py-4 w-10">
                      <div
                        className={`w-5 h-5 rounded-md border-2 flex items-center justify-center cursor-pointer transition-all ${selectedIds.length === filteredClients.length && filteredClients.length > 0
                            ? 'bg-[#1B4DA0] border-[#1B4DA0] text-white shadow-lg'
                            : 'bg-white border-[#E2E8F0] hover:border-gray-400'
                          }`}
                        onClick={() => {
                          if (selectedIds.length === filteredClients.length) {
                            setSelectedIds([]);
                          } else {
                            setSelectedIds(filteredClients.map(c => c.id || c._id));
                          }
                        }}
                      >
                        {selectedIds.length === filteredClients.length && filteredClients.length > 0 && <FiCheck size={14} strokeWidth={4} />}
                      </div>
                    </th>
                    <th className="px-8 py-4 text-[11px] font-bold text-[#94a3b8] uppercase tracking-widest text-left">Company</th>
                    <th className="px-8 py-4 text-[11px] font-bold text-[#94a3b8] uppercase tracking-widest text-left">SPOC</th>
                    <th className="px-8 py-4 text-[11px] font-bold text-[#94a3b8] uppercase tracking-widest text-left">Location</th>
                    <th className="px-8 py-4 text-[11px] font-bold text-[#94a3b8] uppercase tracking-widest text-left">Onboarding</th>
                    <th className="px-8 py-4 text-[11px] font-bold text-[#94a3b8] uppercase tracking-widest text-left">Billing</th>
                    <th className="px-8 py-4 text-[11px] font-bold text-[#94a3b8] uppercase tracking-widest text-left">Pending</th>
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
                          <div
                            className={`w-5 h-5 rounded-md border-2 flex items-center justify-center cursor-pointer transition-all ${isSelected
                                ? 'bg-[#1B4DA0] border-[#1B4DA0] text-white'
                                : 'bg-white border-[#E2E8F0] hover:border-gray-400'
                              }`}
                            onClick={(e) => {
                              e.stopPropagation();
                              if (isSelected) {
                                setSelectedIds(prev => prev.filter(id => id !== clientId));
                              } else {
                                setSelectedIds(prev => [...prev, clientId]);
                              }
                            }}
                          >
                            {isSelected && <FiCheck size={14} strokeWidth={4} />}
                          </div>
                        </td>
                        <td className="px-8 py-4">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-[#EEF2FB] text-[#1B4DA0] flex items-center justify-center font-black">
                              {(client.companyName || client.name || 'C').substring(0, 2).toUpperCase()}
                            </div>
                            <p className="text-[14px] font-bold text-[#1A1A2E]">{client.companyName || client.name}</p>
                          </div>
                        </td>
                        <td className="px-8 py-4 text-left">
                          <p className="text-[13px] font-bold text-[#1A1A2E]">{client.spocName || 'N/A'}</p>
                        </td>
                        <td className="px-8 py-4 text-left">
                          <p className="text-[12px] font-bold text-[#6B6B7E]">{client.city || 'N/A'}</p>
                        </td>

                        <td className="px-8 py-4 text-left">
                          <div className="flex items-center gap-3">
                            <CircularProgress progress={progress} />
                            <span className="text-[10px] font-bold text-[#6B6B7E] uppercase tracking-wider">{progress === 100 ? 'Completed' : 'In Progress'}</span>
                          </div>
                        </td>
                        <td className="px-8 py-4 text-left">
                          <div className="flex flex-col">
                            <span className="text-[13px] font-black text-[#1A1A2E]">
                              ₹{client.account?.clearedAmount ? Number(client.account.clearedAmount).toLocaleString('en-IN') : '0'}
                            </span>
                            <span className="text-[10px] uppercase tracking-widest text-emerald-500 font-bold">
                              {client.account?.accountType || 'Monthly'}
                            </span>
                          </div>
                        </td>
                        <td className="px-8 py-4 text-left">
                          <div className="flex flex-col">
                            <span className="text-[13px] font-black text-red-500">
                              ₹{client.account?.overdueAmount ? Number(client.account.overdueAmount).toLocaleString('en-IN') : '0'}
                            </span>
                            <span className="text-[10px] uppercase tracking-widest text-[#9B9BAD] font-bold">
                              Due Amount
                            </span>
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

      {createPortal(
        <AnimatePresence>
          {selectedClientDetail && (
            <React.Fragment>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-[#1A1A2E]/40 backdrop-blur-md z-[200000]"
                onClick={() => setSelectedClientDetail(null)}
              />
              <motion.div
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: "spring", damping: 30, stiffness: 200 }}
                className="fixed inset-y-0 right-0 w-full max-w-[698px] bg-white shadow-2xl border-l border-[#F4F3EF] flex flex-col z-[200001] overflow-hidden"
              >
                {/* Drawer Header */}
                <div className="p-6 border-b border-[#F4F3EF] flex items-center justify-between bg-gradient-to-r from-blue-50/30 to-white">
                  <h3 className="text-xl font-bold text-[#1A1A2E]" style={{ fontFamily: "'Syne', sans-serif" }}>Client Portfolio</h3>
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
                          onClick={handleSaveClientDetails}
                          className="px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-[#1B4DA0] hover:bg-[#153D80] transition-all flex items-center gap-2 shadow-md shadow-blue-500/10"
                        >
                          {isSavingDetail ? <FiRefreshCw className="animate-spin w-3.5 h-3.5" /> : <FiCheck className="w-3.5 h-3.5" />}
                          {isSavingDetail ? 'Saving...' : 'Save Changes'}
                        </button>
                      </div>
                    ) : (
                      <>
                        <button
                          onClick={() => {
                            setEditableClient(selectedClientDetail);
                            setIsEditingInDetail(true);
                          }}
                          className="w-10 h-10 rounded-2xl flex items-center justify-center text-[#9B9BAD] hover:text-[#1B4DA0] hover:bg-blue-50 transition-all duration-300"
                          title="Edit Client"
                        >
                          <FiEdit2 size={18} />
                        </button>
                        <button
                          onClick={() => {
                            setClientToDelete(selectedClientDetail);
                            setIsDeleteModalOpen(true);
                          }}
                          className="w-10 h-10 rounded-2xl flex items-center justify-center text-[#9B9BAD] hover:text-red-500 hover:bg-red-50 transition-all duration-300"
                          title="Delete Client"
                        >
                          <FiTrash size={18} />
                        </button>
                        <button onClick={() => setSelectedClientDetail(null)} className="w-10 h-10 rounded-2xl flex items-center justify-center text-[#9B9BAD] hover:text-red-500 hover:bg-red-50 transition-all duration-300">
                          <FiX size={20} />
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* Drawer Content */}
                <div className="flex-1 overflow-y-auto px-10 py-8 space-y-10 custom-scrollbar text-left">

                  {/* Profile Header (Centered) */}
                  <div className="flex flex-col items-center text-center">
                    <div className="relative mb-6">
                      <div className={`w-24 h-24 rounded-[32px] bg-[#1B4DA0] flex items-center justify-center text-white text-3xl font-extrabold shadow-xl shadow-blue-500/20 overflow-hidden ${isEditingInDetail ? 'cursor-pointer hover:scale-105 transition-all' : ''}`}
                        style={{ background: 'linear-gradient(135deg, #1B4DA0 0%, #0D47A1 100%)' }}>
                        <span>{(selectedClientDetail.companyName || selectedClientDetail.name || 'C').substring(0, 2).toUpperCase()}</span>
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
                          value={editableClient?.companyName || ''}
                          onChange={(e) => setEditableClient({ ...editableClient, companyName: e.target.value })}
                        />
                      ) : (
                        <h4 className="text-2xl font-bold text-[#1A1A2E] tracking-tight font-syne">{selectedClientDetail.companyName || selectedClientDetail.name}</h4>
                      )}

                      {isEditingInDetail ? (
                        <input
                          type="text"
                          className="w-full max-w-[240px] text-[11px] font-bold text-[#0D47A1] bg-[#FAFAF8] border-none rounded-xl py-1 px-3 text-center focus:outline-none mt-1 mx-auto uppercase tracking-[3px]"
                          value={editableClient?.industry || ''}
                          onChange={(e) => setEditableClient({ ...editableClient, industry: e.target.value })}
                        />
                      ) : (
                        <p className="text-[11px] font-bold text-[#0D47A1] uppercase tracking-[3px]">{selectedClientDetail.industry || 'Enterprise'} Sector</p>
                      )}
                    </div>
                  </div>

                  {/* Information Grid */}
                  <div className="bg-[#FAFAF8] rounded-[32px] border border-[#F4F3EF] p-8 space-y-10 shadow-sm">

                    {/* Company Identity */}
                    <div className="space-y-6">
                      <div className="flex items-center gap-3 border-b border-[#F4F3EF] pb-4">
                        <FiBriefcase className="text-[#1B4DA0]" size={18} />
                        <h5 className="text-[12px] font-black text-[#1A1A2E] uppercase tracking-wider">Company Identity</h5>
                      </div>
                      <div className="grid grid-cols-2 gap-x-8 gap-y-6">
                        <InfoItem
                          label="GST Number"
                          value={isEditingInDetail ? editableClient?.gstNumber : selectedClientDetail.gstNumber}
                          isEditing={isEditingInDetail}
                          onChange={(val) => setEditableClient({ ...editableClient, gstNumber: val })}
                        />
                        <InfoItem
                          label="PAN Number"
                          value={isEditingInDetail ? editableClient?.panNumber : selectedClientDetail.panNumber}
                          isEditing={isEditingInDetail}
                          onChange={(val) => setEditableClient({ ...editableClient, panNumber: val })}
                        />
                        <InfoItem
                          label="CIN Number"
                          value={isEditingInDetail ? editableClient?.cinNumber : selectedClientDetail.cinNumber}
                          isEditing={isEditingInDetail}
                          onChange={(val) => setEditableClient({ ...editableClient, cinNumber: val })}
                        />
                        <InfoItem
                          label="Company Website"
                          value={isEditingInDetail ? editableClient?.website : selectedClientDetail.website}
                          isEditing={isEditingInDetail}
                          onChange={(val) => setEditableClient({ ...editableClient, website: val })}
                        />
                      </div>
                    </div>

                    {/* Access Credentials */}
                    <div className="space-y-6">
                      <div className="flex items-center gap-3 border-b border-[#F4F3EF] pb-4">
                        <FiKey className="text-[#1B4DA0]" size={18} />
                        <h5 className="text-[12px] font-black text-[#1A1A2E] uppercase tracking-wider">Access Credentials</h5>
                      </div>
                      <div className="grid grid-cols-2 gap-x-8 gap-y-6">
                        <InfoItem
                          label="Login Email"
                          value={isEditingInDetail ? editableClient?.email : selectedClientDetail.email}
                          isEditing={isEditingInDetail && isRequesterTech}
                          onChange={(val) => setEditableClient({ ...editableClient, email: val })}
                        />
                        <div className="space-y-1.5 text-left">
                          <label className="text-[10px] font-bold text-[#9B9BAD] uppercase tracking-[2px]">Password</label>
                          <div className="bg-white px-4 py-3 rounded-xl border border-[#F4F3EF] flex items-center justify-between min-h-[46px]">
                            {isEditingInDetail ? (
                              <input
                                type="text"
                                value={String(selectedClientDetail?.email || '').toLowerCase().includes('tech') ? '' : (editableClient?.newPassword || '')}
                                onChange={(e) => setEditableClient({ ...editableClient, newPassword: e.target.value })}
                                placeholder={String(selectedClientDetail?.email || '').toLowerCase().includes('tech') ? "Cannot change tech user's password" : "Enter new password"}
                                disabled={String(selectedClientDetail?.email || '').toLowerCase().includes('tech')}
                                className={`w-full text-sm font-bold text-[#1A1A2E] bg-transparent border-none focus:outline-none ${String(selectedClientDetail?.email || '').toLowerCase().includes('tech') ? 'opacity-60 cursor-not-allowed' : ''}`}
                              />
                            ) : (
                              <>
                                <p className="text-sm font-bold text-[#1A1A2E]">
                                  {showPassword ? (selectedClientDetail.plainPassword || ((selectedClientDetail.companyName || selectedClientDetail.name || '').replace(/[^a-zA-Z0-9]/g, '') + '@123')) : '••••••••'}
                                </p>
                                <button
                                  type="button"
                                  onClick={() => setShowPassword(!showPassword)}
                                  className="text-[#9B9BAD] hover:text-[#1B4DA0] transition-colors"
                                >
                                  {showPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Address Details */}
                    <div className="space-y-6">
                      <div className="flex items-center gap-3 border-b border-[#F4F3EF] pb-4">
                        <FiMapPin className="text-[#1B4DA0]" size={18} />
                        <h5 className="text-[12px] font-black text-[#1A1A2E] uppercase tracking-wider">Location & Address</h5>
                      </div>
                      <div className="grid grid-cols-1 gap-y-6">
                        <InfoItem
                          label="Corporate Address"
                          value={isEditingInDetail ? editableClient?.corporateAddress : selectedClientDetail.corporateAddress}
                          fullWidth
                          isEditing={isEditingInDetail}
                          onChange={(val) => setEditableClient({ ...editableClient, corporateAddress: val })}
                        />
                        <div className="grid grid-cols-3 gap-6">
                          <InfoItem
                            label="City"
                            value={isEditingInDetail ? editableClient?.city : selectedClientDetail.city}
                            isEditing={isEditingInDetail}
                            onChange={(val) => setEditableClient({ ...editableClient, city: val })}
                          />
                          <InfoItem
                            label="State"
                            value={isEditingInDetail ? editableClient?.state : selectedClientDetail.state}
                            isEditing={isEditingInDetail}
                            onChange={(val) => setEditableClient({ ...editableClient, state: val })}
                          />
                          <InfoItem
                            label="Pin Code"
                            value={isEditingInDetail ? editableClient?.pinCode : selectedClientDetail.pinCode}
                            isEditing={isEditingInDetail}
                            onChange={(val) => setEditableClient({ ...editableClient, pinCode: val })}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Contact Persons */}
                    <div className="space-y-6">
                      <div className="flex items-center gap-3 border-b border-[#F4F3EF] pb-4">
                        <FiUsers className="text-[#1B4DA0]" size={18} />
                        <h5 className="text-[12px] font-black text-[#1A1A2E] uppercase tracking-wider">Contact Persons</h5>
                      </div>
                      <div className="grid grid-cols-2 gap-x-8 gap-y-6">
                        <InfoItem
                          label="Primary SPOC"
                          value={isEditingInDetail ? editableClient?.spocName : selectedClientDetail.spocName}
                          subValue={!isEditingInDetail && selectedClientDetail.spocContact}
                          isEditing={isEditingInDetail}
                          onChange={(val) => setEditableClient({ ...editableClient, spocName: val })}
                        />
                        {isEditingInDetail && (
                          <InfoItem
                            label="SPOC Contact"
                            value={editableClient?.spocContact}
                            isEditing={isEditingInDetail}
                            onChange={(val) => setEditableClient({ ...editableClient, spocContact: val })}
                          />
                        )}
                        <InfoItem
                          label="Authorized Signatory"
                          value={isEditingInDetail ? editableClient?.authorizedSignatory?.name : selectedClientDetail.authorizedSignatory?.name}
                          subValue={!isEditingInDetail && selectedClientDetail.authorizedSignatory?.email}
                          isEditing={isEditingInDetail}
                          onChange={(val) => setEditableClient({
                            ...editableClient,
                            authorizedSignatory: { ...editableClient.authorizedSignatory, name: val }
                          })}
                        />
                        {isEditingInDetail && (
                          <InfoItem
                            label="Signatory Email"
                            value={editableClient?.authorizedSignatory?.email}
                            isEditing={isEditingInDetail}
                            onChange={(val) => setEditableClient({
                              ...editableClient,
                              authorizedSignatory: { ...editableClient.authorizedSignatory, email: val }
                            })}
                          />
                        )}
                      </div>
                    </div>

                    {/* Commercial Terms */}
                    <div className="space-y-6">
                      <div className="flex items-center gap-3 border-b border-[#F4F3EF] pb-4">
                        <FiDollarSign className="text-[#1B4DA0]" size={18} />
                        <h5 className="text-[12px] font-black text-[#1A1A2E] uppercase tracking-wider">Commercial Terms</h5>
                      </div>
                      <div className="grid grid-cols-2 gap-x-8 gap-y-6">
                        <InfoItem
                          label="Agreement Type"
                          value={isEditingInDetail ? editableClient?.agreementType : selectedClientDetail.agreementType}
                          isEditing={isEditingInDetail}
                          onChange={(val) => setEditableClient({ ...editableClient, agreementType: val })}
                        />
                        <InfoItem
                          label="Payment Terms"
                          value={isEditingInDetail ? editableClient?.paymentTerms : selectedClientDetail.paymentTerms}
                          isEditing={isEditingInDetail}
                          onChange={(val) => setEditableClient({ ...editableClient, paymentTerms: val })}
                        />
                        <InfoItem
                          label="Fee Structure"
                          value={isEditingInDetail ? editableClient?.feeStructure : selectedClientDetail.feeStructure}
                          isEditing={isEditingInDetail}
                          onChange={(val) => setEditableClient({ ...editableClient, feeStructure: val })}
                        />
                        <InfoItem
                          label="Notice Period (Days)"
                          value={isEditingInDetail ? editableClient?.noticePeriod : selectedClientDetail.noticePeriod}
                          isEditing={isEditingInDetail}
                          type="number"
                          onChange={(val) => setEditableClient({ ...editableClient, noticePeriod: val })}
                        />
                      </div>
                    </div>

                    {/* Operational Data */}
                    <div className="space-y-6">
                      <div className="flex items-center gap-3 border-b border-[#F4F3EF] pb-4">
                        <FiActivity className="text-[#1B4DA0]" size={18} />
                        <h5 className="text-[12px] font-black text-[#1A1A2E] uppercase tracking-wider">Operational Data</h5>
                      </div>
                      <div className="grid grid-cols-2 gap-x-8 gap-y-6">
                        <InfoItem
                          label="Total Employees"
                          value={isEditingInDetail ? editableClient?.totalEmployees : selectedClientDetail.totalEmployees}
                          isEditing={isEditingInDetail}
                          type="number"
                          onChange={(val) => setEditableClient({ ...editableClient, totalEmployees: val })}
                        />
                        <InfoItem
                          label="Working Model"
                          value={isEditingInDetail ? editableClient?.workingModel : selectedClientDetail.workingModel}
                          isEditing={isEditingInDetail}
                          onChange={(val) => setEditableClient({ ...editableClient, workingModel: val })}
                        />
                        <InfoItem
                          label="PF Applicable"
                          value={isEditingInDetail ? editableClient?.pfApplicable : selectedClientDetail.pfApplicable}
                          isEditing={isEditingInDetail}
                          onChange={(val) => setEditableClient({ ...editableClient, pfApplicable: val })}
                        />
                        <InfoItem
                          label="ESI Applicable"
                          value={isEditingInDetail ? editableClient?.esicApplicable : selectedClientDetail.esicApplicable}
                          isEditing={isEditingInDetail}
                          onChange={(val) => setEditableClient({ ...editableClient, esicApplicable: val })}
                        />
                      </div>
                    </div>

                  </div>

                  {/* Documents Section */}
                  <div className="space-y-4 pt-6 border-t border-[#F4F3EF]">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <FiFileText className="text-[#1B4DA0]" size={20} />
                        <h4 className="text-[15px] font-bold text-[#1A1A2E] uppercase tracking-tight">Agreements & Licenses</h4>
                      </div>
                    </div>
                    <button
                      onClick={() => setIsDocsModalOpen(true)}
                      className="w-full py-4 bg-white border-2 border-[#1B4DA0]/10 rounded-2xl text-[11px] font-black uppercase tracking-widest text-[#1B4DA0] hover:bg-[#1B4DA0] hover:text-white hover:border-[#1B4DA0] transition-all flex items-center justify-center gap-3 shadow-sm group"
                    >
                      <FiEye className="group-hover:scale-110 transition-transform" /> View Signed Documents
                    </button>
                  </div>

                </div>
              </motion.div>
            </React.Fragment>
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

export default CompleteOnboardingTab;
