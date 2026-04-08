import React, { useState, useEffect, useMemo } from 'react';
import { FileSpreadsheet, RefreshCw, Search, Download, ChevronRight, Calendar, Users, CheckCircle, Building2, ArrowUpDown } from 'lucide-react';
import { toast } from 'sonner';
import { getSharePointExcelSheets, getSharePointExcelData } from "../../../service/api";

const EXCEL_FILE = 'Joinings Master.xlsx';

const STATUS_COLORS = {
  Joined: 'bg-emerald-50 text-emerald-600 border-emerald-200',
  Pending: 'bg-amber-50 text-amber-600 border-amber-200',
  Declined: 'bg-rose-50 text-rose-600 border-rose-200',
  default: 'bg-slate-50 text-slate-500 border-slate-200',
};

export default function SelectionMISTab() {
  const [sheets, setSheets] = useState([]);
  const [activeSheet, setActiveSheet] = useState('');
  const [headers, setHeaders] = useState([]);
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sheetLoading, setSheetLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortCol, setSortCol] = useState('');
  const [sortDir, setSortDir] = useState('asc');

  // Load sheet list on mount
  useEffect(() => {
    (async () => {
      try {
        const res = await getSharePointExcelSheets(EXCEL_FILE);
        if (res.success && res.sheets?.length) {
          setSheets(res.sheets);
          // Default to current month or first sheet
          const monthNames = ['January','February','March','April','May','June','July','August','September','October','November','December'];
          const currentMonth = monthNames[new Date().getMonth()];
          const match = res.sheets.find(s => s.name.toLowerCase().includes(currentMonth.toLowerCase().slice(0, 3)));
          setActiveSheet(match?.name || res.sheets[0].name);
        }
      } catch (err) {
        toast.error(err.message || 'Failed to connect to SharePoint');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Load sheet data when active sheet changes
  useEffect(() => {
    if (!activeSheet) return;
    (async () => {
      setSheetLoading(true);
      try {
        const res = await getSharePointExcelData(EXCEL_FILE, activeSheet);
        if (res.success) {
          setHeaders(res.headers || []);
          setRows(res.rows || []);
        }
      } catch (err) {
        toast.error(err.message || 'Failed to load sheet data');
      } finally {
        setSheetLoading(false);
      }
    })();
  }, [activeSheet]);

  const handleRefresh = async () => {
    if (!activeSheet) return;
    setSheetLoading(true);
    try {
      const res = await getSharePointExcelData(EXCEL_FILE, activeSheet);
      if (res.success) {
        setHeaders(res.headers || []);
        setRows(res.rows || []);
        toast.success('Data refreshed from SharePoint');
      }
    } catch (err) {
      toast.error('Failed to refresh');
    } finally {
      setSheetLoading(false);
    }
  };

  const handleSort = (col) => {
    if (sortCol === col) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      setSortCol(col);
      setSortDir('asc');
    }
  };

  const filteredRows = useMemo(() => {
    let result = rows;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      result = result.filter(r => Object.values(r).some(v => String(v).toLowerCase().includes(q)));
    }
    if (sortCol) {
      result = [...result].sort((a, b) => {
        const va = String(a[sortCol] || '').toLowerCase();
        const vb = String(b[sortCol] || '').toLowerCase();
        return sortDir === 'asc' ? va.localeCompare(vb) : vb.localeCompare(va);
      });
    }
    return result;
  }, [rows, searchTerm, sortCol, sortDir]);

  // Quick stats
  const stats = useMemo(() => {
    const total = rows.length;
    const joined = rows.filter(r => String(r['Remark'] || '').toLowerCase() === 'joined').length;
    const clients = new Set(rows.map(r => r['Client']).filter(Boolean)).size;
    return [
      { label: 'Total Selections', value: total, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
      { label: 'Joined', value: joined, icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-50' },
      { label: 'Clients', value: clients, icon: Building2, color: 'text-violet-600', bg: 'bg-violet-50' },
      { label: 'Joining Rate', value: total > 0 ? `${Math.round((joined / total) * 100)}%` : '0%', icon: Calendar, color: 'text-amber-600', bg: 'bg-amber-50' },
    ];
  }, [rows]);

  // Visible columns (skip S.N.)
  const visibleHeaders = useMemo(() => headers.filter(h => h && h !== 'S.N.'), [headers]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex flex-col items-center gap-4">
          <RefreshCw className="w-8 h-8 animate-spin text-[#1B4DA0]" />
          <p className="text-sm font-bold text-[#9B9BAD]">Connecting to SharePoint...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-0 max-w-full space-y-6" style={{ fontFamily: "'Calibri', sans-serif" }}>
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#1A1A2E] tracking-tight" style={{ fontFamily: "'Syne', sans-serif" }}>
            Selection MIS
          </h1>
          <p className="text-sm font-medium text-[#9B9BAD] mt-1 text-left">
            Live data from SharePoint • {EXCEL_FILE}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={handleRefresh} disabled={sheetLoading}
            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-[#F4F3EF] text-[#1A1A2E] rounded-full text-xs font-bold hover:bg-[#F8FAFF] transition-all shadow-sm disabled:opacity-50">
            <RefreshCw size={14} className={sheetLoading ? 'animate-spin' : ''} /> Sync
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, idx) => (
          <div key={idx} className="bg-white p-4 rounded-2xl border border-[#E8E7E2] shadow-sm flex items-center gap-4 group hover:shadow-md transition-all duration-300">
            <div className={`w-10 h-10 rounded-xl ${stat.bg} ${stat.color} flex items-center justify-center shrink-0 transition-colors duration-300`}>
              <stat.icon size={18} strokeWidth={2.5} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-[#9B9BAD] uppercase tracking-widest">{stat.label}</p>
              <p className="text-2xl font-bold text-[#1A1A2E] leading-tight mt-0.5">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Sheet tabs + Search */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-1.5 bg-white p-1 rounded-xl border border-[#F4F3EF] overflow-x-auto max-w-full shadow-xs">
          {sheets.map(s => (
            <button key={s.name} onClick={() => setActiveSheet(s.name)}
              className={`px-3.5 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all whitespace-nowrap ${
                activeSheet === s.name ? 'bg-[#1A1A2E] text-white' : 'text-[#9B9BAD] hover:text-[#1A1A2E]'
              }`}>
              {s.name}
            </button>
          ))}
        </div>
        <div className="bg-white rounded-[24px] p-2 border border-[#F4F3EF] shadow-sm">
          <div className="flex items-center gap-3 bg-[#F4F3EF] rounded-2xl px-5 py-3">
            <Search size={18} className="text-[#9B9BAD] flex-shrink-0" />
            <input value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
              placeholder="Search candidate, client..."
              className="bg-transparent text-sm text-[#1A1A2E] placeholder:text-[#9B9BAD] outline-none w-full font-bold" />
          </div>
        </div>
      </div>

      {/* Data Table */}
      {sheetLoading ? (
        <div className="flex items-center justify-center h-48 bg-white rounded-2xl border border-[#F4F3EF]">
          <RefreshCw className="w-6 h-6 animate-spin text-[#1B4DA0]" />
        </div>
      ) : filteredRows.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#F4F3EF] p-16 flex flex-col items-center gap-4">
          <FileSpreadsheet size={40} className="text-[#9B9BAD]" />
          <p className="text-sm font-bold text-[#9B9BAD]">No data found for "{activeSheet}"</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-[#F4F3EF] shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-[#F4F3EF] bg-transparent">
                  <th className="px-4 py-3 text-[11px] font-bold text-[#94a3b8] uppercase tracking-widest w-10">#</th>
                  {visibleHeaders.map(h => (
                    <th key={h} onClick={() => handleSort(h)}
                      className="px-4 py-3 text-[11px] font-bold text-[#94a3b8] uppercase tracking-widest cursor-pointer hover:text-[#1B4DA0] transition-colors select-none whitespace-nowrap">
                      <span className="flex items-center gap-1">
                        {h}
                        {sortCol === h && <ArrowUpDown size={10} className="text-[#1B4DA0]" />}
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredRows.map((row, idx) => {
                  const remark = String(row['Remark'] || '').trim().toLowerCase();
                  const statusClass = remark === 'joined' ? STATUS_COLORS.Joined : remark === 'declined' ? STATUS_COLORS.Declined : remark ? STATUS_COLORS.Pending : STATUS_COLORS.default;

                  return (
                    <tr key={idx} className="border-b border-[#F4F3EF] hover:bg-[#F8FAFF] transition-colors group">
                      <td className="px-4 py-2.5 text-[10px] font-bold text-[#9B9BAD]">{idx + 1}</td>
                      {visibleHeaders.map(h => {
                        const val = row[h] ?? '';
                        const display = typeof val === 'number' && val > 40000 && h.toLowerCase().includes('date')
                          ? excelDateToString(val)
                          : String(val);

                        // Special styling for certain columns 
                        if (h === 'Candidate Name') {
                          return (
                            <td key={h} className="px-4 py-2.5">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-[10px] bg-[#F8FAFF] text-[#1B4DA0] border border-[#EEF2FB] flex items-center justify-center text-[10px] font-bold flex-shrink-0">
                                  {String(display).charAt(0).toUpperCase()}
                                </div>
                                <span className="text-[14px] font-bold text-[#0f172a] truncate max-w-[180px]">{display}</span>
                              </div>
                            </td>
                          );
                        }
                        if (h === 'Remark') {
                          return (
                            <td key={h} className="px-4 py-3.5">
                              {display ? (
                                <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border ${statusClass}`}>
                                  {display}
                                </span>
                              ) : <span className="text-[#9B9BAD] text-xs">—</span>}
                            </td>
                          );
                        }
                        if (h === 'Mail ID') {
                          return (
                            <td key={h} className="px-4 py-3.5">
                              <span className="text-xs font-medium text-[#1B4DA0] truncate block max-w-[180px]">{display}</span>
                            </td>
                          );
                        }
                        if (h.includes('Salary') || h.includes('CTC')) {
                          return (
                            <td key={h} className="px-4 py-3.5 text-xs font-bold text-[#1A1A2E]">
                              {display ? `₹${Number(display).toLocaleString('en-IN')}` : '—'}
                            </td>
                          );
                        }
                        return (
                          <td key={h} className="px-4 py-3.5 text-xs font-medium text-[#4B4B5E] whitespace-nowrap truncate max-w-[150px]">
                            {display || '—'}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="px-6 py-3 border-t border-[#F4F3EF] flex items-center justify-between">
            <p className="text-[10px] font-bold text-[#9B9BAD] uppercase tracking-widest">
              {filteredRows.length} record{filteredRows.length !== 1 ? 's' : ''} • Sheet: {activeSheet}
            </p>
            <div className="flex items-center gap-1 text-[10px] font-bold text-[#9B9BAD]">
              <FileSpreadsheet size={12} />
              <span>SharePoint Live</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/** Convert Excel serial date to readable string */
function excelDateToString(serial) {
  if (!serial || typeof serial !== 'number') return String(serial);
  const utcDays = Math.floor(serial - 25569);
  const d = new Date(utcDays * 86400 * 1000);
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}
