import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiSearch, FiFilter, FiDownload, FiPlus, FiChevronRight, FiChevronDown,
  FiMail, FiPhone, FiMapPin, FiActivity, FiBriefcase, FiUsers, FiTrash,
  FiX, FiUser, FiDollarSign, FiClock, FiZap, FiCheckSquare, FiDatabase, FiEdit3, FiTrendingUp, FiTarget
} from 'react-icons/fi';
import { Plus } from 'lucide-react';
import { getAllClients, deleteClient, editClient } from '../../../service/api';
import { toast } from 'react-hot-toast';

const Toggle = ({ active, onChange, label }) => (
  <div className="flex items-center gap-3">
    {label && <span className={`text-[11px] font-black uppercase tracking-widest ${active ? 'text-emerald-600' : 'text-gray-400'}`}>{label}</span>}
    <button
      onClick={(e) => { e.stopPropagation(); onChange(!active); }}
      className={`relative w-12 h-6 rounded-full transition-all duration-300 ${active ? 'bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.3)]' : 'bg-gray-200'}`}
    >
      <motion.div
        animate={{ x: active ? 26 : 2 }}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        className="absolute top-1 left-0 w-4 h-4 bg-white rounded-full shadow-sm"
      />
    </button>
  </div>
);

const ClientsTab = () => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [selectedClientDetail, setSelectedClientDetail] = useState(null);

  const fetchClients = async () => {
    setLoading(true);
    
    const mockClients = [
      {
        _id: 'mock1',
        companyName: 'TechNova Solutions',
        spocName: 'Rajesh Kumar',
        spocEmail: 'rajesh@technova.com',
        industry: 'IT Services',
        city: 'Bangalore',
        stage: 'Onboarding Complete',
        status: 'Active',
        value: '₹25,00,000',
        phone: '+91 98765 43210',
        lastContact: '2024-03-20'
      },
      {
        _id: 'mock2',
        companyName: 'Global Retail Corp',
        spocName: 'Anita Sharma',
        spocEmail: 'anita.s@globalretail.com',
        industry: 'Retail',
        city: 'Delhi',
        stage: 'Finalize',
        status: 'Active',
        value: '₹12,50,000',
        phone: '+91 87654 32109',
        lastContact: '2024-03-21'
      }
    ];

    try {
      const res = await getAllClients();
      const apiClients = res.data?.clients || res.clients || res || [];
      setClients([...mockClients, ...(Array.isArray(apiClients) ? apiClients : [])]);
    } catch (err) {
      console.error('Error fetching clients:', err);
      setClients(mockClients);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  const handleToggleStatus = async (client, newStatus) => {
    const statusLabel = newStatus ? 'Active' : 'Inactive';
    try {
      if (!client._id.startsWith('mock')) {
        await editClient({ clientId: client._id, status: statusLabel });
      }
      
      setClients(prev => prev.map(c => 
        c._id === client._id ? { ...c, status: statusLabel } : c
      ));

      if (selectedClientDetail?._id === client._id) {
        setSelectedClientDetail(prev => ({ ...prev, status: statusLabel }));
      }

      toast.success(`${client.companyName} is now ${statusLabel}`);
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

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
              All Clients
            </h1>
            <p className="text-[11px] font-black text-[#9B9BAD] uppercase tracking-widest mt-1">Directory Management</p>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="bg-white rounded-[24px] p-2 border border-[#F4F3EF] shadow-sm flex items-center gap-3 mb-8">
          <div className="relative flex-1 group">
            <FiSearch className="absolute left-5 top-1/2 -translate-y-1/2 text-[#9B9BAD]" size={18} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search clients..."
              className="w-full bg-[#F4F3EF] border-none rounded-2xl py-4 pl-14 pr-5 text-sm font-bold text-[#1A1A2E] outline-none"
            />
          </div>
        </div>

        <div className="bg-white rounded-[32px] shadow-sm border border-[#F4F3EF] overflow-hidden">
          <div className="overflow-x-auto min-h-[400px]">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#F4F3EF] bg-[#FDFDFD]">
                  <th className="px-8 py-5 text-[11px] font-bold text-[#9B9BAD] uppercase tracking-widest text-left">Company</th>
                  <th className="px-8 py-5 text-[11px] font-bold text-[#9B9BAD] uppercase tracking-widest text-left">SPOC</th>
                  <th className="px-8 py-5 text-[11px] font-bold text-[#9B9BAD] uppercase tracking-widest text-left">Location</th>
                  <th className="px-8 py-5 text-[11px] font-bold text-[#9B9BAD] uppercase tracking-widest text-left">Status</th>
                  <th className="px-8 py-5"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F4F3EF]">
                {filteredClients.map((client) => (
                  <tr
                    key={client._id}
                    onClick={() => setSelectedClientDetail(client)}
                    className="hover:bg-[#F8FAFF] transition-all group cursor-pointer"
                  >
                    <td className="px-8 py-4">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-[#EEF2FB] text-[#1B4DA0] flex items-center justify-center font-black">
                          {(client.companyName || 'C').substring(0, 2).toUpperCase()}
                        </div>
                        <p className="text-[14px] font-bold text-[#1A1A2E]">{client.companyName}</p>
                      </div>
                    </td>
                    <td className="px-8 py-4 text-left">
                      <p className="text-[13px] font-bold text-[#1A1A2E]">{client.spocName}</p>
                    </td>
                    <td className="px-8 py-4 text-left">
                      <p className="text-[12px] font-bold text-[#6B6B7E]">{client.city}</p>
                    </td>
                    <td className="px-8 py-4 text-left">
                      <Toggle 
                        active={(client.status || 'Active') === 'Active'} 
                        onChange={(val) => handleToggleStatus(client, val)} 
                      />
                    </td>
                    <td className="px-8 py-4 text-right">
                      <FiChevronRight className="inline-block text-[#9B9BAD]" size={18} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </motion.div>

      <AnimatePresence>
        {selectedClientDetail && (
          <div className="fixed inset-0 z-[200000]">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-[#0F172A]/40 backdrop-blur-[12px]"
              onClick={() => setSelectedClientDetail(null)}
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="absolute right-0 top-0 h-full w-full sm:w-[850px] bg-white shadow-[-20px_0_80px_rgba(0,0,0,0.2)] flex flex-col"
            >
              {/* Header */}
              <div className="sticky top-0 bg-white px-10 py-10 flex items-center justify-between z-20 border-b border-gray-100 shadow-sm">
                <div className="flex items-center gap-8">
                  <h2 className="text-[22px] font-bold text-[#1A1A2E] font-syne">Client Profile</h2>
                  <Toggle 
                    label={(selectedClientDetail.status || 'Active').toUpperCase()}
                    active={(selectedClientDetail.status || 'Active') === 'Active'} 
                    onChange={(val) => handleToggleStatus(selectedClientDetail, val)} 
                  />
                </div>
                <div className="flex items-center gap-4">
                  <button className="w-11 h-11 rounded-xl bg-gray-50 text-gray-400 hover:text-[#1B4DA0] flex items-center justify-center transition-all border border-gray-100">
                    <FiEdit3 size={20} />
                  </button>
                  <button
                    onClick={() => setSelectedClientDetail(null)}
                    className="w-11 h-11 rounded-xl bg-gray-50 text-gray-400 hover:text-red-500 flex items-center justify-center transition-all border border-gray-100"
                  >
                    <FiX size={22} />
                  </button>
                </div>
              </div>

              {/* Scrollable Content */}
              <div className="flex-1 overflow-y-auto custom-scrollbar bg-white">
                <div className="p-10 space-y-12">
                  {/* Top Profile Section */}
                  <div className="flex flex-col items-center justify-center text-center py-4">
                    <div className="w-32 h-32 rounded-[40px] bg-gradient-to-br from-[#1B4DA0] to-[#0D47A1] flex items-center justify-center text-5xl font-bold text-white shadow-[0_25px_50px_rgba(27,77,160,0.25)] mb-8 border-4 border-white">
                      {(selectedClientDetail.companyName || 'C').substring(0, 2).toUpperCase()}
                    </div>
                    <h3 className="text-3xl font-bold text-[#1A1A2E] mb-2 tracking-tight" style={{ fontFamily: "'Syne', sans-serif" }}>{selectedClientDetail.companyName}</h3>
                    <p className="text-[14px] font-bold text-[#1B4DA0] uppercase tracking-[5px]">{selectedClientDetail.industry || 'IT SERVICES'}</p>
                  </div>

                  {/* Details List Card */}
                  <div className="bg-[#FAFAFA] rounded-[48px] p-12 space-y-10 border border-gray-100 shadow-sm">
                    {[
                      { label: 'Location', value: selectedClientDetail.city || 'Bangalore', icon: FiMapPin },
                      { label: 'Status', value: selectedClientDetail.status || 'Active', icon: FiActivity },
                      { label: 'Email', value: selectedClientDetail.spocEmail || selectedClientDetail.email || 'N/A', icon: FiMail },
                      { label: 'Contact', value: selectedClientDetail.spocName || 'Rajesh Kumar', icon: FiUser },
                      { label: 'Deal Value', value: selectedClientDetail.value || '₹25,00,000', icon: FiDollarSign },
                    ].map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between group pb-4 border-b border-gray-200/50 last:border-0 last:pb-0">
                        <div className="flex items-center gap-3">
                          <item.icon className="text-[#1B4DA0] opacity-50" size={16} />
                          <span className="text-[13px] font-bold text-[#9B9BAD] uppercase tracking-[3px]">{item.label}</span>
                        </div>
                        <span className="text-[16px] font-bold text-[#1A1A2E] text-right">{item.value}</span>
                      </div>
                    ))}
                  </div>

                  {/* Performance Overview section */}
                  <div className="space-y-10 pb-20">
                    <div className="flex items-center justify-center gap-6">
                      <div className="h-[1px] flex-1 bg-gray-100" />
                      <span className="text-[12px] font-black text-[#9B9BAD] uppercase tracking-[6px]">Performance Overview</span>
                      <div className="h-[1px] flex-1 bg-gray-100" />
                    </div>

                    <div className="grid grid-cols-2 gap-8">
                      {[
                        { label: 'LAST CONTACT', value: '2 Days Ago', icon: FiClock, color: 'text-blue-500', bg: 'bg-blue-50' },
                        { label: 'STAGE', value: selectedClientDetail.stage || 'Onboarding', icon: FiTarget, color: 'text-emerald-500', bg: 'bg-emerald-50' },
                        { label: 'PIPELINE', value: 'High Priority', icon: FiTrendingUp, color: 'text-amber-500', bg: 'bg-amber-50' },
                        { label: 'DOCUMENTS', value: 'Verified', icon: FiCheckSquare, color: 'text-purple-500', bg: 'bg-purple-50' },
                      ].map((stat, idx) => (
                        <div key={idx} className="bg-white border border-gray-100 rounded-[40px] p-8 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 group/card">
                          <div className="flex items-center gap-4 mb-8">
                            <div className={`w-12 h-12 rounded-2xl ${stat.bg} ${stat.color} flex items-center justify-center shadow-inner group-hover/card:scale-110 transition-transform`}>
                              <stat.icon size={20} />
                            </div>
                            <span className="text-[12px] font-bold text-[#9B9BAD] uppercase tracking-widest">{stat.label}</span>
                          </div>
                          <p className="text-3xl font-bold text-[#1A1A2E]">{stat.value}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #E5E7EB; border-radius: 20px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #D1D5DB; }
      `}</style>
    </>
  );
};

export default ClientsTab;
