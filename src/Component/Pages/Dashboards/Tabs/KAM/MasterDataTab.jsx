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
    { key: 'total', label: 'Total Employees', value: employees.length, icon: FiUsers, gradient: 'from-violet-500 to-purple-600', lightBg: 'bg-gradient-to-br from-violet-50 to-purple-50' },
    { key: 'active', label: 'Active', value: employees.filter(e => e.status === 'active').length, icon: FiUserCheck, gradient: 'from-emerald-500 to-teal-600', lightBg: 'bg-gradient-to-br from-emerald-50 to-teal-50' },
    { key: 'inactive', label: 'Inactive', value: employees.filter(e => e.status === 'inactive').length, icon: FiUserX, gradient: 'from-rose-500 to-pink-600', lightBg: 'bg-gradient-to-br from-rose-50 to-pink-50' },
    { key: 'depts', label: 'Departments', value: [...new Set(employees.map(e => e.department))].length, icon: FiBriefcase, gradient: 'from-blue-500 to-indigo-600', lightBg: 'bg-gradient-to-br from-blue-50 to-indigo-50' },
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
    <div className={`space-y-8 ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4"
      >
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 shadow-lg shadow-violet-500/25">
            <FiUsers className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
              Employee Master Data
            </h2>
            <p className={`text-sm mt-0.5 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              Manage employee information
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium border-2 transition-colors ${isDarkMode ? 'border-slate-700 hover:bg-slate-800' : 'border-slate-200 hover:bg-slate-50'}`}
          >
            <FiDownload className="w-4 h-4" />
            Export
          </motion.button>
          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-xl font-medium shadow-lg shadow-violet-500/25"
          >
            <FiPlus className="w-4 h-4" />
            Add Employee
          </motion.button>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, index) => (
          <motion.div 
            key={stat.key}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            onMouseEnter={() => setHoveredCard(stat.key)}
            onMouseLeave={() => setHoveredCard(null)}
            className={`relative overflow-hidden rounded-2xl p-5 transition-all duration-300 cursor-pointer ${
              isDarkMode ? 'bg-slate-800/80 border border-slate-700/50' : `${stat.lightBg} border border-white/50 hover:shadow-xl`
            } ${hoveredCard === stat.key ? 'scale-[1.02]' : ''}`}
          >
            <div className="absolute top-0 right-0 w-20 h-20 opacity-10">
              <svg viewBox="0 0 100 100" className="w-full h-full">
                <circle cx="70" cy="30" r="40" fill="currentColor" />
              </svg>
            </div>
            <div className="relative flex items-center gap-4">
              <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.gradient} shadow-lg`}>
                <stat.icon className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className={`text-sm font-medium ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>{stat.label}</p>
                <p className={`text-3xl font-bold bg-gradient-to-r ${stat.gradient} bg-clip-text text-transparent`}>{stat.value}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Filters */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="flex flex-col sm:flex-row gap-3"
      >
        <div className="relative flex-1">
          <FiSearch className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`} />
          <input
            type="text"
            placeholder="Search by name, ID or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`w-full rounded-xl border-2 px-4 py-3 pl-12 transition-all focus:ring-2 focus:ring-violet-500/50 ${
              isDarkMode ? 'bg-slate-800/80 border-slate-700 text-white' : 'bg-white border-slate-200'
            }`}
          />
        </div>
        <div className="relative">
          <select
            value={filterDept}
            onChange={(e) => setFilterDept(e.target.value)}
            className={`appearance-none rounded-xl border-2 px-4 py-3 pr-10 font-medium cursor-pointer ${
              isDarkMode ? 'bg-slate-800/80 border-slate-700 text-white' : 'bg-white border-slate-200'
            }`}
          >
            <option value="all">All Departments</option>
            {departments.map(dept => (
              <option key={dept} value={dept}>{dept}</option>
            ))}
          </select>
          <FiChevronDown className={`absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 pointer-events-none ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`} />
        </div>
      </motion.div>

      {/* Table */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className={`rounded-2xl border-2 overflow-hidden shadow-xl ${
          isDarkMode ? 'bg-slate-800/50 border-slate-700/50' : 'bg-white border-slate-200/50'
        }`}
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className={`${isDarkMode ? 'bg-slate-800' : 'bg-gradient-to-r from-slate-50 to-slate-100'}`}>
                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">Employee</th>
                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">Contact</th>
                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">Department</th>
                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">Designation</th>
                <th className="px-6 py-4 text-center text-xs font-bold uppercase tracking-wider text-slate-500">Status</th>
                <th className="px-6 py-4 text-center text-xs font-bold uppercase tracking-wider text-slate-500">Actions</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${isDarkMode ? 'divide-slate-700/50' : 'divide-slate-100'}`}>
              <AnimatePresence>
                {filteredData.map((emp, index) => (
                  <motion.tr 
                    key={emp.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ delay: index * 0.05 }}
                    className={`group transition-colors ${isDarkMode ? 'hover:bg-slate-700/30' : 'hover:bg-violet-50/50'}`}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {emp.photo ? (
                          <motion.div whileHover={{ scale: 1.1 }} className="relative">
                            <img 
                              src={emp.photo} 
                              alt={emp.name}
                              className="w-11 h-11 rounded-xl object-cover shadow-lg ring-2 ring-white dark:ring-slate-700"
                              onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
                            />
                            <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${getAvatarColor(emp.name)} items-center justify-center text-white font-bold text-sm shadow-lg hidden`}>
                              {emp.avatar}
                            </div>
                          </motion.div>
                        ) : (
                          <motion.div 
                            whileHover={{ scale: 1.1 }}
                            className={`w-11 h-11 rounded-xl bg-gradient-to-br ${getAvatarColor(emp.name)} flex items-center justify-center text-white font-bold text-sm shadow-lg`}
                          >
                            {emp.avatar}
                          </motion.div>
                        )}
                        <div>
                          <p className="font-semibold">{emp.name}</p>
                          <p className={`text-xs font-medium ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>{emp.empId}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <p className={`text-sm flex items-center gap-1.5 ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                          <FiMail className="w-3.5 h-3.5" /> {emp.email}
                        </p>
                        <p className={`text-sm flex items-center gap-1.5 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                          <FiPhone className="w-3.5 h-3.5" /> {emp.phone}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1.5 rounded-lg text-xs font-bold ${isDarkMode ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-100 text-blue-700'}`}>
                        {emp.department}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm">{emp.designation}</td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold ${
                        emp.status === 'active' 
                          ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400' 
                          : 'bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${emp.status === 'active' ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
                        {emp.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => setSelectedEmployee(emp)}
                          className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors"
                        >
                          <FiEye className="w-4 h-4" />
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          className="p-2 rounded-lg bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400 hover:bg-violet-200 dark:hover:bg-violet-900/50 transition-colors"
                        >
                          <FiEdit2 className="w-4 h-4" />
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          className="p-2 rounded-lg bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 hover:bg-rose-200 dark:hover:bg-rose-900/50 transition-colors"
                        >
                          <FiTrash2 className="w-4 h-4" />
                        </motion.button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
        
        <div className={`px-6 py-4 border-t ${isDarkMode ? 'border-slate-700/50 bg-slate-800/50' : 'border-slate-100 bg-slate-50/50'}`}>
          <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
            Showing <span className="font-semibold">{filteredData.length}</span> of <span className="font-semibold">{employees.length}</span> employees
          </p>
        </div>
      </motion.div>

      {/* View Employee Modal */}
      <AnimatePresence>
        {selectedEmployee && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setSelectedEmployee(null)}
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className={`w-full max-w-lg rounded-3xl shadow-2xl ${isDarkMode ? 'bg-slate-800' : 'bg-white'}`}
            >
              <div className={`h-2 bg-gradient-to-r ${getAvatarColor(selectedEmployee.name)} rounded-t-3xl`}></div>
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold">Employee Details</h3>
                  <button onClick={() => setSelectedEmployee(null)} className={`p-2 rounded-xl transition-colors ${isDarkMode ? 'hover:bg-slate-700' : 'hover:bg-slate-100'}`}>
                    <FiX className="w-5 h-5" />
                  </button>
                </div>
                
                <div className="flex items-center gap-4 mb-6">
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${getAvatarColor(selectedEmployee.name)} flex items-center justify-center text-white font-bold text-xl shadow-lg`}>
                    {selectedEmployee.avatar}
                  </div>
                  <div>
                    <p className="font-bold text-xl">{selectedEmployee.name}</p>
                    <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>{selectedEmployee.empId}</p>
                  </div>
                </div>

                <div className={`grid grid-cols-2 gap-4 p-4 rounded-2xl ${isDarkMode ? 'bg-slate-700/50' : 'bg-slate-50'}`}>
                  <div><p className={`text-xs font-medium mb-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Email</p><p className="font-semibold text-sm">{selectedEmployee.email}</p></div>
                  <div><p className={`text-xs font-medium mb-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Phone</p><p className="font-semibold text-sm">{selectedEmployee.phone}</p></div>
                  <div><p className={`text-xs font-medium mb-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Department</p><p className="font-semibold text-sm">{selectedEmployee.department}</p></div>
                  <div><p className={`text-xs font-medium mb-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Designation</p><p className="font-semibold text-sm">{selectedEmployee.designation}</p></div>
                  <div><p className={`text-xs font-medium mb-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Joining Date</p><p className="font-semibold text-sm">{new Date(selectedEmployee.joiningDate).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}</p></div>
                  <div><p className={`text-xs font-medium mb-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Reporting To</p><p className="font-semibold text-sm">{selectedEmployee.reportingTo}</p></div>
                  <div><p className={`text-xs font-medium mb-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Status</p><p className={`font-semibold text-sm ${selectedEmployee.status === 'active' ? 'text-emerald-500' : 'text-rose-500'}`}>{selectedEmployee.status}</p></div>
                  <div><p className={`text-xs font-medium mb-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Salary</p><p className="font-semibold text-sm">₹{selectedEmployee.salary.toLocaleString()}</p></div>
                </div>

                <motion.button 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setSelectedEmployee(null)} 
                  className="w-full mt-6 px-4 py-3 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-xl font-medium shadow-lg shadow-violet-500/25"
                >
                  Close
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
