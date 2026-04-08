import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users, Phone, Eye, Share2, Calendar, Clock, MessageSquare, CheckCircle2, 
  RefreshCw, Smile, Meh, Frown, Star, X, Send, AlertCircle, BarChart2, 
  Download, Activity, ShieldCheck, MoreVertical, ChevronDown
} from 'lucide-react';
import { getMISReports, addHeadComment } from '../../../service/api';
import { getLocalISODate } from '../../../Utilities/dateUtils';

const moodConfig = {
  Great: { icon: Star,   color: 'text-[#10B981]', bg: 'bg-[#ECFDF5]', label: 'GREAT' },
  Good:  { icon: Smile,  color: 'text-[#3B82F6]', bg: 'bg-[#EFF6FF]', label: 'GOOD' },
  Okay:  { icon: Meh,    color: 'text-[#F59E0B]', bg: 'bg-[#FFFBEB]', label: 'OKAY' },
  Tough: { icon: Frown,  color: 'text-[#EF4444]', bg: 'bg-[#FEF2F2]', label: 'TOUGH' },
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
    className="fixed top-4 right-4 z-[9999] px-5 py-3 rounded-2xl shadow-xl text-white text-[12px] font-bold tracking-widest uppercase flex items-center gap-2 font-['Plus_Jakarta_Sans']"
    style={{ background: type === 'error' ? '#EF4444' : '#1B4DA0' }}
  >
    {type === 'error' ? <AlertCircle size={16} /> : <CheckCircle2 size={16} />}
    {message}
  </motion.div>
);

