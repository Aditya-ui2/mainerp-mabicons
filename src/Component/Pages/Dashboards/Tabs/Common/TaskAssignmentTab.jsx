import { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiCheckSquare,
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiSearch,
  FiClock,
  FiUser,
  FiX,
  FiCheckCircle,
  FiAlertCircle,
  FiCalendar,
  FiMessageSquare,
  FiFlag,
  FiBell,
  FiLoader,
  FiFilter,
  FiMoreHorizontal,
  FiType,
  FiZap,
  FiAlignLeft,
  FiActivity,
  FiChevronRight,
  FiTarget,
  FiPhone,
  FiUsers,
  FiUserPlus,
  FiEye,
  FiMinusCircle,
  FiCheck,
} from 'react-icons/fi';
import {
  getDepartmentTasks,
  createDepartmentTask,
  updateDepartmentTask,
  deleteDepartmentTask,
  getDepartmentTeamMembers,
} from '../../../service/api';

const StatusBadge = ({ status }) => {
  const config = {
    Pending: { bg: '#fef3c7', text: '#92400e', dot: '#f59e0b' },
    Completed: { bg: '#d1fae5', text: '#065f46', dot: '#10b981' },
  };
  const c = config[status] || config.Pending;
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 10px', borderRadius: '9999px', fontSize: '12px', fontWeight: 700, background: c.bg, color: c.text, border: `1px solid ${c.dot}33` }}>
      <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: c.dot }}></span>
      {status}
    </span>
  );
};

const PriorityBadge = ({ priority }) => {
  const config = {
    Low: { bg: '#F4F7FE', text: '#64748B', border: '#E2E8F0' },
    Medium: { bg: '#FFF9EB', text: '#B45309', border: '#FEF3C7' },
    High: { bg: '#FFF1F2', text: '#E11D48', border: '#FECACA' },
    Urgent: { bg: '#7F1D1D', text: '#FFFFFF', border: '#991B1B' },
  };
  const c = config[priority] || config.Medium;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: '4px',
      padding: '4px 10px', borderRadius: '8px', fontSize: '10px',
      fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px',
      background: c.bg, color: c.text, border: `1px solid ${c.border}`
    }}>
      {priority}
    </span>
  );
};

const getRelativeDate = (date) => {
  if (!date) return '';
  const d = new Date(date);
  const now = new Date();
  const diff = d - now;
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24));

  if (days === 0) return { label: 'Today', color: 'text-rose-500', bg: 'bg-rose-500' };
  if (days === 1) return { label: 'Tomorrow', color: 'text-amber-500', bg: 'bg-amber-500' };
  return { label: d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }), color: 'text-[#9B9BAD]', bg: 'bg-[#9B9BAD]' };
};

