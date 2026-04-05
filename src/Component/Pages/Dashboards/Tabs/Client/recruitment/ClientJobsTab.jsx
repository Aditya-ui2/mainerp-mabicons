import { useState, useEffect } from 'react';
import {
  FiBriefcase,
  FiMapPin,
  FiChevronDown,
  FiChevronUp,
  FiPlus,
  FiSearch,
  FiRefreshCw,
} from 'react-icons/fi';
import { jwtDecode } from 'jwt-decode';
import { getClientDashboardOverview } from '../../../../service/api';

const StatusBadge = ({ status }) => {
  const config = {
    Open: 'bg-blue-50 text-blue-600 border border-blue-100',
    Urgent: 'bg-amber-50 text-amber-600 border border-amber-100',
    'In Progress': 'bg-slate-50 text-slate-500 border border-slate-100',
    Closed: 'bg-gray-50 text-gray-400 border border-gray-100',
    Hold: 'bg-amber-50 text-amber-500 border border-amber-100',
  };
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${config[status] || 'bg-slate-50 text-slate-500 border border-slate-100'}`}>
      {status}
    </span>
  );
};

const PriorityBadge = ({ priority }) => {
  const config = {
    High: 'bg-red-50 text-red-500 border border-red-200',
    Medium: 'bg-amber-50 text-amber-500 border border-amber-200',
    Low: 'bg-slate-50 text-slate-400 border border-slate-200',
    Urgent: 'bg-red-100 text-red-600 border border-red-300',
  };
  return <span className={`text-[10px] font-bold px-2 py-0.5 rounded-lg ${config[priority] || config.Medium}`}>{priority}</span>;
};

export default function ClientJobsTab() {
  const [positions, setPositions] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');
  const [expandedPosition, setExpandedPosition] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      const decoded = jwtDecode(token);
      const res = await getClientDashboardOverview(decoded.id);
      if (res?.success && res.data?.recruitment) {
        setPositions(res.data.recruitment.positions || []);
        setCandidates(res.data.recruitment.candidates || []);
      }
    } catch (err) {
      console.error('Failed to load jobs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const filteredPositions = (positions || [])
    .filter(p => filterStatus === 'all' || p.status === filterStatus)
    .filter(p => !searchQuery || p.title?.toLowerCase().includes(searchQuery.toLowerCase()));

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-72 gap-3">
        <div className="relative">
          <div className="w-12 h-12 border-4 border-blue-200 rounded-full" />
          <div className="absolute inset-0 w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
        <p className="text-sm font-medium text-gray-500">Loading positions...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#1A1A2E]" style={{ fontFamily: "'Syne', sans-serif" }}>
            Job Positions
          </h1>
          <p className="text-sm text-[#6B6B7E] mt-1 font-medium">Manage and track all open positions</p>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9B9BAD]" />
          <input
            type="text"
            placeholder="Search positions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-sm border border-[#E8E7E2] rounded-xl bg-white text-[#1A1A2E] placeholder:text-[#9B9BAD] focus:outline-none focus:ring-2 focus:ring-blue-200"
          />
        </div>
        <select
          value={filterStatus}
          onChange={e => setFilterStatus(e.target.value)}
          className="text-xs font-semibold px-3 py-2.5 rounded-xl border border-[#E8E7E2] bg-white text-[#1A1A2E] outline-none cursor-pointer focus:ring-2 focus:ring-blue-200"
        >
          <option value="all">All Statuses</option>
          <option value="Open">Open</option>
          <option value="Urgent">Urgent</option>
          <option value="In Progress">In Progress</option>
          <option value="Closed">Closed</option>
        </select>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total', count: positions?.length || 0, color: 'text-[#1A1A2E]' },
          { label: 'Open', count: positions?.filter(p => p.status === 'Open').length || 0, color: 'text-blue-600' },
          { label: 'Urgent', count: positions?.filter(p => p.status === 'Urgent').length || 0, color: 'text-amber-600' },
          { label: 'Closed', count: positions?.filter(p => p.status === 'Closed').length || 0, color: 'text-slate-400' },
        ].map((s, i) => (
          <div key={i} className="bg-white rounded-2xl border border-[#E8E7E2] p-4 shadow-sm">
            <p className={`text-2xl font-extrabold ${s.color}`}>{s.count}</p>
            <p className="text-[10px] font-bold text-[#9B9BAD] uppercase tracking-widest mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Positions List */}
      <div className="bg-white rounded-[32px] p-6 border border-[#E8E7E2] shadow-sm">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-[#1A1A2E] flex items-center gap-2" style={{ fontFamily: "'Syne', sans-serif" }}>
            <FiBriefcase className="w-5 h-5 text-amber-500" /> Positions ({filteredPositions.length})
          </h2>
        </div>

        {filteredPositions.length === 0 ? (
          <p className="text-sm text-center py-12 text-[#9B9BAD]">No positions found</p>
        ) : (
          <div className="space-y-3">
            {filteredPositions.map(pos => {
              const isExpanded = expandedPosition === pos.id;
              const progress = pos.openings ? Math.round((pos.filled / pos.openings) * 100) : 0;
              const posCandidates = (candidates || []).filter(c => c.position === pos.title);

              return (
                <div key={pos.id} className="rounded-2xl border border-[#E8E7E2] bg-[#FAFAF8] overflow-hidden hover:shadow-sm transition-all">
                  <button
                    onClick={() => setExpandedPosition(isExpanded ? null : pos.id)}
                    className="w-full flex items-center justify-between p-4 text-left hover:bg-[#F4F3EF] transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-bold text-[#1A1A2E] truncate">{pos.title}</span>
                        <StatusBadge status={pos.status} />
                        <PriorityBadge priority={pos.priority} />
                      </div>
                      <div className="flex items-center gap-3 mt-1.5 text-[11px] text-[#9B9BAD] font-medium">
                        {pos.location && <span className="flex items-center gap-1"><FiMapPin className="w-3 h-3" />{pos.location}</span>}
                        <span>{pos.type}</span>
                        <span>{pos.candidateCount} candidate{pos.candidateCount !== 1 ? 's' : ''}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="relative w-10 h-10">
                        <svg className="w-10 h-10 -rotate-90" viewBox="0 0 36 36">
                          <path d="M18 2.0845a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#E8E7E2" strokeWidth="3" />
                          <path d="M18 2.0845a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#1B4DA0" strokeWidth="3" strokeDasharray={`${progress}, 100`} strokeLinecap="round" />
                        </svg>
                        <span className="absolute inset-0 flex items-center justify-center text-[9px] font-bold text-[#1A1A2E]">{pos.filled}/{pos.openings}</span>
                      </div>
                      {isExpanded ? <FiChevronUp className="w-4 h-4 text-[#9B9BAD]" /> : <FiChevronDown className="w-4 h-4 text-[#9B9BAD]" />}
                    </div>
                  </button>

                  {isExpanded && (
                    <div className="border-t border-[#E8E7E2] p-4">
                      {posCandidates.length > 0 ? (
                        <>
                          <p className="text-[11px] font-bold text-[#9B9BAD] uppercase tracking-widest mb-3">Candidates in Pipeline</p>
                          <div className="space-y-2">
                            {posCandidates.map(c => (
                              <div key={c.id} className="flex items-center justify-between py-2 px-3 rounded-xl bg-white border border-[#E8E7E2]">
                                <div className="flex items-center gap-2.5">
                                  <div className="w-7 h-7 rounded-full bg-[#EEF2FB] flex items-center justify-center text-[#1B4DA0] text-[10px] font-bold">
                                    {c.name?.split(' ').map(n => n[0]).join('').slice(0, 2)}
                                  </div>
                                  <span className="text-xs font-semibold text-[#1A1A2E]">{c.name}</span>
                                </div>
                                <span className="text-[10px] font-bold px-2.5 py-1 rounded-lg bg-slate-100 text-slate-600">
                                  {c.stage}
                                </span>
                              </div>
                            ))}
                          </div>
                        </>
                      ) : (
                        <p className="text-xs text-center text-[#9B9BAD]">No candidates yet for this position</p>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
