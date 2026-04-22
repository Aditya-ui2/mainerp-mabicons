import React, { useState } from 'react';
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
  FiX
} from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

// Sub-component defined above to avoid any hoisting confusion
const CandidateDetailDrawer = ({ candidate, onClose, onUpdateMilestone, onMarkLeft }) => {
  const [showConfirm, setShowConfirm] = useState(false);
  const [pendingMonth, setPendingMonth] = useState(null);
  const [isMarkLeft, setIsMarkLeft] = useState(false);

  if (!candidate) return null;

  const handleActionClick = (month, left) => {
    if (!left && candidate.completedMilestones?.includes(month)) {
      toast.info("This milestone is already secured");
      return;
    }
    setPendingMonth(month);
    setIsMarkLeft(left);
    setShowConfirm(true);
  };

  const handleConfirmAction = () => {
    if (isMarkLeft) {
      onMarkLeft();
    } else {
      onUpdateMilestone(pendingMonth);
    }
    setShowConfirm(false);
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
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="w-full max-w-[520px] fixed right-0 top-0 bottom-0 flex flex-col z-[10002] shadow-[-12px_0_40px_rgba(0,0,0,0.15)] overflow-hidden bg-white text-slate-900 pointer-events-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-8 border-b border-[#F4F3EF] bg-white">
          <div className="text-left font-jakarta">
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
              className="w-10 h-10 rounded-xl flex items-center justify-center border border-[#F4F3EF] text-[#6B6B7E] hover:text-red-500 hover:bg-red-50 transition-all duration-300 shadow-sm pointer-events-auto"
            >
              <FiX size={20} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 p-10 space-y-12 overflow-y-auto custom-scrollbar text-left font-jakarta pointer-events-auto">
          {/* Information Grid */}
          <div className="grid grid-cols-2 gap-x-8 gap-y-12">
            <div>
              <p className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-[0.2em] mb-2">Primary Contact</p>
              <p className="text-[15px] font-black text-[#1A1A2E]">{candidate.contact}</p>
            </div>
            <div>
              <p className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-[0.2em] mb-2">Joining Date</p>
              <p className="text-[15px] font-black text-[#1A1A2E]">{candidate.joiningDate}</p>
            </div>
            <div>
              <p className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-[0.2em] mb-2">Performance Score</p>
              <p className="text-[15px] font-black text-emerald-600">{candidate.performance}</p>
            </div>
            <div>
              <p className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-[0.2em] mb-2">Review Cycle</p>
              <p className="text-[15px] font-black text-[#1A1A2E]">Every 3 Months</p>
            </div>
          </div>

          <div className="border-t border-[#F4F3EF]" />

          {/* Retention Timeline */}
          <section className="px-2">
            <div className="flex items-center gap-2 mb-8">
              <FiClock size={16} className="text-[#1B4DA0]" />
              <h3 className="text-[11px] font-black text-[#1A1A2E] uppercase tracking-[0.2em]">Retention Protocol Status</h3>
            </div>
            
            {/* Quick Actions Panel */}
            <div className="mb-10 p-8 bg-slate-100/50 rounded-[2.5rem] border border-slate-200/50 backdrop-blur-sm">
              <p className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-[2px] mb-6 px-4">Secure Milestones</p>
              <div className="grid grid-cols-3 gap-4 mb-6">
                {[1, 2, 3].map(month => {
                  const isCompleted = candidate.completedMilestones?.includes(month);
                  return (
                    <button 
                      key={month}
                      onClick={() => handleActionClick(month, false)}
                      className={`flex flex-col items-center justify-center py-6 rounded-[2rem] border transition-all group relative overflow-hidden cursor-pointer shadow-md active:scale-95 ${
                        isCompleted 
                        ? 'bg-emerald-500 border-emerald-500 text-white shadow-emerald-500/20' 
                        : 'bg-white border-slate-200 text-slate-400 hover:border-[#1B4DA0] hover:text-[#1B4DA0]'
                      }`}
                    >
                      <span className="text-[9px] font-black uppercase tracking-widest leading-none mb-1 pointer-events-none">Month</span>
                      <span className="text-2xl font-black group-hover:scale-110 transition-transform pointer-events-none">0{month}</span>
                    </button>
                  );
                })}
              </div>
              <button 
                onClick={() => handleActionClick(null, true)}
                className="w-full py-5 bg-rose-50 text-rose-600 border border-rose-100 rounded-[2rem] text-xs font-black uppercase tracking-[3px] shadow-sm hover:bg-rose-600 hover:text-white transition-all cursor-pointer text-center active:scale-[0.98] font-bold"
              >
                Mark Candidate as Left
              </button>
            </div>
            
            <div className="relative pl-8 space-y-12 before:content-[''] before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[2.5px] before:bg-slate-100">
              <div className="relative">
                <div className="absolute -left-9 w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center text-white border-4 border-white shadow-md ring-4 ring-emerald-50 scale-110">
                  <FiCheckCircle size={10} />
                </div>
                <div>
                  <p className="text-[13px] font-black text-[#1A1A2E] uppercase tracking-tight">Joined {candidate.client}</p>
                  <p className="text-[11px] font-bold text-[#9B9BAD] mt-0.5">{candidate.joiningDate}</p>
                </div>
              </div>

              {/* Dynamic Milestones */}
              {candidate.completedMilestones?.map(month => (
                <div key={month} className="relative">
                  <div className="absolute -left-9 w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center text-white border-4 border-white shadow-md ring-4 ring-emerald-50 scale-110">
                    <FiCheckCircle size={10} />
                  </div>
                  <div>
                    <p className="text-[13px] font-black text-[#1A1A2E] uppercase tracking-tight">{month} Month Check-in</p>
                    <p className="text-[11px] font-black text-emerald-500 mt-1 uppercase tracking-widest">Milestone Secured</p>
                  </div>
                </div>
              ))}

              <div className="relative">
                <div className={`absolute -left-9 w-6 h-6 rounded-full flex items-center justify-center text-white border-4 border-white shadow-md ring-4 ${(candidate.completedMilestones?.length || 0) > 0 ? 'bg-emerald-500 ring-emerald-50' : 'bg-amber-500 ring-amber-50'}`}>
                  {(candidate.completedMilestones?.length || 0) > 0 ? <FiCheckCircle size={10} /> : <FiClock size={10} />}
                </div>
                <div>
                  <p className="text-[13px] font-black text-[#1A1A2E] uppercase tracking-tight">Current Status</p>
                  <p className="text-[11px] font-bold text-[#9B9BAD] mt-1">{(candidate.completedMilestones?.length || 0) > 0 ? 'Documentation in progress' : 'Awaiting first milestone'}</p>
                </div>
              </div>
            </div>
          </section>

          <div className="border-t border-[#F4F3EF] pt-8" />
        </div>

        {/* Confirmation Modal */}
        <AnimatePresence>
          {showConfirm && (
            <div className="fixed inset-0 z-[10100] flex items-center justify-center p-6 pointer-events-auto">
              <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                exit={{ opacity: 0 }} 
                className="absolute inset-0 bg-[#000000]/80 backdrop-blur-xl" 
                onClick={() => setShowConfirm(false)}
              />
              <motion.div 
                initial={{ scale: 0.9, opacity: 0, y: 30 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 30 }}
                className="relative w-full max-w-[400px] bg-white rounded-[40px] p-10 shadow-[0_32px_64px_rgba(0,0,0,0.5)] overflow-hidden border border-slate-100 flex flex-col items-center"
              >
                <div className={`w-20 h-20 rounded-[30px] flex items-center justify-center mb-8 ${isMarkLeft ? 'bg-rose-50 text-rose-500' : 'bg-blue-50 text-blue-500'}`}>
                  {isMarkLeft ? <FiAlertCircle size={40} /> : <FiClock size={40} />}
                </div>
                <h3 className="text-3xl font-bold text-[#1A1A2E] text-center mb-4 font-syne">Are you sure?</h3>
                <p className="text-[15px] leading-relaxed text-[#6B6B7E] text-center mb-10 font-medium px-4">
                  {isMarkLeft ? `Mark ${candidate.candidate} as resigned?` : `Confirm Month ${pendingMonth} milestone for ${candidate.candidate}?`}
                </p>
                <div className="flex flex-col gap-4 w-full">
                  <button onClick={handleConfirmAction} className={`w-full py-5 rounded-[20px] text-[13px] font-black uppercase tracking-[3px] text-white shadow-xl transition-all active:scale-[0.95] ${isMarkLeft ? 'bg-rose-600 hover:bg-rose-700' : 'bg-[#1B4DA0] hover:bg-blue-700'}`}>
                    Confirm
                  </button>
                  <button onClick={() => setShowConfirm(false)} className="w-full py-5 bg-[#F4F3EF] text-[#6B6B7E] rounded-[20px] text-[13px] font-black uppercase tracking-[3px] hover:bg-slate-200 active:scale-[0.95]">
                    Go Back
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>,
    document.body
  );
};

const HiringLifecycleTab = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterClient, setFilterClient] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  
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
      performance: 'Excellent',
      completedMilestones: []
    }
  ]);

  const handleUpdateMilestone = (month) => {
    if (!selectedCandidate) return;
    setLifecycleData(prev => prev.map(item => {
      if (item.id === selectedCandidate.id) {
        const currentMilestones = item.completedMilestones || [];
        if (!currentMilestones.includes(month)) {
          const newMilestones = [...currentMilestones, month].sort((a, b) => a - b);
          const updated = { ...item, completedMilestones: newMilestones };
          setSelectedCandidate(updated);
          return updated;
        }
      }
      return item;
    }));
    toast.success(`Milestone Month ${month} SECURED`);
  };

  const handleMarkAsLeft = () => {
    if (!selectedCandidate) return;
    setLifecycleData(prev => prev.map(item => {
      if (item.id === selectedCandidate.id) {
        return { ...item, status: 'Left' };
      }
      return item;
    }));
    toast.error(`${selectedCandidate.candidate} marked as Left`);
    setSelectedCandidate(null);
  };

  const filteredData = lifecycleData.filter(item => {
    const matchesSearch = item.candidate.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          item.client.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesClient = filterClient === 'all' || item.client === filterClient;
    const matchesStatus = filterStatus === 'all' || item.status === filterStatus;
    return matchesSearch && matchesClient && matchesStatus;
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-500 font-jakarta">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-[#1A1A2E] font-syne">Joined Candidates</h1>
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
              {filteredData.map((row) => (
                <tr key={row.id} onClick={() => setSelectedCandidate(row)} className="hover:bg-[#F8FAFF] transition-all group cursor-pointer">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#0D47A1] flex items-center justify-center font-bold text-sm border border-blue-100">{row.candidate.charAt(0)}</div>
                      <div className="text-left font-bold text-sm text-[#1A1A2E]">{row.candidate}</div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="text-left">
                      <p className="text-sm font-bold text-[#4B4B5E]">{row.client}</p>
                      <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest mt-0.5">Joined: {row.joiningDate}</p>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center justify-end">
                      <button className="p-2.5 bg-[#F4F3EF] text-[#1B4DA0] rounded-xl"><FiChevronRight size={18} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <AnimatePresence>
        {selectedCandidate && (
          <CandidateDetailDrawer 
            candidate={selectedCandidate} 
            onClose={() => setSelectedCandidate(null)} 
            onUpdateMilestone={handleUpdateMilestone}
            onMarkLeft={handleMarkAsLeft}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default HiringLifecycleTab;
