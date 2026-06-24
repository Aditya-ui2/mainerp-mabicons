

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { FiUsers, FiMail, FiPhone, FiMapPin, FiEdit2, FiTrash2, FiPlus, FiSearch, FiDownload, FiEye, FiChevronDown, FiX, FiBriefcase, FiCalendar, FiUserCheck, FiUserX, FiUserMinus, FiTarget, FiArrowLeft, FiBriefcase as FiRole } from 'react-icons/fi';
import { Search, ChevronDown, Plus, X, ChevronRight, Download } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const MasterDataDetailView = ({ employee, onBack, isDarkMode }) => {
  return (
    <motion.div
      initial={{ x: '100%', opacity: 0.5 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: '100%', opacity: 0.5 }}
      transition={{ type: "spring", damping: 30, stiffness: 300 }}
      className="flex flex-col h-full bg-white relative animate-in fade-in slide-in-from-right duration-500"
      style={{ fontFamily: "'Calibri', sans-serif" }}
    >
      {/* Header Section */}
      <div className="sticky top-0 bg-white/95 backdrop-blur-md border-b border-[#F4F3EF] px-8 py-6 flex items-center justify-between z-20">
        <div className="flex items-center gap-3">
          <FiUsers className="text-[#0D47A1]" size={22} />
          <h3 className="text-xl font-bold text-[#1A1A2E]" style={{ fontFamily: "'Syne', sans-serif" }}>Employee Profile</h3>
        </div>
        <button onClick={onBack} className="w-12 h-12 rounded-xl bg-[#F4F3EF] text-[#6B6B7E] flex items-center justify-center hover:bg-red-50 hover:text-red-500 transition-all border border-[#E8E7E2] hover:border-red-100 shadow-sm">
          <X size={22} />
        </button>
      </div>

      <div className="flex-1 p-10 bg-[#FAFAF8] overflow-y-auto">
        <div className="flex flex-col gap-8 text-left mb-10">
          <div className="flex items-center gap-8">
            <div className="relative">
              <div className="w-32 h-32 rounded-[2.5rem] bg-gradient-to-br from-[#3FA9F5] via-[#1E88E5] to-[#0D47A1] flex items-center justify-center text-white font-black text-5xl shadow-2xl shadow-blue-500/30">
                {employee.name.charAt(0)}
              </div>
              <div className="absolute -bottom-2 -right-2 p-3 bg-white dark:bg-slate-800 rounded-2xl shadow-lg border-2 border-blue-50 dark:border-slate-700">
                <FiUserCheck className="w-6 h-6 text-emerald-500" />
              </div>
            </div>
            <div className="flex flex-col">
              <h2 className="text-4xl font-black text-[#1A1A2E] tracking-tight uppercase leading-none mb-2">
                {employee.name}
              </h2>
              <div className="flex items-center gap-3 mt-2">
                <span className="px-4 py-1.5 bg-blue-50 text-[#1E88E5] rounded-full text-[11px] font-black tracking-widest uppercase border border-blue-100">
                  {employee.empId}
                </span>
                <span className={`px-4 py-1.5 rounded-full text-[11px] font-black uppercase tracking-widest border ${employee.status === 'active' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-rose-50 text-rose-600 border-rose-100'}`}>
                  {employee.status}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Information Grid Section */}
        <div className="flex flex-col gap-8">
          <div className={`p-10 rounded-[3rem] border bg-white border-[#F4F3EF] shadow-sm`}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
              {[
                { label: 'Official Role', value: employee.designation, icon: FiRole },
                { label: 'Unit/Department', value: employee.department, icon: FiTarget },
                { label: 'Email Connectivity', value: employee.email, icon: FiMail },
                { label: 'Secure Phone Link', value: employee.phone, icon: FiPhone },
                { label: 'Joining Milestone', value: new Date(employee.joiningDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }), icon: FiCalendar },
                { label: 'Reporting Matrix', value: employee.reportingTo, icon: FiUsers }
              ].map((item, i) => (
                <div key={i} className="space-y-2 p-6 rounded-3xl bg-[#FAFAF8] border border-[#F4F3EF]">
                  <div className="flex items-center gap-2 text-[#0D47A1]">
                    <item.icon className="w-4 h-4" />
                    <label className="text-[10px] font-black uppercase tracking-widest">{item.label}</label>
                  </div>
                  <p className="text-[14px] font-bold text-[#1A1A2E] capitalize pl-6">{item.value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Side Card / Actions */}
          <div className={`p-10 rounded-[3rem] border bg-gradient-to-br from-emerald-50 to-emerald-100/50 border-emerald-100 shadow-sm`}>
            <div className="text-left space-y-4">
              <p className={`text-[11px] font-black uppercase tracking-[0.2em] text-emerald-600`}>Account Status</p>
              <div className="flex items-center justify-between">
                <span className="text-2xl font-black text-emerald-700">Fully Verified</span>
                <FiUserCheck className="w-8 h-8 text-emerald-500" />
              </div>
              <p className={`text-[11px] font-bold text-emerald-600/80 mt-2`}>All security credentials and professional audits are up to date for this member.</p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const MasterDataFormView = ({ onBack, isDarkMode, departments }) => {
  return (
    <motion.div
      initial={{ scale: 0.95, opacity: 0, y: 20 }}
      animate={{ scale: 1, opacity: 1, y: 0 }}
      exit={{ scale: 0.95, opacity: 0, y: 20 }}
      className="w-full max-w-3xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] relative animate-in fade-in slide-in-from-bottom-8 duration-500"
      style={{ fontFamily: "'Calibri', sans-serif" }}
    >
      <div className="sticky top-0 border-b border-[#F4F3EF] px-10 py-8 flex items-center justify-between z-20 bg-gradient-to-r from-white to-[#F8FAFF]">
        <div className="flex flex-col gap-1 text-left">
          <h3 className="text-2xl font-bold text-[#1A1A2E]" style={{ fontFamily: "'Syne', sans-serif" }}>
            Add New Member
          </h3>
        </div>
        <button onClick={onBack} className="w-12 h-12 rounded-2xl bg-[#F4F3EF] text-[#6B6B7E] flex items-center justify-center hover:bg-red-50 hover:text-red-500 transition-all shadow-sm">
          <X size={20} />
        </button>
      </div>

      <div className="flex-1 p-10 overflow-y-auto custom-scrollbar">
        <form className="space-y-8 text-left">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
            {[
              { label: 'Full Member Name', icon: FiUsers, placeholder: 'Enter Name' },
              { label: 'Official Email', icon: FiMail, placeholder: 'Enter Email' },
              { label: 'Phone Connectivity', icon: FiPhone, placeholder: 'Enter Phone' }
            ].map((field, i) => (
              <div key={i} className="flex flex-col gap-2">
                <label className="text-[11px] font-black text-[#9B9BAD] uppercase tracking-[2px]">{field.label}</label>
                <div className="relative group">
                  <field.icon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9B9BAD]" />
                  <input type="text" placeholder={field.placeholder} className={`w-full rounded-2xl border-2 px-4 py-3 pl-11 transition-all outline-none font-bold text-sm bg-[#FAFAF8] border-[#F4F3EF] focus:border-[#0D47A1] focus:bg-white text-[#1A1A2E] placeholder:text-[#9B9BAD]`} />
                </div>
              </div>
            ))}
            <div className="flex flex-col gap-2">
              <label className="text-[11px] font-black text-[#9B9BAD] uppercase tracking-[2px]">Assign Department</label>
              <div className="relative group">
                <FiTarget className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9B9BAD]" />
                <select className={`w-full appearance-none rounded-2xl border-2 px-4 py-3 pl-11 transition-all outline-none font-bold text-sm cursor-pointer bg-[#FAFAF8] border-[#F4F3EF] focus:border-[#0D47A1] focus:bg-white text-[#1A1A2E]`}>
                  {departments.map(dept => <option key={dept} value={dept}>{dept}</option>)}
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9B9BAD] pointer-events-none" />
              </div>
            </div>
          </div>

          <div className="flex gap-4 pt-8 border-t border-[#F4F3EF]">
            <button type="button" onClick={onBack} className="flex-1 py-4 rounded-2xl border-2 border-[#F4F3EF] text-sm font-bold text-[#6B6B7E] hover:bg-[#F4F3EF] transition-all">Cancel</button>
            <button type="button" onClick={() => { alert('Employee Registered'); onBack(); }} className="flex-[2] bg-[#0D47A1] text-white py-4 rounded-2xl text-[11px] font-bold uppercase tracking-widest shadow-lg shadow-[#0D47A1]/20 hover:bg-[#0a3a82] transition-all">
              Authenticate & Register
            </button>
          </div>
        </form>
      </div>
    </motion.div>
  );
};

