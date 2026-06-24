/* eslint-disable react/prop-types */
import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiDownload, FiSearch, FiChevronRight, FiUser, FiBriefcase, FiBarChart2, FiCheckCircle } from 'react-icons/fi';
import { getAdminHierarchy, getEmployeeTasks } from '../../../service/api';
import { jwtDecode } from "jwt-decode";
// Removed unused toast import
const EmployeeReportModal = ({ employee, onClose }) => {
  if (!employee) return null;

  const [tasks, setTasks] = useState([]);
  const [loadingTasks, setLoadingTasks] = useState(true);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        setLoadingTasks(true);
        const empId = employee._id || employee.id;
        if (!empId) {
          setTasks([]);
          return;
        }
        const res = await getEmployeeTasks(empId);
        if (res && res.success) {
          setTasks(res.tasks || []);
        } else {
          setTasks([]);
        }
      } catch (error) {
        console.error("Failed to fetch employee tasks:", error);
        setTasks([]);
      } finally {
        setLoadingTasks(false);
      }
    };

    fetchTasks();
  }, [employee]);

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === 'Resolved').length;
  const pendingTasks = tasks.filter(t => t.status !== 'Resolved').length;
  const performanceScore = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) + '%' : '100%';

  const handleDownloadPDF = () => {
    // A simple approach using window.print()
    const printStyle = document.createElement('style');
    printStyle.innerHTML = `
      @media print {
        body * { visibility: hidden; }
        #report-modal-content, #report-modal-content * { visibility: visible; }
        #report-modal-content { position: absolute; left: 0; top: 0; width: 100%; height: auto; max-height: none; padding: 20px; overflow: visible; box-shadow: none; border: none; }
        .no-print { display: none !important; }
      }
    `;
    document.head.appendChild(printStyle);
    window.print();
    document.head.removeChild(printStyle);
  };

  return createPortal(
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-[#1A1A2E]/60 backdrop-blur-xl z-[9999]"
        onClick={onClose}
      />
      <div className="fixed inset-0 flex items-center justify-center p-4 z-[10000] pointer-events-none">
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          className="w-full max-w-[800px] max-h-[90vh] bg-white rounded-[32px] shadow-2xl flex flex-col pointer-events-auto overflow-hidden relative"
          id="report-modal-content"
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="p-8 border-b border-[#F4F3EF] flex justify-between items-center bg-gradient-to-r from-blue-50/50 to-white">
            <div className="flex items-center gap-4 text-left">
               <div className="w-14 h-14 rounded-[16px] bg-[#1B4DA0] text-white flex items-center justify-center text-xl font-bold">
                 {(employee.name || 'E').slice(0, 2).toUpperCase()}
               </div>
               <div>
                 <h2 className="text-2xl font-bold text-[#1A1A2E] leading-tight" style={{ fontFamily: '"Syne", sans-serif' }}>{employee.name}</h2>
                 <p className="text-[11px] font-black text-blue-600 uppercase tracking-[2px]">{employee.role} • {employee.department}</p>
               </div>
            </div>
            <div className="flex items-center gap-3 no-print">
               <button onClick={handleDownloadPDF} className="flex items-center gap-2 px-5 py-2.5 bg-[#1A1A2E] text-white text-[11px] font-bold uppercase tracking-widest rounded-xl hover:bg-black transition-all">
                 <FiDownload size={14} /> Download PDF
               </button>
               <button onClick={onClose} className="w-10 h-10 flex items-center justify-center rounded-xl bg-[#F4F3EF] text-slate-500 hover:text-red-500 hover:bg-red-50 transition-all">
                 <FiX size={18} />
               </button>
            </div>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-8 custom-scrollbar bg-[#FAFAF8]">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="bg-white p-6 rounded-3xl border border-[#F4F3EF] shadow-sm flex flex-col gap-2 text-left">
                 <div className="flex items-center gap-3 text-slate-500 mb-2">
                   <FiUser size={20} className="text-[#1B4DA0]" />
                   <span className="text-[11px] font-black uppercase tracking-widest">Personal Info</span>
                 </div>
                 <p className="text-sm font-bold text-[#1A1A2E]"><strong>Email:</strong> {employee.email}</p>
                 <p className="text-sm font-bold text-[#1A1A2E]"><strong>Phone:</strong> {employee.phone}</p>
                 <p className="text-sm font-bold text-[#1A1A2E]"><strong>Joined:</strong> {employee.joiningDate || 'N/A'}</p>
              </div>

              <div className="bg-white p-6 rounded-3xl border border-[#F4F3EF] shadow-sm flex flex-col gap-2 text-left">
                 <div className="flex items-center gap-3 text-slate-500 mb-2">
                   <FiBriefcase size={20} className="text-amber-500" />
                   <span className="text-[11px] font-black uppercase tracking-widest">Work Profile</span>
                 </div>
                 <p className="text-sm font-bold text-[#1A1A2E]"><strong>Employee ID:</strong> {employee.employeeId}</p>
                 <p className="text-sm font-bold text-[#1A1A2E]"><strong>Designation:</strong> {employee.designation}</p>
                 <p className="text-sm font-bold text-[#1A1A2E]"><strong>Status:</strong> {employee.status}</p>
              </div>
            </div>

            <h3 className="text-lg font-bold text-[#1A1A2E] mb-4 text-left" style={{ fontFamily: '"Syne", sans-serif' }}>Performance Overview</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              {[
                { label: 'Tasks Assigned', value: loadingTasks ? '...' : String(totalTasks), icon: FiBarChart2, color: 'text-blue-500' },
                { label: 'Tasks Completed', value: loadingTasks ? '...' : String(completedTasks), icon: FiCheckCircle, color: 'text-emerald-500' },
                { label: 'Pending Work', value: loadingTasks ? '...' : String(pendingTasks), icon: FiBriefcase, color: 'text-amber-500' },
                { label: 'Performance Score', value: loadingTasks ? '...' : performanceScore, icon: FiBarChart2, color: 'text-purple-500' },
              ].map((stat, idx) => (
                <div key={idx} className="bg-white p-5 rounded-2xl border border-[#F4F3EF] shadow-sm text-center">
                  <stat.icon size={24} className={`mx-auto mb-3 ${stat.color} opacity-80`} />
                  <p className="text-2xl font-black text-[#1A1A2E]">{stat.value}</p>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">{stat.label}</p>
                </div>
              ))}
            </div>

            <div className="bg-white rounded-3xl border border-[#F4F3EF] shadow-sm p-6">
              <h4 className="text-md font-bold text-[#1A1A2E] mb-4 text-left">Recent Activities</h4>
              <div className="space-y-4">
                {loadingTasks ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1B4DA0]"></div>
                  </div>
                ) : tasks.length === 0 ? (
                  <div className="py-8 text-center text-[#9B9BAD]">
                    <FiBriefcase size={32} className="mx-auto mb-3 opacity-20 text-[#1B4DA0]" />
                    <p className="text-xs font-bold uppercase tracking-widest">No recent task activities</p>
                  </div>
                ) : (
                  tasks.slice(0, 5).map((task) => (
                    <div key={task.id || task._id} className="flex items-start gap-4 pb-4 border-b border-slate-50 last:border-0 last:pb-0 text-left">
                       <div className={`w-2 h-2 rounded-full mt-2 shrink-0 ${task.status === 'Resolved' ? 'bg-emerald-500' : 'bg-blue-500'}`}></div>
                       <div className="min-w-0">
                         <p className="text-sm font-bold text-slate-800">
                           {task.status === 'Resolved' ? 'Completed' : 'Assigned'} task: <span className="text-[#1B4DA0] font-black">{task.title}</span>
                         </p>
                         {task.client && (
                           <p className="text-[11px] text-slate-500 font-semibold mt-0.5">
                             Client: {task.client.companyName || task.client.name}
                           </p>
                         )}
                         <p className="text-[11px] text-slate-400 mt-0.5">
                           {task.updatedAt ? new Date(task.updatedAt).toLocaleDateString() : new Date(task.createdAt).toLocaleDateString()}
                         </p>
                       </div>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>
        </motion.div>
      </div>
    </AnimatePresence>,
    document.body
  );
};

const TeamReportTab = ({ notificationBell }) => {
  const [employees, setEmployees] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('All');
  const [monthFilter, setMonthFilter] = useState('All Months');
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  const getFlattenedMembers = (node) => {
    let result = [];
    if (node && node.id && node.name !== 'Ashish') {
      const rawJoiningDate = node.joiningDate || node.joinDate || node.createdAt || '2023-01-01';
      let formattedJoiningDate = '2023-01-01';
      if (rawJoiningDate) {
        const dateObj = new Date(rawJoiningDate);
        if (!isNaN(dateObj.getTime())) {
          formattedJoiningDate = dateObj.toISOString().split('T')[0];
        } else {
          formattedJoiningDate = rawJoiningDate;
        }
      }

      result.push({
        ...node,
        _id: node.id,
        employeeId: node.employeeId || `MAB-${String(Math.floor(100 + Math.random() * 900))}`,
        name: node.name,
        email: node.email,
        role: node.role || (node.employees && node.employees.length > 0 ? 'Team Leader' : 'Employee'),
        designation: node.designation || (node.employees && node.employees.length > 0 ? 'Lead Executive' : 'Associate'),
        department: node.department || 'Operations',
        status: node.status || 'Active',
        phone: node.phone || '+91 0000000000',
        joiningDate: formattedJoiningDate,
      });
    }
    if (node && node.children) {
      node.children.forEach(child => {
        result = result.concat(getFlattenedMembers(child));
      });
    }
    if (node && node.teamLeaders) {
      node.teamLeaders.forEach(child => {
        result = result.concat(getFlattenedMembers(child));
      });
    }
    if (node && node.employees) {
      node.employees.forEach(child => {
        result = result.concat(getFlattenedMembers(child));
      });
    }
    return result;
  };

  const fetchHierarchy = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('token');
      const decoded = jwtDecode(token);
      const id = decoded.id || decoded._id || decoded.adminId || decoded.userId || localStorage.getItem('userId');
      const role = decoded.role || decoded.userType || localStorage.getItem('userRole') || '';

      if (!id) throw new Error('User ID not found');

      const hierarchyRole = (role.toLowerCase().includes('super admin') || role.toLowerCase() === 'superadmin') ? 'Admin' : role;
      const response = await getAdminHierarchy(id, hierarchyRole);

      let orgChart;
      if (role === 'TeamLeader') {
        orgChart = response?.teamLeader;
      } else {
        orgChart = response?.adminHierarchy;
      }

      const allFlattened = getFlattenedMembers(orgChart);
      const seenIds = new Set();
      const allMembers = [];
      allFlattened.forEach(member => {
        const idVal = member.id || member._id || member.email;
        if (idVal && !seenIds.has(idVal)) {
          seenIds.add(idVal);
          allMembers.push(member);
        }
      });
      setEmployees(allMembers.length > 0 ? allMembers : getMockEmployees());
    } catch (error) {
      console.error('Fetch error:', error);
      setEmployees(getMockEmployees());
    } finally {
      setIsLoading(false);
    }
  };

  const getMockEmployees = () => [
    { id: 1, name: 'Rahul Sharma', email: 'rahul@mabicons.com', role: 'KAM', department: 'Recruitment', status: 'Active', employeeId: 'MAB-001' },
    { id: 2, name: 'Priya Patel', email: 'priya@mabicons.com', role: 'Executive', department: 'Operations', status: 'Active', employeeId: 'MAB-002' },
    { id: 3, name: 'Amit Kumar', email: 'amit@mabicons.com', role: 'Manager', department: 'Sales', status: 'Active', employeeId: 'MAB-003' },
    { id: 4, name: 'Neha Singh', email: 'neha@mabicons.com', role: 'Associate', department: 'CRM', status: 'Active', employeeId: 'MAB-004' }
  ];

  useEffect(() => {
    fetchHierarchy();
  }, []);

  const filteredEmployees = employees.filter(emp => {
    const matchesSearch = emp.name?.toLowerCase().includes(searchTerm.toLowerCase()) || emp.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDept = departmentFilter === 'All' || (emp.department || '').toLowerCase().includes(departmentFilter.toLowerCase());
    
    let matchesMonth = true;
    if (monthFilter !== 'All Months') {
      if (emp.joiningDate) {
        const dateObj = new Date(emp.joiningDate);
        if (!isNaN(dateObj.getTime())) {
          const empMonth = dateObj.toLocaleString('default', { month: 'long' });
          matchesMonth = empMonth === monthFilter;
        }
      } else {
        matchesMonth = false;
      }
    }

    return matchesSearch && matchesDept && matchesMonth;
  });

  const departments = ['All', 'Recruitment', 'Operations', 'Sales', 'CRM'];

  return (
    <div className="space-y-8 animate-in fade-in duration-500" style={{ fontFamily: "'Calibri', sans-serif" }}>
      {/* Header Section */}
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4 text-left">
        <div className="text-left">
          <h1 className="text-3xl font-bold text-[#1A1A2E] tracking-tight" style={{ fontFamily: '"Syne", sans-serif' }}>Team Report</h1>
        </div>
        <div className="flex items-center gap-2">
          {notificationBell}
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-[24px] p-2 border border-[#F4F3EF] shadow-sm flex items-center gap-3 mb-8 flex-wrap">
        <div className="relative flex-1 group min-w-[200px]">
          <FiSearch className="absolute left-5 top-1/2 -translate-y-1/2 text-[#9B9BAD] transition-colors" size={18} />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search employees..."
            className="w-full bg-[#F4F3EF] border-none rounded-2xl py-3 pl-14 pr-5 text-sm font-medium focus:ring-2 focus:ring-[#F4F3EF] outline-none transition-all placeholder:text-[#9B9BAD]"
          />
        </div>
        
        <div className="flex items-center gap-3 px-2 py-1">
          <select
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
            className="bg-[#F4F3EF] border-none rounded-xl py-2.5 px-4 text-sm font-bold text-[#1A1A2E] focus:ring-2 focus:ring-[#F4F3EF] outline-none transition-all cursor-pointer appearance-none pr-8"
            style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg stroke=%22%231A1A2E%22 fill=%22none%22 stroke-width=%222%22 viewBox=%220 0 24 24%22 stroke-linecap=%22round%22 stroke-linejoin=%22round%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cpolyline points=%226 9 12 15 18 9%22%3E%3C/polyline%3E%3C/svg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.75rem center', backgroundSize: '1em' }}
          >
            <option value="All">All Departments</option>
            {departments.filter(d => d !== 'All').map(dept => (
              <option key={dept} value={dept}>{dept}</option>
            ))}
          </select>

          <select
            value={monthFilter}
            onChange={(e) => setMonthFilter(e.target.value)}
            className="bg-[#F4F3EF] border-none rounded-xl py-2.5 px-4 text-sm font-bold text-[#1A1A2E] focus:ring-2 focus:ring-[#F4F3EF] outline-none transition-all cursor-pointer appearance-none pr-8"
            style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg stroke=%22%231A1A2E%22 fill=%22none%22 stroke-width=%222%22 viewBox=%220 0 24 24%22 stroke-linecap=%22round%22 stroke-linejoin=%22round%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cpolyline points=%226 9 12 15 18 9%22%3E%3C/polyline%3E%3C/svg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.75rem center', backgroundSize: '1em' }}
          >
            {['All Months', 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map(month => (
              <option key={month} value={month}>{month}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Employee List */}
      <div className="bg-white rounded-[32px] border border-[#F4F3EF] overflow-hidden shadow-sm">
        <div className="grid grid-cols-[2fr_1.5fr_1fr_1fr_40px] gap-4 px-8 py-4 border-b border-[#F4F3EF] bg-transparent">
           {['Employee', 'Role', 'Department', 'Status', ''].map((h, i) => (
             <div key={i} className="text-[11px] font-bold text-[#94a3b8] uppercase tracking-widest text-left">{h}</div>
           ))}
        </div>
        
        <div className="flex-1 overflow-y-auto no-scrollbar min-h-[400px]">
          {isLoading ? (
            <div className="flex justify-center items-center h-[300px]">
               <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : filteredEmployees.length === 0 ? (
            <div className="py-24 text-center">
               <p className="text-[#9B9BAD] text-sm font-bold uppercase tracking-widest">No Employees Found</p>
            </div>
          ) : (
            filteredEmployees.map(emp => (
              <div 
                key={emp.id || emp._id || emp.employeeId}
                onClick={() => setSelectedEmployee(emp)}
                className="grid grid-cols-[2fr_1.5fr_1fr_1fr_40px] gap-4 items-center px-8 py-4 border-b border-[#F4F3EF] last:border-0 hover:bg-[#F8FAFF] cursor-pointer transition-all group"
              >
                 <div className="flex items-center gap-4 min-w-0">
                    <div className="w-10 h-10 rounded-[12px] bg-gradient-to-br from-slate-50 to-[#F4F3EF] flex items-center justify-center text-[#1A1A2E] text-[13px] font-black border border-[#F1F5F9] shrink-0 group-hover:scale-105 group-hover:border-blue-200 group-hover:bg-blue-50 transition-all">
                      {(emp.name || 'E').slice(0, 2).toUpperCase()}
                    </div>
                    <div className="flex flex-col min-w-0">
                      <p className="text-[14px] font-bold text-[#0f172a] truncate text-left">{emp.name}</p>
                      <p className="text-[11px] font-medium text-slate-500 truncate text-left">{emp.email}</p>
                    </div>
                 </div>
                 
                 <div className="flex items-center justify-start text-[13px] font-bold text-slate-700 truncate text-left">
                   {emp.role}
                 </div>
                 
                 <div className="flex items-center justify-start text-[13px] font-medium text-slate-500 truncate text-left">
                   {emp.department || 'N/A'}
                 </div>
                 
                 <div className="flex items-center justify-start">
                   <span className="inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest bg-emerald-50 text-emerald-600 border border-emerald-100">
                     {emp.status || 'Active'}
                   </span>
                 </div>
                 
                 <div className="flex justify-end items-center">
                   <div className="w-8 h-8 rounded-xl bg-transparent group-hover:bg-[#0D47A1]/5 flex items-center justify-center transition-all">
                     <FiChevronRight size={18} className="text-[#C5C5D2] group-hover:text-[#0D47A1] group-hover:translate-x-0.5 transition-all" />
                   </div>
                 </div>
              </div>
            ))
          )}
        </div>
      </div>

      {selectedEmployee && (
        <EmployeeReportModal 
           employee={selectedEmployee} 
           onClose={() => setSelectedEmployee(null)} 
        />
      )}
    </div>
  );
};

export default TeamReportTab;
