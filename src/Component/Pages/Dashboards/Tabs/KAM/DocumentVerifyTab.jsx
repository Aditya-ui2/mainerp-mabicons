import { useState, useEffect } from 'react';
import { FiFileText, FiCheck, FiX, FiClock, FiUpload, FiDownload, FiEye, FiSearch, FiAlertTriangle, FiChevronDown, FiShield, FiUser } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';

const DocumentVerifyTab = ({ isDarkMode, selectedClient }) => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [hoveredCard, setHoveredCard] = useState(null);

  useEffect(() => {
    const mockData = [
      { id: 1, empId: 'EMP001', name: 'Rahul Sharma', docType: 'Aadhaar Card', fileName: 'aadhaar_rahul.pdf', uploadedOn: '2026-03-10', status: 'verified', verifiedBy: 'Priya Singh', verifiedOn: '2026-03-11' },
      { id: 2, empId: 'EMP001', name: 'Rahul Sharma', docType: 'PAN Card', fileName: 'pan_rahul.pdf', uploadedOn: '2026-03-10', status: 'verified', verifiedBy: 'Priya Singh', verifiedOn: '2026-03-11' },
      { id: 3, empId: 'EMP002', name: 'Priya Singh', docType: 'Educational Certificate', fileName: 'degree_priya.pdf', uploadedOn: '2026-03-12', status: 'pending', verifiedBy: null, verifiedOn: null },
      { id: 4, empId: 'EMP003', name: 'Amit Kumar', docType: 'Experience Letter', fileName: 'exp_amit.pdf', uploadedOn: '2026-03-14', status: 'rejected', verifiedBy: 'Sneha Patel', verifiedOn: '2026-03-15', remarks: 'Document not clear' },
      { id: 5, empId: 'EMP004', name: 'Sneha Patel', docType: 'Bank Statement', fileName: 'bank_sneha.pdf', uploadedOn: '2026-03-15', status: 'pending', verifiedBy: null, verifiedOn: null },
      { id: 6, empId: 'EMP005', name: 'Vikram Rao', docType: 'Address Proof', fileName: 'address_vikram.pdf', uploadedOn: '2026-03-15', status: 'verified', verifiedBy: 'Priya Singh', verifiedOn: '2026-03-16' },
    ];
    setTimeout(() => {
      setDocuments(mockData);
      setLoading(false);
    }, 500);
  }, [selectedClient]);

  const getAvatarGradient = (name) => {
    const gradients = [
      'from-violet-500 to-purple-600', 'from-blue-500 to-indigo-600', 'from-emerald-500 to-teal-600',
      'from-rose-500 to-pink-600', 'from-amber-500 to-orange-600', 'from-cyan-500 to-blue-600',
    ];
    return gradients[name.charCodeAt(0) % gradients.length];
  };

  const getStatusConfig = (status) => {
    const configs = {
      'verified': { bg: 'bg-emerald-100 dark:bg-emerald-900/30', text: 'text-emerald-700 dark:text-emerald-400', gradient: 'from-emerald-500 to-teal-600', icon: FiCheck },
      'pending': { bg: 'bg-amber-100 dark:bg-amber-900/30', text: 'text-amber-700 dark:text-amber-400', gradient: 'from-amber-500 to-orange-600', icon: FiClock },
      'rejected': { bg: 'bg-rose-100 dark:bg-rose-900/30', text: 'text-rose-700 dark:text-rose-400', gradient: 'from-rose-500 to-pink-600', icon: FiX },
    };
    return configs[status];
  };

  const statCards = [
    { key: 'total', label: 'Total Documents', value: documents.length, icon: FiFileText, gradient: 'from-violet-500 to-purple-600', lightBg: 'bg-gradient-to-br from-violet-50 to-purple-50' },
    { key: 'verified', label: 'Verified', value: documents.filter(d => d.status === 'verified').length, icon: FiCheck, gradient: 'from-emerald-500 to-teal-600', lightBg: 'bg-gradient-to-br from-emerald-50 to-teal-50' },
    { key: 'pending', label: 'Pending', value: documents.filter(d => d.status === 'pending').length, icon: FiClock, gradient: 'from-amber-500 to-orange-600', lightBg: 'bg-gradient-to-br from-amber-50 to-orange-50' },
    { key: 'rejected', label: 'Rejected', value: documents.filter(d => d.status === 'rejected').length, icon: FiX, gradient: 'from-rose-500 to-pink-600', lightBg: 'bg-gradient-to-br from-rose-50 to-pink-50' },
  ];

  const handleVerify = (id, action) => {
    setDocuments(prev => prev.map(doc => 
      doc.id === id ? { ...doc, status: action, verifiedBy: 'Current User', verifiedOn: new Date().toISOString().split('T')[0] } : doc
    ));
  };

  const filteredData = documents.filter(doc => {
    const matchesSearch = doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.empId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.docType.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || doc.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const docTypes = ['Aadhaar Card', 'PAN Card', 'Passport', 'Driving License', 'Educational Certificate', 'Experience Letter', 'Bank Statement', 'Address Proof', 'Photo'];

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div className="space-y-2">
            <div className={`h-8 w-64 rounded-lg animate-pulse ${isDarkMode ? 'bg-slate-700' : 'bg-slate-200'}`}></div>
            <div className={`h-4 w-48 rounded-lg animate-pulse ${isDarkMode ? 'bg-slate-700' : 'bg-slate-200'}`}></div>
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
          <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg shadow-blue-500/25">
            <FiShield className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Document Verification
            </h2>
            <p className={`text-sm mt-0.5 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              Verify and manage employee documents
            </p>
          </div>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setShowUploadModal(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-medium shadow-lg shadow-blue-500/25"
        >
          <FiUpload className="w-4 h-4" />
          Upload Document
        </motion.button>
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
            placeholder="Search by name, ID or document type..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`w-full rounded-xl border-2 px-4 py-3 pl-12 transition-all focus:ring-2 focus:ring-blue-500/50 ${
              isDarkMode ? 'bg-slate-800/80 border-slate-700 text-white' : 'bg-white border-slate-200'
            }`}
          />
        </div>
        <div className="relative">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className={`appearance-none rounded-xl border-2 px-4 py-3 pr-10 font-medium cursor-pointer ${
              isDarkMode ? 'bg-slate-800/80 border-slate-700 text-white' : 'bg-white border-slate-200'
            }`}
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="verified">Verified</option>
            <option value="rejected">Rejected</option>
          </select>
          <FiChevronDown className={`absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 pointer-events-none ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`} />
        </div>
      </motion.div>

      {/* Table */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className={`rounded-2xl border-2 overflow-hidden ${isDarkMode ? 'bg-slate-800/80 border-slate-700/50' : 'bg-white border-slate-200/50'}`}
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className={isDarkMode ? 'bg-slate-700/50' : 'bg-gradient-to-r from-slate-50 to-slate-100'}>
                <th className="px-5 py-4 text-left text-sm font-bold">Employee</th>
                <th className="px-5 py-4 text-left text-sm font-bold">Document Type</th>
                <th className="px-5 py-4 text-left text-sm font-bold">File Name</th>
                <th className="px-5 py-4 text-left text-sm font-bold">Uploaded On</th>
                <th className="px-5 py-4 text-left text-sm font-bold">Status</th>
                <th className="px-5 py-4 text-left text-sm font-bold">Actions</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${isDarkMode ? 'divide-slate-700' : 'divide-slate-100'}`}>
              <AnimatePresence>
                {filteredData.map((doc, index) => {
                  const statusConfig = getStatusConfig(doc.status);
                  const StatusIcon = statusConfig.icon;
                  return (
                    <motion.tr 
                      key={doc.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ delay: index * 0.05 }}
                      className={`transition-colors ${isDarkMode ? 'hover:bg-slate-700/50' : 'hover:bg-slate-50'}`}
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${getAvatarGradient(doc.name)} flex items-center justify-center text-white font-bold text-sm shadow-lg`}>
                            {doc.name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-semibold">{doc.name}</p>
                            <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>{doc.empId}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-sm font-medium">{doc.docType}</td>
                      <td className="px-5 py-4 text-sm">
                        <span className="text-blue-600 dark:text-blue-400 font-medium">{doc.fileName}</span>
                      </td>
                      <td className="px-5 py-4 text-sm">{new Date(doc.uploadedOn).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                      <td className="px-5 py-4">
                        <span className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold w-fit ${statusConfig.bg} ${statusConfig.text}`}>
                          <StatusIcon className="w-3.5 h-3.5" />
                          {doc.status}
                        </span>
                        {doc.remarks && <p className="text-xs text-rose-500 mt-1 font-medium">{doc.remarks}</p>}
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <motion.button 
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            className="p-2 rounded-xl bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 transition-colors" 
                            title="View"
                          >
                            <FiEye className="w-4 h-4" />
                          </motion.button>
                          <motion.button 
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            className="p-2 rounded-xl bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400 transition-colors" 
                            title="Download"
                          >
                            <FiDownload className="w-4 h-4" />
                          </motion.button>
                          {doc.status === 'pending' && (
                            <>
                              <motion.button 
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => handleVerify(doc.id, 'verified')}
                                className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 transition-colors" 
                                title="Approve"
                              >
                                <FiCheck className="w-4 h-4" />
                              </motion.button>
                              <motion.button 
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => handleVerify(doc.id, 'rejected')}
                                className="p-2 rounded-xl bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 transition-colors" 
                                title="Reject"
                              >
                                <FiX className="w-4 h-4" />
                              </motion.button>
                            </>
                          )}
                        </div>
                      </td>
                    </motion.tr>
                  );
                })}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Upload Modal */}
      <AnimatePresence>
        {showUploadModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowUploadModal(false)}
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className={`w-full max-w-lg rounded-3xl shadow-2xl ${isDarkMode ? 'bg-slate-800' : 'bg-white'}`}
            >
              <div className="h-2 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-t-3xl"></div>
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold flex items-center gap-2">
                    <FiUpload className="w-5 h-5 text-blue-500" />
                    Upload Document
                  </h3>
                  <button onClick={() => setShowUploadModal(false)} className={`p-2 rounded-xl transition-colors ${isDarkMode ? 'hover:bg-slate-700' : 'hover:bg-slate-100'}`}>
                    <FiX className="w-5 h-5" />
                  </button>
                </div>
                <form className="space-y-5">
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>Employee</label>
                    <select className={`w-full rounded-xl border-2 px-4 py-3 ${isDarkMode ? 'bg-slate-700/50 border-slate-600' : 'bg-white border-slate-200'}`}>
                      <option>Select Employee</option>
                      <option>EMP001 - Rahul Sharma</option>
                      <option>EMP002 - Priya Singh</option>
                      <option>EMP003 - Amit Kumar</option>
                    </select>
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>Document Type</label>
                    <select className={`w-full rounded-xl border-2 px-4 py-3 ${isDarkMode ? 'bg-slate-700/50 border-slate-600' : 'bg-white border-slate-200'}`}>
                      {docTypes.map(type => <option key={type}>{type}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>Upload File</label>
                    <div className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all hover:border-blue-400 ${isDarkMode ? 'border-slate-600 bg-slate-700/30' : 'border-slate-300 bg-slate-50'}`}>
                      <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 w-fit mx-auto mb-3 shadow-lg">
                        <FiUpload className="w-6 h-6 text-white" />
                      </div>
                      <p className={`text-sm font-medium ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>Drag & drop or click to upload</p>
                      <p className={`text-xs mt-1 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>PDF, JPG, PNG up to 5MB</p>
                      <input type="file" className="hidden" />
                    </div>
                  </div>
                  <div className="flex gap-3 pt-2">
                    <motion.button 
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="button" 
                      onClick={() => setShowUploadModal(false)} 
                      className={`flex-1 px-4 py-3 rounded-xl font-medium border-2 ${isDarkMode ? 'border-slate-600 hover:bg-slate-700' : 'border-slate-200 hover:bg-slate-50'}`}
                    >
                      Cancel
                    </motion.button>
                    <motion.button 
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="submit" 
                      className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-medium shadow-lg shadow-blue-500/25"
                    >
                      Upload
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

export default DocumentVerifyTab;
