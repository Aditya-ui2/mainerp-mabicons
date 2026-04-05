import { useState, useEffect } from 'react';
import { FiSearch, FiUsers } from 'react-icons/fi';
import { jwtDecode } from 'jwt-decode';
import { getClientDashboardOverview } from '../../../../service/api';

const STAGE_CONFIG = {
  screening: { label: 'Screening', bg: 'bg-slate-100 text-slate-600' },
  phoneInterview: { label: 'Phone Interview', bg: 'bg-yellow-50 text-yellow-600' },
  technical: { label: 'Technical Round', bg: 'bg-amber-50 text-amber-600' },
  hrRound: { label: 'HR Round', bg: 'bg-orange-50 text-orange-600' },
  clientInterview: { label: 'Client Interview', bg: 'bg-orange-50 text-orange-600' },
  offerSent: { label: 'Offer Sent', bg: 'bg-purple-50 text-purple-600' },
  joined: { label: 'Joined', bg: 'bg-blue-50 text-blue-600' },
  rejected: { label: 'Rejected', bg: 'bg-gray-50 text-gray-500' },
};

const stageKeys = Object.keys(STAGE_CONFIG);

export default function ClientCandidatesTab() {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [stageFilter, setStageFilter] = useState('all');

  useEffect(() => {
    (async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;
        const decoded = jwtDecode(token);
        const res = await getClientDashboardOverview(decoded.id);
        if (res?.success && res.data?.recruitment) setCandidates(res.data.recruitment.candidates || []);
      } catch (err) {
        console.error('Failed to load candidates:', err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filtered = (candidates || [])
    .filter(c => stageFilter === 'all' || c.stage === STAGE_CONFIG[stageFilter]?.label)
    .filter(c => !searchQuery || c.name?.toLowerCase().includes(searchQuery.toLowerCase()) || c.position?.toLowerCase().includes(searchQuery.toLowerCase()));

  // Stage counts
  const stageCounts = (candidates || []).reduce((acc, c) => {
    const key = stageKeys.find(k => STAGE_CONFIG[k].label === c.stage) || 'screening';
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-72 gap-3">
        <div className="relative">
          <div className="w-12 h-12 border-4 border-blue-200 rounded-full" />
          <div className="absolute inset-0 w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
        <p className="text-sm font-medium text-gray-500">Loading candidates...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[#1A1A2E]" style={{ fontFamily: "'Syne', sans-serif" }}>
          Candidates
        </h1>
        <p className="text-sm text-[#6B6B7E] mt-1 font-medium">View and track all candidates in your pipeline</p>
      </div>

      {/* Stage Chips */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setStageFilter('all')}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border ${
            stageFilter === 'all'
              ? 'bg-[#1A1A2E] text-white border-[#1A1A2E]'
              : 'bg-white text-[#1A1A2E] border-[#E8E7E2] hover:bg-[#F4F3EF]'
          }`}
        >
          All ({candidates?.length || 0})
        </button>
        {stageKeys.filter(k => k !== 'rejected').map(key => (
          <button
            key={key}
            onClick={() => setStageFilter(key)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border ${
              stageFilter === key
                ? 'bg-[#1A1A2E] text-white border-[#1A1A2E]'
                : `bg-white text-[#1A1A2E] border-[#E8E7E2] hover:bg-[#F4F3EF]`
            }`}
          >
            {STAGE_CONFIG[key].label} ({stageCounts[key] || 0})
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9B9BAD]" />
        <input
          type="text"
          placeholder="Search by name or position..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 text-sm border border-[#E8E7E2] rounded-xl bg-white text-[#1A1A2E] placeholder:text-[#9B9BAD] focus:outline-none focus:ring-2 focus:ring-blue-200"
        />
      </div>

      {/* Candidates Grid */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-[32px] border border-[#E8E7E2] p-12 text-center shadow-sm">
          <FiUsers className="w-10 h-10 mx-auto mb-3 text-[#E8E7E2]" />
          <p className="text-sm text-[#9B9BAD]">No candidates found</p>
        </div>
      ) : (
        <div className="bg-white rounded-[32px] p-6 border border-[#E8E7E2] shadow-sm">
          <h2 className="text-lg font-bold text-[#1A1A2E] flex items-center gap-2 mb-5" style={{ fontFamily: "'Syne', sans-serif" }}>
            <FiUsers className="w-5 h-5 text-[#1B4DA0]" /> Candidates ({filtered.length})
          </h2>
          <div className="overflow-x-auto">
            <div className="space-y-1">
              <div className="grid grid-cols-5 gap-4 pb-4 text-[10px] font-bold text-[#9B9BAD] uppercase tracking-[2px] border-b border-[#F4F3EF]">
                <div>Candidate</div>
                <div>Position</div>
                <div>Stage</div>
                <div>Last Updated</div>
                <div>Status</div>
              </div>
              {filtered.map(c => {
                const stageKey = stageKeys.find(k => STAGE_CONFIG[k].label === c.stage);
                const stageBg = stageKey ? STAGE_CONFIG[stageKey].bg : 'bg-slate-100 text-slate-600';
                return (
                  <div key={c.id} className="grid grid-cols-5 gap-4 py-3.5 border-b border-[#F4F3EF] last:border-0 hover:bg-[#FAFAF8] transition-colors px-2 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#EEF2FB] flex items-center justify-center text-[#1B4DA0] text-xs font-bold flex-shrink-0">
                        {c.name?.split(' ').map(n => n[0]).join('').slice(0, 2)}
                      </div>
                      <span className="text-sm font-semibold text-[#1A1A2E] truncate">{c.name}</span>
                    </div>
                    <div className="text-sm text-[#9B9BAD] flex items-center truncate">{c.position || '—'}</div>
                    <div className="flex items-center">
                      <span className={`text-[10px] font-bold px-2.5 py-1 rounded-lg ${stageBg}`}>
                        {c.stage}
                      </span>
                    </div>
                    <div className="text-sm text-[#9B9BAD] flex items-center">
                      {c.updatedAt ? new Date(c.updatedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : '—'}
                    </div>
                    <div className="flex items-center">
                      {c.stage === 'Rejected' ? (
                        <span className="text-[10px] font-bold px-2.5 py-1 rounded-lg bg-red-50 text-red-500">Rejected</span>
                      ) : c.stage === 'Joined' ? (
                        <span className="text-[10px] font-bold px-2.5 py-1 rounded-lg bg-green-50 text-green-600">Hired</span>
                      ) : (
                        <span className="text-[10px] font-bold px-2.5 py-1 rounded-lg bg-blue-50 text-blue-500">Active</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
