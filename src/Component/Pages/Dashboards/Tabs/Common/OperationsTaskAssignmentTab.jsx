import { useState, useEffect, useMemo, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiCheckSquare,
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiSearch,
  FiCalendar,
  FiX,
  FiAlertCircle,
  FiType,
  FiZap,
  FiAlignLeft,
  FiChevronRight,
  FiUser,
  FiMoreHorizontal,
  FiCheck,
  FiLoader,
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
  if (!date) return { label: 'No deadline', color: 'text-gray-400', bg: 'bg-gray-400' };
  const d = new Date(date);
  const now = new Date();
  const diff = d - now;
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24));

  if (days === 0) return { label: 'Today', color: 'text-rose-500', bg: 'bg-rose-500' };
  if (days === 1) return { label: 'Tomorrow', color: 'text-amber-500', bg: 'bg-amber-500' };
  return { label: d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }), color: 'text-[#9B9BAD]', bg: 'bg-[#9B9BAD]' };
};

const TaskDetailView = ({ task, onBack, onUpdateTask, showToast, teamMembers = [] }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [showAssigneeSuggestions, setShowAssigneeSuggestions] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
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

  const handleSave = async () => {
    try {
      setIsSaving(true);
      const taskId = task._id || task.id;
      const { assignedToName, ...payload } = editableTask;
      await updateDepartmentTask(taskId, payload);
      if (showToast) showToast(`Task updated successfully!`);
      if (onUpdateTask) onUpdateTask({ ...editableTask, id: taskId, _id: taskId });
      setIsEditing(false);
    } catch (err) {
      if (showToast) showToast('Failed to save changes.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  if (!task) return null;
  const relativeDate = getRelativeDate(editableTask.dueDate || task.dueDate);

  return (
    <div className="flex flex-col h-full bg-white relative">
      <div className="sticky top-0 bg-white/90 backdrop-blur-md border-b border-[#F4F3EF] px-8 py-6 flex items-center justify-between z-20">
        <div className="text-left">
          <h2 className="text-xl font-bold text-[#1A1A2E] leading-tight" style={{ fontFamily: "'Syne', sans-serif" }}>Task Details</h2>
          <p className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-[2px] mt-1">HR OPERATIONS</p>
        </div>
        <div className="flex items-center gap-3">
          {isEditing ? (
            <div className="flex items-center gap-2">
              <button onClick={() => setIsEditing(false)} className="px-4 py-2 rounded-xl text-xs font-bold text-[#6B6B7E] bg-[#F4F3EF]">Cancel</button>
              <button onClick={handleSave} className="px-6 py-2 rounded-xl text-xs font-bold text-white bg-[#0D47A1] flex items-center gap-2">
                {isSaving ? <FiLoader className="animate-spin" /> : <FiCheck />} Save
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button onClick={() => setIsEditing(true)} className="w-10 h-10 rounded-xl bg-[#F4F3EF] text-[#6B6B7E] flex items-center justify-center hover:bg-emerald-500 hover:text-white transition-all"><FiEdit2 size={18} /></button>
              <button onClick={onBack} className="w-10 h-10 rounded-xl bg-[#F4F3EF] text-[#6B6B7E] flex items-center justify-center hover:bg-red-500 hover:text-white transition-all"><FiX size={20} /></button>
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 p-8 space-y-8 overflow-y-auto custom-scrollbar">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#0D47A1]/5 flex items-center justify-center text-[#0D47A1]"><FiCheckSquare size={24} /></div>
            <input type="text" readOnly={!isEditing} className={`flex-1 bg-transparent rounded-xl px-3 py-1.5 -ml-2 text-2xl font-bold text-[#1A1A2E] outline-none border ${isEditing ? 'border-black bg-white shadow-sm' : 'border-transparent'}`} value={editableTask.title} onChange={e => setEditableTask(p => ({ ...p, title: e.target.value }))} />
          </div>
          <div className="flex flex-wrap gap-3">
            <StatusBadge status={task.status} />
            <PriorityBadge priority={editableTask.priority} />
          </div>
        </div>

        <div className="bg-[#FAFAF8] rounded-[32px] border border-[#F4F3EF] p-8 text-left">
          <div className="grid grid-cols-2 gap-x-12 gap-y-8">
            <div className="space-y-1.5 relative">
              <span className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-[2px] block">Assigned To</span>
              <div className="flex items-center gap-2 relative">
                <div className="w-8 h-8 rounded-lg bg-[#F0F7FF] text-[#1B4DA0] flex items-center justify-center font-black text-[10px]">
                  {editableTask.assignedToName?.charAt(0) || '?'}
                </div>
                <input
                  type="text" readOnly={!isEditing}
                  className={`w-full bg-transparent rounded-xl px-3 py-1.5 text-sm font-bold text-[#1A1A2E] outline-none border ${isEditing ? 'border-black bg-white' : 'border-transparent'}`}
                  value={editableTask.assignedToName}
                  onChange={e => {
                    setEditableTask(p => ({ ...p, assignedToName: e.target.value }));
                    if (isEditing) setShowAssigneeSuggestions(true);
                  }}
                  onFocus={() => isEditing && setShowAssigneeSuggestions(true)}
                  onBlur={() => setTimeout(() => setShowAssigneeSuggestions(false), 200)}
                />
                {showAssigneeSuggestions && (
                  <div className="absolute z-50 top-full left-0 mt-1 w-full bg-white border border-[#F4F3EF] rounded-2xl shadow-xl max-h-48 overflow-y-auto">
                    {teamMembers.filter(m => m.name.toLowerCase().includes(editableTask.assignedToName.toLowerCase())).map(m => (
                      <div key={m.id || m._id} className="px-4 py-3 hover:bg-[#FAFAF8] cursor-pointer text-xs font-bold" onClick={() => { setEditableTask(p => ({ ...p, assignedToName: m.name, assignedTo: m.id || m._id })); setShowAssigneeSuggestions(false); }}>
                        {m.name}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className="space-y-1.5">
              <span className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-[2px] block">Due Date</span>
              <div className="flex items-center gap-2 font-bold text-sm">
                <FiCalendar className="text-[#9B9BAD]" size={14} />
                <input type="date" readOnly={!isEditing} className={`bg-transparent outline-none border ${isEditing ? 'border-black bg-white rounded-lg px-2' : 'border-transparent'}`} value={editableTask.dueDate} onChange={e => setEditableTask(p => ({ ...p, dueDate: e.target.value }))} />
                <span className={`opacity-60 ${relativeDate.color}`}>({relativeDate.label})</span>
              </div>
            </div>
          </div>

          <div className="pt-8 mt-8 border-t border-[#F4F3EF]">
            <span className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-[2px] block mb-4">Description</span>
            <textarea
              readOnly={!isEditing}
              className={`w-full bg-transparent rounded-xl p-3 text-sm text-[#4B4B5E] leading-relaxed font-medium resize-none outline-none border ${isEditing ? 'border-black bg-white' : 'border-transparent'}`}
              rows={5}
              value={editableTask.description}
              onChange={e => setEditableTask(p => ({ ...p, description: e.target.value }))}
            />
          </div>
        </div>
      </div>
      <div className="p-8 border-t border-[#F4F3EF] bg-[#FAFAF8]">
        <button onClick={onBack} className="w-full py-4 bg-white border-2 border-[#F4F3EF] text-[#6B6B7E] rounded-2xl font-bold text-sm hover:bg-[#F4F3EF] transition-all">Close View</button>
      </div>
    </div>
  );
};

const OperationsTaskAssignmentTab = () => {
  const department = 'HR Operations';
  const [tasks, setTasks] = useState([
    {
      id: 'mock-1',
      _id: 'mock-1',
      title: 'Review March Payroll Reports',
      description: 'Carefully review the payroll spreadsheets for the HR Operations department to ensure all bonuses and deductions are accurate before final processing.',
      assignedToName: 'Ramesh Kumar',
      assignedTo: 'mem-1',
      priority: 'High',
      dueDate: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
      status: 'Pending',
      createdAt: new Date().toISOString()
    },
    {
      id: 'mock-2',
      _id: 'mock-2',
      title: 'Update Employee Policy Handbook',
      description: 'Incorporate the new remote work guidelines into the standard employee handbook and distribute the updated version to all team leads.',
      assignedToName: 'Suresh Singh',
      assignedTo: 'mem-2',
      priority: 'Medium',
      dueDate: new Date(Date.now() + 259200000).toISOString(), // 3 days from now
      status: 'Completed',
      createdAt: new Date().toISOString()
    }
  ]);
  const [teamMembers, setTeamMembers] = useState([
    { id: 'mem-1', _id: 'mem-1', name: 'Ramesh Kumar' },
    { id: 'mem-2', _id: 'mem-2', name: 'Suresh Singh' }
  ]);
  const [loading, setLoading] = useState(false); // Set loading to false by default for mock data visibility
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [kamFilter, setKamFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [viewingTask, setViewingTask] = useState(null);
  const [showDrawer, setShowDrawer] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    assignedTo: '',
    priority: 'Medium',
    dueDate: '',
  });

  const fetchData = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const [tasksRes, membersRes] = await Promise.all([
        getDepartmentTasks(department),
        getDepartmentTeamMembers(department)
      ]);
      if (tasksRes?.tasks) setTasks(tasksRes.tasks.map(t => ({ ...t, id: t.id || t._id })));
      if (membersRes?.members) setTeamMembers(membersRes.members);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      if (!silent) setLoading(false);
    }
  }, [department]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const taskData = { ...formData, department };
      if (editingTask) {
        await updateDepartmentTask(editingTask._id || editingTask.id, taskData);
        toast.success('Task updated successfully');
      } else {
        await createDepartmentTask(taskData);
        toast.success('Task assigned successfully');
      }
      setShowModal(false);
      setEditingTask(null);
      setFormData({ title: '', description: '', assignedTo: '', priority: 'Medium', dueDate: '' });
      fetchData();
    } catch (error) {
      toast.error('Failed to save task');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (taskId) => {
    try {
      await deleteDepartmentTask(taskId);
      setTasks(prev => prev.filter(t => t.id !== taskId && t._id !== taskId));
      setConfirmDelete(null);
      toast.success('Task deleted');
    } catch (error) {
      toast.error('Failed to delete task');
    }
  };

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.assignedToName?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !statusFilter || task.status === statusFilter;
    const matchesPriority = !priorityFilter || task.priority === priorityFilter;
    const matchesKam = !kamFilter || task.assignedToName === kamFilter;
    return matchesSearch && matchesStatus && matchesPriority && matchesKam;
  });

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-12 w-full bg-gray-100 rounded-2xl" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => <div key={i} className="h-48 bg-gray-50 rounded-3xl" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-10 text-left" style={{ fontFamily: "'Calibri', sans-serif" }}>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-[#1A1A2E]" style={{ fontFamily: "'Syne', sans-serif" }}>Task Assignment</h2>
          <p className="text-sm text-[#9B9BAD] font-medium mt-1">Manage and track team responsibilities</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
          onClick={() => { setEditingTask(null); setShowModal(true); }}
          className="flex items-center gap-2 px-6 py-3 bg-[#0D47A1] text-white rounded-xl text-sm font-bold shadow-lg shadow-blue-500/20"
        >
          <FiPlus size={20} /> Assign Task
        </motion.button>
      </div>

      {/* Search & Filters */}
      <div className="bg-white rounded-[24px] p-2 border border-[#F4F3EF] shadow-sm flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[300px]">
          <FiSearch className="absolute left-5 top-1/2 -translate-y-1/2 text-[#9B9BAD]" size={18} />
          <input
            type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search tasks or assignees..."
            className="w-full bg-[#F4F3EF] border-none rounded-2xl py-3 pl-14 pr-5 text-sm font-medium outline-none"
          />
        </div>

        <div className="flex items-center gap-2">
          <div className="relative group">
            <select 
              value={priorityFilter} 
              onChange={(e) => setPriorityFilter(e.target.value)} 
              className="bg-[#F4F3EF] rounded-xl pl-4 pr-10 py-3 text-xs font-bold uppercase outline-none cursor-pointer appearance-none min-w-[130px]"
            >
              <option value="">All Priority</option>
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
              <option value="Urgent">Urgent</option>
            </select>
            <FiChevronRight className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9B9BAD] pointer-events-none rotate-90" size={14} />
          </div>

          <div className="relative group">
            <select 
              value={statusFilter} 
              onChange={(e) => setStatusFilter(e.target.value)} 
              className="bg-[#F4F3EF] rounded-xl pl-4 pr-10 py-3 text-xs font-bold uppercase outline-none cursor-pointer appearance-none min-w-[130px]"
            >
              <option value="">All Status</option>
              <option value="Pending">Pending</option>
              <option value="Completed">Completed</option>
            </select>
            <FiChevronRight className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9B9BAD] pointer-events-none rotate-90" size={14} />
          </div>

          <div className="relative group">
            <select 
              value={kamFilter} 
              onChange={(e) => setKamFilter(e.target.value)} 
              className="bg-[#F4F3EF] rounded-xl pl-4 pr-10 py-3 text-xs font-bold uppercase outline-none cursor-pointer appearance-none min-w-[130px]"
            >
              <option value="">All Members</option>
              {[...new Set(tasks.map(t => t.assignedToName))].filter(Boolean).map(name => (
                <option key={name} value={name}>{name}</option>
              ))}
            </select>
            <FiChevronRight className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9B9BAD] pointer-events-none rotate-90" size={14} />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-[32px] border border-[#F4F3EF] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-[#FAFAFA] border-b border-[#F4F3EF]">
                <th className="p-6 text-[11px] font-black text-[#9B9BAD] uppercase tracking-widest">Task Details</th>
                <th className="p-6 text-[11px] font-black text-[#9B9BAD] uppercase tracking-widest text-center">Assignee</th>
                <th className="p-6 text-[11px] font-black text-[#9B9BAD] uppercase tracking-widest">Due Date</th>
                <th className="p-6 text-[11px] font-black text-[#9B9BAD] uppercase tracking-widest">Status</th>
                <th className="p-6 text-[11px] font-black text-[#9B9BAD] uppercase tracking-widest text-right whitespace-nowrap">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredTasks.length === 0 ? (
                <tr><td colSpan={5} className="p-20 text-center text-[#9B9BAD] font-bold">No tasks found</td></tr>
              ) : (
                filteredTasks.map(task => (
                  <tr key={task.id || task._id} className="group hover:bg-[#F8FAFC] transition-colors cursor-pointer" onClick={() => { setViewingTask(task); setShowDrawer(true); }}>
                    <td className="p-6">
                      <div className="space-y-1">
                        <p className="font-bold text-[#1A1A2E] group-hover:text-[#1B4DA0]">{task.title}</p>
                        <div className="flex items-center gap-2">
                           <span className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-widest">HR OPERATIONS</span>
                           <PriorityBadge priority={task.priority} />
                        </div>
                      </div>
                    </td>
                    <td className="p-6">
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-black text-[10px]">{task.assignedToName?.charAt(0)}</div>
                        <span className="text-xs font-bold text-[#4B4B5E]">{task.assignedToName}</span>
                      </div>
                    </td>
                    <td className="p-6">
                      <span className={`text-xs font-bold ${getRelativeDate(task.dueDate).color}`}>{getRelativeDate(task.dueDate).label}</span>
                    </td>
                    <td className="p-6">
                      <StatusBadge status={task.status} />
                    </td>
                    <td className="p-6 text-right">
                       <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={(e) => { e.stopPropagation(); setConfirmDelete(task.id || task._id); }} className="w-8 h-8 rounded-lg bg-red-50 text-red-500 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all"><FiTrash2 size={14} /></button>
                       </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals via Portals */}
      {createPortal(
        <AnimatePresence>
          {showModal && (
            <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/40 backdrop-blur-md" onClick={() => setShowModal(false)} />
              <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }} className="relative bg-white rounded-[32px] shadow-2xl w-full max-w-xl overflow-hidden">
                <div className="px-10 py-8 border-b border-[#F4F3EF] flex items-center justify-between">
                  <div className="text-left">
                    <h3 className="text-2xl font-bold text-[#1A1A2E] font-syne">Assign New Task</h3>
                    <p className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-widest mt-1">HR OPERATIONS PROTOCOL</p>
                  </div>
                  <button onClick={() => setShowModal(false)} className="w-10 h-10 rounded-xl bg-[#F4F3EF] flex items-center justify-center text-[#9B9BAD] hover:text-red-500 transition-all"><FiX size={18} /></button>
                </div>
                <form onSubmit={handleSubmit} className="p-10 space-y-6">
                  <div className="space-y-1.5 text-left">
                    <label className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-widest pl-1">Task Title *</label>
                    <div className="relative">
                      <FiType className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                      <input type="text" required value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} placeholder="Task summary..." className="w-full bg-[#F8F9FA] rounded-2xl py-3 pl-12 pr-4 text-sm font-bold outline-none" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5 text-left">
                      <label className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-widest pl-1">Assign To *</label>
                      <select required value={formData.assignedTo} onChange={e => setFormData({ ...formData, assignedTo: e.target.value })} className="w-full bg-[#F8F9FA] rounded-2xl py-3 px-4 text-sm font-bold outline-none cursor-pointer">
                        <option value="">Select Member</option>
                        {teamMembers.map(m => <option key={m.id || m._id} value={m.id || m._id}>{m.name}</option>)}
                      </select>
                    </div>
                    <div className="space-y-1.5 text-left">
                      <label className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-widest pl-1">Due Date</label>
                      <input type="date" value={formData.dueDate} onChange={e => setFormData({ ...formData, dueDate: e.target.value })} className="w-full bg-[#F8F9FA] rounded-2xl py-3 px-4 text-sm font-bold outline-none" />
                    </div>
                  </div>
                  <div className="space-y-1.5 text-left">
                    <label className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-widest pl-1">Description</label>
                    <textarea rows={4} value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} placeholder="Additional details..." className="w-full bg-[#F8F9FA] rounded-2xl p-4 text-sm font-medium outline-none resize-none" />
                  </div>
                  <div className="flex gap-4 pt-4">
                    <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-4 bg-gray-50 text-gray-500 rounded-2xl font-bold">Cancel</button>
                    <button type="submit" disabled={isSaving} className="flex-[2] py-4 bg-[#1B4DA0] text-white rounded-2xl font-bold shadow-lg shadow-blue-500/20">{isSaving ? <FiLoader className="animate-spin inline mr-2" /> : null} Assign Task</button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>,
        document.body
      )}

      {createPortal(
        <AnimatePresence>
          {showDrawer && (
            <>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => { setShowDrawer(false); setViewingTask(null); }} className="fixed inset-0 bg-[#1A1A2E]/60 backdrop-blur-md z-[2000]" />
              <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: "spring", damping: 30, stiffness: 300 }} className="fixed inset-y-0 right-0 w-full sm:w-[650px] bg-white shadow-2xl z-[2001] border-l border-[#F4F3EF] flex flex-col overflow-hidden">
                <TaskDetailView task={viewingTask} onBack={() => { setShowDrawer(false); setViewingTask(null); }} showToast={(msg) => toast.success(msg)} onUpdateTask={(upd) => { setTasks(prev => prev.map(t => (t.id === upd.id || t._id === upd.id) ? { ...t, ...upd } : t)); setViewingTask(prev => ({ ...prev, ...upd })); }} teamMembers={teamMembers} />
              </motion.div>
            </>
          )}
        </AnimatePresence>,
        document.body
      )}

      {createPortal(
        <AnimatePresence>
          {confirmDelete && (
            <div className="fixed inset-0 z-[3000] flex items-center justify-center p-4">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/40 backdrop-blur-md" onClick={() => setConfirmDelete(null)} />
              <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} className="relative bg-white rounded-3xl shadow-2xl w-full max-w-sm p-10 text-center">
                <div className="w-16 h-16 rounded-full bg-rose-50 flex items-center justify-center mx-auto mb-6"><FiTrash2 size={28} className="text-rose-500" /></div>
                <h3 className="text-xl font-bold text-[#1A1A2E] mb-2 font-syne">Delete Task?</h3>
                <p className="text-sm text-[#9B9BAD] mb-8">This action is permanent and cannot be undone.</p>
                <div className="flex gap-4">
                  <button onClick={() => setConfirmDelete(null)} className="flex-1 py-4 font-bold bg-[#F4F3EF] rounded-2xl">Cancel</button>
                  <button onClick={() => handleDelete(confirmDelete)} className="flex-1 py-4 font-bold text-white bg-red-600 rounded-2xl shadow-lg shadow-red-600/20">Delete</button>
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

export default OperationsTaskAssignmentTab;
