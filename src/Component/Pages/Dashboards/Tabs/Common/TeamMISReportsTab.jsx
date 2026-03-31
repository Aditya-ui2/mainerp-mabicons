import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiUsers, FiPhone, FiEye, FiShare2, FiCalendar,
  FiClock, FiMessageSquare, FiCheckCircle, FiRefreshCw,
  FiSmile, FiMeh, FiFrown, FiStar, FiX, FiSend,
  FiAlertCircle, FiBarChart2,
} from 'react-icons/fi';
import { getMISReports, addHeadComment } from '../../../service/api';

const moodConfig = {
  Great: { icon: FiStar,   color: '#10b981', bg: '#d1fae5', label: 'Great 🌟' },
  Good:  { icon: FiSmile,  color: '#3b82f6', bg: '#dbeafe', label: 'Good 😊' },
  Okay:  { icon: FiMeh,    color: '#f59e0b', bg: '#fef3c7', label: 'Okay 😐' },
  Tough: { icon: FiFrown,  color: '#ef4444', bg: '#fee2e2', label: 'Tough 😓' },
};

const formatTime = (t) => {
  if (!t) return '—';
  const [h, m] = t.split(':').map(Number);
  const period = h >= 12 ? 'PM' : 'AM';
  const hour   = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return `${hour}:${String(m).padStart(2, '0')} ${period}`;
};

const Toast = ({ message, type }) => (
  <motion.div
    initial={{ opacity: 0, y: -24 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -24 }}
    className="fixed top-4 right-4 z-50 px-5 py-3 rounded-xl shadow-xl text-white font-medium flex items-center gap-2"
    style={{ background: type === 'error' ? '#ef4444' : '#10b981' }}
  >
    {type === 'error' ? <FiAlertCircle className="w-4 h-4" /> : <FiCheckCircle className="w-4 h-4" />}
    {message}
  </motion.div>
);

const StatBadge = ({ icon: Icon, value, label, color, bg }) => (
  <div className="flex flex-col items-center p-2 rounded-xl min-w-[56px]" style={{ background: bg }}>
    <Icon className="w-3.5 h-3.5 mb-0.5" style={{ color }} />
    <span className="text-sm font-black" style={{ color }}>{value ?? 0}</span>
    <span className="text-[9px] text-gray-500 font-medium mt-0.5">{label}</span>
  </div>
);

