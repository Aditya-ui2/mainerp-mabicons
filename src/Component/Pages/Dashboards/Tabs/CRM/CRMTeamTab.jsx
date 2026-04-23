import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiUsers,
  FiPlus,
  FiSearch,
  FiMail,
  FiPhone,
  FiX,
  FiChevronDown,
  FiRefreshCw,
  FiChevronRight,
  FiUserPlus,
  FiTarget,
  FiCheckCircle,
  FiEdit2,
  FiSend,
  FiHash,
  FiCalendar,
  FiBriefcase
} from 'react-icons/fi';
import { toast } from 'react-hot-toast';

const MOCK_TEAM = [
  { id: '1', name: 'Aditya Singh', email: 'singhpratap.aditya@gmail.com', phone: '9876543210', role: 'CRM Manager', status: 'Active', joinDate: '2024-01-15' },
  { id: '2', name: 'Jyoti Verma', email: 'jyoti.crm@gmail.com', phone: '9876543211', role: 'CRM Executive', status: 'Active', joinDate: '2024-02-10' },
  { id: '3', name: 'Manju Sharma', email: 'manju.crm@gmail.com', phone: '9876543212', role: 'CRM Executive', status: 'Active', joinDate: '2024-03-05' },
  { id: '4', name: 'Sachin Kumar', email: 'crm.head@mabicons.com', phone: '9876543213', role: 'CRM Head', status: 'Active', joinDate: '2023-11-20' },
  { id: '5', name: 'Priyanshi Sharma', email: 'priyanshi.crm@mabicons.com', phone: '9876543214', role: 'Senior CRM', status: 'Active', joinDate: '2024-04-01' },
];

