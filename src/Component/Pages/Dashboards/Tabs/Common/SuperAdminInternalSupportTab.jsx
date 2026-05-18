import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { FiSearch, FiChevronDown, FiChevronRight, FiX, FiCheckCircle, FiUser, FiBriefcase, FiAlertCircle } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';

const STATUS_COLORS = {
  "Pending": "bg-amber-50 text-amber-600 border-amber-100",
  "Resolved": "bg-emerald-50 text-emerald-600 border-emerald-100",
};

const mockInternalTickets = [
  {
    id: 'tkt-001',
    employeeName: 'Rahul Verma',
    department: 'Engineering',
    issue: 'Laptop battery draining too fast, need a replacement.',
    date: 'May 18, 2026',
    status: 'Pending',
    priority: 'High'
  },
  {
    id: 'tkt-002',
    employeeName: 'Sneha Reddy',
    department: 'HR',
    issue: 'Access denied to the new portal.',
    date: 'May 17, 2026',
    status: 'Resolved',
    priority: 'Medium'
  }
];

const InfoItem = ({ label, value }) => (
  <div>
    <p className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-widest mb-1.5">{label}</p>
    <div className="bg-white border border-[#F4F3EF] rounded-xl px-4 py-3 min-h-[44px] flex items-center">
      <span className="text-[13px] font-bold text-[#1A1A2E]">{value || 'N/A'}</span>
    </div>
  </div>
);

