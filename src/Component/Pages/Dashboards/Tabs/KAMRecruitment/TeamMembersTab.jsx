import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiUsers,
  FiPlus,
  FiSearch,
  FiMail,
  FiPhone,
  FiMapPin,
  FiCheckCircle,
  FiClock,
  FiBriefcase,
  FiEdit2,
  FiTrash2,
  FiX,
  FiUser,
  FiChevronDown,
  FiAward,
  FiTarget,
  FiCalendar,
  FiSend,
  FiRefreshCw,
  FiActivity,
  FiChevronRight,
} from 'react-icons/fi';
import { getDepartmentTeamMembers, createDepartmentTask } from '../../service/api';


/* ══════════════════════════════════════════════════════ */
const TeamMembersTab = ({ isDarkMode, userRole = 'KAM' }) => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [assignmentType, setAssignmentType] = useState('candidate');
  const [assignNotes, setAssignNotes] = useState('');
  const [assignDueDate, setAssignDueDate] = useState('');
  const [assignTitle, setAssignTitle] = useState('');
  const [selectedRowIds, setSelectedRowIds] = useState([]);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showMemberDetails, setShowMemberDetails] = useState(false);
  const [toast, setToast] = useState(null);

  const fetchMembers = async () => {
    setLoading(true);
    try {
      const res = await getDepartmentTeamMembers('HR Recruitment');
      if (res?.success && res.data) {
        const mapped = res.data.map(m => ({
          id: m.id?.toString() || m._id,
          name: m.name,
          email: m.email,
          phone: m.phone || 'N/A',
          role: m.role || 'HR Recruiter',
          status: m.status || 'Active',
          joinDate: m.joinDate ? new Date(m.joinDate).toISOString().split('T')[0] : '',
          assignedCandidates: m.tasksAssigned || 0,
          interviews: m.tasksCompleted || 0,
          placements: m.tasksCompleted || 0,
          currentTasks: m.tasksAssigned || 0,
          photo: m.avatar || null,
          clients: [],
        }));
        setMembers(mapped);
      }
    } catch (err) {
      console.error('Failed to fetch team members:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, []);

  // Stats
  const stats = {
    totalMembers: members.length,
    activeMembers: members.filter(m => m.status === 'Active').length,
    totalCandidates: members.reduce((sum, m) => sum + m.assignedCandidates, 0),
    totalPlacements: members.reduce((sum, m) => sum + m.placements, 0),
  };

  const filteredMembers = members.filter(m =>
    m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAssignTask = (member) => {
    setSelectedMember(member);
    setShowAssignModal(true);
  };

  const handleViewDetails = (member) => {
    // Navigate to member details or open modal
    console.log('View details for:', member);
  };

  // Skeleton loader
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div className="space-y-2">
            <div className={`h-8 w-64 rounded-lg animate-pulse ${isDarkMode ? 'bg-slate-700' : 'bg-slate-200'}`}></div>
            <div className={`h-4 w-40 rounded-lg animate-pulse ${isDarkMode ? 'bg-slate-700' : 'bg-slate-200'}`}></div>
          </div>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className={`h-24 rounded-2xl animate-pulse ${isDarkMode ? 'bg-slate-800' : 'bg-slate-200'}`}></div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className={`h-48 rounded-2xl animate-pulse ${isDarkMode ? 'bg-slate-800' : 'bg-slate-200'}`}></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500 -mt-10">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&family=Syne:wght@400;500;600;700;800&display=swap');
        .font-syne { font-family: 'Syne', sans-serif !important; }
        .font-jakarta { font-family: 'Plus Jakarta Sans', sans-serif !important; }
      `}</style>

      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2">
        <div>
          <h1 className="text-3xl font-bold text-[#1A1A2E] tracking-tight font-syne">
            My Team
          </h1>
          <p className="text-sm text-[#9B9BAD] mt-1 text-left">Manage and assign work to your recruitment team</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={fetchMembers}
            className="flex items-center gap-2 px-6 py-3 bg-white text-[#6B6B7E] border border-[#F4F3EF] rounded-full text-[11px] font-bold uppercase tracking-widest hover:bg-slate-50 transition-all active:scale-95 shadow-sm"
          >
            <FiRefreshCw size={14} className={`text-[#1B4DA0] ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button
            onClick={() => setShowInviteModal(true)}
            className="flex items-center gap-2 px-6 py-3 bg-[#1B4DA0] text-white rounded-full text-[11px] font-bold uppercase tracking-widest hover:bg-[#153e82] transition-all active:scale-95 shadow-lg shadow-blue-500/20"
          >
            <FiPlus size={14} />
             Add Team
          </button>
        </div>
      </div>

      {/* Stats Quick View (Refined) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Team Size', value: stats.totalMembers, icon: FiUsers, color: 'text-violet-600', bg: 'bg-violet-50' },
          { label: 'Active Status', value: stats.activeMembers, icon: FiCheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Open Tasks', value: stats.totalCandidates, icon: FiBriefcase, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Completed', value: stats.totalPlacements, icon: FiAward, color: 'text-amber-600', bg: 'bg-amber-50' },
        ].map((s, i) => (
          <div key={i} className="bg-white p-5 rounded-3xl border border-[#F4F3EF] flex items-center justify-between shadow-sm group hover:shadow-md transition-all">
            <div>
              <p className="text-[10px] font-bold text-[#9B9BAD] uppercase tracking-widest mb-1">{s.label}</p>
              <p className={`text-2xl font-black font-syne ${s.color}`}>{s.value}</p>
            </div>
            <div className={`w-12 h-12 rounded-2xl ${s.bg} ${s.color} flex items-center justify-center transition-transform group-hover:scale-110`}>
              <s.icon size={20} />
            </div>
          </div>
        ))}
      </div>

      {/* Filter & Search Bar */}
      <div className="flex items-center gap-3 mb-8">
        <div className="flex-1 flex items-center gap-3 bg-[#F4F3EF] rounded-2xl px-6 py-4 transition-all focus-within:bg-[#EEF2FB] focus-within:ring-2 focus-within:ring-blue-100">
          <FiSearch className="text-[#9B9BAD]" size={20} />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by candidate, role or host..."
            className="w-full bg-transparent border-none text-sm font-bold focus:ring-0 outline-none transition-all placeholder:text-[#9B9BAD] text-[#1A1A2E]"
          />
        </div>
        <div className="hidden lg:flex items-center gap-3">
            {['ALL DATES', 'ALL CLIENTS', 'ALL STATUS'].map(f => (
                <button key={f} className="flex items-center gap-3 px-6 py-4 bg-[#F4F3EF] hover:bg-[#EEEFED] text-[#4B4B5E] text-[10px] font-black uppercase tracking-[2px] rounded-2xl transition-all shadow-sm">
                    {f} <FiChevronDown size={14} className="text-[#9B9BAD]" />
                </button>
            ))}
        </div>
      </div>

      {/* Table Interface */}
      <div className={`bg-white rounded-[32px] border border-[#F4F3EF] overflow-hidden shadow-2xl shadow-gray-200/50 ${isDarkMode ? 'bg-slate-800 border-slate-700 shadow-none' : ''}`}>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-[#F4F3EF]">
                <th className="px-8 py-10 w-10 text-center">
                  <input
                    type="checkbox"
                    checked={selectedRowIds.length === filteredMembers.length && filteredMembers.length > 0}
                    onChange={(e) => {
                      if (e.target.checked) setSelectedRowIds(filteredMembers.map(m => m.id));
                      else setSelectedRowIds([]);
                    }}
                    className="w-4 h-4 rounded-md border-[#E8E7E2] text-[#1B4DA0] focus:ring-[#1B4DA0]"
                  />
                </th>
                <th className="px-8 py-10 text-left text-[11px] font-black text-[#9B9BAD] uppercase tracking-[3px]">Member</th>
                <th className="px-8 py-10 text-left text-[11px] font-black text-[#9B9BAD] uppercase tracking-[3px]">Role</th>
                <th className="px-8 py-10 text-left text-[11px] font-black text-[#9B9BAD] uppercase tracking-[3px]">Email Address</th>
                <th className="px-8 py-10 text-center text-[11px] font-black text-[#9B9BAD] uppercase tracking-[3px]">Connect</th>
                <th className="px-8 py-10 text-center text-[11px] font-black text-[#9B9BAD] uppercase tracking-[3px]">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-[#F4F3EF]">
              {filteredMembers.length > 0 ? filteredMembers.map((m, idx) => {
                const isSelected = selectedRowIds.includes(m.id);
                const initials = m.name?.split(' ').map(n=>n[0]).join('').slice(0,2) || '??';
                
                return (
                  <tr 
                    key={m.id} 
                    onClick={() => {
                        setSelectedMember(m);
                        setShowMemberDetails(true);
                    }}
                    className={`hover:bg-slate-50/50 transition-colors group cursor-pointer ${isSelected ? 'bg-blue-50/30' : ''}`}
                  >
                    <td className="px-8 py-4 w-10" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={(e) => {
                          if (e.target.checked) setSelectedRowIds(prev => [...prev, m.id]);
                          else setSelectedRowIds(prev => prev.filter(id => id !== m.id));
                        }}
                        className="w-4 h-4 rounded border-[#F4F3EF] text-[#1B4DA0] focus:ring-[#1B4DA0]"
                      />
                    </td>
                    <td className="px-8 py-8 whitespace-nowrap">
                      <div className="flex items-center gap-6">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-white to-[#F4F3EF] flex items-center justify-center text-[#1B4DA0] text-lg font-black shadow-xl border border-[#F4F3EF] group-hover:scale-110 transition-transform">
                          {initials}
                        </div>
                        <div className="min-w-0">
                          <p className="text-base font-black text-[#1A1A2E] group-hover:text-[#1B4DA0] transition-colors tracking-tight">{m.name}</p>
                          <span className="text-[9px] font-black text-[#9B9BAD] uppercase tracking-[2px] block mt-0.5">MEMBER SINCE {m.joinDate?.split('-')[0] || '2025'}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-8 whitespace-nowrap">
                      <div className="flex flex-col items-start">
                        <span className="text-sm font-bold text-[#1A1A2E]">{m.role}</span>
                        <span className="text-[10px] font-bold text-[#9B9BAD] uppercase tracking-[2px] flex items-center gap-1.5 mt-0.5">
                           <FiActivity size={10} className="text-[#1B4DA0]" /> {m.currentTasks} Active
                        </span>
                      </div>
                    </td>
                    <td className="px-8 py-8 whitespace-nowrap">
                      <span className="text-sm font-bold text-[#4B4B5E]">{m.email}</span>
                    </td>
                    <td className="px-8 py-8 whitespace-nowrap text-center">
                      <div className="flex items-center justify-center gap-3">
                        <button 
                            onClick={(e) => { e.stopPropagation(); window.location.href = `mailto:${m.email}`; }}
                            className="p-3 bg-[#F4F3EF] text-[#9B9BAD] hover:text-[#1B4DA0] rounded-xl transition-all shadow-sm"
                        >
                            <FiMail size={16} />
                        </button>
                        <button 
                            onClick={(e) => { e.stopPropagation(); window.location.href = `tel:${m.phone}`; }}
                            className="p-3 bg-[#F4F3EF] text-[#9B9BAD] hover:text-[#1B4DA0] rounded-xl transition-all shadow-sm"
                        >
                            <FiPhone size={16} />
                        </button>
                      </div>
                    </td>
                    <td className="px-8 py-8 whitespace-nowrap text-center">
                      <button className="w-10 h-10 rounded-full bg-slate-50 text-slate-400 flex items-center justify-center group-hover:bg-[#1A1A2E] group-hover:text-white transition-all shadow-sm">
                        <FiChevronRight size={20} className="transition-transform group-hover:translate-x-0.5" />
                      </button>
                    </td>
                  </tr>
                );
              }) : (
                <tr>
                    <td colSpan={6} className="py-24 text-center">
                        <div className="flex flex-col items-center gap-4">
                            <div className="w-16 h-16 rounded-3xl bg-[#F4F3EF] flex items-center justify-center text-[#9B9BAD]">
                                <FiUsers size={24} />
                            </div>
                            <p className="text-[11px] font-black text-[#9B9BAD] uppercase tracking-widest text-center">Zero Team Match Found</p>
                        </div>
                    </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Member Detail Sidebar */}
      <AnimatePresence>
        {showMemberDetails && selectedMember && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowMemberDetails(false)}
              className="fixed inset-0 backdrop-blur-xl z-[9999]"
              style={{ backgroundColor: '#1A1A2E66' }}
            />

            {/* Sidebar */}
            <motion.div
              initial={{ x: '100%', opacity: 0.5 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: '100%', opacity: 0.5 }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed inset-y-0 right-0 w-full max-w-[580px] bg-white shadow-2xl z-[10000] flex flex-col overflow-hidden text-left border-l border-[#F4F3EF]"
            >
              {/* Header */}
              <div className="sticky top-0 bg-white/90 backdrop-blur-md border-b border-[#F4F3EF] px-8 py-8 flex items-center justify-between z-20">
                <div className="flex-1 mr-4">
                  <h2 className="text-2xl font-bold text-[#1A1A2E] font-syne outline-none">{selectedMember.name}</h2>
                  <div className="flex items-center gap-2 mt-1.5 ml-0">
                    <span className="text-[10px] font-bold text-[#1B4DA0] uppercase tracking-[3px] outline-none">
                        {selectedMember.role}
                    </span>
                    <span className="w-1 h-1 rounded-full bg-[#E8E7E2]" />
                    <span className="text-[10px] font-bold text-[#9B9BAD] uppercase tracking-[3px] outline-none">
                        {selectedMember.status}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => { setShowAssignModal(true); setShowMemberDetails(false); }}
                    className="w-10 h-10 rounded-xl bg-blue-50 text-[#1B4DA0] flex items-center justify-center hover:bg-blue-100 transition-all shadow-sm"
                  >
                    <FiSend size={18} />
                  </button>
                  <button onClick={() => setShowMemberDetails(false)} className="w-10 h-10 rounded-xl bg-[#F4F3EF] text-[#6B6B7E] flex items-center justify-center hover:bg-red-50 hover:text-red-500 transition-all">
                    <FiX size={20} />
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto px-10 py-8 space-y-10 custom-scrollbar">
                {/* Contact Information */}
                <div className="grid grid-cols-2 gap-8">
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-[2px] block">Email Address</span>
                    <p className="text-sm font-bold text-[#1A1A2E] flex items-center gap-2">
                      <FiMail className="text-[#1B4DA0]" /> {selectedMember.email}
                    </p>
                  </div>
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-[2px] block">Phone Number</span>
                    <p className="text-sm font-bold text-[#1A1A2E] flex items-center gap-2">
                      <FiPhone className="text-[#1B4DA0]" /> {selectedMember.phone}
                    </p>
                  </div>
                </div>

                {/* Performance Stats */}
                <div className="pt-8 border-t border-[#F4F3EF]">
                  <span className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-[2px] block mb-6">Performance Matrix</span>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-[#FAFAF9] p-4 rounded-2xl border border-[#F4F3EF]">
                        <p className="text-[9px] font-black text-[#9B9BAD] uppercase tracking-widest mb-1">Assigned</p>
                        <p className="text-xl font-black text-[#1A1A2E] font-syne">{selectedMember.assignedCandidates}</p>
                    </div>
                    <div className="bg-[#FAFAF9] p-4 rounded-2xl border border-[#F4F3EF]">
                        <p className="text-[9px] font-black text-[#9B9BAD] uppercase tracking-widest mb-1">Completed</p>
                        <p className="text-xl font-black text-[#1B4DA0] font-syne">{selectedMember.interviews}</p>
                    </div>
                    <div className="bg-[#FAFAF9] p-4 rounded-2xl border border-[#F4F3EF]">
                        <p className="text-[9px] font-black text-[#9B9BAD] uppercase tracking-widest mb-1">Active</p>
                        <p className="text-xl font-black text-[#7C3AED] font-syne">{selectedMember.currentTasks}</p>
                    </div>
                  </div>
                </div>

                {/* Recent Activities */}
                <div className="pt-8 border-t border-[#F4F3EF]">
                  <span className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-[2px] block mb-6">Recent Records</span>
                  <div className="space-y-4">
                     {[1,2,3].map(i => (
                        <div key={i} className="flex items-center gap-4 p-4 bg-white rounded-2xl border border-[#F4F3EF] hover:border-blue-100 transition-all group">
                             <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-500 transition-all">
                                <FiActivity size={16} />
                             </div>
                             <div className="flex-1">
                                <p className="text-sm font-bold text-[#1A1A2E]">Task #{2930 + i} System Update</p>
                                <p className="text-[10px] font-bold text-[#9B9BAD] uppercase tracking-widest mt-0.5">Updated 2 hours ago</p>
                             </div>
                             <span className="text-[9px] font-black text-emerald-500 bg-emerald-50 px-2 py-0.5 rounded-md uppercase tracking-widest">Done</span>
                        </div>
                     ))}
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="p-8 border-t border-[#F4F3EF] bg-[#FAFAF9]">
                <button 
                  onClick={() => setShowMemberDetails(false)}
                  className="w-full py-4 bg-[#1A1A2E] text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-[#2A2A3E] transition-all shadow-xl shadow-gray-200"
                >
                  Close Profile
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Invite Member Modal */}
      <AnimatePresence>
        {showInviteModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowInviteModal(false)}
              className="fixed inset-0 backdrop-blur-xl z-[9999]"
              style={{ backgroundColor: '#1A1A2E66' }}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-x-4 top-[10%] md:inset-x-auto md:left-1/2 md:-translate-x-1/2 md:w-[500px] bg-white rounded-3xl shadow-2xl z-[10000] overflow-hidden"
            >
              <div className="px-8 py-6 border-b border-[#F4F3EF] flex items-center justify-between bg-white">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-[#1A1A2E] shadow-sm">
                    <FiPlus size={20} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-[#1A1A2E] font-syne">Add Team </h3>
                    <p className="text-[10px] font-bold text-[#9B9BAD] uppercase tracking-[3px] mt-0.5">New Team Addition</p>
                  </div>
                </div>
                <button onClick={() => setShowInviteModal(false)} className="w-10 h-10 rounded-xl bg-[#F4F3EF] text-[#6B6B7E] flex items-center justify-center hover:bg-red-50 hover:text-red-500 transition-all">
                  <FiX size={20} />
                </button>
              </div>

              <div className="p-8 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-widest ml-1">Full Name</label>
                    <input type="text" className="w-full bg-[#FAFAF9] border border-[#F4F3EF] rounded-2xl px-5 py-3.5 text-sm font-bold text-[#1A1A2E] focus:bg-white focus:border-[#1B4DA0] outline-none transition-all placeholder:text-[#9B9BAD]/50" placeholder="e.g. Priyanshi Sharma" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-widest ml-1">Email Address</label>
                    <input type="email" className="w-full bg-[#FAFAF9] border border-[#F4F3EF] rounded-2xl px-5 py-3.5 text-sm font-bold text-[#1A1A2E] focus:bg-white focus:border-[#1B4DA0] outline-none transition-all placeholder:text-[#9B9BAD]/50" placeholder="priyanshi@mabicons.com" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-widest ml-1">Designation</label>
                    <select className="w-full bg-[#FAFAF9] border border-[#F4F3EF] rounded-2xl px-5 py-3.5 text-sm font-bold text-[#1A1A2E] focus:bg-white focus:border-[#1B4DA0] outline-none transition-all appearance-none cursor-pointer">
                        <option>HR Executive</option>
                        <option>Senior Recruiter</option>
                        <option>Department Head</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="p-8 border-t border-[#F4F3EF] bg-[#FAFAF9] flex items-center gap-3">
                <button onClick={() => setShowInviteModal(false)} className="flex-1 py-4 text-[11px] font-black uppercase tracking-widest text-[#6B6B7E] hover:bg-white rounded-2xl transition-all">Cancel</button>
                <button className="flex-[2] py-4 bg-[#1A1A2E] text-white rounded-2xl font-bold text-sm hover:bg-[#2A2A3E] transition-all shadow-xl shadow-gray-200">Send Invitation</button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Assign Work Modal (Refactored to match) */}
      <AnimatePresence>
        {showAssignModal && selectedMember && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAssignModal(false)}
              className="fixed inset-0 backdrop-blur-xl z-[9999]"
              style={{ backgroundColor: '#1A1A2E66' }}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className={`fixed inset-x-4 top-[10%] md:inset-x-auto md:left-1/2 md:-translate-x-1/2 md:w-[500px] rounded-3xl shadow-2xl z-[10000] overflow-hidden ${isDarkMode ? 'bg-slate-800 border border-slate-700' : 'bg-white'}`}
            >
              <div className={`px-8 py-6 border-b flex items-center justify-between ${isDarkMode ? 'border-slate-700' : 'border-[#F4F3EF]'}`}>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-[#1B4DA0]">
                    <FiSend size={20} />
                  </div>
                  <div>
                    <h3 className={`text-xl font-bold font-syne ${isDarkMode ? 'text-white' : 'text-[#1A1A2E]'}`}>Assign Work</h3>
                    <p className={`text-[10px] font-bold uppercase tracking-[3px] mt-0.5 ${isDarkMode ? 'text-slate-400' : 'text-[#9B9BAD]'}`}>to {selectedMember.name}</p>
                  </div>
                </div>
                <button onClick={() => setShowAssignModal(false)} className="w-10 h-10 rounded-xl bg-[#F4F3EF] text-[#6B6B7E] flex items-center justify-center hover:bg-red-50 hover:text-red-500 transition-all">
                  <FiX size={20} />
                </button>
              </div>

              <div className="p-8 space-y-6 max-h-[60vh] overflow-y-auto custom-scrollbar">
                <div className="space-y-4">
                    <div className="space-y-1.5">
                        <label className={`text-[10px] font-black uppercase tracking-widest ml-1 ${isDarkMode ? 'text-slate-400' : 'text-[#9B9BAD]'}`}>Assignment Type</label>
                        <div className="grid grid-cols-3 gap-2 mt-2">
                            {['candidate', 'interview', 'client'].map((type) => (
                            <button
                                key={type}
                                onClick={() => setAssignmentType(type)}
                                className={`px-4 py-3 rounded-2xl text-[10px] font-black uppercase tracking-wider transition-all ${
                                assignmentType === type
                                    ? 'bg-[#1A1A2E] text-white shadow-lg'
                                    : isDarkMode ? 'bg-slate-700 text-slate-300' : 'bg-[#FAFAF9] text-[#9B9BAD] border border-[#F4F3EF]'
                                }`}
                            >
                                {type}
                            </button>
                            ))}
                        </div>
                    </div>
                    
                    <div className="space-y-1.5 pt-4">
                        <label className={`text-[10px] font-black uppercase tracking-widest ml-1 ${isDarkMode ? 'text-slate-400' : 'text-[#9B9BAD]'}`}>Subject / Title</label>
                        <input type="text" value={assignTitle} onChange={(e) => setAssignTitle(e.target.value)} className={`w-full bg-[#FAFAF9] border border-[#F4F3EF] rounded-2xl px-5 py-3.5 text-sm font-bold text-[#1A1A2E] focus:bg-white focus:border-[#1B4DA0] outline-none transition-all placeholder:text-[#9B9BAD]/50 ${isDarkMode ? 'bg-slate-700 border-slate-600' : ''}`} placeholder="e.g. Review Pending Profiles" />
                    </div>

                    <div className="space-y-1.5">
                        <label className={`text-[10px] font-black uppercase tracking-widest ml-1 ${isDarkMode ? 'text-slate-400' : 'text-[#9B9BAD]'}`}>Instructions</label>
                        <textarea rows={3} value={assignNotes} onChange={(e) => setAssignNotes(e.target.value)} className={`w-full bg-[#FAFAF9] border border-[#F4F3EF] rounded-2xl px-5 py-3.5 text-sm font-bold text-[#1A1A2E] focus:bg-white focus:border-[#1B4DA0] outline-none transition-all placeholder:text-[#9B9BAD]/50 resize-none ${isDarkMode ? 'bg-slate-700 border-slate-600' : ''}`} placeholder="Provide specific details..." />
                    </div>
                </div>
              </div>

              <div className={`p-8 border-t bg-[#FAFAF9] flex items-center justify-end gap-3 ${isDarkMode ? 'bg-slate-800 border-slate-700' : ''}`}>
                <button 
                    onClick={() => setShowAssignModal(false)}
                    className="px-6 py-4 text-[11px] font-black uppercase tracking-widest text-[#6B6B7E]"
                >
                    Cancel
                </button>
                <button 
                   onClick={async () => {
                        // Original logic preserved
                        try {
                            const res = await createDepartmentTask({
                                title: assignTitle,
                                description: assignNotes,
                                department: 'HR Recruitment',
                                assignedTo: selectedMember.id,
                                assignedToName: selectedMember.name,
                                priority: 'Medium',
                                dueDate: assignDueDate || undefined,
                                status: 'Pending',
                            });
                            if (res?.success) {
                                setShowAssignModal(false);
                                setAssignTitle('');
                                setAssignNotes('');
                                setAssignDueDate('');
                                setToast(`Task assigned to ${selectedMember.name}`);
                            }
                        } catch (err) { console.error(err); }
                        setTimeout(() => setToast(null), 2000);
                   }}
                   className="px-8 py-4 bg-[#1B4DA0] text-white rounded-2xl font-bold text-sm shadow-xl shadow-blue-500/20"
                >
                   Confirm Assignment
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-6 right-6 z-50 px-5 py-3 bg-gradient-to-r from-violet-500 to-purple-600 text-white rounded-xl shadow-lg font-medium"
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TeamMembersTab;
