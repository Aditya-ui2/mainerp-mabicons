import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, ChevronDown, Plus, Send, Phone, Eye, Share2, Users, Calendar, Clock, X, FileText, CheckCircle, AlertCircle, Paperclip, ChevronRight
} from "lucide-react";
import { submitDailyReport, getMyReports } from '../../../service/api';
import { getLocalISODate } from '../../../Utilities/dateUtils';

const SHIFT_START = '09:00';
const SHIFT_END = '18:30';


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

const MOCK_REPORTS = [
  {
    id: 'mock-0',
    date: new Date().toISOString().split('T')[0], // Today
    checkInTime: '09:00',
    checkOutTime: '11:58',
    workHours: 2.9,
    callsCount: 15,
    profilesVisited: 40,
    profilesShared: 3,
    candidatesContacted: 10,
    interviewsArranged: 1,
    summary: 'Morning progress: Focused on interview scheduling and initial candidate screening.',
    tasksCompleted: ['Scheduled 2 interviews', 'Initial resume screening'],
    tasksPlanned: ['Follow up with hiring managers'],
    blockers: '',
    headCommentBy: 'Manju'
  },
  {
    id: 'mock-1',
    date: new Date(Date.now() - 86400000).toISOString().split('T')[0], // Yesterday
    checkInTime: '09:05',
    checkOutTime: '18:45',
    workHours: 9.6,
    callsCount: 45,
    profilesVisited: 120,
    profilesShared: 12,
    candidatesContacted: 28,
    interviewsArranged: 4,
    summary: 'Productive day focusing on the Senior React Developer role. Shortlisted 5 solid candidates.',
    tasksCompleted: ['Screened 15 candidates', 'Client meeting for JD sync', 'Updated Recruitment Tracker'],
    tasksPlanned: ['Focus on Backend roles', 'Interview scheduling for tomorrow'],
    blockers: 'None',
    headComment: 'Excellent performance today, keep it up!',
    headCommentBy: 'Manju'
  },
  {
    id: 'mock-2',
    date: new Date(Date.now() - 172800000).toISOString().split('T')[0], // 2 days ago
    checkInTime: '09:15',
    checkOutTime: '18:15',
    workHours: 9.0,
    callsCount: 38,
    profilesVisited: 95,
    profilesShared: 8,
    candidatesContacted: 22,
    interviewsArranged: 2,
    summary: 'Focused on sourcing for the Python lead role. Good traction on LinkedIn.',
    tasksCompleted: ['LinkedIn Sourcing', 'Resume screening', 'Feedback sync with KAM'],
    tasksPlanned: ['Sourcing for Java roles', 'Follow up with shortlisted candidates'],
    blockers: 'Portal access was slow in the morning',
    headComment: 'Good effort, try to increase candidate outreach tomorrow.',
    headCommentBy: 'Manju'
  }
];

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
  const shiftEndMins = toMins(SHIFT_END);
  const shiftDuration = shiftEndMins - shiftStartMins;
  const inMins = toMins(checkIn);
  const outMins = toMins(checkOut);
  const inPct = inMins ? Math.min(Math.max(((inMins - shiftStartMins) / shiftDuration) * 100, 0), 100) : null;
  const outPct = outMins ? Math.min(Math.max(((outMins - shiftStartMins) / shiftDuration) * 100, 0), 100) : null;
  const fillPct = (inPct !== null && outPct !== null) ? outPct - inPct : 0;
  const workHours = calcWorkHours(checkIn, checkOut);

  return (
    <div className="rounded-2xl p-5 text-white mb-6 shadow-md" style={{ background: '#0D47A1' }}>
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

const MetricInput = ({ icon: Icon, label, sublabel, value, onChange, name }) => (
  <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
    <div className="flex items-center gap-2 mb-3">
      <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-white border border-gray-100 shadow-sm">
        <Icon className="w-4 h-4 text-[#0f172a]" />
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
      className="w-full text-2xl font-bold text-center rounded-lg border border-gray-200 py-2 focus:outline-none focus:ring-2 focus:ring-[#0D47A1] text-[#0f172a]"
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
    {type === 'error' ? <AlertCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
    {message}
  </motion.div>
);

const ReportCard = ({ report, index, onClick }) => {
  const metrics = [
    { label: 'Calls', value: report.callsCount, icon: Phone, color: '#3b82f6', bg: '#dbeafe' },
    { label: 'Visited', value: report.profilesVisited, icon: Eye, color: '#8b5cf6', bg: '#ede9fe' },
    { label: 'Shared', value: report.profilesShared, icon: Share2, color: '#0891b2', bg: '#ecfeff' },
    { label: 'Contacted', value: report.candidatesContacted, icon: Users, color: '#10b981', bg: '#d1fae5' },
    { label: 'Interviews', value: report.interviewsArranged, icon: Calendar, color: '#f59e0b', bg: '#fef3c7' },
  ];
  const formattedDate = new Date(report.date + 'T00:00:00').toLocaleDateString('en-IN', {
    weekday: 'long', day: '2-digit', month: 'short', year: 'numeric',
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      onClick={onClick}
      className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden cursor-pointer hover:shadow-md hover:border-blue-100 transition-all group active:scale-[0.995]"
    >
      <div className="p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex flex-col items-start">
            <p className="font-bold text-[#0f172a] text-base transition-colors text-left">{formattedDate}</p>
            <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mt-0.5 text-left">
              {report.checkInTime ? `Timing: ${report.checkInTime} – ${report.checkOutTime || 'Present'}` : 'MIS Report Summary'}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          {metrics.map((m) => (
            <div
              key={m.label}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-[11px] font-bold shadow-sm bg-white border border-gray-100 text-[#0f172a] transition-all group-hover:scale-105 group-hover:border-blue-100"
            >
              <m.icon className="w-3.5 h-3.5 text-gray-900" />
              <span>{m.value ?? 0} {m.label}</span>
            </div>
          ))}
        </div>

      </div>
    </motion.div>
  );
};

const DailyReportTab = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [currentTime, setCurrentTime] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState('All Dates');
  const [kamFilter, setKamFilter] = useState('All KAMs');
  const [showDateDropdown, setShowDateDropdown] = useState(false);
  const [showKamDropdown, setShowKamDropdown] = useState(false);
  const dateInputRef = useRef(null);

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
      let apiReports = [];
      try {
        const res = await getMyReports();
        apiReports = res.reports || [];
      } catch (e) {
        console.warn('API Fetch failed, falling back to mock data:', e.message);
        // Silently ignore session expired for UI development as requested
      }

      const combined = [...apiReports];
      MOCK_REPORTS.forEach(mock => {
        if (!combined.some(r => r.date === mock.date)) {
          combined.push(mock);
        }
      });
      setReports(combined.sort((a, b) => new Date(b.date) - new Date(a.date)));
    } catch (err) {
      console.error('Critical error in fetchReports:', err);
    } finally {
      setLoading(false);
    }
  }, []);

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

  const todayStr = getLocalISODate();
  const yesterdayStr = new Date(new Date().setDate(new Date().getDate() - 1)).toISOString().split('T')[0];
  const todayReport = reports.find(r => r.date === todayStr);

  const filteredReports = useMemo(() => {
    return reports.filter(r => {
      const matchesSearch = !searchQuery ||
        (r.summary && r.summary.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (r.date && r.date.includes(searchQuery));

      let matchesDate = dateFilter === 'All Dates';
      if (dateFilter === 'Today') matchesDate = r.date === todayStr;
      else if (dateFilter === 'Yesterday') matchesDate = r.date === yesterdayStr;
      else if (dateFilter !== 'All Dates') matchesDate = r.date === dateFilter;

      const matchesKAM = kamFilter === 'All KAMs' || r.headCommentBy === kamFilter;

      return matchesSearch && matchesDate && matchesKAM;
    });
  }, [reports, searchQuery, dateFilter, kamFilter, todayStr, yesterdayStr]);

  const uniqueKams = useMemo(() => {
    return ['All KAMs', 'Jyoti', 'Manju', 'Priyanshi'];
  }, []);

  return (
    <div className="space-y-6" style={{ fontFamily: "'Calibri', sans-serif" }}>
      <AnimatePresence>
        {toast && <Toast message={toast.message} type={toast.type} />}
      </AnimatePresence>

      {/* Refined Header */}
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <div className="text-left">
          <h1 className="text-3xl font-bold text-[#1A1A2E] tracking-tight" style={{ fontFamily: "'Syne', sans-serif" }}>
            Daily MIS Report
          </h1>

        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={openForm}
            className="flex items-center gap-2 px-6 py-2.5 bg-[#1B4DA0] text-white rounded-2xl text-sm font-bold shadow-xl shadow-blue-500/20 hover:bg-[#153e82] transition-all active:scale-95"
          >
            <Plus size={18} />
            {todayReport ? 'Update Report' : 'Generate MIS Report'}
          </button>
        </div>
      </div>


      {/* Filter Bar Unification based on Job Openings style */}
      <div className="bg-white rounded-[24px] p-2 border border-[#F4F3EF] shadow-sm flex items-center gap-3 mb-8 flex-wrap">
        {/* Search Bar */}
        <div className="relative flex-1 group min-w-[200px]">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-[#9B9BAD] transition-colors" size={18} />
          <input
            type="text"
            placeholder="Search report logs by date or content..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#F4F3EF] border-none rounded-2xl py-3 pl-14 pr-5 text-sm font-medium focus:ring-2 focus:ring-[#F4F3EF] outline-none transition-all placeholder:text-[#9B9BAD]"
          />
        </div>

        {/* Date Filter */}
        <div className="relative">
          <input
            type="date"
            ref={dateInputRef}
            className="absolute opacity-0 pointer-events-none"
            onChange={(e) => {
              if (e.target.value) {
                setDateFilter(e.target.value);
                setShowDateDropdown(false);
              }
            }}
          />
          <button
            onClick={() => { setShowDateDropdown(!showDateDropdown); setShowKamDropdown(false); }}
            className="bg-[#F4F3EF] text-xs font-bold text-[#1A1A2E] rounded-xl pl-4 pr-10 py-3 outline-none border-0 cursor-pointer appearance-none min-w-[150px] uppercase tracking-widest flex items-center justify-between"
          >
            <span className="truncate">
              {dateFilter === 'All Dates' || dateFilter === 'Today' || dateFilter === 'Yesterday'
                ? dateFilter
                : new Date(dateFilter).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
            </span>
            <ChevronDown className={`ml-2 text-[#9B9BAD] transition-transform duration-300 ${showDateDropdown ? 'rotate-180' : ''}`} size={14} />
          </button>
          <AnimatePresence>
            {showDateDropdown && (
              <motion.div
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
                className="absolute top-full right-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-[#F4F3EF] py-2 z-[100]"
              >
                {['All Dates', 'Today', 'Yesterday', 'Custom Date'].map(opt => (
                  <button
                    key={opt}
                    onClick={() => {
                      if (opt === 'Custom Date') {
                        dateInputRef.current.showPicker();
                      } else {
                        setDateFilter(opt);
                        setShowDateDropdown(false);
                      }
                    }}
                    className={`w-full px-4 py-2.5 text-left text-xs font-bold transition-all uppercase tracking-widest ${dateFilter === opt ? 'bg-[#F4F3EF] text-[#1B4DA0]' : 'text-slate-600 hover:bg-[#F4F3EF]/50'}`}
                  >
                    {opt}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* KAM Filter */}
        <div className="relative">
          <button
            onClick={() => { setShowKamDropdown(!showKamDropdown); setShowDateDropdown(false); }}
            className="bg-[#F4F3EF] text-xs font-bold text-[#1A1A2E] rounded-xl pl-4 pr-10 py-3 outline-none border-0 cursor-pointer appearance-none min-w-[150px] uppercase tracking-widest flex items-center justify-between"
          >
            <span className="truncate">{kamFilter}</span>
            <ChevronDown className={`ml-2 text-[#9B9BAD] transition-transform duration-300 ${showKamDropdown ? 'rotate-180' : ''}`} size={14} />
          </button>
          <AnimatePresence>
            {showKamDropdown && (
              <motion.div
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
                className="absolute top-full right-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-[#F4F3EF] py-2 z-[100]"
              >
                {uniqueKams.map(kam => (
                  <button
                    key={kam}
                    onClick={() => { setKamFilter(kam); setShowKamDropdown(false); }}
                    className={`w-full px-4 py-2.5 text-left text-xs font-bold transition-all uppercase tracking-widest ${kamFilter === kam ? 'bg-[#F4F3EF] text-[#1B4DA0]' : 'text-slate-600 hover:bg-[#F4F3EF]/50'}`}
                  >
                    {kam}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Table Interface */}
      <div className="bg-white rounded-[32px] border border-[#F4F3EF] shadow-sm overflow-hidden mb-12">
        <div className="overflow-x-auto custom-scrollbar">
          <div className="min-w-[1000px]">
            {/* Table Header */}
            <div className="grid grid-cols-[2fr_100px_100px_100px_120px_120px_80px] gap-4 px-8 py-4 border-b border-[#F4F3EF] bg-transparent">
              <div className="text-[11px] font-bold text-[#94a3b8] uppercase tracking-widest text-left">Date / Timeline</div>
              {["Calls", "Visited", "Shared", "Candidates", "Interviews"].map((h, i) => (
                <div key={i} className="text-[11px] font-bold text-[#94a3b8] uppercase tracking-widest text-center">{h}</div>
              ))}
              <div className="text-[11px] font-bold text-[#94a3b8] uppercase tracking-widest text-right pr-4">Annex</div>
            </div>

            {loading ? (
              <div className="flex flex-col items-center justify-center py-40 gap-4">
                <div className="w-12 h-12 rounded-full border-4 border-[#1B4DA0]/20 border-t-[#1B4DA0] animate-spin" />
                <p className="text-[11px] font-bold uppercase tracking-widest text-[#9B9BAD]">Analyzing Performance Logs...</p>
              </div>
            ) : filteredReports.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-32 text-center">
                <FileText size={48} className="text-slate-200 mb-4" />
                <p className="text-[11px] font-bold text-[#9B9BAD] uppercase tracking-widest">No matching report logs found</p>
              </div>
            ) : (
              <div className="divide-y divide-[#F4F3EF]">
                {filteredReports.map((report) => {
                  const formattedDate = new Date(report.date + 'T00:00:00').toLocaleDateString('en-US', {
                    day: '2-digit', month: 'short', year: 'numeric',
                  });
                  return (
                    <div
                      key={report.id}
                      onClick={() => setSelectedReport(report)}
                      className="grid grid-cols-[2fr_100px_100px_100px_120px_120px_80px] gap-4 items-center px-8 py-3 border-b border-[#F4F3EF] last:border-0 hover:bg-[#F8FAFF] cursor-pointer transition-all group relative"
                    >
                      {/* Date & Shift */}
                      <div className="flex flex-col justify-center items-start py-1">
                        <p className="text-[14px] font-bold text-[#1A1A2E] text-left group-hover:text-[#1B4DA0] transition-colors">
                          {formattedDate}
                        </p>
                        <div className="flex items-center justify-start gap-1 mt-0.5 opacity-60">
                          <Clock size={10} className="text-[#9B9BAD]" />
                          <span className="text-[9px] font-bold text-[#9B9BAD] uppercase tracking-widest text-left">
                            {report.checkInTime ? `${report.checkInTime} – ${report.checkOutTime || 'Present'}` : 'MIS Summary'}
                          </span>
                        </div>
                      </div>

                      {/* Performance Metrics */}
                      <div className="text-center py-1">
                        <span className="text-[13px] font-bold text-[#475569]">{report.callsCount ?? 0}</span>
                      </div>
                      <div className="text-center py-1">
                        <span className="text-[13px] font-bold text-[#475569]">{report.profilesVisited ?? 0}</span>
                      </div>
                      <div className="text-center py-1">
                        <span className="text-[13px] font-bold text-[#475569]">{report.profilesShared ?? 0}</span>
                      </div>
                      <div className="text-center py-1">
                        <span className="text-[13px] font-bold text-[#475569]">{report.candidatesContacted ?? 0}</span>
                      </div>
                      <div className="text-center py-1">
                        <span className="text-[13px] font-bold text-[#475569]">{report.interviewsArranged ?? 0}</span>
                      </div>

                      {/* Action: Excel Attach */}
                      <div className="flex justify-end pr-2" onClick={e => e.stopPropagation()}>
                        <label className="w-8 h-8 rounded-lg bg-[#F4F3EF] flex items-center justify-center text-[#1B4DA0] hover:bg-[#1B4DA0] hover:text-white transition-all shadow-sm cursor-pointer active:scale-95">
                          <Paperclip size={14} />
                          <input
                            type="file"
                            className="hidden"
                            accept=".xlsx, .xls"
                            onChange={(e) => {
                              const file = e.target.files[0];
                              if (file) alert(`Excel file "${file.name}" attached successfully!`);
                            }}
                          />
                        </label>
                      </div>

                      {/* Chevron Indicator */}
                      <div className="absolute right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                        <ChevronRight size={14} className="text-[#9B9BAD]" />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {createPortal(
        <AnimatePresence>
          {selectedReport && (
            <div className="fixed inset-0 z-[10000] isolation-auto">
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-[#00000033] backdrop-blur-[6px]"
                onClick={() => setSelectedReport(null)}
              />

              {/* Sidebar Container */}
              <motion.div
                initial={{ x: '100%', opacity: 0.5 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: '100%', opacity: 0.5 }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="absolute top-0 right-0 h-full w-full max-w-[698px] bg-white shadow-[-20px_0_50px_rgba(0,0,0,0.1)] flex flex-col"
                style={{ fontFamily: '"Plus Jakarta Sans", sans-serif' }}
              >
                {/* Header */}
                <div className="p-8 bg-white border-b border-gray-100 flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-[#0f172a] tracking-tight">
                      {new Date(selectedReport.date + 'T00:00:00').toLocaleDateString('en-IN', {
                        weekday: 'long', day: '2-digit', month: 'long', year: 'numeric'
                      })}
                    </h2>
                  </div>
                  <button
                    onClick={() => setSelectedReport(null)}
                    className="p-3 rounded-2xl hover:bg-red-50 text-slate-400 hover:text-red-500 transition-all active:scale-95"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto p-8 space-y-8 bg-slate-50/50">
                  {/* Stats Grid */}
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">Performance Metrics</p>
                    <div className="grid grid-cols-2 gap-4">
                      {[
                        { label: 'Phone Calls', value: selectedReport.callsCount, icon: Phone },
                        { label: 'Profiles Visited', value: selectedReport.profilesVisited, icon: Eye },
                        { label: 'Profiles Shared', value: selectedReport.profilesShared, icon: Share2 },
                        { label: 'Candidates', value: selectedReport.candidatesContacted, icon: Users },
                        { label: 'Interviews Set', value: selectedReport.interviewsArranged, icon: Calendar },
                        { label: 'Work Hours', value: `${selectedReport.workHours || 0}h`, icon: Clock },
                      ].map((stat) => {
                        const StatIcon = stat.icon;
                        return (
                          <div key={stat.label} className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center">
                              <StatIcon className="w-4 h-4 text-[#0f172a]" />
                            </div>
                            <div>
                              <p className="text-lg font-black text-[#0f172a]">{stat.value ?? 0}</p>
                              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{stat.label}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Summary Section */}
                  {selectedReport.summary && (
                    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3 flex items-center gap-2">
                        <FileText className="w-3.5 h-3.5" /> Daily Summary
                      </p>
                      <p className="text-sm text-[#0f172a] leading-relaxed font-medium">
                        {selectedReport.summary}
                      </p>
                    </div>
                  )}

                  {/* Tasks List */}
                  {Array.isArray(selectedReport.tasksCompleted) && selectedReport.tasksCompleted.length > 0 && (
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Tasks Completed</p>
                      <div className="space-y-2.5">
                        {selectedReport.tasksCompleted.map((t, i) => (
                          <div key={i} className="flex items-start gap-3 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                            <div className="w-5 h-5 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0 mt-0.5 border border-emerald-100">
                              <CheckCircle className="w-3 h-3" />
                            </div>
                            <span className="text-sm font-medium text-[#0f172a]">{t}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Planned for Tomorrow */}
                  {Array.isArray(selectedReport.tasksPlanned) && selectedReport.tasksPlanned.length > 0 && (
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Planned for Tomorrow</p>
                      <div className="space-y-2.5">
                        {selectedReport.tasksPlanned.map((t, i) => (
                          <div key={i} className="flex items-start gap-3 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                            <div className="w-5 h-5 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center flex-shrink-0 mt-0.5 border border-indigo-100">
                              <Plus className="w-3 h-3" />
                            </div>
                            <span className="text-sm font-medium text-[#0f172a]">{t}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Blockers */}
                  {selectedReport.blockers && (
                    <div className="bg-amber-50 rounded-2xl p-6 border border-amber-100/50">
                      <p className="text-[10px] font-bold text-amber-600 uppercase tracking-widest mb-2">Blockers & Issues</p>
                      <p className="text-sm text-amber-900 font-medium">{selectedReport.blockers}</p>
                    </div>
                  )}

                  {/* Management Feedback */}
                  {selectedReport.headComment && (
                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-8 h-8 rounded-full bg-violet-600 text-white flex items-center justify-center text-xs font-bold ring-4 ring-violet-50">
                          {selectedReport.headCommentBy?.charAt(0) || 'M'}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-[#0f172a]">{selectedReport.headCommentBy || 'Manager'}</p>
                          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Management Feedback</p>
                        </div>
                      </div>
                      <div className="p-4 bg-[#F5F5F2] rounded-2xl rounded-tl-none text-sm text-[#334155] font-medium leading-relaxed italic border-l-4 border-violet-500">
                        "{selectedReport.headComment}"
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>,
        document.body
      )}

      {showForm && createPortal(
        <div className="fixed inset-0 z-[9999] isolation-auto">
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
                  className="bg-white rounded-[32px] w-full max-w-2xl shadow-2xl overflow-hidden"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="max-h-[92vh] overflow-y-auto custom-scrollbar">
                    <div className="sticky top-0 z-10 bg-white px-6 pt-6 pb-4 border-b border-gray-100 flex items-center justify-between rounded-t-3xl">
                      <div>
                        <h3 className="text-lg font-bold text-gray-900">{todayReport ? 'Update' : 'Submit'} Daily MIS Report</h3>
                        <p className="text-sm text-gray-500 mt-0.5">{new Date().toLocaleDateString('en-IN', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })}</p>
                      </div>
                      <button onClick={() => setShowForm(false)} className="p-2 rounded-xl hover:bg-red-50 hover:text-red-500 transition-colors">
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    <form onSubmit={handleSubmit} className="px-6 py-5 space-y-6">

                      <div>
                        <p className="text-sm font-bold text-gray-700 mb-3">
                          Today's KPI Numbers
                        </p>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                          <MetricInput icon={Phone} label="Phone Calls" sublabel="Total calls made" color="#3b82f6" bg="#dbeafe" name="callsCount" value={form.callsCount} onChange={handleFieldChange} />
                          <MetricInput icon={Eye} label="Profiles Visited" sublabel="Sourced / reviewed" color="#8b5cf6" bg="#ede9fe" name="profilesVisited" value={form.profilesVisited} onChange={handleFieldChange} />
                          <MetricInput icon={Share2} label="Profiles Shared" sublabel="Shared with client" color="#0891b2" bg="#ecfeff" name="profilesShared" value={form.profilesShared} onChange={handleFieldChange} />
                          <MetricInput icon={Users} label="Candidates" sublabel="Contacted today" color="#10b981" bg="#d1fae5" name="candidatesContacted" value={form.candidatesContacted} onChange={handleFieldChange} />
                          <MetricInput icon={Calendar} label="Interviews Set" sublabel="Arranged today" color="#f59e0b" bg="#fef3c7" name="interviewsArranged" value={form.interviewsArranged} onChange={handleFieldChange} />
                        </div>
                      </div>

                      <div className="space-y-4">
                        <p className="text-sm font-bold text-gray-700">
                          Daily Summary
                        </p>
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">Summary / Notes <span className="text-red-500">*</span></label>
                          <textarea value={form.summary} onChange={(e) => handleFieldChange('summary', e.target.value)} rows={2}
                            className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1B4DA0] resize-none"
                            placeholder="Brief overview of what you did today..." />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">Tasks Completed <span className="text-[10px] text-gray-400">(one per line)</span></label>
                          <textarea value={form.tasksCompleted} onChange={(e) => handleFieldChange('tasksCompleted', e.target.value)} rows={3}
                            className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1B4DA0] resize-none"
                            placeholder={"Called Ravi for Sr. Developer role\nShared 3 profiles to TechCorp"} />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">Plans for Tomorrow</label>
                          <textarea value={form.tasksPlanned} onChange={(e) => handleFieldChange('tasksPlanned', e.target.value)} rows={2}
                            className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1B4DA0] resize-none"
                            placeholder={"Follow up on TechCorp shortlist\nSource 5 profiles for Finance role"} />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">Blockers / Issues</label>
                          <input type="text" value={form.blockers} onChange={(e) => handleFieldChange('blockers', e.target.value)}
                            className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1B4DA0]"
                            placeholder="Any issues? e.g. Client not responding, JD unclear..." />
                        </div>
                      </div>

                      <button type="submit" disabled={submitting}
                        className="w-full py-3.5 rounded-xl text-white font-bold flex items-center justify-center gap-2 shadow-lg transition-all hover:opacity-90 disabled:opacity-70 bg-[#1B4DA0]"
                      >
                        <Send className="w-4 h-4" />
                        {submitting ? 'Submitting...' : todayReport ? 'Update MIS Report' : 'Submit MIS Report'}
                      </button>
                    </form>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>,
        document.body
      )}
    </div>
  );
};

export default DailyReportTab;
