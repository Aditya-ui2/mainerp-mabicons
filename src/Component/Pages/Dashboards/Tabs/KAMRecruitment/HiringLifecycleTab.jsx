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
  FiMessageSquare,
  FiExternalLink,
  FiMoreVertical,
  FiUser,
  FiChevronRight,
  FiChevronDown,
  FiX
} from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';

const HiringLifecycleTab = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterClient, setFilterClient] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [loading, setLoading] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState(null);

  // Mock data for Hired Candidates and their Check-ins
  const [lifecycleData, setLifecycleData] = useState([
    {
      id: 1,
      candidate: 'Dhiru Sharma',
      client: 'Zomato',
      position: 'HR Operations Team Leader',
      joiningDate: '2024-01-15',
      lastCheckin: '2024-04-15',
      nextCheckin: '2024-07-15',
      status: 'On Track',
      contact: '+91 98765 43210',
      checkinCount: 1,
      performance: 'Excellent'
    },
    {
      id: 2,
      candidate: 'Aryan Kumar',
      client: 'Wipro',
      position: 'Full Stack Developer',
      joiningDate: '2023-11-20',
      lastCheckin: '2024-02-20',
      nextCheckin: '2024-05-20',
      status: 'Due Soon',
      contact: '+91 88888 77777',
      checkinCount: 1,
      performance: 'Good'
    },
    {
      id: 3,
      candidate: 'Priya Verma',
      client: 'TCS',
      position: 'Project Manager',
      joiningDate: '2023-10-05',
      lastCheckin: '2024-01-05',
      nextCheckin: '2024-04-05',
      status: 'Overdue',
      contact: '+91 77777 66666',
      checkinCount: 1,
      performance: 'Average'
    },
    {
      id: 4,
      candidate: 'Rahul Singh',
      client: 'Flipkart',
      position: 'Supply Chain Head',
      joiningDate: '2024-03-01',
      lastCheckin: '-',
      nextCheckin: '2024-06-01',
      status: 'On Track',
      contact: '+91 99999 00000',
      checkinCount: 0,
      performance: 'New Joining'
    }
  ]);

  const stats = [
    { label: 'Total Hired', value: lifecycleData.length, color: 'bg-blue-500', icon: FiCheckCircle },
    { label: 'Due Next 7 Days', value: lifecycleData.filter(x => x.status === 'Due Soon').length, color: 'bg-amber-500', icon: FiClock },
    { label: 'Overdue Updates', value: lifecycleData.filter(x => x.status === 'Overdue').length, color: 'bg-rose-500', icon: FiAlertCircle },
    { label: 'Retention Rate', value: '94%', color: 'bg-emerald-500', icon: FiCalendar },
  ];

  const getStatusStyle = (status) => {
    switch (status) {
      case 'On Track': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
      case 'Due Soon': return 'bg-amber-50 text-amber-600 border-amber-100';
      case 'Overdue': return 'bg-rose-50 text-rose-600 border-rose-100';
      default: return 'bg-slate-50 text-slate-400 border-slate-100';
    }
  };

  const handleLogAction = (candidateId, type) => {
    alert(`Logged ${type} for candidate ID: ${candidateId}`);
  };

  const filteredData = lifecycleData.filter(item => {
    const matchesSearch = item.candidate.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          item.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          item.position.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesClient = filterClient === 'all' || item.client === filterClient;
    const matchesStatus = filterStatus === 'all' || item.status === filterStatus;
    return matchesSearch && matchesClient && matchesStatus;
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-500 font-jakarta">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="text-left">
          <h1 className="text-3xl font-bold text-[#1A1A2E] tracking-tight font-syne">
            Hiring 
          </h1>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-[24px] p-2 border border-[#F4F3EF] shadow-sm flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 group min-w-[200px]">
          <FiSearch className="absolute left-5 top-1/2 -translate-y-1/2 text-[#9B9BAD]" size={18} />
          <input
            type="text"
            placeholder="Search candidates, clients..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#F4F3EF] border-none rounded-2xl py-3 pl-14 pr-5 text-sm font-medium outline-none transition-all placeholder:text-[#9B9BAD]"
          />
        </div>
        
        <div className="relative">
          <select 
            value={filterClient}
            onChange={(e) => setFilterClient(e.target.value)}
            className="bg-[#F4F3EF] text-xs font-bold uppercase tracking-wider text-[#1A1A2E] rounded-xl pl-4 pr-10 py-2.5 outline-none border-0 cursor-pointer appearance-none min-w-[150px]"
          >
            <option value="all">All Clients</option>
            <option value="Zomato">Zomato</option>
            <option value="Wipro">Wipro</option>
            <option value="TCS">TCS</option>
          </select>
          <FiChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#1B4DA0] pointer-events-none" />
        </div>

        <div className="relative">
          <select 
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-[#F4F3EF] text-xs font-bold uppercase tracking-wider text-[#1A1A2E] rounded-xl pl-4 pr-10 py-2.5 outline-none border-0 cursor-pointer appearance-none min-w-[140px]"
          >
            <option value="all">All Status</option>
            <option value="On Track">On Track</option>
            <option value="Due Soon">Due Soon</option>
            <option value="Overdue">Overdue</option>
          </select>
          <FiChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#1B4DA0] pointer-events-none" />
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-[32px] border border-[#F4F3EF] overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-white border-b border-[#F4F3EF]">
                <th className="px-8 py-5 text-[11px] font-black text-[#9B9BAD] uppercase tracking-[2px] text-left">Candidate & Position</th>
                <th className="px-8 py-5 text-[11px] font-black text-[#9B9BAD] uppercase tracking-[2px] text-left">Client & Joining</th>
                <th className="px-8 py-5 text-[11px] font-black text-[#9B9BAD] uppercase tracking-[2px] text-left">Schedule</th>
                <th className="px-8 py-5 text-[11px] font-black text-[#9B9BAD] uppercase tracking-[2px] text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F4F3EF]">
              {filteredData.map((row) => (
                <tr 
                  key={row.id} 
                  onClick={() => setSelectedCandidate(row)}
                  className="hover:bg-[#F8FAFF] transition-all group cursor-pointer"
                >
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#0D47A1] flex items-center justify-center font-bold text-sm border border-blue-100 group-hover:scale-105 transition-transform">
                        {row.candidate.charAt(0)}
                      </div>
                      <div className="text-left">
                        <p className="text-sm font-bold text-[#1A1A2E]">{row.candidate}</p>
                        <p className="text-[10px] font-bold text-[#9B9BAD] uppercase tracking-wider mt-0.5">{row.position}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="text-left">
                      <p className="text-sm font-bold text-[#4B4B5E]">{row.client}</p>
                      <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest mt-0.5">Joined: {row.joiningDate}</p>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="text-left">
                      <div className="flex items-center gap-1.5 mb-1">
                        <FiClock size={12} className="text-[#9B9BAD]" />
                        <span className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-widest">Next Check-in</span>
                      </div>
                      <p className="text-sm font-bold text-[#1A1A2E]">{row.nextCheckin}</p>
                      <p className="text-[9px] font-bold text-slate-400 mt-0.5">Last: {row.lastCheckin}</p>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center justify-end">
                      <button className="p-2.5 bg-[#F4F3EF] text-[#1B4DA0] hover:text-[#0D47A1] rounded-xl transition-all shadow-sm active:scale-95">
                        <FiChevronRight size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredData.length === 0 && (
            <div className="py-24 text-center">
              <div className="w-16 h-16 rounded-[24px] bg-slate-50 border border-slate-100 flex items-center justify-center mx-auto mb-4 text-slate-200">
                <FiUser size={24} />
              </div>
              <p className="text-[#9B9BAD] text-sm font-bold uppercase tracking-widest">No candidates found for review</p>
            </div>
          )}
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
    </div>
  );
};

// Detail Drawer Component
const CandidateDetailDrawer = ({ candidate, onClose }) => {
  if (!candidate) return null;

  return createPortal(
    <div className="fixed inset-0 z-[10001] flex justify-end font-jakarta">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-[#1A1A2E66] backdrop-blur-md transition-opacity"
        onClick={onClose}
      />
      
      <motion.div 
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="w-full max-w-[520px] fixed right-0 top-0 bottom-0 flex flex-col z-[10002] shadow-[-12px_0_40px_rgba(0,0,0,0.15)] overflow-hidden bg-white text-slate-900"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-8 border-b border-[#F4F3EF] bg-white">
          <div className="text-left">
            <h2 className="text-[32px] font-bold leading-tight text-[#1A1A2E] font-syne">
              {candidate.candidate}
            </h2>
            <div className="flex items-center gap-2 mt-2">
              <p className="text-[10px] font-bold uppercase tracking-[2px] text-[#9B9BAD]">
                {candidate.client} • {candidate.position}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={onClose}
              className="w-10 h-10 rounded-xl flex items-center justify-center border border-[#F4F3EF] text-[#6B6B7E] hover:text-red-500 hover:bg-red-50 transition-all duration-300 shadow-sm"
            >
              <FiX size={20} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 p-10 space-y-12 overflow-y-auto custom-scrollbar text-left">
          {/* Information Grid */}
          <div className="grid grid-cols-2 gap-x-8 gap-y-12">
            <div>
              <p className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-[0.2em] mb-2 font-jakarta">Primary Contact</p>
              <p className="text-[15px] font-black text-[#1A1A2E] font-jakarta">{candidate.contact}</p>
            </div>
            <div>
              <p className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-[0.2em] mb-2 font-jakarta">Joining Date</p>
              <p className="text-[15px] font-black text-[#1A1A2E] font-jakarta">{candidate.joiningDate}</p>
            </div>
            <div>
              <p className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-[0.2em] mb-2 font-jakarta">Performance Score</p>
              <p className="text-[15px] font-black text-emerald-600 font-jakarta">{candidate.performance}</p>
            </div>
            <div>
              <p className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-[0.2em] mb-2 font-jakarta">Review Cycle</p>
              <p className="text-[15px] font-black text-[#1A1A2E] font-jakarta">Every 3 Months</p>
            </div>
          </div>

          <div className="border-t border-[#F4F3EF]" />

          {/* Retention Timeline */}
          <section className="px-2">
            <div className="flex items-center gap-2 mb-8">
              <FiClock size={14} className="text-[#1B4DA0]" />
              <h3 className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-[0.2em] font-jakarta">Retention Protocol Asset</h3>
            </div>
            
            <div className="relative pl-8 space-y-10 before:content-[''] before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[2px] before:bg-blue-50">
              <div className="relative">
                <div className="absolute -left-9 w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center text-white border-4 border-white shadow-sm ring-4 ring-emerald-50">
                  <FiCheckCircle size={10} />
                </div>
                <div>
                  <p className="text-[13px] font-black text-[#1A1A2E] uppercase tracking-tight font-jakarta">Joined {candidate.client}</p>
                  <p className="text-[11px] font-bold text-[#9B9BAD] mt-0.5 font-jakarta">{candidate.joiningDate}</p>
                </div>
              </div>

              <div className="relative">
                <div className={`absolute -left-9 w-6 h-6 rounded-full flex items-center justify-center text-white border-4 border-white shadow-sm ring-4 ${candidate.checkinCount > 0 ? 'bg-emerald-500 ring-emerald-50' : 'bg-amber-500 ring-amber-50'}`}>
                  {candidate.checkinCount > 0 ? <FiCheckCircle size={10} /> : <FiClock size={10} />}
                </div>
                <div>
                  <p className="text-[13px] font-black text-[#1A1A2E] uppercase tracking-tight font-jakarta">3rd Month Check-in</p>
                  <p className="text-[11px] font-bold text-[#9B9BAD] mt-0.5 font-jakarta">{candidate.lastCheckin !== '-' ? candidate.lastCheckin : 'Pending Implementation'}</p>
                  {candidate.lastCheckin !== '-' && (
                    <div className="mt-4 p-5 bg-slate-50 border-2 border-dashed border-slate-200 rounded-[2rem] text-[13px] font-bold text-[#4B4B5E] italic leading-relaxed font-jakarta">
                      "Settling in well, client is happy with the initial deliveries. No immediate concerns."
                      <div className="mt-3 flex items-center gap-2 not-italic">
                        <div className="w-4 h-4 rounded-full bg-blue-100" />
                        <span className="text-[9px] uppercase tracking-widest text-[#9B9BAD] font-jakarta">Verified by Recruitment Head</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="relative opacity-50">
                <div className="absolute -left-9 w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-white border-4 border-white shadow-sm ring-4 ring-slate-50">
                  <FiClock size={10} />
                </div>
                <div>
                  <p className="text-[13px] font-black text-[#1A1A2E] uppercase tracking-tight font-jakarta">Next Scheduled Review</p>
                  <p className="text-[11px] font-bold text-[#9B9BAD] mt-0.5 font-jakarta">{candidate.nextCheckin}</p>
                </div>
              </div>
            </div>
          </section>

          <div className="border-t border-[#F4F3EF]" />
        </div>
      </motion.div>
    </div>,
    document.body
  );
};

export default HiringLifecycleTab;
