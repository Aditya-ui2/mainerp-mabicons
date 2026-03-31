import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiFileText, FiPlus, FiCheckCircle, FiAlertCircle, FiSmile, FiMeh, FiFrown, FiSend } from 'react-icons/fi';
import { submitDailyReport, getMyReports } from '../../../service/api';

const moodConfig = {
  Great: { icon: FiSmile, color: '#10b981', label: 'Great' },
  Good: { icon: FiSmile, color: '#3b82f6', label: 'Good' },
  Okay: { icon: FiMeh, color: '#f59e0b', label: 'Okay' },
  Tough: { icon: FiFrown, color: '#ef4444', label: 'Tough' },
};

const DailyReportTab = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState(null);
  const [form, setForm] = useState({
    summary: '',
    tasksCompleted: '',
    tasksPlanned: '',
    blockers: '',
    mood: 'Good',
  });

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => { fetchReports(); }, []);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const res = await getMyReports();
      setReports(res.reports || []);
    } catch (err) {
      showToast(err.message || 'Failed to load reports', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.summary) {
      showToast('Please add a summary', 'error');
      return;
    }
    try {
      setSubmitting(true);
      const payload = {
        summary: form.summary,
        tasksCompleted: form.tasksCompleted.split('\n').filter(Boolean),
        tasksPlanned: form.tasksPlanned.split('\n').filter(Boolean),
        blockers: form.blockers,
        mood: form.mood,
      };
      await submitDailyReport(payload);
      showToast('Report submitted successfully');
      setShowForm(false);
      setForm({ summary: '', tasksCompleted: '', tasksPlanned: '', blockers: '', mood: 'Good' });
      fetchReports();
    } catch (err) {
      showToast(err.message || 'Failed to submit report', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const todayStr = new Date().toISOString().split('T')[0];
  const todayReport = reports.find(r => r.date === todayStr);

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
          <h2 className="text-2xl font-bold text-gray-900">Daily Reports</h2>
          <p className="text-gray-500 text-sm mt-1">Submit and review your daily updates</p>
        </div>
        {!todayReport && (
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-white font-medium shadow-md"
            style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}
          >
            <FiPlus style={{ width: '18px', height: '18px' }} />
            Submit Today's Report
          </button>
        )}
        {todayReport && (
          <span className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold" style={{ color: '#10b981', background: '#d1fae5' }}>
            <FiCheckCircle style={{ width: '16px', height: '16px' }} />
            Today's report submitted
          </span>
        )}
      </div>

      {/* Form Modal */}
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
              className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-bold text-gray-900 mb-5">Daily Report — {new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Summary *</label>
                  <textarea
                    value={form.summary}
                    onChange={(e) => setForm(p => ({ ...p, summary: e.target.value }))}
                    rows={2}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                    placeholder="How was your day?"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tasks Completed (one per line)</label>
                  <textarea
                    value={form.tasksCompleted}
                    onChange={(e) => setForm(p => ({ ...p, tasksCompleted: e.target.value }))}
                    rows={3}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                    placeholder="Task 1&#10;Task 2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tasks Planned for Tomorrow</label>
                  <textarea
                    value={form.tasksPlanned}
                    onChange={(e) => setForm(p => ({ ...p, tasksPlanned: e.target.value }))}
                    rows={2}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                    placeholder="Task 1&#10;Task 2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Blockers / Issues</label>
                  <input
                    type="text" value={form.blockers}
                    onChange={(e) => setForm(p => ({ ...p, blockers: e.target.value }))}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Any blockers?"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Mood</label>
                  <div className="flex gap-3">
                    {Object.entries(moodConfig).map(([key, mc]) => (
                      <button
                        key={key} type="button"
                        onClick={() => setForm(p => ({ ...p, mood: key }))}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium border-2 transition-all"
                        style={form.mood === key
                          ? { borderColor: mc.color, background: `${mc.color}15`, color: mc.color }
                          : { borderColor: '#e5e7eb', color: '#6b7280' }
                        }
                      >
                        <mc.icon style={{ width: '16px', height: '16px' }} />
                        {mc.label}
                      </button>
                    ))}
                  </div>
                </div>
                <button
                  type="submit" disabled={submitting}
                  className="w-full py-2.5 rounded-xl text-white font-medium flex items-center justify-center gap-2"
                  style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}
                >
                  <FiSend style={{ width: '16px', height: '16px' }} />
                  {submitting ? 'Submitting...' : 'Submit Report'}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Reports List */}
      {loading ? (
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map(i => <div key={i} className="h-28 rounded-xl bg-gray-200" />)}
        </div>
      ) : reports.length === 0 ? (
        <div className="text-center py-16">
          <FiFileText style={{ width: '48px', height: '48px', color: '#d1d5db', margin: '0 auto' }} />
          <p className="text-gray-400 mt-3 font-medium">No reports submitted yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {reports.map((report, idx) => {
            const mc = moodConfig[report.mood] || moodConfig.Good;
            return (
              <motion.div
                key={report.id}
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm"
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="font-semibold text-gray-900">
                      {new Date(report.date).toLocaleDateString('en-IN', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' })}
                    </p>
                    <p className="text-sm text-gray-600 mt-1">{report.summary}</p>
                  </div>
                  <span className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full" style={{ color: mc.color, background: `${mc.color}15` }}>
                    <mc.icon style={{ width: '12px', height: '12px' }} />
                    {mc.label}
                  </span>
                </div>
                {report.tasksCompleted && report.tasksCompleted.length > 0 && (
                  <div className="mt-3">
                    <p className="text-xs font-medium text-gray-400 uppercase mb-1">Completed</p>
                    <div className="flex flex-wrap gap-1.5">
                      {report.tasksCompleted.map((t, i) => (
                        <span key={i} className="text-xs px-2.5 py-1 rounded-lg" style={{ background: '#d1fae5', color: '#10b981' }}>
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {report.headComment && (
                  <div className="mt-3 p-3 rounded-lg" style={{ background: '#ede9fe' }}>
                    <p className="text-xs text-indigo-700">
                      <span className="font-semibold">Head's Comment:</span> {report.headComment}
                    </p>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default DailyReportTab;
