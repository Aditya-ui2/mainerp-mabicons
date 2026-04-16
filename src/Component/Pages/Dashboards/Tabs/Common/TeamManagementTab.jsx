import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Search } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiUsers,
  FiUserPlus,
  FiEdit2,
  FiTrash2,
  FiSearch,
  FiMail,
  FiPhone,
  FiX,
  FiCheckCircle,
  FiClock,
  FiAlertCircle,
  FiCalendar,
  FiActivity,
  FiAward,
  FiMoreVertical,
  FiUser,
  FiFileText,
  FiLayers,
  FiSave,
  FiRefreshCw,
} from 'react-icons/fi';
import {
  getDepartmentTeamMembers,
  addDepartmentTeamMember,
  updateDepartmentTeamMember,
  deleteDepartmentTeamMember,
  getDepartmentStats,
} from '../../../service/api';

const MOCK_MEMBERS = [
  {
    _id: 'mock-1',
    name: 'Aravind Swamy',
    email: 'aravind.s@mabicons.com',
    phone: '+91 98765 43210',
    employeeId: 'MAB-1012',
    department: 'HR Recruitment',
    joiningDate: '2023-01-15',
    profilePhoto: null,
    role: 'Lead Recruiter',
    status: 'Active',
    stats: {
      activePositions: 12,
      candidatesPipeline: 45,
      interviewsScheduled: 8,
      offersExtended: 3,
      thisWeekHires: 2,
      profilesShared: 24,
      callsDone: 156
    }
  },
  {
    _id: 'mock-2',
    name: 'Priya Sharma',
    email: 'priya.sharma@mabicons.com',
    phone: '+91 87654 32109',
    employeeId: 'MAB-1045',
    department: 'HR Operations',
    joiningDate: '2023-05-20',
    profilePhoto: null,
    role: 'Operations Expert',
    status: 'Active',
    stats: {
      activePositions: 0,
      candidatesPipeline: 12,
      interviewsScheduled: 15,
      offersExtended: 5,
      thisWeekHires: 4,
      profilesShared: 8,
      callsDone: 42
    }
  },
  {
    _id: 'mock-3',
    name: 'Rahul Kapoor',
    email: 'rahul.k@mabicons.com',
    phone: '+91 76543 21098',
    employeeId: 'MAB-1028',
    department: 'HR Recruitment',
    joiningDate: '2023-08-10',
    profilePhoto: null,
    role: 'Tech Recruiter',
    status: 'On Leave',
    stats: {
      activePositions: 8,
      candidatesPipeline: 32,
      interviewsScheduled: 4,
      offersExtended: 1,
      thisWeekHires: 0,
      profilesShared: 15,
      callsDone: 89
    }
  },
  {
    _id: 'mock-4',
    name: 'Sameer Khan',
    email: 'sameer.k@mabicons.com',
    phone: '+91 99887 76655',
    employeeId: 'MAB-1102',
    department: 'HR Operations',
    joiningDate: '2023-11-01',
    profilePhoto: null,
    role: 'Compliance Lead',
    status: 'Active',
    stats: {
      activePositions: 0,
      candidatesPipeline: 8,
      interviewsScheduled: 2,
      offersExtended: 0,
      thisWeekHires: 0,
      profilesShared: 0,
      callsDone: 12
    }
  },
  {
    _id: 'mock-5',
    name: 'Neha Gupta',
    email: 'neha.g@mabicons.com',
    phone: '+91 99112 23344',
    employeeId: 'MAB-1089',
    department: 'HR Operations',
    joiningDate: '2024-01-10',
    profilePhoto: null,
    role: 'Payroll Executive',
    status: 'Active',
    stats: {
      activePositions: 0,
      candidatesPipeline: 5,
      interviewsScheduled: 0,
      offersExtended: 0,
      thisWeekHires: 0,
      profilesShared: 0,
      callsDone: 5
    }
  }
];

