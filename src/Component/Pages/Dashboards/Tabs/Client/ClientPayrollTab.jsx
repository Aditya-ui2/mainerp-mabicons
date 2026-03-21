import { useState, useEffect } from 'react';
import { FiDollarSign, FiDownload } from 'react-icons/fi';

/* ── Payroll: Same payroll view for clients ── */
export default function ClientPayrollTab({ isDarkMode, clientData }) {
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));

  const text = isDarkMode ? 'text-gray-100' : 'text-gray-800';
  const textSub = isDarkMode ? 'text-gray-400' : 'text-gray-500';
  const cardBg = isDarkMode ? 'bg-[#282440]' : 'bg-white';
  const border = isDarkMode ? 'border-[#3a3556]' : 'border-[#ece8f8]';
  const inputBg = isDarkMode ? 'bg-[#322d4a] text-gray-100' : 'bg-[#f2f0fa] text-gray-800';
  const bgSub = isDarkMode ? 'bg-[#1e1b2e]' : 'bg-[#f7f5fc]';

  // Sample payroll summary
  const payrollSummary = {
    totalEmployees: 24,
    totalGross: 1250000,
    totalDeductions: 187500,
    totalNet: 1062500,
  };

  const payrollItems = [
    { name: 'Basic Salary', amount: 750000, type: 'Earning' },
    { name: 'HRA', amount: 300000, type: 'Earning' },
    { name: 'Special Allowance', amount: 120000, type: 'Earning' },
    { name: 'Conveyance', amount: 80000, type: 'Earning' },
    { name: 'PF (Employer)', amount: 90000, type: 'Deduction' },
    { name: 'ESI', amount: 22500, type: 'Deduction' },
    { name: 'Professional Tax', amount: 12000, type: 'Deduction' },
    { name: 'TDS', amount: 63000, type: 'Deduction' },
  ];

  const fmt = (n) => '₹' + n.toLocaleString('en-IN');

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 text-white shadow">
            <FiDollarSign size={22} />
          </div>
          <div>
            <h2 className={`text-xl font-bold ${text}`}>Payroll Summary</h2>
            <p className={`text-sm ${textSub}`}>Review payroll details for your employees</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <input
            type="month"
            value={selectedMonth}
            onChange={e => setSelectedMonth(e.target.value)}
            className={`px-3 py-2 rounded-xl text-sm ${inputBg} ${border} border outline-none`}
          />
          <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-green-500 text-white text-sm font-semibold hover:bg-green-600 transition">
            <FiDownload size={14} /> Download
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Total Employees', value: payrollSummary.totalEmployees, color: 'blue', prefix: '' },
          { label: 'Gross Salary', value: payrollSummary.totalGross, color: 'green', prefix: '₹' },
          { label: 'Total Deductions', value: payrollSummary.totalDeductions, color: 'red', prefix: '₹' },
          { label: 'Net Payable', value: payrollSummary.totalNet, color: 'violet', prefix: '₹' },
        ].map(c => (
          <div key={c.label} className={`${cardBg} rounded-xl ${border} border p-4`}>
            <p className={`text-xs ${textSub}`}>{c.label}</p>
            <p className={`text-2xl font-bold text-${c.color}-500 mt-1`}>
              {c.prefix ? fmt(c.value) : c.value}
            </p>
          </div>
        ))}
      </div>

      {/* Payroll Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Earnings */}
        <div className={`${cardBg} rounded-2xl ${border} border overflow-hidden`}>
          <div className="p-4 border-b" style={{ borderColor: isDarkMode ? '#3a3556' : '#ece8f8' }}>
            <h3 className={`font-semibold ${text}`}>Earnings</h3>
          </div>
          <div className="p-4 space-y-3">
            {payrollItems.filter(i => i.type === 'Earning').map(item => (
              <div key={item.name} className="flex items-center justify-between">
                <span className={`text-sm ${text}`}>{item.name}</span>
                <span className={`text-sm font-semibold text-green-500`}>{fmt(item.amount)}</span>
              </div>
            ))}
            <div className="pt-3 mt-3 border-t flex items-center justify-between" style={{ borderColor: isDarkMode ? '#3a3556' : '#ece8f8' }}>
              <span className={`text-sm font-bold ${text}`}>Total Earnings</span>
              <span className="text-sm font-bold text-green-600">{fmt(payrollSummary.totalGross)}</span>
            </div>
          </div>
        </div>

        {/* Deductions */}
        <div className={`${cardBg} rounded-2xl ${border} border overflow-hidden`}>
          <div className="p-4 border-b" style={{ borderColor: isDarkMode ? '#3a3556' : '#ece8f8' }}>
            <h3 className={`font-semibold ${text}`}>Deductions</h3>
          </div>
          <div className="p-4 space-y-3">
            {payrollItems.filter(i => i.type === 'Deduction').map(item => (
              <div key={item.name} className="flex items-center justify-between">
                <span className={`text-sm ${text}`}>{item.name}</span>
                <span className={`text-sm font-semibold text-red-500`}>{fmt(item.amount)}</span>
              </div>
            ))}
            <div className="pt-3 mt-3 border-t flex items-center justify-between" style={{ borderColor: isDarkMode ? '#3a3556' : '#ece8f8' }}>
              <span className={`text-sm font-bold ${text}`}>Total Deductions</span>
              <span className="text-sm font-bold text-red-600">{fmt(payrollSummary.totalDeductions)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Net Pay Banner */}
      <div className={`rounded-2xl p-5 bg-gradient-to-r from-violet-500 to-purple-600 text-white flex items-center justify-between`}>
        <div>
          <p className="text-sm opacity-80">Net Payable Amount</p>
          <p className="text-3xl font-bold">{fmt(payrollSummary.totalNet)}</p>
        </div>
        <div className="text-right">
          <p className="text-sm opacity-80">For {new Date(selectedMonth + '-01').toLocaleDateString([], { month: 'long', year: 'numeric' })}</p>
          <p className="text-sm opacity-80">{payrollSummary.totalEmployees} employees</p>
        </div>
      </div>
    </div>
  );
}
