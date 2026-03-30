import { useState, useEffect } from 'react';
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
} from 'react-icons/fi';
import {
  getDepartmentTeamMembers,
  addDepartmentTeamMember,
  updateDepartmentTeamMember,
  deleteDepartmentTeamMember,
  getDepartmentStats,
} from '../../../service/api';

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
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [stats, setStats] = useState({ total: 0, active: 0, onLeave: 0 });
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: '',
    skills: '',
    status: 'Active',
  });

  useEffect(() => {
    fetchMembers();
    fetchStats();
  }, [department]);

  const fetchMembers = async () => {
    try {
      setLoading(true);
      const response = await getDepartmentTeamMembers(department);
      setMembers(response.members || []);
    } catch (error) {
      console.error('Error fetching team members:', error);
      setMembers([]);
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
        department,
        skills: formData.skills.split(',').map(s => s.trim()).filter(Boolean),
      };

      if (editingMember) {
        await updateDepartmentTeamMember(editingMember._id, memberData);
      } else {
        await addDepartmentTeamMember(memberData);
      }
      
      setShowModal(false);
      setEditingMember(null);
      setFormData({ name: '', email: '', phone: '', role: '', skills: '', status: 'Active' });
      fetchMembers();
    } catch (error) {
      console.error('Error saving member:', error);
      alert(error.message || 'Failed to save team member');
    }
  };

  const handleEdit = (member) => {
    setEditingMember(member);
    setFormData({
      name: member.name,
      email: member.email,
      phone: member.phone || '',
      role: member.role || '',
      skills: member.skills?.join(', ') || '',
      status: member.status || 'Active',
    });
    setShowModal(true);
  };

  const handleDelete = async (memberId) => {
    try {
      await deleteDepartmentTeamMember(memberId);
      setMembers(members.filter(m => m._id !== memberId));
      setConfirmDelete(null);
    } catch (error) {
      console.error('Error deleting member:', error);
      alert(error.message || 'Failed to delete team member');
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
          <div className="p-3 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 shadow-lg">
            <FiUsers className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Team Management</h2>
            <p className="text-sm text-gray-500">{department} - Manage your team members</p>
          </div>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => { setEditingMember(null); setFormData({ name: '', email: '', phone: '', role: '', skills: '', status: 'Active' }); setShowModal(true); }}
          className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-xl shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 transition-shadow"
        >
          <FiUserPlus className="w-4 h-4" />
          Add Member
        </motion.button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase">Total Members</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{members.length}</p>
            </div>
            <div className="p-3 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600">
              <FiUsers className="w-5 h-5 text-white" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase">Active</p>
              <p className="text-3xl font-bold text-emerald-600 mt-1">{members.filter(m => m.status === 'Active').length}</p>
            </div>
            <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600">
              <FiCheckCircle className="w-5 h-5 text-white" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase">On Leave</p>
              <p className="text-3xl font-bold text-amber-600 mt-1">{members.filter(m => m.status === 'On Leave').length}</p>
            </div>
            <div className="p-3 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600">
              <FiClock className="w-5 h-5 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search by name, email, or role..."
          className="w-full rounded-xl border-2 border-gray-200 py-3 pl-12 pr-4 text-sm focus:ring-2 focus:ring-violet-500/50 focus:border-violet-300 transition-all"
        />
      </div>

      {/* Team Members Grid */}
      {filteredMembers.length === 0 ? (
        <div className="text-center py-16 text-gray-500">
          <FiUsers size={48} className="mx-auto mb-3 opacity-30" />
          <p className="font-medium">No team members found</p>
          <p className="text-sm mt-1">Add your first team member to get started</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredMembers.map((member, idx) => (
            <motion.div
              key={member._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${getAvatarGradient(member.name)} flex items-center justify-center text-white text-lg font-bold shadow-lg`}>
                    {member.name?.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{member.name}</h3>
                    <p className="text-sm text-gray-500">{member.role}</p>
                  </div>
                </div>
                <StatusBadge status={member.status} />
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <FiMail className="w-4 h-4 text-gray-400" />
                  <span className="truncate">{member.email}</span>
                </div>
                {member.phone && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <FiPhone className="w-4 h-4 text-gray-400" />
                    <span>{member.phone}</span>
                  </div>
                )}
                {member.joinDate && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <FiCalendar className="w-4 h-4 text-gray-400" />
                    <span>Joined {new Date(member.joinDate).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}</span>
                  </div>
                )}
              </div>

              {/* Skills */}
              {member.skills?.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {member.skills.slice(0, 3).map(skill => (
                    <span key={skill} className="text-[10px] font-medium px-2 py-1 rounded-full bg-violet-50 text-violet-600 border border-violet-100">
                      {skill}
                    </span>
                  ))}
                  {member.skills.length > 3 && (
                    <span className="text-[10px] font-medium px-2 py-1 rounded-full bg-gray-100 text-gray-500">
                      +{member.skills.length - 3}
                    </span>
                  )}
                </div>
              )}

              {/* Performance */}
              <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                <div className="flex items-center gap-4">
                  <div className="text-center">
                    <p className="text-lg font-bold text-emerald-600">{member.tasksCompleted || 0}</p>
                    <p className="text-[10px] text-gray-500">Completed</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold text-blue-600">{member.tasksAssigned || 0}</p>
                    <p className="text-[10px] text-gray-500">Assigned</p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => handleEdit(member)}
                    className="p-2 rounded-lg hover:bg-violet-100 text-gray-500 hover:text-violet-600 transition-colors"
                  >
                    <FiEdit2 className="w-4 h-4" />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setConfirmDelete(member._id)}
                    className="p-2 rounded-lg hover:bg-red-50 text-gray-500 hover:text-red-600 transition-colors"
                  >
                    <FiTrash2 className="w-4 h-4" />
                  </motion.button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => { setShowModal(false); setEditingMember(null); }}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden"
            >
              <div className="flex items-center justify-between p-4 border-b border-gray-100">
                <h3 className="text-lg font-bold text-gray-900">
                  {editingMember ? 'Edit Team Member' : 'Add New Member'}
                </h3>
                <button
                  onClick={() => { setShowModal(false); setEditingMember(null); }}
                  className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors"
                >
                  <FiX className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Manju Sharma"
                    className="w-full rounded-xl border-2 border-gray-200 px-4 py-2.5 text-sm focus:ring-2 focus:ring-violet-500/50 focus:border-violet-300"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="email@mabicons.com"
                      className="w-full rounded-xl border-2 border-gray-200 px-4 py-2.5 text-sm focus:ring-2 focus:ring-violet-500/50 focus:border-violet-300"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="9876543210"
                      className="w-full rounded-xl border-2 border-gray-200 px-4 py-2.5 text-sm focus:ring-2 focus:ring-violet-500/50 focus:border-violet-300"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Role *</label>
                    <input
                      type="text"
                      required
                      value={formData.role}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                      placeholder="e.g. HR Executive"
                      className="w-full rounded-xl border-2 border-gray-200 px-4 py-2.5 text-sm focus:ring-2 focus:ring-violet-500/50 focus:border-violet-300"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      className="w-full rounded-xl border-2 border-gray-200 px-4 py-2.5 text-sm focus:ring-2 focus:ring-violet-500/50 focus:border-violet-300"
                    >
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                      <option value="On Leave">On Leave</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Skills (comma separated)</label>
                  <input
                    type="text"
                    value={formData.skills}
                    onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                    placeholder="e.g. Payroll, Attendance, Documentation"
                    className="w-full rounded-xl border-2 border-gray-200 px-4 py-2.5 text-sm focus:ring-2 focus:ring-violet-500/50 focus:border-violet-300"
                  />
                </div>
                <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => { setShowModal(false); setEditingMember(null); }}
                    className="px-5 py-2.5 text-sm font-semibold rounded-xl bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 text-sm font-semibold rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 transition-shadow"
                  >
                    {editingMember ? 'Update Member' : 'Add Member'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {confirmDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => setConfirmDelete(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center"
            >
              <div className="mx-auto w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mb-4">
                <FiTrash2 className="w-8 h-8 text-red-500" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-1">Remove Team Member?</h3>
              <p className="text-sm text-gray-500 mb-5">This action cannot be undone.</p>
              <div className="flex items-center justify-center gap-3">
                <button
                  onClick={() => setConfirmDelete(null)}
                  className="px-5 py-2.5 text-sm font-semibold rounded-xl bg-gray-100 text-gray-600 hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDelete(confirmDelete)}
                  className="px-5 py-2.5 text-sm font-semibold rounded-xl bg-gradient-to-r from-red-500 to-rose-600 text-white shadow-lg shadow-red-500/25"
                >
                  Remove
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TeamManagementTab;