const StatusBadge = ({ status }) => {
  const config = {
    Active: { bg: 'bg-emerald-100', text: 'text-emerald-700', dot: 'bg-emerald-500' },
    Inactive: { bg: 'bg-slate-100', text: 'text-slate-600', dot: 'bg-slate-400' },
    'On Leave': { bg: 'bg-amber-100', text: 'text-amber-700', dot: 'bg-amber-500' },
  };
  const c = config[status] || config.Active;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${c.bg} ${c.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`}></span>
      {status}
    </span>
  );
};

const TeamManagementTab = ({ department = 'HR Operations' }) => {
  const [members, setMembers] = useState(MOCK_MEMBERS.filter(m => m.department === department));
  const [loading, setLoading] = useState(false);
  const [selectedMemberForDetail, setSelectedMemberForDetail] = useState(null);
  const [selectedIds, setSelectedIds] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [stats, setStats] = useState({ total: 0, active: 0, onLeave: 0 });
  const [isEditingInDetail, setIsEditingInDetail] = useState(false);
  const [isSavingDetail, setIsSavingDetail] = useState(false);
  const [editableMember, setEditableMember] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    employeeId: '',
    department: department,
    joiningDate: '',
    profilePhoto: null,
    profilePhotoPreview: null,
    status: 'Active'
  });

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 1024 * 1024) {
        alert("Photo size should be less than 1MB");
        return;
      }
      setFormData(prev => ({
        ...prev,
        profilePhoto: file,
        profilePhotoPreview: URL.createObjectURL(file)
      }));
    }
  };

  useEffect(() => {
    if (selectedMemberForDetail) {
      setEditableMember({ ...selectedMemberForDetail });
      setIsEditingInDetail(false);
    }
  }, [selectedMemberForDetail]);

  useEffect(() => {
    fetchMembers();
    fetchStats();
    setFormData(prev => ({ ...prev, department: department }));
  }, [department]);

  const fetchMembers = async () => {
    try {
      setLoading(true);
      const response = await getDepartmentTeamMembers(department);
      const apiMembers = response.members || [];
      const filteredMocks = MOCK_MEMBERS.filter(m => m.department === department);
      setMembers([...filteredMocks, ...apiMembers]);
    } catch (error) {
      console.error('Error fetching team members:', error);
      setMembers(MOCK_MEMBERS.filter(m => m.department === department));
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await getDepartmentStats(department);
      setStats(response.stats?.team || { total: 0, active: 0, onLeave: 0 });
    } catch (error) {
      setStats({ total: members.length, active: members.filter(m => m.status === 'Active').length, onLeave: members.filter(m => m.status === 'On Leave').length });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const memberData = {
        ...formData,
        profilePhoto: formData.profilePhotoPreview || (editingMember?.profilePhoto || null),
      };

      if (editingMember) {
        await updateDepartmentTeamMember(editingMember._id, memberData);
      } else {
        await addDepartmentTeamMember(memberData);
      }

      setShowModal(false);
      setEditingMember(null);
      setFormData({
        name: '',
        email: '',
        phone: '',
        employeeId: '',
        department: department,
        joiningDate: '',
        profilePhoto: null,
        profilePhotoPreview: null,
        status: 'Active'
      });
      fetchMembers();
    } catch (error) {
      console.error('Error saving member:', error);
      alert(error.message || 'Failed to save team member');
    }
  };

  const handleEdit = (member) => {
    setEditingMember(member);
    setFormData({
      name: member.name || '',
      email: member.email || '',
      phone: member.phone || '',
      employeeId: member.employeeId || '',
      department: member.department || 'HR Recruitment',
      joiningDate: member.joiningDate || '',
      status: member.status || 'Active',
      profilePhoto: null,
      profilePhotoPreview: member.profilePhoto || null
    });
    setShowModal(true);
  };

  const handleDelete = async (memberId) => {
    try {
      if (memberId === 'bulk') {
        const remainingMembers = members.filter(m => !selectedIds.includes(m._id));
        setMembers(remainingMembers);
        setSelectedIds([]);
      } else {
        await deleteDepartmentTeamMember(memberId);
        setMembers(members.filter(m => m._id !== memberId));
      }
      setConfirmDelete(null);
    } catch (error) {
      console.error('Error deleting member:', error);
      alert(error.message || 'Failed to delete team member');
    }
  };

  const handleSaveInline = async () => {
    try {
      setIsSavingDetail(true);
      await updateDepartmentTeamMember(editableMember._id, editableMember);
      
      // Update local state
      setMembers(prev => prev.map(m => m._id === editableMember._id ? editableMember : m));
      setSelectedMemberForDetail(editableMember);
      setIsEditingInDetail(false);
      
      fetchStats();
    } catch (error) {
      console.error('Error updating member:', error);
      toast?.error ? toast.error(error.message || 'Failed to update member') : alert(error.message || 'Failed to update member');
    } finally {
      setIsSavingDetail(false);
    }
  };

  const filteredMembers = members.filter(member =>
    member.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.role?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getAvatarGradient = (name) => {
    const gradients = [
      'from-violet-500 to-purple-600',
      'from-blue-500 to-cyan-600',
      'from-emerald-500 to-teal-600',
      'from-rose-500 to-pink-600',
      'from-amber-500 to-orange-600',
    ];
    return gradients[(name || '').charCodeAt(0) % gradients.length];
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div className="h-8 w-48 rounded-lg bg-gray-200 animate-pulse" />
          <div className="h-10 w-32 rounded-lg bg-gray-200 animate-pulse" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-24 rounded-xl bg-gray-200 animate-pulse" />
          ))}
        </div>
        <div className="space-y-3">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-20 rounded-xl bg-gray-100 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="text-left">
            <h1 className="text-3xl font-bold text-[#1A1A2E] tracking-tight" style={{ fontFamily: "'Syne', sans-serif" }}>
              Team Management
            </h1>
            <p className="text-sm font-medium text-[#9B9BAD] mt-1 text-left" style={{ fontFamily: "Calibri, sans-serif" }}>
              {department} — Manage your team members
            </p>
          </div>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => {
            setEditingMember(null);
            setFormData({
              name: '',
              email: '',
              phone: '',
              employeeId: '',
              department: 'HR Recruitment',
              joiningDate: '',
              profilePhoto: null,
              profilePhotoPreview: null,
              status: 'Active'
            });
            setShowModal(true);
          }}
          className="flex items-center gap-2 px-6 py-3 bg-[#0D47A1] text-white rounded-xl text-sm font-semibold transition-all hover:bg-[#0a3d8a] shadow-md shadow-blue-500/20"
          style={{ fontFamily: "Calibri, sans-serif" }}
        >
          <FiUserPlus className="w-4 h-4" />
          Add Member
        </motion.button>
      </div>


      {/* Search Bar Block */}
      <div className="bg-white rounded-[24px] p-2 border border-[#F4F3EF] shadow-sm flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 group min-w-[200px]">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-[#9B9BAD] transition-colors" size={18} />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by name, email, or role..."
            className="w-full bg-[#F4F3EF] border-none rounded-2xl py-3 pl-14 pr-5 text-sm font-medium focus:ring-2 focus:ring-[#F4F3EF] outline-none transition-all placeholder:text-[#9B9BAD]"
            style={{ fontFamily: "'Calibri', sans-serif" }}
          />
        </div>
      </div>
      {/* Team Directory Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100/60 overflow-hidden relative">
        <div className="overflow-x-auto min-h-[300px]">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-100 text-left bg-transparent">
                <th className="py-4 pl-6 pr-4 w-12">
                  <input
                    type="checkbox"
                    checked={selectedIds.length > 0 && selectedIds.length === filteredMembers.length}
                    onChange={() => setSelectedIds(selectedIds.length === filteredMembers.length ? [] : filteredMembers.map(m => m._id))}
                    className="w-4 h-4 rounded text-[#0D47A1] cursor-pointer"
                    style={{ accentColor: '#0D47A1' }}
                  />
                </th>
                <th className="py-4 px-4 text-[11px] font-bold text-[#94a3b8] uppercase tracking-widest">Member</th>
                <th className="py-4 px-4 text-[11px] font-bold text-[#94a3b8] uppercase tracking-widest">Department</th>
                <th className="py-4 px-4 text-[11px] font-bold text-[#94a3b8] uppercase tracking-widest">Email Address</th>
                <th className="py-4 pl-4 pr-6 text-[11px] font-bold text-[#94a3b8] uppercase tracking-widest w-24">Contact</th>
                <th className="py-4 pr-6 w-12"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 text-left">
              {filteredMembers.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-20 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <div className="w-16 h-16 bg-[#F4F3EF] rounded-full flex items-center justify-center mb-4">
                        <FiUsers className="w-8 h-8 text-[#C5C5D2]" />
                      </div>
                      <p className="text-gray-500 font-medium">No team members found</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredMembers.map((member) => (
                  <tr
                    key={member._id}
                    onClick={() => setSelectedMemberForDetail(member)}
                    className="hover:bg-gray-50/50 transition-colors group cursor-pointer"
                  >
                    <td className="py-4 pl-6 pr-4" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(member._id)}
                        onChange={() => setSelectedIds(prev => prev.includes(member._id) ? prev.filter(id => id !== member._id) : [...prev, member._id])}
                        style={{ accentColor: '#0D47A1' }}
                        className="w-4 h-4 rounded text-[#0D47A1] cursor-pointer"
                      />
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-4">
                        <div className="w-[42px] h-[42px] rounded-2xl flex items-center justify-center text-[13px] font-bold text-[#1B4DA0] bg-[#E3F2FD] border border-[#D1E9FF] flex-shrink-0">
                          {member.profilePhoto ? (
                            <img src={member.profilePhoto} alt={member.name} className="w-full h-full rounded-2xl object-cover" />
                          ) : (
                            <span>{(member.name || 'U').split(' ').map(n => n[0]).join('').toUpperCase()}</span>
                          )}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[14px] font-bold text-[#0f172a]">{member.name}</span>
                          <span className="text-[11px] text-gray-400 font-medium">{member.role}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className="text-[13px] font-medium text-[#64748b]">{member.department}</span>
                    </td>
                    <td className="py-4 px-4">
                      <span className="text-[13px] font-medium text-[#64748b]">{member.email}</span>
                    </td>
                    <td className="py-4 pl-4 pr-6">
                      <div className="flex items-center gap-3">
                        <button className="text-[#94a3b8] hover:text-[#0f172a] transition-colors"><FiMail className="w-[15px] h-[15px] stroke-[2.5]" /></button>
                        <button className="text-[#94a3b8] hover:text-[#0f172a] transition-colors"><FiPhone className="w-[15px] h-[15px] stroke-[2.5]" /></button>
                      </div>
                    </td>
                    <td className="py-4 pr-6 text-right">
                      <div className="flex items-center gap-2 justify-end">

                        <button
                          onClick={(e) => { e.stopPropagation(); setConfirmDelete(member._id); }}
                          className="p-2 text-[#94a3b8] hover:text-red-500 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                        >
                          <FiTrash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Floating Action Bar */}
        <AnimatePresence>
          {selectedIds.length > 0 && (
            <div className="absolute bottom-6 left-0 w-full flex justify-center z-[100] pointer-events-none px-4">
              <motion.div
                initial={{ opacity: 0, y: 30, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 30, scale: 0.95 }}
                className="bg-[#111827] text-white px-5 py-2.5 rounded-[12px] shadow-2xl flex items-center pointer-events-auto gap-4"
              >
                <span className="text-[12px] font-semibold pr-4 border-r border-gray-700 whitespace-nowrap">
                  {selectedIds.length} members selected
                </span>
                <div className="flex items-center gap-4">
                  <button 
                    onClick={() => {
                      if (selectedIds.length === 1) {
                        const memberToEdit = members.find(m => m._id === selectedIds[0]);
                        if (memberToEdit) handleEdit(memberToEdit);
                      }
                    }}
                    className="text-[12px] font-bold text-gray-300 hover:text-white transition-colors flex items-center gap-2"
                  >
                    <FiEdit2 className="w-3.5 h-3.5" /> Edit
                  </button>
                  <button
                    onClick={() => {
                      setConfirmDelete('bulk');
                    }}
                    className="text-[12px] font-bold text-rose-400 hover:text-rose-300 transition-all flex items-center gap-2"
                  >
                    <FiTrash2 className="w-3.5 h-3.5" /> Remove
                  </button>
                </div>
                <button
                  onClick={() => setSelectedIds([])}
                  className="p-1 text-gray-500 hover:text-white transition-colors"
                >
                  <FiX className="w-4 h-4" />
                </button>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* Performance Matrix Detail Drawer */}
      {createPortal(
        <AnimatePresence>
          {selectedMemberForDetail && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-[#1A1A2E]/40 backdrop-blur-[4px] z-[10000]"
                onClick={() => setSelectedMemberForDetail(null)}
              />
              <motion.div
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="fixed inset-y-0 right-0 w-[550px] bg-white shadow-2xl z-[10001] flex flex-col"
              >
                {/* Header - Sticky Style */}
                <div className="sticky top-0 bg-white/95 backdrop-blur-md border-b border-[#F4F3EF] px-10 py-8 flex items-center justify-between z-20">
                  <div className="text-left">
                    <h2 className="text-2xl font-bold text-[#1A1A2E] font-syne text-left">Member Detail</h2>
                  </div>
                  <div className="flex items-center gap-3">
                    {isEditingInDetail ? (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setIsEditingInDetail(false)}
                          className="px-4 py-2 rounded-xl text-xs font-bold text-[#6B6B7E] bg-[#F4F3EF] hover:bg-[#E8E7E2] transition-all"
                        >
                          Cancel
                        </button>
                        <button
                          disabled={isSavingDetail}
                          onClick={handleSaveInline}
                          className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#0D47A1] hover:bg-[#0a3a82] transition-all flex items-center gap-2 shadow-md shadow-blue-500/10"
                        >
                          {isSavingDetail ? <FiRefreshCw className="animate-spin w-3.5 h-3.5" /> : <FiSave className="w-3.5 h-3.5" />}
                          {isSavingDetail ? 'Saving...' : 'Save'}
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setIsEditingInDetail(true)}
                        className="w-10 h-10 rounded-xl bg-[#F4F3EF] text-[#6B6B7E] flex items-center justify-center hover:bg-blue-50 hover:text-[#0D47A1] transition-all border-2 border-transparent hover:border-blue-100 shadow-sm"
                        title="Edit Member"
                      >
                        <FiEdit2 size={18} />
                      </button>
                    )}
                    <button
                      onClick={() => setSelectedMemberForDetail(null)}
                      className="w-10 h-10 rounded-xl bg-[#F4F3EF] text-[#6B6B7E] flex items-center justify-center hover:bg-red-50 hover:text-red-500 transition-all border-2 border-transparent hover:border-red-100 shadow-sm"
                      title="Close"
                    >
                      <FiX size={18} />
                    </button>
                  </div>
                </div>

                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto p-8 custom-scrollbar space-y-8">
                  {/* Profile Header */}
                  <div className="flex flex-col items-center text-center space-y-4">
                    <div className="w-20 h-20 rounded-[28px] bg-[#1B4DA0] flex items-center justify-center text-white text-3xl font-bold shadow-xl shadow-blue-500/20 overflow-hidden">
                      {editableMember?.profilePhoto ? (
                        <img src={editableMember.profilePhoto} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <span>{(editableMember?.name || 'U').split(' ').map(n => n[0]).join('').toUpperCase()}</span>
                      )}
                    </div>
                    <div>
                      {isEditingInDetail ? (
                        <input
                          type="text"
                          className="w-full text-2xl font-bold text-[#1A1A2E] bg-[#F4F3EF] border-none rounded-xl py-2 px-4 text-center focus:ring-2 focus:ring-[#0D47A1]/20 outline-none"
                          value={editableMember.name}
                          onChange={(e) => setEditableMember({ ...editableMember, name: e.target.value })}
                          placeholder="Full Name"
                        />
                      ) : (
                        <h4 className="text-2xl font-bold text-[#1A1A2E]" style={{ fontFamily: "'Syne', sans-serif" }}>{selectedMemberForDetail.name}</h4>
                      )}
                      {isEditingInDetail ? (
                        <input
                          type="text"
                          className="w-full text-sm font-semibold text-[#1B4DA0] bg-[#F4F3EF] border-none rounded-lg py-1 px-3 text-center focus:ring-2 focus:ring-[#1B4DA0]/20 outline-none mt-2"
                          value={editableMember.role}
                          onChange={(e) => setEditableMember({ ...editableMember, role: e.target.value })}
                          placeholder="Role e.g. Lead Recruiter"
                        />
                      ) : (
                        <p className="text-sm font-semibold text-[#1B4DA0] mt-1">{selectedMemberForDetail.role || selectedMemberForDetail.department}</p>
                      )}
                    </div>
                  </div>

                  {/* Unified Info Container */}
                  <div className="bg-[#FAFAF8] rounded-[32px] border border-[#F4F3EF] p-8 space-y-6">
                    {/* Professional & Contact Info */}
                    <div className="space-y-6">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-[#6B6B7E] font-medium">Department</span>
                        {isEditingInDetail ? (
                          <select 
                            className="text-sm text-[#1A1A2E] font-bold bg-white border border-[#F4F3EF] rounded-lg px-2 py-1 outline-none"
                            value={editableMember.department}
                            onChange={(e) => setEditableMember({ ...editableMember, department: e.target.value })}
                          >
                            {['HR Recruitment', 'HR Operations', 'IT', 'Sales', 'Marketing', 'BD', 'Finance', 'Management'].map(dept => (
                              <option key={dept} value={dept}>{dept}</option>
                            ))}
                          </select>
                        ) : (
                          <span className="text-sm text-[#1A1A2E] font-bold">{selectedMemberForDetail.department || 'HR Recruitment'}</span>
                        )}
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-[#6B6B7E] font-medium">Status</span>
                        {isEditingInDetail ? (
                          <select 
                            className="text-sm text-[#1A1A2E] font-bold bg-white border border-[#F4F3EF] rounded-lg px-2 py-1 outline-none"
                            value={editableMember.status}
                            onChange={(e) => setEditableMember({ ...editableMember, status: e.target.value })}
                          >
                            {['Active', 'Inactive', 'On Leave'].map(status => (
                              <option key={status} value={status}>{status}</option>
                            ))}
                          </select>
                        ) : (
                          <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${selectedMemberForDetail.status === 'Active' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                            {selectedMemberForDetail.status}
                          </span>
                        )}
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-[#6B6B7E] font-medium">Email</span>
                        {isEditingInDetail ? (
                          <input
                            type="email"
                            className="text-sm text-[#1A1A2E] font-bold bg-white border border-[#F4F3EF] rounded-lg px-2 py-1 outline-none text-right"
                            value={editableMember.email}
                            onChange={(e) => setEditableMember({ ...editableMember, email: e.target.value })}
                          />
                        ) : (
                          <span className="text-sm text-[#1A1A2E] font-bold truncate max-w-[250px]">{selectedMemberForDetail.email}</span>
                        )}
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-[#6B6B7E] font-medium">Contact</span>
                        {isEditingInDetail ? (
                          <input
                            type="tel"
                            className="text-sm text-[#1A1A2E] font-bold bg-white border border-[#F4F3EF] rounded-lg px-2 py-1 outline-none text-right"
                            value={editableMember.phone}
                            onChange={(e) => setEditableMember({ ...editableMember, phone: e.target.value })}
                          />
                        ) : (
                          <span className="text-sm text-[#1A1A2E] font-bold">{selectedMemberForDetail.phone}</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer Actions */}
                <div className="p-10 border-t border-[#F4F3EF] bg-[#FBFBFF] flex gap-4">
                  {isEditingInDetail ? (
                    <>
                      <button 
                        disabled={isSavingDetail}
                        onClick={handleSaveInline}
                        className="flex-1 py-4 bg-[#0D47A1] text-white rounded-xl text-xs font-bold hover:bg-[#0a3a82] transition-all flex items-center justify-center gap-2"
                      >
                        {isSavingDetail ? <FiRefreshCw className="animate-spin w-3.5 h-3.5" /> : <FiSave className="w-3.5 h-3.5" />}
                        Save Changes
                      </button>
                      <button 
                        onClick={() => setIsEditingInDetail(false)}
                        className="flex-1 py-4 bg-[#F4F3EF] text-[#6B6B7E] rounded-xl text-xs font-bold hover:bg-[#EEF2FB] transition-all"
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <button 
                      onClick={() => setSelectedMemberForDetail(null)}
                      className="flex-1 py-4 bg-[#F4F3EF] text-[#6B6B7E] rounded-xl text-xs font-bold hover:bg-[#EEF2FB] transition-all"
                    >
                      Close
                    </button>
                  )}
                </div>


              </motion.div>
            </>
          )}
        </AnimatePresence>,
        document.body
      )}

      {/* Add/Edit Modal */}
      {createPortal(
        <AnimatePresence>
          {showModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md"
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden relative"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Modal Header */}
                <div className="px-10 py-8 border-b border-[#F4F3EF] flex items-center justify-between bg-gradient-to-r from-white to-[#F8FAFF]">
                  <div>
                    <h2 className="text-2xl font-bold text-[#1A1A2E]" style={{ fontFamily: "'Syne', sans-serif" }}>
                      {editingMember ? 'Edit Member Details' : 'Invite Team Member'}
                    </h2>
                    <p className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-[3px] mt-1">
                      {editingMember ? 'Update member details' : 'Send an invitation to join the team'}
                    </p>
                  </div>
                  <button
                    onClick={() => { setShowModal(false); setEditingMember(null); }}
                    className="w-10 h-10 rounded-xl bg-[#F4F3EF] text-[#6B6B7E] hover:bg-red-50 hover:text-red-500 transition-all flex items-center justify-center shadow-sm"
                  >
                    <FiX size={18} />
                  </button>
                </div>

                {/* Modal Body */}
                <form onSubmit={handleSubmit} className="p-8 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
                  {/* Profile Photo Section */}
                  <div className="flex flex-col items-center justify-center pb-4">
                    <div className="relative group">
                      <div className="w-24 h-24 rounded-[32px] bg-[#F4F3EF] border-2 border-dashed border-[#C5C5D2] flex items-center justify-center overflow-hidden transition-all group-hover:border-[#0D47A1]/50">
                        {formData.profilePhotoPreview ? (
                          <img src={formData.profilePhotoPreview} alt="Preview" className="w-full h-full object-cover" />
                        ) : (
                          <FiUsers size={32} className="text-[#C5C5D2]" />
                        )}

                        <label className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                          <FiEdit2 className="text-white w-6 h-6" />
                          <input type="file" className="hidden" accept="image/*" onChange={handlePhotoChange} />
                        </label>
                      </div>
                      {formData.profilePhotoPreview && (
                        <button
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, profilePhoto: null, profilePhotoPreview: null }))}
                          className="absolute -top-2 -right-2 w-7 h-7 bg-red-500 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-red-600 transition-all scale-0 group-hover:scale-100"
                        >
                          <FiX size={14} />
                        </button>
                      )}
                    </div>
                    <p className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-widest mt-3">Profile Photo (Max 1MB)</p>
                  </div>

                  {/* Personal Information */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2 text-left">
                      <label className="block text-[10px] font-black text-[#9B9BAD] uppercase tracking-widest">Full Name *</label>
                      <div className="relative flex items-center">
                        <FiUsers className="absolute left-4 text-[#C5C5D2]" />
                        <input type="text" required placeholder="e.g. John Doe"
                          className="w-full pl-11 pr-4 py-4 bg-[#F4F3EF] border-0 rounded-2xl text-sm font-bold text-[#1A1A2E] outline-none transition-all focus:bg-[#EEF2FB] focus:ring-2 focus:ring-[#0D47A1]/10"
                          value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          style={{ fontFamily: "'Calibri', sans-serif" }} />
                      </div>
                    </div>
                    <div className="space-y-2 text-left">
                      <label className="block text-[10px] font-black text-[#9B9BAD] uppercase tracking-widest">Employee ID</label>
                      <div className="relative flex items-center">
                        <FiFileText className="absolute left-4 text-[#C5C5D2]" />
                        <input type="text" placeholder="e.g. MAB-0042"
                          className="w-full pl-11 pr-4 py-4 bg-[#F4F3EF] border-0 rounded-2xl text-sm font-bold text-[#1A1A2E] outline-none transition-all focus:bg-[#EEF2FB] focus:ring-2 focus:ring-[#0D47A1]/10"
                          value={formData.employeeId} onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
                          style={{ fontFamily: "'Calibri', sans-serif" }} />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2 text-left">
                      <label className="block text-[10px] font-black text-[#9B9BAD] uppercase tracking-widest">Email Address *</label>
                      <div className="relative flex items-center">
                        <FiMail className="absolute left-4 text-[#C5C5D2]" />
                        <input type="email" required placeholder="john@mabicons.com"
                          className="w-full pl-11 pr-4 py-4 bg-[#F4F3EF] border-0 rounded-2xl text-sm font-bold text-[#1A1A2E] outline-none transition-all focus:bg-[#EEF2FB] focus:ring-2 focus:ring-[#0D47A1]/10"
                          value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          style={{ fontFamily: "'Calibri', sans-serif" }} />
                      </div>
                    </div>
                    <div className="space-y-2 text-left">
                      <label className="block text-[10px] font-black text-[#9B9BAD] uppercase tracking-widest">Phone Number *</label>
                      <div className="relative flex items-center">
                        <FiPhone className="absolute left-4 text-[#C5C5D2]" />
                        <input type="tel" required placeholder="+91 9876543210"
                          className="w-full pl-11 pr-4 py-4 bg-[#F4F3EF] border-0 rounded-2xl text-sm font-bold text-[#1A1A2E] outline-none transition-all focus:bg-[#EEF2FB] focus:ring-2 focus:ring-[#0D47A1]/10"
                          value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          style={{ fontFamily: "'Calibri', sans-serif" }} />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2 text-left">
                      <label className="block text-[10px] font-black text-[#9B9BAD] uppercase tracking-widest">Department</label>
                      <div className="relative flex items-center">
                        <FiLayers className="absolute left-4 text-[#C5C5D2]" />
                        <select
                          className="w-full pl-11 pr-12 py-4 bg-[#F4F3EF] border-0 rounded-2xl text-sm font-bold text-[#1A1A2E] outline-none transition-all focus:bg-[#EEF2FB] focus:ring-2 focus:ring-[#0D47A1]/10 appearance-none cursor-pointer"
                          value={formData.department} onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                          style={{ fontFamily: "'Calibri', sans-serif" }}>
                          <option value="HR Recruitment">HR Recruitment</option>
                          <option value="HR Operations">HR Operations</option>
                          <option value="IT">IT</option>
                          <option value="Sales">Sales</option>
                          <option value="Marketing">Marketing</option>
                          <option value="BD">Business Development</option>
                          <option value="Finance">Finance</option>
                          <option value="Management">Management</option>
                        </select>
                      </div>
                    </div>
                    <div className="space-y-2 text-left">
                      <label className="block text-[10px] font-black text-[#9B9BAD] uppercase tracking-widest">Joining Date</label>
                      <div className="relative flex items-center">
                        <FiCalendar className="absolute left-4 text-[#C5C5D2]" />
                        <input type="date"
                          className="w-full pl-11 pr-4 py-4 bg-[#F4F3EF] border-0 rounded-2xl text-sm font-bold text-[#1A1A2E] outline-none transition-all focus:bg-[#EEF2FB] focus:ring-2 focus:ring-[#0D47A1]/10"
                          value={formData.joiningDate} onChange={(e) => setFormData({ ...formData, joiningDate: e.target.value })}
                          style={{ fontFamily: "'Calibri', sans-serif" }} />
                      </div>
                    </div>
                  </div>

                  {/* Modal Footer */}
                  <div className="pt-6 flex gap-4 border-t border-[#F4F3EF]">
                    <button
                      type="button"
                      onClick={() => { setShowModal(false); setEditingMember(null); }}
                      className="flex-1 py-4 rounded-2xl border-2 border-[#F4F3EF] text-sm font-bold text-[#6B6B7E] hover:bg-[#F4F3EF] transition-all"
                      style={{ fontFamily: "'Calibri', sans-serif" }}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-[2] py-4 bg-[#0D47A1] text-white rounded-full text-xs font-bold uppercase tracking-widest shadow-lg shadow-[#0D47A1]/20 hover:bg-[#0a3a82] transition-all flex items-center justify-center gap-2 active:scale-95"
                      style={{ fontFamily: "'Calibri', sans-serif" }}
                    >
                      {editingMember ? 'Save Changes' : 'Send Invitation'}
                    </button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}

      {/* Delete Confirmation Modal */}
      {createPortal(
        <AnimatePresence>
          {confirmDelete && (
            <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/60 backdrop-blur-md"
                onClick={() => setConfirmDelete(null)}
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="relative bg-white rounded-[32px] shadow-2xl w-full max-w-sm p-8 text-center"
              >
                <div className="mx-auto w-20 h-20 rounded-full bg-red-50 flex items-center justify-center mb-6">
                  <FiTrash2 className="w-10 h-10 text-red-500" />
                </div>
                <h3 className="text-xl font-bold text-[#1A1A2E] mb-2">
                  {confirmDelete === 'bulk' ? `Remove ${selectedIds.length} Members?` : 'Remove Team Member?'}
                </h3>
                <p className="text-sm text-[#9B9BAD] mb-8">
                  {confirmDelete === 'bulk' 
                    ? 'Are you sure you want to remove all selected members? This action is permanent.' 
                    : 'This action is permanent and cannot be undone.'}
                </p>
                <div className="flex flex-col gap-3">
                  <button
                    onClick={() => handleDelete(confirmDelete)}
                    className="w-full py-4 bg-red-500 text-white rounded-full text-sm font-bold shadow-lg shadow-red-500/20 hover:bg-red-600 transition-all active:scale-95"
                  >
                    Confirm Delete
                  </button>
                  <button
                    onClick={() => setConfirmDelete(null)}
                    className="w-full py-4 bg-[#F4F3EF] text-[#6B6B7E] rounded-full text-sm font-bold hover:bg-[#E8E7E2] transition-all"
                  >
                    Cancel
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </div>
  );
};

export default TeamManagementTab;