const TaskDetailView = ({ task, onBack, onEdit, onUpdateTask, showToast, teamMembers = [] }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [showAssigneeSuggestions, setShowAssigneeSuggestions] = useState(false);
  const [editableTask, setEditableTask] = useState({
    title: task?.title || '',
    description: task?.description || '',
    dueDate: task?.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '',
    assignedToName: task?.assignedToName || '',
    assignedTo: task?.assignedTo?._id || task?.assignedTo?.id || task?.assignedTo || '',
    priority: task?.priority || 'Medium',
  });

  useEffect(() => {
    if (!task) return;
    setEditableTask({
      title: task.title || '',
      description: task.description || '',
      dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '',
      assignedToName: task.assignedToName || '',
      assignedTo: task.assignedTo?._id || task.assignedTo?.id || task.assignedTo || '',
      priority: task.priority || 'Medium',
    });
  }, [task]);

  const [isSaving, setIsSaving] = useState(false);

  // Check if anything has changed
  const hasChanges = JSON.stringify(editableTask) !== JSON.stringify({
    title: task?.title || '',
    description: task?.description || '',
    dueDate: task?.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '',
    assignedToName: task?.assignedToName || '',
    assignedTo: task?.assignedTo?._id || task?.assignedTo?.id || task?.assignedTo || '',
    priority: task?.priority || 'Medium',
  });

  const handleSave = async () => {
    try {
      setIsSaving(true);
      
      const taskId = task._id || task.id;
      if (!taskId) throw new Error('Task ID is missing');

      // Clean the payload: remove UI-only fields like 'assignedToName'
      // before sending to the backend API.
      const { assignedToName, ...payload } = editableTask;
      
      await updateDepartmentTask(taskId, payload);
      
      if (showToast) showToast(`Task updated successfully!`);
      if (onUpdateTask) onUpdateTask({ ...editableTask, id: taskId, _id: taskId });
      setIsEditing(false);
    } catch (err) {
      console.error('Save Error:', err);
      if (showToast) showToast('Failed to save changes. Please check if all fields are valid.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleBlur = (field, value) => {
    // We no longer trigger immediate API calls on blur to follow the 'Save' button pattern
    setEditableTask(prev => ({ ...prev, [field]: value }));
  };

  if (!task) return null;
  const relativeDate = getRelativeDate(editableTask.dueDate || task.dueDate);

  return (
    <div className="flex flex-col h-full bg-white relative">
      {/* Header */}
      <div className="sticky top-0 bg-white/90 backdrop-blur-md border-b border-[#F4F3EF] px-8 py-6 flex items-center justify-between z-20">
        <div className="text-left">
          <h2 className="text-xl font-bold text-[#1A1A2E] leading-tight" style={{ fontFamily: "'Syne', sans-serif" }}>Task Details</h2>
          <p className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-[2px] mt-1">RECRUITMENT OPERATIONS</p>
        </div>
        <div className="flex items-center gap-3">
          {isEditing ? (
            <div className="flex items-center gap-2">
              <button
                disabled={isSaving}
                onClick={() => {
                  setIsEditing(false);
                  setEditableTask({
                    title: task?.title || '',
                    description: task?.description || '',
                    dueDate: task?.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '',
                    assignedToName: task?.assignedToName || '',
                    assignedTo: task?.assignedTo?._id || task?.assignedTo?.id || task?.assignedTo || '',
                    priority: task?.priority || 'Medium',
                  });
                }}
                className="px-4 py-2 rounded-xl text-xs font-bold text-[#6B6B7E] bg-[#F4F3EF] hover:bg-[#E8E7E2] transition-all"
              >
                Cancel
              </button>
              <button
                disabled={isSaving}
                onClick={handleSave}
                className="w-[145.83px] h-[32px] rounded-xl text-xs font-bold text-white bg-[#0D47A1] hover:bg-[#0a3a82] transition-all flex items-center justify-center gap-2 whitespace-nowrap"
              >
                {isSaving ? (
                  <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <FiCheck size={14} />
                )}
                {isSaving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsEditing(true)}
                className="w-10 h-10 rounded-xl bg-[#F4F3EF] text-[#6B6B7E] flex items-center justify-center hover:bg-emerald-500 hover:text-white transition-all shadow-sm"
              >
                <FiEdit2 size={18} />
              </button>

              <button
                onClick={onBack}
                className="w-10 h-10 rounded-xl bg-[#F4F3EF] text-[#6B6B7E] flex items-center justify-center hover:bg-red-100 hover:text-red-500 transition-all active:scale-90 shadow-sm"
              >
                <FiX size={20} />
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 p-8 space-y-8 overflow-y-auto custom-scrollbar">
        {/* Title Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#0D47A1]/5 flex items-center justify-center text-[#0D47A1]">
              <FiCheckSquare size={24} />
            </div>
            <input type="text"
              readOnly={!isEditing}
              className={`flex-1 bg-transparent rounded-xl px-3 py-1.5 -ml-2 text-2xl font-bold text-[#1A1A2E] leading-tight transition-all outline-none border ${isEditing ? 'border-black bg-white shadow-sm' : 'border-transparent'}`}
              value={editableTask.title}
              onChange={e => setEditableTask(p => ({ ...p, title: e.target.value }))}
              onBlur={e => handleBlur('title', e.target.value)}
              placeholder="Task Title"
            />
          </div>
          <div className="flex flex-wrap gap-3">
            <StatusBadge status={task.status} />
            <PriorityBadge priority={task.priority} />
          </div>
        </div>

        {/* Info Grid */}
        <div className="bg-[#FAFAF8] rounded-[32px] border border-[#F4F3EF] p-8">
          <div className="grid grid-cols-2 gap-x-12 gap-y-8">
            <div className="space-y-1.5 text-left relative">
              <span className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-[2px] block text-left">Assigned To</span>
              <div className="flex items-center gap-2 relative">
                <div className="w-8 h-8 rounded-lg bg-[#F0F7FF] text-[#1B4DA0] flex items-center justify-center font-black text-[10px] shrink-0">
                  {editableTask.assignedToName?.split(' ').map(n => n[0]).join('') || '?'}
                </div>
                <input
                  type="text"
                  readOnly={!isEditing}
                  className={`w-full bg-transparent rounded-xl px-3 py-1.5 -ml-2 text-sm font-bold text-[#1A1A2E] outline-none transition-all border ${isEditing ? 'border-black bg-white shadow-sm' : 'border-transparent'}`}
                  value={editableTask.assignedToName}
                  onChange={e => {
                    setEditableTask(p => ({ ...p, assignedToName: e.target.value }));
                    if (isEditing) setShowAssigneeSuggestions(true);
                  }}
                  onFocus={() => isEditing && setShowAssigneeSuggestions(true)}
                  onBlur={(e) => {
                    setTimeout(() => setShowAssigneeSuggestions(false), 200);
                  }}
                />
                
                {showAssigneeSuggestions && (
                  <div className="absolute z-50 top-full left-0 mt-1 w-full bg-white border border-[#F4F3EF] rounded-2xl shadow-xl max-h-48 overflow-y-auto custom-scrollbar">
                    {teamMembers
                      .filter(m => m.name.toLowerCase().includes((editableTask.assignedToName || '').toLowerCase()))
                      .map(m => (
                        <div
                          key={m.id || m._id}
                          className="px-4 py-3 hover:bg-[#FAFAF8] cursor-pointer border-b border-[#F4F3EF] last:border-0 flex items-center gap-3"
                          onClick={() => {
                            const newId = m.id || m._id;
                            const newName = m.name;
                            setEditableTask(p => ({ ...p, assignedToName: newName, assignedTo: newId }));
                            
                            // Immediately dispatch save for both name and ID
                            handleBlur('assignedTo', newId);
                            // To keep parent UI correctly synced with assignedToName instead of UUID, 
                            // we update the parent state object directly via another action block down in handleBlur:
                            setTimeout(() => handleBlur('assignedToName', newName), 100);
                            
                            setShowAssigneeSuggestions(false);
                          }}
                        >
                          <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-black text-[10px]">
                            {m.name.charAt(0)}
                          </div>
                          <span className="text-xs font-bold text-[#1A1A2E]">{m.name}</span>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            </div>
            <div className="space-y-1.5 text-left group">
              <span className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-[2px] block text-left group-hover:text-[#0D47A1] transition-colors">Due Date</span>
              <div className="flex items-center gap-2">
                <FiCalendar className="text-[#9B9BAD]" size={14} />
                <input type="date"
                  readOnly={!isEditing}
                  className={`w-full bg-transparent rounded-xl px-3 py-1.5 -ml-2 text-sm font-bold transition-all outline-none border ${isEditing ? 'border-black bg-white shadow-sm' : 'border-transparent'} ${relativeDate.color} cursor-pointer`}
                  value={editableTask.dueDate}
                  onChange={e => setEditableTask(p => ({ ...p, dueDate: e.target.value }))}
                  onBlur={e => handleBlur('dueDate', e.target.value)}
                />
                <span className={`text-sm font-bold ${relativeDate.color} opacity-60 pointer-events-none -ml-2`}>({relativeDate.label})</span>
              </div>
            </div>
            {task.targets && task.targets.length > 0 && (
              <div className="col-span-2 space-y-4 pt-4 border-t border-[#F4F3EF]">
                <span className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-[2px] block text-left">Targets & Metrics</span>
                <div className="grid grid-cols-2 gap-4">
                  {task.targets.map((tg, idx) => (
                    <div key={idx} className="bg-white border border-[#F4F3EF] rounded-2x p-4 flex items-center gap-4 group hover:shadow-md transition-all duration-300">
                      <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                        {tg.type === 'Calling' && <FiPhone size={18} />}
                        {tg.type === 'Interviews' && <FiUsers size={18} />}
                        {tg.type === 'Hiring' && <FiUserPlus size={18} />}
                        {tg.type === 'Profile Visited' && <FiEye size={18} />}
                      </div>
                      <div className="text-left">
                        <p className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-wider">{tg.type}</p>
                        <p className="text-lg font-black text-[#1A1A2E]">{tg.value}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="pt-8 mt-8 border-t border-[#F4F3EF] text-left group">
            <div className="flex justify-between items-center mb-4">
              <span className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-[2px] block text-left group-hover:text-[#0D47A1] transition-colors">Description</span>
              <span className="text-[9px] font-bold text-[#9B9BAD] opacity-0 group-hover:opacity-100 transition-opacity italic">Click to edit</span>
            </div>
            <textarea
              readOnly={!isEditing}
              className={`w-full bg-transparent rounded-xl p-3 -mx-3 text-sm text-[#4B4B5E] leading-relaxed font-medium resize-none transition-all outline-none border ${isEditing ? 'border-black bg-white shadow-sm' : 'border-transparent'}`}
              rows={Math.max(4, (editableTask.description || '').split('\n').length)}
              value={editableTask.description}
              onChange={e => setEditableTask(p => ({ ...p, description: e.target.value }))}
              onBlur={e => handleBlur('description', e.target.value)}
              placeholder="No description provided for this task (Click to edit)."
            />
          </div>
        </div>


      </div>

      {/* Footer */}
      <div className="p-8 border-t border-[#F4F3EF] bg-[#FAFAF8]">
        <button
          onClick={onBack}
          className="w-full py-4 bg-white border-2 border-[#F4F3EF] text-[#6B6B7E] rounded-2xl font-bold text-sm hover:bg-[#F4F3EF] transition-all"
        >
          Close View
        </button>
      </div>
    </div>
  );
};

const normalizeUserType = (type = '') => {
  const value = type.toString().trim().toLowerCase();
  if (['superadmin', 'super_admin', 'super admin'].includes(value)) return 'superadmin';
  if (['admin'].includes(value)) return 'admin';
  if (['recruitmenthead', 'recruitment_head', 'recruitment head', 'recruitment'].includes(value)) return 'recruitmenthead';
  if (['hrrecruitment', 'hr_recruitment', 'hr recruitment', 'recruitmenthr', 'recruitment_hr', 'recruitment hr'].includes(value)) return 'hrrecruitment';
  if (['hroperations', 'hr_operations', 'hr operations', 'operations', 'hroperations'].includes(value)) return 'hroperations';
  if (['department head', 'departmenthead', 'department_head'].includes(value)) return 'departmenthead';
  if (['hr executive', 'hrexecutive', 'hr_executive'].includes(value)) return 'kamrecruitment';
  if (['kamrecruitment', 'kam_recruitment', 'kam recruitment', 'kam'].includes(value)) return 'kamrecruitment';
  if (['hr', 'hrdepartment', 'hr department'].includes(value)) return 'hr';
  return value;
};

const TaskAssignmentTab = ({ department = 'HR Operations', userRole }) => {
  const [tasks, setTasks] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [kamFilter, setKamFilter] = useState('');

  const [selectedTasks, setSelectedTasks] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [toast, setToast] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    assignedTo: '',
    priority: 'Medium',
    dueDate: '',
    targets: [], // Array of { type, value }
  });
  const [currentTargetType, setCurrentTargetType] = useState('Calling');
  const [currentTargetValue, setCurrentTargetValue] = useState('');
  const [viewingTask, setViewingTask] = useState(null);
  const [showDrawer, setShowDrawer] = useState(false);

  const currentUserRole = useMemo(() => {
    const type = localStorage.getItem('userType') || userRole || '';
    const role = localStorage.getItem('userRole') || '';
    
    // Check both userType and userRole from localStorage
    const normalizedType = normalizeUserType(type);
    const normalizedRole = normalizeUserType(role);
    
    if (['recruitmenthead', 'admin', 'superadmin'].includes(normalizedType)) return normalizedType;
    if (['recruitmenthead', 'admin', 'superadmin'].includes(normalizedRole)) return normalizedRole;
    
    return normalizedType;
  }, [userRole]);

  const canAssignTasks = useMemo(() => {
    const roles = ['admin', 'superadmin', 'super_admin', 'recruitmenthead', 'departmenthead', 'hroperations', 'hrrecruitment', 'hr'];
    return roles.includes(currentUserRole);
  }, [currentUserRole]);

  const getCurrentUserIdFromToken = () => {
    const token = localStorage.getItem('token');
    if (!token) return null;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload?.id?.toString() || payload?.userId?.toString();
    } catch {
      return null;
    }
  };

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    fetchData();
  }, [department]);

  const fetchData = async () => {
    try {
      setLoading(true);
      // We wrap individual promises in a shorter timeout for dev experience
      const fetchWithTimeout = (promise, ms = 2000) =>
        Promise.race([promise, new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), ms))]);

      const [tasksRes, membersRes] = await Promise.all([
        fetchWithTimeout(getDepartmentTasks(department)).catch(() => null),
        fetchWithTimeout(getDepartmentTeamMembers(department)).catch(() => null),
      ]);

      if (tasksRes?.tasks && tasksRes.tasks.length > 0) {
        setTasks(tasksRes.tasks.map(t => ({ ...t, id: t.id || t._id })));
      }
      if (membersRes?.members && membersRes.members.length > 0) {
        setTeamMembers(membersRes.members);
      }
    } catch (error) {
      console.warn('API Error, using mock data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canAssignTasks) {
      showToast('Only admins can assign tasks', 'error');
      return;
    }

    const currentUserId = getCurrentUserIdFromToken();
    if (currentUserId && formData.assignedTo === currentUserId) {
      showToast('You cannot assign a task to yourself', 'error');
      return;
    }

    try {
      const taskData = {
        ...formData,
        department,
      };

      if (editingTask) {
        const taskId = editingTask._id || editingTask.id;
        await updateDepartmentTask(taskId, taskData);
      } else {
        await createDepartmentTask(taskData);
      }

      setShowModal(false);
      setEditingTask(null);
      setFormData({ title: '', description: '', assignedTo: '', priority: 'Medium', dueDate: '', targets: [] });
      showToast(editingTask ? 'Task updated!' : 'Task assigned!');
      fetchData();
    } catch (error) {
      console.error('Error saving task:', error);
      showToast(error.message || 'Failed to save task', 'error');
    }
  };

  const handleStatusChange = async (task, newStatus) => {
    const taskId = task._id || task.id;
    try {
      await updateDepartmentTask(taskId, { status: newStatus });
      setTasks(tasks.map(t => (t.id === taskId || t._id === taskId) ? { ...t, status: newStatus } : t));
      showToast(`Task marked as ${newStatus}`);
    } catch (error) {
      console.error('Error updating status:', error);
      showToast('Failed to update status', 'error');
    }
  };

  const handleDelete = async (task) => {
    const taskId = task?._id || task?.id || task;
    try {
      await deleteDepartmentTask(taskId);
      setTasks(tasks.filter(t => t.id !== taskId && t._id !== taskId));
      setConfirmDelete(null);
      showToast('Task deleted');
    } catch (error) {
      console.error('Error deleting task:', error);
      showToast('Failed to delete task', 'error');
    }
  };

  const uniqueAssignees = [...new Set([...tasks.map(t => t.assignedToName).filter(Boolean), ...teamMembers.map(m => m.name)])];

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.assignedToName?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPriority = !priorityFilter || task.priority === priorityFilter;
    const matchesStatus = !statusFilter || task.status === statusFilter;
    const matchesKam = !kamFilter || task.assignedToName === kamFilter;
    return matchesSearch && matchesPriority && matchesStatus && matchesKam;
  });



  const getTaskCardTone = (status) => {
    switch (status) {
      case 'Completed':
        return { border: '#10b981', bg: 'linear-gradient(180deg, #ffffff, #f0fdf4)' };
      default:
        return { border: '#f59e0b', bg: 'linear-gradient(180deg, #ffffff, #fffbeb)' };
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <div className="h-9 w-64 rounded-lg bg-gray-200 animate-pulse" />
            <div className="h-4 w-48 rounded-lg bg-gray-100 animate-pulse mt-2" />
          </div>
          <div className="h-11 w-40 rounded-xl bg-gray-200 animate-pulse" />
        </div>
        <div className="grid grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-20 rounded-xl bg-gray-200 animate-pulse" />
          ))}
        </div>
        {[1, 2, 3].map(i => (
          <div key={i} className="h-24 rounded-xl bg-gray-100 animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-10" style={{ fontFamily: "'Calibri', sans-serif" }}>
      {/* Toast Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -40, scale: 0.95 }}
            style={{
              position: 'fixed', top: '24px', right: '24px', zIndex: 9999,
              padding: '14px 20px', borderRadius: '12px',
              background: toast.type === 'error' ? '#fef2f2' : '#f0fdf4',
              border: `1px solid ${toast.type === 'error' ? '#fecaca' : '#bbf7d0'}`,
              boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
              display: 'flex', alignItems: 'center', gap: '10px',
              maxWidth: '360px',
            }}
          >
            <span style={{
              width: '24px', height: '24px', borderRadius: '50%',
              background: toast.type === 'error' ? '#ef4444' : '#22c55e',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', fontSize: '12px', fontWeight: 700, flexShrink: 0,
            }}>
              {toast.type === 'error' ? '!' : '✓'}
            </span>
            <span style={{ fontSize: '14px', fontWeight: 500, color: toast.type === 'error' ? '#991b1b' : '#166534' }}>
              {toast.message}
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
        <div className="text-left">
          <h2 className="text-3xl font-bold text-[#1A1A2E]" style={{ fontFamily: "'Syne', sans-serif" }}>Task Assignment</h2>

        </div>
        {canAssignTasks ? (
          <motion.button
            whileHover={{ scale: 1.02, translateY: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => { setEditingTask(null); setFormData({ title: '', description: '', assignedTo: '', priority: 'Medium', dueDate: '', targets: [] }); setShowModal(true); }}
            className="flex items-center gap-2 px-6 py-3 bg-[#0D47A1] hover:bg-[#0a3a82] text-white rounded-xl text-sm font-bold shadow-lg shadow-[#0D47A1]/20 transition-all border border-white/10"
          >
            <FiPlus size={20} />
            Assign Task
          </motion.button>
        ) : (
          <div className="flex items-center gap-2 px-5 py-3 rounded-xl bg-[#F8FAFC] border border-[#E5E7EB] text-sm font-medium text-[#6B7280]">
            <FiAlertCircle size={18} />
            Only admins can assign tasks.
          </div>
        )}
      </div>





      <div className="bg-white rounded-[24px] p-2 mt-8 mb-5 border border-[#F4F3EF] shadow-sm flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 group min-w-[200px]">
          <FiSearch className="absolute left-5 top-1/2 -translate-y-1/2 text-[#9B9BAD] transition-colors" size={18} />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by title, client or location..."
            className="w-full bg-[#F4F3EF] border-none rounded-2xl py-3 pl-14 pr-5 text-sm font-medium focus:ring-2 focus:ring-[#F4F3EF] outline-none transition-all placeholder:text-[#9B9BAD]"
          />
        </div>
        <div className="relative">
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="bg-[#F4F3EF] text-xs font-bold uppercase tracking-wider text-[#1A1A2E] rounded-xl pl-4 pr-10 py-2.5 outline-none border-0 cursor-pointer appearance-none"
          >
            <option value="">All Priority</option>
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
            <option value="Urgent">Urgent</option>
          </select>
          <FiChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 text-[#9B9BAD] pointer-events-none rotate-90" size={14} />
        </div>

        <div className="relative">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-[#F4F3EF] text-xs font-bold uppercase tracking-wider text-[#1A1A2E] rounded-xl pl-4 pr-10 py-2.5 outline-none border-0 cursor-pointer appearance-none"
          >
            <option value="">All Status</option>
            <option value="Pending">Pending</option>
            <option value="Completed">Completed</option>
          </select>
          <FiChevronRight className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9B9BAD] pointer-events-none rotate-90" size={14} />
        </div>

        <div className="relative">
          <select
            value={kamFilter}
            onChange={(e) => setKamFilter(e.target.value)}
            className="bg-[#F4F3EF] text-xs font-bold uppercase tracking-wider text-[#1A1A2E] rounded-xl pl-4 pr-10 py-2.5 outline-none border-0 cursor-pointer appearance-none"
          >
            <option value="">All KAM</option>
            {uniqueAssignees.map(name => <option key={name} value={name}>{name}</option>)}
          </select>
          <FiChevronRight className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9B9BAD] pointer-events-none rotate-90" size={14} />
        </div>
      </div>

      {/* Task Directory Table */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#FAFAF8]">
                <th className="p-5 w-14">
                  <input
                    type="checkbox"
                    className="w-4 h-4 rounded border-gray-300 text-[#1B4DA0] focus:ring-[#1B4DA0]"
                    onChange={(e) => {
                      if (e.target.checked) setSelectedTasks(filteredTasks.map(t => t._id || t.id));
                      else setSelectedTasks([]);
                    }}
                    checked={selectedTasks.length === filteredTasks.length && filteredTasks.length > 0}
                  />
                </th>
                <th className="p-5 text-[11px] font-black text-[#9B9BAD] uppercase tracking-widest">Task Details</th>
                <th className="p-5 text-[11px] font-black text-[#9B9BAD] uppercase tracking-widest text-center">Assignee</th>
                <th className="p-5 text-[11px] font-black text-[#9B9BAD] uppercase tracking-widest">Status</th>
                <th className="p-5 w-16"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 text-sm">
              {filteredTasks.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-20 text-center text-[#9B9BAD]">
                    <div className="flex flex-col items-center gap-4">
                      <FiCheckSquare size={48} className="opacity-20" />
                      <p className="font-bold">No tasks found in this directory</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredTasks.map((task) => (
                  <tr
                    key={task._id || task.id}
                    onClick={() => {
                      setViewingTask(task);
                      setShowDrawer(true);
                    }}
                    className={`group hover:bg-[#F8FAFC] transition-colors cursor-pointer ${selectedTasks.includes(task._id || task.id) ? 'bg-[#F1F5F9]' : ''}`}
                  >
                    <td className="p-5">
                      <input
                        type="checkbox"
                        className="w-4 h-4 rounded border-gray-300 text-[#1B4DA0] focus:ring-[#1B4DA0]"
                        checked={selectedTasks.includes(task._id || task.id)}
                        onChange={(e) => {
                          e.stopPropagation();
                          const taskId = task._id || task.id;
                          if (selectedTasks.includes(taskId)) setSelectedTasks(selectedTasks.filter(id => id !== taskId));
                          else setSelectedTasks([...selectedTasks, taskId]);
                        }}
                        onClick={(e) => e.stopPropagation()}
                      />
                    </td>
                    <td className="p-5 max-w-sm">
                      <div className="space-y-1">
                        <p className="font-bold text-[#1A1A2E] group-hover:text-[#1B4DA0] transition-colors">{task.title}</p>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-widest">RECRUITMENT</span>
                          <PriorityBadge priority={task.priority} />
                        </div>
                      </div>
                    </td>
                    <td className="p-5">
                      <div className="flex items-center justify-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-[#F0F7FF] text-[#1B4DA0] flex items-center justify-center font-black text-xs border border-[#1B4DA0]/10 shadow-sm">
                          {task.assignedToName.split(' ').map(n => n[0]).join('')}
                        </div>
                        <span className="font-bold text-[#4B4B5E]">{task.assignedToName}</span>
                      </div>
                    </td>
                    <td className="p-5">
                      <StatusBadge status={task.status} />
                    </td>
                    <td className="p-5 px-0">
                      <div className="flex items-center gap-1 pr-5">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setViewingTask(task);
                            setShowDrawer(true);
                          }}
                          className="w-8 h-8 rounded-lg bg-[#F4F3EF] text-[#6B6B7E] hover:bg-emerald-500 hover:text-white transition-all flex items-center justify-center shadow-sm"
                        >
                          <FiEdit2 size={14} />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setConfirmDelete(task);
                          }}
                          className="w-8 h-8 rounded-lg bg-[#F4F3EF] text-[#6B6B7E] hover:bg-red-500 hover:text-white transition-all flex items-center justify-center shadow-sm"
                        >
                          <FiTrash2 size={14} />
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

      {/* Selection Action Bar (Snackbar) */}
      <AnimatePresence>
        {selectedTasks.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 px-8 py-4 bg-[#1A1A2E] rounded-2xl shadow-2xl flex items-center gap-8 border border-white/10"
          >
            <div className="flex items-center gap-3 pr-8 border-r border-white/10">
              <span className="px-2 py-1 bg-[#1B4DA0] rounded-lg text-white text-xs font-black">{selectedTasks.length}</span>
              <span className="text-sm font-bold text-white">tasks selected</span>
            </div>
            <div className="flex items-center gap-6">
              <button
                onClick={() => {
                  if (selectedTasks.length !== 1) {
                    showToast('Please select exactly 1 task to edit', 'error');
                    return;
                  }
                  const taskToEdit = tasks.find(t => (t._id === selectedTasks[0] || t.id === selectedTasks[0]));
                  if (taskToEdit) {
                    setViewingTask(taskToEdit);
                    setShowDrawer(true);
                  }
                }}
                disabled={selectedTasks.length !== 1}
                className={`flex items-center gap-2 text-sm font-bold transition-colors ${selectedTasks.length === 1 ? 'text-[#3B82F6] hover:text-[#2563EB]' : 'text-gray-500 cursor-not-allowed opacity-50'}`}
              >
                <FiEdit2 size={18} />
                Edit
              </button>
              <button
                onClick={() => {
                  if (window.confirm(`Delete ${selectedTasks.length} tasks?`)) {
                    selectedTasks.forEach(id => handleDelete(id));
                    setSelectedTasks([]);
                  }
                }}
                className="flex items-center gap-2 text-sm font-bold text-red-400 hover:text-red-300 transition-colors"
              >
                <FiTrash2 size={18} />
                Delete
              </button>
            </div>
            <button
              onClick={() => setSelectedTasks([])}
              className="w-8 h-8 rounded-lg bg-white/10 text-white hover:bg-red-500 hover:text-white transition-all flex items-center justify-center"
            >
              <FiX size={16} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 backdrop-blur-md"
              onClick={() => { setShowModal(false); setEditingTask(null); }}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-white rounded-[32px] shadow-2xl w-full max-w-[576px] overflow-hidden"
              style={{ maxHeight: '90vh' }}
            >
              {/* Header */}
              <div className="px-10 py-8 border-b border-[#F4F3EF] flex items-center justify-between bg-gradient-to-r from-[#F8FAFF] to-white">
                <div className="text-left">
                  <h3 className="text-2xl font-bold text-[#1A1A2E] leading-tight" style={{ fontFamily: "'Syne', sans-serif" }}>
                    {editingTask ? 'Edit Task Details' : 'Assign New Task'}
                  </h3>
                  <p className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-[0.2em] mt-2.5">
                    {editingTask ? 'Job Management & Updates' : 'Team Tasking & Operations'}
                  </p>
                </div>
                <button
                  onClick={() => { setShowModal(false); setEditingTask(null); }}
                  className="w-10 h-10 rounded-2xl bg-[#F4F3EF]/50 flex items-center justify-center text-[#9B9BAD] hover:text-[#E11D48] hover:bg-[#FFF1F2] transition-all"
                >
                  <FiX size={18} />
                </button>
              </div>

              {/* Form Content */}
              <div className="px-8 pb-8 overflow-y-auto">
                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Task Title */}
                  <div className="space-y-1.5 w-full">
                    <label className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-widest block text-left mb-1.5">Task Title *</label>
                    <div className="relative group">
                      <FiType className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400/80 group-focus-within:text-[#1B4DA0] transition-colors" size={18} />
                      <input
                        type="text"
                        required
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        placeholder="e.g. Process March Payroll"
                        className="w-full bg-[#F8F9FA] border-none rounded-2xl py-3 pl-12 pr-4 text-sm font-bold text-[#1A1A2E] focus:ring-4 focus:ring-[#1B4DA0]/5 outline-none transition-all placeholder:text-gray-300"
                      />
                    </div>
                  </div>

                  {/* Assign To & Priority */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5 w-full">
                      <label className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-widest block text-left mb-1.5">Assign To *</label>
                      <div className="relative group">
                        <FiUser className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400/80 group-focus-within:text-[#1B4DA0] transition-colors pointer-events-none" size={18} />
                        <select
                          required
                          value={formData.assignedTo}
                          onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
                          className="w-full bg-[#F8F9FA] border-none rounded-2xl py-3 pl-12 pr-10 text-sm font-bold text-[#1A1A2E] focus:ring-4 focus:ring-[#1B4DA0]/5 outline-none transition-all appearance-none cursor-pointer"
                        >
                          <option value="">Select member</option>
                          {teamMembers.map((member) => (
                            <option key={member.id || member._id} value={member.id || member._id}>{member.name}</option>
                          ))}
                        </select>
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                          <FiMoreHorizontal size={14} className="rotate-90" />
                        </div>
                      </div>
                    </div>
                    <div className="space-y-1.5 w-full">
                      <label className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-widest block text-left mb-1.5">Priority</label>
                      <div className="relative group">
                        <FiZap className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400/80 group-focus-within:text-[#1B4DA0] transition-colors pointer-events-none" size={18} />
                        <select
                          value={formData.priority}
                          onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                          className="w-full bg-[#F8F9FA] border-none rounded-2xl py-3 pl-12 pr-10 text-sm font-bold text-[#1A1A2E] focus:ring-4 focus:ring-[#1B4DA0]/5 outline-none transition-all appearance-none cursor-pointer"
                        >
                          <option value="Low">Low</option>
                          <option value="Medium">Medium</option>
                          <option value="High">High</option>
                          <option value="Urgent">Urgent</option>
                        </select>
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                          <FiMoreHorizontal size={14} className="rotate-90" />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Due Date */}
                  <div className="grid grid-cols-1 gap-6">
                    <div className="space-y-1.5 w-full">
                      <label className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-widest block text-left mb-1.5">Due Date</label>
                      <div className="relative group">
                        <FiCalendar className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400/80 group-focus-within:text-[#1B4DA0] transition-colors" size={18} />
                        <input
                          type="date"
                          value={formData.dueDate}
                          onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                          className="w-full bg-[#F8F9FA] border-none rounded-2xl py-3 pl-12 pr-4 text-sm font-bold text-[#1A1A2E] focus:ring-4 focus:ring-[#1B4DA0]/5 outline-none transition-all"
                        />
                      </div>
                    </div>
                  </div>


                  {/* Description */}
                  <div className="space-y-1.5 w-full">
                    <label className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-widest block text-left mb-1.5">Description</label>
                    <div className="relative group">
                      <FiAlignLeft className="absolute left-4 top-[18px] text-gray-400/80 group-focus-within:text-[#1B4DA0] transition-colors" size={18} />
                      <textarea
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        placeholder="Expected outcomes and task details..."
                        rows={3}
                        className="w-full bg-[#F8F9FA] border-none rounded-2xl py-3 pl-12 pr-4 text-sm font-medium text-[#1A1A2E] focus:ring-4 focus:ring-[#1B4DA0]/5 outline-none transition-all resize-none placeholder:text-gray-300"
                      />
                    </div>
                  </div>

                  {/* Footer Buttons */}
                  <div className="flex gap-4 pt-4">
                    <button
                      type="button"
                      onClick={() => { setShowModal(false); setEditingTask(null); }}
                      className="flex-1 py-3.5 bg-[#F8F9FA] hover:bg-gray-100 text-gray-500 rounded-2xl text-sm font-bold transition-all"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 py-3.5 bg-[#1B4DA0] hover:bg-[#0D47A1] text-white rounded-2xl text-sm font-bold shadow-lg shadow-[#1B4DA0]/20 transition-all"
                    >
                      {editingTask ? 'Update Task' : 'Assign Task'}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Right Side Drawer for Task Details */}
      {createPortal(
        <AnimatePresence>
          {showDrawer && (
            <>
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => { setShowDrawer(false); setViewingTask(null); }}
                className="fixed inset-0 bg-[#1A1A2E]/40 backdrop-blur-md z-[1100]"
              />

              {/* Sliding Panel */}
              <motion.div
                initial={{ x: '100%', opacity: 0.5 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: '100%', opacity: 0.5 }}
                transition={{ type: "spring", damping: 30, stiffness: 300 }}
                className="fixed inset-y-0 right-0 w-full sm:w-[698px] bg-white shadow-2xl z-[1101] border-l border-[#F4F3EF] flex flex-col overflow-hidden"
              >
                <TaskDetailView
                  task={viewingTask}
                  onBack={() => { setShowDrawer(false); setViewingTask(null); }}
                  showToast={showToast}
                  onUpdateTask={(updated) => {
                    const taskId = updated._id || updated.id || viewingTask._id || viewingTask.id;
                    setTasks(prev => prev.map(t => (t._id === taskId || t.id === taskId) ? { ...t, ...updated } : t));
                    setViewingTask(prev => ({ ...prev, ...updated }));
                  }}
                  teamMembers={teamMembers}
                  onEdit={(task) => {
                    // This is handled internally now by isEditing state within TaskDetailView
                  }}
                />
              </motion.div>
            </>
          )}
        </AnimatePresence>,
        document.body
      )}

      {/* Delete Confirmation */}
      <AnimatePresence>
        {confirmDelete && (
          <div className="fixed inset-0 z-[1100] flex items-center justify-center p-4 text-center">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-[#1A1A2E]/40 backdrop-blur-md"
              onClick={() => setConfirmDelete(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center"
            >
              <div className="mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-4" style={{ background: '#fee2e2' }}>
                <FiTrash2 style={{ width: '32px', height: '32px', color: '#ef4444' }} />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-1">Delete Task?</h3>
              <p className="text-sm text-gray-500 mb-5">This action cannot be undone.</p>
              <div className="flex items-center justify-center gap-3">
                <button onClick={() => setConfirmDelete(null)} className="px-5 py-2.5 text-sm font-semibold rounded-xl bg-gray-100 text-gray-600">Cancel</button>
                <button
                  onClick={() => handleDelete(confirmDelete)}
                  style={{
                    padding: '10px 20px', fontSize: '14px', fontWeight: 600,
                    borderRadius: '12px', border: 'none', cursor: 'pointer',
                    background: 'linear-gradient(135deg, #ef4444, #e11d48)',
                    color: '#fff',
                  }}
                >Delete</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TaskAssignmentTab;
