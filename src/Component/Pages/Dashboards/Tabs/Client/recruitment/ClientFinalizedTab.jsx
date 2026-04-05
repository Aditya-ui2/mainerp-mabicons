import { useState, useEffect } from 'react';
import { FiCheckCircle, FiSearch, FiMail } from 'react-icons/fi';
import { UserCheck } from 'lucide-react';
import { jwtDecode } from 'jwt-decode';
import { getClientDashboardOverview } from '../../../../service/api';

export default function ClientFinalizedTab() {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewFilter, setViewFilter] = useState('all');

  useEffect(() => {
    (async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;
        const decoded = jwtDecode(token);
        const res = await getClientDashboardOverview(decoded.id);
        if (res?.success && res.data?.recruitment) setCandidates(res.data.recruitment.candidates || []);
      } catch (err) {
        console.error('Failed to load finalized data:', err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const allCandidates = candidates;

  // Finalized = Offer Sent, Joined, or Shortlisted (Client Interview passed)
  const shortlisted = allCandidates.filter(c => c.stage === 'Client Interview' || c.stage === 'Offer Sent' || c.stage === 'Joined');
  const offerSent = allCandidates.filter(c => c.stage === 'Offer Sent');
  const hired = allCandidates.filter(c => c.stage === 'Joined');

  const displayList = (() => {
    switch (viewFilter) {
      case 'shortlisted': return shortlisted;
      case 'offer': return offerSent;
      case 'hired': return hired;
      default: return shortlisted;
    }
  })();

  const filtered = displayList.filter(c =>
    !searchQuery || c.name?.toLowerCase().includes(searchQuery.toLowerCase()) || c.position?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-72 gap-3">
        <div className="relative">
          <div className="w-12 h-12 border-4 border-blue-200 rounded-full" />
          <div className="absolute inset-0 w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
        <p className="text-sm font-medium text-gray-500">Loading finalized data...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[#1A1A2E]" style={{ fontFamily: "'Syne', sans-serif" }}>
          Finalized & Offers
        </h1>
        <p className="text-sm text-[#6B6B7E] mt-1 font-medium">Shortlisted candidates, offers sent, and hires</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {[
          { label: 'Shortlisted', count: shortlisted.length, color: 'text-amber-600', icon: FiCheckCircle },
          { label: 'Offer Sent', count: offerSent.length, color: 'text-purple-600', icon: FiMail },
          { label: 'Hired', count: hired.length, color: 'text-[#1B4DA0]', icon: UserCheck },
        ].map((s, i) => {
          const Icon = s.icon;
          return (
            <div key={i} className="bg-white rounded-2xl border border-[#E8E7E2] p-5 shadow-sm">
              <div className="flex items-center gap-3 mb-2">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center bg-[#F4F3EF] ${s.color}`}>
                  <Icon size={18} />
                </div>
              </div>
              <p className={`text-3xl font-extrabold ${s.color}`}>{s.count}</p>
              <p className="text-[10px] font-bold text-[#9B9BAD] uppercase tracking-widest mt-1">{s.label}</p>
            </div>
          );
        })}
      </div>

      {/* Filter Chips */}
      <div className="flex flex-wrap items-center gap-3">
        {[
          { key: 'all', label: 'All Shortlisted' },
          { key: 'offer', label: 'Offer Sent' },
          { key: 'hired', label: 'Hired' },
        ].map(f => (
          <button
            key={f.key}
            onClick={() => setViewFilter(f.key)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border ${
              viewFilter === f.key
                ? 'bg-[#1A1A2E] text-white border-[#1A1A2E]'
                : 'bg-white text-[#1A1A2E] border-[#E8E7E2] hover:bg-[#F4F3EF]'
            }`}
          >
            {f.label}
          </button>
        ))}
        <div className="flex-1" />
        <div className="relative min-w-[200px]">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9B9BAD]" />
          <input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm border border-[#E8E7E2] rounded-xl bg-white text-[#1A1A2E] placeholder:text-[#9B9BAD] focus:outline-none focus:ring-2 focus:ring-blue-200"
          />
        </div>
      </div>

      {/* Candidates List */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-[32px] border border-[#E8E7E2] p-12 text-center shadow-sm">
          <UserCheck className="w-10 h-10 mx-auto mb-3 text-[#E8E7E2]" />
          <p className="text-sm text-[#9B9BAD]">No finalized candidates found</p>
        </div>
      ) : (
        <div className="bg-white rounded-[32px] p-6 border border-[#E8E7E2] shadow-sm">
          <div className="space-y-3">
            {filtered.map(c => {
              const stageBg = c.stage === 'Joined'
                ? 'bg-blue-50 text-[#1B4DA0]'
                : c.stage === 'Offer Sent'
                  ? 'bg-purple-50 text-purple-600'
                  : 'bg-amber-50 text-amber-600';

              return (
                <div key={c.id} className="flex items-center justify-between p-4 rounded-2xl border border-[#E8E7E2] bg-[#FAFAF8] hover:shadow-sm transition-all">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#EEF2FB] flex items-center justify-center text-[#1B4DA0] text-sm font-bold">
                      {c.name?.split(' ').map(n => n[0]).join('').slice(0, 2)}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-[#1A1A2E]">{c.name}</p>
                      <p className="text-xs text-[#9B9BAD] font-medium">{c.position || '—'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-lg ${stageBg}`}>
                      {c.stage}
                    </span>
                    {c.updatedAt && (
                      <span className="text-[11px] text-[#9B9BAD]">
                        {new Date(c.updatedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
