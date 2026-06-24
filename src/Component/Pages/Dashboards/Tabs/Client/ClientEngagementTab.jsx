import { useState } from 'react';
import { FiHeart, FiSearch, FiCalendar, FiUsers, FiAward, FiStar, FiGift } from 'react-icons/fi';

/* ── Employee Engagement: Activities and events ── */
export default function ClientEngagementTab({ isDarkMode, clientData }) {
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('upcoming');

  const text = isDarkMode ? 'text-gray-100' : 'text-gray-800';
  const textSub = isDarkMode ? 'text-gray-400' : 'text-gray-500';
  const cardBg = isDarkMode ? 'bg-[#282440]' : 'bg-white';
  const border = isDarkMode ? 'border-[#3a3556]' : 'border-[#ece8f8]';
  const inputBg = isDarkMode ? 'bg-[#322d4a] text-gray-100' : 'bg-[#f2f0fa] text-gray-800';
  const bgSub = isDarkMode ? 'bg-[#1e1b2e]' : 'bg-[#f7f5fc]';

  const activities = [
    { id: 1, title: 'Monthly Team Building', type: 'Team Activity', date: '2026-03-25', status: 'upcoming', participants: 24, description: 'Indoor games and team challenges at office premises' },
    { id: 2, title: 'Q1 Employee Awards', type: 'Recognition', date: '2026-03-30', status: 'upcoming', participants: 40, description: 'Quarterly recognition ceremony for top performers' },
    { id: 3, title: 'Wellness Wednesday', type: 'Wellness', date: '2026-03-19', status: 'upcoming', participants: 15, description: 'Yoga and meditation session with certified instructor' },
    { id: 4, title: 'Birthday Celebrations - March', type: 'Celebration', date: '2026-03-28', status: 'upcoming', participants: 8, description: 'Monthly birthday celebration for March birthdays' },
    { id: 5, title: 'Holi Celebration', type: 'Festival', date: '2026-03-14', status: 'completed', participants: 35, description: 'Office Holi celebration with colours and sweets' },
    { id: 6, title: 'Knowledge Sharing Session', type: 'Learning', date: '2026-03-11', status: 'completed', participants: 20, description: 'Cross-functional knowledge sharing on industry trends' },
    { id: 7, title: 'February Employee of the Month', type: 'Recognition', date: '2026-03-05', status: 'completed', participants: 1, description: 'Recognition: Rajesh Kumar - Outstanding performance in Q4 delivery' },
    { id: 8, title: 'CSR Activity - Tree Plantation', type: 'CSR', date: '2026-03-08', status: 'completed', participants: 18, description: 'Planted 50 trees at nearby community park' },
  ];

  const typeIcons = {
    'Team Activity': FiUsers,
    'Recognition': FiAward,
    'Wellness': FiHeart,
    'Celebration': FiGift,
    'Festival': FiStar,
    'Learning': FiCalendar,
    'CSR': FiHeart,
  };

  const typeColors = {
    'Team Activity': 'blue',
    'Recognition': 'amber',
    'Wellness': 'green',
    'Celebration': 'pink',
    'Festival': 'purple',
    'Learning': 'indigo',
    'CSR': 'teal',
  };

  const filtered = activities.filter(a => {
    if (activeTab === 'upcoming' && a.status !== 'upcoming') return false;
    if (activeTab === 'completed' && a.status !== 'completed') return false;
    if (search) {
      const q = search.toLowerCase();
      return a.title.toLowerCase().includes(q) || a.type.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2.5 rounded-xl bg-gradient-to-br from-pink-500 to-rose-600 text-white shadow">
          <FiHeart size={22} />
        </div>
        <div>
          <h2 className={`text-xl font-bold ${text}`}>Employee Engagement</h2>
          <p className={`text-sm ${textSub}`}>Activities, events, and recognition programs</p>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Total Activities', value: activities.length, icon: FiCalendar, color: 'pink' },
          { label: 'Upcoming', value: activities.filter(a => a.status === 'upcoming').length, icon: FiStar, color: 'blue' },
          { label: 'Completed', value: activities.filter(a => a.status === 'completed').length, icon: FiAward, color: 'green' },
          { label: 'Total Participation', value: activities.reduce((s, a) => s + a.participants, 0), icon: FiUsers, color: 'violet' },
        ].map(c => (
          <div key={c.label} className={`${cardBg} rounded-xl ${border} border p-4 flex items-center gap-3`}>
            <div className={`p-2 rounded-lg bg-${c.color}-100 ${isDarkMode ? `bg-${c.color}-900/30` : ''}`}>
              <c.icon size={18} className={`text-${c.color}-500`} />
            </div>
            <div>
              <p className={`text-2xl font-bold ${text}`}>{c.value}</p>
              <p className={`text-xs ${textSub}`}>{c.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Search + Tabs */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className={`flex items-center gap-2 px-3 py-2 rounded-xl ${inputBg} flex-1`}>
          <FiSearch className={textSub} size={16} />
          <input type="text" placeholder="Search activities…" value={search} onChange={e => setSearch(e.target.value)}
            className={`bg-transparent outline-none text-sm w-full ${text}`} />
        </div>
        <div className="flex gap-2">
          {['all', 'upcoming', 'completed'].map(t => (
            <button key={t} onClick={() => setActiveTab(t)}
              className={`px-3 py-2 rounded-xl text-xs font-semibold capitalize transition-colors ${
                activeTab === t ? 'bg-pink-500 text-white' : `${bgSub} ${text} ${border} border`
              }`}>{t}</button>
          ))}
        </div>
      </div>

      {/* Activity cards */}
      {filtered.length === 0 ? (
        <div className={`text-center py-16 ${textSub}`}>
          <FiHeart size={40} className="mx-auto mb-3 opacity-30" />
          <p className="font-medium">No activities found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {filtered.map(a => {
            const IconComp = typeIcons[a.type] || FiCalendar;
            const color = typeColors[a.type] || 'gray';
            return (
              <div key={a.id} className={`${cardBg} rounded-xl ${border} border p-4 space-y-3`}>
                <div className="flex items-start gap-3">
                  <div className={`p-2.5 rounded-lg bg-${color}-100 ${isDarkMode ? `bg-${color}-900/30` : ''} shrink-0`}>
                    <IconComp size={18} className={`text-${color}-500`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-semibold ${text}`}>{a.title}</p>
                    <p className={`text-xs ${textSub} mt-0.5`}>{a.description}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 text-xs">
                    <span className={`flex items-center gap-1 ${textSub}`}>
                      <FiCalendar size={12} /> {new Date(a.date).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                    </span>
                    <span className={`flex items-center gap-1 ${textSub}`}>
                      <FiUsers size={12} /> {a.participants}
                    </span>
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-medium ${bgSub} ${text}`}>{a.type}</span>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                    a.status === 'upcoming' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'
                  }`}>{a.status}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
