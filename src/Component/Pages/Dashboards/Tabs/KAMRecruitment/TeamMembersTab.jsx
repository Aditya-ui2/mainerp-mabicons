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
  FiAward,
  FiTarget,
  FiCalendar,
  FiSend,
  FiRefreshCw,
} from 'react-icons/fi';
import { getDepartmentTeamMembers, createDepartmentTask } from '../../service/api';

/* ── Team Member Card ── */
const TeamMemberCard = ({ member, isDarkMode, onAssignTask, onViewDetails }) => {
  const getStatusColor = (status) => {
    const colors = {
      Active: { bg: '#dcfce7', text: '#16a34a', dot: '#22c55e' },
      'On Leave': { bg: '#fef3c7', text: '#d97706', dot: '#f59e0b' },
      Inactive: { bg: '#fee2e2', text: '#dc2626', dot: '#ef4444' },
    };
    return colors[status] || colors.Active;
  };

  const statusColors = getStatusColor(member.status);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.01, y: -2 }}
      className={`rounded-2xl p-5 transition-all ${
        isDarkMode
          ? 'bg-slate-800/80 border border-slate-700/50 hover:border-slate-600'
          : 'bg-white border border-slate-200/50 shadow-lg hover:shadow-xl'
      }`}
    >
      <div className="flex items-start gap-4">
        {/* Avatar */}
        <div className="relative">
          {member.photo ? (
            <img
              src={member.photo}
              alt={member.name}
              className="w-16 h-16 rounded-xl object-cover ring-2 ring-offset-2"
              style={{ ringColor: statusColors.dot }}
            />
          ) : (
            <div
              className="w-16 h-16 rounded-xl flex items-center justify-center text-white font-bold text-lg"
              style={{ background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)' }}
            >
              {member.name.split(' ').map(n => n[0]).join('')}
            </div>
          )}
          <span
            className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white"
            style={{ backgroundColor: statusColors.dot }}
          />
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div>
              <h3 className={`font-semibold text-base ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
                {member.name}
              </h3>
              <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                {member.role}
              </p>
            </div>
            <span
              className="px-2.5 py-1 rounded-full text-[10px] font-semibold"
              style={{ backgroundColor: statusColors.bg, color: statusColors.text }}
            >
              {member.status}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-3 mt-3">
            <span className={`flex items-center gap-1.5 text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              <FiMail className="w-3.5 h-3.5" />
              {member.email}
            </span>
            <span className={`flex items-center gap-1.5 text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              <FiPhone className="w-3.5 h-3.5" />
              {member.phone}
            </span>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3 mt-4">
            <div className={`text-center p-2 rounded-lg ${isDarkMode ? 'bg-slate-700/50' : 'bg-slate-50'}`}>
              <p className="text-lg font-bold" style={{ color: '#3b82f6' }}>{member.assignedCandidates}</p>
              <p className={`text-[10px] ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Assigned</p>
            </div>
            <div className={`text-center p-2 rounded-lg ${isDarkMode ? 'bg-slate-700/50' : 'bg-slate-50'}`}>
              <p className="text-lg font-bold" style={{ color: '#8b5cf6' }}>{member.interviews}</p>
              <p className={`text-[10px] ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Completed</p>
            </div>
            <div className={`text-center p-2 rounded-lg ${isDarkMode ? 'bg-slate-700/50' : 'bg-slate-50'}`}>
              <p className="text-lg font-bold" style={{ color: '#10b981' }}>{member.currentTasks}</p>
              <p className={`text-[10px] ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Current</p>
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 mt-4 pt-4 border-t" style={{ borderColor: isDarkMode ? '#334155' : '#e2e8f0' }}>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onAssignTask(member)}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-white"
          style={{ background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)' }}
        >
          <FiSend className="w-4 h-4" />
          Assign Work
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onViewDetails(member)}
          className={`px-4 py-2 rounded-xl text-sm font-medium ${
            isDarkMode ? 'bg-slate-700 text-slate-300' : 'bg-slate-100 text-slate-600'
          }`}
        >
          View Details
        </motion.button>
      </div>
    </motion.div>
  );
};

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
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center md:justify-between gap-4"
      >
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl" style={{ background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)', boxShadow: '0 10px 15px -3px rgba(139, 92, 246, 0.25)' }}>
            <FiUsers className="w-6 h-6" style={{ color: 'white' }} />
          </div>
          <div>
            <h2 className="text-2xl font-bold" style={{ background: 'linear-gradient(90deg, #8b5cf6, #7c3aed)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Team Members
            </h2>
            <p className={`text-sm mt-0.5 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              Manage and assign work to your recruitment team
            </p>
          </div>
        </div>
        {userRole === 'KAM' && (
          <div className="flex items-center gap-2">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={fetchMembers}
              className={`p-2.5 rounded-xl ${isDarkMode ? 'bg-slate-700 text-slate-300 hover:bg-slate-600' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
            >
              <FiRefreshCw className="w-4 h-4" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white rounded-xl"
              style={{ background: 'linear-gradient(90deg, #8b5cf6, #7c3aed)', boxShadow: '0 10px 15px -3px rgba(139, 92, 246, 0.25)' }}
            >
              <FiPlus className="w-4 h-4" />
              Add Team Member
            </motion.button>
          </div>
        )}
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Team Size', value: stats.totalMembers, icon: FiUsers, color: '#8b5cf6' },
          { label: 'Active Members', value: stats.activeMembers, icon: FiCheckCircle, color: '#10b981' },
          { label: 'Tasks Assigned', value: stats.totalCandidates, icon: FiBriefcase, color: '#3b82f6' },
          { label: 'Tasks Completed', value: stats.totalPlacements, icon: FiAward, color: '#f59e0b' },
        ].map((stat, i) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className={`relative overflow-hidden rounded-2xl p-5 ${isDarkMode ? 'bg-slate-800/80 border border-slate-700/50' : 'bg-white border border-slate-200/50 shadow-lg'}`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className={`text-xs font-medium uppercase tracking-wider ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>{stat.label}</p>
                  <p className="text-3xl font-extrabold mt-1" style={{ color: stat.color }}>{stat.value}</p>
                </div>
                <div className="p-3 rounded-xl" style={{ backgroundColor: stat.color, boxShadow: `0 10px 15px -3px ${stat.color}40` }}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Search */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <div className="relative">
          <FiSearch className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`} />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search team members..."
            className={`w-full rounded-xl border-2 py-3 pl-12 pr-4 text-sm transition-all focus:ring-2 focus:ring-violet-500/50 ${isDarkMode ? 'bg-slate-800/80 border-slate-700 text-white placeholder:text-slate-500' : 'bg-white border-slate-200 placeholder:text-slate-400'}`}
          />
        </div>
      </motion.div>

      {/* Team Members Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filteredMembers.map((member, i) => (
          <TeamMemberCard
            key={member.id}
            member={member}
            isDarkMode={isDarkMode}
            onAssignTask={handleAssignTask}
            onViewDetails={handleViewDetails}
          />
        ))}
      </div>

      {/* Assign Work Modal */}
      <AnimatePresence>
        {showAssignModal && selectedMember && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => setShowAssignModal(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className={`relative rounded-2xl shadow-2xl w-full max-w-lg ${isDarkMode ? 'bg-slate-800 border border-slate-700' : 'bg-white'}`}
            >
              {/* Header */}
              <div className={`flex items-center justify-between p-5 border-b ${isDarkMode ? 'border-slate-700' : 'border-slate-200'}`}>
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl" style={{ background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)' }}>
                    <FiSend className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>Assign Work</h3>
                    <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>to {selectedMember.name}</p>
                  </div>
                </div>
                <button onClick={() => setShowAssignModal(false)} className={`p-2 rounded-xl ${isDarkMode ? 'hover:bg-slate-700' : 'hover:bg-slate-100'}`}>
                  <FiX className={`w-5 h-5 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`} />
                </button>
              </div>

              {/* Body */}
              <div className="p-5 space-y-4">
                {/* Assignment Type */}
                <div>
                  <label className={`text-sm font-medium ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>Assignment Type</label>
                  <div className="grid grid-cols-3 gap-2 mt-2">
                    {['candidate', 'interview', 'client'].map((type) => (
                      <button
                        key={type}
                        onClick={() => setAssignmentType(type)}
                        className={`px-4 py-2.5 rounded-xl text-sm font-medium capitalize transition-all ${
                          assignmentType === type
                            ? 'bg-gradient-to-r from-violet-500 to-purple-600 text-white shadow-lg'
                            : isDarkMode ? 'bg-slate-700 text-slate-300' : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Select Items */}
                <div>
                  <label className={`text-sm font-medium ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                    Select {assignmentType === 'candidate' ? 'Candidates' : assignmentType === 'interview' ? 'Interviews' : 'Clients'}
                  </label>
                  <select
                    multiple
                    className={`w-full mt-2 px-4 py-3 rounded-xl border-2 h-32 ${isDarkMode ? 'bg-slate-700 border-slate-600 text-white' : 'bg-white border-slate-200'}`}
                  >
                    {assignmentType === 'candidate' && (
                      <>
                        <option value="1">Rahul Sharma - Senior Software Engineer</option>
                        <option value="2">Priya Singh - Product Manager</option>
                        <option value="3">Amit Kumar - UI/UX Designer</option>
                      </>
                    )}
                    {assignmentType === 'interview' && (
                      <>
                        <option value="1">Rahul Sharma - Technical Round (Mar 20)</option>
                        <option value="2">Priya Singh - Client Interview (Mar 21)</option>
                      </>
                    )}
                    {assignmentType === 'client' && (
                      <>
                        <option value="1">TechCorp India</option>
                        <option value="2">StartupXYZ</option>
                        <option value="3">DesignHub</option>
                        <option value="4">CloudScale</option>
                      </>
                    )}
                  </select>
                </div>

                {/* Notes */}
                <div>
                  <label className={`text-sm font-medium ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>Task Title</label>
                  <input
                    type="text"
                    value={assignTitle}
                    onChange={(e) => setAssignTitle(e.target.value)}
                    className={`w-full mt-2 px-4 py-3 rounded-xl border-2 ${isDarkMode ? 'bg-slate-700 border-slate-600 text-white placeholder:text-slate-500' : 'bg-white border-slate-200 placeholder:text-slate-400'}`}
                    placeholder="Enter task title..."
                  />
                </div>

                <div>
                  <label className={`text-sm font-medium ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>Instructions/Notes</label>
                  <textarea
                    rows={3}
                    value={assignNotes}
                    onChange={(e) => setAssignNotes(e.target.value)}
                    className={`w-full mt-2 px-4 py-3 rounded-xl border-2 resize-none ${isDarkMode ? 'bg-slate-700 border-slate-600 text-white placeholder:text-slate-500' : 'bg-white border-slate-200 placeholder:text-slate-400'}`}
                    placeholder="Add any specific instructions..."
                  />
                </div>

                {/* Due Date */}
                <div>
                  <label className={`text-sm font-medium ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>Due Date</label>
                  <input
                    type="date"
                    value={assignDueDate}
                    onChange={(e) => setAssignDueDate(e.target.value)}
                    className={`w-full mt-2 px-4 py-3 rounded-xl border-2 ${isDarkMode ? 'bg-slate-700 border-slate-600 text-white' : 'bg-white border-slate-200'}`}
                  />
                </div>
              </div>

              {/* Footer */}
              <div className={`flex items-center justify-end gap-3 p-5 border-t ${isDarkMode ? 'border-slate-700' : 'border-slate-200'}`}>
                <button
                  onClick={() => setShowAssignModal(false)}
                  className={`px-5 py-2.5 rounded-xl font-medium ${isDarkMode ? 'text-slate-300 hover:bg-slate-700' : 'text-slate-600 hover:bg-slate-100'}`}
                >
                  Cancel
                </button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={async () => {
                    if (!assignTitle) {
                      setToast('Please enter a task title');
                      setTimeout(() => setToast(null), 2000);
                      return;
                    }
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
                      } else {
                        setToast('Failed to assign task');
                      }
                    } catch (err) {
                      console.error('Failed to assign task:', err);
                      setToast('Failed to assign task');
                    }
                    setTimeout(() => setToast(null), 2000);
                  }}
                  className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-violet-500 to-purple-600 text-white font-medium rounded-xl shadow-lg"
                >
                  <FiSend className="w-4 h-4" />
                  Assign
                </motion.button>
              </div>
            </motion.div>
          </div>
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
    </motion.div>
  );
};

export default TeamMembersTab;
