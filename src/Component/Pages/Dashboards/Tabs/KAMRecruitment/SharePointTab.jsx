import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FolderOpen, FileSpreadsheet, File, ChevronRight, ArrowLeft, Search, X,
  RefreshCw, Download, ExternalLink, Users, CheckCircle, Clock, Calendar,
  Database, Loader2, FolderUp, FileText, ChevronDown, Eye, Table2,
  ClipboardList, UserCheck, AlertCircle, ArrowUpRight, Layers
} from 'lucide-react';
import {
  browseSharePointDrive,
  listSharePointExcelFiles,
  getSharePointExcelSheets,
  getSharePointExcelData,
  testSharePointConnection,
  syncSharePointCandidates,
  getSharePointCandidates,
  getSharePointSyncLogs,
  syncResumesFromSharePointDrive,
} from '../../../service/api';

/* ═══════════ HELPER: Format file size ═══════════ */
const formatSize = (bytes) => {
  if (!bytes) return '—';
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
};

const formatDate = (d) => {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
};

const formatTimeAgo = (d) => {
  if (!d) return '—';
  const diff = Date.now() - new Date(d).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
};

/* ═══════════ FILE ICON BY TYPE ═══════════ */
const FileIcon = ({ name, type, size = 20 }) => {
  if (type === 'folder') return <FolderOpen size={size} className="text-[#F59E0B]" />;
  const ext = (name || '').split('.').pop().toLowerCase();
  if (['xlsx', 'xls', 'csv'].includes(ext)) return <FileSpreadsheet size={size} className="text-[#10B981]" />;
  if (['pdf'].includes(ext)) return <File size={size} className="text-red-500" />;
  if (['doc', 'docx'].includes(ext)) return <FileText size={size} className="text-[#3b82f6]" />;
  return <File size={size} className="text-[#9B9BAD]" />;
};

/* ═══════════════════════════════════════════════
 * SUB-VIEW: FOLDER BROWSER
 * ═══════════════════════════════════════════════ */
