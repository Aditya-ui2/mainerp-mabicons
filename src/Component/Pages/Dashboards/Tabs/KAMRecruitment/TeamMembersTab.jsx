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
import { getDepartmentTeamMembers, createDepartmentTask } from '../../../service/api';


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
    <div className="min-h-screen" style={{ fontFamily: "'Calibri', sans-serif" }}>
      {/* Header Section - Same as Job Openings */}
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <div className="text-left">
          <h1 className="text-3xl font-bold text-[#1A1A2E] tracking-tight" style={{ fontFamily: "'Syne', sans-serif" }}>
            My Team
          </h1>
        </div>
        <div className="flex gap-2">
          <button
            onClick={fetchMembers}
            disabled={loading}
            className="group flex items-center justify-center gap-2 px-6 py-3 bg-white text-[#6B6B7E] border border-[#F4F3EF] rounded-xl text-sm font-bold hover:bg-blue-50/50 hover:text-[#0D47A1] hover:border-[#0D47A1]/20 transition-all duration-300 shadow-sm active:scale-95 disabled:opacity-50 min-w-[120px]"
          >
            <FiRefreshCw size={14} className={`text-[#1B4DA0] group-hover:text-[#0D47A1] transition-colors ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button
            onClick={() => setShowInviteModal(true)}
            className="flex items-center gap-2 px-6 py-3 bg-[#0D47A1] text-white rounded-xl text-sm font-bold hover:bg-[#0a3a82] transition-all shadow-lg shadow-[#0D47A1]/20 active:scale-95"
          >
            <FiPlus size={18} /> Add Team Member
          </button>
        </div>
      </div>

      {/* Filter Bar - Exactly like Job Openings */}
      <div className="bg-white rounded-[24px] p-2 border border-[#F4F3EF] shadow-sm flex items-center gap-3 mb-8 flex-wrap">
        {/* Search Bar */}
        <div className="relative flex-1 group min-w-[200px]">
          <FiSearch className="absolute left-5 top-1/2 -translate-y-1/2 text-[#9B9BAD] transition-colors" size={18} />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by name, role, email..."
            className="w-full bg-[#F4F3EF] border-none rounded-2xl py-3 pl-14 pr-5 text-sm font-medium focus:ring-2 focus:ring-[#F4F3EF] outline-none transition-all placeholder:text-[#9B9BAD]"
          />
        </div>

        {/* Role Filter */}
        <div className="relative">
          <select
            className="bg-[#F4F3EF] text-xs font-bold uppercase tracking-wider text-[#1A1A2E] rounded-xl pl-4 pr-10 py-2.5 outline-none border-0 cursor-pointer appearance-none min-w-[150px]"
          >
            <option value="all">All Roles</option>
            <option value="HR Executive">HR Executive</option>
            <option value="KAM - Recruitment">KAM - Recruitment</option>
            <option value="Department Head">Department Head</option>
          </select>
        </div>

        {/* Status Filter */}
        <div className="relative">
          <select
            className="bg-[#F4F3EF] text-xs font-bold uppercase tracking-wider text-[#1A1A2E] rounded-xl pl-4 pr-10 py-2.5 outline-none border-0 cursor-pointer appearance-none min-w-[140px]"
          >
            <option value="all">All Status</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>
      </div>

      {/* Table Interface - Exactly like Job Openings */}
      <div className="bg-white rounded-[32px] border border-[#F4F3EF] overflow-hidden shadow-sm">
        {/* Header Row */}
        <div className="grid grid-cols-[40px_2fr_1.5fr_2fr_120px_40px] gap-4 px-8 py-4 border-b border-[#F4F3EF] bg-transparent">
          <div className="flex items-center">
            <input
              type="checkbox"
              checked={selectedRowIds.length === filteredMembers.length && filteredMembers.length > 0}
              onChange={(e) => {
                if (e.target.checked) setSelectedRowIds(filteredMembers.map(m => m.id));
                else setSelectedRowIds([]);
              }}
              className="w-4 h-4 rounded border-gray-300 text-[#1B4DA0] focus:ring-[#1B4DA0] cursor-pointer shadow-sm"
            />
          </div>
          {["Member", "Role", "Email", "Contact", ""].map((h, i) => (
            <div key={i} className="text-[11px] font-bold text-[#94a3b8] uppercase tracking-widest text-left flex items-start">
              {h}
            </div>
          ))}
        </div>

        {/* Data Rows */}
        {filteredMembers.length > 0 ? filteredMembers.map((m) => {
          const isSelected = selectedRowIds.includes(m.id);
          const initials = m.name?.split(' ').map(n=>n[0]).join('').slice(0,2) || '??';
          
          return (
            <div 
              key={m.id} 
              onClick={() => {
                  setSelectedMember(m);
                  setShowMemberDetails(true);
              }}
              className={`grid grid-cols-[40px_2fr_1.5fr_2fr_120px_40px] gap-4 items-center px-8 py-3 border-b border-[#F4F3EF] last:border-0 hover:bg-[#F8FAFF] cursor-pointer transition-all group ${isSelected ? 'bg-blue-50/30' : ''}`}
            >
              {/* Checkbox */}
              <div className="flex items-center" onClick={(e) => e.stopPropagation()}>
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={(e) => {
                    if (e.target.checked) setSelectedRowIds(prev => [...prev, m.id]);
                    else setSelectedRowIds(prev => prev.filter(id => id !== m.id));
                  }}
                  className="w-4 h-4 rounded border-gray-300 text-[#1B4DA0] focus:ring-[#1B4DA0] cursor-pointer shadow-sm"
                />
              </div>

              {/* Member */}
              <div className="flex items-center gap-4 min-w-0 py-1">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-50 to-[#F4F3EF] flex items-center justify-center text-[#1B4DA0] text-sm font-black border border-[#F4F3EF] group-hover:scale-105 transition-transform shrink-0">
                  {initials}
                </div>
                <div className="min-w-0">
                  <p className="text-[14px] font-bold text-[#0f172a] truncate group-hover:text-[#0D47A1] transition-colors text-left">{m.name}</p>
                </div>
              </div>

              {/* Role */}
              <div className="flex items-start justify-start text-[13px] font-medium text-[#64748b] truncate py-1 text-left">
                {m.role}
              </div>

              {/* Email */}
              <div className="flex items-start justify-start text-[13px] font-medium text-[#64748b] truncate py-1 text-left">
                {m.email}
              </div>

              {/* Contact */}
              <div className="flex items-center justify-start gap-2 py-1" onClick={(e) => e.stopPropagation()}>
                <button 
                    onClick={(e) => { e.stopPropagation(); window.location.href = `mailto:${m.email}`; }}
                    className="p-2 bg-[#F4F3EF] text-[#9B9BAD] hover:text-[#1B4DA0] rounded-lg transition-all"
                >
                    <FiMail size={14} />
                </button>
                <button 
                    onClick={(e) => { e.stopPropagation(); window.location.href = `tel:${m.phone}`; }}
                    className="p-2 bg-[#F4F3EF] text-[#9B9BAD] hover:text-[#1B4DA0] rounded-lg transition-all"
                >
                    <FiPhone size={14} />
                </button>
              </div>

              {/* Actions Arrow */}
              <div className="flex justify-end items-center">
                <div className="w-8 h-8 rounded-xl bg-transparent group-hover:bg-[#0D47A1]/5 flex items-center justify-center transition-all">
                  <FiChevronRight size={18} className="text-[#C5C5D2] group-hover:text-[#0D47A1] transition-all" />
                </div>
              </div>
            </div>
          );
        }) : (
          <div className="py-24 text-center">
            <div className="flex flex-col items-center gap-4">
              <div className="w-16 h-16 rounded-3xl bg-[#F4F3EF] flex items-center justify-center text-[#9B9BAD]">
                <FiUsers size={24} />
              </div>
              <p className="text-[11px] font-black text-[#9B9BAD] uppercase tracking-widest text-center">No team members found</p>
            </div>
          </div>
        )}
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
              className="fixed inset-0 bg-[#1A1A2E]/40 backdrop-blur-md z-[1100]"
            />

            {/* Sidebar */}
            <motion.div
              initial={{ x: '100%', opacity: 0.5 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: '100%', opacity: 0.5 }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed inset-y-0 right-0 w-full max-w-[698px] bg-white shadow-2xl z-[1101] border-l border-[#F4F3EF] flex flex-col overflow-hidden"
            >
              {/* Header */}
              <div className="sticky top-0 bg-white border-b border-[#F4F3EF] px-10 py-10 flex items-center justify-between z-20">
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-[#1A1A2E] leading-none" style={{ fontFamily: "'Syne', sans-serif" }}>Member Details</h2>
                </div>
                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => { setShowAssignModal(true); setShowMemberDetails(false); }}
                    className="w-12 h-12 rounded-xl bg-[#F4F3EF] text-[#6B6B7E] flex items-center justify-center hover:bg-blue-50 hover:text-[#1B4DA0] transition-all border border-[#E8E7E2] shadow-sm"
                  >
                    <FiEdit2 size={20} />
                  </button>
                  <button onClick={() => setShowMemberDetails(false)} className="w-12 h-12 rounded-xl bg-[#F4F3EF] text-[#6B6B7E] flex items-center justify-center hover:bg-red-50 hover:text-red-500 transition-all border border-[#E8E7E2] shadow-sm">
                    <FiX size={24} />
                  </button>
                </div>
              </div>

              {/* Content Area */}
              <div className="flex-1 overflow-y-auto custom-scrollbar bg-white">
                <div className="p-10 space-y-10">
                  {/* Hero Profile Section */}
                  <div className="flex flex-col items-center justify-center text-center py-6">
                    <div className="relative group">
                      <div className="w-32 h-32 rounded-[40px] bg-[#0D47A1] flex items-center justify-center text-white text-4xl font-black shadow-2xl shadow-blue-500/30 transform transition-transform group-hover:scale-105 duration-500 border-4 border-white">
                        {selectedMember.name?.split(' ').map(n=>n[0]).join('').slice(0,2) || '??'}
                      </div>
                      <div className="absolute -bottom-2 -right-2 w-10 h-10 rounded-2xl bg-white border border-[#E8E7E2] shadow-lg flex items-center justify-center text-emerald-500">
                        <FiCheckCircle size={20} fill="currentColor" className="text-white" />
                        <div className="absolute inset-0 bg-emerald-500 rounded-2xl flex items-center justify-center">
                           <FiCheckCircle size={18} className="text-white" />
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-8 space-y-1">
                      <h3 className="text-3xl font-black text-[#1A1A2E] tracking-tight">{selectedMember.name}</h3>
                      <p className="text-[12px] font-black text-[#1B4DA0] uppercase tracking-[4px]">{selectedMember.role}</p>
                    </div>
                  </div>

                  {/* Core Information Card */}
                  <div className="bg-[#FAFAF9] rounded-[48px] border border-[#F4F3EF] p-12 space-y-10 shadow-sm transition-all hover:shadow-md">
                    <div className="grid grid-cols-1 gap-y-10">
                      {/* Grid Items */}
                       <div className="flex items-center justify-between group">
                          <span className="text-[11px] font-black text-[#9B9BAD] uppercase tracking-[3px]">Department</span>
                          <span className="text-base font-black text-[#1A1A2E]">HR Recruitment</span>
                       </div>

                       <div className="flex items-center justify-between group">
                          <span className="text-[11px] font-black text-[#9B9BAD] uppercase tracking-[3px]">Status</span>
                          <div className="flex items-center gap-2">
                             <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                             <span className="text-base font-black text-[#1A1A2E]">{selectedMember.status}</span>
                          </div>
                       </div>

                       <div className="flex items-center justify-between group">
                          <span className="text-[11px] font-black text-[#9B9BAD] uppercase tracking-[3px]">Email</span>
                          <span className="text-base font-black text-[#1A1A2E] group-hover:text-[#1B4DA0] transition-colors">{selectedMember.email}</span>
                       </div>

                       <div className="flex items-center justify-between group">
                          <span className="text-[11px] font-black text-[#9B9BAD] uppercase tracking-[3px]">Contact</span>
                          <span className="text-base font-black text-[#1A1A2E]">{selectedMember.phone}</span>
                       </div>

                       <div className="flex items-center justify-between group">
                          <span className="text-[11px] font-black text-[#9B9BAD] uppercase tracking-[3px]">Total Hires</span>
                          <div className="px-5 py-1.5 bg-white rounded-2xl border border-[#F4F3EF] shadow-sm">
                             <span className="text-xl font-black text-[#1B4DA0]">{selectedMember.placements || 0}</span>
                          </div>
                       </div>
                    </div>
                  </div>

                  {/* Operational Footer Details */}
                  <div className="flex items-center justify-center gap-6 pt-6">
                    <div className="flex flex-col items-center">
                       <span className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-widest mb-1">Join Date</span>
                       <span className="text-sm font-bold text-[#1A1A2E]">{selectedMember.joinDate || 'N/A'}</span>
                    </div>
                    <div className="w-px h-10 bg-[#F4F3EF]" />
                    <div className="flex flex-col items-center">
                       <span className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-widest mb-1">Member ID</span>
                       <span className="text-sm font-bold text-[#1A1A2E]">MB-{selectedMember.id?.slice(-4).toUpperCase() || 'SYS'}</span>
                    </div>
                  </div>
                </div>
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
