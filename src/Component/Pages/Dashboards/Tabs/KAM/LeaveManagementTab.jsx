import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { FiCalendar, FiClock, FiCheck, FiX, FiPlus, FiDownload, FiSun, FiMoon, FiCoffee, FiAward, FiTrendingUp, FiArrowLeft, FiSend, FiFileText } from 'react-icons/fi';
import { Search, ChevronDown, Download, Plus, X, ChevronRight, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getDeptLeaveRequests, applyLeave, approveRejectLeave } from '../../../service/api';
import { toast } from 'react-hot-toast';

const ApplyLeaveView = ({ onBack, onSubmit, isDarkMode }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    leaveType: 'Sick Leave',
    leaveMode: 'Full Day',
    startDate: '',
    endDate: '',
    reason: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.startDate || !formData.endDate || !formData.reason) {
      toast.error('Please fill all required fields');
      return;
    }
    setLoading(true);
    try {
      const response = await applyLeave({
        ...formData,
        startDate: formData.startDate,
        endDate: formData.endDate
      });
      if (response.success) {
        toast.success('Leave application submitted successfully');
        onSubmit();
      }
    } catch (error) {
      toast.error(error.message || 'Failed to submit application');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0, y: 20 }}
      animate={{ scale: 1, opacity: 1, y: 0 }}
      exit={{ scale: 0.9, opacity: 0, y: 20 }}
      className="w-full max-w-4xl bg-white rounded-[40px] shadow-2xl overflow-hidden flex flex-col max-h-[90vh] relative"
      style={{ fontFamily: "'Calibri', sans-serif" }}
    >
      <div className="sticky top-0 bg-white border-b border-[#F4F3EF] px-10 py-8 flex items-center justify-between z-20">
        <div className="flex flex-col gap-1 text-left">
          <h2 className="text-3xl font-bold text-[#1A1A2E]" style={{ fontFamily: "'Syne', sans-serif" }}>
            New Application
          </h2>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-black text-[#0D47A1] uppercase tracking-[3px]">Internal Request</span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#F4F3EF]" />
            <span className="text-[11px] font-black text-[#9B9BAD] uppercase tracking-[3px]">Apply for Leave</span>
          </div>
        </div>
        <button onClick={onBack} className="w-12 h-12 rounded-2xl bg-[#F4F3EF] text-[#6B6B7E] flex items-center justify-center hover:bg-red-50 hover:text-red-500 transition-all shadow-sm">
          <X size={20} />
        </button>
      </div>

      <div className="flex-1 p-10 overflow-y-auto custom-scrollbar">
        <div className="space-y-10">
          <form className="space-y-10" onSubmit={handleSubmit}>
            <div className="grid grid-cols-2 gap-x-12 gap-y-10">
              <div className="space-y-3">
                <label className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-[2px] block ml-1 text-left">Leave Category</label>
                <div className="relative">
                  <select 
                    value={formData.leaveType}
                    onChange={(e) => setFormData({ ...formData, leaveType: e.target.value })}
                    className="w-full h-14 rounded-2xl bg-[#F4F3EF] border-transparent px-6 text-[15px] font-bold text-[#1A1A2E] outline-none appearance-none focus:ring-2 focus:ring-[#0D47A1]/10"
                  >
                    <option>Sick Leave</option>
                    <option>Casual Leave</option>
                    <option>Earned Leave</option>
                    <option>Compensatory Off</option>
                    <option>Maternity Leave</option>
                    <option>Work From Home</option>
                  </select>
                  <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 text-[#0D47A1] pointer-events-none opacity-50" size={18} />
                </div>
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-[2px] block ml-1 text-left">Application Mode</label>
                <div className="flex gap-2 p-1 bg-[#F4F3EF] rounded-2xl">
                  {['Full Day', 'Half Day'].map((mode) => (
                    <button
                      key={mode}
                      type="button"
                      onClick={() => setFormData({ ...formData, leaveMode: mode })}
                      className={`flex-1 h-12 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${formData.leaveMode === mode ? 'bg-white text-[#0D47A1] shadow-sm' : 'text-[#9B9BAD] hover:text-[#6B6B7E]'}`}
                    >
                      {mode}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-[2px] block ml-1 text-left">Commencement Date</label>
                <input 
                  type="date" 
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  className="w-full h-14 rounded-2xl bg-[#F4F3EF] border-transparent px-6 text-[15px] font-bold text-[#1A1A2E] outline-none" 
                />
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-[2px] block ml-1 text-left">Conclusion Date</label>
                <input 
                  type="date" 
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  className="w-full h-14 rounded-2xl bg-[#F4F3EF] border-transparent px-6 text-[15px] font-bold text-[#1A1A2E] outline-none" 
                />
              </div>
              <div className="col-span-2 space-y-3">
                <label className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-[2px] block ml-1 text-left">Official Justification</label>
                <textarea 
                  rows={4}
                  value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  placeholder="Provide a detailed reason for this request..."
                  className="w-full rounded-2xl bg-[#F4F3EF] border-transparent p-6 text-[15px] font-medium text-[#1A1A2E] outline-none focus:ring-2 focus:ring-[#0D47A1]/10 resize-none italic placeholder:text-[#9B9BAD]"
                />
              </div>
            </div>
            <div className="flex gap-4 pt-4">
              <button type="button" onClick={onBack} className="flex-1 py-5 rounded-[24px] bg-white border-2 border-[#F4F3EF] text-[#6B6B7E] text-sm font-bold hover:bg-[#F4F3EF] transition-all">Discard</button>
              <button type="submit" disabled={loading} className="flex-[1.5] py-5 rounded-[24px] bg-[#0D47A1] text-white text-sm font-bold shadow-xl shadow-blue-500/20 hover:bg-[#0a3a82] transition-all disabled:opacity-50">
                {loading ? 'Submitting...' : 'Submit Application'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </motion.div>
  );
};

const EmployeeDetailsView = ({ employee, onBack, isDarkMode, getStatusConfig, onStatusChange }) => {
  const [actionLoading, setActionLoading] = useState(false);
  const [comment, setComment] = useState('');

  if (!employee) return null;
  const statusConfig = getStatusConfig(employee.status);

  const handleAction = async (status) => {
    setActionLoading(true);
    try {
      await onStatusChange(employee.id, status, comment);
      onBack();
    } catch (error) {
      // toast handled in parent
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ x: '100%', opacity: 0.5 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: '100%', opacity: 0.5 }}
      transition={{ type: "spring", damping: 30, stiffness: 300 }}
      className="flex flex-col h-full bg-white relative overflow-hidden"
      style={{ fontFamily: "'Calibri', sans-serif" }}
    >
      <div className="sticky top-0 bg-white/90 backdrop-blur-md border-b border-[#F4F3EF] px-10 py-8 flex items-center justify-between z-20">
        <div className="flex flex-col gap-1 text-left">
          <h2 className="text-3xl font-bold text-[#1A1A2E]" style={{ fontFamily: "'Syne', sans-serif" }}>{employee.memberName || employee.name}</h2>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-black text-[#0D47A1] uppercase tracking-[3px]">{employee.memberId || employee.empId}</span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#F4F3EF]" />
            <span className="text-[11px] font-black text-[#9B9BAD] uppercase tracking-[3px]">Leave Application Detail</span>
          </div>
        </div>
        <button onClick={onBack} className="w-11 h-11 rounded-xl bg-[#F4F3EF] text-[#6B6B7E] flex items-center justify-center hover:bg-red-50 hover:text-red-500 transition-all">
          <X size={24} />
        </button>
      </div>
      <div className="flex-1 p-10 bg-[#FAFAF8] overflow-y-auto">
        <div className="bg-white rounded-[32px] border border-[#F4F3EF] shadow-sm overflow-hidden mb-10">
          <div className="p-10">
            <div className="grid grid-cols-2 gap-x-16 gap-y-10">
              <div className="space-y-2 text-left">
                <span className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-[2.5px] block">Leave Type</span>
                <p className="text-[15px] font-bold text-[#1A1A2E] tracking-tight">{employee.leaveType || employee.type}</p>
              </div>
              <div className="space-y-2 text-left">
                <span className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-[2.5px] block">Duration</span>
                <p className="text-[15px] font-bold text-[#1A1A2E] tracking-tight">{employee.days || 1} Day(s)</p>
              </div>
              <div className="space-y-2 text-left">
                <span className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-[2.5px] block">From Date</span>
                <p className="text-[15px] font-bold text-[#1A1A2E] tracking-tight">
                  {employee.startDate ? new Date(employee.startDate).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' }) : 'N/A'}
                </p>
              </div>
              <div className="space-y-2 text-left">
                <span className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-[2.5px] block">To Date</span>
                <p className="text-[15px] font-bold text-[#1A1A2E] tracking-tight">
                  {employee.endDate ? new Date(employee.endDate).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' }) : 'N/A'}
                </p>
              </div>
              <div className="space-y-2 text-left col-span-2 pt-6 border-t border-[#F4F3EF]">
                <span className="text-[11px] font-black text-[#9B9BAD] uppercase tracking-[3px] block mb-4">Reason for Leave</span>
                <div className="p-6 bg-[#FAFAF8] rounded-2xl border border-[#F4F3EF]">
                  <p className="text-[15px] font-medium text-[#6B6B7E] leading-relaxed italic">"{employee.reason}"</p>
                </div>
              </div>
              <div className="space-y-2 text-left col-span-2 pt-6 border-t border-[#F4F3EF]">
                <span className="text-[11px] font-black text-[#9B9BAD] uppercase tracking-[3px] block mb-4">Current Status</span>
                <div className="pt-2">
                  <span className={`${statusConfig.bg} ${statusConfig.text} px-6 py-2.5 rounded-full text-[11px] font-black uppercase tracking-widest border border-current/10`}>
                    <span className={`inline-block w-2.5 h-2.5 rounded-full mr-2 ${statusConfig.dot}`}></span>
                    {statusConfig.label}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {employee.status?.toLowerCase() === 'pending' && (
          <div className="bg-white rounded-[32px] border border-[#F4F3EF] p-10 mb-10">
            <label className="text-[11px] font-black text-[#9B9BAD] uppercase tracking-[3px] block mb-4 text-left">Approver Comments</label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Add your comments here (optional)..."
              className="w-full h-32 p-6 bg-[#FAFAF8] border border-[#F4F3EF] rounded-2xl text-[15px] outline-none focus:ring-2 focus:ring-[#0D47A1]/10 resize-none mb-8"
            />
            <div className="flex gap-4">
              <button 
                onClick={() => handleAction('Approved')}
                disabled={actionLoading}
                className="flex-1 py-5 rounded-[24px] bg-emerald-500 text-white text-sm font-bold shadow-lg shadow-emerald-500/20 hover:bg-emerald-600 transition-all disabled:opacity-50"
              >
                {actionLoading ? 'Processing...' : 'Approve Leave'}
              </button>
              <button 
                onClick={() => handleAction('Rejected')}
                disabled={actionLoading}
                className="flex-1 py-5 rounded-[24px] bg-rose-500 text-white text-sm font-bold shadow-lg shadow-rose-500/20 hover:bg-rose-600 transition-all disabled:opacity-50"
              >
                {actionLoading ? 'Processing...' : 'Reject Leave'}
              </button>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

const LeaveManagementTab = ({ isDarkMode, selectedClient }) => {
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('list');
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const fetchLeaveRequests = async () => {
    setLoading(true);
    try {
      const response = await getDeptLeaveRequests();
      if (response.success) {
        setLeaveRequests(Array.isArray(response.leaves) ? response.leaves : []);
      }
    } catch (error) {
      toast.error('Failed to load leave requests');
      setLeaveRequests([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaveRequests();
  }, [selectedClient]);

  const handleStatusChange = async (id, status, comment) => {
    try {
      const response = await approveRejectLeave(id, { status, approverComment: comment });
      if (response.success) {
        toast.success(`Leave request ${status.toLowerCase()} successfully`);
        fetchLeaveRequests();
      }
    } catch (error) {
      toast.error(error.message || 'Failed to update leave status');
      throw error;
    }
  };

  const getStatusConfig = (status = '') => {
    const s = status.toLowerCase();
    const config = {
      approved: { bg: 'bg-emerald-50 text-emerald-600', dot: 'bg-emerald-500', label: 'Approved' },
      pending: { bg: 'bg-amber-50 text-amber-600', dot: 'bg-amber-500', label: 'Pending' },
      rejected: { bg: 'bg-rose-50 text-rose-600', dot: 'bg-rose-500', label: 'Rejected' }
    };
    return config[s] || config.pending;
  };

  const filteredRequests = (leaveRequests || []).filter(req => {
    const memberName = req.memberName || req.name || '';
    const memberId = req.memberId || req.empId || '';
    const matchesSearch = memberName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         memberId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || req.status?.toLowerCase() === filterStatus.toLowerCase();
    return matchesSearch && matchesFilter;
  });

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div className="space-y-2">
            <div className={`h-8 w-64 rounded-lg animate-pulse ${isDarkMode ? 'bg-slate-700' : 'bg-slate-200'}`}></div>
            <div className={`h-4 w-40 rounded-lg animate-pulse ${isDarkMode ? 'bg-slate-700' : 'bg-slate-200'}`}></div>
          </div>
        </div>
        <div className={`h-96 rounded-2xl animate-pulse ${isDarkMode ? 'bg-slate-800' : 'bg-slate-200'}`}></div>
      </div>
    );
  }

  return (
    <div className={`w-full min-h-screen ${isDarkMode ? 'bg-slate-900 text-white' : 'bg-[#fcfdff] text-slate-800'}`} style={{ fontFamily: "'Calibri', sans-serif" }}>
      <AnimatePresence mode="wait">
        <motion.div key="dashboard-view" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="space-y-8">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-12 text-left">
            <div>
              <h1 className="text-3xl font-bold text-[#1A1A2E] tracking-tight" style={{ fontFamily: "'Syne', sans-serif" }}>Leave Management</h1>
              <p className="text-sm font-medium text-[#9B9BAD] mt-1">Internal Operations • Manage employee leave requests</p>
            </div>
            <div className="flex items-center gap-3">
              <button onClick={() => setView('apply')} className="flex items-center gap-2 px-6 py-3 rounded-xl bg-[#0D47A1] text-white text-sm font-bold shadow-lg shadow-blue-500/20 hover:bg-[#0a3a82] transition-all active:scale-95">
                <Plus size={18} /> Apply New Leave
              </button>
            </div>
          </motion.div>
          
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className={`rounded-[24px] p-2 border flex items-center gap-3 flex-wrap mb-6 ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-[#F4F3EF] shadow-sm'}`}>
            <div className="relative flex-1 group min-w-[200px]">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-[#9B9BAD] transition-colors" size={18} />
              <input
                type="text"
                placeholder="Search leave requests by name or ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full border-none rounded-2xl py-3 pl-14 pr-5 text-sm font-medium outline-none transition-all placeholder:text-[#9B9BAD] ${isDarkMode ? 'bg-slate-800 text-white focus:ring-2 focus:ring-slate-700' : 'bg-[#F4F3EF] text-[#1A1A2E] focus:ring-2 focus:ring-[#F4F3EF]'}`}
              />
            </div>
            <div className="relative">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className={`text-xs font-bold uppercase tracking-wider rounded-xl pl-4 pr-10 py-2.5 outline-none border-0 cursor-pointer appearance-none min-w-[200px] ${isDarkMode ? 'bg-slate-800 text-white' : 'bg-[#F4F3EF] text-[#1A1A2E]'}`}
              >
                <option value="all">All Request Status</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9B9BAD] pointer-events-none" size={14} />
            </div>
          </motion.div>

          <div className={`rounded-[32px] border overflow-hidden transition-all ${isDarkMode ? 'bg-slate-900/40 border-slate-800' : 'bg-white border-[#F4F3EF] shadow-sm'}`}>
            <div className={`grid grid-cols-[1.2fr_180px_180px_100px_220px_180px_40px] gap-4 px-10 py-4 border-b ${isDarkMode ? 'border-slate-800 bg-slate-800/20' : 'border-[#F4F3EF] bg-[#F8FAFF]/50'}`}>
              {["Employee", "Leave Type", "Duration", "Days", "Reason", "Status", ""].map((h, i) => (
                <div key={i} className="text-[11px] font-black text-[#9B9BAD] uppercase tracking-[2px] text-left">{h}</div>
              ))}
            </div>
            <div className="flex flex-col">
              <AnimatePresence mode="popLayout">
                {filteredRequests.length === 0 ? (
                  <div className="py-24 text-center">
                    <p className="text-[#9B9BAD] text-sm font-bold uppercase tracking-widest">No matching requests found</p>
                  </div>
                ) : (
                  filteredRequests.map((req, index) => {
                    const statusConfig = getStatusConfig(req.status);
                    return (
                      <motion.div
                        key={req.id}
                        layout
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ delay: index * 0.05 }}
                        onClick={() => { setSelectedEmployee(req); setView('details'); }}
                        className={`grid grid-cols-[1.2fr_180px_180px_100px_220px_180px_40px] gap-4 items-center px-10 py-6 border-b last:border-0 cursor-pointer transition-all group relative ${isDarkMode ? 'border-slate-800 hover:bg-slate-800/40' : 'border-[#F4F3EF] hover:bg-[#F8FAFF]'}`}
                      >
                        <div className="flex items-center gap-4 min-w-0">
                          <div className="w-[42px] h-[42px] rounded-[14px] flex items-center justify-center font-bold shadow-sm transition-transform group-hover:scale-110 bg-[#F0F7FF] text-[#1B4DA0] text-[13px]">
                            {(req.memberName || req.name || '??').charAt(0).toUpperCase()}
                          </div>
                          <div className="flex flex-col min-w-0 text-left">
                            <p className={`text-[15px] font-bold truncate transition-colors ${isDarkMode ? 'text-white group-hover:text-[#0D47A1]' : 'text-[#1A1A2E] group-hover:text-[#0D47A1]'}`}>
                              {req.memberName || req.name}
                            </p>
                            <p className="text-[10px] font-bold text-[#9B9BAD] uppercase tracking-wider mt-0.5">{req.memberId || req.empId}</p>
                          </div>
                        </div>
                        <div className="flex justify-start">
                          <div className="text-[13px] font-bold text-[#6B6B7E] bg-[#FAFAF8] px-3 py-1.5 rounded-lg border border-[#F4F3EF]">
                            {req.leaveType || req.type}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 text-[13px] font-bold text-[#6B6B7E] text-left">
                          <FiCalendar className="w-4 h-4 text-[#9B9BAD]" />
                          <span className="truncate">
                            {req.startDate ? new Date(req.startDate).toLocaleDateString('en-US', { day: 'numeric', month: 'short' }) : 'N/A'} - 
                            {req.endDate ? new Date(req.endDate).toLocaleDateString('en-US', { day: 'numeric', month: 'short' }) : 'N/A'}
                          </span>
                        </div>
                        <div className="flex justify-start">
                           <div className="w-9 h-9 rounded-xl bg-[#F4F3EF] flex items-center justify-center text-[13px] font-black text-[#0D47A1]">{req.days || 1}</div>
                        </div>
                        <div className="text-[13px] font-medium text-[#9B9BAD] truncate italic max-w-[200px] text-left">"{req.reason}"</div>
                        <div className="flex items-center">
                          <span className={`inline-flex items-center justify-center px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest w-fit border shadow-sm ${statusConfig.bg} ${isDarkMode ? 'border-transparent' : 'border-current/10'}`}>
                            <span className={`w-1.5 h-1.5 rounded-full mr-2 ${statusConfig.dot}`}></span>{statusConfig.label}
                          </span>
                        </div>
                        <div className="flex justify-end pr-2">
                          <ChevronRight size={20} className={`transition-all ${isDarkMode ? 'text-slate-700' : 'text-[#C5C5D2] group-hover:text-[#0D47A1]'}`} />
                        </div>
                      </motion.div>
                    );
                  })
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {typeof document !== 'undefined' && createPortal(
        <AnimatePresence>
          {view === 'apply' && (
            <>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setView('list')} className="fixed inset-0 bg-black/60 backdrop-blur-md z-[100]" />
              <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 sm:p-6 md:p-10 pointer-events-none">
                <div className="w-full max-w-4xl pointer-events-auto">
                  <ApplyLeaveView onBack={() => setView('list')} onSubmit={() => setView('list')} isDarkMode={isDarkMode} />
                </div>
              </div>
            </>
          )}

          {view === 'details' && selectedEmployee && (
            <>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setView('list')} className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[100]" />
              <motion.div className="fixed inset-y-0 right-0 w-full sm:w-[600px] md:w-[750px] shadow-2xl z-[110] border-l bg-white border-[#F4F3EF] overflow-hidden">
                <EmployeeDetailsView 
                  employee={selectedEmployee} 
                  onBack={() => setView('list')} 
                  isDarkMode={isDarkMode} 
                  getStatusConfig={getStatusConfig} 
                  onStatusChange={handleStatusChange} 
                />
              </motion.div>
            </>
          )}
        </AnimatePresence>,
        document.body
      )}
    </div>
  );
};

export default LeaveManagementTab;