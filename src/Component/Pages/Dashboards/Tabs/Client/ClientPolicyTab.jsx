import { useState } from 'react';
import { FiFileText, FiSearch, FiDownload, FiEye, FiShield, FiFile, FiBookOpen } from 'react-icons/fi';

/* ── Policy & Documents: Check policies and company documents ── */
export default function ClientPolicyTab({ isDarkMode, clientData }) {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  const text = isDarkMode ? 'text-gray-100' : 'text-gray-800';
  const textSub = isDarkMode ? 'text-gray-400' : 'text-gray-500';
  const cardBg = isDarkMode ? 'bg-[#282440]' : 'bg-white';
  const border = isDarkMode ? 'border-[#3a3556]' : 'border-[#ece8f8]';
  const inputBg = isDarkMode ? 'bg-[#322d4a] text-gray-100' : 'bg-[#f2f0fa] text-gray-800';
  const bgSub = isDarkMode ? 'bg-[#1e1b2e]' : 'bg-[#f7f5fc]';
  const hover = isDarkMode ? 'hover:bg-[#3a3556]' : 'hover:bg-[#ece8f8]';

  const categories = ['All', 'HR Policies', 'Compliance', 'Company Docs', 'Templates'];

  const policies = [
    { id: 1, title: 'Employee Leave Policy', category: 'HR Policies', updated: '2026-02-15', pages: 12, status: 'Active' },
    { id: 2, title: 'Code of Conduct', category: 'HR Policies', updated: '2026-01-10', pages: 8, status: 'Active' },
    { id: 3, title: 'Anti-Harassment Policy', category: 'HR Policies', updated: '2025-12-20', pages: 6, status: 'Active' },
    { id: 4, title: 'GST Compliance Guide', category: 'Compliance', updated: '2026-03-01', pages: 15, status: 'Active' },
    { id: 5, title: 'PF & ESI Handbook', category: 'Compliance', updated: '2026-02-28', pages: 10, status: 'Active' },
    { id: 6, title: 'Labour Law Summary', category: 'Compliance', updated: '2026-01-15', pages: 20, status: 'Active' },
    { id: 7, title: 'Service Agreement', category: 'Company Docs', updated: '2026-03-10', pages: 4, status: 'Active' },
    { id: 8, title: 'NDA Template', category: 'Templates', updated: '2026-01-05', pages: 3, status: 'Active' },
    { id: 9, title: 'Offer Letter Template', category: 'Templates', updated: '2025-11-20', pages: 2, status: 'Active' },
    { id: 10, title: 'Resignation Acceptance', category: 'Templates', updated: '2025-12-01', pages: 1, status: 'Active' },
  ];

  const filtered = policies.filter(p => {
    if (activeCategory !== 'All' && p.category !== activeCategory) return false;
    if (search) {
      const q = search.toLowerCase();
      return p.title.toLowerCase().includes(q) || p.category.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2.5 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow">
          <FiFileText size={22} />
        </div>
        <div>
          <h2 className={`text-xl font-bold ${text}`}>Policy & Documents</h2>
          <p className={`text-sm ${textSub}`}>Access and review company policies and documents</p>
        </div>
      </div>

      {/* Category summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'HR Policies', count: policies.filter(p => p.category === 'HR Policies').length, icon: FiShield, color: 'blue' },
          { label: 'Compliance', count: policies.filter(p => p.category === 'Compliance').length, icon: FiBookOpen, color: 'green' },
          { label: 'Company Docs', count: policies.filter(p => p.category === 'Company Docs').length, icon: FiFile, color: 'violet' },
          { label: 'Templates', count: policies.filter(p => p.category === 'Templates').length, icon: FiFileText, color: 'amber' },
        ].map(c => (
          <div key={c.label} className={`${cardBg} rounded-xl ${border} border p-4 flex items-center gap-3`}>
            <div className={`p-2 rounded-lg bg-${c.color}-100 ${isDarkMode ? `bg-${c.color}-900/30` : ''}`}>
              <c.icon size={18} className={`text-${c.color}-500`} />
            </div>
            <div>
              <p className={`text-xl font-bold ${text}`}>{c.count}</p>
              <p className={`text-xs ${textSub}`}>{c.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Search + Category filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className={`flex items-center gap-2 px-3 py-2 rounded-xl ${inputBg} flex-1`}>
          <FiSearch className={textSub} size={16} />
          <input
            type="text" placeholder="Search policies…"
            value={search} onChange={e => setSearch(e.target.value)}
            className={`bg-transparent outline-none text-sm w-full ${text}`}
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {categories.map(cat => (
            <button key={cat} onClick={() => setActiveCategory(cat)}
              className={`px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${
                activeCategory === cat
                  ? 'bg-amber-500 text-white'
                  : `${bgSub} ${text} ${border} border`
              }`}
            >{cat}</button>
          ))}
        </div>
      </div>

      {/* Policy Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {filtered.map(p => (
          <div key={p.id} className={`${cardBg} rounded-xl ${border} border p-4 flex items-start gap-4 ${hover} transition-colors`}>
            <div className={`p-2.5 rounded-lg ${
              p.category === 'HR Policies' ? 'bg-blue-100 text-blue-600' :
              p.category === 'Compliance' ? 'bg-green-100 text-green-600' :
              p.category === 'Company Docs' ? 'bg-violet-100 text-violet-600' :
              'bg-amber-100 text-amber-600'
            }`}>
              <FiFileText size={20} />
            </div>
            <div className="flex-1 min-w-0">
              <p className={`text-sm font-semibold ${text} truncate`}>{p.title}</p>
              <p className={`text-xs ${textSub} mt-0.5`}>{p.category} • {p.pages} pages</p>
              <p className={`text-[10px] ${textSub}`}>Updated: {new Date(p.updated).toLocaleDateString()}</p>
            </div>
            <div className="flex gap-2 shrink-0">
              <button className={`p-2 rounded-lg ${hover} ${textSub} transition-colors`} title="View">
                <FiEye size={16} />
              </button>
              <button className={`p-2 rounded-lg ${hover} ${textSub} transition-colors`} title="Download">
                <FiDownload size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>
      {filtered.length === 0 && (
        <div className={`text-center py-12 ${textSub}`}>
          <FiFileText size={36} className="mx-auto mb-2 opacity-30" />
          <p className="font-medium">No policies found</p>
        </div>
      )}
    </div>
  );
}