const StatBadge = ({ icon: Icon, value, label, color, bg }) => (
  <div className={`flex flex-col items-center justify-center p-3 rounded-2xl min-w-[75px] ${bg}`}>
    <Icon className={`w-4 h-4 mb-2 ${color}`} />
    <span className={`text-[16px] leading-none font-black ${color}`}>{value ?? 0}</span>
    <span className={`text-[9px] font-bold uppercase tracking-widest mt-1.5 opacity-80 ${color}`}>{label}</span>
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
      className="fixed inset-0 z-50 flex items-center justify-center p-4 font-['Plus_Jakarta_Sans'] text-left"
      style={{ background: 'rgba(26,26,46,0.5)', backdropFilter: 'blur(8px)' }}
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
        className="bg-white dark:bg-slate-900 rounded-[32px] w-full max-w-md shadow-2xl overflow-hidden border border-[#F4F3EF] dark:border-slate-800 text-left relative"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-8 py-7 border-b border-[#F4F3EF] dark:border-slate-800 bg-[#FAFAFA]/50 dark:bg-slate-900/50">
          <div>
            <h3 className="text-[22px] font-bold font-syne text-[#1A1A2E] dark:text-white tracking-tight">Review Intel</h3>
            <p className="text-[10px] font-bold uppercase tracking-widest text-[#9B9BAD] mt-1">{report?.memberName}</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-[#F8FAFF] dark:hover:bg-slate-800 text-[#9B9BAD] hover:text-[#1A1A2E] transition-colors relative z-10">
            <X size={20} />
          </button>
        </div>
        <div className="p-8 space-y-6 relative z-10">
          {report?.headComment && (
            <div className="p-5 rounded-[22px] bg-[#EEF2FB] dark:bg-slate-800 text-[#1B4DA0] dark:text-blue-400 border border-[#DBEAFE] dark:border-slate-700">
              <p className="font-bold text-[9px] uppercase tracking-[0.15em] mb-2 opacity-60 flex items-center gap-1.5"><ShieldCheck size={12} /> Existing Intelligence</p>
              <p className="text-[13px] font-bold leading-relaxed">{report.headComment}</p>
            </div>
          )}
          <textarea
            value={comment}
            onChange={(e) => { setComment(e.target.value); setError(''); }}
            rows={5}
            className="w-full px-6 py-5 bg-[#FAFAFA] dark:bg-slate-900 border border-[#F4F3EF] dark:border-slate-800 rounded-[22px] text-sm font-medium text-[#1A1A2E] dark:text-white focus:outline-none focus:border-[#1B4DA0] focus:ring-4 focus:ring-[#1B4DA0]/10 transition-all resize-none placeholder-[#9B9BAD]"
            placeholder="Log operational directives for this agent..."
            autoFocus
          />
          {error && <p className="text-[#EF4444] text-[10px] font-bold uppercase tracking-widest">{error}</p>}
          <button
            onClick={handleSave} disabled={saving}
            className="w-full py-4 rounded-full bg-[#1B4DA0] text-white text-[11px] font-bold uppercase tracking-[0.15em] flex items-center justify-center gap-2 hover:bg-[#153e82] transition-all shadow-lg shadow-blue-500/20 active:scale-95 disabled:opacity-50"
          >
            <Send size={16} />
            {saving ? 'Transmitting...' : 'Commit Intel Entry'}
          </button>
        </div>
        <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-[#1B4DA0]/5 rounded-full blur-[64px] pointer-events-none" />
      </motion.div>
    </motion.div>
  );
};

const ReportRow = ({ report, onComment }) => {
  const [expanded, setExpanded] = useState(false);
  const mc = moodConfig[report.mood] || moodConfig.Good;
  const MoodIcon = mc.icon;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-[32px] border border-[#F4F3EF] dark:border-slate-800 shadow-sm hover:shadow-2xl transition-all duration-500 relative group text-left mb-6">
      <div className="p-6 lg:p-8 cursor-pointer relative z-10" onClick={() => setExpanded(!expanded)}>
        <div className="flex items-center justify-between flex-wrap gap-6">
          
          {/* Identity Block */}
          <div className="flex items-center gap-5 min-w-[240px]">
            <div className="w-14 h-14 rounded-[20px] flex items-center justify-center font-bold text-white text-xl flex-shrink-0 shadow-lg shadow-blue-500/20"
              style={{ background: '#1B4DA0' }}>
              {(report.memberName || '?').charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="text-[20px] font-bold font-syne text-[#1A1A2E] dark:text-white tracking-tight leading-none mb-2.5">{report.memberName}</p>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#FAFAFA] dark:bg-slate-800 border border-[#F4F3EF] dark:border-slate-700 rounded-lg">
                <Clock size={12} className="text-[#9B9BAD]" />
                <span className="text-[9px] font-bold text-[#64748B] dark:text-slate-400 uppercase tracking-widest">
                  {formatTime(report.checkInTime)} — {formatTime(report.checkOutTime)}
                </span>
              </div>
            </div>
          </div>

          {/* Core Metrics Palette */}
          <div className="flex items-center gap-3 flex-wrap flex-1 justify-center lg:justify-start">
            <StatBadge icon={Phone}    value={report.callsCount}          label="Dials"      color="text-[#3B82F6]" bg="bg-[#EFF6FF]" />
            <StatBadge icon={Eye}      value={report.profilesVisited}     label="Visits"     color="text-[#8B5CF6]" bg="bg-[#F5F3FF]" />
            <StatBadge icon={Share2}   value={report.profilesShared}      label="Shares"     color="text-[#0891B2]" bg="bg-[#ECFEFF]" />
            <StatBadge icon={Users}    value={report.candidatesContacted} label="Touches"    color="text-[#10B981]" bg="bg-[#ECFDF5]" />
            <StatBadge icon={Calendar} value={report.interviewsArranged}  label="Books"      color="text-[#F59E0B]" bg="bg-[#FFFBEB]" />
          </div>

          {/* Operational Status */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <div className="flex items-center gap-2">
              {report.workHours > 0 && (
                <div className="inline-flex px-3 py-2 bg-[#F8FAFF] border border-[#EEF2FB] rounded-xl flex items-center justify-center">
                  <span className="text-[10px] font-bold text-[#1B4DA0] tracking-widest uppercase">
                    {report.workHours} HRS Active
                  </span>
                </div>
              )}
              <div className={`inline-flex px-3 py-2 rounded-xl flex items-center gap-1.5 ${mc.bg}`}>
                <MoodIcon size={14} className={mc.color} />
                <span className={`text-[9px] font-bold tracking-[0.15em] uppercase ${mc.color}`}>{mc.label}</span>
              </div>
            </div>
            <button
              onClick={(e) => { e.stopPropagation(); onComment(report); }}
              className={`flex items-center gap-2 px-5 py-3 rounded-[16px] text-[10px] font-bold uppercase tracking-widest transition-all shadow-sm ${
                report.headComment 
                  ? 'bg-[#1B4DA0] text-white shadow-blue-500/20 hover:bg-[#153e82]' 
                  : 'bg-white border border-[#F4F3EF] text-[#9B9BAD] hover:bg-[#F8FAFF] hover:text-[#1A1A2E] hover:border-[#EEF2FB]'
              }`}
            >
              <MessageSquare size={14} />
              {report.headComment ? 'Edit Intel' : 'Log Intel'}
            </button>
          </div>
        </div>
      </div>

      {/* Expanded Metrics Area */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-t border-[#F4F3EF] dark:border-slate-800 bg-[#FAFAFA]/50 dark:bg-slate-900/50 relative z-10 rounded-b-[32px]"
          >
            <div className="p-8 grid lg:grid-cols-2 gap-8">
              {report.summary && (
                <div className="bg-white dark:bg-slate-900 p-8 rounded-[24px] border border-[#F4F3EF] dark:border-slate-800 hover:shadow-lg transition-all duration-300">
                  <p className="text-[10px] font-bold text-[#9B9BAD] uppercase tracking-[0.15em] mb-3">Field Action Summary</p>
                  <p className="text-[14px] font-medium text-[#1A1A2E] dark:text-white leading-relaxed">{report.summary}</p>
                </div>
              )}
              
              {Array.isArray(report.tasksCompleted) && report.tasksCompleted.length > 0 && (
                <div className="bg-white dark:bg-slate-900 p-8 rounded-[24px] border border-[#F4F3EF] dark:border-slate-800 hover:shadow-lg transition-all duration-300">
                  <p className="text-[10px] font-bold text-[#9B9BAD] uppercase tracking-[0.15em] mb-4">Tactical Objectives Hit</p>
                  <div className="space-y-4">
                    {report.tasksCompleted.map((t, i) => (
                      <div key={i} className="flex items-start gap-4 p-3 bg-[#FAFAFA] dark:bg-slate-800/50 rounded-xl">
                        <CheckCircle2 size={18} className="text-[#10B981] flex-shrink-0" />
                        <p className="text-[13px] font-bold text-[#1A1A2E] dark:text-white leading-tight">{t}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {report.blockers && (
                <div className="bg-white dark:bg-amber-900/10 p-8 rounded-[24px] border border-[#FEF3C7] dark:border-amber-900 lg:col-span-2 shadow-sm hover:shadow-lg transition-all">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 rounded-lg bg-[#FEF3C7] flex items-center justify-center text-[#F59E0B]">
                       <AlertCircle size={16} />
                    </div>
                    <p className="text-[11px] font-bold text-[#F59E0B] uppercase tracking-[0.15em]">Detected Blockers</p>
                  </div>
                  <p className="text-[14px] font-bold text-[#B45309] dark:text-amber-500 leading-relaxed ml-10">{report.blockers}</p>
                </div>
              )}

              {report.headComment && (
                <div className="bg-[#1B4DA0] dark:bg-slate-800 p-8 rounded-[24px] border border-[#1B4DA0] dark:border-slate-700 lg:col-span-2 shadow-lg shadow-blue-900/10 text-white relative overflow-hidden group/intel">
                  <div className="flex items-center gap-2 mb-4 relative z-10">
                    <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center text-white backdrop-blur-sm">
                      <ShieldCheck size={16} />
                    </div>
                    <p className="text-[11px] font-bold text-blue-100 uppercase tracking-[0.2em]">
                      Command Intel Logged {report.headCommentBy && `• BY ${report.headCommentBy}`}
                    </p>
                  </div>
                  <p className="text-[15px] font-medium text-white leading-relaxed ml-10 relative z-10">{report.headComment}</p>
                  
                  {/* Intel Card Glow */}
                  <div className="absolute right-0 top-0 w-64 h-64 bg-white/10 rounded-full blur-3xl group-hover/intel:bg-white/20 transition-all pointer-events-none -translate-y-1/2 translate-x-1/4" />
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Atmospheric Hover Glow (Behind everything) */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] bg-[#1B4DA0]/0 rounded-full blur-[80px] group-hover:bg-[#1B4DA0]/5 transition-colors duration-1000 pointer-events-none -z-10" />
    </div>
  );
};

const TeamMISReportsTab = () => {
  const [reports, setReports]         = useState([]);
  const [loading, setLoading]         = useState(true);
  const [selectedDate, setSelectedDate] = useState(getLocalISODate());
  const [selectedKAM, setSelectedKAM] = useState('all');
  const [commentTarget, setCommentTarget] = useState(null);
  const [toast, setToast]             = useState(null);
  const dateInputRef = useRef(null);

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
      if (err?.message?.toLowerCase().includes('authorization') || err?.message?.toLowerCase().includes('token') || err?.status === 401) {
        showToast('Session expired. Please login again.', 'error');
      } else {
        showToast(err.message || 'Failed to fetch MIS reports', 'error');
      }
    } finally {
      setLoading(false);
    }
  }, [selectedDate, showToast]);

  useEffect(() => { fetchReports(); }, [fetchReports]);

  const filteredReports = useMemo(() => {
    if (selectedKAM === 'all') return reports;
    return reports.filter(r => (r.memberName || '').toLowerCase() === selectedKAM.toLowerCase());
  }, [reports, selectedKAM]);

  // Totals row calculation
  const totals = filteredReports.reduce((acc, r) => ({
    callsCount:          acc.callsCount          + (r.callsCount          || 0),
    profilesVisited:     acc.profilesVisited     + (r.profilesVisited     || 0),
    profilesShared:      acc.profilesShared      + (r.profilesShared      || 0),
    candidatesContacted: acc.candidatesContacted + (r.candidatesContacted || 0),
    interviewsArranged:  acc.interviewsArranged  + (r.interviewsArranged  || 0),
  }), { callsCount: 0, profilesVisited: 0, profilesShared: 0, candidatesContacted: 0, interviewsArranged: 0 });

  const formattedDate = new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-IN', {
    weekday: 'long', day: '2-digit', month: 'long', year: 'numeric',
  });

  const openDatePicker = () => {
    if (!dateInputRef.current) return;
    if (typeof dateInputRef.current.showPicker === 'function') {
      dateInputRef.current.showPicker();
      return;
    }
    dateInputRef.current.focus();
    dateInputRef.current.click();
  };

  const downloadMISCSV = () => {
    const header = [
      'Date', 'Member Name', 'Calls', 'Profiles Visited', 'Profiles Shared', 
      'Candidates Contacted', 'Interviews Arranged', 'Work Hours', 'Mood', 
      'Summary', 'Blockers', 'Head Comment'
    ];
    const escapeCSV = (value) => `"${String(value ?? '').replace(/"/g, '""')}"`;

    const rows = filteredReports.map((report) => [
      selectedDate, report.memberName || '', report.callsCount || 0,
      report.profilesVisited || 0, report.profilesShared || 0,
      report.candidatesContacted || 0, report.interviewsArranged || 0,
      report.workHours || 0, report.mood || '', report.summary || '',
      report.blockers || '', report.headComment || ''
    ]);

    rows.push([
      selectedDate, 'TOTAL', totals.callsCount, totals.profilesVisited,
      totals.profilesShared, totals.candidatesContacted, totals.interviewsArranged,
      '', '', '', '', ''
    ]);

    const csvContent = [header, ...rows].map((row) => row.map(escapeCSV).join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `team-mis-${selectedDate}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    showToast('MIS Report Acquired');
  };

  return (
    <div className="p-0 min-h-screen bg-[#FDFDFD] dark:bg-slate-950 text-left">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&family=Syne:wght@400;500;600;700;800&display=swap');
        .font-syne { font-family: 'Syne', sans-serif !important; }
        .font-jakarta { font-family: 'Plus Jakarta Sans', sans-serif !important; }
      `}</style>

      <div className="w-full" style={{ fontFamily: "'Calibri', sans-serif" }}>
        <AnimatePresence>
          {toast && <Toast message={toast.message} type={toast.type} />}
        </AnimatePresence>

        {/* Header */}
        <div className="mb-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 text-left">
          <div>
            <h1 className="text-3xl font-bold font-syne text-[#1A1A2E] dark:text-white tracking-tight leading-none mb-1">Team MIS Reports</h1>
            <p className="text-sm font-medium text-[#9B9BAD] mt-1">Daily performance metric summary & team intelligence</p>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative group/filter">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9B9BAD] group-hover/filter:text-[#1B4DA0] transition-colors pointer-events-none">
                <Users size={14} />
              </div>
              <select
                value={selectedKAM}
                onChange={(e) => setSelectedKAM(e.target.value)}
                className="bg-[#FAFAFA] dark:bg-slate-900 border border-[#F4F3EF] dark:border-slate-800 rounded-xl pl-10 pr-10 py-3 text-[10px] font-bold uppercase tracking-widest text-[#1A1A2E] dark:text-white outline-none cursor-pointer shadow-sm hover:bg-[#F8FAFF] hover:border-[#1B4DA0]/20 transition-all appearance-none"
              >
                <option value="all">All Members</option>
                {[...new Set(reports.map(r => r.memberName))].filter(Boolean).map(name => (
                  <option key={name} value={name}>{name}</option>
                ))}
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9B9BAD] pointer-events-none">
                <ChevronDown size={14} />
              </div>
            </div>
            <button
              onClick={downloadMISCSV}
              disabled={loading || reports.length === 0}
              className="w-11 h-11 flex items-center justify-center rounded-xl bg-white dark:bg-slate-900 border border-[#F4F3EF] dark:border-slate-800 text-[#9B9BAD] hover:text-[#1B4DA0] hover:bg-[#F8FAFF] transition-all shadow-sm active:scale-95 disabled:opacity-50"
              title="Download CSV"
            >
              <Download size={16} />
            </button>
            <button
              onClick={fetchReports}
              disabled={loading}
              className="w-11 h-11 flex items-center justify-center rounded-xl bg-white dark:bg-slate-900 border border-[#F4F3EF] dark:border-slate-800 text-[#9B9BAD] hover:text-[#1B4DA0] hover:bg-[#F8FAFF] transition-all shadow-sm active:scale-95 disabled:opacity-50"
              title="Refresh"
            >
              <RefreshCw size={16} className={loading ? 'animate-spin text-[#1B4DA0]' : ''} />
            </button>
            <button
              type="button"
              onClick={openDatePicker}
              className="relative flex items-center gap-2 px-6 py-3 bg-[#1B4DA0] text-white rounded-xl text-[11px] font-bold uppercase tracking-widest hover:bg-[#153e82] transition-all shadow-lg shadow-blue-500/20 active:scale-95 h-[42px]"
            >
              <Calendar size={14} />
              <span>{formattedDate}</span>
              <input
                ref={dateInputRef}
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
            </button>
          </div>
        </div>

        {/* Main Timeline Container */}
        <div className="bg-[#FFFFFF] dark:bg-slate-900 rounded-[32px] border border-[#F4F3EF] dark:border-slate-800 shadow-sm relative overflow-hidden text-left">
          
          {/* Timeline Header */}
          <div className="p-8 flex justify-between items-center relative z-10 border-b border-[#F4F3EF] dark:border-slate-800 bg-[#FAFAFA]/50 dark:bg-slate-900/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#1B4DA0] rounded-xl flex items-center justify-center text-white shadow-xl shadow-blue-900/20">
                <BarChart2 size={20} strokeWidth={2} />
              </div>
              <h3 className="text-xl font-bold font-syne text-[#1A1A2E] dark:text-white tracking-tight">Performance Timeline</h3>
            </div>
            <div className="flex items-center gap-4">
              {!loading && (
                <span className="inline-flex px-3 py-1.5 bg-[#ECFDF5] text-[#10B981] rounded-lg text-[9px] font-bold tracking-[0.15em] uppercase">
                  {filteredReports.length} Active Logs
                </span>
              )}
              <div className="flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-slate-800 border border-[#F4F3EF] dark:border-slate-700 rounded-full shadow-sm">
                <div className="w-1.5 h-1.5 rounded-full bg-[#10B981] shadow-[0_0_8px_#10B981]" />
                <span className="text-[10px] font-bold text-[#64748B] dark:text-slate-400 uppercase tracking-widest">Live Feed</span>
              </div>
            </div>
          </div>

          {/* Totals Band */}
          {!loading && filteredReports.length > 0 && (
            <div className="px-8 py-6 border-b border-[#F4F3EF] dark:border-slate-800 bg-white dark:bg-slate-900/50 relative z-10">
              <div className="grid grid-cols-2 md:grid-cols-5 divide-x divide-[#F4F3EF] dark:divide-slate-800">
                {[
                  { label: 'Outbound Dials', value: totals.callsCount,          color: 'text-[#3B82F6]' },
                  { label: 'Profiles Visited',value: totals.profilesVisited,     color: 'text-[#8B5CF6]' },
                  { label: 'Network Shares',  value: totals.profilesShared,      color: 'text-[#0891B2]' },
                  { label: 'Talent Touches',  value: totals.candidatesContacted, color: 'text-[#10B981]' },
                  { label: 'Verified Bookings',value: totals.interviewsArranged,  color: 'text-[#F59E0B]' },
                ].map((m, idx) => (
                  <div key={m.label} className="px-4 lg:px-6 text-center">
                    <p className={`text-[28px] font-black font-syne leading-none mb-1 ${m.color}`}>{m.value}</p>
                    <p className="text-[9px] font-bold text-[#9B9BAD] uppercase tracking-[0.15em]">{m.label}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Vertical Bridge Line */}
          <div className="absolute left-[88px] lg:left-[108px] top-[200px] bottom-[40px] w-px bg-[#F4F3EF] dark:bg-slate-800 pointer-events-none hidden sm:block" />

          {/* Timeline Content */}
          <div className="px-8 py-12 space-y-10 relative z-10">
            {loading ? (
              <div className="space-y-6">
                {Array(3).fill(0).map((_, i) => (
                  <div key={i} className="h-32 rounded-[24px] bg-[#FAFAFA] dark:bg-slate-900 animate-pulse" />
                ))}
              </div>
            ) : filteredReports.length === 0 ? (
              <div className="text-center py-32">
                <div className="w-24 h-24 bg-[#FAFAFA] dark:bg-slate-800 rounded-[32px] mx-auto flex items-center justify-center text-[#9B9BAD] mb-8 rotate-12">
                  <Activity size={40} strokeWidth={1.5} />
                </div>
                <p className="text-[20px] font-bold font-syne text-[#1A1A2E] dark:text-white capitalize mb-2">Radar Silence Mode</p>
                <p className="text-[11px] font-bold text-[#9B9BAD] uppercase tracking-[0.2em]">
                  {selectedKAM !== 'all' ? `No report logs found for ${selectedKAM}` : 'Awaiting operational intel for this specific temporal dimension.'}
                </p>
              </div>
            ) : (
              <AnimatePresence>
                {filteredReports.map((report, idx) => {
                  const mc = moodConfig[report.mood] || moodConfig.Good;
                  const MoodIcon = mc.icon;

                  return (
                    <motion.div
                      key={report.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.04 }}
                      className="flex items-start group relative text-left"
                    >
                      {/* Time Column */}
                      <div className="w-20 lg:w-28 flex-shrink-0 pt-5 text-right pr-6 lg:pr-8 hidden sm:block">
                        <span className="text-[9px] font-bold text-[#9B9BAD] uppercase tracking-[2px] leading-none">
                          {formatTime(report.checkInTime)}
                        </span>
                      </div>

                      {/* Avatar Marker */}
                      <div className="relative z-10 flex-shrink-0 hidden sm:block">
                        <div className="w-10 h-10 rounded-xl bg-[#1B4DA0] flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-blue-500/20 group-hover:scale-110 transition-transform duration-500">
                          {(report.memberName || '?').charAt(0).toUpperCase()}
                        </div>
                      </div>

                      {/* Report Card */}
                      <div className="ml-0 sm:ml-6 lg:ml-8 flex-1">
                        <ReportRow report={report} onComment={setCommentTarget} />
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            )}
          </div>
        </div>

        {/* Global Footer Branding */}
        <div className="mt-24 py-16 border-t border-[#F4F3EF] dark:border-slate-800 text-center space-y-3 opacity-50">
           <div className="w-1 h-1 bg-[#1B4DA0] rounded-full mx-auto mb-6" />
           <p className="text-[10px] font-bold text-[#9B9BAD] uppercase tracking-[0.5em]">Studio Minimalist Reporting Engine</p>
           <p className="text-[9px] font-bold text-[#9B9BAD] uppercase tracking-widest mt-1">Unified High-Fidelity Data Matrix V4.8</p>
        </div>

      </div>

      <AnimatePresence>
        {commentTarget && (
          <CommentModal
            report={commentTarget}
            onClose={() => setCommentTarget(null)}
            onSaved={() => {
              showToast('Intel Signal Successfully Registered!');
              fetchReports();
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default TeamMISReportsTab;
