import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { FiSearch, FiChevronDown, FiChevronRight, FiX, FiCheckCircle, FiUser, FiAlertCircle, FiPlus, FiSend } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';

const STATUS_COLORS = {
  "Pending": "bg-amber-50 text-amber-600 border-amber-100",
  "Resolved": "bg-emerald-50 text-emerald-600 border-emerald-100",
};

const initialMockTickets = [
  {
    id: 'tkt-emp-001',
    issue: 'Need access to the new CRM analytics dashboard.',
    date: 'May 16, 2026',
    status: 'Resolved',
    priority: 'Medium',
    description: 'I am unable to see the Analytics tab in my CRM view. It says access denied.'
  },
  {
    id: 'tkt-emp-002',
    issue: 'Laptop running very slow with multiple Chrome tabs.',
    date: 'May 18, 2026',
    status: 'Pending',
    priority: 'High',
    description: 'Whenever I open more than 5 tabs, the system freezes. Need RAM upgrade or a replacement.'
  }
];

const InfoItem = ({ label, value }) => (
  <div>
    <p className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-widest mb-1.5">{label}</p>
    <div className="bg-white border border-[#F4F3EF] rounded-xl px-4 py-3 min-h-[44px] flex items-center text-left">
      <span className="text-[13px] font-bold text-[#1A1A2E]">{value || 'N/A'}</span>
    </div>
  </div>
);

