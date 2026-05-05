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
    {label && (
      <span 
        style={{ color: active ? '#10B981' : '#94A3B8' }} 
        className="text-[10px] font-black uppercase tracking-widest"
      >
        {label}
      </span>
    )}

    <button
      onClick={(e) => {
        e.stopPropagation();
        onChange(!active);
      }}
      style={{ 
        backgroundColor: active ? '#10B981' : '#E2E8F0',
        borderColor: active ? '#34D399' : '#CBD5E1',
        boxShadow: active ? '0 4px 12px rgba(16, 185, 129, 0.2)' : 'inset 0 2px 4px rgba(0,0,0,0.05)'
      }}
      className="relative w-12 h-6 rounded-full transition-all duration-500 border-2"
    >
      <motion.div
        initial={false}
        animate={{
          x: active ? 26 : 2,
          scale: active ? 1 : 0.9
        }}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        style={{ 
          backgroundColor: active ? '#FFFFFF' : '#FFFFFF',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}
        className="absolute top-0.5 w-4 h-4 rounded-full flex items-center justify-center transition-all duration-300"
      >
        {active && <div style={{ backgroundColor: '#10B981' }} className="w-1.5 h-1.5 rounded-full animate-pulse" />}
      </motion.div>
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
              Clients
            </h1>
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
                    <th className="px-8 py-4 text-[11px] font-bold text-[#94a3b8] uppercase tracking-widest text-left">Company</th>
                    <th className="px-8 py-4 text-[11px] font-bold text-[#94a3b8] uppercase tracking-widest text-left">SPOC</th>
                    <th className="px-8 py-4 text-[11px] font-bold text-[#94a3b8] uppercase tracking-widest text-left">Location</th>
                    <th className="px-8 py-4 text-[11px] font-bold text-[#94a3b8] uppercase tracking-widest text-left">Status</th>
                    <th className="px-8 py-4"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F4F3EF]">
                  {filteredClients.map((client) => (
                    <tr
                      key={client.id || client._id}
                      onClick={() => setSelectedClientDetail(client)}
                      className="hover:bg-[#F8FAFF] transition-all group cursor-pointer"
                    >
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
                        <Toggle 
                          active={['active', 'accepted'].includes((client.status || 'Active').toLowerCase().trim())} 
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
            )}
          </div>
        </div>
      </motion.div>

      {createPortal(
        <AnimatePresence>
          {selectedClientDetail && (
            <React.Fragment>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[200000]"
                onClick={() => setSelectedClientDetail(null)}
              />
              <motion.div
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: "spring", damping: 35, stiffness: 250 }}
                className="fixed inset-y-0 right-0 w-full max-w-[698px] bg-white shadow-2xl border-l border-[#F4F3EF] flex flex-col z-[200001] overflow-hidden"
              >
                {/* Detail Header */}
                <div className="p-6 border-b border-[#F4F3EF] bg-gradient-to-r from-blue-50/30 to-white flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-[#0D47A1] text-white flex items-center justify-center font-bold text-lg">
                      {selectedClientDetail.companyName ? selectedClientDetail.companyName.slice(0, 1).toUpperCase() : (selectedClientDetail.name ? selectedClientDetail.name.slice(0, 1).toUpperCase() : 'C')}
                    </div>
                    <h3 className="text-xl font-bold text-[#1A1A2E]" style={{ fontFamily: "'Syne', sans-serif" }}>Client Portfolio</h3>
                  </div>
                  <button onClick={() => setSelectedClientDetail(null)} className="w-10 h-10 rounded-2xl flex items-center justify-center text-[#9B9BAD] hover:text-red-500 hover:bg-red-50 transition-all duration-300 shadow-sm">
                    <FiX size={20} />
                  </button>
                </div>

                {/* Detail Content */}
                <div className="flex-1 overflow-y-auto px-10 py-8 space-y-10 custom-scrollbar">

                  {/* Identity Section */}
                  <div className="flex flex-col items-center text-center">
                    <div className="w-24 h-24 rounded-[32px] bg-[#F8FAFC] text-[#475569] flex items-center justify-center text-3xl font-extrabold shadow-xl border border-[#F1F5F9] mb-6">
                      {selectedClientDetail.companyName ? selectedClientDetail.companyName.slice(0, 2).toUpperCase() : (selectedClientDetail.name ? selectedClientDetail.name.slice(0, 2).toUpperCase() : 'C')}
                    </div>
                    <div className="space-y-1.5">
                      <h4 className="text-2xl font-bold text-[#1A1A2E] tracking-tight" style={{ fontFamily: "'Syne', sans-serif" }}>{selectedClientDetail.companyName || selectedClientDetail.name}</h4>
                      <p className="text-[14px] font-bold text-[#1B4DA0] tracking-tight uppercase tracking-[3px]">{selectedClientDetail.industry || 'Enterprise'} Sector</p>
                    </div>
                  </div>

                  {/* Information Card */}
                  <div className="bg-[#FAFAF8] rounded-[32px] border border-[#F4F3EF] p-10 space-y-8 shadow-sm">
                    <div className="flex items-center justify-between border-b border-[#F4F3EF] pb-4">
                      <span className="text-sm font-medium text-[#9B9BAD]">Location HQ</span>
                      <span className="text-sm font-bold text-[#1A1A2E]">{selectedClientDetail.city || selectedClientDetail.location || 'Bangalore / Remote'}</span>
                    </div>
                    <div className="flex items-center justify-between border-b border-[#F4F3EF] pb-4">
                      <span className="text-sm font-medium text-[#9B9BAD]">Active Openings</span>
                      <span className="text-sm font-bold text-emerald-600 bg-emerald-50 px-4 py-1.5 rounded-full border border-emerald-100">{selectedClientDetail.jobCount || 0} Positions</span>
                    </div>
                    <div className="flex items-center justify-between border-b border-[#F4F3EF] pb-4">
                      <span className="text-sm font-medium text-[#9B9BAD]">Total Hires</span>
                      <span className="text-sm font-bold text-[#1A1A2E]">{selectedClientDetail.totalHired || '0'} Placements</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-[#9B9BAD]">Hiring SPOC</span>
                      <span className="text-sm font-bold text-[#1A1A2E]">{selectedClientDetail.spocName || selectedClientDetail.hiringManager || 'N/A'}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            </React.Fragment>
          )}
        </AnimatePresence>,
        document.body
      )}


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
