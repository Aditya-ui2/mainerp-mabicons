import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiFileText, FiPlus, FiCheckCircle, FiAlertCircle,
  FiSmile, FiMeh, FiFrown, FiSend, FiPhone, FiEye,
  FiShare2, FiUsers, FiCalendar, FiClock, FiX,
  FiEdit3, FiStar, FiRefreshCw, FiMessageSquare,
} from 'react-icons/fi';
import { submitDailyReport, getMyReports } from '../../../service/api';

const SHIFT_START = '09:00';
const SHIFT_END   = '18:30';

const moodConfig = {
  Great: { icon: FiStar,   color: '#10b981', bg: '#d1fae5', label: 'Great 🌟' },
  Good:  { icon: FiSmile,  color: '#3b82f6', bg: '#dbeafe', label: 'Good 😊' },
  Okay:  { icon: FiMeh,    color: '#f59e0b', bg: '#fef3c7', label: 'Okay 😐' },
  Tough: { icon: FiFrown,  color: '#ef4444', bg: '#fee2e2', label: 'Tough 😓' },
};

const EMPTY_FORM = {
  checkInTime: '',
  checkOutTime: '',
  callsCount: '',
  profilesVisited: '',
  profilesShared: '',
  candidatesContacted: '',
  interviewsArranged: '',
  summary: '',
  tasksCompleted: '',
  tasksPlanned: '',
  blockers: '',
  mood: 'Good',
};

const calcWorkHours = (checkIn, checkOut) => {
  if (!checkIn || !checkOut) return 0;
  const [h1, m1] = checkIn.split(':').map(Number);
  const [h2, m2] = checkOut.split(':').map(Number);
  const mins = (h2 * 60 + m2) - (h1 * 60 + m1);
  return mins > 0 ? parseFloat((mins / 60).toFixed(2)) : 0;
};

const ShiftBar = ({ checkIn, checkOut }) => {
  const toMins = (t) => {
    if (!t) return null;
    const [h, m] = t.split(':').map(Number);
    return h * 60 + m;
  };
  const shiftStartMins = toMins(SHIFT_START);
  const shiftEndMins   = toMins(SHIFT_END);
  const shiftDuration  = shiftEndMins - shiftStartMins;
  const inMins  = toMins(checkIn);
  const outMins = toMins(checkOut);
  const inPct  = inMins  ? Math.min(Math.max(((inMins  - shiftStartMins) / shiftDuration) * 100, 0), 100) : null;
  const outPct = outMins ? Math.min(Math.max(((outMins - shiftStartMins) / shiftDuration) * 100, 0), 100) : null;
  const fillPct = (inPct !== null && outPct !== null) ? outPct - inPct : 0;
  const workHours = calcWorkHours(checkIn, checkOut);

  return (
    <div className="bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-700 rounded-2xl p-5 text-white mb-6">
      <div className="flex items-center justify-between mb-1">
        <span className="text-sm font-semibold opacity-90">Work Shift</span>
        {workHours > 0 && (
          <span className="text-sm font-bold px-3 py-1 rounded-full bg-white/20">
            {workHours} hrs worked
          </span>
        )}
      </div>
      <div className="flex items-center justify-between text-xs opacity-70 mb-2">
        <span>🕘 09:00 AM</span>
        <span>🕡 06:30 PM</span>
      </div>
      <div className="relative h-5 rounded-full bg-white/20 overflow-hidden">
        {inPct !== null && outPct !== null && (
          <div className="absolute top-0 h-full rounded-full bg-emerald-400" style={{ left: `${inPct}%`, width: `${fillPct}%` }} />
        )}
        {inPct !== null && (
          <div className="absolute top-0 h-full" style={{ left: `${inPct}%` }}>
            <div className="w-1 h-full bg-white rounded-full" />
          </div>
        )}
        {outPct !== null && (
          <div className="absolute top-0 h-full" style={{ left: `${outPct}%` }}>
            <div className="w-1 h-full bg-yellow-300 rounded-full" />
          </div>
        )}
      </div>
      <div className="flex items-center justify-between mt-2 text-xs">
        <span className="opacity-80">{checkIn ? `✅ In: ${checkIn}` : '⏳ Not checked in'}</span>
        <span className="opacity-80">{checkOut ? `🏁 Out: ${checkOut}` : '—'}</span>
      </div>
    </div>
  );
};