const FolderBrowser = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPath, setCurrentPath] = useState('Recruitment folders');
  const [pathHistory, setPathHistory] = useState(['Recruitment folders']);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState(null);

  const fetchFolder = useCallback(async (path) => {
    setLoading(true);
    setError(null);
    try {
      const res = await browseSharePointDrive(path);
      setItems(res.data || []);
    } catch (err) {
      setError(err.message || 'Failed to load folder');
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchFolder(currentPath); }, [currentPath, fetchFolder]);

  const navigateTo = (folderName) => {
    const newPath = currentPath === 'root' ? folderName : `${currentPath}/${folderName}`;
    setPathHistory(prev => [...prev, newPath]);
    setCurrentPath(newPath);
    setSearchTerm('');
  };

  const goBack = () => {
    if (pathHistory.length > 1) {
      const newHistory = pathHistory.slice(0, -1);
      setPathHistory(newHistory);
      setCurrentPath(newHistory[newHistory.length - 1]);
      setSearchTerm('');
    }
  };

  const breadcrumbs = currentPath.split('/').filter(Boolean);

  const filteredItems = useMemo(() => {
    if (!searchTerm) return items;
    const q = searchTerm.toLowerCase();
    return items.filter(i => i.name.toLowerCase().includes(q));
  }, [items, searchTerm]);

  const folders = filteredItems.filter(i => i.type === 'folder');
  const files = filteredItems.filter(i => i.type === 'file');

  return (
    <div className="space-y-6">
      {/* Breadcrumb & Back */}
      <div className="flex items-center gap-3 flex-wrap">
        {pathHistory.length > 1 && (
          <button onClick={goBack} className="w-10 h-10 rounded-2xl bg-[#F4F3EF] text-[#6B6B7E] hover:bg-[#E8E7E2] transition-all flex items-center justify-center">
            <ArrowLeft size={18} />
          </button>
        )}
        <div className="flex items-center gap-1.5 text-sm flex-wrap">
          <button onClick={() => { setCurrentPath('Recruitment folders'); setPathHistory(['Recruitment folders']); }}
            className="text-[#1B4DA0] font-bold hover:underline">Recruitment</button>
          {breadcrumbs.slice(1).map((crumb, idx) => (
            <React.Fragment key={idx}>
              <ChevronRight size={14} className="text-[#C5C5D2]" />
              <span className="font-bold text-[#1A1A2E]">{crumb}</span>
            </React.Fragment>
          ))}
        </div>
        <button onClick={() => fetchFolder(currentPath)} className="ml-auto w-10 h-10 rounded-2xl bg-[#F4F3EF] text-[#6B6B7E] hover:bg-[#E8E7E2] transition-all flex items-center justify-center">
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      {/* Search */}
      <div className="bg-white rounded-[24px] p-2 border border-[#F4F3EF] shadow-sm">
        <div className="flex items-center gap-3 bg-[#F4F3EF] rounded-2xl px-5 py-3">
          <Search size={18} className="text-[#9B9BAD] flex-shrink-0" />
          <input type="text" placeholder="Search files & folders..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-transparent text-sm text-[#1A1A2E] placeholder:text-[#9B9BAD] outline-none w-full font-bold" />
          {searchTerm && <button onClick={() => setSearchTerm('')}><X size={14} className="text-[#9B9BAD] hover:text-[#1A1A2E]" /></button>}
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-100 rounded-2xl p-4 flex items-center gap-3">
          <AlertCircle size={18} className="text-red-500" />
          <p className="text-sm font-bold text-red-600">{error}</p>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-[#1B4DA0]" />
        </div>
      ) : (
        <div className="space-y-4">
          {/* Folders */}
          {folders.length > 0 && (
            <div>
              <p className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-widest mb-3">Folders ({folders.length})</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {folders.map(folder => (
                  <motion.button key={folder.id} whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
                    onClick={() => navigateTo(folder.name)}
                    className="flex items-center gap-4 p-4 bg-white rounded-2xl border border-[#E8E7E2] shadow-sm hover:shadow-md hover:border-[#1B4DA0]/20 transition-all text-left group">
                    <div className="w-12 h-12 rounded-2xl bg-[#FEF3C7] flex items-center justify-center flex-shrink-0">
                      <FolderOpen size={22} className="text-[#F59E0B]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-[#1A1A2E] truncate group-hover:text-[#1B4DA0] transition-colors">{folder.name}</p>
                      <p className="text-[11px] text-[#9B9BAD] mt-0.5">{folder.childCount} items • {formatDate(folder.modifiedAt)}</p>
                    </div>
                    <ChevronRight size={16} className="text-[#C5C5D2] group-hover:text-[#1B4DA0]" />
                  </motion.button>
                ))}
              </div>
            </div>
          )}

          {/* Files */}
          {files.length > 0 && (
            <div>
              <p className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-widest mb-3">Files ({files.length})</p>
              <div className="bg-white rounded-2xl border border-[#E8E7E2] overflow-hidden shadow-sm">
                {files.map((file, idx) => (
                  <div key={file.id} className={`flex items-center gap-4 px-5 py-4 hover:bg-[#FAFAF8] transition-all ${idx < files.length - 1 ? 'border-b border-[#F4F3EF]' : ''}`}>
                    <div className="w-10 h-10 rounded-xl bg-[#F4F3EF] flex items-center justify-center flex-shrink-0">
                      <FileIcon name={file.name} type="file" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-[#1A1A2E] truncate">{file.name}</p>
                      <p className="text-[11px] text-[#9B9BAD] mt-0.5">
                        {formatSize(file.size)} • {file.lastModifiedBy || '—'} • {formatDate(file.modifiedAt)}
                      </p>
                    </div>
                    {file.webUrl && (
                      <a href={file.webUrl} target="_blank" rel="noopener noreferrer"
                        className="w-9 h-9 rounded-xl bg-[#F4F3EF] flex items-center justify-center text-[#6B6B7E] hover:bg-[#1B4DA0] hover:text-white transition-all"
                        onClick={e => e.stopPropagation()}>
                        <ExternalLink size={14} />
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {folders.length === 0 && files.length === 0 && (
            <div className="text-center py-16">
              <FolderOpen size={48} className="mx-auto text-[#C5C5D2] mb-4" />
              <p className="text-sm font-bold text-[#9B9BAD]">This folder is empty</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

/* ═══════════════════════════════════════════════
 * SUB-VIEW: EXCEL VIEWER (reusable for any Excel file)
 * ═══════════════════════════════════════════════ */
const ExcelViewer = ({ fileName, title, subtitle, icon: Icon, color }) => {
  const [sheets, setSheets] = useState([]);
  const [activeSheet, setActiveSheet] = useState('');
  const [headers, setHeaders] = useState([]);
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sheetLoading, setSheetLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortCol, setSortCol] = useState(null);
  const [sortDir, setSortDir] = useState('asc');

  // Load sheets
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await getSharePointExcelSheets(fileName);
        const sheetNames = (res.sheets || []).map(s => s.name);
        setSheets(sheetNames);
        // Auto-select current month sheet or first
        const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
        const currentMonth = monthNames[new Date().getMonth()];
        const match = sheetNames.find(s => s.toLowerCase().includes(currentMonth.toLowerCase()) || s.toLowerCase().includes(currentMonth.substring(0, 3).toLowerCase()));
        setActiveSheet(match || sheetNames[0] || '');
      } catch (err) {
        setError(err.message || `Failed to load ${fileName}`);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [fileName]);

  // Load sheet data
  useEffect(() => {
    if (!activeSheet) return;
    const load = async () => {
      setSheetLoading(true);
      try {
        const res = await getSharePointExcelData(fileName, activeSheet);
        setHeaders(res.headers || []);
        setRows(res.rows || []);
      } catch (err) {
        setError(err.message || 'Failed to load sheet data');
      } finally {
        setSheetLoading(false);
      }
    };
    load();
  }, [activeSheet, fileName]);

  const handleSort = (col) => {
    if (sortCol === col) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortCol(col); setSortDir('asc'); }
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

  const visibleHeaders = useMemo(() => headers.filter(h => h && h !== 'S.N.'), [headers]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-[#1B4DA0]" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-100 rounded-2xl p-6 text-center">
        <AlertCircle size={32} className="mx-auto text-red-400 mb-3" />
        <p className="text-sm font-bold text-red-600">{error}</p>
        <p className="text-xs text-red-400 mt-1">Make sure "{fileName}" exists in your SharePoint document library</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Sheet Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {sheets.map(s => (
          <button key={s} onClick={() => { setActiveSheet(s); setSearchTerm(''); setSortCol(null); }}
            className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all ${activeSheet === s ? 'bg-[#1A1A2E] text-white shadow-md' : 'bg-[#F4F3EF] text-[#6B6B7E] hover:bg-[#E8E7E2]'}`}>
            {s}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="bg-white rounded-[24px] p-2 border border-[#F4F3EF] shadow-sm">
        <div className="flex items-center gap-3 bg-[#F4F3EF] rounded-2xl px-5 py-3">
          <Search size={18} className="text-[#9B9BAD] flex-shrink-0" />
          <input type="text" placeholder="Search data..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-transparent text-sm text-[#1A1A2E] placeholder:text-[#9B9BAD] outline-none w-full font-bold" />
          {searchTerm && <button onClick={() => setSearchTerm('')}><X size={14} className="text-[#9B9BAD] hover:text-[#1A1A2E]" /></button>}
        </div>
      </div>

      {/* Stats */}
      <div className="flex items-center gap-4 text-xs text-[#9B9BAD]">
        <span className="font-bold">{filteredRows.length} rows</span>
        <span>•</span>
        <span className="font-bold">{visibleHeaders.length} columns</span>
        {sheetLoading && <Loader2 size={14} className="animate-spin text-[#1B4DA0]" />}
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-[#E8E7E2] overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[#FAFAF8] border-b border-[#F4F3EF]">
                <th className="px-4 py-3 text-left text-[10px] font-black text-[#9B9BAD] uppercase tracking-widest w-12">#</th>
                {visibleHeaders.map(h => (
                  <th key={h} onClick={() => handleSort(h)}
                    className="px-4 py-3 text-left text-[10px] font-black text-[#9B9BAD] uppercase tracking-widest cursor-pointer hover:text-[#1B4DA0] whitespace-nowrap">
                    {h} {sortCol === h && (sortDir === 'asc' ? '↑' : '↓')}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredRows.map((row, i) => (
                <tr key={i} className="border-b border-[#F4F3EF] last:border-0 hover:bg-[#FAFAF8] transition-colors">
                  <td className="px-4 py-3 text-[11px] text-[#9B9BAD] font-bold">{i + 1}</td>
                  {visibleHeaders.map(h => (
                    <td key={h} className="px-4 py-3 text-sm font-medium text-[#1A1A2E] whitespace-nowrap max-w-[200px] truncate">
                      {row[h] !== null && row[h] !== undefined ? String(row[h]) : '—'}
                    </td>
                  ))}
                </tr>
              ))}
              {filteredRows.length === 0 && (
                <tr><td colSpan={visibleHeaders.length + 1} className="py-16 text-center text-sm font-bold text-[#9B9BAD]">No data found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════
 * SUB-VIEW: CANDIDATE SYNC
 * ═══════════════════════════════════════════════ */
const CandidateSync = () => {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [logs, setLogs] = useState([]);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [candRes, logRes] = await Promise.all([
        getSharePointCandidates({ limit: 200 }).catch(() => ({ data: [] })),
        getSharePointSyncLogs(10).catch(() => ({ data: [] })),
      ]);
      setCandidates(candRes.data || []);
      setLogs(logRes.data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleSync = async () => {
    setSyncing(true);
    setSyncResult(null);
    try {
      const res = await syncSharePointCandidates();
      setSyncResult(res);
      await fetchData();
    } catch (err) {
      setSyncResult({ success: false, message: err.message || 'Sync failed' });
    } finally {
      setSyncing(false);
    }
  };

  const filtered = useMemo(() => {
    if (!searchTerm) return candidates;
    const q = searchTerm.toLowerCase();
    return candidates.filter(c =>
      (c.name || '').toLowerCase().includes(q) ||
      (c.position || '').toLowerCase().includes(q) ||
      (c.client || '').toLowerCase().includes(q) ||
      (c.email || '').toLowerCase().includes(q)
    );
  }, [candidates, searchTerm]);

  const statusColors = {
    Active: 'bg-emerald-50 text-emerald-600',
    Selected: 'bg-blue-50 text-blue-600',
    Rejected: 'bg-red-50 text-red-600',
    Hold: 'bg-amber-50 text-amber-600',
  };

  return (
    <div className="space-y-6">
      {/* Sync Controls */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#1B4DA0] rounded-xl flex items-center justify-center text-white shadow-xl">
            <Database size={18} />
          </div>
          <div>
            <p className="text-lg font-bold text-[#1A1A2E] font-syne">Synced Candidates</p>
            <p className="text-xs text-[#9B9BAD]">{candidates.length} records from SharePoint</p>
          </div>
        </div>
        <button onClick={handleSync} disabled={syncing}
          className="flex items-center gap-2 px-6 py-3 bg-[#1B4DA0] text-white rounded-full text-[11px] font-bold uppercase tracking-widest shadow-lg shadow-blue-500/20 hover:bg-[#153e82] transition-all disabled:opacity-50">
          {syncing ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
          {syncing ? 'Syncing...' : 'Sync Now'}
        </button>
      </div>

      {/* Sync Result Banner */}
      <AnimatePresence>
        {syncResult && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
            className={`rounded-2xl p-4 flex items-center gap-3 ${syncResult.success ? 'bg-emerald-50 border border-emerald-100' : 'bg-red-50 border border-red-100'}`}>
            {syncResult.success ? <CheckCircle size={18} className="text-emerald-500" /> : <AlertCircle size={18} className="text-red-500" />}
            <p className="text-sm font-bold">{syncResult.message}</p>
            {syncResult.stats && (
              <span className="text-xs text-[#9B9BAD] ml-auto">
                +{syncResult.stats.created} new • {syncResult.stats.updated} updated
              </span>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search */}
      <div className="bg-white rounded-[24px] p-2 border border-[#F4F3EF] shadow-sm">
        <div className="flex items-center gap-3 bg-[#F4F3EF] rounded-2xl px-5 py-3">
          <Search size={18} className="text-[#9B9BAD] flex-shrink-0" />
          <input type="text" placeholder="Search candidates..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-transparent text-sm text-[#1A1A2E] placeholder:text-[#9B9BAD] outline-none w-full font-bold" />
          {searchTerm && <button onClick={() => setSearchTerm('')}><X size={14} className="text-[#9B9BAD] hover:text-[#1A1A2E]" /></button>}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-[#1B4DA0]" /></div>
      ) : (
        <div className="bg-white rounded-2xl border border-[#E8E7E2] overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#FAFAF8] border-b border-[#F4F3EF]">
                  {['Name', 'Email', 'Position', 'Client', 'Stage', 'Status', 'Last Synced'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-[10px] font-black text-[#9B9BAD] uppercase tracking-widest whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.slice(0, 100).map(c => (
                  <tr key={c.id} className="border-b border-[#F4F3EF] last:border-0 hover:bg-[#FAFAF8] transition-colors">
                    <td className="px-4 py-3 font-bold text-[#1A1A2E]">{c.name || '—'}</td>
                    <td className="px-4 py-3 text-[#6B6B7E]">{c.email || '—'}</td>
                    <td className="px-4 py-3 text-[#1A1A2E]">{c.position || '—'}</td>
                    <td className="px-4 py-3 text-[#6B6B7E]">{c.client || '—'}</td>
                    <td className="px-4 py-3"><span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#F4F3EF] text-[#6B6B7E]">{c.stage || '—'}</span></td>
                    <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${statusColors[c.status] || 'bg-[#F4F3EF] text-[#6B6B7E]'}`}>{c.status || '—'}</span></td>
                    <td className="px-4 py-3 text-[11px] text-[#9B9BAD]">{formatTimeAgo(c.lastSyncedAt)}</td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr><td colSpan={7} className="py-16 text-center text-sm font-bold text-[#9B9BAD]">No candidates synced yet</td></tr>
                )}
              </tbody>
            </table>
          </div>
          {filtered.length > 100 && (
            <div className="px-4 py-3 border-t border-[#F4F3EF] text-center text-xs text-[#9B9BAD] font-bold">
              Showing 100 of {filtered.length} candidates
            </div>
          )}
        </div>
      )}

      {/* Recent Sync Logs */}
      {logs.length > 0 && (
        <div>
          <p className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-widest mb-3">Recent Sync History</p>
          <div className="space-y-2">
            {logs.slice(0, 5).map(log => (
              <div key={log.id} className="flex items-center gap-3 p-3 bg-white rounded-2xl border border-[#F4F3EF]">
                <div className={`w-2 h-2 rounded-full ${log.status === 'success' ? 'bg-emerald-500' : log.status === 'partial' ? 'bg-amber-500' : 'bg-red-500'}`} />
                <span className="text-xs font-bold text-[#1A1A2E] capitalize">{log.syncType}</span>
                <span className="text-xs text-[#9B9BAD]">+{log.created} / ~{log.updated}</span>
                <span className="text-xs text-[#9B9BAD] ml-auto">{formatTimeAgo(log.createdAt)}</span>
                <span className="text-[10px] text-[#C5C5D2]">{log.durationMs ? `${(log.durationMs / 1000).toFixed(1)}s` : ''}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

/* ═══════════════════════════════════════════════
 * MAIN: SharePointTab
 * ═══════════════════════════════════════════════ */
const SUB_TABS = [
  { key: 'browser', label: 'File Browser', icon: FolderOpen, color: '#F59E0B' },
  { key: 'master', label: 'Master Sheet', icon: FileSpreadsheet, color: '#10B981' },
  { key: 'todo', label: 'Daily To-Do', icon: ClipboardList, color: '#3b82f6' },
  { key: 'joinings', label: 'Joinings Data', icon: UserCheck, color: '#8B5CF6' },
  { key: 'candidates', label: 'Candidate Sync', icon: Users, color: '#1B4DA0' },
];

const SharePointTab = () => {
  const [activeSubTab, setActiveSubTab] = useState('browser');
  const [connected, setConnected] = useState(null);
  const [checking, setChecking] = useState(true);

  // Test connection on mount
  useEffect(() => {
    const check = async () => {
      try {
        await testSharePointConnection();
        setConnected(true);
      } catch {
        setConnected(false);
      } finally {
        setChecking(false);
      }
    };
    check();
  }, []);

  return (
    <div className="p-5 lg:p-6 max-w-[1400px] mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#1A1A2E] tracking-tight font-syne">SharePoint Integration</h1>
          <p className="text-sm text-[#6B6B7E] mt-1">Browse files, view Excel data, and sync recruitment records</p>
        </div>
        <div className="flex items-center gap-3">
          {/* Connection Status */}
          {checking ? (
            <div className="flex items-center gap-2 px-4 py-2 bg-[#F4F3EF] rounded-full">
              <Loader2 size={14} className="animate-spin text-[#9B9BAD]" />
              <span className="text-xs font-bold text-[#9B9BAD]">Checking...</span>
            </div>
          ) : (
            <div className={`flex items-center gap-2 px-4 py-2 rounded-full ${connected ? 'bg-emerald-50' : 'bg-red-50'}`}>
              <div className={`w-2 h-2 rounded-full ${connected ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`} />
              <span className={`text-xs font-bold ${connected ? 'text-emerald-600' : 'text-red-600'}`}>
                {connected ? 'Connected' : 'Disconnected'}
              </span>
            </div>
          )}
          {/* Open in SharePoint */}
          <a href="https://mabicons.sharepoint.com/sites/Mabicons/recruitment" target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-[#F4F3EF] text-[#1A1A2E] rounded-full text-xs font-bold hover:bg-[#F8FAFF] transition-all shadow-sm">
            <ExternalLink size={14} /> Open SharePoint
          </a>
        </div>
      </div>

      {/* Sub Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {SUB_TABS.map(tab => (
          <button key={tab.key} onClick={() => setActiveSubTab(tab.key)}
            className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-sm font-bold whitespace-nowrap transition-all ${
              activeSubTab === tab.key
                ? 'bg-[#1A1A2E] text-white shadow-md'
                : 'bg-[#F4F3EF] text-[#6B6B7E] hover:bg-[#E8E7E2]'
            }`}>
            <tab.icon size={16} style={activeSubTab === tab.key ? {} : { color: tab.color }} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="min-h-[400px]">
        {activeSubTab === 'browser' && <FolderBrowser />}
        {activeSubTab === 'master' && (
          <ExcelViewer
            fileName="Recruitment - Master Sheet.xlsx"
            title="Recruitment Master Sheet"
            subtitle="Comprehensive recruitment data"
            icon={FileSpreadsheet}
            color="#10B981"
          />
        )}
        {activeSubTab === 'todo' && (
          <ExcelViewer
            fileName="Recruitment Team Daily To-Do List.xlsx"
            title="Daily To-Do List"
            subtitle="Team task tracking"
            icon={ClipboardList}
            color="#3b82f6"
          />
        )}
        {activeSubTab === 'joinings' && (
          <ExcelViewer
            fileName="Joinings Master.xlsx"
            title="Joinings Master Data"
            subtitle="Candidate joining records"
            icon={UserCheck}
            color="#8B5CF6"
          />
        )}
        {activeSubTab === 'candidates' && <CandidateSync />}
      </div>
    </div>
  );
};

export default SharePointTab;