const SuperAdminInternalSupportTab = () => {
  const [tickets, setTickets] = useState(mockInternalTickets);
  const [searchTerm, setSearchTerm] = useState('');
  const [deptFilter, setDeptFilter] = useState('all');
  const [selectedTicket, setSelectedTicket] = useState(null);

  const uniqueDepts = [...new Set(tickets.map(t => t.department))].sort();

  const filteredTickets = tickets.filter(t => {
    const matchesSearch = t.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          t.issue.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDept = deptFilter === 'all' || t.department === deptFilter;
    return matchesSearch && matchesDept;
  });

  const handleResolve = (ticketId) => {
    setTickets(prev => prev.map(t => t.id === ticketId ? { ...t, status: 'Resolved' } : t));
    if (selectedTicket && selectedTicket.id === ticketId) {
      setSelectedTicket({ ...selectedTicket, status: 'Resolved' });
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 font-jakarta">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-[#1A1A2E] font-syne">Internal Support</h1>
      </div>

      <div className="bg-white rounded-[24px] p-2 border border-[#F4F3EF] shadow-sm flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 group min-w-[200px]">
          <FiSearch className="absolute left-5 top-1/2 -translate-y-1/2 text-[#9B9BAD]" size={18} />
          <input
            type="text"
            placeholder="Search by employee or issue..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#F4F3EF] border-none rounded-2xl py-3 pl-14 pr-5 text-sm font-medium outline-none transition-all placeholder:text-[#9B9BAD]"
          />
        </div>

        <div className="relative group min-w-[180px]">
          <select
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
            className="w-full bg-[#F4F3EF] border-none rounded-2xl py-3 pl-12 pr-10 text-[11px] font-black uppercase tracking-wider outline-none appearance-none cursor-pointer transition-all hover:bg-[#EAE9E4] text-[#4B4B5E]"
          >
            <option value="all">ALL DEPARTMENTS</option>
            {uniqueDepts.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
          <FiChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 text-[#9B9BAD] pointer-events-none" size={16} />
        </div>
      </div>

      <div className="bg-white rounded-[32px] border border-[#F4F3EF] overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-white border-b border-[#F4F3EF]">
                <th className="px-8 py-5 text-[11px] font-black text-[#9B9BAD] uppercase tracking-[2px] text-left">Employee</th>
                <th className="px-8 py-5 text-[11px] font-black text-[#9B9BAD] uppercase tracking-[2px] text-left">Issue & Date</th>
                <th className="px-8 py-5 text-[11px] font-black text-[#9B9BAD] uppercase tracking-[2px] text-left">Status</th>
                <th className="px-8 py-5 text-[11px] font-black text-[#9B9BAD] uppercase tracking-[2px] text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F4F3EF]">
              {filteredTickets.length === 0 ? (
                <tr>
                  <td colSpan="4" className="px-8 py-24 text-center">
                    <p className="text-sm font-bold text-[#9B9BAD] uppercase tracking-widest">No tickets found</p>
                  </td>
                </tr>
              ) : (
                filteredTickets.map((row) => (
                  <tr key={row.id} onClick={() => setSelectedTicket(row)} className="hover:bg-[#F8FAFF] transition-all group cursor-pointer">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#0D47A1] border border-blue-100 flex items-center justify-center font-bold text-sm">
                          {row.employeeName.charAt(0)}
                        </div>
                        <div className={`text-left font-bold text-sm text-[#1A1A2E] transition-all ${row.status === 'Resolved' ? 'line-through opacity-50' : ''}`}>
                          {row.employeeName}
                          <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest mt-0.5 no-underline">{row.department}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6 max-w-[300px]">
                      <div className={`text-left transition-all ${row.status === 'Resolved' ? 'line-through opacity-50' : ''}`}>
                        <p className="text-sm font-bold text-[#4B4B5E] truncate">{row.issue}</p>
                        <p className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-widest mt-0.5 no-underline">{row.date}</p>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-wider ${STATUS_COLORS[row.status]}`}>
                        {row.status}
                      </span>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center justify-end gap-3">
                        {row.status === 'Pending' && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleResolve(row.id);
                            }}
                            className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl hover:bg-emerald-100 hover:scale-105 active:scale-95 transition-all"
                            title="Mark as Resolved"
                          >
                            <FiCheckCircle size={18} />
                          </button>
                        )}
                        <button className="p-2.5 bg-[#F4F3EF] text-[#1B4DA0] rounded-xl group-hover:bg-blue-50 transition-colors">
                          <FiChevronRight size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {typeof document !== 'undefined' && createPortal(
        <AnimatePresence>
          {selectedTicket && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-[#1A1A2E66] backdrop-blur-md transition-opacity pointer-events-auto z-[200000]"
                onClick={() => setSelectedTicket(null)}
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
                  <h3 className="text-xl font-bold text-[#1A1A2E]" style={{ fontFamily: "'Syne', sans-serif" }}>Ticket Details</h3>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setSelectedTicket(null)}
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
                        <span>{selectedTicket.employeeName.charAt(0)}</span>
                      </div>
                    </div>
                    <div className="space-y-1.5 w-full flex flex-col items-center">
                      <h4 className="text-2xl font-bold text-[#1A1A2E] tracking-tight font-syne">{selectedTicket.employeeName}</h4>
                      <p className="text-[11px] font-bold text-[#0D47A1] uppercase tracking-[3px]">{selectedTicket.department} Dept</p>
                    </div>
                  </div>

                  <div className="bg-[#FAFAF8] rounded-[32px] border border-[#F4F3EF] p-8 space-y-10 shadow-sm">
                    
                    <div className="space-y-6">
                      <div className="flex items-center gap-3 border-b border-[#F4F3EF] pb-4">
                        <FiUser className="text-[#1B4DA0]" size={18} />
                        <h5 className="text-[12px] font-black text-[#1A1A2E] uppercase tracking-wider">Employee Info</h5>
                      </div>
                      <div className="grid grid-cols-2 gap-x-8 gap-y-6">
                        <InfoItem label="Name" value={selectedTicket.employeeName} />
                        <InfoItem label="Department" value={selectedTicket.department} />
                      </div>
                    </div>

                    <div className="space-y-6">
                      <div className="flex items-center gap-3 border-b border-[#F4F3EF] pb-4">
                        <FiAlertCircle className="text-[#1B4DA0]" size={18} />
                        <h5 className="text-[12px] font-black text-[#1A1A2E] uppercase tracking-wider">Issue Details</h5>
                      </div>
                      <div className="grid grid-cols-1 gap-y-6">
                        <InfoItem label="Description" value={selectedTicket.issue} />
                        <div className="grid grid-cols-2 gap-x-8 gap-y-6">
                          <InfoItem label="Raised On" value={selectedTicket.date} />
                          <InfoItem label="Status" value={selectedTicket.status} />
                        </div>
                      </div>
                    </div>

                    {selectedTicket.status === 'Pending' && (
                      <div className="pt-2">
                        <button
                          onClick={() => handleResolve(selectedTicket.id)}
                          className="w-full py-4 bg-[#1B4DA0] text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-blue-500/20 flex items-center justify-center gap-3 hover:bg-[#153D80] transition-colors"
                        >
                          <FiCheckCircle size={20} /> Mark as Resolved
                        </button>
                      </div>
                    )}

                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>,
        document.body
      )}
    </div>
  );
};

export default SuperAdminInternalSupportTab;
