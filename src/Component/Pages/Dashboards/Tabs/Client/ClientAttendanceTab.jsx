import { useState, useEffect } from 'react';
import { FiClock, FiUsers, FiFileText, FiClipboard, FiHeart, FiDollarSign } from 'react-icons/fi';
import { jwtDecode } from 'jwt-decode';
import { getClientDetails } from '../../../service/api';

/* ── Attendance: Share / Review, Change or make correction ── */
export default function ClientAttendanceTab({ isDarkMode, clientData }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));

  const text = isDarkMode ? 'text-gray-100' : 'text-gray-800';
  const textSub = isDarkMode ? 'text-gray-400' : 'text-gray-500';
  const cardBg = isDarkMode ? 'bg-[#282440]' : 'bg-white';
  const border = isDarkMode ? 'border-[#3a3556]' : 'border-[#ece8f8]';
  const inputBg = isDarkMode ? 'bg-[#322d4a] text-gray-100' : 'bg-[#f2f0fa] text-gray-800';

  useEffect(() => {
    // Simulate attendance data loading — replace with actual API when available
    setLoading(false);
  }, [selectedMonth]);

  const daysInMonth = new Date(selectedMonth + '-01').getMonth() === new Date().getMonth()
    ? new Date().getDate()
    : new Date(Number(selectedMonth.split('-')[0]), Number(selectedMonth.split('-')[1]), 0).getDate();

  // Sample attendance data for display
  const attendanceSummary = {
    totalDays: daysInMonth,
    present: Math.floor(daysInMonth * 0.85),
    absent: Math.floor(daysInMonth * 0.05),
    late: Math.floor(daysInMonth * 0.08),
    holidays: Math.floor(daysInMonth * 0.02),
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow">
            <FiClock size={22} />
          </div>
          <div>
            <h2 className={`text-xl font-bold ${text}`}>Attendance Review</h2>
            <p className={`text-sm ${textSub}`}>Share, review, and request corrections on attendance records</p>
          </div>
        </div>
        <input
          type="month"
          value={selectedMonth}
          onChange={e => setSelectedMonth(e.target.value)}
          className={`px-3 py-2 rounded-xl text-sm ${inputBg} ${border} border outline-none`}
        />
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { label: 'Working Days', value: attendanceSummary.totalDays, color: 'blue' },
          { label: 'Present', value: attendanceSummary.present, color: 'green' },
          { label: 'Absent', value: attendanceSummary.absent, color: 'red' },
          { label: 'Late Arrivals', value: attendanceSummary.late, color: 'amber' },
          { label: 'Holidays', value: attendanceSummary.holidays, color: 'purple' },
        ].map(c => (
          <div key={c.label} className={`${cardBg} rounded-xl ${border} border p-4 text-center`}>
            <p className={`text-2xl font-bold text-${c.color}-500`}>{c.value}</p>
            <p className={`text-xs ${textSub} mt-1`}>{c.label}</p>
          </div>
        ))}
      </div>

      {/* Attendance Table */}
      <div className={`${cardBg} rounded-2xl ${border} border overflow-hidden`}>
        <div className="p-4 border-b" style={{ borderColor: isDarkMode ? '#3a3556' : '#ece8f8' }}>
          <h3 className={`font-semibold ${text}`}>Daily Attendance Log</h3>
          <p className={`text-xs ${textSub}`}>Review and request corrections for any discrepancies</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className={isDarkMode ? 'bg-[#1e1b2e]' : 'bg-[#f7f5fc]'}>
                <th className={`px-4 py-3 text-left text-xs font-semibold ${textSub}`}>Date</th>
                <th className={`px-4 py-3 text-left text-xs font-semibold ${textSub}`}>Check In</th>
                <th className={`px-4 py-3 text-left text-xs font-semibold ${textSub}`}>Check Out</th>
                <th className={`px-4 py-3 text-left text-xs font-semibold ${textSub}`}>Hours</th>
                <th className={`px-4 py-3 text-left text-xs font-semibold ${textSub}`}>Status</th>
                <th className={`px-4 py-3 text-left text-xs font-semibold ${textSub}`}>Action</th>
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: Math.min(daysInMonth, 10) }, (_, i) => {
                const day = i + 1;
                const date = new Date(selectedMonth + '-' + String(day).padStart(2, '0'));
                const isWeekend = date.getDay() === 0 || date.getDay() === 6;
                const status = isWeekend ? 'Holiday' : Math.random() > 0.9 ? 'Absent' : Math.random() > 0.85 ? 'Late' : 'Present';
                const colors = {
                  Present: 'bg-green-100 text-green-700',
                  Absent: 'bg-red-100 text-red-700',
                  Late: 'bg-amber-100 text-amber-700',
                  Holiday: 'bg-purple-100 text-purple-700',
                };
                return (
                  <tr key={day} className={`border-t ${isDarkMode ? 'border-[#3a3556]' : 'border-gray-100'}`}>
                    <td className={`px-4 py-3 ${text}`}>{date.toLocaleDateString([], { weekday: 'short', day: 'numeric', month: 'short' })}</td>
                    <td className={`px-4 py-3 ${text}`}>{isWeekend ? '—' : '09:00 AM'}</td>
                    <td className={`px-4 py-3 ${text}`}>{isWeekend ? '—' : '06:00 PM'}</td>
                    <td className={`px-4 py-3 ${text}`}>{isWeekend ? '—' : '9h'}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-[11px] font-semibold ${colors[status]}`}>{status}</span>
                    </td>
                    <td className="px-4 py-3">
                      {!isWeekend && (
                        <button className="text-xs text-blue-500 hover:underline font-medium">Request Correction</button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className={`px-4 py-3 text-xs ${textSub} text-center border-t`} style={{ borderColor: isDarkMode ? '#3a3556' : '#ece8f8' }}>
          Showing first 10 records • Contact KAM for full attendance report
        </div>
      </div>
    </div>
  );
}
