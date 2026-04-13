import { useState, useEffect } from 'react';
import { FiUsers, FiSearch, FiMail, FiPhone, FiDatabase } from 'react-icons/fi';
import { jwtDecode } from 'jwt-decode';
import { getClientMasterData } from '../../../service/api';

/* ── Master Data: Connected to real backend attendance directory ── */
export default function ClientMasterDataTab() {
  const [search, setSearch] = useState('');
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMasterData();
  }, []);

  const loadMasterData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      const decoded = jwtDecode(token);
      
      const res = await getClientMasterData(decoded.id);
      if (res?.success && res?.masterData) {
        setEmployees(res.masterData);
      }
    } catch (e) {
      console.error('Failed to load master data', e);
    } finally {
      setLoading(false);
    }
  };

  const filtered = employees.filter(e => {
    if (!search) return true;
    const q = search.toLowerCase();
    return e.name.toLowerCase().includes(q) || e.designation.toLowerCase().includes(q) || e.department.toLowerCase().includes(q) || e.email.toLowerCase().includes(q);
  });

  const departments = [...new Set(employees.map(e => e.department))];

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
          <h1 className="text-4xl font-bold text-[#1A1A2E] tracking-tight font-syne mb-1">Master Data</h1>
          <p className="text-sm font-medium text-[#9B9BAD] mt-1">Employee centralized directory & official records</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-white border border-[#E8E7E2] w-full md:w-80 shadow-sm focus-within:border-[#1B4DA0] transition-colors">
          <FiSearch className="text-[#9B9BAD]" size={16} />
          <input type="text" placeholder="Search by name, dept, or role…" value={search} onChange={e => setSearch(e.target.value)}
            className="bg-transparent outline-none text-sm text-[#1A1A2E] font-semibold w-full font-jakarta" />
        </div>
      </div>

      {/* ── Summary Stats ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-5 mb-10">
        {[
          { label: 'Total Employees', value: employees.length, color: 'text-[#1B4DA0]', bg: 'bg-[#1B4DA0]/10' },
          { label: 'Active', value: employees.filter(e => e.status === 'Active').length, color: 'text-emerald-500', bg: 'bg-emerald-100/50' },
          { label: 'On Leave', value: employees.filter(e => e.status === 'On Leave').length, color: 'text-amber-500', bg: 'bg-amber-100/50' },
          { label: 'Departments', value: departments.length, color: 'text-violet-500', bg: 'bg-violet-100/50' },
        ].map(s => (
          <div key={s.label} className="bg-white p-6 rounded-[28px] border border-[#F4F3EF] shadow-sm hover:shadow-md transition-all duration-300 group">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${s.bg} ${s.color} transition-transform duration-300 group-hover:scale-110`}>
              <FiUsers size={18} />
            </div>
            <p className={`text-3xl font-extrabold ${s.color} mb-1 leading-none`}>{s.value}</p>
            <p className="text-[10px] font-bold text-[#9B9BAD] uppercase tracking-widest">{s.label}</p>
          </div>
        ))}
      </div>

      {/* ── Search Bar Filter ── */}
      <div className="bg-white rounded-[32px] p-8 border border-[#E8E7E2] shadow-sm">
        <h2 className="text-xl font-bold text-[#1A1A2E] flex items-center gap-3 mb-6 font-syne">
          <div className="w-8 h-8 flex items-center justify-center flex-shrink-0">
            <FiDatabase className="w-5 h-5 text-[#1B4DA0]" />
          </div>
          Employee Directory
        </h2>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="relative"><div className="w-12 h-12 border-4 border-slate-100 rounded-full" /><div className="absolute inset-0 w-12 h-12 border-4 border-[#1B4DA0] border-t-transparent rounded-full animate-spin" /></div>
            <p className="text-xs font-bold text-[#9B9BAD] uppercase tracking-widest">Loading Master Data...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-20 text-center border-2 border-dashed border-[#F4F3EF] rounded-2xl flex flex-col items-center gap-4">
            <div className="w-14 h-14 bg-[#F4F3EF] rounded-2xl flex items-center justify-center text-[#9B9BAD]"><FiUsers size={24} /></div>
            <div>
              <p className="text-sm font-bold text-[#1A1A2E]">No employees found</p>
              <p className="text-xs text-[#9B9BAD] mt-1 font-semibold">Your employee tracker is currently empty or doesn't match the search.</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map(emp => (
              <div key={emp.id} className="p-5 rounded-[20px] bg-white border border-[#E8E7E2] hover:border-[#1B4DA0] transition-colors shadow-sm flex flex-col gap-4">
                <div className="flex items-start gap-4">
                  <div className="h-12 w-12 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-[#1A1A2E] text-sm font-black font-syne">
                    {emp.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <h3 className="text-sm font-bold text-[#1A1A2E] truncate font-jakarta leading-tight">{emp.name}</h3>
                      <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-widest flex-shrink-0 ${
                        emp.status === 'Active' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-amber-50 text-amber-600 border border-amber-100'
                      }`}>
                        {emp.status}
                      </span>
                    </div>
                    <p className="text-xs font-semibold text-[#1B4DA0] truncate">{emp.designation}</p>
                  </div>
                </div>

                <div className="pt-4 border-t border-[#F4F3EF] space-y-2.5">
                  <div className="flex items-center gap-3">
                    <FiMail size={12} className="text-[#9B9BAD] flex-shrink-0" />
                    <span className="text-xs font-semibold text-[#6B6B7E] truncate">{emp.email}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <FiPhone size={12} className="text-[#9B9BAD] flex-shrink-0" />
                    <span className="text-xs font-semibold text-[#6B6B7E]">{emp.phone}</span>
                  </div>
                  <div className="flex items-center justify-between pt-1">
                    <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold text-[#6B6B7E] bg-[#FAFAF8] border border-[#F4F3EF]">
                      {emp.department}
                    </span>
                    <span className="text-[10px] font-bold text-[#9B9BAD]">
                      Joined {new Date(emp.joinDate).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
