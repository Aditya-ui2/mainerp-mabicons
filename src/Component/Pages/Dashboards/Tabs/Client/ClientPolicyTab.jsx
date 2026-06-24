import { useState, useEffect } from 'react';
import { FiSearch, FiDownload, FiEye, FiShield, FiFile, FiImage, FiFileText } from 'react-icons/fi';
import { jwtDecode } from 'jwt-decode';
import { getClientDocuments } from '../../../service/api';

/* ── Policy & Documents: Fetch from Google Drive API ── */
export default function ClientPolicyTab() {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Map backend document keys to UI presentation data
  const docMetadataMap = {
    currentHRPolicies:      { title: 'Current HR Policies',      category: 'HR Policies',  icon: FiShield },
    leaveBalance:           { title: 'Leave Balance Details',    category: 'HR Policies',  icon: FiShield },
    employeeMasterDatabase: { title: 'Employee Master Database', category: 'Company Docs', icon: FiFileText },
    currentSalaryStructure: { title: 'Salary Structure',         category: 'Company Docs', icon: FiFileText },
    previousSalarySheets:   { title: 'Salary Sheets Archive',    category: 'Company Docs', icon: FiFileText },
    companyLogo:            { title: 'Company Logo',             category: 'Brand Assets', icon: FiImage },
    letterhead:             { title: 'Company Letterhead',       category: 'Brand Assets', icon: FiImage },
  };

  useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      const decoded = jwtDecode(token);
      
      const res = await getClientDocuments(decoded.id);
      
      if (res?.success && res?.documents) {
        // Convert the returned key-value object into an array
        const docsArray = Object.entries(res.documents).map(([key, data]) => {
          const meta = docMetadataMap[key] || { title: key, category: 'Other', icon: FiFile };
          return {
            id: key,
            ...meta,
            ...data
          };
        });
        // Sort organically: available ones first
        docsArray.sort((a, b) => (a.status === 'available' ? -1 : 1) - (b.status === 'available' ? -1 : 1));
        setDocuments(docsArray);
      }
    } catch (e) {
      console.error('Failed to load client documents', e);
    } finally {
      setLoading(false);
    }
  };

  // Derive categories from available documents dynamically
  const categories = ['All', ...new Set(documents.map(d => d.category))];

  const filtered = documents.filter(d => {
    if (activeCategory !== 'All' && d.category !== activeCategory) return false;
    if (search) {
      const q = search.toLowerCase();
      return d.title.toLowerCase().includes(q) || d.category.toLowerCase().includes(q);
    }
    return true;
  });

  const getFileCategoryColor = (category) => {
    switch (category) {
      case 'HR Policies': return 'text-blue-600 bg-blue-100/50';
      case 'Company Docs': return 'text-violet-600 bg-violet-100/50';
      case 'Brand Assets': return 'text-amber-600 bg-amber-100/50';
      default: return 'text-green-600 bg-green-100/50';
    }
  };

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
          <h1 className="text-4xl font-bold text-[#1A1A2E] tracking-tight font-syne mb-1">Company Documents</h1>
          <p className="text-sm font-medium text-[#9B9BAD] mt-1">Access your securely stored HR policies & onboarding files</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-white border border-[#E8E7E2] w-full md:w-72 shadow-sm focus-within:border-[#1B4DA0] transition-colors">
          <FiSearch className="text-[#9B9BAD]" size={16} />
          <input type="text" placeholder="Search files…" value={search} onChange={e => setSearch(e.target.value)}
            className="bg-transparent outline-none text-sm text-[#1A1A2E] font-semibold w-full font-jakarta" />
        </div>
      </div>

      {/* ── Category Filter Pills ── */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {categories.map(cat => (
          <button key={cat} onClick={() => setActiveCategory(cat)}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              activeCategory === cat 
                ? 'bg-[#1B4DA0] text-white shadow-md' 
                : 'bg-white text-[#6B6B7E] border border-[#E8E7E2] hover:border-[#1B4DA0]'
            }`}>{cat}</button>
        ))}
      </div>

      {/* ── Main List Panel ── */}
      <div className="bg-white rounded-[32px] p-8 border border-[#E8E7E2] shadow-sm">
        <h2 className="text-xl font-bold text-[#1A1A2E] flex items-center gap-3 mb-6 font-syne">
          <div className="w-8 h-8 flex items-center justify-center flex-shrink-0">
            <FiShield className="w-5 h-5 text-[#1B4DA0]" />
          </div>
          Authorized Files
        </h2>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="relative"><div className="w-12 h-12 border-4 border-slate-100 rounded-full" /><div className="absolute inset-0 w-12 h-12 border-4 border-[#1B4DA0] border-t-transparent rounded-full animate-spin" /></div>
            <p className="text-xs font-bold text-[#9B9BAD] uppercase tracking-widest">Retrieving Secure Documents...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-20 text-center border-2 border-dashed border-[#F4F3EF] rounded-2xl flex flex-col items-center gap-4">
            <div className="w-14 h-14 bg-[#F4F3EF] rounded-2xl flex items-center justify-center text-[#9B9BAD]"><FiFileText size={24} /></div>
            <div>
              <p className="text-sm font-bold text-[#1A1A2E]">No files match your search</p>
              <p className="text-xs text-[#9B9BAD] mt-1 font-semibold">Try modifying the search or category filter</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filtered.map(d => {
              const available = d.status === 'available';
              const Icon = d.icon;
              return (
                <div key={d.id} className={`p-5 rounded-[20px] border ${available ? 'border-[#E8E7E2] hover:border-[#1B4DA0] bg-white hover:shadow-md' : 'border-dashed border-gray-200 bg-gray-50/50 opacity-70'} transition-all flex flex-col justify-between gap-4 group h-full`}>
                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-xl flex-shrink-0 ${available ? getFileCategoryColor(d.category) : 'text-gray-400 bg-gray-100'}`}>
                      <Icon size={20} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-widest bg-slate-100 text-slate-500 border border-slate-200">
                          {d.category}
                        </span>
                        {!available && (
                          <span className="px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-widest bg-red-50 text-red-500 border border-red-100">
                            Missing File
                          </span>
                        )}
                      </div>
                      <h3 className={`text-sm md:text-base font-bold truncate font-jakarta ${available ? 'text-[#1A1A2E]' : 'text-gray-500'}`}>
                        {d.title}
                      </h3>
                      {available && d.name && (
                        <p className="text-xs font-semibold text-[#9B9BAD] mt-1 truncate" title={d.name}>{d.name}</p>
                      )}
                      {!available && (
                        <p className="text-xs font-semibold text-gray-400 mt-1">Has not been safely uploaded yet</p>
                      )}
                    </div>
                  </div>

                  {available && (
                    <div className="flex flex-row items-center gap-2 pt-3 mt-auto border-t border-[#F4F3EF]">
                      <a href={d.viewLink} target="_blank" rel="noopener noreferrer" className="flex-1 px-3 py-2 rounded-lg text-xs font-bold text-[#6B6B7E] bg-white border border-[#E8E7E2] hover:bg-[#1B4DA0] hover:text-white hover:border-[#1B4DA0] transition-all text-center flex items-center justify-center gap-2">
                        <FiEye size={14} /> Open
                      </a>
                      <a href={d.downloadLink} download className="flex-1 px-3 py-2 rounded-lg text-xs font-bold text-white bg-[#1A1A2E] hover:bg-[#2A2A3E] shadow text-center flex items-center justify-center gap-2 transition-all">
                        <FiDownload size={14} /> Save
                      </a>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  );
}
