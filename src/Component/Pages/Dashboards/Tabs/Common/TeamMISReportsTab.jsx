import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users, Phone, Eye, Share2, Calendar, Clock, MessageSquare, CheckCircle2,
  RefreshCw, Smile, Meh, Frown, Star, X, Send, AlertCircle, BarChart2,
  Download, Activity, ShieldCheck, MoreVertical, ChevronDown, Paperclip, FileText, Plus
} from 'lucide-react';
import { BASE_URL, getMISReports, getDepartmentMembers, addHeadComment, submitDailyReport, uploadMISAttachment } from '../../../service/api';
import { getLocalISODate } from '../../../Utilities/dateUtils';

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
};

const calcWorkHours = (checkIn, checkOut) => {
  if (!checkIn || !checkOut) return 0;
  const [h1, m1] = checkIn.split(':').map(Number);
  const [h2, m2] = checkOut.split(':').map(Number);
  const mins = (h2 * 60 + m2) - (h1 * 60 + m1);
  return mins > 0 ? parseFloat((mins / 60).toFixed(2)) : 0;
};

const MetricInput = ({ icon: Icon, label, sublabel, value, onChange, name }) => (
  <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-gray-100 dark:border-slate-800 shadow-sm">
    <div className="flex items-center gap-2 mb-3">
      <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 shadow-sm">
        <Icon className="w-4 h-4 text-[#0f172a] dark:text-white" />
      </div>
      <div className="text-left">
        <p className="text-xs font-semibold text-gray-700 dark:text-slate-300">{label}</p>
        {sublabel && <p className="text-[10px] text-gray-400 dark:text-slate-500">{sublabel}</p>}
      </div>
    </div>
    <input
      type="number" min="0" max="9999"
      value={value}
      onChange={(e) => onChange(name, e.target.value)}
      className="w-full text-2xl font-bold text-center rounded-lg border border-gray-200 dark:border-slate-700 py-2 focus:outline-none focus:ring-2 focus:ring-[#1B4DA0] text-[#0f172a] dark:text-white bg-white dark:bg-slate-800"
      placeholder="0"
    />
  </div>
);

const moodConfig = {
  Great: { icon: Star, color: 'text-[#10B981]', bg: 'bg-[#ECFDF5]', label: 'GREAT' },
  Good: { icon: Smile, color: 'text-[#3B82F6]', bg: 'bg-[#EFF6FF]', label: 'GOOD' },
  Okay: { icon: Meh, color: 'text-[#F59E0B]', bg: 'bg-[#FFFBEB]', label: 'OKAY' },
  Tough: { icon: Frown, color: 'text-[#EF4444]', bg: 'bg-[#FEF2F2]', label: 'TOUGH' },
};

