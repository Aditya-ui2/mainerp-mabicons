import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiCalendar, FiPlus, FiX, FiClock, FiCheckCircle, FiXCircle, FiSend } from 'react-icons/fi';
import { getMyLeaves, applyLeave } from '../../../service/api';

const LeaveRequestTab = () => {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState(null);
  const [form, setForm] = useState({ leaveType: 'casual', startDate: '', endDate: '', reason: '' });

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => { fetchLeaves(); }, []);

  const fetchLeaves = async () => {
    try {
      setLoading(true);
      const res = await getMyLeaves();
      setLeaves(res.data || []);
    } catch (err) {
      showToast(err.message || 'Failed to load leaves', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async (e) => {
    e.preventDefault();
    if (!form.startDate || !form.endDate || !form.reason) {
      showToast('Please fill all fields', 'error');
      return;
    }
    try {
      setSubmitting(true);
      await applyLeave(form);
      showToast('Leave request submitted');
      setShowForm(false);
      setForm({ leaveType: 'casual', startDate: '', endDate: '', reason: '' });
      fetchLeaves();
    } catch (err) {
      showToast(err.message || 'Failed to submit', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const statusConfig = {
    pending: { color: '#f59e0b', bg: '#fef3c7', icon: FiClock, label: 'Pending' },
    approved: { color: '#10b981', bg: '#d1fae5', icon: FiCheckCircle, label: 'Approved' },
    rejected: { color: '#ef4444', bg: '#fee2e2', icon: FiXCircle, label: 'Rejected' },
  };

  const leaveTypeColors = {
    casual: '#3b82f6', sick: '#ef4444', earned: '#8b5cf6', unpaid: '#6b7280', other: '#f59e0b',
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        {[1, 2, 3].map(i => <div key={i} className="h-24 rounded-xl bg-gray-200" />)}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            className="fixed top-4 right-4 z-50 px-5 py-3 rounded-xl shadow-lg text-white font-medium"
            style={{ background: toast.type === 'error' ? '#ef4444' : '#10b981' }}
          >
            {toast.message}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Leave Requests</h2>
          <p className="text-gray-500 text-sm mt-1">Manage your leave applications</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-white font-medium shadow-md hover:shadow-lg transition-all"
          style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}
        >
          <FiPlus style={{ width: '18px', height: '18px' }} />
          Apply Leave
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Pending', count: leaves.filter(l => l.status === 'pending').length, color: '#f59e0b' },
          { label: 'Approved', count: leaves.filter(l => l.status === 'approved').length, color: '#10b981' },
          { label: 'Rejected', count: leaves.filter(l => l.status === 'rejected').length, color: '#ef4444' },
        ].map((s, i) => (
          <div key={i} className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm text-center">
            <p className="text-2xl font-bold" style={{ color: s.color }}>{s.count}</p>
            <p className="text-xs text-gray-500 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Apply Form Modal */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: 'rgba(0,0,0,0.5)' }}
            onClick={() => setShowForm(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-lg font-bold text-gray-900">Apply for Leave</h3>
                <button onClick={() => setShowForm(false)} className="p-1.5 rounded-lg hover:bg-gray-100">
                  <FiX style={{ width: '20px', height: '20px', color: '#6b7280' }} />
                </button>
              </div>
              <form onSubmit={handleApply} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Leave Type</label>
                  <select
                    value={form.leaveType}
                    onChange={(e) => setForm(p => ({ ...p, leaveType: e.target.value }))}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="casual">Casual Leave</option>
                    <option value="sick">Sick Leave</option>
                    <option value="earned">Earned Leave</option>
                    <option value="unpaid">Unpaid Leave</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                    <input
                      type="date" value={form.startDate}
                      onChange={(e) => setForm(p => ({ ...p, startDate: e.target.value }))}
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                    <input
                      type="date" value={form.endDate}
                      onChange={(e) => setForm(p => ({ ...p, endDate: e.target.value }))}
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Reason</label>
                  <textarea
                    value={form.reason}
                    onChange={(e) => setForm(p => ({ ...p, reason: e.target.value }))}
                    rows={3}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                    placeholder="Briefly explain your reason..."
                  />
                </div>
                <button
                  type="submit" disabled={submitting}
                  className="w-full py-2.5 rounded-xl text-white font-medium flex items-center justify-center gap-2"
                  style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}
                >
                  <FiSend style={{ width: '16px', height: '16px' }} />
                  {submitting ? 'Submitting...' : 'Submit Request'}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Leave List */}
      {leaves.length === 0 ? (
        <div className="text-center py-16">
          <FiCalendar style={{ width: '48px', height: '48px', color: '#d1d5db', margin: '0 auto' }} />
          <p className="text-gray-400 mt-3 font-medium">No leave requests yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {leaves.map((leave, idx) => {
            const sc = statusConfig[leave.status] || statusConfig.pending;
            return (
              <motion.div
                key={leave.id}
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg mt-0.5" style={{ background: `${leaveTypeColors[leave.leaveType] || '#6b7280'}15` }}>
                      <FiCalendar style={{ width: '18px', height: '18px', color: leaveTypeColors[leave.leaveType] || '#6b7280' }} />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 capitalize">{leave.leaveType} Leave</p>
                      <p className="text-sm text-gray-500 mt-0.5">
                        {new Date(leave.startDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                        {' → '}
                        {new Date(leave.endDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                        {leave.totalDays ? ` (${leave.totalDays} day${leave.totalDays > 1 ? 's' : ''})` : ''}
                      </p>
                      <p className="text-sm text-gray-500 mt-1">{leave.reason}</p>
                      {leave.approverComment && (
                        <p className="text-xs text-gray-400 mt-2 italic">"{leave.approverComment}" — {leave.approverName}</p>
                      )}
                    </div>
                  </div>
                  <span
                    className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold"
                    style={{ color: sc.color, background: sc.bg }}
                  >
                    <sc.icon style={{ width: '12px', height: '12px' }} />
                    {sc.label}
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default LeaveRequestTab;