const EmployeeHelpSupportTab = () => {
  const [tickets, setTickets] = useState(initialMockTickets);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedTicket, setSelectedTicket] = useState(null);
  
  const [isRaiseTicketOpen, setIsRaiseTicketOpen] = useState(false);
  const [newTicket, setNewTicket] = useState({ issue: '', description: '', priority: 'Medium' });

  const filteredTickets = tickets.filter(t => {
    const matchesSearch = t.issue.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || t.status.toLowerCase() === statusFilter.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  const handleRaiseTicket = (e) => {
    e.preventDefault();
    if (!newTicket.issue.trim()) return;
    
    const ticket = {
      id: `tkt-emp-00${tickets.length + 1}`,
      issue: newTicket.issue,
      description: newTicket.description,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      status: 'Pending',
      priority: newTicket.priority
    };
    
    setTickets([ticket, ...tickets]);
    setIsRaiseTicketOpen(false);
    setNewTicket({ issue: '', description: '', priority: 'Medium' });
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 font-jakarta text-left">
      <div className="flex items-center justify-between text-left">
        <h1 className="text-3xl font-bold text-[#1A1A2E] font-syne tracking-tight" style={{ fontFamily: "'Syne', sans-serif" }}>My Support Tickets</h1>
        <button
          onClick={() => setIsRaiseTicketOpen(true)}
          className="flex items-center justify-center gap-2 px-6 py-3 bg-[#1B4DA0] hover:bg-[#153D80] text-white rounded-xl font-bold text-sm transition-all shadow-lg shadow-blue-500/20 active:scale-95"
        >
          <FiPlus size={18} /> Raise Ticket
        </button>
      </div>

      <div className="bg-white rounded-[24px] p-2 border border-[#F4F3EF] shadow-sm flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 group min-w-[200px]">
          <FiSearch className="absolute left-5 top-1/2 -translate-y-1/2 text-[#9B9BAD]" size={18} />
          <input
            type="text"
            placeholder="Search your tickets..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#F4F3EF] border-none rounded-2xl py-3 pl-14 pr-5 text-sm font-medium outline-none transition-all placeholder:text-[#9B9BAD]"
          />
        </div>

        <div className="relative group min-w-[180px]">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full bg-[#F4F3EF] border-none rounded-2xl py-3 pl-12 pr-10 text-[11px] font-black uppercase tracking-wider outline-none appearance-none cursor-pointer transition-all hover:bg-[#EAE9E4] text-[#4B4B5E]"
          >
            <option value="all">ALL STATUS</option>
            <option value="pending">PENDING</option>
            <option value="resolved">RESOLVED</option>
          </select>
          <FiChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 text-[#9B9BAD] pointer-events-none" size={16} />
        </div>
      </div>

      <div className="bg-white rounded-[32px] border border-[#F4F3EF] overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-white border-b border-[#F4F3EF]">
                <th className="px-8 py-5 text-[11px] font-black text-[#9B9BAD] uppercase tracking-[2px] text-left">Ticket Info</th>
                <th className="px-8 py-5 text-[11px] font-black text-[#9B9BAD] uppercase tracking-[2px] text-left">Status</th>
                <th className="px-8 py-5 text-[11px] font-black text-[#9B9BAD] uppercase tracking-[2px] text-left">Date</th>
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
                    <td className="px-8 py-6 max-w-[300px]">
                      <div className={`text-left transition-all`}>
                        <p className="text-sm font-bold text-[#1A1A2E] truncate group-hover:text-[#1B4DA0]">{row.issue}</p>
                        <p className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-widest mt-0.5">{row.id}</p>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider border ${STATUS_COLORS[row.status]}`}>
                        {row.status}
                      </span>
                    </td>
                    <td className="px-8 py-6">
                      <p className="text-sm font-bold text-[#4B4B5E]">{row.date}</p>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center justify-end gap-3">
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
                className="fixed inset-y-0 right-0 w-full max-w-[600px] bg-white shadow-2xl border-l border-[#F4F3EF] flex flex-col z-[200001] overflow-hidden pointer-events-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="p-6 border-b border-[#F4F3EF] flex items-center justify-between bg-gradient-to-r from-blue-50/30 to-white">
                  <h3 className="text-xl font-bold text-[#1A1A2E]" style={{ fontFamily: "'Syne', sans-serif" }}>Ticket Details</h3>
                  <button
                    onClick={() => setSelectedTicket(null)}
                    className="w-10 h-10 rounded-2xl flex items-center justify-center text-[#9B9BAD] hover:text-red-500 hover:bg-red-50 transition-all duration-300"
                  >
                    <FiX size={20} />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto px-10 py-8 space-y-8 custom-scrollbar text-left">
                  <div className="bg-[#FAFAF8] rounded-[32px] border border-[#F4F3EF] p-8 space-y-8 shadow-sm">
                    <div className="space-y-6">
                      <div className="flex items-center justify-between border-b border-[#F4F3EF] pb-4">
                        <div className="flex items-center gap-3">
                          <FiAlertCircle className="text-[#1B4DA0]" size={18} />
                          <h5 className="text-[12px] font-black text-[#1A1A2E] uppercase tracking-wider">Issue Information</h5>
                        </div>
                        <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider border ${STATUS_COLORS[selectedTicket.status]}`}>
                          {selectedTicket.status}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-1 gap-y-6">
                        <div>
                          <p className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-widest mb-1.5">Ticket ID</p>
                          <p className="text-sm font-bold text-[#1A1A2E]">{selectedTicket.id}</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-widest mb-1.5">Date Raised</p>
                          <p className="text-sm font-bold text-[#1A1A2E]">{selectedTicket.date}</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-widest mb-1.5">Summary</p>
                          <p className="text-[15px] font-bold text-[#1A1A2E]">{selectedTicket.issue}</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-widest mb-1.5">Detailed Description</p>
                          <div className="bg-white border border-[#F4F3EF] rounded-xl px-4 py-4 mt-2">
                            <p className="text-[14px] text-[#4B4B5E] leading-relaxed whitespace-pre-wrap">{selectedTicket.description || 'No additional details provided.'}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </>
          )}

          {isRaiseTicketOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-[#1A1A2E66] backdrop-blur-md transition-opacity pointer-events-auto z-[200000]"
                onClick={() => setIsRaiseTicketOpen(false)}
              />

              <motion.div
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'spring', damping: 30, stiffness: 200 }}
                className="fixed inset-y-0 right-0 w-full max-w-[600px] bg-white shadow-2xl border-l border-[#F4F3EF] flex flex-col z-[200001] overflow-hidden pointer-events-auto text-left"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="p-6 border-b border-[#F4F3EF] flex items-center justify-between bg-gradient-to-r from-blue-50/30 to-white">
                  <h3 className="text-xl font-bold text-[#1A1A2E]" style={{ fontFamily: "'Syne', sans-serif" }}>Raise New Ticket</h3>
                  <button
                    onClick={() => setIsRaiseTicketOpen(false)}
                    className="w-10 h-10 rounded-2xl flex items-center justify-center text-[#9B9BAD] hover:text-red-500 hover:bg-red-50 transition-all duration-300"
                  >
                    <FiX size={20} />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto px-10 py-8 custom-scrollbar">
                  <form onSubmit={handleRaiseTicket} className="space-y-8">
                    <div className="space-y-2">
                      <label className="text-[11px] font-black text-[#9B9BAD] uppercase tracking-widest">Issue Summary *</label>
                      <input
                        type="text"
                        required
                        placeholder="E.g., Cannot access the new dashboard"
                        value={newTicket.issue}
                        onChange={(e) => setNewTicket({...newTicket, issue: e.target.value})}
                        className="w-full bg-[#F4F3EF] border border-transparent focus:border-[#1B4DA0]/30 rounded-2xl px-5 py-4 text-[14px] font-bold text-[#1A1A2E] outline-none transition-all placeholder:text-[#9B9BAD]"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-[11px] font-black text-[#9B9BAD] uppercase tracking-widest">Priority</label>
                      <div className="relative">
                        <select
                          value={newTicket.priority}
                          onChange={(e) => setNewTicket({...newTicket, priority: e.target.value})}
                          className="w-full bg-[#F4F3EF] border border-transparent focus:border-[#1B4DA0]/30 rounded-2xl px-5 py-4 text-[14px] font-bold text-[#1A1A2E] outline-none transition-all appearance-none cursor-pointer"
                        >
                          <option value="Low">Low</option>
                          <option value="Medium">Medium</option>
                          <option value="High">High</option>
                          <option value="Critical">Critical</option>
                        </select>
                        <FiChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 text-[#9B9BAD] pointer-events-none" size={18} />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[11px] font-black text-[#9B9BAD] uppercase tracking-widest">Detailed Description</label>
                      <textarea
                        rows="6"
                        placeholder="Please provide any additional details that will help us resolve your issue..."
                        value={newTicket.description}
                        onChange={(e) => setNewTicket({...newTicket, description: e.target.value})}
                        className="w-full bg-[#F4F3EF] border border-transparent focus:border-[#1B4DA0]/30 rounded-2xl px-5 py-4 text-[14px] font-medium text-[#1A1A2E] outline-none transition-all placeholder:text-[#9B9BAD] resize-none"
                      />
                    </div>
                  </form>
                </div>
                
                <div className="p-6 border-t border-[#F4F3EF] bg-white">
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => setIsRaiseTicketOpen(false)}
                      className="flex-1 py-4 bg-[#F4F3EF] text-[#6B6B7E] rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-[#E8E7E2] transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleRaiseTicket}
                      disabled={!newTicket.issue.trim()}
                      className="flex-1 py-4 bg-[#1B4DA0] text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-blue-500/20 flex items-center justify-center gap-3 hover:bg-[#153D80] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <FiSend size={18} /> Submit Ticket
                    </button>
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

export default EmployeeHelpSupportTab;
