import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiClock, FiCalendar, FiUser, FiAlertCircle, FiSun, FiUpload, FiX, FiDownload, FiCheckCircle, FiRefreshCw } from 'react-icons/fi';
import * as XLSX from 'xlsx';
import { jwtDecode } from 'jwt-decode';
import { getClientAttendance } from '../../../service/api';

export default function ClientAttendanceTab({ isDarkMode, clientData }) {
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
  const [apiRows, setApiRows] = useState(null);
  const [apiLoading, setApiLoading] = useState(true);
  const [importedRows, setImportedRows] = useState(null);
  const [showImportModal, setShowImportModal] = useState(false);
  const [importError, setImportError] = useState('');
  const [importSuccess, setImportSuccess] = useState('');
  const [dragging, setDragging] = useState(false);
  const [extraColumns, setExtraColumns] = useState([]);
  const fileInputRef = useRef(null);

  // ── Fetch real attendance from backend ──────────────────────────────
  useEffect(() => {
    const fetchAttendance = async () => {
      setApiLoading(true);
      try {
        const token = localStorage.getItem('token');
        if (!token) return;
        const decoded = jwtDecode(token);
        const clientId = decoded.id;
        const res = await getClientAttendance(clientId, selectedMonth);
        if (res?.success) setApiRows(res.data?.rows || []);
        else setApiRows([]);
      } catch (err) {
        console.error('Attendance fetch failed:', err);
        setApiRows([]);
      } finally {
        setApiLoading(false);
      }
    };
    fetchAttendance();
  }, [selectedMonth]);

  // Active rows: imported takes priority over API
  const activeRows = importedRows || apiRows || [];
  const isImported = !!importedRows;
  const hasBackendData = apiRows && apiRows.length > 0;

  // ── Stats derived from active rows ────────────────────────────────────
  const stats = {
    total:    activeRows.length,
    present:  activeRows.filter(r => r.status === 'Present').length,
    absent:   activeRows.filter(r => r.status === 'Absent').length,
    late:     activeRows.filter(r => ['Late', 'Half Day'].includes(r.status)).length,
    holidays: activeRows.filter(r => ['Holiday', 'On Leave', 'WFH'].includes(r.status)).length,
  };

  const statCards = [
    { label: 'Total Records',  value: stats.total,    color: 'text-[#1B4DA0]',    icon: FiCalendar },
    { label: 'Present',        value: stats.present,  color: 'text-emerald-500',  icon: FiUser },
    { label: 'Absent',         value: stats.absent,   color: 'text-red-500',      icon: FiAlertCircle },
    { label: 'Late / Half Day',value: stats.late,     color: 'text-amber-500',    icon: FiClock },
    { label: 'Leave / WFH',    value: stats.holidays, color: 'text-purple-500',   icon: FiSun },
  ];

  const statusConfig = {
    Present:   'bg-emerald-50 text-emerald-600 border border-emerald-100',
    Absent:    'bg-red-50 text-red-500 border border-red-100',
    Late:      'bg-amber-50 text-amber-600 border border-amber-100',
    'Half Day':'bg-amber-50 text-amber-600 border border-amber-100',
    'On Leave':'bg-purple-50 text-purple-500 border border-purple-100',
    WFH:       'bg-blue-50 text-blue-500 border border-blue-100',
    Holiday:   'bg-purple-50 text-purple-500 border border-purple-100',
  };

  const monthLabel = new Date(selectedMonth + '-01').toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });

  // Determine if the table should show a "Name" column (backend data has names)
  const showNameCol = !isImported && hasBackendData;

  // ── Excel Parser ──────────────────────────────────────────────────────
  const parseExcel = (file) => {
    setImportError('');
    setImportSuccess('');
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const wb = XLSX.read(e.target.result, { type: 'binary' });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const raw = XLSX.utils.sheet_to_json(ws, { defval: '' });
        if (!raw.length) { setImportError('File is empty or has no data rows.'); return; }

        const normalize = (row) => {
          const norm = {};
          Object.keys(row).forEach(k => { norm[k.toLowerCase().trim()] = String(row[k]); });
          return norm;
        };

        const knownKeys = ['date', 'day', 'check in', 'checkin', 'check_in', 'in', 'check out', 'checkout', 'check_out', 'out', 'hours', 'total hours', 'work hours', 'duration', 'status', 'attendance', 'name', 'employee'];
        const allKeys = Object.keys(normalize(raw[0]));
        const detected = allKeys.filter(k => !knownKeys.includes(k));
        setExtraColumns(detected);

        const statusMap = {
          present: 'Present', p: 'Present',
          absent: 'Absent', a: 'Absent',
          late: 'Late', l: 'Late',
          'half day': 'Half Day', hd: 'Half Day',
          holiday: 'Holiday', h: 'Holiday', off: 'Holiday', 'week off': 'Holiday',
          'on leave': 'On Leave', leave: 'On Leave',
          wfh: 'WFH', 'work from home': 'WFH',
        };

        const parsed = raw.map((rawRow, idx) => {
          const r = normalize(rawRow);
          const date      = r['date'] || r['day'] || `Row ${idx + 2}`;
          const name      = r['name'] || r['employee'] || r['employee name'] || '';
          const checkIn   = r['check in'] || r['checkin'] || r['check_in'] || r['in'] || '—';
          const checkOut  = r['check out'] || r['checkout'] || r['check_out'] || r['out'] || '—';
          const hours     = r['hours'] || r['total hours'] || r['work hours'] || r['duration'] || '—';
          const rawStatus = (r['status'] || r['attendance'] || 'Present').toString().trim();
          const status    = statusMap[rawStatus.toLowerCase()] || rawStatus;
          const isWeekend = status === 'Holiday';
          const extra     = {};
          detected.forEach(k => { extra[k] = r[k] || '—'; });
          return { date: String(date), name, checkIn: String(checkIn), checkOut: String(checkOut), hours: String(hours), status, isWeekend, extra };
        });

        setImportedRows(parsed);
        setImportSuccess(`Imported ${parsed.length} records with ${allKeys.length} columns.`);
        setTimeout(() => setShowImportModal(false), 1400);
      } catch (err) {
        setImportError('Failed to parse file. Please use a valid .xlsx, .xls, or .csv file.');
      }
    };
    reader.readAsBinaryString(file);
  };

  const handleFileDrop = (e) => { e.preventDefault(); setDragging(false); const f = e.dataTransfer.files[0]; if (f) parseExcel(f); };
  const handleFileSelect = (e) => { const f = e.target.files[0]; if (f) parseExcel(f); };
  const clearImport = () => { setImportedRows(null); setExtraColumns([]); };

  const downloadTemplate = () => {
    const ws = XLSX.utils.aoa_to_sheet([
      ['Date', 'Name', 'Check In', 'Check Out', 'Hours', 'Status'],
      ['Mon 1 Apr', 'Rahul Sharma', '09:00 AM', '06:00 PM', '9h', 'Present'],
      ['Tue 2 Apr', 'Rahul Sharma', '09:30 AM', '06:00 PM', '8.5h', 'Late'],
      ['Wed 3 Apr', 'Rahul Sharma', '—',        '—',        '—',   'Absent'],
      ['Sat 5 Apr', 'Rahul Sharma', '—',        '—',        '—',   'Holiday'],
    ]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Attendance');
    XLSX.writeFile(wb, 'attendance_template.xlsx');
  };

  // Grid template based on what columns are active
  const baseGrid = showNameCol
    ? '160px 160px 140px 140px 80px 120px 1fr'
    : `160px 140px 140px 80px 120px${extraColumns.map(() => ' 160px').join('')} 1fr`;

  return (
    <div className="p-0 min-h-screen bg-[#FDFDFD] text-left" style={{ fontFamily: 'Calibri, sans-serif' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&family=Syne:wght@400;500;600;700;800&display=swap');
        .font-syne { font-family: 'Syne', sans-serif !important; }
        .font-jakarta { font-family: 'Plus Jakarta Sans', sans-serif !important; }
      `}</style>

      {/* ── Header ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div className="flex flex-col items-start text-left">
          <h1 className="text-4xl font-bold text-[#1A1A2E] tracking-tight font-syne mb-1">Attendance Review</h1>
          <p className="text-sm font-medium text-[#9B9BAD] mt-1">
            {isImported ? 'Showing imported data' : hasBackendData ? 'Live data from assigned team members' : 'Share, review, and request corrections on attendance records'}
          </p>
        </div>
        <div className="flex items-center gap-3 flex-wrap justify-end">
          {isImported && (
            <button onClick={clearImport} className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-bold text-red-500 bg-red-50 border border-red-100 hover:bg-red-100 transition-all">
              <FiX size={14} /> Clear Import
            </button>
          )}
          <button
            onClick={() => { setShowImportModal(true); setImportError(''); setImportSuccess(''); }}
            className="flex items-center gap-2.5 px-5 py-3 rounded-xl text-sm font-bold text-white bg-[#1A1A2E] hover:bg-[#2A2A3E] transition-all shadow-lg shadow-gray-200"
          >
            <FiUpload size={15} /> Import Excel
          </button>
          <input
            type="month"
            value={selectedMonth}
            onChange={e => setSelectedMonth(e.target.value)}
            className="px-5 py-3 rounded-xl text-sm font-bold text-[#1A1A2E] bg-white border border-[#E8E7E2] outline-none shadow-sm hover:border-[#1B4DA0] transition-colors cursor-pointer"
          />
        </div>
      </div>

      {/* ── Stats ── */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-5 mb-10">
        {statCards.map(s => (
          <div key={s.label} className="bg-white p-6 rounded-[28px] border border-[#F4F3EF] shadow-sm hover:shadow-md transition-all duration-300 group">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 bg-[#F4F3EF] ${s.color} transition-transform duration-300 group-hover:scale-110`}>
              <s.icon size={18} />
            </div>
            <p className={`text-3xl font-extrabold ${s.color} mb-1`}>{s.value}</p>
            <p className="text-[10px] font-bold text-[#9B9BAD] uppercase tracking-widest">{s.label}</p>
          </div>
        ))}
      </div>

      {/* ── Daily Log Table ── */}
      <div className="bg-white rounded-[32px] p-8 border border-[#E8E7E2] shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-xl font-bold text-[#1A1A2E] flex items-center gap-3 font-syne">
            <div className="w-8 h-8 flex items-center justify-center flex-shrink-0">
              <FiCalendar className="w-5 h-5 text-[#1B4DA0]" />
            </div>
            Daily Attendance Log — {monthLabel}
            {isImported && (
              <span className="ml-1 text-[9px] font-black px-2.5 py-1 rounded-lg uppercase tracking-widest bg-emerald-50 text-emerald-600 border border-emerald-100">Imported</span>
            )}
            {!isImported && hasBackendData && (
              <span className="ml-1 text-[9px] font-black px-2.5 py-1 rounded-lg uppercase tracking-widest bg-blue-50 text-[#1B4DA0] border border-blue-100">Live</span>
            )}
          </h2>
        </div>
        <p className="text-xs text-[#9B9BAD] font-bold uppercase tracking-widest mb-7 ml-11">
          Review and request corrections for any discrepancies
        </p>

        {/* Loading State */}
        {apiLoading && !importedRows && (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="relative"><div className="w-12 h-12 border-4 border-slate-100 rounded-full" /><div className="absolute inset-0 w-12 h-12 border-4 border-[#1B4DA0] border-t-transparent rounded-full animate-spin" /></div>
            <p className="text-xs font-bold text-[#9B9BAD] uppercase tracking-widest">Loading attendance...</p>
          </div>
        )}

        {/* Empty State */}
        {!apiLoading && activeRows.length === 0 && (
          <div className="py-20 text-center border-2 border-dashed border-[#F4F3EF] rounded-2xl flex flex-col items-center gap-4">
            <div className="w-14 h-14 bg-[#F4F3EF] rounded-2xl flex items-center justify-center text-[#9B9BAD]"><FiCalendar size={24} /></div>
            <div>
              <p className="text-sm font-bold text-[#9B9BAD]">No attendance records found for this period</p>
              <p className="text-xs text-[#9B9BAD] mt-1">Try importing an Excel file or select a different month</p>
            </div>
          </div>
        )}

        {/* Table */}
        {!apiLoading && activeRows.length > 0 && (
          <div className="overflow-x-auto">
            <div
              className="grid gap-4 pb-4 text-[10px] font-bold text-[#9B9BAD] uppercase tracking-[2px] border-b border-[#F4F3EF]"
              style={{ gridTemplateColumns: baseGrid }}
            >
              <div className="pl-1">Date</div>
              {showNameCol && <div>Member Name</div>}
              <div>Check In</div>
              <div>Check Out</div>
              <div>Hours</div>
              <div>Status</div>
              {extraColumns.map(col => <div key={col} className="capitalize">{col}</div>)}
              <div>Action</div>
            </div>

            <div className="space-y-1 mt-2">
              {activeRows.map((row, idx) => (
                <div
                  key={idx}
                  className="grid gap-4 py-3.5 border-b border-[#F4F3EF] last:border-0 hover:bg-[#FAFAF8] transition-colors px-1 rounded-lg"
                  style={{ gridTemplateColumns: baseGrid }}
                >
                  <div className="text-sm font-semibold text-[#1A1A2E]">{row.date}</div>
                  {showNameCol && <div className="text-sm font-semibold text-[#1A1A2E] flex items-center">{row.name}</div>}
                  <div className="text-sm text-[#9B9BAD] flex items-center">{row.checkIn}</div>
                  <div className="text-sm text-[#9B9BAD] flex items-center">{row.checkOut}</div>
                  <div className="text-sm text-[#9B9BAD] flex items-center">{row.hours}</div>
                  <div className="flex items-center">
                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-lg uppercase tracking-wider ${statusConfig[row.status] || 'bg-slate-100 text-slate-600'}`}>
                      {row.status}
                    </span>
                  </div>
                  {extraColumns.map(col => <div key={col} className="text-sm text-[#9B9BAD] flex items-center">{row.extra?.[col] ?? '—'}</div>)}
                  <div className="flex items-center">
                    {!row.isWeekend && (
                      <button className="text-[11px] font-bold text-[#1B4DA0] hover:underline transition-all">Request Correction</button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <p className="text-[10px] font-bold text-[#9B9BAD] uppercase tracking-widest text-center mt-8 pt-6 border-t border-[#F4F3EF]">
          {isImported ? `Showing ${activeRows.length} imported records` : hasBackendData ? `Showing ${activeRows.length} live records · Contact KAM for corrections` : 'No data · Import Excel or contact your KAM'}
        </p>
      </div>

      {/* ── Import Modal ── */}
      <AnimatePresence>
        {showImportModal && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowImportModal(false)} className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm z-[2000]" />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed inset-0 flex items-start justify-center z-[2001] p-6 pt-16 overflow-y-auto"
            >
              <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-[560px] overflow-hidden">
                <div className="px-8 py-6 border-b border-[#F4F3EF] flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-bold text-[#1A1A2E] font-syne">Import Attendance Data</h3>
                    <p className="text-xs text-[#9B9BAD] font-bold uppercase tracking-widest mt-1">Upload an Excel (.xlsx) or CSV file</p>
                  </div>
                  <button onClick={() => setShowImportModal(false)} className="w-10 h-10 rounded-xl bg-[#F4F3EF] text-[#6B6B7E] flex items-center justify-center hover:bg-red-50 hover:text-red-500 transition-all"><FiX size={20} /></button>
                </div>

                <div className="px-8 py-8 space-y-6">
                  <div
                    onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                    onDragLeave={() => setDragging(false)}
                    onDrop={handleFileDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all duration-300 ${dragging ? 'border-[#1B4DA0] bg-blue-50' : 'border-[#E8E7E2] hover:border-[#1B4DA0] hover:bg-[#FAFAF8]'}`}
                  >
                    <input ref={fileInputRef} type="file" accept=".xlsx,.xls,.csv" className="hidden" onChange={handleFileSelect} />
                    <div className={`w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center transition-all ${dragging ? 'bg-[#1B4DA0] text-white' : 'bg-[#F4F3EF] text-[#1B4DA0]'}`}>
                      <FiUpload size={24} />
                    </div>
                    <p className="text-sm font-bold text-[#1A1A2E] mb-1">{dragging ? 'Drop it here!' : 'Click to browse or drag & drop'}</p>
                    <p className="text-xs text-[#9B9BAD] font-bold">Supports .xlsx, .xls, and .csv files</p>
                  </div>

                  {importError && (
                    <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-100 rounded-xl">
                      <FiAlertCircle className="text-red-500 mt-0.5 flex-shrink-0" />
                      <p className="text-sm font-bold text-red-600">{importError}</p>
                    </div>
                  )}
                  {importSuccess && (
                    <div className="flex items-start gap-3 p-4 bg-emerald-50 border border-emerald-100 rounded-xl">
                      <FiCheckCircle className="text-emerald-500 mt-0.5 flex-shrink-0" />
                      <p className="text-sm font-bold text-emerald-600">{importSuccess}</p>
                    </div>
                  )}

                  <div className="bg-[#F4F3EF] rounded-2xl p-5 space-y-2">
                    <p className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-[2px] mb-3">Expected Column Format</p>
                    <div className="grid grid-cols-6 text-[10px] font-bold text-[#1B4DA0] uppercase tracking-widest gap-1">
                      {['Date', 'Name', 'Check In', 'Check Out', 'Hours', 'Status'].map(col => (
                        <span key={col} className="bg-white px-2 py-1.5 rounded-lg text-center border border-[#E8E7E2]">{col}</span>
                      ))}
                    </div>
                    <p className="text-[10px] text-[#9B9BAD] font-bold mt-2">Status values: Present, Absent, Late, Half Day, On Leave, WFH, Holiday</p>
                    <p className="text-[10px] text-[#9B9BAD] font-bold">Any extra columns will be auto-detected and shown in the table</p>
                  </div>

                  <button onClick={downloadTemplate} className="w-full flex items-center justify-center gap-2.5 py-4 border-2 border-dashed border-[#E8E7E2] rounded-2xl text-sm font-bold text-[#1B4DA0] hover:border-[#1B4DA0] hover:bg-blue-50 transition-all">
                    <FiDownload size={16} /> Download Sample Template
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
