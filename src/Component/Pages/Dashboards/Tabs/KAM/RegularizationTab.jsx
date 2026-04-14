import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckCircle, XCircle, Clock, AlertCircle, 
  MapPin, User, Calendar, MessageSquare, 
  ChevronRight, Filter, Search, ArrowRight,
  Shield, Check, X, Info
} from 'lucide-react';
import { getDeptRegularizations, approveRegularization } from '../../../service/api';
import { toast } from 'react-hot-toast';

const RegularizationTab = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('Pending');
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [comment, setComment] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchRequests();
  }, [filterStatus]);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const response = await getDeptRegularizations({ status: filterStatus === 'All' ? undefined : filterStatus });
      if (response.success) {
        setRequests(response.requests);
      }
    } catch (error) {
      console.error('Error fetching regularizations:', error);
      toast.error('Failed to load requests');
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (id, status) => {
    if (!comment && status === 'Rejected') {
      toast.error('Please provide a reason for rejection');
      return;
    }
    
    setActionLoading(true);
    try {
      const response = await approveRegularization(id, { status, approverComment: comment });
      if (response.success) {
        toast.success(`Request ${status} successfully`);
        setSelectedRequest(null);
        setComment('');
        fetchRequests();
      }
    } catch (error) {
      toast.error('Action failed');
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case 'Approved': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
      case 'Rejected': return 'bg-rose-50 text-rose-600 border-rose-100';
      default: return 'bg-amber-50 text-amber-600 border-amber-100';
    }
  };

  const formatTime = (time) => {
    if (!time) return '--:--';
    return new Date(time).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
  };

  const stats = {
    total: requests.length,
    pending: requests.filter(r => r.status === 'Pending').length,
    approved: requests.filter(r => r.status === 'Approved').length,
  };

  return (
    <div className="flex flex-col gap-8 p-1 sm:p-2" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      {/* Premium Stats Header */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: 'Total Requests', value: stats.total, icon: MessageSquare, color: 'blue' },
          { label: 'Pending Approval', value: stats.pending, icon: Clock, color: 'amber' },
          { label: 'Recently Resolved', value: stats.approved, icon: CheckCircle, color: 'emerald' },
        ].map((stat, i) => (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            key={stat.label}
            className="bg-white rounded-[24px] p-6 border border-[#F4F3EF] shadow-sm hover:shadow-md transition-all group"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-2xl bg-${stat.color}-50 text-${stat.color}-600 group-hover:scale-110 transition-transform`}>
                <stat.icon size={24} />
              </div>
              <span className={`text-[10px] font-bold uppercase tracking-widest text-${stat.color}-500/60`}>Live Data</span>
            </div>
            <h3 className="text-3xl font-bold text-[#1A1A2E] mb-1">{stat.value}</h3>
            <p className="text-sm font-medium text-[#9B9BAD]">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-[24px] border border-[#F4F3EF]">
        <div className="flex items-center gap-2 bg-[#F8F9FA] p-1.5 rounded-2xl w-full sm:w-auto">
          {['Pending', 'Approved', 'Rejected', 'All'].map((s) => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={`px-6 py-2.5 rounded-xl text-xs font-bold transition-all ${
                filterStatus === s 
                ? 'bg-white text-[#1A1A2E] shadow-sm' 
                : 'text-[#9B9BAD] hover:text-[#1A1A2E]'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
        <div className="relative w-full sm:w-72 group">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9B9BAD] group-focus-within:text-[#0D47A1] transition-colors" />
          <input 
            type="text" 
            placeholder="Search by member name..."
            className="w-full pl-11 pr-4 py-3.5 bg-[#F8F9FA] border-none rounded-2xl text-sm font-medium placeholder:text-[#9B9BAD] focus:ring-2 focus:ring-[#0D47A1]/10 transition-all"
          />
        </div>
      </div>

      {/* Main Content Area */}
      <div className="bg-white rounded-[32px] border border-[#F4F3EF] shadow-sm overflow-hidden min-h-[400px]">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-[400px] gap-4">
            <div className="w-12 h-12 border-4 border-[#0D47A1]/10 border-t-[#0D47A1] rounded-full animate-spin" />
            <p className="text-sm font-bold text-[#1A1A2E] tracking-tight uppercase">Loading Requests...</p>
          </div>
        ) : requests.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-[400px] text-center p-8">
            <div className="w-20 h-20 bg-[#F8F9FA] rounded-[32px] flex items-center justify-center text-[#9B9BAD] mb-6">
              <Shield size={32} />
            </div>
            <h3 className="text-2xl font-bold text-[#1A1A2E] mb-2 leading-tight">All Clear!</h3>
            <p className="text-[#9B9BAD] max-w-xs text-sm leading-relaxed">
              No {filterStatus.toLowerCase()} requests found for your department at this time.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#F4F3EF]">
                  <th className="px-8 py-6 text-left text-[11px] font-black text-[#9B9BAD] uppercase tracking-[3px]">Member Info</th>
                  <th className="px-8 py-6 text-left text-[11px] font-black text-[#9B9BAD] uppercase tracking-[3px]">Request Details</th>
                  <th className="px-8 py-6 text-left text-[11px] font-black text-[#9B9BAD] uppercase tracking-[3px]">Proposed Timing</th>
                  <th className="px-8 py-6 text-left text-[11px] font-black text-[#9B9BAD] uppercase tracking-[3px]">Status</th>
                  <th className="px-8 py-6 text-right text-[11px] font-black text-[#9B9BAD] uppercase tracking-[3px]">Actions</th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence mode="popLayout">
                  {requests.map((request) => (
                    <motion.tr
                      layout
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      key={request.id}
                      className="group hover:bg-[#F8F9FA]/50 transition-all cursor-pointer border-b border-[#F4F3EF] last:border-none"
                      onClick={() => setSelectedRequest(request)}
                    >
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-4">
                          <div className="w-11 h-11 rounded-2xl bg-[#0D47A1] flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-[#0D47A1]/20">
                            {(request.memberName || '??').split(' ').map(n => n[0]).join('').slice(0, 2)}
                          </div>
                          <div>
                            <p className="text-[15px] font-bold text-[#1A1A2E] leading-none mb-1">{request.memberName || 'Unknown'}</p>
                            <p className="text-[11px] font-black text-[#9B9BAD] uppercase tracking-wider">{(request.memberId || '').slice(0, 8)}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex flex-col gap-1">
                          <span className="text-[13px] font-bold text-[#1A1A2E]">{request.requestType}</span>
                          <span className="text-[11px] font-bold text-[#9B9BAD] flex items-center gap-1.5">
                            <Calendar size={12} />
                            {new Date(request.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </span>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-3">
                          <div className="px-3 py-1.5 bg-[#F8F9FA] rounded-xl text-[12px] font-bold text-[#1A1A2E] border border-[#F4F3EF]">
                            {formatTime(request.proposedCheckIn)}
                          </div>
                          <ArrowRight size={14} className="text-[#9B9BAD]" />
                          <div className="px-3 py-1.5 bg-[#F8F9FA] rounded-xl text-[12px] font-bold text-[#1A1A2E] border border-[#F4F3EF]">
                            {formatTime(request.proposedCheckOut)}
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${getStatusStyle(request.status)}`}>
                          {request.status}
                        </span>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center justify-end gap-2">
                          <div className="w-9 h-9 rounded-xl bg-[#F8F9FA] text-[#1A1A2E] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all">
                            <ChevronRight size={18} />
                          </div>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Premium Detail Bottom Sheet / Modal */}
      <AnimatePresence>
        {selectedRequest && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedRequest(null)}
              className="absolute inset-0 bg-[#1A1A2E]/60 backdrop-blur-md"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="relative w-full max-w-2xl bg-white rounded-[40px] shadow-2xl overflow-hidden border border-[#F4F3EF]"
            >
              <div className="p-8 sm:p-12 overflow-y-auto max-h-[85vh]">
                <div className="flex items-start justify-between mb-10">
                  <div className="flex items-center gap-5">
                    <div className="w-16 h-16 rounded-[28px] bg-[#0D47A1] flex items-center justify-center text-2xl text-white font-bold shadow-xl shadow-[#0D47A1]/20">
                      {(selectedRequest.memberName || '??').split(' ').map(n => n[0]).join('').slice(0, 2)}
                    </div>
                    <div>
                      <h2 className="text-3xl font-bold text-[#1A1A2E] leading-tight mb-1">{selectedRequest.memberName || 'Member'}</h2>
                      <p className="text-sm font-black text-[#0D47A1] uppercase tracking-[3px]">Correction Request</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setSelectedRequest(null)}
                    className="w-12 h-12 rounded-2xl bg-[#F8F9FA] text-[#9B9BAD] hover:text-rose-500 hover:bg-rose-50 transition-all flex items-center justify-center"
                  >
                    <X size={24} />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-x-12 gap-y-10 mb-12">
                  <div className="space-y-2">
                    <span className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-[3px] block">Request Type</span>
                    <p className="text-lg font-bold text-[#1A1A2E]">{selectedRequest.requestType}</p>
                  </div>
                  <div className="space-y-2">
                    <span className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-[3px] block">Work Date</span>
                    <p className="text-lg font-bold text-[#1A1A2E]">
                      {selectedRequest.date ? new Date(selectedRequest.date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }) : 'N/A'}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <span className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-[3px] block">Proposed Check-In</span>
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-[#F8F9FA] rounded-[18px] border border-[#F4F3EF] flex items-center justify-center">
                        <Clock size={18} className="text-[#0D47A1]" />
                      </div>
                      <p className="text-[22px] font-black text-[#1A1A2E] tracking-tight">{formatTime(selectedRequest.proposedCheckIn)}</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <span className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-[3px] block">Proposed Check-Out</span>
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-[#F8F9FA] rounded-[18px] border border-[#F4F3EF] flex items-center justify-center">
                        <Clock size={18} className="text-[#0D47A1]" />
                      </div>
                      <p className="text-[22px] font-black text-[#1A1A2E] tracking-tight">{formatTime(selectedRequest.proposedCheckOut)}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-[#FAF9F6] p-8 rounded-[32px] border border-[#F4F3EF] mb-12">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-1.5 bg-white rounded-lg text-amber-500">
                      <Info size={16} />
                    </div>
                    <span className="text-[11px] font-black text-[#9B9BAD] uppercase tracking-[3px]">Reason for Regularization</span>
                  </div>
                  <p className="text-lg font-medium text-[#1A1A2E] leading-relaxed italic">
                    "{selectedRequest.reason}"
                  </p>
                </div>

                {selectedRequest.status === 'Pending' ? (
                  <div className="space-y-6">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between px-1">
                        <label className="text-[11px] font-black text-[#9B9BAD] uppercase tracking-[3px]">Approver Remarks</label>
                        <span className="text-[10px] font-bold text-[#9B9BAD]">{comment.length}/200</span>
                      </div>
                      <textarea
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder="Provide feedback or internal notes here..."
                        className="w-full h-32 p-6 bg-[#F8F9FA] border-2 border-[#F4F3EF] rounded-[24px] text-sm font-medium focus:ring-4 focus:ring-[#0D47A1]/5 focus:border-[#0D47A1]/20 transition-all resize-none outline-none"
                      />
                    </div>
                    <div className="flex gap-4">
                      <button
                        onClick={() => handleAction(selectedRequest.id, 'Approved')}
                        disabled={actionLoading}
                        className="flex-1 py-5 rounded-[24px] bg-[#0D47A1] text-white text-sm font-black uppercase tracking-[2px] shadow-xl shadow-[#0D47A1]/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                      >
                        {actionLoading ? 'Processing...' : (
                          <>
                            <Check size={20} />
                            Approve Correction
                          </>
                        )}
                      </button>
                      <button
                        onClick={() => handleAction(selectedRequest.id, 'Rejected')}
                        disabled={actionLoading}
                        className="flex-1 py-5 rounded-[24px] bg-white border-2 border-[#F4F3EF] text-rose-500 text-sm font-black uppercase tracking-[2px] hover:bg-rose-50 hover:border-rose-100 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                      >
                        {actionLoading ? 'Processing...' : (
                          <>
                            <X size={20} />
                            Reject Request
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className={`p-8 rounded-[32px] border flex items-start gap-5 ${getStatusStyle(selectedRequest.status)}`}>
                    <div className="p-2 rounded-xl bg-white/50 backdrop-blur-sm">
                      {selectedRequest.status === 'Approved' ? <CheckCircle size={24} /> : <XCircle size={24} />}
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-xl font-bold border-b border-current/10 pb-2 mb-3">Decision History</h4>
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-black uppercase tracking-widest opacity-60">Status:</span>
                          <span className="text-[14px] font-bold">{selectedRequest.status}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-black uppercase tracking-widest opacity-60">Approver:</span>
                          <span className="text-[14px] font-bold">{selectedRequest.approverName || 'Department Head'}</span>
                        </div>
                        <div className="pt-2">
                          <span className="text-[10px] font-black uppercase tracking-widest opacity-60 block mb-1">Remarks:</span>
                          <p className="text-[14px] font-medium leading-relaxed italic opacity-80">
                            "{selectedRequest.approverComment || 'No additional remarks provided.'}"
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <style jsx="true">{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
      `}</style>
    </div>
  );
};

export default RegularizationTab;
