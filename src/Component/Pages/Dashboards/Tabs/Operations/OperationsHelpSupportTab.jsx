import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiPlus,
  FiAlertCircle,
  FiCheckCircle,
  FiClock,
  FiSearch,
  FiMessageSquare,
  FiX,
  FiCheck,
  FiChevronDown,
  FiChevronRight,
  FiTrash2,
  FiEye,
  FiBriefcase,
  FiCalendar,
  FiUser
} from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import {
  getProblems,
  createProblem,
  updateProblemStatus,
  deleteProblem,
  bulkResolveProblems,
  bulkDeleteProblems
} from '../../../service/api';

const PriorityBadge = ({ priority }) => {
  const config = {
    High: { bg: 'bg-rose-100 text-rose-700 border-rose-200', dot: 'bg-rose-500' },
    Medium: { bg: 'bg-amber-100 text-amber-700 border-amber-200', dot: 'bg-amber-500' },
    Low: { bg: 'bg-emerald-100 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500' },
  };
  const c = config[priority] || config.Medium;
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${c.bg} border`}>
      <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
      {priority}
    </span>
  );
};

const StatusBadge = ({ status }) => {
  const config = {
    Pending: { bg: 'bg-amber-50 text-amber-600 border-amber-200', dot: 'bg-amber-500' },
    Resolved: { bg: 'bg-emerald-50 text-emerald-600 border-emerald-200', dot: 'bg-emerald-500' },
  };
  const c = config[status] || config.Pending;
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${c.bg} border`}>
      {status === 'Resolved' ? (
        <FiCheckCircle size={12} className="text-emerald-600" />
      ) : (
        <span className="relative flex h-1.5 w-1.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-amber-500"></span>
        </span>
      )}
      {status}
    </span>
  );
};