const MasterDataTab = ({ isDarkMode, selectedClient }) => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDept, setFilterDept] = useState('all');
  const [view, setView] = useState('list');
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  //mater data
  useEffect(() => {
    const mockData = [
      { id: 1, empId: 'EMP001', name: 'Rahul Sharma', email: 'rahul@company.com', phone: '+91 9876543210', department: 'Engineering', designation: 'Software Engineer', joiningDate: '2024-01-15', status: 'active', salary: 72000, reportingTo: 'Vikram Rao', avatar: 'RS', photo: 'https://randomuser.me/api/portraits/men/32.jpg' },
      { id: 2, empId: 'EMP002', name: 'Priya Singh', email: 'priya@company.com', phone: '+91 9876543211', department: 'HR', designation: 'HR Manager', joiningDate: '2023-06-20', status: 'active', salary: 63900, reportingTo: 'CEO', avatar: 'PS', photo: 'https://randomuser.me/api/portraits/women/44.jpg' },
      { id: 3, empId: 'EMP003', name: 'Amit Kumar', email: 'amit@company.com', phone: '+91 9876543212', department: 'Sales', designation: 'Sales Executive', joiningDate: '2024-03-10', status: 'active', salary: 50400, reportingTo: 'Sneha Patel', avatar: 'AK', photo: 'https://randomuser.me/api/portraits/men/67.jpg' },
      { id: 4, empId: 'EMP004', name: 'Sneha Patel', email: 'sneha@company.com', phone: '+91 9876543213', department: 'Finance', designation: 'Accountant', joiningDate: '2023-09-01', status: 'active', salary: 57600, reportingTo: 'CFO', avatar: 'SP', photo: 'https://randomuser.me/api/portraits/women/68.jpg' },
      { id: 5, empId: 'EMP005', name: 'Vikram Rao', email: 'vikram@company.com', phone: '+91 9876543214', department: 'Engineering', designation: 'Team Lead', joiningDate: '2022-04-15', status: 'active', salary: 86400, reportingTo: 'CTO', avatar: 'VR', photo: 'https://randomuser.me/api/portraits/men/75.jpg' },
      { id: 6, empId: 'EMP006', name: 'Anjali Gupta', email: 'anjali@company.com', phone: '+91 9876543215', department: 'Marketing', designation: 'Marketing Manager', joiningDate: '2023-11-01', status: 'inactive', salary: 65000, reportingTo: 'CMO', avatar: 'AG', photo: 'https://randomuser.me/api/portraits/women/65.jpg' },
    ];
    setTimeout(() => {
      setEmployees(mockData);
      setLoading(false);
    }, 500);
  }, [selectedClient]);

  const departments = ['Engineering', 'HR', 'Sales', 'Finance', 'Marketing', 'Operations'];

  const statCards = [
    { key: 'total', label: 'Global Directory', value: employees.length, icon: FiUsers, gradient: 'from-[#3FA9F5] via-[#1E88E5] to-[#0D47A1]' },
    { key: 'active', label: 'Active Force', value: employees.filter(e => e.status === 'active').length, icon: FiUserCheck, gradient: 'from-[#81C784] via-[#66BB6A] to-[#43A047]' },
    { key: 'inactive', label: 'Exit Profiles', value: employees.filter(e => e.status === 'inactive').length, icon: FiUserMinus, gradient: 'from-[#f43f5e] to-[#881337]' },
    { key: 'depts', label: 'Department Unit', value: [...new Set(employees.map(e => e.department))].length, icon: FiBriefcase, gradient: 'from-blue-600 to-indigo-900' },
  ];

  const filteredData = employees.filter(emp => {
    const matchesSearch = emp.name.toLowerCase().includes(searchTerm.toLowerCase()) || emp.empId.toLowerCase().includes(searchTerm.toLowerCase()) || emp.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDept = filterDept === 'all' || emp.department === filterDept;
    return matchesSearch && matchesDept;
  });

  if (loading) {
    return (
      <div className="space-y-6 text-left">
        <div className="flex justify-between items-center">
          <div className="space-y-2">
            <div className={`h-8 w-64 rounded-lg animate-pulse ${isDarkMode ? 'bg-slate-700' : 'bg-slate-200'}`}></div>
            <div className={`h-4 w-40 rounded-lg animate-pulse ${isDarkMode ? 'bg-slate-700' : 'bg-slate-200'}`}></div>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className={`h-28 rounded-2xl animate-pulse ${isDarkMode ? 'bg-slate-800' : 'bg-slate-200'}`}></div>
          ))}
        </div>
        <div className={`h-96 rounded-2xl animate-pulse ${isDarkMode ? 'bg-slate-800' : 'bg-slate-200'}`}></div>
      </div>
    );
  }

  return (
    <div className={`relative min-h-[600px] ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
      <AnimatePresence mode="wait">
        {view === 'list' && (
          <motion.div
            key="list"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="space-y-10"
          >
            <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
              <div className="text-left flex items-center gap-4">
                <h1 className="text-3xl font-bold text-[#1A1A2E] tracking-tight" style={{ fontFamily: "'Syne', sans-serif" }}>
                  Master Data
                </h1>
              </div>

              <div className="flex items-center gap-3">
                <button
                  className="flex items-center gap-2 px-6 py-3 rounded-xl border border-[#E8E7E2] text-[#1A1A2E] text-sm font-bold hover:bg-[#F4F3EF] transition-all bg-white shadow-sm"
                >
                  <Download size={18} /> Export Data
                </button>
                <button
                  onClick={() => setView('add')}
                  className="flex items-center gap-2 px-6 py-3 rounded-xl bg-[#0D47A1] text-white text-sm font-bold shadow-lg shadow-blue-500/20 hover:bg-[#0a3a82] transition-all active:scale-95"
                >
                  <Plus size={18} /> Add Employee
                </button>
              </div>
            </div>



            {/* Modern Search & Filters Unification */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className={`rounded-[24px] p-2 border flex items-center gap-3 flex-wrap mb-6 mt-8 ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-[#F4F3EF] shadow-sm'}`}>
              <div className="relative flex-1 group min-w-[200px]">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-[#9B9BAD] transition-colors" size={18} />
                <input
                  type="text"
                  placeholder="Search Within The Master Directory..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={`w-full border-none rounded-2xl py-3 pl-14 pr-5 text-sm font-medium outline-none transition-all placeholder:text-[#9B9BAD] ${isDarkMode ? 'bg-slate-800 text-white focus:ring-2 focus:ring-slate-700' : 'bg-[#F4F3EF] text-[#1A1A2E] focus:ring-2 focus:ring-[#F4F3EF]'}`}
                />
              </div>
              <div className="relative group">
                <select
                  value={filterDept}
                  onChange={(e) => setFilterDept(e.target.value)}
                  className={`text-[11px] font-black uppercase tracking-widest rounded-xl pl-4 pr-10 py-2.5 outline-none border-0 cursor-pointer appearance-none min-w-[200px] transition-all hover:bg-[#EEF2FB] ${isDarkMode ? 'bg-slate-800 text-white' : 'bg-[#F4F3EF] text-[#1A1A2E]'}`}
                >
                  <option value="all">Global Database</option>
                  {departments.map(dept => <option key={dept} value={dept}>{dept}</option>)}
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-[#1B4DA0] opacity-50 group-hover:opacity-100 transition-all pointer-events-none" size={14} />
              </div>
            </motion.div>

            {/* Modern Table Interface */}
            <div className={`rounded-[32px] border overflow-hidden transition-all ${isDarkMode ? 'bg-slate-900/40 border-slate-800' : 'bg-white border-[#F4F3EF] shadow-sm'}`}>
              <div className={`grid grid-cols-[1.5fr_180px_180px_120px_40px] gap-4 px-8 py-4 border-b ${isDarkMode ? 'border-slate-800 bg-transparent' : 'border-[#F4F3EF] bg-transparent'}`}>
                {["Employee", "Designation", "Department", "Status", ""].map((h, i) => (
                  <div key={i} className="text-[11px] font-bold text-[#94a3b8] uppercase tracking-widest text-left flex items-start justify-start">
                    {h}
                  </div>
                ))}
              </div>

              <div className="flex flex-col">
                <AnimatePresence mode="popLayout">
                  {filteredData.length === 0 ? (
                    <div className="py-24 text-center">
                      <p className="text-[#9B9BAD] text-sm font-bold uppercase tracking-widest">No employees found</p>
                    </div>
                  ) : (
                    filteredData.map((emp, index) => (
                      <motion.div
                        key={emp.id}
                        layout
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ delay: index * 0.05 }}
                        onClick={() => { setSelectedEmployee(emp); setView('details'); }}
                        className={`grid grid-cols-[1.5fr_180px_180px_120px_40px] gap-4 items-center px-8 py-3 border-b last:border-0 cursor-pointer transition-all group relative ${isDarkMode ? 'border-slate-800 hover:bg-slate-800/40' : 'border-[#F4F3EF] hover:bg-[#F8FAFF]'}`}
                      >
                        <div className="flex items-center gap-4 min-w-0 py-1">
                          <div className="w-[42px] h-[42px] rounded-[14px] flex items-center justify-center font-bold shadow-sm transition-transform group-hover:scale-110 bg-[#F0F7FF] text-[#1B4DA0] text-[13px]">
                            {(emp.name || '??').charAt(0).toUpperCase()}
                          </div>
                          <div className="flex flex-col min-w-0 text-left">
                            <p className={`text-[14px] font-bold truncate transition-colors ${isDarkMode ? 'text-white group-hover:text-[#0D47A1]' : 'text-[#0f172a] group-hover:text-[#0D47A1]'}`}>
                              {emp.name}
                            </p>
                            <p className="text-[10px] font-bold text-[#9B9BAD] uppercase tracking-wider mt-0.5">{emp.empId}</p>
                          </div>
                        </div>
                        <div className="text-left">
                          <p className="text-[13px] font-bold text-[#6B6B7E]">{emp.designation}</p>
                        </div>
                        <div className="text-left">
                          <p className="text-[13px] font-bold text-[#6B6B7E]">{emp.department}</p>
                        </div>
                        <div className="text-left">
                          <div className={`px-3 py-1.5 rounded-lg flex items-center gap-2 inline-flex border ${emp.status === 'active' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-rose-50 text-rose-600 border-rose-100'}`}>
                            <span className="text-[10px] font-black uppercase tracking-widest">{emp.status}</span>
                          </div>
                        </div>
                        <div className="flex justify-end pr-2">
                          <ChevronRight size={20} className={`transition-all ${isDarkMode ? 'text-slate-700' : 'text-[#C5C5D2] group-hover:text-[#0D47A1]'}`} />
                        </div>
                      </motion.div>
                    ))
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Portaled Drawers */}
      {typeof document !== 'undefined' && createPortal(
        <AnimatePresence>
          {(view === 'details' || view === 'add') && (
            <motion.div
              key="shared-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => { setSelectedEmployee(null); setView('list'); }}
              className="fixed inset-0 bg-[#1A1A2E]/40 backdrop-blur-md z-[1100]"
            />
          )}

          {view === 'add' && (
            <div key="add-modal" className="fixed inset-0 z-[1101] flex items-center justify-center p-4 sm:p-6 md:p-10 pointer-events-none">
              <div className="w-full max-w-3xl pointer-events-auto flex items-center justify-center">
                <MasterDataFormView onBack={() => setView('list')} isDarkMode={isDarkMode} departments={departments} />
              </div>
            </div>
          )}

          {view === 'details' && selectedEmployee && (
            <motion.div
              key="details-drawer"
              initial={{ x: '100%', opacity: 0.5 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: '100%', opacity: 0.5 }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed inset-y-0 right-0 w-full sm:w-[550px] md:w-[650px] shadow-2xl z-[1101] border-l bg-white border-[#F4F3EF] overflow-hidden"
            >
              <MasterDataDetailView
                employee={selectedEmployee}
                onBack={() => { setSelectedEmployee(null); setView('list'); }}
                isDarkMode={isDarkMode}
              />
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </div>
  );
};

export default MasterDataTab;