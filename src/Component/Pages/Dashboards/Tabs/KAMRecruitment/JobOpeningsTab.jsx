import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiBriefcase,
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiSearch,
  FiFilter,
  FiMapPin,
  FiDollarSign,
  FiUsers,
  FiClock,
  FiX,
  FiChevronDown,
  FiTrendingUp,
  FiCheckCircle,
  FiAlertCircle,
  FiRefreshCw,
  FiExternalLink,
  FiCalendar,
} from 'react-icons/fi';

/* ── Status Badge ── */
const StatusBadge = ({ status }) => {
  const config = {
    Open: { gradient: 'from-emerald-500 to-teal-600', shadow: 'shadow-emerald-500/25' },
    'In Progress': { gradient: 'from-blue-500 to-indigo-600', shadow: 'shadow-blue-500/25' },
    'On Hold': { gradient: 'from-amber-500 to-orange-600', shadow: 'shadow-amber-500/25' },
    Closed: { gradient: 'from-slate-500 to-slate-600', shadow: 'shadow-slate-500/25' },
    Urgent: { gradient: 'from-red-500 to-rose-600', shadow: 'shadow-red-500/25' },
  };
  const { gradient, shadow } = config[status] || config.Open;
  return (
    <motion.span
      whileHover={{ scale: 1.05 }}
      className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold text-white bg-gradient-to-r ${gradient} shadow-lg ${shadow}`}
    >
      <span className="w-2 h-2 rounded-full bg-white/80 animate-pulse"></span>
      {status}
    </motion.span>
  );
};

/* ── Priority Badge ── */
const PriorityBadge = ({ priority }) => {
  const config = {
    High: 'from-red-500 to-rose-600 text-white',
    Medium: 'from-amber-500 to-orange-600 text-white',
    Low: 'from-slate-400 to-slate-500 text-white',
  };
  return (
    <span className={`text-xs font-bold px-3 py-1 rounded-full bg-gradient-to-r ${config[priority] || config.Medium}`}>
      {priority}
    </span>
  );
};

/* ══════════════════════════════════════════════════════ */
const JobOpeningsTab = ({ isDarkMode }) => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [editingJob, setEditingJob] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);

  // Mock data
  useEffect(() => {
    const mockJobs = [
      { id: 1, title: 'Senior Software Engineer', client: 'TechCorp India', clientLogo: 'TC', location: 'Bangalore', type: 'Full-time', salary: '25-35 LPA', openings: 5, filled: 2, status: 'Open', priority: 'High', postedDate: '2026-03-10', deadline: '2026-04-10', skills: ['React', 'Node.js', 'MongoDB'] },
      { id: 2, title: 'Product Manager', client: 'StartupXYZ', clientLogo: 'SX', location: 'Mumbai', type: 'Full-time', salary: '30-40 LPA', openings: 2, filled: 0, status: 'Urgent', priority: 'High', postedDate: '2026-03-15', deadline: '2026-03-30', skills: ['Agile', 'Roadmap', 'Analytics'] },
      { id: 3, title: 'UI/UX Designer', client: 'DesignHub', clientLogo: 'DH', location: 'Remote', type: 'Contract', salary: '15-20 LPA', openings: 3, filled: 1, status: 'In Progress', priority: 'Medium', postedDate: '2026-03-12', deadline: '2026-04-15', skills: ['Figma', 'Adobe XD', 'User Research'] },
      { id: 4, title: 'Data Analyst', client: 'DataDriven Co', clientLogo: 'DD', location: 'Hyderabad', type: 'Full-time', salary: '12-18 LPA', openings: 4, filled: 4, status: 'Closed', priority: 'Low', postedDate: '2026-02-20', deadline: '2026-03-20', skills: ['SQL', 'Python', 'Tableau'] },
      { id: 5, title: 'DevOps Engineer', client: 'CloudScale', clientLogo: 'CS', location: 'Pune', type: 'Full-time', salary: '20-28 LPA', openings: 2, filled: 0, status: 'On Hold', priority: 'Medium', postedDate: '2026-03-05', deadline: '2026-04-05', skills: ['AWS', 'Docker', 'Kubernetes'] },
    ];
    setTimeout(() => {
      setJobs(mockJobs);
      setLoading(false);
    }, 600);
  }, []);

  // Stats
  const stats = {
    total: jobs.length,
    open: jobs.filter(j => j.status === 'Open' || j.status === 'Urgent').length,
    inProgress: jobs.filter(j => j.status === 'In Progress').length,
    closed: jobs.filter(j => j.status === 'Closed').length,
    totalOpenings: jobs.reduce((sum, j) => sum + j.openings, 0),
    totalFilled: jobs.reduce((sum, j) => sum + j.filled, 0),
  };

  const statCards = [
    { label: 'Total Positions', value: stats.total, icon: FiBriefcase, gradient: 'from-violet-500 to-purple-600', shadow: 'shadow-violet-500/25' },
    { label: 'Active Openings', value: stats.open, icon: FiCheckCircle, gradient: 'from-emerald-500 to-teal-600', shadow: 'shadow-emerald-500/25' },
    { label: 'In Progress', value: stats.inProgress, icon: FiClock, gradient: 'from-blue-500 to-indigo-600', shadow: 'shadow-blue-500/25' },
    { label: 'Positions Filled', value: `${stats.totalFilled}/${stats.totalOpenings}`, icon: FiUsers, gradient: 'from-amber-500 to-orange-600', shadow: 'shadow-amber-500/25' },
  ];

  // Filter jobs
  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || job.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const getAvatarGradient = (name) => {
    const gradients = [
      'linear-gradient(135deg, #8b5cf6, #7c3aed)',
      'linear-gradient(135deg, #3b82f6, #06b6d4)',
      'linear-gradient(135deg, #10b981, #0d9488)',
      'linear-gradient(135deg, #f43f5e, #ec4899)',
      'linear-gradient(135deg, #f59e0b, #ea580c)'
    ];
    return gradients[(name || '').charCodeAt(0) % gradients.length];
  };

  // Skeleton loader
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div className="space-y-2">
            <div className={`h-8 w-64 rounded-lg animate-pulse ${isDarkMode ? 'bg-slate-700' : 'bg-slate-200'}`}></div>
            <div className={`h-4 w-40 rounded-lg animate-pulse ${isDarkMode ? 'bg-slate-700' : 'bg-slate-200'}`}></div>
          </div>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className={`h-28 rounded-2xl animate-pulse ${isDarkMode ? 'bg-slate-800' : 'bg-slate-200'}`}></div>
          ))}
        </div>
        <div className="grid gap-4">
          {[1, 2, 3].map(i => (
            <div key={i} className={`h-40 rounded-2xl animate-pulse ${isDarkMode ? 'bg-slate-800' : 'bg-slate-200'}`}></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center md:justify-between gap-4"
      >
        <div className="flex items-center gap-4">
          <div className="p-4 rounded-xl" style={{ background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)', boxShadow: '0 10px 15px -3px rgba(139, 92, 246, 0.25)' }}>
            <FiBriefcase className="w-7 h-7" style={{ color: 'white' }} />
          </div>
          <div>
            <h2 className="text-3xl font-bold" style={{ background: 'linear-gradient(90deg, #7c3aed, #4f46e5)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Job Openings & Requisitions
            </h2>
            <p className={`text-base mt-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              Manage client job requirements and track positions
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <motion.button
            whileHover={{ scale: 1.02, rotate: 180 }}
            whileTap={{ scale: 0.98 }}
            className={`p-3 rounded-xl border-2 transition-colors ${isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-400 hover:border-violet-500' : 'bg-white border-slate-200 text-slate-500 hover:border-violet-300'}`}
          >
            <FiRefreshCw className="w-6 h-6" />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-6 py-3 text-base font-semibold text-white rounded-xl transition-shadow"
            style={{ background: 'linear-gradient(90deg, #7c3aed, #7c3aed)', boxShadow: '0 10px 15px -3px rgba(139, 92, 246, 0.25)' }}
          >
            <FiPlus className="w-5 h-5" />
            New Position
          </motion.button>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Total Positions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          whileHover={{ scale: 1.02, y: -2 }}
          className={`relative overflow-hidden rounded-2xl p-6 cursor-pointer ${isDarkMode ? 'bg-slate-800/80 border border-slate-700/50' : 'bg-white border border-slate-200/50 shadow-lg'}`}
        >
          <div className="absolute -right-4 -top-4 w-24 h-24 opacity-10">
            <div className="w-full h-full rounded-full" style={{ backgroundColor: '#8b5cf6' }}></div>
          </div>
          <div className="relative flex items-start justify-between">
            <div>
              <p className={`text-sm font-semibold uppercase tracking-wider ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Total Positions</p>
              <p className="text-4xl font-extrabold mt-2" style={{ color: '#7c3aed' }}>{stats.total}</p>
            </div>
            <div className="p-4 rounded-xl" style={{ backgroundColor: '#8b5cf6', boxShadow: '0 10px 15px -3px rgba(139, 92, 246, 0.3)' }}>
              <FiBriefcase className="w-6 h-6" style={{ color: 'white' }} />
            </div>
          </div>
        </motion.div>

        {/* Active Openings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          whileHover={{ scale: 1.02, y: -2 }}
          className={`relative overflow-hidden rounded-2xl p-6 cursor-pointer ${isDarkMode ? 'bg-slate-800/80 border border-slate-700/50' : 'bg-white border border-slate-200/50 shadow-lg'}`}
        >
          <div className="absolute -right-4 -top-4 w-24 h-24 opacity-10">
            <div className="w-full h-full rounded-full" style={{ backgroundColor: '#10b981' }}></div>
          </div>
          <div className="relative flex items-start justify-between">
            <div>
              <p className={`text-sm font-semibold uppercase tracking-wider ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Active Openings</p>
              <p className="text-4xl font-extrabold mt-2" style={{ color: '#059669' }}>{stats.open}</p>
            </div>
            <div className="p-4 rounded-xl" style={{ backgroundColor: '#10b981', boxShadow: '0 10px 15px -3px rgba(16, 185, 129, 0.3)' }}>
              <FiCheckCircle className="w-6 h-6" style={{ color: 'white' }} />
            </div>
          </div>
        </motion.div>

        {/* In Progress */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          whileHover={{ scale: 1.02, y: -2 }}
          className={`relative overflow-hidden rounded-2xl p-6 cursor-pointer ${isDarkMode ? 'bg-slate-800/80 border border-slate-700/50' : 'bg-white border border-slate-200/50 shadow-lg'}`}
        >
          <div className="absolute -right-4 -top-4 w-24 h-24 opacity-10">
            <div className="w-full h-full rounded-full" style={{ backgroundColor: '#3b82f6' }}></div>
          </div>
          <div className="relative flex items-start justify-between">
            <div>
              <p className={`text-sm font-semibold uppercase tracking-wider ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>In Progress</p>
              <p className="text-4xl font-extrabold mt-2" style={{ color: '#2563eb' }}>{stats.inProgress}</p>
            </div>
            <div className="p-4 rounded-xl" style={{ backgroundColor: '#3b82f6', boxShadow: '0 10px 15px -3px rgba(59, 130, 246, 0.3)' }}>
              <FiClock className="w-6 h-6" style={{ color: 'white' }} />
            </div>
          </div>
        </motion.div>

        {/* Positions Filled */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          whileHover={{ scale: 1.02, y: -2 }}
          className={`relative overflow-hidden rounded-2xl p-6 cursor-pointer ${isDarkMode ? 'bg-slate-800/80 border border-slate-700/50' : 'bg-white border border-slate-200/50 shadow-lg'}`}
        >
          <div className="absolute -right-4 -top-4 w-24 h-24 opacity-10">
            <div className="w-full h-full rounded-full" style={{ backgroundColor: '#f59e0b' }}></div>
          </div>
          <div className="relative flex items-start justify-between">
            <div>
              <p className={`text-sm font-semibold uppercase tracking-wider ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Positions Filled</p>
              <p className="text-4xl font-extrabold mt-2" style={{ color: '#d97706' }}>{stats.totalFilled}/{stats.totalOpenings}</p>
            </div>
            <div className="p-4 rounded-xl" style={{ backgroundColor: '#f59e0b', boxShadow: '0 10px 15px -3px rgba(245, 158, 11, 0.3)' }}>
              <FiUsers className="w-6 h-6" style={{ color: 'white' }} />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Search & Filter */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="flex flex-col md:flex-row gap-4"
      >
        <div className="relative flex-1">
          <FiSearch className={`absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`} />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by title, client, or location..."
            className={`w-full rounded-xl border-2 py-3.5 pl-14 pr-5 text-base transition-all focus:ring-2 focus:ring-violet-500/50 ${isDarkMode ? 'bg-slate-800/80 border-slate-700 text-white placeholder:text-slate-500' : 'bg-white border-slate-200 placeholder:text-slate-400'}`}
          />
        </div>
        <div className="relative">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className={`appearance-none rounded-xl border-2 px-5 py-3.5 pr-12 text-base font-medium cursor-pointer ${isDarkMode ? 'bg-slate-800/80 border-slate-700 text-white' : 'bg-white border-slate-200'}`}
          >
            <option value="all">All Status</option>
            <option value="Open">Open</option>
            <option value="Urgent">Urgent</option>
            <option value="In Progress">In Progress</option>
            <option value="On Hold">On Hold</option>
            <option value="Closed">Closed</option>
          </select>
          <FiChevronDown className={`absolute right-4 top-1/2 -translate-y-1/2 w-6 h-6 pointer-events-none ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`} />
        </div>
      </motion.div>

      {/* Job Cards */}
      {filteredJobs.length === 0 ? (
        <div className={`text-center py-16 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
          <FiAlertCircle size={48} className="mx-auto mb-4 opacity-30" />
          <p className="font-semibold text-lg">No job openings found</p>
          <p className="text-base mt-2">Try adjusting your search or filters</p>
        </div>
      ) : (
        <div className="grid gap-5">
          <AnimatePresence>
            {filteredJobs.map((job, idx) => (
              <motion.div
                key={job.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ delay: idx * 0.05 }}
                whileHover={{ scale: 1.01, y: -2 }}
                className={`rounded-2xl border-2 p-6 transition-shadow ${isDarkMode ? 'bg-slate-800/80 border-slate-700/50 hover:border-slate-600' : 'bg-white border-slate-200/50 hover:shadow-xl hover:border-violet-200'}`}
              >
                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-5">
                  {/* Left: Job Info */}
                  <div className="flex items-start gap-5 flex-1">
                    <div className="h-16 w-16 rounded-xl flex items-center justify-center text-white text-xl font-bold shadow-lg flex-shrink-0" style={{ background: getAvatarGradient(job.client) }}>
                      {job.clientLogo}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 flex-wrap">
                        <h3 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>{job.title}</h3>
                        <StatusBadge status={job.status} />
                        <PriorityBadge priority={job.priority} />
                      </div>
                      <p className={`text-base mt-1.5 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>{job.client}</p>
                      <div className="flex flex-wrap items-center gap-4 mt-4">
                        <span className={`flex items-center gap-2 text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                          <FiMapPin className="w-4 h-4" /> {job.location}
                        </span>
                        <span className={`flex items-center gap-2 text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                          <FiDollarSign className="w-4 h-4" /> {job.salary}
                        </span>
                        <span className={`flex items-center gap-2 text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                          <FiClock className="w-4 h-4" /> {job.type}
                        </span>
                        <span className={`flex items-center gap-2 text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                          <FiCalendar className="w-4 h-4" /> Deadline: {new Date(job.deadline).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                        </span>
                      </div>
                      {/* Skills */}
                      <div className="flex flex-wrap gap-2 mt-4">
                        {job.skills.map(skill => (
                          <span key={skill} className={`text-xs font-semibold px-3 py-1.5 rounded-full ${isDarkMode ? 'bg-violet-900/40 text-violet-300 border border-violet-700/50' : 'bg-gradient-to-r from-violet-50 to-purple-50 text-violet-600 border border-violet-100'}`}>
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Right: Progress & Actions */}
                  <div className="flex flex-col items-end gap-4">
                    {/* Progress */}
                    <div className="text-right">
                      <p className={`text-sm font-semibold ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Positions Filled</p>
                      <p className={`text-3xl font-bold bg-gradient-to-r from-emerald-500 to-teal-600 bg-clip-text text-transparent`}>
                        {job.filled}/{job.openings}
                      </p>
                      <div className={`w-36 h-2 rounded-full mt-2 overflow-hidden ${isDarkMode ? 'bg-slate-700' : 'bg-slate-200'}`}>
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${(job.filled / job.openings) * 100}%` }}
                          transition={{ duration: 0.8, delay: idx * 0.1 }}
                          className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-600"
                        />
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => { setEditingJob(job); setShowModal(true); }}
                        className={`p-2.5 rounded-lg transition-colors ${isDarkMode ? 'hover:bg-slate-700 text-slate-400' : 'hover:bg-violet-100 text-slate-500 hover:text-violet-600'}`}
                        title="View Details"
                      >
                        <FiExternalLink className="w-5 h-5" />
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => { setEditingJob(job); setShowModal(true); }}
                        className={`p-2.5 rounded-lg transition-colors ${isDarkMode ? 'hover:bg-slate-700 text-slate-400' : 'hover:bg-violet-100 text-slate-500 hover:text-violet-600'}`}
                        title="Edit"
                      >
                        <FiEdit2 className="w-5 h-5" />
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setConfirmDelete(job.id)}
                        className={`p-2.5 rounded-lg transition-colors ${isDarkMode ? 'hover:bg-red-900/40 text-slate-400 hover:text-red-400' : 'hover:bg-red-100 text-slate-500 hover:text-red-600'}`}
                        title="Delete"
                      >
                        <FiTrash2 className="w-5 h-5" />
                      </motion.button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Add/Edit Job Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => { setShowModal(false); setEditingJob(null); }} />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }} 
              animate={{ opacity: 1, scale: 1, y: 0 }} 
              exit={{ opacity: 0, scale: 0.95, y: 20 }} 
              className={`relative rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto ${isDarkMode ? 'bg-slate-800 border border-slate-700' : 'bg-white'}`}
            >
              {/* Modal Header */}
              <div className={`sticky top-0 flex items-center justify-between p-4 border-b ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
                <h3 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
                  {editingJob ? 'Edit Job Position' : 'Add New Position'}
                </h3>
                <button 
                  onClick={() => { setShowModal(false); setEditingJob(null); }}
                  className={`p-2 rounded-lg transition-colors ${isDarkMode ? 'hover:bg-slate-700 text-slate-400' : 'hover:bg-slate-100 text-slate-500'}`}
                >
                  <FiX className="w-5 h-5" />
                </button>
              </div>
              
              {/* Modal Body */}
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>Job Title *</label>
                    <input 
                      type="text" 
                      defaultValue={editingJob?.title || ''} 
                      placeholder="e.g. Senior Software Engineer"
                      className={`w-full rounded-xl border-2 px-4 py-2.5 text-sm transition-all focus:ring-2 focus:ring-violet-500/50 ${isDarkMode ? 'bg-slate-700 border-slate-600 text-white placeholder:text-slate-500' : 'bg-white border-slate-200 placeholder:text-slate-400'}`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>Client/Company *</label>
                    <input 
                      type="text" 
                      defaultValue={editingJob?.client || ''} 
                      placeholder="e.g. TechCorp India"
                      className={`w-full rounded-xl border-2 px-4 py-2.5 text-sm transition-all focus:ring-2 focus:ring-violet-500/50 ${isDarkMode ? 'bg-slate-700 border-slate-600 text-white placeholder:text-slate-500' : 'bg-white border-slate-200 placeholder:text-slate-400'}`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>Location</label>
                    <input 
                      type="text" 
                      defaultValue={editingJob?.location || ''} 
                      placeholder="e.g. Bangalore"
                      className={`w-full rounded-xl border-2 px-4 py-2.5 text-sm transition-all focus:ring-2 focus:ring-violet-500/50 ${isDarkMode ? 'bg-slate-700 border-slate-600 text-white placeholder:text-slate-500' : 'bg-white border-slate-200 placeholder:text-slate-400'}`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>Employment Type</label>
                    <select 
                      defaultValue={editingJob?.type || 'Full-time'}
                      className={`w-full rounded-xl border-2 px-4 py-2.5 text-sm transition-all focus:ring-2 focus:ring-violet-500/50 ${isDarkMode ? 'bg-slate-700 border-slate-600 text-white' : 'bg-white border-slate-200'}`}
                    >
                      <option value="Full-time">Full-time</option>
                      <option value="Part-time">Part-time</option>
                      <option value="Contract">Contract</option>
                      <option value="Remote">Remote</option>
                    </select>
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>Salary Range</label>
                    <input 
                      type="text" 
                      defaultValue={editingJob?.salary || ''} 
                      placeholder="e.g. 15-25 LPA"
                      className={`w-full rounded-xl border-2 px-4 py-2.5 text-sm transition-all focus:ring-2 focus:ring-violet-500/50 ${isDarkMode ? 'bg-slate-700 border-slate-600 text-white placeholder:text-slate-500' : 'bg-white border-slate-200 placeholder:text-slate-400'}`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>No. of Openings</label>
                    <input 
                      type="number" 
                      defaultValue={editingJob?.openings || 1} 
                      min="1"
                      className={`w-full rounded-xl border-2 px-4 py-2.5 text-sm transition-all focus:ring-2 focus:ring-violet-500/50 ${isDarkMode ? 'bg-slate-700 border-slate-600 text-white' : 'bg-white border-slate-200'}`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>Status</label>
                    <select 
                      defaultValue={editingJob?.status || 'Open'}
                      className={`w-full rounded-xl border-2 px-4 py-2.5 text-sm transition-all focus:ring-2 focus:ring-violet-500/50 ${isDarkMode ? 'bg-slate-700 border-slate-600 text-white' : 'bg-white border-slate-200'}`}
                    >
                      <option value="Open">Open</option>
                      <option value="Urgent">Urgent</option>
                      <option value="In Progress">In Progress</option>
                      <option value="On Hold">On Hold</option>
                      <option value="Closed">Closed</option>
                    </select>
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>Priority</label>
                    <select 
                      defaultValue={editingJob?.priority || 'Medium'}
                      className={`w-full rounded-xl border-2 px-4 py-2.5 text-sm transition-all focus:ring-2 focus:ring-violet-500/50 ${isDarkMode ? 'bg-slate-700 border-slate-600 text-white' : 'bg-white border-slate-200'}`}
                    >
                      <option value="High">High</option>
                      <option value="Medium">Medium</option>
                      <option value="Low">Low</option>
                    </select>
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>Deadline</label>
                    <input 
                      type="date" 
                      defaultValue={editingJob?.deadline || ''} 
                      className={`w-full rounded-xl border-2 px-4 py-2.5 text-sm transition-all focus:ring-2 focus:ring-violet-500/50 ${isDarkMode ? 'bg-slate-700 border-slate-600 text-white' : 'bg-white border-slate-200'}`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>Skills (comma separated)</label>
                    <input 
                      type="text" 
                      defaultValue={editingJob?.skills?.join(', ') || ''} 
                      placeholder="e.g. React, Node.js, MongoDB"
                      className={`w-full rounded-xl border-2 px-4 py-2.5 text-sm transition-all focus:ring-2 focus:ring-violet-500/50 ${isDarkMode ? 'bg-slate-700 border-slate-600 text-white placeholder:text-slate-500' : 'bg-white border-slate-200 placeholder:text-slate-400'}`}
                    />
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className={`sticky bottom-0 flex items-center justify-end gap-3 p-4 border-t ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
                <motion.button 
                  whileHover={{ scale: 1.02 }} 
                  whileTap={{ scale: 0.98 }} 
                  onClick={() => { setShowModal(false); setEditingJob(null); }}
                  className={`px-5 py-2.5 text-sm font-semibold rounded-xl ${isDarkMode ? 'bg-slate-700 text-slate-300' : 'bg-slate-100 text-slate-600'}`}
                >
                  Cancel
                </motion.button>
                <motion.button 
                  whileHover={{ scale: 1.02 }} 
                  whileTap={{ scale: 0.98 }}
                  onClick={() => { 
                    // TODO: Save job logic here
                    setShowModal(false); 
                    setEditingJob(null); 
                  }}
                  className="px-5 py-2.5 text-sm font-semibold bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-xl shadow-lg shadow-violet-500/25"
                >
                  {editingJob ? 'Update Position' : 'Create Position'}
                </motion.button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {confirmDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setConfirmDelete(null)} />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className={`relative rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center ${isDarkMode ? 'bg-slate-800 border border-slate-700' : 'bg-white'}`}>
              <div className="mx-auto w-16 h-16 rounded-full bg-gradient-to-br from-red-100 to-rose-100 flex items-center justify-center mb-4">
                <FiTrash2 className="w-8 h-8 text-red-500" />
              </div>
              <h3 className={`text-lg font-bold mb-1 ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>Delete Position?</h3>
              <p className={`text-sm mb-5 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>This will permanently remove the job opening and all associated candidates.</p>
              <div className="flex items-center justify-center gap-3">
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => setConfirmDelete(null)} className={`px-5 py-2.5 text-sm font-semibold rounded-xl ${isDarkMode ? 'bg-slate-700 text-slate-300' : 'bg-slate-100 text-slate-600'}`}>
                  Cancel
                </motion.button>
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => { setJobs(jobs.filter(j => j.id !== confirmDelete)); setConfirmDelete(null); }} className="px-5 py-2.5 text-sm font-semibold bg-gradient-to-r from-red-500 to-rose-600 text-white rounded-xl shadow-lg shadow-red-500/25">
                  Delete
                </motion.button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default JobOpeningsTab;