const MetricInput = ({ icon: Icon, label, sublabel, color, bg, value, onChange, name }) => (
  <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
    <div className="flex items-center gap-2 mb-3">
      <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: bg }}>
        <Icon className="w-4 h-4" style={{ color }} />
      </div>
      <div>
        <p className="text-xs font-semibold text-gray-700">{label}</p>
        {sublabel && <p className="text-[10px] text-gray-400">{sublabel}</p>}
      </div>
    </div>
    <input
      type="number" min="0" max="9999"
      value={value}
      onChange={(e) => onChange(name, e.target.value)}
      className="w-full text-2xl font-bold text-center rounded-lg border border-gray-200 py-2 focus:outline-none focus:ring-2"
      placeholder="0"
    />
  </div>
);

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

const ReportCard = ({ report, index }) => {
  const [expanded, setExpanded] = useState(false);
  const mc = moodConfig[report.mood] || moodConfig.Good;
  const metrics = [
    { label: 'Calls',      value: report.callsCount,          icon: FiPhone,    color: '#3b82f6', bg: '#dbeafe' },
    { label: 'Visited',    value: report.profilesVisited,     icon: FiEye,      color: '#8b5cf6', bg: '#ede9fe' },
    { label: 'Shared',     value: report.profilesShared,      icon: FiShare2,   color: '#0891b2', bg: '#ecfeff' },
    { label: 'Contacted',  value: report.candidatesContacted, icon: FiUsers,    color: '#10b981', bg: '#d1fae5' },
    { label: 'Interviews', value: report.interviewsArranged,  icon: FiCalendar, color: '#f59e0b', bg: '#fef3c7' },
  ];
  const formattedDate = new Date(report.date + 'T00:00:00').toLocaleDateString('en-IN', {
    weekday: 'long', day: '2-digit', month: 'short', year: 'numeric',
  });
  const workHrs = report.workHours
    ? `${report.workHours}h`
    : (report.checkInTime && report.checkOutTime ? `${calcWorkHours(report.checkInTime, report.checkOutTime)}h` : null);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
    >
      <div className="p-4 cursor-pointer hover:bg-gray-50 transition-colors" onClick={() => setExpanded(!expanded)}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: mc.bg }}>
              <mc.icon className="w-5 h-5" style={{ color: mc.color }} />
            </div>
            <div>
              <p className="font-bold text-gray-900 text-sm">{formattedDate}</p>
              {(report.checkInTime || workHrs) && (
                <p className="text-xs text-gray-500 flex items-center gap-2 mt-0.5">
                  {report.checkInTime && `🕘 ${report.checkInTime} – ${report.checkOutTime || '?'}`}
                  {workHrs && <span className="text-emerald-600 font-semibold">· {workHrs}</span>}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-full text-xs font-semibold" style={{ color: mc.color, background: mc.bg }}>{mc.label}</span>
            <FiEdit3 className={`w-4 h-4 text-gray-400 transition-transform ${expanded ? 'rotate-180' : ''}`} />
          </div>
        </div>
        <div className="flex flex-wrap gap-2 mt-3">
          {metrics.map((m) => (
            <div key={m.label} className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold" style={{ background: m.bg, color: m.color }}>
              <m.icon className="w-3 h-3" />
              <span>{m.value ?? 0} {m.label}</span>
            </div>
          ))}
        </div>
        {!expanded && report.summary && (
          <p className="text-sm text-gray-600 mt-2 line-clamp-1">{report.summary}</p>
        )}
      </div>
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }}
            className="overflow-hidden border-t border-gray-100"
          >
            <div className="p-4 space-y-3">
              {report.summary && (
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase mb-1">Summary</p>
                  <p className="text-sm text-gray-700">{report.summary}</p>
                </div>
              )}
              {Array.isArray(report.tasksCompleted) && report.tasksCompleted.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase mb-2">Tasks Completed</p>
                  <div className="flex flex-wrap gap-2">
                    {report.tasksCompleted.map((t, i) => (
                      <span key={i} className="text-xs px-2.5 py-1 rounded-lg font-medium" style={{ background: '#d1fae5', color: '#10b981' }}>✓ {t}</span>
                    ))}
                  </div>
                </div>
              )}
              {Array.isArray(report.tasksPlanned) && report.tasksPlanned.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase mb-2">Planned for Tomorrow</p>
                  <div className="flex flex-wrap gap-2">
                    {report.tasksPlanned.map((t, i) => (
                      <span key={i} className="text-xs px-2.5 py-1 rounded-lg font-medium" style={{ background: '#dbeafe', color: '#3b82f6' }}>→ {t}</span>
                    ))}
                  </div>
                </div>
              )}
              {report.blockers && (
                <div className="p-3 rounded-xl" style={{ background: '#fef3c7' }}>
                  <p className="text-xs font-semibold text-amber-700 mb-1">⚠ Blockers</p>
                  <p className="text-sm text-amber-800">{report.blockers}</p>
                </div>
              )}
              {report.headComment && (
                <div className="p-3 rounded-xl" style={{ background: '#ede9fe' }}>
                  <div className="flex items-center gap-2 mb-1">
                    <FiMessageSquare className="w-3.5 h-3.5 text-violet-600" />
                    <p className="text-xs font-semibold text-violet-700">
                      Head&apos;s Comment{report.headCommentBy && <span className="font-normal"> – {report.headCommentBy}</span>}
                    </p>
                  </div>
                  <p className="text-sm text-violet-800">{report.headComment}</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

const DailyReportTab = () => {
  const [reports, setReports]     = useState([]);
  const [loading, setLoading]     = useState(true);
  const [showForm, setShowForm]   = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast]         = useState(null);
  const [form, setForm]           = useState(EMPTY_FORM);
  const [currentTime, setCurrentTime] = useState('');

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }));
    };
    tick();
    const id = setInterval(tick, 10000);
    return () => clearInterval(id);
  }, []);

  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  }, []);

  const fetchReports = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getMyReports();
      setReports(res.reports || []);
    } catch (err) {
      showToast(err.message || 'Failed to load reports', 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => { fetchReports(); }, [fetchReports]);

  const handleFieldChange = (name, value) => {
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const openForm = () => {
    const now = new Date();
    const hh = String(now.getHours()).padStart(2, '0');
    const mm = String(now.getMinutes()).padStart(2, '0');
    setForm(prev => ({ ...EMPTY_FORM, checkInTime: prev.checkInTime || `${hh}:${mm}` }));
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.summary.trim()) {
      showToast('Please add a summary / notes for the day', 'error');
      return;
    }
    try {
      setSubmitting(true);
      const workHours = calcWorkHours(form.checkInTime, form.checkOutTime);
      const payload = {
        summary: form.summary,
        tasksCompleted: form.tasksCompleted.split('\n').map(t => t.trim()).filter(Boolean),
        tasksPlanned:   form.tasksPlanned.split('\n').map(t => t.trim()).filter(Boolean),
        blockers:       form.blockers,
        mood:           form.mood,
        checkInTime:    form.checkInTime || null,
        checkOutTime:   form.checkOutTime || null,
        workHours,
        callsCount:          parseInt(form.callsCount)          || 0,
        profilesVisited:     parseInt(form.profilesVisited)     || 0,
        profilesShared:      parseInt(form.profilesShared)      || 0,
        candidatesContacted: parseInt(form.candidatesContacted) || 0,
        interviewsArranged:  parseInt(form.interviewsArranged)  || 0,
      };
      await submitDailyReport(payload);
      showToast('MIS Report submitted successfully ✓');
      setShowForm(false);
      setForm(EMPTY_FORM);
      fetchReports();
    } catch (err) {
      showToast(err.message || 'Failed to submit report', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const todayStr    = new Date().toISOString().split('T')[0];
  const todayReport = reports.find(r => r.date === todayStr);

  return (
    <div className="space-y-6">
      <AnimatePresence>
        {toast && <Toast message={toast.message} type={toast.type} />}
      </AnimatePresence>

      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Daily MIS Report</h2>
          <p className="text-sm text-gray-500 mt-1">
            Work shift: 09:00 AM – 06:30 PM &nbsp;·&nbsp; Current time: <span className="font-semibold text-indigo-600">{currentTime}</span>
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={fetchReports} className="p-2 rounded-xl hover:bg-gray-100 text-gray-500 transition-colors" title="Refresh">
            <FiRefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          {todayReport ? (
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold" style={{ color: '#10b981', background: '#d1fae5' }}>
                <FiCheckCircle className="w-4 h-4" /> Today&apos;s MIS submitted
              </span>
              <button onClick={openForm} className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium border border-indigo-200 text-indigo-600 hover:bg-indigo-50 transition-colors">
                <FiEdit3 className="w-3.5 h-3.5" /> Update
              </button>
            </div>
          ) : (
            <button onClick={openForm} className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white font-semibold shadow-lg hover:shadow-xl transition-all" style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
              <FiPlus className="w-4 h-4" /> Submit Today&apos;s Report
            </button>
          )}
        </div>
      </div>

      <ShiftBar checkIn={todayReport?.checkInTime || ''} checkOut={todayReport?.checkOutTime || ''} />

      {todayReport && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {[
            { label: 'Phone Calls',      value: todayReport.callsCount,          icon: FiPhone,    color: '#3b82f6', bg: '#dbeafe' },
            { label: 'Profiles Visited', value: todayReport.profilesVisited,     icon: FiEye,      color: '#8b5cf6', bg: '#ede9fe' },
            { label: 'Profiles Shared',  value: todayReport.profilesShared,      icon: FiShare2,   color: '#0891b2', bg: '#ecfeff' },
            { label: 'Candidates',       value: todayReport.candidatesContacted, icon: FiUsers,    color: '#10b981', bg: '#d1fae5' },
            { label: 'Interviews Set',   value: todayReport.interviewsArranged,  icon: FiCalendar, color: '#f59e0b', bg: '#fef3c7' },
          ].map((m) => (
            <div key={m.label} className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm text-center">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-2" style={{ background: m.bg }}>
                <m.icon className="w-5 h-5" style={{ color: m.color }} />
              </div>
              <p className="text-2xl font-black" style={{ color: m.color }}>{m.value ?? 0}</p>
              <p className="text-[11px] text-gray-500 font-medium mt-0.5">{m.label}</p>
            </div>
          ))}
        </div>
      )}

      <div>
        <h3 className="text-lg font-bold text-gray-900 mb-4">Report History</h3>
        {loading ? (
          <div className="animate-pulse space-y-4">
            {[1, 2, 3].map(i => <div key={i} className="h-24 rounded-2xl bg-gray-200" />)}
          </div>
        ) : reports.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
            <FiFileText className="w-12 h-12 text-gray-300 mx-auto" />
            <p className="text-gray-400 font-medium mt-3">No MIS reports yet</p>
            <p className="text-gray-400 text-sm mt-1">Submit your first daily report above</p>
          </div>
        ) : (
          <div className="space-y-3">
            {reports.map((report, idx) => <ReportCard key={report.id} report={report} index={idx} />)}
          </div>
        )}
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: 'rgba(0,0,0,0.55)' }}
            onClick={() => setShowForm(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl max-h-[92vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="sticky top-0 z-10 bg-white px-6 pt-6 pb-4 border-b border-gray-100 flex items-center justify-between rounded-t-3xl">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">{todayReport ? 'Update' : 'Submit'} Daily MIS Report</h3>
                  <p className="text-sm text-gray-500 mt-0.5">{new Date().toLocaleDateString('en-IN', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })}</p>
                </div>
                <button onClick={() => setShowForm(false)} className="p-2 rounded-xl hover:bg-gray-100 text-gray-500 transition-colors">
                  <FiX className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="px-6 py-5 space-y-6">
                <div>
                  <p className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                    <FiClock className="w-4 h-4 text-indigo-500" /> Work Timing
                    <span className="text-xs font-normal text-gray-400">(Shift: 09:00 AM – 06:30 PM)</span>
                  </p>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Check-in Time</label>
                      <input type="time" value={form.checkInTime} onChange={(e) => handleFieldChange('checkInTime', e.target.value)}
                        className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Check-out Time</label>
                      <input type="time" value={form.checkOutTime} onChange={(e) => handleFieldChange('checkOutTime', e.target.value)}
                        className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                    </div>
                  </div>
                  {form.checkInTime && form.checkOutTime && (
                    <p className="text-xs text-emerald-600 font-semibold mt-1.5">
                      ✓ {calcWorkHours(form.checkInTime, form.checkOutTime)} hours worked today
                    </p>
                  )}
                </div>

                <div>
                  <p className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                    <FiStar className="w-4 h-4 text-amber-500" /> Today&apos;s KPI Numbers
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    <MetricInput icon={FiPhone}    label="Phone Calls"      sublabel="Total calls made"   color="#3b82f6" bg="#dbeafe" name="callsCount"           value={form.callsCount}           onChange={handleFieldChange} />
                    <MetricInput icon={FiEye}      label="Profiles Visited" sublabel="Sourced / reviewed" color="#8b5cf6" bg="#ede9fe" name="profilesVisited"     value={form.profilesVisited}     onChange={handleFieldChange} />
                    <MetricInput icon={FiShare2}   label="Profiles Shared"  sublabel="Shared with client" color="#0891b2" bg="#ecfeff" name="profilesShared"      value={form.profilesShared}      onChange={handleFieldChange} />
                    <MetricInput icon={FiUsers}    label="Candidates"       sublabel="Contacted today"    color="#10b981" bg="#d1fae5" name="candidatesContacted" value={form.candidatesContacted} onChange={handleFieldChange} />
                    <MetricInput icon={FiCalendar} label="Interviews Set"   sublabel="Arranged today"     color="#f59e0b" bg="#fef3c7" name="interviewsArranged"  value={form.interviewsArranged}  onChange={handleFieldChange} />
                  </div>
                </div>

                <div className="space-y-4">
                  <p className="text-sm font-bold text-gray-700 flex items-center gap-2">
                    <FiFileText className="w-4 h-4 text-violet-500" /> Daily Summary
                  </p>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Summary / Notes <span className="text-red-500">*</span></label>
                    <textarea value={form.summary} onChange={(e) => handleFieldChange('summary', e.target.value)} rows={2}
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                      placeholder="Brief overview of what you did today..." />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Tasks Completed <span className="text-[10px] text-gray-400">(one per line)</span></label>
                    <textarea value={form.tasksCompleted} onChange={(e) => handleFieldChange('tasksCompleted', e.target.value)} rows={3}
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                      placeholder={"Called Ravi for Sr. Developer role\nShared 3 profiles to TechCorp"} />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Plans for Tomorrow</label>
                    <textarea value={form.tasksPlanned} onChange={(e) => handleFieldChange('tasksPlanned', e.target.value)} rows={2}
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                      placeholder={"Follow up on TechCorp shortlist\nSource 5 profiles for Finance role"} />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Blockers / Issues</label>
                    <input type="text" value={form.blockers} onChange={(e) => handleFieldChange('blockers', e.target.value)}
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="Any issues? e.g. Client not responding, JD unclear..." />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-600 uppercase mb-2">Day Mood</label>
                  <div className="flex gap-2 flex-wrap">
                    {Object.entries(moodConfig).map(([key, mc]) => (
                      <button key={key} type="button" onClick={() => handleFieldChange('mood', key)}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold border-2 transition-all"
                        style={form.mood === key ? { borderColor: mc.color, background: mc.bg, color: mc.color } : { borderColor: '#e5e7eb', color: '#6b7280' }}>
                        <mc.icon className="w-4 h-4" />
                        {mc.label}
                      </button>
                    ))}
                  </div>
                </div>

                <button type="submit" disabled={submitting}
                  className="w-full py-3 rounded-xl text-white font-bold flex items-center justify-center gap-2 shadow-lg transition-all hover:opacity-90 disabled:opacity-70"
                  style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
                  <FiSend className="w-4 h-4" />
                  {submitting ? 'Submitting...' : todayReport ? 'Update MIS Report' : 'Submit MIS Report'}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DailyReportTab;
