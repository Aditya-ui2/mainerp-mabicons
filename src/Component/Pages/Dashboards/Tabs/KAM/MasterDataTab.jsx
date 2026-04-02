

import { useState, useEffect } from 'react';
import { FiUsers, FiMail, FiPhone, FiMapPin, FiEdit2, FiTrash2, FiPlus, FiSearch, FiDownload, FiEye, FiChevronDown, FiX, FiBriefcase, FiCalendar, FiUserCheck, FiUserX, FiUserMinus, FiTarget, FiArrowLeft, FiBriefcase as FiRole } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';

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
            {/* Modern Header */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-12">
              <div className="flex items-center gap-4 text-left">
                <div className="p-4 rounded-2xl bg-gradient-to-br from-[#3FA9F5] via-[#1E88E5] to-[#0D47A1] shadow-xl shadow-blue-500/20">
                  <FiUsers className="w-8 h-8 text-white" />
                </div>
                <div className="flex flex-col">
                  <h2 className="text-3xl lg:text-4xl font-black text-[#1E88E5] tracking-tight mb-1 font-[Outfit]">
                    Master Data
                  </h2>
                  <div className="flex items-center gap-2 text-slate-600 font-bold font-[Outfit]">
                    <FiCalendar className="w-4 h-4" />
                    <span className="text-sm">
                      {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })} • {employees.length} Records
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-4">
                <motion.button
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className={`flex items-center gap-2 px-6 py-3 rounded-[1.2rem] font-bold text-[11px] border-2 transition-all font-[Outfit] ${isDarkMode ? 'border-slate-800 hover:bg-slate-800 text-slate-400' : 'border-slate-100 hover:bg-slate-100 text-slate-500 shadow-sm'}`}
                >
                  <FiDownload className="w-4 h-4" />
                  Export Data
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setView('add')}
                  className="flex items-center justify-center gap-2.5 px-6 py-3 bg-gradient-to-r from-[#3FA9F5] via-[#1E88E5] to-[#0D47A1] text-white rounded-[1.2rem] font-black shadow-xl shadow-blue-500/30 transition-all text-[11px] font-[Outfit]"
                >
                  <FiPlus className="w-4 h-4" />
                  Add Employee
                </motion.button>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {statCards.map((stat, index) => (
                <motion.div
                  key={stat.key}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`relative overflow-hidden rounded-3xl p-8 border ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-[#edf3ff] border-white shadow-lg shadow-blue-500/5'}`}
                >
                  <div className="relative z-10 flex flex-col h-full gap-4 text-left font-[Outfit]">
                    <div className="flex items-center justify-between mb-2">
                      <div className={`p-2.5 rounded-xl bg-gradient-to-br ${stat.gradient} shadow-lg shadow-blue-500/20`}>
                        <stat.icon className="w-4 h-4 text-white" />
                      </div>
                    </div>
                    <p className={`text-[13px] font-black ${isDarkMode ? 'text-slate-400' : 'text-slate-800'}`}>
                      {stat.label}
                    </p>
                    <div className="flex items-baseline gap-2">
                      <span className={`text-4xl font-black ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                        {stat.value}
                      </span>
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Records</span>
                    </div>
                    <div className={`w-full h-1.5 rounded-full overflow-hidden ${isDarkMode ? 'bg-slate-800' : 'bg-white/50'}`}>
                      <motion.div initial={{ width: 0 }} animate={{ width: '60%' }} className={`h-full bg-gradient-to-r ${stat.gradient}`} />
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Search & Filters */}
            <div className="flex flex-col sm:flex-row gap-6 font-[Outfit]">
              <div className="relative flex-1 group">
                <FiSearch className={`absolute left-5 top-1/2 -translate-y-1/2 w-6 h-6 transition-colors group-focus-within:text-blue-500 ${isDarkMode ? 'text-slate-600' : 'text-slate-300'}`} />
                <input
                  type="text"
                  placeholder="Search Within The Master Directory..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={`w-full rounded-[1.5rem] border-2 px-6 py-4 pl-14 transition-all focus:ring-4 focus:ring-blue-500/10 outline-none font-bold text-[11px] ${isDarkMode ? 'bg-slate-900/60 border-slate-800 text-white' : 'bg-white border-slate-100 shadow-sm'}`}
                />
              </div>
              <div className="relative group">
                <select
                  value={filterDept}
                  onChange={(e) => setFilterDept(e.target.value)}
                  className={`appearance-none rounded-[1.5rem] border-2 px-10 py-4 pr-16 font-black text-[11px] cursor-pointer transition-all outline-none ${isDarkMode ? 'bg-slate-900/60 border-slate-800 text-white' : 'bg-white border-slate-100 shadow-sm'}`}
                >
                  <option value="all">Global Database</option>
                  {departments.map(dept => <option key={dept} value={dept}>{dept}</option>)}
                </select>
                <FiChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 w-5 h-5 pointer-events-none text-slate-400" />
              </div>
            </div>

            {/* Employee List */}
            <div className="flex flex-col gap-4 pb-12 max-w-6xl mx-auto font-[Outfit]">
              {filteredData.map((emp, index) => (
                <motion.div
                  key={emp.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => { setSelectedEmployee(emp); setView('details'); }}
                  className={`group relative overflow-hidden rounded-[2rem] border transition-all duration-300 cursor-pointer ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-[#f8fbff] border-white shadow-sm hover:shadow-md hover:border-blue-500/20'}`}
                >
                  <div className="p-4 px-8 flex items-center justify-between gap-6">
                    <div className="flex items-center gap-6 min-w-[250px] text-left">
                      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#3FA9F5] via-[#1E88E5] to-[#0D47A1] flex items-center justify-center text-white font-black text-xl shadow-lg">
                        {emp.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex flex-col text-left">
                        <h3 className="font-extrabold text-lg text-slate-900 dark:text-white leading-tight">{emp.name}</h3>
                        <p className="text-[10px] font-bold text-slate-400">{emp.empId}</p>
                      </div>
                    </div>

                    <div className="hidden md:block text-left min-w-[200px]">
                      <p className="text-[12px] font-black text-slate-900 dark:text-slate-200">{emp.designation}</p>
                      <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400">{emp.department}</p>
                    </div>

                    <div className="flex items-center gap-6">
                      <div className={`px-5 py-2.5 rounded-full flex items-center gap-2.5 border ${emp.status === 'active' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-rose-50 text-rose-600 border-rose-100'}`}>
                        <span className="text-[11px] font-black">{emp.status.charAt(0).toUpperCase() + emp.status.slice(1)}</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {view === 'add' && (
          <motion.div
            key="add"
            initial={{ x: '100%', opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="space-y-10 font-[Outfit]"
          >
            <div className="flex flex-col gap-8">
              <motion.button
                whileHover={{ x: -10 }}
                onClick={() => setView('list')}
                className="flex items-center gap-2.5 self-start px-6 py-3 rounded-xl border-2 border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all font-black text-[11px]"
              >
                <FiArrowLeft className="w-4 h-4" />
                Back To Directory
              </motion.button>

              <div className="flex items-center gap-6 text-left">
                <div className="p-6 rounded-[2.5rem] bg-gradient-to-br from-[#3FA9F5] via-[#1E88E5] to-[#0D47A1] shadow-2xl shadow-blue-500/20">
                  <FiPlus className="w-12 h-12 text-white" />
                </div>
                <div className="flex flex-col">
                  <h2 className="text-5xl font-black text-slate-900 dark:text-white tracking-tight leading-none">
                    Add New Member
                  </h2>
                  <p className="text-sm font-bold text-[#1E88E5] mt-3 ml-1">
                    Master Data Profile System
                  </p>
                </div>
              </div>
            </div>

            <div className={`p-16 rounded-[4rem] border-2 ${isDarkMode ? 'bg-slate-900 border-slate-800 shadow-2xl' : 'bg-white border-slate-100 shadow-2xl shadow-blue-500/10'}`}>
              <form className="space-y-12 text-left">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                  {[
                    { label: 'Full Member Name', icon: FiUsers, placeholder: 'Enter Name' },
                    { label: 'Official Email', icon: FiMail, placeholder: 'Enter Email' },
                    { label: 'Phone Connectivity', icon: FiPhone, placeholder: 'Enter Phone' }
                  ].map((field, i) => (
                    <div key={i} className="space-y-4">
                      <label className="block text-[11px] font-black text-[#1E88E5] ml-2">{field.label}</label>
                      <div className="relative group">
                        <field.icon className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-slate-300 group-focus-within:text-[#1E88E5] transition-colors" />
                        <input type="text" placeholder={field.placeholder} className={`w-full rounded-2xl border-2 px-16 py-5 transition-all outline-none font-bold text-base ${isDarkMode ? 'bg-slate-800/50 border-slate-700 text-white focus:border-[#1E88E5]' : 'bg-slate-50 border-slate-100 focus:border-[#1E88E5] focus:bg-white'}`} />
                      </div>
                    </div>
                  ))}
                  <div className="space-y-4">
                    <label className="block text-[11px] font-black text-[#1E88E5] ml-2">Assign Department</label>
                    <div className="relative group">
                      <FiTarget className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-slate-300 group-focus-within:text-[#1E88E5] transition-colors" />
                      <select className={`w-full appearance-none rounded-2xl border-2 px-16 py-5 transition-all outline-none font-black text-[11px] cursor-pointer ${isDarkMode ? 'bg-slate-800/50 border-slate-700 text-white' : 'bg-slate-50 border-slate-100 focus:border-[#1E88E5]'}`}>
                        {departments.map(dept => <option key={dept} value={dept}>{dept}</option>)}
                      </select>
                    </div>
                  </div>
                </div>

                <div className="pt-8">
                  <motion.button
                    whileHover={{ scale: 1.02, y: -5 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full md:w-auto px-16 py-6 bg-gradient-to-r from-[#3FA9F5] via-[#1E88E5] to-[#0D47A1] text-white rounded-[2rem] font-black text-[13px] shadow-2xl shadow-blue-500/40"
                  >
                    Authenticate & Register
                  </motion.button>
                </div>
              </form>
            </div>
          </motion.div>
        )}

        {view === 'details' && selectedEmployee && (
          <motion.div
            key="details"
            initial={{ x: '100%', opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="space-y-10 font-[Outfit]"
          >
            {/* Header Section */}
            <div className="flex flex-col gap-8">
              <motion.button
                whileHover={{ x: -10 }}
                onClick={() => setView('list')}
                className="flex items-center gap-2.5 self-start px-6 py-3 rounded-xl border-2 border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all font-black text-[11px]"
              >
                <FiArrowLeft className="w-4 h-4" />
                Back To Directory
              </motion.button>

              <div className="flex items-center gap-8 text-left">
                <div className="relative">
                  <div className="w-32 h-32 rounded-[2.5rem] bg-gradient-to-br from-[#3FA9F5] via-[#1E88E5] to-[#0D47A1] flex items-center justify-center text-white font-black text-5xl shadow-2xl shadow-blue-500/30">
                    {selectedEmployee.name.charAt(0)}
                  </div>
                  <div className="absolute -bottom-2 -right-2 p-3 bg-white dark:bg-slate-800 rounded-2xl shadow-lg border-2 border-blue-50 dark:border-slate-700">
                    <FiUserCheck className="w-6 h-6 text-emerald-500" />
                  </div>
                </div>
                <div className="flex flex-col">
                  <h2 className="text-5xl font-black text-slate-900 dark:text-white tracking-tight uppercase leading-none">
                    {selectedEmployee.name}
                  </h2>
                  <div className="flex items-center gap-3 mt-4">
                    <span className="px-4 py-1.5 bg-blue-50 dark:bg-blue-900/30 text-[#1E88E5] rounded-full text-[11px] font-black tracking-widest uppercase">
                      {selectedEmployee.empId}
                    </span>
                    <span className={`px-4 py-1.5 rounded-full text-[11px] font-black uppercase tracking-widest ${selectedEmployee.status === 'active' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                      {selectedEmployee.status}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Information Grid Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className={`col-span-1 lg:col-span-2 p-12 rounded-[3.5rem] border ${isDarkMode ? 'bg-slate-900 border-slate-800 shadow-2xl' : 'bg-white border-slate-100 shadow-2xl shadow-blue-500/5'}`}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 text-left">
                  {[
                    { label: 'Official Role', value: selectedEmployee.designation, icon: FiRole },
                    { label: 'Unit/Department', value: selectedEmployee.department, icon: FiTarget },
                    { label: 'Email Connectivity', value: selectedEmployee.email, icon: FiMail },
                    { label: 'Secure Phone Link', value: selectedEmployee.phone, icon: FiPhone },
                    { label: 'Joining Milestone', value: new Date(selectedEmployee.joiningDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }), icon: FiCalendar },
                    { label: 'Reporting Matrix', value: selectedEmployee.reportingTo, icon: FiUsers }
                  ].map((item, i) => (
                    <motion.div
                      key={i}
                      whileHover={{ y: -5 }}
                      className="space-y-3 p-6 rounded-3xl bg-slate-50/50 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-800"
                    >
                      <div className="flex items-center gap-3 text-[#1E88E5]">
                        <item.icon className="w-4 h-4" />
                        <label className="text-[10px] font-black uppercase tracking-widest">{item.label}</label>
                      </div>
                      <p className="text-lg font-extrabold text-slate-800 dark:text-white capitalize">{item.value}</p>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Side Card / Actions */}
              <div className="space-y-8">
                <div className={`p-10 rounded-[3rem] border ${isDarkMode ? 'bg-slate-900 border-slate-800 shadow-2xl' : 'bg-gradient-to-br from-blue-600 to-indigo-900 border-blue-500 shadow-2xl shadow-blue-500/20'}`}>
                  <div className="text-left space-y-6">
                    <p className={`text-[11px] font-black uppercase tracking-[0.2em] ${isDarkMode ? 'text-blue-400' : 'text-blue-100/60'}`}>Account Status</p>
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-black text-white">Fully Verified</span>
                      <FiUserCheck className="w-8 h-8 text-emerald-400" />
                    </div>
                    <div className={`w-full h-2 rounded-full overflow-hidden ${isDarkMode ? 'bg-slate-800' : 'bg-white/20'}`}>
                      <div className="w-full h-full bg-emerald-400 shadow-[0_0_15px_rgba(52,211,153,0.5)]"></div>
                    </div>
                    <p className={`text-[10px] font-bold ${isDarkMode ? 'text-slate-400' : 'text-blue-100/50'}`}>All security credentials and professional audits are up to date for this member.</p>
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.02, y: -5 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setView('list')}
                  className="w-full px-12 py-6 bg-slate-900 dark:bg-slate-800 text-white rounded-[2rem] font-black text-[12px] uppercase tracking-[0.3em] shadow-2xl flex items-center justify-center gap-3 border border-slate-800 dark:border-slate-700"
                >
                  Close Profile
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MasterDataTab;