const formatTime = (t) => {
  if (!t) return '—';
  const [h, m] = t.split(':').map(Number);
  const period = h >= 12 ? 'PM' : 'AM';
  const hour = h === 0 ? 12 : h > 12 ? h - 12 : h;
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
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

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

const ReportRow = ({ report, onComment, onViewAttachment }) => {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-[24px] border border-[#F4F3EF] dark:border-slate-800 shadow-sm hover:shadow-2xl transition-all duration-500 relative group text-left mb-4">
      <div className="p-4 lg:p-5 relative z-10">
        <div className="flex items-center justify-between flex-wrap gap-5">

          {/* Identity Block */}
          <div className="flex items-center gap-4 min-w-[200px]">
            <div className="w-12 h-12 rounded-[16px] flex items-center justify-center font-bold text-white text-lg flex-shrink-0 shadow-md shadow-blue-500/20"
              style={{ background: '#1B4DA0' }}>
              {(report.memberName || '?').charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="text-[18px] font-bold font-syne text-[#1A1A2E] dark:text-white tracking-tight leading-none mb-2">{report.memberName}</p>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#FAFAFA] dark:bg-slate-800 border border-[#F4F3EF] dark:border-slate-700 rounded-lg">
                <Clock size={10} className="text-[#9B9BAD]" />
                <span className="text-[9px] font-bold text-[#64748B] dark:text-slate-400 uppercase tracking-widest">
                  {formatTime(report.checkInTime)} — {formatTime(report.checkOutTime)}
                </span>
              </div>
            </div>
          </div>

          {/* Core Metrics Palette */}
          <div className="flex items-center gap-3 flex-wrap flex-1 justify-center lg:justify-end">
            <StatBadge icon={Phone} value={report.callsCount} label="Dials" color="text-[#3B82F6]" bg="bg-[#EFF6FF]" />
            <StatBadge icon={Eye} value={report.profilesVisited} label="Visits" color="text-[#3B82F6]" bg="bg-[#EFF6FF]" />
            <StatBadge icon={Share2} value={report.profilesShared} label="Shares" color="text-[#3B82F6]" bg="bg-[#EFF6FF]" />
            <StatBadge icon={Users} value={report.candidatesContacted} label="Touches" color="text-[#3B82F6]" bg="bg-[#EFF6FF]" />
            <StatBadge icon={Calendar} value={report.interviewsArranged} label="Books" color="text-[#3B82F6]" bg="bg-[#EFF6FF]" />

            {report.workHours > 0 && (
              <div className="inline-flex px-3 py-2 bg-[#EFF6FF] rounded-xl flex items-center justify-center border border-[#EFF6FF]">
                <span className="text-[10px] font-bold text-[#3B82F6] tracking-widest uppercase">
                  {report.workHours} HRS Active
                </span>
              </div>
            )}



            {/* Attachment Link */}
            {report.attachmentUrl && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onViewAttachment(report.attachmentUrl)}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl transition-all border border-blue-200"
                  title={`View ${report.attachmentName || 'Annex'}`}
                >
                  <Eye size={14} />
                  <span className="text-[10px] font-bold uppercase tracking-widest">View</span>
                </button>
                <a
                  href={report.attachmentUrl.startsWith('http') ? report.attachmentUrl : `${BASE_URL}${report.attachmentUrl.startsWith('/') ? '' : '/'}${report.attachmentUrl}`}
                  download
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-xl transition-all border border-emerald-200"
                  title={`Download ${report.attachmentName || 'Annex'}`}
                >
                  <Download size={14} />
                  <span className="text-[10px] font-bold uppercase tracking-widest">Download</span>
                </a>
              </div>
            )}
          </div>
        </div>

        {/* Dossier Intelligence Content */}
        <div className="mt-6 pt-6 border-t border-[#F4F3EF] dark:border-slate-800 grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-4">
            <div>
              <p className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-widest mb-2 flex items-center gap-1.5">
                <FileText size={12} /> Execution Summary
              </p>
              <p className="text-[13px] font-bold text-[#4B4B5E] dark:text-slate-300 leading-relaxed italic">
                "{report.summary || 'No summary provided'}"
              </p>
            </div>

            {/* Task Breakdown */}
            <div className="grid grid-cols-2 gap-4">
              {report.tasksCompleted?.length > 0 && (
                <div>
                  <p className="text-[9px] font-black text-emerald-600 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                    <CheckCircle2 size={10} /> Completed
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {report.tasksCompleted.map((t, i) => (
                      <span key={i} className="px-2 py-0.5 bg-emerald-50 text-emerald-700 text-[9px] font-bold rounded-md border border-emerald-100 uppercase tracking-tight">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {report.blockers && (
              <div className="p-3.5 rounded-xl bg-amber-50/50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/20">
                <p className="text-[9px] font-black text-amber-600 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                  <AlertCircle size={10} /> Operational Blockers
                </p>
                <p className="text-[12px] font-bold text-amber-800 dark:text-amber-400 leading-tight">
                  {report.blockers}
                </p>
              </div>
            )}
          </div>

          <div className="space-y-4">
            {report.headComment && (
              <div className="p-4 rounded-xl bg-blue-50/50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/20">
                <p className="text-[9px] font-black text-[#1B4DA0] dark:text-blue-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                  <ShieldCheck size={10} /> Head Command Intelligence
                </p>
                <p className="text-[12px] font-bold text-[#1B4DA0] dark:text-blue-300 italic leading-relaxed">
                  "{report.headComment}"
                </p>
                <div className="mt-2 flex items-center justify-between text-[8px] font-black uppercase tracking-widest opacity-40">
                  <span>By {report.headCommentBy || 'Head'}</span>
                  <span>{report.headCommentAt ? new Date(report.headCommentAt).toLocaleDateString() : ''}</span>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>

      {/* Atmospheric Hover Glow (Behind everything) */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] bg-[#1B4DA0]/0 rounded-full blur-[80px] group-hover:bg-[#1B4DA0]/5 transition-colors duration-1000 pointer-events-none -z-10" />
    </div>
  );
};


const PendingRow = ({ report }) => {
  return (
    <div className="bg-[#FFFDF9] dark:bg-slate-900 rounded-[24px] border border-[#F5E6C4] dark:border-slate-800 shadow-sm hover:shadow-md transition-all duration-300 relative group text-left mb-4">
      <div className="p-4 lg:p-5 relative z-10">
        <div className="flex items-center justify-between flex-wrap gap-5">
          {/* Identity Block */}
          <div className="flex items-center gap-4 min-w-[200px]">
            <div className="w-12 h-12 rounded-[16px] flex items-center justify-center font-bold text-[#D4AF37] text-lg flex-shrink-0 shadow-sm border border-[#F5E6C4]"
              style={{ background: 'linear-gradient(135deg, #FFFDF9 0%, #FFF9E6 100%)' }}>
              {(report.memberName || '?').charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="text-[18px] font-bold font-syne text-[#1A1A2E] dark:text-white tracking-tight leading-none mb-2">{report.memberName}</p>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#FFFBEB] dark:bg-amber-950/10 border border-[#FDE68A] dark:border-amber-900/20 rounded-lg">
                <Clock size={10} className="text-[#D4AF37]" />
                <span className="text-[9px] font-black text-[#D4AF37] uppercase tracking-widest">
                  MIS Submission Pending
                </span>
              </div>
            </div>
          </div>

          {/* Action or Info Block */}
          <div className="flex items-center gap-3">
            <span className="text-xs text-[#9B9BAD] font-bold uppercase tracking-wider">Awaiting submission for {report.date}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

const TeamMISReportsTab = ({
  department = 'HR Recruitment',
  notificationBell,
  isEmbedded = false,
  searchQuery = '',
  externalDate = null,
  statusFilter = 'ALL'
}) => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [internalDate, setInternalDate] = useState('All Dates');
  const selectedDate = externalDate !== null ? externalDate : internalDate;
  const setSelectedDate = externalDate !== null ? () => { } : setInternalDate;
  const [selectedKAM, setSelectedKAM] = useState('all');

  const [commentTarget, setCommentTarget] = useState(null);
  const [toast, setToast] = useState(null);
  const dateInputRef = useRef(null);

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [pendingFile, setPendingFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [viewAttachmentUrl, setViewAttachmentUrl] = useState(null);
  const ext = viewAttachmentUrl
  ?.split('.')
  .pop()
  ?.split('?')[0]
  ?.toLowerCase();

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
        tasksPlanned: form.tasksPlanned.split('\n').map(t => t.trim()).filter(Boolean),
        blockers: form.blockers,
        checkInTime: form.checkInTime || null,
        checkOutTime: form.checkOutTime || null,
        workHours,
        callsCount: parseInt(form.callsCount) || 0,
        profilesVisited: parseInt(form.profilesVisited) || 0,
        profilesShared: parseInt(form.profilesShared) || 0,
        candidatesContacted: parseInt(form.candidatesContacted) || 0,
        interviewsArranged: parseInt(form.interviewsArranged) || 0,
      };
      const res = await submitDailyReport(payload);

      if (pendingFile && res.report?.id) {
        try {
          await uploadMISAttachment(res.report.id, pendingFile);
        } catch (uploadErr) {
          console.error('File upload failed during submission:', uploadErr);
        }
      }

      showToast('MIS Report submitted successfully ✓');
      setShowForm(false);
      setForm(EMPTY_FORM);
      setPendingFile(null);
      fetchReports();
    } catch (err) {
      showToast(err.message || 'Failed to submit report', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  }, []);

  const fetchReports = useCallback(async () => {
    try {
      setLoading(true);
      const params = { department };
      if (selectedDate !== 'All Dates') {
        params.date = selectedDate;
      }

      let apiReports = [];
      try {
        const res = await getMISReports(params);
        apiReports = res.reports || [];
      } catch (err) {
        console.error("Failed to fetch MIS reports:", err);
      }

      let combined = [];

      if (selectedDate !== 'All Dates') {
        let members = [];
        try {
          const memRes = await getDepartmentMembers({ department });
          members = memRes.members || memRes || [];
          if (!Array.isArray(members) && memRes && Array.isArray(memRes.data)) {
            members = memRes.data;
          }
        } catch (err) {
          console.error("Failed to fetch department members:", err);
        }

        if (Array.isArray(members) && members.length > 0) {
          const activeReports = apiReports.map(apiRep => ({ ...apiRep, status: 'Active' }));
          const pendingReports = [];

          members.forEach(member => {
            const hasSubmitted = apiReports.some(apiRep =>
              apiRep.memberId === member.id ||
              (apiRep.memberName || '').toLowerCase().trim() === (member.name || '').toLowerCase().trim()
            );
            if (!hasSubmitted) {
              pendingReports.push({
                id: `pending_${member.id}_${selectedDate}`,
                date: selectedDate,
                memberName: member.name,
                memberId: member.id,
                department: department,
                status: 'Pending'
              });
            }
          });

          combined = [...activeReports, ...pendingReports];
        } else {
          combined = apiReports.map(apiRep => ({ ...apiRep, status: 'Active' }));
        }
      } else {
        combined = apiReports.map(apiRep => ({ ...apiRep, status: 'Active' }));
      }

      combined.sort((a, b) => new Date(b.date || b.createdAt) - new Date(a.date || a.createdAt));
      setReports(combined);
    } catch (err) {
      if (err?.message?.toLowerCase().includes('authorization') || err?.message?.toLowerCase().includes('token') || err?.status === 401) {
        showToast('Session expired. Please login again.', 'error');
      } else {
        showToast(err.message || 'Failed to fetch MIS reports', 'error');
      }
      setReports([]);
    } finally {
      setLoading(false);
    }
  }, [selectedDate, showToast, department]);

  useEffect(() => { fetchReports(); }, [fetchReports]);

  const filteredReports = useMemo(() => {
    let result = reports;
    if (selectedKAM !== 'all') {
      result = result.filter(r => (r.memberName || '').toLowerCase() === selectedKAM.toLowerCase());
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(r =>
        (r.memberName || '').toLowerCase().includes(q) ||
        (r.summary || '').toLowerCase().includes(q) ||
        (r.headComment || '').toLowerCase().includes(q)
      );
    }
    if (statusFilter && statusFilter !== 'ALL') {
      if (statusFilter === 'SUBMITTED') {
        result = result.filter(r => r.status === 'Active');
      } else if (statusFilter === 'PENDING') {
        result = result.filter(r => r.status === 'Pending');
      }
    }
    return result;
  }, [reports, selectedKAM, searchQuery, statusFilter]);

  // Totals row calculation
  const totals = filteredReports.reduce((acc, r) => {
    if (r.status === 'Pending') return acc;
    return {
      callsCount: acc.callsCount + (r.callsCount || 0),
      profilesVisited: acc.profilesVisited + (r.profilesVisited || 0),
      profilesShared: acc.profilesShared + (r.profilesShared || 0),
      candidatesContacted: acc.candidatesContacted + (r.candidatesContacted || 0),
      interviewsArranged: acc.interviewsArranged + (r.interviewsArranged || 0),
    };
  }, { callsCount: 0, profilesVisited: 0, profilesShared: 0, candidatesContacted: 0, interviewsArranged: 0 });

  const formattedDate = selectedDate === 'All Dates'
    ? 'All Dates'
    : new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-IN', {
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
        {!isEmbedded && (
          <div className="mb-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 text-left">
            <div>
              <h1 className="text-3xl font-bold font-syne text-[#1A1A2E] dark:text-white tracking-tight leading-none mb-1">Team MIS Reports</h1>
            </div>

            <div className="flex items-center gap-3">
              {notificationBell}
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
                  {[...new Set(reports.map(r => r.memberName))].filter(Boolean).sort().map(name => (
                    <option key={name} value={name}>{name}</option>
                  ))}
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9B9BAD] pointer-events-none">
                  <ChevronDown size={14} />
                </div>
              </div>
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
                  value={selectedDate === 'All Dates' ? '' : selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
              </button>
              {/* Removed clear date button */}
              <button
                onClick={openForm}
                className="flex items-center gap-2 px-6 py-2.5 bg-[#1B4DA0] text-white rounded-2xl text-sm font-bold shadow-xl shadow-blue-500/20 hover:bg-[#153e82] transition-all active:scale-95 whitespace-nowrap"
              >
                <Plus size={18} />
                Add MIS
              </button>
            </div>
          </div>
        )}

        {/* Main Timeline Container */}
        <div className="bg-[#FFFFFF] dark:bg-slate-900 rounded-[32px] border border-[#F4F3EF] dark:border-slate-800 shadow-sm relative overflow-hidden text-left">

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
                        <span className="text-[9px] font-bold text-[#9B9BAD] uppercase tracking-[2px] leading-none block">
                          {report.status === 'Pending' ? '——' : formatTime(report.checkInTime)}
                        </span>
                        {selectedDate === 'All Dates' && (
                          <span className="text-[8px] font-black text-[#1B4DA0] uppercase tracking-tighter mt-1 block">
                            {report.date}
                          </span>
                        )}
                      </div>

                      {/* Avatar Marker */}
                      <div className="relative z-10 flex-shrink-0 hidden sm:block">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm shadow-lg group-hover:scale-110 transition-transform duration-500 ${report.status === 'Pending'
                          ? 'bg-gradient-to-tr from-[#FFFDF9] to-[#FFF9E6] text-[#D4AF37] border border-[#F5E6C4]'
                          : 'bg-[#1B4DA0] text-white shadow-blue-500/20'
                          }`}>
                          {(report.memberName || '?').charAt(0).toUpperCase()}
                        </div>
                      </div>

                      {/* Report Card */}
                      <div className="ml-0 sm:ml-6 lg:ml-8 flex-1">
                        {report.status === 'Pending' ? (
                          <PendingRow report={report} />
                        ) : (
                          <ReportRow
                            report={report}
                            onComment={setCommentTarget}
                            onViewAttachment={(url) => setViewAttachmentUrl(url.startsWith('http') ? url : `${BASE_URL}${url.startsWith('/') ? '' : '/'}${url}`)}
                          />
                        )}
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

      {/* Add MIS Form Modal */}
      {showForm && createPortal(
        <div className="fixed inset-0 z-[9999] isolation-auto font-jakarta text-left">
          <AnimatePresence>
            {showForm && (
              <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="fixed inset-0 flex items-center justify-center p-4"
                style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(8px)' }}
                onClick={() => setShowForm(false)}
              >
                <motion.div
                  initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }}
                  className="bg-white dark:bg-slate-900 rounded-[32px] w-full max-w-2xl shadow-2xl overflow-hidden"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="max-h-[92vh] overflow-y-auto custom-scrollbar">
                    <div className="sticky top-0 z-10 bg-white dark:bg-slate-900 px-6 pt-6 pb-4 border-b border-gray-100 dark:border-slate-800 flex items-center justify-between rounded-t-3xl">
                      <div>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">Submit Daily MIS Report</h3>
                        <p className="text-sm text-gray-500 mt-0.5">{new Date().toLocaleDateString('en-IN', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })}</p>
                      </div>
                      <button onClick={() => setShowForm(false)} className="p-2 rounded-xl hover:bg-red-50 hover:text-red-500 transition-colors">
                        <X className="w-5 h-5 dark:text-slate-400" />
                      </button>
                    </div>

                    <form onSubmit={handleSubmit} className="px-6 py-5 space-y-6">

                      <div>
                        <p className="text-sm font-bold text-gray-700 dark:text-slate-300 mb-3">
                          Today's KPI Numbers
                        </p>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                          <MetricInput icon={Phone} label="Calls Made" sublabel="Total calls made" name="callsCount" value={form.callsCount} onChange={handleFieldChange} />
                          <MetricInput icon={Eye} label="Leads" sublabel="New leads today" name="profilesVisited" value={form.profilesVisited} onChange={handleFieldChange} />
                          <MetricInput icon={Calendar} label="Meetings" sublabel="Scheduled today" name="profilesShared" value={form.profilesShared} onChange={handleFieldChange} />
                          <MetricInput icon={FileText} label="Proposals" sublabel="Proposals sent" name="candidatesContacted" value={form.candidatesContacted} onChange={handleFieldChange} />
                          <MetricInput icon={CheckCircle2} label="Deals" sublabel="Closed today" name="interviewsArranged" value={form.interviewsArranged} onChange={handleFieldChange} />
                        </div>
                      </div>

                      <div className="space-y-4">
                        <p className="text-sm font-bold text-gray-700 dark:text-slate-300">
                          Daily Summary
                        </p>
                        <div>
                          <label className="block text-xs font-medium text-gray-600 dark:text-slate-400 mb-1">Summary / Notes <span className="text-red-500">*</span></label>
                          <textarea value={form.summary} onChange={(e) => handleFieldChange('summary', e.target.value)} rows={2}
                            className="w-full px-3 py-2.5 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1B4DA0] resize-none dark:text-white"
                            placeholder="Brief overview of what you did today..." />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-600 dark:text-slate-400 mb-1">Tasks Completed <span className="text-[10px] text-gray-400">(one per line)</span></label>
                          <textarea value={form.tasksCompleted} onChange={(e) => handleFieldChange('tasksCompleted', e.target.value)} rows={3}
                            className="w-full px-3 py-2.5 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1B4DA0] resize-none dark:text-white"
                            placeholder={"Called Ravi for Sr. Developer role\nShared 3 profiles to TechCorp"} />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-600 dark:text-slate-400 mb-1">Plans for Tomorrow</label>
                          <textarea value={form.tasksPlanned} onChange={(e) => handleFieldChange('tasksPlanned', e.target.value)} rows={2}
                            className="w-full px-3 py-2.5 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1B4DA0] resize-none dark:text-white"
                            placeholder={"Follow up on TechCorp shortlist\nSource 5 profiles for Finance role"} />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-600 dark:text-slate-400 mb-1">Blockers / Issues</label>
                          <input type="text" value={form.blockers} onChange={(e) => handleFieldChange('blockers', e.target.value)}
                            className="w-full px-3 py-2.5 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1B4DA0] dark:text-white"
                            placeholder="Any issues? e.g. Client not responding, JD unclear..." />
                        </div>

                        {/* Document Attachment Field */}
                        <div>
                          <label className="block text-xs font-medium text-gray-600 dark:text-slate-400 mb-2">
                            Document Attachment (Excel/PDF)
                          </label>
                          <div className="flex items-center gap-3">
                            <label className="flex-1 flex items-center gap-3 px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 transition-all group">
                              <Paperclip className={`w-4 h-4 ${pendingFile ? 'text-green-600' : 'text-slate-400 group-hover:text-blue-500'}`} />
                              <span className={`text-xs font-medium truncate ${pendingFile ? 'text-green-700 dark:text-green-400' : 'text-slate-500 dark:text-slate-400'}`}>
                                {pendingFile ? pendingFile.name : 'Click to attach tracker / document'}
                              </span>
                              <input
                                type="file"
                                className="hidden"
                                accept=".xlsx, .xls, .pdf, .doc, .docx"
                                onChange={(e) => setPendingFile(e.target.files[0])}
                              />
                            </label>
                            {pendingFile && (
                              <button
                                type="button"
                                onClick={() => setPendingFile(null)}
                                className="p-2.5 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/40 transition-all"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="pt-4 flex items-center justify-end gap-3 sticky bottom-0 bg-white dark:bg-slate-900 py-4 border-t border-gray-100 dark:border-slate-800">
                        <button type="button" onClick={() => setShowForm(false)} className="px-5 py-2.5 text-sm font-bold text-gray-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-xl transition-all">Cancel</button>
                        <button type="submit" disabled={submitting} className="flex items-center gap-2 px-6 py-2.5 bg-[#1B4DA0] text-white rounded-xl text-sm font-bold shadow-xl shadow-blue-500/20 hover:bg-[#153e82] transition-all active:scale-95 disabled:opacity-70">
                          {submitting ? 'Submitting...' : 'Submit Report'} <Send size={16} />
                        </button>
                      </div>
                    </form>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>,
        document.body
      )}

      {/* Document Viewer Modal */}
      {viewAttachmentUrl && createPortal(
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-[#1A1A2E]/60 backdrop-blur-md"
            onClick={() => setViewAttachmentUrl(null)}
          />
          <motion.div
            initial={{ scale: 0.95, y: 20, opacity: 0 }} animate={{ scale: 1, y: 0, opacity: 1 }} exit={{ scale: 0.95, y: 20, opacity: 0 }}
            className="bg-white dark:bg-slate-900 rounded-[24px] w-full max-w-5xl h-[85vh] shadow-2xl overflow-hidden relative z-10 flex flex-col"
          >
           
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-slate-800 bg-[#FAFAFA] dark:bg-slate-900">
              <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-widest">Document Viewer</h3>
              <button onClick={() => setViewAttachmentUrl(null)} className="p-2 rounded-xl hover:bg-red-50 hover:text-red-500 transition-colors">
                <X className="w-5 h-5 dark:text-slate-400" />
              </button>
            </div>
             <div className="flex-1 bg-slate-100 dark:bg-slate-950 p-2 relative">

                  {['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext) ? (

                    <img
                      src={viewAttachmentUrl}
                      className="w-full h-full object-contain rounded-xl"
                      alt="attachment"
                    />

                  ) : ext === 'pdf' ? (

                    <iframe
                      src={viewAttachmentUrl}
                      className="w-full h-full rounded-xl border-none"
                      title="PDF Viewer"
                    />

                  ) : ['doc', 'docx', 'xls', 'xlsx'].includes(ext) ? (

                    <iframe
                      src={`https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(viewAttachmentUrl)}`}
                      className="w-full h-full rounded-xl border-none"
                      title="Office Viewer"
                    />

                  ) : (

                    <iframe
                      src={viewAttachmentUrl}
                      className="w-full h-full rounded-xl border-none"
                      title="Document Viewer"
                    />

                  )}

                </div>
          </motion.div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default TeamMISReportsTab;
