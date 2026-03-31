import { useState, useEffect } from 'react';
import { FiUsers, FiMail, FiPhone, FiMapPin, FiEdit2, FiTrash2, FiPlus, FiSearch, FiDownload, FiEye, FiChevronDown, FiX, FiBriefcase, FiCalendar, FiUserCheck, FiUserX } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';

const MasterDataTab = ({ isDarkMode, selectedClient }) => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDept, setFilterDept] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [hoveredCard, setHoveredCard] = useState(null);

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
    { key: 'inactive', label: 'Exit Profiles', value: employees.filter(e => e.status === 'inactive').length, icon: FiUserX, gradient: 'from-rose-500 to-pink-600' },
    { key: 'depts', label: 'Department Unit', value: [...new Set(employees.map(e => e.department))].length, icon: FiBriefcase, gradient: 'from-blue-600 to-indigo-900' },
  ];

  const getAvatarColor = (name) => {
    const colors = ['from-violet-500 to-purple-600', 'from-blue-500 to-cyan-600', 'from-emerald-500 to-teal-600', 'from-rose-500 to-pink-600', 'from-amber-500 to-orange-600'];
    return colors[name.charCodeAt(0) % colors.length];
  };

  const filteredData = employees.filter(emp => {
    const matchesSearch = emp.name.toLowerCase().includes(searchTerm.toLowerCase()) || emp.empId.toLowerCase().includes(searchTerm.toLowerCase()) || emp.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDept = filterDept === 'all' || emp.department === filterDept;
    return matchesSearch && matchesDept;
  });

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div className="space-y-2">
            <div className={`h-8 w-64 rounded-lg animate-pulse ${isDarkMode ? 'bg-slate-700' : 'bg-slate-200'}`}></div>
            <div className={`h-4 w-40 rounded-lg animate-pulse ${isDarkMode ? 'bg-slate-700' : 'bg-slate-200'}`}></div>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1,2,3,4].map(i => (
            <div key={i} className={`h-28 rounded-2xl animate-pulse ${isDarkMode ? 'bg-slate-800' : 'bg-slate-200'}`}></div>
          ))}
        </div>
        <div className={`h-96 rounded-2xl animate-pulse ${isDarkMode ? 'bg-slate-800' : 'bg-slate-200'}`}></div>
      </div>
    );
  }

  return (
    <div className={`space-y-10 ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
      {/* Header - Match Screenshot Style */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6"
      >
        <div className="flex items-center gap-5">
          <div className="p-4 rounded-[1.5rem] bg-gradient-to-br from-[#3FA9F5] via-[#1E88E5] to-[#0D47A1] shadow-2xl shadow-blue-500/30 ring-4 ring-blue-500/10 transition-transform hover:scale-105 active:scale-95 duration-300">
            <FiUsers className="w-8 h-8 text-white" />
          </div>
          <div className="flex flex-col gap-1">
            <h2 className="text-3xl lg:text-4xl font-black bg-gradient-to-r from-[#3FA9F5] via-[#1E88E5] to-[#0D47A1] bg-clip-text text-transparent tracking-tight">
              Employee Master Directory
            </h2>
            <p className={`text-[10px] font-black uppercase tracking-[0.2em] ${isDarkMode ? 'text-blue-400/70' : 'text-[#3FA9F5]'}`}>
              Comprehensive central repository of employee profiles
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <motion.button
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            className={`flex items-center gap-2 px-6 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest border-2 transition-all ${isDarkMode ? 'border-slate-800 hover:bg-slate-800 text-slate-400' : 'border-slate-100 hover:bg-slate-50 text-slate-500 shadow-sm'}`}
          >
            <FiDownload className="w-4 h-4" />
            Export Data
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05, y: -2, shadow: "0 20px 40px -10px rgba(30,136,229,0.4)" }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-3 px-10 py-5 bg-gradient-to-r from-[#3FA9F5] via-[#1E88E5] to-[#0D47A1] text-white rounded-full font-black text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-blue-500/30 transition-all"
          >
            <FiPlus className="w-5 h-5" />
            Add Employee
          </motion.button>
        </div>
      </motion.div>

      {/* Stats Cards - FnF Layout */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <motion.div
            key={stat.key}
            initial={{ opacity: 0, y: 30, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ type: "spring", stiffness: 260, damping: 20, delay: index * 0.1 }}
            onMouseEnter={() => setHoveredCard(stat.key)}
            onMouseLeave={() => setHoveredCard(null)}
            className={`relative overflow-hidden rounded-[2rem] p-6 transition-all duration-500 cursor-pointer border-2 ${isDarkMode
                ? 'bg-slate-900/40 border-slate-800 hover:border-blue-500/40'
                : 'bg-gradient-to-br from-blue-50 to-indigo-50 border-white shadow-sm hover:shadow-xl hover:border-blue-100'
              } ${hoveredCard === stat.key ? 'scale-[1.02]' : ''}`}
          >
            <div className="relative text-left">
              <div className="flex items-center justify-between mb-4">
                <p className={`text-[10px] font-black uppercase tracking-[0.2em] ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                  {stat.label}
                </p>
                <div className={`p-2.5 rounded-xl bg-gradient-to-br ${stat.gradient} shadow-lg shadow-blue-500/20`}>
                  <stat.icon className="w-4 h-4 text-white" />
                </div>
              </div>
              <p className={`text-4xl font-black tracking-tighter ${isDarkMode ? 'text-white' : 'text-[#0D47A1]'}`}>
                {stat.value}
              </p>

              <div className={`mt-5 h-1.5 rounded-full overflow-hidden ${isDarkMode ? 'bg-slate-800' : 'bg-white/50'}`}>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: '65%' }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  className={`h-full bg-gradient-to-r ${stat.gradient}`}
                />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Search & Filters - FnF Style */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="flex flex-col sm:flex-row gap-6"
      >
        <div className="relative flex-1 group">
          <FiSearch className={`absolute left-5 top-1/2 -translate-y-1/2 w-6 h-6 transition-colors group-focus-within:text-blue-500 ${isDarkMode ? 'text-slate-600' : 'text-slate-300'}`} />
          <input
            type="text"
            placeholder="Search within the master directory..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`w-full rounded-[1.5rem] border-2 px-6 py-4 pl-14 transition-all focus:ring-4 focus:ring-blue-500/10 outline-none font-bold uppercase tracking-widest text-[10px] ${isDarkMode
                ? 'bg-slate-900/60 border-slate-800 text-white placeholder:text-slate-700'
                : 'bg-white border-slate-100 shadow-sm placeholder:text-slate-300'
              }`}
          />
        </div>
        <div className="relative group">
          <select
            value={filterDept}
            onChange={(e) => setFilterDept(e.target.value)}
            className={`appearance-none rounded-[1.5rem] border-2 px-10 py-4 pr-16 font-black uppercase tracking-widest text-[10px] cursor-pointer transition-all focus:ring-4 focus:ring-blue-500/10 outline-none ${isDarkMode
                ? 'bg-slate-900/60 border-slate-800 text-white'
                : 'bg-white border-slate-100 shadow-sm transition-transform hover:scale-105 active:scale-95'
              }`}
          >
            <option value="all">Global Database</option>
            {departments.map(dept => (
              <option key={dept} value={dept}>{dept}</option>
            ))}
          </select>
          <FiChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 w-5 h-5 pointer-events-none text-slate-400" />
        </div>
      </motion.div>

      {/* Employee List - Card Style Refactor */}
      <div className="grid grid-cols-1 gap-6 pb-12">
        <AnimatePresence mode="popLayout">
          {filteredData.map((emp, index) => (
            <motion.div
              key={emp.id}
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ delay: index * 0.05, type: "spring", stiffness: 100, damping: 15 }}
              whileHover={{ y: -8, shadow: "0 40px 60px -20px rgba(0,0,0,0.15)" }}
              className={`group relative overflow-hidden rounded-[2.5rem] border-2 transition-all duration-500 ${isDarkMode
                  ? 'bg-slate-900/40 border-slate-800 hover:border-blue-500/40 shadow-black/40'
                  : 'bg-white border-slate-100 hover:border-blue-200 hover:shadow-2xl'
                }`}
            >
              {/* Card Accent Decor */}
              <div className={`absolute top-0 right-0 w-48 h-48 opacity-[0.03] group-hover:opacity-10 blur-3xl rounded-full bg-gradient-to-br transition-opacity duration-700 ${getAvatarColor(emp.name)}`}></div>

              <div className="p-8">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                  {/* Avatar & Basic Info */}
                  <div className="flex items-center gap-6">
                    <motion.div
                      whileHover={{ rotate: 10, scale: 1.1 }}
                      className={`w-20 h-20 rounded-[2rem] bg-white flex items-center justify-center text-[#1E88E5] font-black text-4xl shadow-xl border border-slate-100 uppercase transition-all duration-500 ring-8 ring-blue-50/50`}
                    >
                      {emp.name.charAt(0)}
                    </motion.div>
                    <div>
                      <h3 className="font-black text-2xl tracking-tight mb-1 group-hover:text-[#1E88E5] transition-colors">{emp.name}</h3>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${isDarkMode ? 'bg-slate-800 text-blue-400' : 'bg-blue-50 text-blue-600'}`}>
                          {emp.empId}
                        </span>
                        <span className={`text-[10px] font-black tracking-widest uppercase ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                          Joined {new Date(emp.joiningDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Operational Data */}
                  <div className="flex-1 max-w-2xl">
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                      <div className="flex flex-col gap-1">
                        <span className="text-[10px] font-black uppercase tracking-widest text-[#1E88E5]/60">Department</span>
                        <p className="font-bold text-sm tracking-tight">{emp.department}</p>
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="text-[10px] font-black uppercase tracking-widest text-[#1E88E5]/60">Email Address</span>
                        <p className="font-bold text-sm tracking-tight truncate max-w-[150px]">{emp.email}</p>
                      </div>
                      <div className="hidden md:flex flex-col gap-1">
                        <span className="text-[10px] font-black uppercase tracking-widest text-[#1E88E5]/60">Reporting To</span>
                        <p className="font-bold text-sm tracking-tight">{emp.reportingTo}</p>
                      </div>
                    </div>
                  </div>

                  {/* Status & Actions */}
                  <div className="flex items-center justify-between lg:justify-end gap-6 pt-6 lg:pt-0 border-t lg:border-t-0 lg:border-l border-slate-100 lg:pl-8">
                    <span className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] shadow-lg transition-all border ${emp.status === 'active'
                        ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                        : 'bg-rose-50 text-rose-600 border-rose-100'
                      }`}>
                      <span className={`w-2 h-2 rounded-full bg-current animate-pulse`}></span>
                      {emp.status}
                    </span>
                    <div className="flex gap-2">
                      <motion.button
                        whileHover={{ scale: 1.1, backgroundColor: '#EFF6FF' }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setSelectedEmployee(emp)}
                        className="p-3.5 rounded-2xl bg-blue-50/50 text-blue-600 border border-blue-50 transition-all dark:bg-slate-800 dark:border-slate-700"
                      >
                        <FiEye className="w-5 h-5" />
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className="p-3.5 rounded-2xl bg-slate-50 text-slate-400 border border-slate-100 transition-all dark:bg-slate-800 dark:border-slate-700"
                      >
                        <FiEdit2 className="w-5 h-5" />
                      </motion.button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* View Employee Modal */}
      <AnimatePresence>
        {selectedEmployee && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4"
            onClick={() => setSelectedEmployee(null)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: 20, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className={`w-full max-w-lg rounded-[2.5rem] shadow-2xl relative overflow-hidden ${isDarkMode ? 'bg-slate-900 border border-slate-800' : 'bg-white'}`}
            >
              <div className={`h-3 bg-gradient-to-r from-[#3FA9F5] via-[#1E88E5] to-[#0D47A1]`}></div>
              <div className="p-8">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex flex-col">
                    <h3 className="text-2xl font-black tracking-tight">Profile Intelligence</h3>
                    <p className="text-[10px] font-black uppercase tracking-widest text-[#1E88E5]">Detailed auditory overview</p>
                  </div>
                  <button onClick={() => setSelectedEmployee(null)} className={`p-2.5 rounded-xl transition-all ${isDarkMode ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-slate-50 text-slate-400'}`}>
                    <FiX className="w-6 h-6" />
                  </button>
                </div>

                <div className="flex items-center gap-6 mb-8">
                  <div className={`w-24 h-24 rounded-[2rem] bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-black text-4xl shadow-xl ring-8 ring-blue-50/30`}>
                    {selectedEmployee.avatar}
                  </div>
                  <div>
                    <p className="font-black text-3xl tracking-tight uppercase">{selectedEmployee.name}</p>
                    <p className={`text-xs font-black tracking-widest uppercase ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>{selectedEmployee.empId}</p>
                  </div>
                </div>

                <div className={`grid grid-cols-2 gap-y-6 gap-x-4 p-8 rounded-[2rem] border-2 shadow-inner ${isDarkMode ? 'bg-slate-800/40 border-slate-800' : 'bg-slate-50 border-slate-100'}`}>
                  <div><p className={`text-[10px] font-black uppercase tracking-widest mb-1 text-slate-400`}>Email Address</p><p className="font-bold text-sm tracking-tight truncate">{selectedEmployee.email}</p></div>
                  <div><p className={`text-[10px] font-black uppercase tracking-widest mb-1 text-slate-400`}>Phone Number</p><p className="font-bold text-sm tracking-tight">{selectedEmployee.phone}</p></div>
                  <div><p className={`text-[10px] font-black uppercase tracking-widest mb-1 text-slate-400`}>Department</p><p className="font-bold text-sm tracking-tight">{selectedEmployee.department}</p></div>
                  <div><p className={`text-[10px] font-black uppercase tracking-widest mb-1 text-slate-400`}>Current Role</p><p className="font-bold text-sm tracking-tight">{selectedEmployee.designation}</p></div>
                  <div><p className={`text-[10px] font-black uppercase tracking-widest mb-1 text-slate-400`}>Joining Date</p><p className="font-bold text-sm tracking-tight">{new Date(selectedEmployee.joiningDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p></div>
                  <div><p className={`text-[10px] font-black uppercase tracking-widest mb-1 text-slate-400`}>Direct Report</p><p className="font-bold text-sm tracking-tight underline decoration-blue-200 underline-offset-4">{selectedEmployee.reportingTo}</p></div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setSelectedEmployee(null)}
                  className="w-full mt-8 px-6 py-4 bg-gradient-to-r from-[#3FA9F5] via-[#1E88E5] to-[#0D47A1] text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-blue-500/30"
                >
                  Terminate View
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add Employee Modal */}
      <AnimatePresence>
        {showAddModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowAddModal(false)}
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className={`w-full max-w-2xl rounded-3xl shadow-2xl max-h-[90vh] overflow-y-auto ${isDarkMode ? 'bg-slate-800' : 'bg-white'}`}
            >
              <div className="h-2 bg-gradient-to-r from-violet-500 to-purple-600 rounded-t-3xl"></div>
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold flex items-center gap-2">
                    <FiPlus className="w-5 h-5 text-violet-500" />
                    Add New Employee
                  </h3>
                  <button onClick={() => setShowAddModal(false)} className={`p-2 rounded-xl transition-colors ${isDarkMode ? 'hover:bg-slate-700' : 'hover:bg-slate-100'}`}>
                    <FiX className="w-5 h-5" />
                  </button>
                </div>
                
                <form className="space-y-5">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>Full Name</label>
                      <input type="text" className={`w-full rounded-xl border-2 px-4 py-3 transition-all focus:ring-2 focus:ring-violet-500/50 ${isDarkMode ? 'bg-slate-700/50 border-slate-600' : 'bg-white border-slate-200'}`} placeholder="Enter name" />
                    </div>
                    <div>
                      <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>Email</label>
                      <input type="email" className={`w-full rounded-xl border-2 px-4 py-3 ${isDarkMode ? 'bg-slate-700/50 border-slate-600' : 'bg-white border-slate-200'}`} placeholder="Enter email" />
                    </div>
                    <div>
                      <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>Phone</label>
                      <input type="tel" className={`w-full rounded-xl border-2 px-4 py-3 ${isDarkMode ? 'bg-slate-700/50 border-slate-600' : 'bg-white border-slate-200'}`} placeholder="Enter phone" />
                    </div>
                    <div>
                      <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>Department</label>
                      <select className={`w-full rounded-xl border-2 px-4 py-3 ${isDarkMode ? 'bg-slate-700/50 border-slate-600' : 'bg-white border-slate-200'}`}>
                        {departments.map(dept => <option key={dept} value={dept}>{dept}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>Designation</label>
                      <input type="text" className={`w-full rounded-xl border-2 px-4 py-3 ${isDarkMode ? 'bg-slate-700/50 border-slate-600' : 'bg-white border-slate-200'}`} placeholder="Enter designation" />
                    </div>
                    <div>
                      <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>Joining Date</label>
                      <input type="date" className={`w-full rounded-xl border-2 px-4 py-3 ${isDarkMode ? 'bg-slate-700/50 border-slate-600' : 'bg-white border-slate-200'}`} />
                    </div>
                    <div>
                      <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>Salary</label>
                      <input type="number" className={`w-full rounded-xl border-2 px-4 py-3 ${isDarkMode ? 'bg-slate-700/50 border-slate-600' : 'bg-white border-slate-200'}`} placeholder="Enter salary" />
                    </div>
                    <div>
                      <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>Reporting To</label>
                      <input type="text" className={`w-full rounded-xl border-2 px-4 py-3 ${isDarkMode ? 'bg-slate-700/50 border-slate-600' : 'bg-white border-slate-200'}`} placeholder="Enter manager name" />
                    </div>
                  </div>
                  <div className="flex gap-3 pt-4">
                    <motion.button 
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="button" 
                      onClick={() => setShowAddModal(false)} 
                      className={`flex-1 px-4 py-3 rounded-xl font-medium border-2 ${isDarkMode ? 'border-slate-600 hover:bg-slate-700' : 'border-slate-200 hover:bg-slate-50'}`}
                    >
                      Cancel
                    </motion.button>
                    <motion.button 
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="submit" 
                      className="flex-1 px-4 py-3 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-xl font-medium shadow-lg shadow-violet-500/25"
                    >
                      Add Employee
                    </motion.button>
                  </div>
                </form>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MasterDataTab;