const CRMTeamTab = () => {
  const [members, setMembers] = useState(MOCK_TEAM);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRowIds, setSelectedRowIds] = useState([]);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showMemberDetails, setShowMemberDetails] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [assignment, setAssignment] = useState({ title: '', type: 'client', notes: '' });

  const filteredMembers = members.filter(m =>
    m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen" style={{ fontFamily: "'Calibri', sans-serif" }}>
      {/* Header Section */}
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <div className="text-left">
          <h1 className="text-3xl font-bold text-[#1A1A2E] tracking-tight" style={{ fontFamily: "'Syne', sans-serif" }}>
            My Team
          </h1>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowInviteModal(true)}
            className="flex items-center gap-2 px-6 py-3 bg-[#1B4DA0] text-white rounded-xl text-sm font-bold hover:bg-[#1a3a82] transition-all shadow-lg shadow-[#1B4DA0]/20 active:scale-95"
          >
            <FiPlus size={18} /> Add Team Member
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-[24px] p-2 border border-[#F4F3EF] shadow-sm flex items-center gap-3 mb-8 flex-wrap">
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

        <div className="relative">
          <select className="bg-[#F4F3EF] text-xs font-bold uppercase tracking-wider text-[#1A1A2E] rounded-xl pl-4 pr-10 py-2.5 outline-none border-0 cursor-pointer appearance-none min-w-[150px]">
            <option value="all">All Roles</option>
            <option value="CRM Executive">CRM Executive</option>
            <option value="CRM Manager">CRM Manager</option>
            <option value="Senior CRM">Senior CRM</option>
          </select>
          <FiChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9B9BAD] pointer-events-none" size={14} />
        </div>
      </div>

      {/* Table Interface */}
      <div className="bg-white rounded-[32px] border border-[#F4F3EF] overflow-hidden shadow-sm">
        <div className="grid grid-cols-[40px_2fr_1.5fr_2fr_120px_40px] gap-4 px-8 py-5 border-b border-[#F4F3EF] bg-transparent">
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

        {filteredMembers.length > 0 ? filteredMembers.map((m) => {
          const isSelected = selectedRowIds.includes(m.id);
          const initials = m.name?.split(' ').map(n => n[0]).join('').slice(0, 2) || '??';

          return (
            <div
              key={m.id}
              onClick={() => {
                setSelectedMember(m);
                setShowMemberDetails(true);
              }}
              className={`grid grid-cols-[40px_2fr_1.5fr_2fr_120px_40px] gap-4 items-center px-8 py-4 border-b border-[#F4F3EF] last:border-0 hover:bg-[#F8FAFF] cursor-pointer transition-all group ${isSelected ? 'bg-blue-50/30' : ''}`}
            >
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

              <div className="flex items-center gap-4 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-50 to-[#F4F3EF] flex items-center justify-center text-[#1B4DA0] text-sm font-black border border-[#F4F3EF] group-hover:scale-105 transition-transform shrink-0">
                  {initials}
                </div>
                <div className="min-w-0">
                  <p className="text-[14px] font-bold text-[#0f172a] truncate group-hover:text-[#1B4DA0] transition-colors">{m.name}</p>
                </div>
              </div>

              <div className="text-[13px] font-medium text-[#64748b] truncate text-left">
                {m.role}
              </div>

              <div className="text-[13px] font-medium text-[#64748b] truncate text-left">
                {m.email}
              </div>

              <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                <button
                  onClick={() => { window.location.href = `mailto:${m.email}`; }}
                  className="p-2 bg-[#F4F3EF] text-[#9B9BAD] hover:text-[#1B4DA0] rounded-lg transition-all"
                >
                  <FiMail size={14} />
                </button>
                <button
                  onClick={() => { window.location.href = `tel:${m.phone}`; }}
                  className="p-2 bg-[#F4F3EF] text-[#9B9BAD] hover:text-[#1B4DA0] rounded-lg transition-all"
                >
                  <FiPhone size={14} />
                </button>
              </div>

              <div className="flex justify-end">
                <FiChevronRight size={18} className="text-[#C5C5D2] group-hover:text-[#1B4DA0] transition-all" />
              </div>
            </div>
          );
        }) : (
          <div className="py-24 text-center">
            <p className="text-[11px] font-black text-[#9B9BAD] uppercase tracking-widest">No team members found</p>
          </div>
        )}
      </div>

      {/* Member Details Drawer */}
      <AnimatePresence>
        {showMemberDetails && selectedMember && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowMemberDetails(false)}
              className="fixed inset-0 bg-[#1A1A2E]/40 backdrop-blur-md z-[1100]"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed inset-y-0 right-0 w-full max-w-[600px] bg-white z-[1101] border-l border-[#F4F3EF] flex flex-col overflow-hidden"
            >
              <div className="px-10 py-10 border-b border-[#F4F3EF] flex items-center justify-between">
                <h2 className="text-2xl font-bold text-[#1A1A2E]" style={{ fontFamily: "'Syne', sans-serif" }}>Team Member</h2>
                <div className="flex gap-3">
                  <button onClick={() => setShowMemberDetails(false)} className="w-12 h-12 rounded-xl bg-[#F4F3EF] text-[#6B6B7E] flex items-center justify-center hover:bg-red-50 hover:text-red-500 transition-all"><FiX size={24} /></button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-10 space-y-10">
                <div className="flex flex-col items-center">
                  <div className="w-32 h-32 rounded-[40px] bg-[#1B4DA0] flex items-center justify-center text-white text-4xl font-black shadow-2xl border-4 border-white mb-6">
                    {selectedMember.name?.split(' ').map(n => n[0]).join('').slice(0, 2)}
                  </div>
                  <h3 className="text-3xl font-black text-[#1A1A2E]">{selectedMember.name}</h3>
                  <p className="text-[12px] font-black text-[#1B4DA0] uppercase tracking-[4px] mt-1">{selectedMember.role}</p>
                </div>

                <div className="bg-[#FAFAF9] rounded-[48px] border border-[#F4F3EF] p-10 space-y-8">
                  {[
                    { label: 'Role Profile', value: selectedMember.role },
                    { label: 'Account Status', value: selectedMember.status, isStatus: true },
                    { label: 'Official Mail', value: selectedMember.email },
                    { label: 'Contact Phone', value: selectedMember.phone },
                    { label: 'Induction Date', value: selectedMember.joinDate }
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between">
                      <span className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-[3px]">{item.label}</span>
                      <div className="flex items-center gap-2">
                        {item.isStatus && <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />}
                        <span className="text-sm font-black text-[#1A1A2E]">{item.value}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Add/Invite Team Member Modal */}
      {createPortal(
        <AnimatePresence>
          {showInviteModal && (
            <motion.div key="kam-invite-modal" className="fixed inset-0 z-[10001] pointer-events-none">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowInviteModal(false)}
                className="fixed inset-0 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md pointer-events-auto z-[10001]"
              >
                <motion.div
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.95, opacity: 0 }}
                  className="bg-white w-full max-w-2xl rounded-[32px] shadow-2xl overflow-hidden relative z-[10002]"
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* Modal Header */}
                  <div className="px-10 py-8 border-b border-[#F4F3EF] flex items-center justify-between bg-gradient-to-r from-white to-[#F8FAFF]">
                    <div>
                      <h2 className="text-2xl font-bold text-[#1A1A2E]" style={{ fontFamily: "'Syne', sans-serif" }}>
                        Add Team Member
                      </h2>

                    </div>
                    <button
                      onClick={() => setShowInviteModal(false)}
                      className="w-10 h-10 rounded-xl bg-[#F4F3EF] text-[#6B6B7E] hover:bg-red-50 hover:text-red-500 transition-all flex items-center justify-center shadow-sm"
                    >
                      <FiX size={18} />
                    </button>
                  </div>

                  {/* Modal Body */}
                  <div className="p-8 space-y-6 max-h-[60vh] overflow-y-auto custom-scrollbar">
                    {/* Profile Photo Section */}
                    <div className="flex flex-col items-center justify-center pb-4">
                      <div className="relative group">
                        <div className="w-24 h-24 rounded-[32px] bg-[#F4F3EF] border-2 border-dashed border-[#C5C5D2] flex items-center justify-center overflow-hidden transition-all group-hover:border-[#1B4DA0]/50">
                          <FiUsers size={32} className="text-[#C5C5D2]" />
                          <label className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                            <FiEdit2 className="text-white w-6 h-6 hover:scale-110 transition-transform" />
                            <input type="file" className="hidden" accept="image/*" />
                          </label>
                        </div>
                      </div>
                      <p className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-widest mt-3">Profile Photo (Max 1MB)</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="block text-left text-[10px] font-black text-[#9B9BAD] uppercase tracking-widest">Full Name *</label>
                        <div className="relative flex items-center">
                          <FiUsers className="absolute left-4 text-[#C5C5D2]" />
                          <input type="text" required placeholder="e.g. John Doe"
                            className="w-full pl-11 pr-4 py-3 bg-[#F4F3EF] border-0 rounded-2xl text-sm font-bold text-[#1A1A2E] outline-none transition-all focus:bg-[#EEF2FB] focus:ring-2 focus:ring-[#1B4DA0]/10" />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="block text-left text-[10px] font-black text-[#9B9BAD] uppercase tracking-widest">Employee ID</label>
                        <div className="relative flex items-center">
                          <FiHash className="absolute left-4 text-[#C5C5D2]" />
                          <input type="text" placeholder="e.g. CRM-0042"
                            className="w-full pl-11 pr-4 py-3 bg-[#F4F3EF] border-0 rounded-2xl text-sm font-bold text-[#1A1A2E] outline-none transition-all focus:bg-[#EEF2FB] focus:ring-2 focus:ring-[#1B4DA0]/10" />
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="block text-left text-[10px] font-black text-[#9B9BAD] uppercase tracking-widest">Email Address *</label>
                        <div className="relative flex items-center">
                          <FiMail className="absolute left-4 text-[#C5C5D2]" />
                          <input type="email" required placeholder="john@mabicons.com"
                            className="w-full pl-11 pr-4 py-3 bg-[#F4F3EF] border-0 rounded-2xl text-sm font-bold text-[#1A1A2E] outline-none transition-all focus:bg-[#EEF2FB] focus:ring-2 focus:ring-[#1B4DA0]/10" />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="block text-left text-[10px] font-black text-[#9B9BAD] uppercase tracking-widest">Phone Number *</label>
                        <div className="relative flex items-center">
                          <FiPhone className="absolute left-4 text-[#C5C5D2]" />
                          <input type="tel" required placeholder="9876543210" maxLength="10"
                            className="w-full pl-11 pr-4 py-3 bg-[#F4F3EF] border-0 rounded-2xl text-sm font-bold text-[#1A1A2E] outline-none transition-all focus:bg-[#EEF2FB] focus:ring-2 focus:ring-[#1B4DA0]/10" />
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="block text-left text-[10px] font-black text-[#9B9BAD] uppercase tracking-widest">Department</label>
                        <div className="relative flex items-center">
                          <FiBriefcase className="absolute left-4 text-[#C5C5D2]" />
                          <select className="w-full pl-11 pr-12 py-3 bg-[#F4F3EF] border-0 rounded-2xl text-sm font-bold text-[#1A1A2E] outline-none transition-all appearance-none cursor-pointer">
                            <option value="CRM Department">CRM Department</option>
                            <option value="Sales Team">Sales Team</option>
                            <option value="Client Relations">Client Relations</option>
                          </select>
                          <FiChevronDown className="absolute right-4 text-[#9B9BAD] pointer-events-none" />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="block text-left text-[10px] font-black text-[#9B9BAD] uppercase tracking-widest">Joining Date</label>
                        <div className="relative flex items-center">
                          <FiCalendar className="absolute left-4 text-[#C5C5D2]" />
                          <input type="date"
                            className="w-full pl-11 pr-4 py-3 bg-[#F4F3EF] border-0 rounded-2xl text-sm font-bold text-[#1A1A2E] outline-none transition-all focus:bg-[#EEF2FB] focus:ring-2 focus:ring-[#1B4DA0]/10" />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="block text-left text-[10px] font-black text-[#9B9BAD] uppercase tracking-widest">Monthly CRM Target</label>
                      <div className="relative flex items-center">
                        <FiTarget className="absolute left-4 text-[#C5C5D2]" />
                        <input type="number" placeholder="e.g. 10"
                          className="w-full pl-11 pr-4 py-3 bg-[#F4F3EF] border-0 rounded-2xl text-sm font-bold text-[#1A1A2E] outline-none transition-all focus:bg-[#EEF2FB] focus:ring-2 focus:ring-[#1B4DA0]/10" />
                      </div>
                    </div>
                  </div>

                  {/* Modal Footer */}
                  <div className="px-10 py-6 bg-white border-t border-[#F4F3EF] flex items-center gap-4">
                    <button
                      onClick={() => setShowInviteModal(false)}
                      className="flex-1 py-4 bg-[#F4F3EF] text-[#6B6B7E] rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-red-50 hover:text-red-500 transition-all active:scale-95"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => { setShowInviteModal(false); toast.success("Team member onboarded successfully"); }}
                      className="flex-[2] py-4 bg-[#1B4DA0] text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-[#1a3a82] transition-all shadow-lg shadow-[#1B4DA0]/20 active:scale-95"
                    >
                      Onboard Member
                    </button>
                  </div>
                </motion.div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
        , document.body)}
    </div>
  );
};

export default CRMTeamTab;