const OperationsHelpSupportTab = ({ userRole = '', userName = 'Current User', notificationBell }) => {
  const [problems, setProblems] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [activeTab, setActiveTab] = useState('My Problems'); // 'My Problems', 'Team Problems'

  const [searchQuery, setSearchQuery] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('ALL PRIORITIES');
  const [statusFilter, setStatusFilter] = useState('ALL STATUS');

  const [showPriorityDropdown, setShowPriorityDropdown] = useState(false);
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);

  const [selectedIds, setSelectedIds] = useState([]);
  const [selectedProblemForDetail, setSelectedProblemForDetail] = useState(null);

  const priorityRef = useRef(null);
  const statusRef = useRef(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'Medium',
    category: 'Other'
  });

  const actualRole = userRole || (typeof window !== 'undefined' ? (localStorage.getItem('userRole') || localStorage.getItem('userType')) : '') || 'hroperations';
  const actualUser = (userName && userName !== 'Current User') ? userName : (typeof window !== 'undefined' ? localStorage.getItem('userName') : 'Current User');

  // Role normalization
  const normalizedRole = actualRole.toLowerCase();
  const isSuperAdmin = normalizedRole.includes('super') || normalizedRole.includes('admin');
  const isCRM = normalizedRole.includes('crm');
  const isRecruitmentHead = normalizedRole.includes('recruitment head') || normalizedRole.includes('head');
  const isHROperations = normalizedRole.includes('operation') || normalizedRole.includes('hr');
  const showTeamTabs = isRecruitmentHead || isHROperations || isSuperAdmin;

  // Can resolve team problems if Head, CRM, Admin or Operations
  const canResolveTeam = isSuperAdmin || isCRM || isRecruitmentHead || isHROperations;

  // Handle outside clicks for dropdowns
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (priorityRef.current && !priorityRef.current.contains(e.target)) {
        setShowPriorityDropdown(false);
      }
      if (statusRef.current && !statusRef.current.contains(e.target)) {
        setShowStatusDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const [loading, setLoading] = useState(true);

  const fetchProblems = async () => {
    try {
      setLoading(true);
      const res = await getProblems();
      if (res?.data?.data && Array.isArray(res.data.data)) {
        setProblems(res.data.data);
      } else if (res?.data && Array.isArray(res.data)) {
        setProblems(res.data);
      } else {
        setProblems([]);
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to load problems');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProblems();
  }, []);

  const handleSubmitProblem = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.description) {
      toast.error('Please fill all required fields');
      return;
    }

    try {
      const newProblem = {
        title: formData.title,
        description: formData.description,
        priority: formData.priority,
        category: formData.category,
        raisedBy: actualUser,
        raisedByRole: actualRole || 'Employee'
      };

      await createProblem(newProblem);
      setFormData({ title: '', description: '', priority: 'Medium', category: 'Other' });
      setShowAddModal(false);
      toast.success('Problem submitted successfully');
      fetchProblems();
    } catch (err) {
      console.error(err);
      toast.error(err.message || 'Failed to submit problem');
    }
  };

  const handleResolve = async (problemId) => {
    try {
      await updateProblemStatus(problemId, { status: 'Resolved', resolvedBy: actualUser });
      if (selectedProblemForDetail && selectedProblemForDetail.id === problemId) {
        setSelectedProblemForDetail(prev => ({
          ...prev,
          status: 'Resolved',
          resolvedBy: actualUser,
          resolvedAt: new Date().toISOString()
        }));
      }
      toast.success('Problem marked as resolved');
      fetchProblems();
    } catch (err) {
      console.error(err);
      toast.error(err.message || 'Failed to resolve problem');
    }
  };

  const handleDelete = async (problemId) => {
    try {
      await deleteProblem(problemId);
      setSelectedIds(prev => prev.filter(id => id !== problemId));
      if (selectedProblemForDetail && selectedProblemForDetail.id === problemId) {
        setSelectedProblemForDetail(null);
      }
      toast.success('Problem deleted');
      fetchProblems();
    } catch (err) {
      console.error(err);
      toast.error(err.message || 'Failed to delete problem');
    }
  };

  const handleBulkResolve = async () => {
    if (selectedIds.length === 0) return;
    try {
      await bulkResolveProblems({ ids: selectedIds, resolvedBy: actualUser });
      setSelectedIds([]);
      toast.success('Selected problems marked as resolved');
      fetchProblems();
    } catch (err) {
      console.error(err);
      toast.error(err.message || 'Failed to bulk resolve');
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    try {
      await bulkDeleteProblems({ ids: selectedIds });
      setSelectedIds([]);
      toast.success('Selected problems deleted');
      fetchProblems();
    } catch (err) {
      console.error(err);
      toast.error(err.message || 'Failed to bulk delete');
    }
  };

  // Filter logic
  const filteredProblems = problems.filter(p => {
    // Search match
    const searchMatch = p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.raisedBy.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.id.toLowerCase().includes(searchQuery.toLowerCase());
    if (!searchMatch) return false;

    // Priority filter
    if (priorityFilter !== 'ALL PRIORITIES') {
      if (p.priority.toUpperCase() !== priorityFilter) return false;
    }

    // Status filter
    if (statusFilter !== 'ALL STATUS') {
      if (p.status.toUpperCase() !== statusFilter) return false;
    }

    // Tab filtering
    if (activeTab === 'My Problems') {
      return p.raisedBy === actualUser;
    } else {
      // Team Problems tab logic
      if (isSuperAdmin || isCRM) {
        // CRM and Admin see problems raised by Recruitment Heads (or everyone except themselves)
        return p.raisedByRole.toLowerCase().includes('head') || p.raisedBy !== actualUser;
      } else if (showTeamTabs) {
        // Operations / Recruitment Head sees problems raised by their team
        return !p.raisedByRole.toLowerCase().includes('admin') && p.raisedBy !== actualUser;
      }
      return false;
    }
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-500 font-jakarta text-left">

      {/* Header */}
      <div className="flex items-center justify-between gap-4 mb-2">
        <div className="flex flex-col gap-1">
          <h2 className="text-2xl font-bold leading-tight text-[#1A1A2E] font-syne">
            Help & Support</h2>
        </div>
        
        {showTeamTabs && (
          <div className="flex bg-[#F4F3EF] p-1 rounded-xl">
            {['My Problems', 'Team Problems'].map(tab => (
               <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-6 py-2.5 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${
                    activeTab === tab
                      ? 'bg-white text-[#1B4DA0] shadow-sm'
                      : 'text-[#9B9BAD] hover:text-[#1A1A2E]'
                  }`}
               >
                  {tab}
               </button>
            ))}
          </div>
        )}

        <div className="flex items-center gap-3">
          {!isSuperAdmin && (
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 px-6 py-3 bg-[#1B4DA0] text-white rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-[#153a7a] transition-all shadow-lg shadow-blue-500/20 active:scale-95"
            >
              <FiPlus size={16} />
              Raise Problem
            </button>
          )}
          {notificationBell}
        </div>
      </div>

      {/* Filter & Search Bar in a unified premium card container */}
      <div className="bg-white rounded-[24px] p-2 border border-[#F4F3EF] shadow-sm flex items-center gap-3 mb-8 flex-wrap">
        {/* Search Bar */}
        <div className="relative flex-1 group min-w-[200px]">
          <FiSearch className="absolute left-5 top-1/2 -translate-y-1/2 text-[#9B9BAD] transition-colors" size={18} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search problems by ID, title, or raised user..."
            className="w-full bg-[#F4F3EF] border-none rounded-2xl py-3 pl-14 pr-5 text-sm font-medium focus:ring-2 focus:ring-[#F4F3EF] outline-none transition-all placeholder:text-[#9B9BAD] text-[#1A1A2E]"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="absolute right-4 top-1/2 -translate-y-1/2">
              <FiX className="w-[14px] h-[14px] text-[#9B9BAD] hover:text-[#1A1A2E] transition-colors" />
            </button>
          )}
        </div>

        {/* Custom Filter Dropdowns */}
        <div className="flex items-center gap-3 relative">

          {/* Priority dropdown */}
          <div className="relative" ref={priorityRef}>
            <button
              onClick={() => {
                setShowPriorityDropdown(!showPriorityDropdown);
                setShowStatusDropdown(false);
              }}
              className="flex items-center gap-3 px-5 py-2.5 bg-[#F4F3EF] hover:bg-[#EEF2FB] text-[#1A1A2E] text-[11px] font-black uppercase tracking-widest rounded-xl transition-all cursor-pointer"
            >
              {priorityFilter}
              <FiChevronDown size={14} className="text-[#1B4DA0] opacity-50" />
            </button>

            <AnimatePresence>
              {showPriorityDropdown && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute right-0 mt-2 w-52 bg-white rounded-2xl shadow-xl border border-[#F4F3EF] overflow-hidden z-50 py-1.5"
                >
                  {['ALL PRIORITIES', 'HIGH', 'MEDIUM', 'LOW'].map(item => (
                    <button
                      key={item}
                      onClick={() => {
                        setPriorityFilter(item);
                        setShowPriorityDropdown(false);
                      }}
                      className={`w-full px-5 py-3 text-[11px] font-black text-left uppercase tracking-wider hover:bg-slate-50 transition-colors ${priorityFilter === item ? 'text-[#1B4DA0] bg-blue-50/50' : 'text-[#4B4B5E]'
                        }`}
                    >
                      {item}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Status dropdown */}
          <div className="relative" ref={statusRef}>
            <button
              onClick={() => {
                setShowStatusDropdown(!showStatusDropdown);
                setShowPriorityDropdown(false);
              }}
              className="flex items-center gap-3 px-5 py-2.5 bg-[#F4F3EF] hover:bg-[#EEF2FB] text-[#1A1A2E] text-[11px] font-black uppercase tracking-widest rounded-xl transition-all cursor-pointer"
            >
              {statusFilter}
              <FiChevronDown size={14} className="text-[#1B4DA0] opacity-50" />
            </button>

            <AnimatePresence>
              {showStatusDropdown && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute right-0 mt-2 w-52 bg-white rounded-2xl shadow-xl border border-[#F4F3EF] overflow-hidden z-50 py-1.5"
                >
                  {['ALL STATUS', 'PENDING', 'RESOLVED'].map(item => (
                    <button
                      key={item}
                      onClick={() => {
                        setStatusFilter(item);
                        setShowStatusDropdown(false);
                      }}
                      className={`w-full px-5 py-3 text-[11px] font-black text-left uppercase tracking-wider hover:bg-slate-50 transition-colors ${statusFilter === item ? 'text-[#1B4DA0] bg-blue-50/50' : 'text-[#4B4B5E]'
                        }`}
                    >
                      {item}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

        </div>
      </div>

      {/* Problems Directory Table */}
      <div className="bg-white rounded-[32px] border border-[#F4F3EF] overflow-hidden shadow-2xl shadow-gray-200/50">
        <div className="overflow-x-auto min-h-[300px]">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#F4F3EF]">
                <th className="px-8 py-4 w-12">
                  <input
                    type="checkbox"
                    checked={filteredProblems.length > 0 && selectedIds.length === filteredProblems.length}
                    onChange={() => {
                      if (selectedIds.length === filteredProblems.length) {
                        setSelectedIds([]);
                      } else {
                        setSelectedIds(filteredProblems.map(p => p.id));
                      }
                    }}
                    className="w-4 h-4 rounded-md border-[#E8E7E2] text-[#1B4DA0] cursor-pointer focus:ring-[#1B4DA0]"
                  />
                </th>
                <th className="px-8 py-4 text-[11px] font-black text-[#9B9BAD] uppercase tracking-[3px]">Subject & Details</th>
                <th className="px-8 py-4 text-[11px] font-black text-[#9B9BAD] uppercase tracking-[3px]">Raised By</th>
                <th className="px-8 py-4 text-[11px] font-black text-[#9B9BAD] uppercase tracking-[3px] w-48">Date Raised</th>
                <th className="px-8 py-4 text-[11px] font-black text-[#9B9BAD] uppercase tracking-[3px] w-36 text-center">Status</th>
                <th className="px-8 py-4 text-[11px] font-black text-[#9B9BAD] uppercase tracking-[3px] w-12 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr>
                  <td colSpan="6" className="py-24 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <div className="w-8 h-8 border-4 border-[#1B4DA0]/30 border-t-[#1B4DA0] rounded-full animate-spin mb-4" />
                      <p className="text-gray-500 font-bold">Loading problems...</p>
                    </div>
                  </td>
                </tr>
              ) : filteredProblems.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-24 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <div className="w-16 h-16 bg-[#F4F3EF] rounded-full flex items-center justify-center mb-4">
                        <FiMessageSquare className="w-8 h-8 text-[#C5C5D2]" />
                      </div>
                      <p className="text-gray-500 font-bold">No issues found matching your filters</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredProblems.map((problem) => (
                  <tr
                    key={problem.id}
                    onClick={() => setSelectedProblemForDetail(problem)}
                    className="group hover:bg-[#F9F9F8] transition-all border-b border-[#F4F3EF] last:border-0 cursor-pointer"
                  >
                    <td className="px-8 py-8" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(problem.id)}
                        onChange={() => {
                          setSelectedIds(prev =>
                            prev.includes(problem.id)
                              ? prev.filter(id => id !== problem.id)
                              : [...prev, problem.id]
                          );
                        }}
                        className="w-4 h-4 rounded-md border-[#E8E7E2] text-[#1B4DA0] focus:ring-[#1B4DA0] cursor-pointer"
                      />
                    </td>
                    <td className="px-8 py-8 max-w-[320px]">
                      <div className="flex flex-col items-start justify-center text-left">
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          <span className="text-[10px] font-black text-[#1B4DA0] bg-[#1B4DA0]/10 px-2.5 py-0.5 rounded-lg uppercase tracking-wider">
                            {problem.id}
                          </span>
                          <PriorityBadge priority={problem.priority} />
                          {problem.category === 'Tech' && (
                            <span className="text-[10px] font-black text-[#8B5CF6] bg-[#8B5CF6]/10 px-2.5 py-0.5 rounded-lg uppercase tracking-wider">
                              TECH
                            </span>
                          )}
                        </div>
                        <p className="text-base font-black text-[#1A1A2E] group-hover:text-[#1B4DA0] transition-colors tracking-tight truncate w-full">
                          {problem.title}
                        </p>
                        {/* Table me jyada content na aaye (truncated) */}
                        <p className="text-xs font-medium text-[#9B9BAD] truncate w-full mt-1">
                          {problem.description}
                        </p>
                      </div>
                    </td>
                    <td className="px-8 py-8 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-white to-[#F4F3EF] flex items-center justify-center text-[#1B4DA0] text-xs font-black shadow border border-[#F4F3EF] shrink-0">
                          {problem.raisedBy.charAt(0)}
                        </div>
                        <div className="flex flex-col text-left">
                          <p className="text-xs font-bold text-[#1A1A2E]">{problem.raisedBy}</p>
                          <span className="text-[9px] font-black text-[#9B9BAD] uppercase tracking-wider mt-0.5">{problem.raisedByRole}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-8 whitespace-nowrap">
                      <div className="flex flex-col text-left">
                        <span className="text-xs font-bold text-[#4B4B5E]">{new Date(problem.raisedAt).toLocaleDateString()}</span>
                        <span className="text-[9px] font-black text-[#9B9BAD] tracking-wider uppercase mt-0.5">
                          {new Date(problem.raisedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </td>
                    <td className="px-8 py-8 whitespace-nowrap text-center">
                      <StatusBadge status={problem.status} />
                    </td>
                    <td className="px-8 py-8 whitespace-nowrap text-right">
                      <button className="ml-auto w-9 h-9 rounded-full bg-slate-50 text-slate-400 flex items-center justify-center group-hover:bg-[#1A1A2E] group-hover:text-white transition-all shadow-sm">
                        <FiChevronRight size={18} className="transition-transform group-hover:translate-x-0.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Floating Action Bar (Bulk management) */}
      {createPortal(
        <AnimatePresence>
          {selectedIds.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 100, x: '-50%' }}
              animate={{ opacity: 1, y: 0, x: '-50%' }}
              exit={{ opacity: 0, y: 100, x: '-50%' }}
              className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[1500] flex items-center gap-6 px-10 py-5 bg-[#1A1A2E] rounded-[32px] shadow-2xl shadow-slate-900/40 min-w-[500px] border border-white/5"
            >
              <div className="flex items-center gap-4 pr-8 border-r border-white/10 shrink-0">
                <div className="w-12 h-12 rounded-2xl bg-[#0D47A1] flex items-center justify-center text-white font-black shadow-lg text-lg shrink-0">
                  {selectedIds.length}
                </div>
                <div className="text-left flex flex-col justify-center">
                  <p className="text-[14px] font-black text-white tracking-tight whitespace-nowrap">Problems Selected</p>
                  <button
                    onClick={() => setSelectedIds([])}
                    className="text-[10px] font-bold text-red-400 uppercase tracking-widest hover:text-red-300 transition-colors whitespace-nowrap text-left"
                  >
                    Deselect All
                  </button>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-6 flex-1 justify-center text-white">
                {activeTab === 'Team Problems' && (
                  <button
                    onClick={handleBulkResolve}
                    className="flex items-center gap-2 group px-4 py-2 rounded-2xl transition-all hover:bg-white/5 active:scale-95"
                  >
                    <FiCheckCircle size={16} className="text-emerald-400 group-hover:text-white" />
                    <span className="text-[11px] font-bold uppercase tracking-widest">Mark Resolved</span>
                  </button>
                )}

                <button
                  onClick={handleBulkDelete}
                  className="flex items-center gap-2 group px-4 py-2 rounded-2xl transition-all hover:bg-white/5 active:scale-95"
                >
                  <FiTrash2 size={16} className="text-red-400 group-hover:text-white" />
                  <span className="text-[11px] font-bold uppercase tracking-widest">Delete</span>
                </button>
              </div>

              <button
                onClick={() => setSelectedIds([])}
                className="p-3 rounded-xl bg-white/5 hover:bg-white/10 hover:text-white transition-all text-[#9B9BAD]"
              >
                <FiX size={20} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}

      {/* Detail Drawer Modal (Slides from right, blurred backdrop) */}
      {createPortal(
        <AnimatePresence>
          {selectedProblemForDetail && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-[#1A1A2E]/40 backdrop-blur-md z-[1100]"
                onClick={() => setSelectedProblemForDetail(null)}
              />
              <motion.div
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="fixed inset-y-0 right-0 w-[550px] bg-white shadow-2xl z-[1101] flex flex-col"
              >

                {/* Header */}
                <div className="sticky top-0 bg-white/90 backdrop-blur-md border-b border-[#F4F3EF] px-10 py-10 flex items-center justify-between z-20">
                  <div className="flex-1 mr-4 text-left">
                    <h2 className="text-2xl font-bold text-[#1A1A2E] font-syne truncate">
                      {selectedProblemForDetail.title}
                    </h2>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-[10px] font-black text-[#1B4DA0] bg-[#1B4DA0]/5 px-2.5 py-1 rounded-lg uppercase tracking-wider">
                        {selectedProblemForDetail.id}
                      </span>
                      <PriorityBadge priority={selectedProblemForDetail.priority} />
                      <StatusBadge status={selectedProblemForDetail.status} />
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <button
                      onClick={() => setSelectedProblemForDetail(null)}
                      className="w-12 h-12 rounded-xl bg-[#F4F3EF] text-[#6B6B7E] flex items-center justify-center hover:bg-red-50 hover:text-red-500 transition-all border border-[#E8E7E2] hover:border-red-100 shadow-sm"
                      title="Close Details"
                    >
                      <FiX size={22} />
                    </button>
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-8 custom-scrollbar space-y-8 text-left">

                  {/* Detailed Description */}
                  <div className="bg-[#FAFAF9] rounded-[32px] p-8 border border-[#F4F3EF] space-y-4">
                    <span className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-[3px] block">
                      Full Description & Details
                    </span>
                    <p className="text-base font-bold text-[#1A1A2E] leading-relaxed whitespace-pre-wrap">
                      {selectedProblemForDetail.description}
                    </p>
                  </div>

                  {/* Metadata Cards */}
                  <div className="space-y-6">
                    <div className="flex items-center justify-between px-2">
                      <span className="text-[11px] font-black text-[#9B9BAD] uppercase tracking-[3px]">Metadata & Context</span>
                      <div className="h-px bg-[#F4F3EF] flex-1 ml-6" />
                    </div>

                    <div className="grid grid-cols-2 gap-4 px-2">
                      <div className="space-y-2">
                        <span className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-[2px] block">Raised By</span>
                        <div className="flex items-center gap-3 p-4 bg-[#FAFAF9] rounded-2xl border border-[#F4F3EF]">
                          <FiUser className="text-[#1B4DA0]" size={16} />
                          <div className="flex flex-col text-left">
                            <span className="text-xs font-bold text-[#1A1A2E] truncate">{selectedProblemForDetail.raisedBy}</span>
                            <span className="text-[9px] font-black text-[#9B9BAD] uppercase tracking-wider mt-0.5">{selectedProblemForDetail.raisedByRole}</span>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <span className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-[2px] block">Raised Date</span>
                        <div className="flex items-center gap-3 p-4 bg-[#FAFAF9] rounded-2xl border border-[#F4F3EF]">
                          <FiCalendar className="text-[#1B4DA0]" size={16} />
                          <div className="flex flex-col text-left">
                            <span className="text-xs font-bold text-[#1A1A2E]">{new Date(selectedProblemForDetail.raisedAt).toLocaleDateString()}</span>
                            <span className="text-[9px] font-black text-[#9B9BAD] uppercase tracking-wider mt-0.5">
                              {new Date(selectedProblemForDetail.raisedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Resolution Details */}
                  {selectedProblemForDetail.status === 'Resolved' && (
                    <div className="space-y-6">
                      <div className="flex items-center justify-between px-2">
                        <span className="text-[11px] font-black text-[#9B9BAD] uppercase tracking-[3px] text-emerald-600">Resolution Status</span>
                        <div className="h-px bg-emerald-100 flex-1 ml-6" />
                      </div>

                      <div className="bg-emerald-50/40 rounded-[32px] p-6 border border-emerald-100/50 space-y-4">
                        <div className="flex items-start gap-4">
                          <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
                            <FiCheck size={20} className="stroke-[3]" />
                          </div>
                          <div className="flex-1 text-left space-y-3">
                            <div>
                              <h5 className="text-sm font-black text-[#1A1A2E]">Issue Resolved</h5>
                              <p className="text-xs text-slate-500 mt-1">This ticket has been marked as fully resolved in backend database store.</p>
                            </div>
                            <div className="grid grid-cols-2 gap-4 pt-1.5 border-t border-slate-100">
                              <div>
                                <span className="text-[8px] font-black text-[#9B9BAD] uppercase tracking-widest block">Resolved By</span>
                                <span className="text-xs font-bold text-slate-800">{selectedProblemForDetail.resolvedBy}</span>
                              </div>
                              <div>
                                <span className="text-[8px] font-black text-[#9B9BAD] uppercase tracking-widest block">Resolved Date</span>
                                <span className="text-xs font-bold text-slate-800">{new Date(selectedProblemForDetail.resolvedAt).toLocaleDateString()}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                </div>

                {/* Footer Actions */}
                <div className="p-8 border-t border-[#F4F3EF] bg-[#FBFBFF] flex gap-4">
                  {activeTab === 'Team Problems' && selectedProblemForDetail.status === 'Pending' && (
                    <button
                      onClick={() => handleResolve(selectedProblemForDetail.id)}
                      className="flex-1 py-4 bg-emerald-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-emerald-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/10 active:scale-95"
                    >
                      <FiCheckCircle size={16} />
                      Mark as Resolved
                    </button>
                  )}
                  {selectedProblemForDetail.raisedBy === actualUser && (
                    <button
                      onClick={() => handleDelete(selectedProblemForDetail.id)}
                      className="py-4 px-6 bg-red-50 hover:bg-red-100 text-red-600 rounded-2xl text-xs font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2"
                      title="Delete Problem"
                    >
                      <FiTrash2 size={16} />
                    </button>
                  )}
                  <button
                    onClick={() => setSelectedProblemForDetail(null)}
                    className="flex-1 py-4 bg-[#F4F3EF] text-[#6B6B7E] rounded-xl text-xs font-bold hover:bg-[#EEF2FB] transition-all"
                  >
                    Close
                  </button>
                </div>

              </motion.div>
            </>
          )}
        </AnimatePresence>,
        document.body
      )}

      {/* Add Modal */}
      {typeof document !== 'undefined' && createPortal(
        <AnimatePresence>
          {showAddModal && (
            <div className="fixed inset-0 z-[1200] flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-[#1A1A2E]/40 backdrop-blur-md"
                onClick={() => setShowAddModal(false)}
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="relative w-full max-w-lg bg-white rounded-[32px] shadow-2xl overflow-hidden text-left"
              >
                <div className="flex items-center justify-between p-6 border-b border-[#F4F3EF]">
                  <h2 className="text-xl font-bold text-[#1A1A2E] font-syne">Raise a Problem</h2>
                  <button
                    onClick={() => setShowAddModal(false)}
                    className="p-2 rounded-xl hover:bg-[#F4F3EF] text-[#9B9BAD] transition-colors"
                  >
                    <FiX size={20} />
                  </button>
                </div>

                <form onSubmit={handleSubmitProblem} className="p-6 space-y-5">
                  <div>
                    <label className="block text-[11px] font-black text-[#9B9BAD] uppercase tracking-widest mb-2">Problem Title</label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="Brief summary of the issue"
                      className="w-full px-4 py-3 bg-[#F4F3EF] border-none rounded-xl text-sm font-bold text-[#1A1A2E] focus:ring-2 focus:ring-[#0D47A1]/20 outline-none"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-black text-[#9B9BAD] uppercase tracking-widest mb-2">Priority</label>
                    <div className="flex gap-2 p-1 bg-[#F4F3EF] rounded-xl">
                      {['Low', 'Medium', 'High'].map(p => (
                        <button
                          key={p}
                          type="button"
                          onClick={() => setFormData({ ...formData, priority: p })}
                          className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${formData.priority === p ? 'bg-white text-[#1A1A2E] shadow-sm' : 'text-[#9B9BAD] hover:text-[#64748b]'
                            }`}
                        >
                          {p}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-black text-[#9B9BAD] uppercase tracking-widest mb-2">Category</label>
                    <div className="relative">
                      <select
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        className="w-full px-4 py-3 bg-[#F4F3EF] border-none rounded-xl text-sm font-bold text-[#1A1A2E] focus:ring-2 focus:ring-[#0D47A1]/20 outline-none appearance-none cursor-pointer"
                      >
                        <option value="Tech">Tech</option>
                        <option value="Other">Other</option>
                      </select>
                      <FiChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-[#9B9BAD]" size={16} />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-black text-[#9B9BAD] uppercase tracking-widest mb-2">Description</label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Detailed explanation of what went wrong..."
                      rows={4}
                      className="w-full px-4 py-3 bg-[#F4F3EF] border-none rounded-xl text-sm font-medium text-[#1A1A2E] focus:ring-2 focus:ring-[#0D47A1]/20 outline-none resize-none"
                      required
                    />
                  </div>

                  <div className="pt-4 border-t border-[#F4F3EF] flex justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => setShowAddModal(false)}
                      className="px-6 py-2.5 rounded-xl text-sm font-bold text-[#64748b] hover:bg-[#F4F3EF] transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-2.5 rounded-xl text-sm font-bold bg-[#1B4DA0] text-white hover:bg-[#153d80] shadow-lg shadow-blue-500/20 transition-all active:scale-95"
                    >
                      Submit Problem
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </div>
  );
};

export default OperationsHelpSupportTab;
