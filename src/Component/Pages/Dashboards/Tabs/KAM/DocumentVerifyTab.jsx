

import { useState, useEffect } from 'react';
import { FiFileText, FiCheck, FiX, FiClock, FiUpload, FiDownload, FiEye, FiSearch, FiAlertTriangle, FiChevronDown, FiShield, FiUser, FiArrowLeft, FiCalendar, FiTarget } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';

const DocumentVerifyTab = ({ isDarkMode, selectedClient }) => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [view, setView] = useState('list');
  const [selectedDoc, setSelectedDoc] = useState(null);

  useEffect(() => {
    const mockData = [
      { id: 1, empId: 'EMP001', name: 'Rahul Sharma', docType: 'Aadhaar Card', fileName: 'aadhaar_rahul.pdf', uploadedOn: '2026-03-10', status: 'verified', verifiedBy: 'Priya Singh', verifiedOn: '2026-03-11' },
      { id: 2, empId: 'EMP001', name: 'Rahul Sharma', docType: 'PAN Card', fileName: 'pan_rahul.pdf', uploadedOn: '2026-03-10', status: 'verified', verifiedBy: 'Priya Singh', verifiedOn: '2026-03-11' },
      { id: 3, empId: 'EMP002', name: 'Priya Singh', docType: 'Educational Certificate', fileName: 'degree_priya.pdf', uploadedOn: '2026-03-12', status: 'pending', verifiedBy: null, verifiedOn: null },
      { id: 4, empId: 'EMP003', name: 'Amit Kumar', docType: 'Experience Letter', fileName: 'exp_amit.pdf', uploadedOn: '2026-03-14', status: 'rejected', verifiedBy: 'Sneha Patel', verifiedOn: '2026-03-15', remarks: 'Document clarity issues' },
      { id: 5, empId: 'EMP004', name: 'Sneha Patel', docType: 'Bank Statement', fileName: 'bank_sneha.pdf', uploadedOn: '2026-03-15', status: 'pending', verifiedBy: null, verifiedOn: null },
      { id: 6, empId: 'EMP005', name: 'Vikram Rao', docType: 'Address Proof', fileName: 'address_vikram.pdf', uploadedOn: '2026-03-15', status: 'verified', verifiedBy: 'Priya Singh', verifiedOn: '2026-03-16' },
    ];
    setTimeout(() => {
      setDocuments(mockData);
      setLoading(false);
    }, 500);
  }, [selectedClient]);

  const getAvatarGradient = (name) => {
    const gradients = ['from-[#3FA9F5]', 'from-[#1E88E5]', 'from-[#0D47A1]'];
    return gradients[name.charCodeAt(0) % gradients.length];
  };

  const statCards = [
    { key: 'total', label: 'Global Archives', value: documents.length, icon: FiFileText, gradient: 'from-[#3FA9F5] via-[#1E88E5] to-[#0D47A1]' },
    { key: 'verified', label: 'Verified Assets', value: documents.filter(d => d.status === 'verified').length, icon: FiCheck, gradient: 'from-[#81C784] via-[#66BB6A] to-[#43A047]' },
    { key: 'pending', label: 'Pending Audit', value: documents.filter(d => d.status === 'pending').length, icon: FiClock, gradient: 'from-[#FFB300] to-[#F57C00]' },
    { key: 'rejected', label: 'Rejected Files', value: documents.filter(d => d.status === 'rejected').length, icon: FiX, gradient: 'from-[#f43f5e] to-[#881337]' },
  ];

  const handleVerify = (id, action) => {
    setDocuments(prev => prev.map(doc =>
      doc.id === id ? { ...doc, status: action, verifiedBy: 'Security Lead', verifiedOn: new Date().toISOString().split('T')[0] } : doc
    ));
    setView('list');
  };

  const filteredData = documents.filter(doc => {
    const matchesSearch = doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.empId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.docType.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || doc.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="space-y-6 text-left">
        <div className={`h-8 w-64 rounded-lg animate-pulse ${isDarkMode ? 'bg-slate-700' : 'bg-slate-200'}`}></div>
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
            {/* Professional Header */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-12">
              <div className="flex items-center gap-4 text-left">
                <div className="p-4 rounded-2xl bg-gradient-to-br from-[#3FA9F5] via-[#1E88E5] to-[#0D47A1] shadow-xl shadow-blue-500/20">
                  <FiShield className="w-8 h-8 text-white" />
                </div>
                <div className="flex flex-col">
                  <h2 className="text-3xl lg:text-4xl font-black text-[#1E88E5] tracking-tight mb-1 font-[Outfit]">
                    Document Verification
                  </h2>
                  <div className="flex items-center gap-2 text-slate-600 font-bold font-[Outfit]">
                    <FiCalendar className="w-4 h-4" />
                    <span className="text-sm">
                      Audit Cycle • {documents.length} Files Protected
                    </span>
                  </div>
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setView('upload')}
                className="flex items-center justify-center gap-2.5 px-6 py-3 bg-gradient-to-r from-[#3FA9F5] via-[#1E88E5] to-[#0D47A1] text-white rounded-[1.2rem] font-black shadow-xl shadow-blue-500/30 transition-all text-[11px] font-[Outfit] uppercase tracking-widest"
              >
                <FiUpload className="w-4 h-4" />
                Upload New Asset
              </motion.button>
            </div>

            {/* Premium Stat Cards */}
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
                    <div className={`p-2.5 rounded-xl bg-gradient-to-br ${stat.gradient} w-fit shadow-lg shadow-blue-500/10`}>
                      <stat.icon className="w-4 h-4 text-white" />
                    </div>
                    <p className={`text-[13px] font-black ${isDarkMode ? 'text-slate-400' : 'text-slate-800'}`}>
                      {stat.label}
                    </p>
                    <div className="flex items-baseline gap-2">
                      <span className={`text-4xl font-black ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                        {stat.value}
                      </span>
                    </div>
                    <div className={`w-full h-1.5 rounded-full overflow-hidden ${isDarkMode ? 'bg-slate-800' : 'bg-white/50'}`}>
                      <motion.div initial={{ width: 0 }} animate={{ width: '70%' }} className={`h-full bg-gradient-to-r ${stat.gradient}`} />
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Filter Hub */}
            <div className="flex flex-col sm:flex-row gap-6 font-[Outfit]">
              <div className="relative flex-1 group">
                <FiSearch className={`absolute left-5 top-1/2 -translate-y-1/2 w-6 h-6 transition-colors group-focus-within:text-blue-500 ${isDarkMode ? 'text-slate-600' : 'text-slate-400'}`} />
                <input
                  type="text"
                  placeholder="Search Global Archives..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={`w-full rounded-[1.5rem] border-2 px-6 py-4 pl-14 transition-all focus:ring-4 focus:ring-blue-500/10 outline-none font-bold text-[11px] ${isDarkMode ? 'bg-slate-900/60 border-slate-800 text-white' : 'bg-white border-slate-100 shadow-sm'}`}
                />
              </div>
              <div className="relative group">
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className={`appearance-none rounded-[1.5rem] border-2 px-10 py-4 pr-16 font-black text-[11px] cursor-pointer transition-all outline-none ${isDarkMode ? 'bg-slate-900/60 border-slate-800 text-white' : 'bg-white border-slate-100 shadow-sm'}`}
                >
                  <option value="all">Global Status</option>
                  <option value="pending">Pending Review</option>
                  <option value="verified">Verified Clear</option>
                  <option value="rejected">Audit Failed</option>
                </select>
                <FiChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 w-5 h-5 pointer-events-none text-slate-400" />
              </div>
            </div>

            {/* Document Collection */}
            <div className="flex flex-col gap-4 pb-12 max-w-6xl mx-auto font-[Outfit]">
              {filteredData.map((doc, index) => (
                <motion.div
                  key={doc.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => { setSelectedDoc(doc); setView('verify'); }}
                  className={`group relative overflow-hidden rounded-[2rem] border transition-all duration-300 cursor-pointer ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-[#f8fbff] border-white shadow-sm hover:shadow-md hover:border-blue-500/20'}`}
                >
                  <div className="p-4 px-8 flex items-center justify-between gap-6">
                    <div className="flex items-center gap-6 min-w-[250px] text-left">
                      <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br from-[#3FA9F5] via-[#1E88E5] to-[#0D47A1] flex items-center justify-center text-white font-black text-xl shadow-lg`}>
                        <FiFileText className="w-6 h-6" />
                      </div>
                      <div className="flex flex-col text-left">
                        <h3 className="font-extrabold text-lg text-slate-900 dark:text-white leading-tight">{doc.name}</h3>
                        <p className="text-[10px] font-bold text-slate-400 tracking-widest">{doc.docType}</p>
                      </div>
                    </div>

                    <div className="hidden md:block text-left min-w-[200px]">
                      <p className="text-[12px] font-black text-slate-900 dark:text-slate-200">{doc.fileName}</p>
                      <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400">Uploaded • {new Date(doc.uploadedOn).toLocaleDateString('en-IN')}</p>
                    </div>

                    <div className={`px-5 py-2.5 rounded-full border text-[11px] font-black flex items-center gap-2.5 ${doc.status === 'verified' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                      doc.status === 'rejected' ? 'bg-rose-50 text-rose-600 border-rose-100' : 'bg-amber-50 text-amber-600 border-amber-100'
                      }`}>
                      {doc.status.charAt(0).toUpperCase() + doc.status.slice(1)}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {view === 'upload' && (
          <motion.div
            key="upload"
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
                Return To Collection
              </motion.button>
              <div className="flex items-center gap-6 text-left">
                <div className="p-6 rounded-[2.5rem] bg-gradient-to-br from-[#3FA9F5] via-[#1E88E5] to-[#0D47A1] shadow-2xl shadow-blue-500/20">
                  <FiUpload className="w-12 h-12 text-white" />
                </div>
                <div className="flex flex-col">
                  <h2 className="text-5xl font-black text-slate-900 dark:text-white tracking-tight">Archive New Registry</h2>
                  <p className="text-sm font-bold text-[#1E88E5] mt-3 ml-1">Asset Verification Gateway</p>
                </div>
              </div>
            </div>

            <div className={`p-16 rounded-[4rem] border-2 ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100 shadow-2xl shadow-blue-500/10'}`}>
              <form className="space-y-12 text-left">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                  <div className="space-y-4">
                    <label className="block text-[11px] font-black text-[#1E88E5] ml-2">Member Identification</label>
                    <select className={`w-full rounded-2xl border-2 px-6 py-5 transition-all outline-none font-bold text-base ${isDarkMode ? 'bg-slate-800/50 border-slate-700 text-white' : 'bg-slate-50 border-slate-100'}`}>
                      <option>Rahul Sharma - EMP001</option>
                      <option>Priya Singh - EMP002</option>
                    </select>
                  </div>
                  <div className="space-y-4">
                    <label className="block text-[11px] font-black text-[#1E88E5] ml-2">Register Asset Type</label>
                    <select className={`w-full rounded-2xl border-2 px-6 py-5 transition-all outline-none font-bold text-base ${isDarkMode ? 'bg-slate-800/50 border-slate-700 text-white' : 'bg-slate-50 border-slate-100'}`}>
                      <option>Aadhaar Card Authentication</option>
                      <option>PAN Certification</option>
                      <option>Educational Verification</option>
                    </select>
                  </div>
                  <div className="col-span-1 md:col-span-2 space-y-4">
                    <label className="block text-[11px] font-black text-[#1E88E5] ml-2">Digital Asset Upload</label>
                    <div className="h-48 border-4 border-dashed rounded-[3rem] border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center gap-4 bg-slate-50/50 dark:bg-slate-800/20">
                      <FiUpload className="w-10 h-10 text-slate-300" />
                      <p className="text-sm font-black text-slate-400">Drag Secure Files Or Click To Browse</p>
                    </div>
                  </div>
                </div>
                <motion.button
                  whileHover={{ scale: 1.02, y: -5 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setView('list')}
                  className="px-16 py-6 bg-gradient-to-r from-[#3FA9F5] via-[#1E88E5] to-[#0D47A1] text-white rounded-[2rem] font-black text-[13px] shadow-2xl shadow-blue-500/40"
                >
                  Authenticate & Archive
                </motion.button>
              </form>
            </div>
          </motion.div>
        )}

        {view === 'verify' && selectedDoc && (
          <motion.div
            key="verify"
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
                Back To Collection
              </motion.button>
              <div className="flex items-center gap-8 text-left">
                <div className="w-32 h-32 rounded-[2.5rem] bg-gradient-to-br from-[#3FA9F5] via-[#1E88E5] to-[#0D47A1] flex items-center justify-center text-white font-black text-5xl shadow-2xl shadow-blue-500/30">
                  <FiShield className="w-16 h-16" />
                </div>
                <div className="flex flex-col">
                  <h2 className="text-5xl font-black text-slate-900 dark:text-white tracking-tight">{selectedDoc.name}</h2>
                  <div className="flex items-center gap-3 mt-4">
                    <span className="px-4 py-1.5 bg-blue-50 dark:bg-blue-900/30 text-[#1E88E5] rounded-full text-[11px] font-black tracking-widest uppercase">{selectedDoc.empId}</span>
                    <span className={`px-4 py-1.5 rounded-full text-[11px] font-black uppercase tracking-widest ${selectedDoc.status === 'verified' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>Audit {selectedDoc.status}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 text-left">
              <div className={`col-span-1 lg:col-span-2 p-12 rounded-[3.5rem] border ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100 shadow-2xl shadow-blue-500/5'}`}>
                <div className="space-y-8">
                  <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-6">
                    <div>
                      <h3 className="text-xl font-black text-slate-900 dark:text-white">Document Authenticity Review</h3>
                      <p className="text-sm font-bold text-slate-400 mt-1">{selectedDoc.docType} • {selectedDoc.fileName}</p>
                    </div>
                    <motion.button className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 text-[#1E88E5]">
                      <FiDownload className="w-6 h-6" />
                    </motion.button>
                  </div>
                  <div className="aspect-[16/9] rounded-[2.5rem] bg-slate-900 flex items-center justify-center border-4 border-slate-800 group relative overflow-hidden">
                    <div className="absolute inset-0 bg-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <p className="text-blue-500 font-black tracking-widest uppercase text-xs z-10">Secure Preview Authenticated</p>
                  </div>
                </div>
              </div>

              <div className="space-y-8">
                <div className={`p-10 rounded-[3rem] border ${isDarkMode ? 'bg-slate-900 border-slate-800 shadow-2xl' : 'bg-gradient-to-br from-[#1E88E5] to-[#0D47A1] border-blue-500 shadow-2xl shadow-blue-500/20'}`}>
                  <div className="space-y-6 text-white text-left">
                    <p className="text-[11px] font-black uppercase tracking-[0.2em] opacity-60">Verification Matrix</p>
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-black">Ready For Audit</span>
                      <FiShield className="w-8 h-8 text-blue-300" />
                    </div>
                    <div className="space-y-4">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleVerify(selectedDoc.id, 'verified')}
                        className="w-full py-4 bg-emerald-500 rounded-2xl font-black text-[12px] uppercase shadow-lg flex items-center justify-center gap-3"
                      >
                        <FiCheck className="w-5 h-5" /> Approve Asset
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleVerify(selectedDoc.id, 'rejected')}
                        className="w-full py-4 bg-rose-500 rounded-2xl font-black text-[12px] uppercase shadow-lg flex items-center justify-center gap-3"
                      >
                        <FiX className="w-5 h-5" /> Reject Asset
                      </motion.button>
                    </div>
                  </div>
                </div>
                <div className={`p-8 rounded-[2.5rem] border ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                  <label className="block text-[11px] font-black text-[#1E88E5] mb-3 text-left px-2">Auditor Remarks</label>
                  <textarea placeholder="Enter internal verification logs..." className={`w-full h-32 rounded-2xl border-2 px-4 py-3 outline-none font-bold text-sm ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'}`} />
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DocumentVerifyTab;