const CommentModal = ({ report, onClose, onSaved }) => {
  const [comment, setComment] = useState(report?.headComment || '');
  const [saving, setSaving]   = useState(false);
  const [error, setError]     = useState('');

  const handleSave = async () => {
    if (!comment.trim()) { setError('Please enter a comment'); return; }
    try {
      setSaving(true);
      await addHeadComment(report.id, comment.trim());
      onSaved();
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to save comment');
    } finally {
      setSaving(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.55)' }}
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
        className="bg-white rounded-3xl w-full max-w-md shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-gray-100">
          <div>
            <h3 className="font-bold text-gray-900">Add / Edit Comment</h3>
            <p className="text-sm text-gray-500 mt-0.5">{report?.memberName}</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-gray-100 text-gray-500">
            <FiX className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6 space-y-4">
          {report?.headComment && (
            <div className="p-3 rounded-xl text-sm" style={{ background: '#ede9fe', color: '#6d28d9' }}>
              <p className="font-semibold text-xs mb-1">Previous comment:</p>
              {report.headComment}
            </div>
          )}
          <textarea
            value={comment}
            onChange={(e) => { setComment(e.target.value); setError(''); }}
            rows={4}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 resize-none"
            placeholder="Write your feedback or notes for this report..."
            autoFocus
          />
          {error && <p className="text-red-500 text-xs font-medium">{error}</p>}
          <button
            onClick={handleSave} disabled={saving}
            className="w-full py-3 rounded-xl text-white font-bold flex items-center justify-center gap-2 transition-all hover:opacity-90 disabled:opacity-70"
            style={{ background: 'linear-gradient(135deg, #7c3aed, #6d28d9)' }}
          >
            <FiSend className="w-4 h-4" />
            {saving ? 'Saving...' : 'Save Comment'}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

const ReportRow = ({ report, onComment }) => {
  const [expanded, setExpanded] = useState(false);
  const mc = moodConfig[report.mood] || moodConfig.Good;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="p-4 cursor-pointer hover:bg-gray-50 transition-colors" onClick={() => setExpanded(!expanded)}>
        <div className="flex items-center gap-4 flex-wrap">
          {/* Avatar + Name */}
          <div className="flex items-center gap-3 min-w-[180px]">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white text-sm flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
              {(report.memberName || '?').charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="font-bold text-gray-900 text-sm">{report.memberName}</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <FiClock className="w-3 h-3 text-gray-400" />
                <span className="text-xs text-gray-500">
                  {formatTime(report.checkInTime)} – {formatTime(report.checkOutTime)}
                </span>
              </div>
            </div>
          </div>

          {/* KPI Stats */}
          <div className="flex items-center gap-2 flex-wrap flex-1">
            <StatBadge icon={FiPhone}    value={report.callsCount}          label="Calls"      color="#3b82f6" bg="#dbeafe" />
            <StatBadge icon={FiEye}      value={report.profilesVisited}     label="Visited"    color="#8b5cf6" bg="#ede9fe" />
            <StatBadge icon={FiShare2}   value={report.profilesShared}      label="Shared"     color="#0891b2" bg="#ecfeff" />
            <StatBadge icon={FiUsers}    value={report.candidatesContacted} label="Contacted"  color="#10b981" bg="#d1fae5" />
            <StatBadge icon={FiCalendar} value={report.interviewsArranged}  label="Interviews" color="#f59e0b" bg="#fef3c7" />
          </div>

          {/* Mood + Work hrs + Comment button */}
          <div className="flex items-center gap-3 ml-auto flex-shrink-0">
            {report.workHours > 0 && (
              <span className="text-xs font-semibold px-2.5 py-1 rounded-lg" style={{ background: '#d1fae5', color: '#10b981' }}>
                {report.workHours}h
              </span>
            )}
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full" style={{ color: mc.color, background: mc.bg }}>
              {mc.label}
            </span>
            <button
              onClick={(e) => { e.stopPropagation(); onComment(report); }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-colors hover:bg-violet-50"
              style={report.headComment ? { borderColor: '#7c3aed', color: '#7c3aed' } : { borderColor: '#e5e7eb', color: '#6b7280' }}
            >
              <FiMessageSquare className="w-3.5 h-3.5" />
              {report.headComment ? 'Edit Comment' : 'Add Comment'}
            </button>
          </div>
        </div>
      </div>

      {/* Expanded section */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }}
            className="overflow-hidden border-t border-gray-100"
          >
            <div className="p-4 grid sm:grid-cols-2 gap-4">
              {report.summary && (
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase mb-1">Summary</p>
                  <p className="text-sm text-gray-700">{report.summary}</p>
                </div>
              )}
              {Array.isArray(report.tasksCompleted) && report.tasksCompleted.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase mb-2">Tasks Completed</p>
                  <div className="space-y-1">
                    {report.tasksCompleted.map((t, i) => (
                      <p key={i} className="text-sm text-gray-700 flex items-start gap-1.5">
                        <FiCheckCircle className="w-3.5 h-3.5 text-emerald-500 mt-0.5 flex-shrink-0" />{t}
                      </p>
                    ))}
                  </div>
                </div>
              )}
              {report.blockers && (
                <div className="p-3 rounded-xl sm:col-span-2" style={{ background: '#fef3c7' }}>
                  <p className="text-xs font-semibold text-amber-700 mb-1">⚠ Blockers</p>
                  <p className="text-sm text-amber-800">{report.blockers}</p>
                </div>
              )}
              {report.headComment && (
                <div className="p-3 rounded-xl sm:col-span-2" style={{ background: '#ede9fe' }}>
                  <p className="text-xs font-semibold text-violet-700 mb-1">
                    💬 Your Comment{report.headCommentBy && <span className="font-normal"> – {report.headCommentBy}</span>}
                  </p>
                  <p className="text-sm text-violet-800">{report.headComment}</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const TeamMISReportsTab = () => {
  const [reports, setReports]         = useState([]);
  const [loading, setLoading]         = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [commentTarget, setCommentTarget] = useState(null);
  const [toast, setToast]             = useState(null);

  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  }, []);

  const fetchReports = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getMISReports({ date: selectedDate, department: 'HR Recruitment' });
      setReports(res.reports || []);
    } catch (err) {
      showToast(err.message || 'Failed to fetch MIS reports', 'error');
    } finally {
      setLoading(false);
    }
  }, [selectedDate, showToast]);

  useEffect(() => { fetchReports(); }, [fetchReports]);

  // Totals row
  const totals = reports.reduce((acc, r) => ({
    callsCount:          acc.callsCount          + (r.callsCount          || 0),
    profilesVisited:     acc.profilesVisited     + (r.profilesVisited     || 0),
    profilesShared:      acc.profilesShared      + (r.profilesShared      || 0),
    candidatesContacted: acc.candidatesContacted + (r.candidatesContacted || 0),
    interviewsArranged:  acc.interviewsArranged  + (r.interviewsArranged  || 0),
  }), { callsCount: 0, profilesVisited: 0, profilesShared: 0, candidatesContacted: 0, interviewsArranged: 0 });

  const formattedDate = new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-IN', {
    weekday: 'long', day: '2-digit', month: 'long', year: 'numeric',
  });

  return (
    <div className="space-y-6">
      <AnimatePresence>
        {toast && <Toast message={toast.message} type={toast.type} />}
      </AnimatePresence>

      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Team MIS Reports</h2>
          <p className="text-sm text-gray-500 mt-1">Daily performance summary — HR Recruitment team</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={fetchReports} className="p-2 rounded-xl hover:bg-gray-100 text-gray-500 transition-colors" title="Refresh">
            <FiRefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <div className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-xl">
            <FiCalendar className="w-4 h-4 text-gray-400" />
            <input
              type="date" value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="text-sm font-medium text-gray-700 focus:outline-none bg-transparent"
            />
          </div>
        </div>
      </div>

      {/* Date label */}
      <div className="flex items-center gap-2">
        <FiCalendar className="w-4 h-4 text-indigo-500" />
        <p className="text-sm font-semibold text-gray-700">{formattedDate}</p>
        {!loading && (
          <span className="text-xs px-2.5 py-1 rounded-full font-semibold" style={{ background: '#ede9fe', color: '#7c3aed' }}>
            {reports.length} report{reports.length !== 1 ? 's' : ''} submitted
          </span>
        )}
      </div>

      {/* Team Totals Banner */}
      {!loading && reports.length > 0 && (
        <div className="bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-700 rounded-2xl p-5 text-white">
          <div className="flex items-center gap-2 mb-4">
            <FiBarChart2 className="w-5 h-5" />
            <p className="font-bold">Team Total for the Day</p>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
            {[
              { label: 'Total Calls',      value: totals.callsCount,          icon: FiPhone    },
              { label: 'Profiles Visited', value: totals.profilesVisited,     icon: FiEye      },
              { label: 'Profiles Shared',  value: totals.profilesShared,      icon: FiShare2   },
              { label: 'Contacted',        value: totals.candidatesContacted, icon: FiUsers    },
              { label: 'Interviews Set',   value: totals.interviewsArranged,  icon: FiCalendar },
            ].map((m) => (
              <div key={m.label} className="bg-white/10 rounded-xl p-3 text-center">
                <m.icon className="w-5 h-5 mx-auto mb-1 opacity-80" />
                <p className="text-2xl font-black">{m.value}</p>
                <p className="text-[11px] opacity-75 font-medium">{m.label}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Reports List */}
      {loading ? (
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map(i => <div key={i} className="h-24 rounded-2xl bg-gray-200" />)}
        </div>
      ) : reports.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
          <FiUsers className="w-12 h-12 text-gray-300 mx-auto" />
          <p className="text-gray-400 font-medium mt-3">No MIS reports submitted for this date</p>
          <p className="text-gray-400 text-sm mt-1">Team members haven&apos;t filed their reports yet, or select a different date.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {reports.map((report, idx) => (
            <motion.div key={report.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.04 }}>
              <ReportRow report={report} onComment={setCommentTarget} />
            </motion.div>
          ))}
        </div>
      )}

      {/* Comment Modal */}
      <AnimatePresence>
        {commentTarget && (
          <CommentModal
            report={commentTarget}
            onClose={() => setCommentTarget(null)}
            onSaved={() => {
              showToast('Comment saved successfully');
              fetchReports();
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default TeamMISReportsTab;
