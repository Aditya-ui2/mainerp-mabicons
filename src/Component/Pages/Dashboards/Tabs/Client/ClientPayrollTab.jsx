import { useState, useEffect } from 'react';
import { FiDownload, FiUsers, FiTrendingUp, FiTrendingDown, FiAward } from 'react-icons/fi';
import { FaRupeeSign } from 'react-icons/fa';
import { jwtDecode } from 'jwt-decode';
import { getClientPayroll } from '../../../service/api';

export default function ClientPayrollTab({ isDarkMode, clientData }) {
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
  const [payrollData, setPayrollData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPayroll = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        if (!token) return;
        const decoded = jwtDecode(token);
        const res = await getClientPayroll(decoded.id, selectedMonth);
        if (res?.success) {
          setPayrollData(res.data);
        } else {
          setPayrollData(null);
        }
      } catch (err) {
        console.error('Failed to load payroll data', err);
        setPayrollData(null);
      } finally {
        setLoading(false);
      }
    };
    fetchPayroll();
  }, [selectedMonth]);

  const payrollSummary = payrollData?.summary || {
    totalEmployees: 0,
    totalGross: 0,
    totalDeductions: 0,
    totalNet: 0,
  };

  const basicTotal = payrollData?.payslips?.reduce((sum, p) => sum + p.basicSalary, 0) || 0;
  const hraTotal = payrollData?.payslips?.reduce((sum, p) => sum + p.hra, 0) || 0;
  const otherTotal = payrollData?.payslips?.reduce((sum, p) => sum + p.otherAllowances, 0) || 0;
  const deductionsTotal = payrollData?.payslips?.reduce((sum, p) => sum + p.deductions, 0) || 0;

  const earnings = [
    { name: 'Basic Salary',       amount: basicTotal },
    { name: 'HRA',                amount: hraTotal },
    { name: 'Other Allowances',   amount: otherTotal },
  ];

  const deductionsLists = [
    { name: 'Total Deductions',   amount: deductionsTotal },
  ];

  const fmt = (n) => '₹' + (n || 0).toLocaleString('en-IN');
  const monthLabel = new Date(selectedMonth + '-01').toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });

  const statCards = [
    { label: 'Total Employees', value: payrollSummary.totalEmployees, display: String(payrollSummary.totalEmployees), color: 'text-[#1B4DA0]',   icon: FiUsers },
    { label: 'Gross Salary',    value: payrollSummary.totalGross,     display: fmt(payrollSummary.totalGross),     color: 'text-emerald-500', icon: FiTrendingUp },
    { label: 'Total Deductions',value: payrollSummary.totalDeductions,display: fmt(payrollSummary.totalDeductions),color: 'text-red-500',     icon: FiTrendingDown },
    { label: 'Net Payable',     value: payrollSummary.totalNet,       display: fmt(payrollSummary.totalNet),       color: 'text-[#1A1A2E]',  icon: FiAward },
  ];

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
          <h1 className="text-4xl font-bold text-[#1A1A2E] tracking-tight font-syne mb-1">Payroll Summary</h1>
          <p className="text-sm font-medium text-[#9B9BAD] mt-1">Review payroll details for your assigned team members</p>
        </div>
        <div className="flex items-center gap-3">
          <input
            type="month"
            value={selectedMonth}
            onChange={e => setSelectedMonth(e.target.value)}
            className="px-5 py-3 rounded-xl text-sm font-bold text-[#1A1A2E] bg-white border border-[#E8E7E2] outline-none shadow-sm hover:border-[#1B4DA0] transition-colors cursor-pointer"
          />
          <button className="flex items-center gap-2.5 px-5 py-3 rounded-xl text-sm font-bold text-white bg-emerald-500 hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-200">
            <FiDownload size={15} /> Download
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <div className="relative"><div className="w-12 h-12 border-4 border-slate-100 rounded-full" /><div className="absolute inset-0 w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" /></div>
          <p className="text-xs font-bold text-[#9B9BAD] uppercase tracking-widest">Loading payroll data...</p>
        </div>
      ) : (
        <>
          {/* ── Stat Cards ── */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
            {statCards.map(s => (
              <div key={s.label} className="bg-white p-6 rounded-[28px] border border-[#F4F3EF] shadow-sm hover:shadow-md transition-all duration-300 group">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 bg-[#F4F3EF] ${s.color} transition-transform duration-300 group-hover:scale-110`}>
                  <s.icon size={18} />
                </div>
                <p className={`text-2xl font-extrabold ${s.color} mb-1 leading-tight`}>{s.display}</p>
                <p className="text-[10px] font-bold text-[#9B9BAD] uppercase tracking-widest">{s.label}</p>
              </div>
            ))}
          </div>

          {/* ── Breakdown Grid ── */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Earnings */}
            <div className="bg-white rounded-[32px] p-8 border border-[#E8E7E2] shadow-sm">
              <h2 className="text-xl font-bold text-[#1A1A2E] flex items-center gap-3 mb-6 font-syne">
                <div className="w-8 h-8 flex items-center justify-center flex-shrink-0">
                  <FiTrendingUp className="w-5 h-5 text-emerald-500" />
                </div>
                Earnings
              </h2>
              <div className="space-y-4">
                {earnings.map(item => (
                  <div key={item.name} className="flex items-center justify-between py-2.5 border-b border-[#F4F3EF] last:border-0">
                    <span className="text-sm font-semibold text-[#1A1A2E] font-jakarta">{item.name}</span>
                    <span className="text-sm font-bold text-emerald-600 flex items-center gap-1">
                      <FaRupeeSign size={10} />{(item.amount || 0).toLocaleString('en-IN')}
                    </span>
                  </div>
                ))}
                <div className="flex items-center justify-between pt-4 border-t-2 border-[#E8E7E2]">
                  <span className="text-sm font-black text-[#1A1A2E] uppercase tracking-wider">Total Earnings</span>
                  <span className="text-base font-black text-emerald-600 flex items-center gap-1">
                    <FaRupeeSign size={11} />{(payrollSummary.totalGross || 0).toLocaleString('en-IN')}
                  </span>
                </div>
              </div>
            </div>

            {/* Deductions */}
            <div className="bg-white rounded-[32px] p-8 border border-[#E8E7E2] shadow-sm">
              <h2 className="text-xl font-bold text-[#1A1A2E] flex items-center gap-3 mb-6 font-syne">
                <div className="w-8 h-8 flex items-center justify-center flex-shrink-0">
                  <FiTrendingDown className="w-5 h-5 text-red-500" />
                </div>
                Deductions
              </h2>
              <div className="space-y-4">
                {deductionsLists.map(item => (
                  <div key={item.name} className="flex items-center justify-between py-2.5 border-b border-[#F4F3EF] last:border-0">
                    <span className="text-sm font-semibold text-[#1A1A2E] font-jakarta">{item.name}</span>
                    <span className="text-sm font-bold text-red-500 flex items-center gap-1">
                      <FaRupeeSign size={10} />{(item.amount || 0).toLocaleString('en-IN')}
                    </span>
                  </div>
                ))}
                <div className="flex items-center justify-between pt-4 border-t-2 border-[#E8E7E2]">
                  <span className="text-sm font-black text-[#1A1A2E] uppercase tracking-wider">Total Deductions</span>
                  <span className="text-base font-black text-red-600 flex items-center gap-1">
                    <FaRupeeSign size={11} />{(payrollSummary.totalDeductions || 0).toLocaleString('en-IN')}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* ── Net Payable Banner ── */}
          <div className="bg-white rounded-[32px] p-8 border border-[#E8E7E2] shadow-sm flex items-center justify-between">
            <div>
              <p className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-[2px] mb-2">Net Payable Amount — {monthLabel}</p>
              <p className="text-4xl font-black text-[#1A1A2E] flex items-center gap-2 font-syne">
                <FaRupeeSign size={28} className="text-emerald-500" />
                {(payrollSummary.totalNet || 0).toLocaleString('en-IN')}
              </p>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-[2px] mb-2">Team Size</p>
              <p className="text-3xl font-black text-[#1B4DA0] font-syne">{payrollSummary.totalEmployees || 0}</p>
              <p className="text-xs font-bold text-[#9B9BAD] mt-1">Employees</p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
