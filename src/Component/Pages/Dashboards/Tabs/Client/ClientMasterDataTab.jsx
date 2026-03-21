import { useState, useEffect } from 'react';
import { FiUsers, FiSearch, FiMail, FiPhone, FiMapPin } from 'react-icons/fi';

/* ── Master Data: View employee master data ── */
export default function ClientMasterDataTab({ isDarkMode, clientData }) {
  const [search, setSearch] = useState('');

  const text = isDarkMode ? 'text-gray-100' : 'text-gray-800';
  const textSub = isDarkMode ? 'text-gray-400' : 'text-gray-500';
  const cardBg = isDarkMode ? 'bg-[#282440]' : 'bg-white';
  const border = isDarkMode ? 'border-[#3a3556]' : 'border-[#ece8f8]';
  const inputBg = isDarkMode ? 'bg-[#322d4a] text-gray-100' : 'bg-[#f2f0fa] text-gray-800';
  const bgSub = isDarkMode ? 'bg-[#1e1b2e]' : 'bg-[#f7f5fc]';
  const hover = isDarkMode ? 'hover:bg-[#3a3556]' : 'hover:bg-[#ece8f8]';

  // Sample employee data
  const employees = [
    { id: 1, name: 'Rajesh Kumar', email: 'rajesh@company.com', phone: '+91 98765 43210', designation: 'Sr. Developer', department: 'Engineering', joinDate: '2024-03-15', status: 'Active' },
    { id: 2, name: 'Priya Sharma', email: 'priya@company.com', phone: '+91 87654 32109', designation: 'HR Manager', department: 'Human Resources', joinDate: '2023-06-01', status: 'Active' },
    { id: 3, name: 'Amit Patel', email: 'amit@company.com', phone: '+91 76543 21098', designation: 'Finance Lead', department: 'Finance', joinDate: '2024-01-10', status: 'Active' },
    { id: 4, name: 'Neha Singh', email: 'neha@company.com', phone: '+91 65432 10987', designation: 'Marketing Exec', department: 'Marketing', joinDate: '2025-02-20', status: 'Active' },
    { id: 5, name: 'Suresh Verma', email: 'suresh@company.com', phone: '+91 54321 09876', designation: 'Operations Head', department: 'Operations', joinDate: '2023-09-05', status: 'Active' },
    { id: 6, name: 'Anita Desai', email: 'anita@company.com', phone: '+91 43210 98765', designation: 'Quality Analyst', department: 'QA', joinDate: '2024-07-12', status: 'On Leave' },
  ];

  const filtered = employees.filter(e => {
    if (!search) return true;
    const q = search.toLowerCase();
    return e.name.toLowerCase().includes(q) || e.designation.toLowerCase().includes(q) || e.department.toLowerCase().includes(q) || e.email.toLowerCase().includes(q);
  });

  const departments = [...new Set(employees.map(e => e.department))];

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 text-white shadow">
            <FiUsers size={22} />
          </div>
          <div>
            <h2 className={`text-xl font-bold ${text}`}>Master Data</h2>
            <p className={`text-sm ${textSub}`}>Employee directory and records</p>
          </div>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className={`${cardBg} rounded-xl ${border} border p-4`}>
          <p className={`text-2xl font-bold text-violet-500`}>{employees.length}</p>
          <p className={`text-xs ${textSub}`}>Total Employees</p>
        </div>
        <div className={`${cardBg} rounded-xl ${border} border p-4`}>
          <p className={`text-2xl font-bold text-green-500`}>{employees.filter(e => e.status === 'Active').length}</p>
          <p className={`text-xs ${textSub}`}>Active</p>
        </div>
        <div className={`${cardBg} rounded-xl ${border} border p-4`}>
          <p className={`text-2xl font-bold text-amber-500`}>{employees.filter(e => e.status === 'On Leave').length}</p>
          <p className={`text-xs ${textSub}`}>On Leave</p>
        </div>
        <div className={`${cardBg} rounded-xl ${border} border p-4`}>
          <p className={`text-2xl font-bold text-blue-500`}>{departments.length}</p>
          <p className={`text-xs ${textSub}`}>Departments</p>
        </div>
      </div>

      {/* Search */}
      <div className={`flex items-center gap-2 px-3 py-2 rounded-xl ${inputBg}`}>
        <FiSearch className={textSub} size={16} />
        <input
          type="text" placeholder="Search employees by name, designation, department…"
          value={search} onChange={e => setSearch(e.target.value)}
          className={`bg-transparent outline-none text-sm w-full ${text}`}
        />
      </div>

      {/* Employee cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {filtered.map(emp => (
          <div key={emp.id} className={`${cardBg} rounded-xl ${border} border p-4 space-y-3`}>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold">
                {emp.name.split(' ').map(w => w[0]).join('').slice(0, 2)}
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-semibold ${text} truncate`}>{emp.name}</p>
                <p className={`text-xs ${textSub}`}>{emp.designation}</p>
              </div>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                emp.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
              }`}>{emp.status}</span>
            </div>

            <div className="space-y-1.5 text-sm">
              <div className="flex items-center gap-2">
                <FiMail size={13} className={textSub} />
                <span className={`${text} text-xs truncate`}>{emp.email}</span>
              </div>
              <div className="flex items-center gap-2">
                <FiPhone size={13} className={textSub} />
                <span className={`${text} text-xs`}>{emp.phone}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className={`px-2 py-0.5 rounded-md text-[10px] font-medium ${bgSub} ${text}`}>{emp.department}</span>
                <span className={`text-[10px] ${textSub}`}>Joined: {new Date(emp.joinDate).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
      {filtered.length === 0 && (
        <div className={`text-center py-12 ${textSub}`}>
          <FiUsers size={36} className="mx-auto mb-2 opacity-30" />
          <p className="font-medium">No employees found</p>
        </div>
      )}
    </div>
  );
}
