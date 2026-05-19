import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FiBook,
  FiPlus,
  FiEdit2,
  FiEdit3,
  FiTrash,
  FiTrash2,
  FiDownload,
  FiCalendar,
  FiAlertCircle,
  FiCheckCircle,
  FiSearch,
  FiChevronDown,
  FiChevronRight,
  FiX,
  FiFileText,
  FiLayers,
  FiArrowLeft,
  FiUser,
  FiCheck,
  FiDatabase,
  FiShield,
  FiActivity,
  FiInfo,
  FiUpload,
  FiPaperclip,
  FiFile,
  FiEye
} from 'react-icons/fi';

const InfoItem = ({ label, value, subValue, fullWidth = false, isEditing, onChange, type = "text" }) => (
  <div className={`space-y-1.5 ${fullWidth ? 'col-span-full' : ''}`}>
    <label className="text-[10px] font-bold text-[#9B9BAD] uppercase tracking-[2px]">{label}</label>
    <div className="bg-white px-4 py-3 rounded-xl border border-[#F4F3EF]">
      {isEditing ? (
        <input
          type={type}
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          className="w-full text-sm font-bold text-[#1A1A2E] bg-transparent border-none focus:outline-none"
        />
      ) : (
        <>
          <p className="text-sm font-bold text-[#1A1A2E]">{value || 'N/A'}</p>
          {subValue && <p className="text-[10px] font-medium text-[#6B6B7E] mt-0.5">{subValue}</p>}
        </>
      )}
    </div>
  </div>
);

const PolicyTab = ({ isDarkMode, selectedClient, notificationBell }) => {
  const [policies, setPolicies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedIds, setSelectedIds] = useState([]);

  // Modals & Panels State
  const [selectedPolicyDetail, setSelectedPolicyDetail] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [policyToDelete, setPolicyToDelete] = useState(null);

  // Editing state inside Detail view
  const [isEditingDetail, setIsEditingDetail] = useState(false);
  const [editablePolicy, setEditablePolicy] = useState(null);

  // Form State for New Policy
  const [newPolicy, setNewPolicy] = useState({
    title: '',
    category: 'HR Management',
    description: '',
    version: '1.0',
    effectiveFrom: new Date().toISOString().split('T')[0],
    status: 'active',
    updatedBy: 'HR Manager',
    fileName: '',
    fileSize: ''
  });

  // Document Upload States
  const [selectedFile, setSelectedFile] = useState(null);
  const [editSelectedFile, setEditSelectedFile] = useState(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isEditDragOver, setIsEditDragOver] = useState(false);
  const [previewFile, setPreviewFile] = useState(null);

  const categories = [
    'HR Management',
    'Leave Management',
    'Attendance Protocol',
    'Code Of Conduct',
    'IT Security',
    'Travel & Expense',
    'Health & Safety',
    'Compliance Hub'
  ];

  // Drag & Drop handlers for Create Form
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setSelectedFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
  };

  // Drag & Drop handlers for Edit Form
  const handleEditDragOver = (e) => {
    e.preventDefault();
    setIsEditDragOver(true);
  };

  const handleEditDragLeave = () => {
    setIsEditDragOver(false);
  };

  const handleEditDrop = (e) => {
    e.preventDefault();
    setIsEditDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setEditSelectedFile(e.dataTransfer.files[0]);
    }
  };

  const handleEditFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setEditSelectedFile(e.target.files[0]);
    }
  };

  const handleEditRemoveFile = () => {
    setEditSelectedFile(null);
    setEditablePolicy(prev => ({ ...prev, fileName: '', fileSize: '' }));
  };

  useEffect(() => {
    const mockData = [
      { id: 1, title: 'Leave Policy 2026', category: 'Leave Management', description: 'Comprehensive leave policy covering all types of leaves including sick, casual, earned, and special leaves.', version: '2.0', effectiveFrom: '2026-01-01', status: 'active', lastUpdated: '2025-12-15', updatedBy: 'HR Manager', fileName: 'Leave_Policy_2026.pdf', fileSize: '1.2 MB' },
      { id: 2, title: 'Remote Work Policy', category: 'HR Management', description: 'Guidelines for work from home arrangements, eligibility, and productivity expectations.', version: '1.5', effectiveFrom: '2025-06-01', status: 'active', lastUpdated: '2025-05-20', updatedBy: 'HR Director', fileName: 'Remote_Work_Guidelines.pdf', fileSize: '850 KB' },
      { id: 3, title: 'Code of Conduct', category: 'Code Of Conduct', description: 'Professional behavior standards, ethics guidelines, and workplace conduct expectations.', version: '3.0', effectiveFrom: '2024-01-01', status: 'active', lastUpdated: '2024-01-01', updatedBy: 'Legal Team', fileName: 'Code_of_Conduct_v3.pdf', fileSize: '2.4 MB' },
      { id: 4, title: 'Data Security Policy', category: 'IT Security', description: 'Information security guidelines, data handling procedures, and compliance requirements.', version: '2.1', effectiveFrom: '2025-09-01', status: 'active', lastUpdated: '2025-08-25', updatedBy: 'IT Security', fileName: 'Data_Security_Standards.pdf', fileSize: '1.8 MB' },
      { id: 5, title: 'Travel & Expense Policy', category: 'Travel & Expense', description: 'Business travel guidelines, expense claims, and reimbursement procedures.', version: '1.8', effectiveFrom: '2025-04-01', status: 'under-review', lastUpdated: '2026-02-10', updatedBy: 'Finance Team', fileName: 'Travel_Reimbursement_Policy.pdf', fileSize: '950 KB' },
      { id: 6, title: 'Attendance Policy', category: 'Attendance Protocol', description: 'Working hours, punctuality expectations, overtime rules, and attendance tracking.', version: '2.2', effectiveFrom: '2026-01-01', status: 'active', lastUpdated: '2025-12-20', updatedBy: 'HR Manager', fileName: 'Attendance_Rules_2026.pdf', fileSize: '1.1 MB' },
    ];

    setLoading(true);
    const timer = setTimeout(() => {
      setPolicies(mockData);
      setLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, [selectedClient]);

  // Filtering Logic
  const filteredPolicies = policies.filter(p => {
    const matchesSearch =
      (p.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.description || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.updatedBy || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'ALL' || p.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleToggleStatus = (policyId) => {
    setPolicies(prev => prev.map(p => {
      if (p.id === policyId) {
        const nextStatus = p.status === 'active' ? 'under-review' : 'active';
        return { ...p, status: nextStatus };
      }
      return p;
    }));
  };

  const handleCreatePolicy = (e) => {
    e.preventDefault();
    if (!newPolicy.title || !newPolicy.description) return;

    let fileName = '';
    let fileSize = '';
    if (selectedFile) {
      fileName = selectedFile.name;
      const sizeInMB = selectedFile.size / (1024 * 1024);
      fileSize = sizeInMB >= 1 
        ? `${sizeInMB.toFixed(1)} MB` 
        : `${(selectedFile.size / 1024).toFixed(0)} KB`;
    }

    const created = {
      ...newPolicy,
      fileName,
      fileSize,
      id: Date.now(),
      lastUpdated: new Date().toISOString().split('T')[0]
    };

    setPolicies(prev => [created, ...prev]);
    setIsAddModalOpen(false);
    setSelectedFile(null);

    // Reset Form
    setNewPolicy({
      title: '',
      category: 'HR Management',
      description: '',
      version: '1.0',
      effectiveFrom: new Date().toISOString().split('T')[0],
      status: 'active',
      updatedBy: 'HR Manager',
      fileName: '',
      fileSize: ''
    });
  };

  const handleDeleteConfirm = () => {
    if (policyToDelete) {
      setPolicies(prev => prev.filter(p => p.id !== policyToDelete.id));
      setSelectedIds(prev => prev.filter(id => id !== policyToDelete.id));
      if (selectedPolicyDetail && selectedPolicyDetail.id === policyToDelete.id) {
        setSelectedPolicyDetail(null);
      }
      setIsDeleteModalOpen(false);
      setPolicyToDelete(null);
    }
  };

  const handleSaveDetailEdits = () => {
    if (editablePolicy) {
      let fileName = editablePolicy.fileName || '';
      let fileSize = editablePolicy.fileSize || '';
      if (editSelectedFile) {
        fileName = editSelectedFile.name;
        const sizeInMB = editSelectedFile.size / (1024 * 1024);
        fileSize = sizeInMB >= 1 
          ? `${sizeInMB.toFixed(1)} MB` 
          : `${(editSelectedFile.size / 1024).toFixed(0)} KB`;
      }
      
      const updatedPolicy = {
        ...editablePolicy,
        fileName,
        fileSize,
        lastUpdated: new Date().toISOString().split('T')[0]
      };

      setPolicies(prev => prev.map(p => p.id === editablePolicy.id ? updatedPolicy : p));
      setSelectedPolicyDetail(updatedPolicy);
      setIsEditingDetail(false);
      setEditSelectedFile(null);
    }
  };

  const startEditingDetail = () => {
    setEditablePolicy({ ...selectedPolicyDetail });
    setIsEditingDetail(true);
  };

  return (
    <>
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8 text-left font-[Outfit]">

        {/* Header */}
        <div className="flex items-center justify-between mb-8 text-left">
          <div className="flex flex-col text-left">
            <h1 className="text-3xl font-bold text-[#1A1A2E] tracking-tight" style={{ fontFamily: "'Syne', sans-serif" }}>
              Policy Management
            </h1>
          </div>
          <div className="flex items-center gap-3">
            {notificationBell}
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="w-full sm:w-auto flex items-center justify-center px-6 py-3 rounded-2xl bg-[#1B4DA0] hover:bg-[#153D80] text-white transition-all duration-300 shadow-xl shadow-blue-500/20 active:scale-95 group"
            >
              <FiPlus className="mr-2 text-lg" />
              <span className="font-bold uppercase tracking-widest text-[11px]">Add Policy</span>
            </button>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="bg-white rounded-[24px] p-2 border border-[#F4F3EF] shadow-sm flex items-center gap-3 flex-wrap mb-8">
          <div className="relative flex-1 group min-w-[200px]">
            <FiSearch className="absolute left-5 top-1/2 -translate-y-1/2 text-[#9B9BAD] transition-colors" size={18} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search policies by title or description..."
              className="w-full bg-[#F4F3EF] border-none rounded-2xl py-3.5 pl-14 pr-5 text-sm font-medium focus:ring-2 focus:ring-[#F4F3EF] outline-none transition-all placeholder:text-[#9B9BAD]"
            />
          </div>

          <div className="relative group">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-[#F4F3EF] text-[11px] font-black uppercase tracking-widest text-[#1A1A2E] rounded-xl pl-4 pr-10 py-3 outline-none border-0 cursor-pointer appearance-none min-w-[180px] hover:bg-[#EEF2FB] transition-all"
            >
              <option value="ALL">GLOBAL RESOURCE HUB</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat.toUpperCase()}</option>
              ))}
            </select>
            <FiChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#1B4DA0] opacity-50 group-hover:opacity-100 transition-all pointer-events-none" />
          </div>
        </div>

        {/* Data Table */}
        <div className="bg-white rounded-[24px] border border-[#F4F3EF] overflow-hidden shadow-sm">
          <div className="overflow-x-auto min-h-[400px] flex flex-col">
            {loading ? (
              <div className="flex-1 flex flex-col items-center justify-center py-20">
                <div className="w-12 h-12 border-4 border-[#1B4DA0] border-t-transparent rounded-full animate-spin mb-4" />
                <p className="text-[#6B6B7E] font-medium">Loading directives...</p>
              </div>
            ) : filteredPolicies.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center py-20 text-center px-8">
                <div className="w-20 h-20 bg-[#F4F3EF] rounded-full flex items-center justify-center mb-6 text-[#1B4DA0]">
                  <FiDatabase size={32} />
                </div>
                <h3 className="text-xl font-bold text-[#1A1A2E] mb-2">No directives found</h3>
                <p className="text-[#6B6B7E] max-w-xs mx-auto mb-8">
                  {searchQuery ? `No policies match your search "${searchQuery}"` : "We couldn't find any policies registered in the database."}
                </p>
                <button
                  onClick={() => { setSearchQuery(''); setSelectedCategory('ALL'); }}
                  className="px-6 py-3 bg-[#1B4DA0] text-white rounded-xl font-bold text-sm hover:bg-[#153a7a] transition-all shadow-lg"
                >
                  Clear Filters
                </button>
              </div>
            ) : (
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-slate-50/50 border-b border-[#F4F3EF]">
                    <th className="px-6 py-4 text-[11px] font-bold text-[#9B9BAD] uppercase tracking-widest text-left">Directive Identification</th>
                    <th className="px-6 py-4 text-[11px] font-bold text-[#9B9BAD] uppercase tracking-widest text-left">Classification</th>
                    <th className="px-6 py-4 text-[11px] font-bold text-[#9B9BAD] uppercase tracking-widest text-left">Effective From</th>
                    <th className="px-6 py-4 text-[11px] font-bold text-[#9B9BAD] uppercase tracking-widest text-left">Status</th>
                    <th className="px-6 py-4 w-12"></th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPolicies.map((policy) => {
                    const isSelected = selectedIds.includes(policy.id);
                    return (
                      <tr
                        key={policy.id}
                        onClick={() => { setSelectedPolicyDetail(policy); setIsEditingDetail(false); }}
                        className={`hover:bg-[#F8FAFF] transition-all duration-300 group cursor-pointer ${isSelected ? 'bg-blue-50/50' : ''}`}
                      >
                        <td className="px-6 py-6 text-left whitespace-nowrap">
                          <div className="flex flex-col text-left">
                            <span className="text-sm font-bold text-[#1A1A2E] leading-tight">{policy.title}</span>
                          </div>
                        </td>
                        <td className="px-6 py-6 text-left whitespace-nowrap">
                          <span className="px-3 py-1.5 bg-[#EEF2FB] text-[#1B4DA0] rounded-full text-[10px] font-black uppercase tracking-widest border border-[#D0DFFA]">
                            {policy.category}
                          </span>
                        </td>
                        <td className="px-6 py-6 text-left whitespace-nowrap">
                          <span className="text-[12px] font-bold text-[#6B6B7E]">
                            {new Date(policy.effectiveFrom).toLocaleDateString('en-IN')}
                          </span>
                        </td>
                        <td className="px-6 py-6 text-left whitespace-nowrap">
                          <div className="flex items-center">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleToggleStatus(policy.id);
                              }}
                              className={`px-4 py-1.5 rounded-full flex items-center gap-2 border transition-all ${
                                policy.status === 'active'
                                  ? 'bg-emerald-50 text-emerald-600 border-emerald-100 hover:bg-emerald-100'
                                  : 'bg-amber-50 text-amber-600 border-amber-100 hover:bg-amber-100'
                              }`}
                            >
                              <div className={`w-2 h-2 rounded-full ${policy.status === 'active' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                              <span className="text-[10px] font-black uppercase tracking-wider">{policy.status}</span>
                            </button>
                          </div>
                        </td>
                        <td className="px-6 py-6 text-right whitespace-nowrap">
                          <FiChevronRight className="inline-block text-[#9B9BAD] group-hover:text-blue-600 transition-colors" size={18} />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </motion.div>

      {/* Bulk Action Bar */}
      <AnimatePresence>
        {selectedIds.length > 0 && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-10 left-[100px] bg-[#1A1A2E] text-white px-8 py-5 rounded-[28px] shadow-2xl flex items-center gap-10 z-[1000] border border-white/10"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-blue-500 text-white rounded-xl flex items-center justify-center font-black text-sm">
                {selectedIds.length}
              </div>
              <div>
                <p className="text-xs font-black uppercase tracking-widest">Policies Selected</p>
                <button
                  onClick={() => setSelectedIds([])}
                  className="text-[10px] font-bold text-red-400 hover:text-red-300 uppercase tracking-widest mt-0.5"
                >
                  Deselect All
                </button>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setPolicies(prev => prev.filter(p => !selectedIds.includes(p.id)));
                  setSelectedIds([]);
                }}
                className="px-6 py-3.5 bg-red-500 hover:bg-red-600 rounded-2xl text-[10px] font-black uppercase tracking-widest text-white transition-all shadow-lg flex items-center gap-2"
              >
                <FiTrash size={14} /> Delete Selected
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Policy Details Modal */}
      {selectedPolicyDetail && createPortal(
        <AnimatePresence>
          <div className="fixed inset-0 z-[200000]">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-[#1A1A2E]/60 backdrop-blur-xl"
              onClick={() => { setSelectedPolicyDetail(null); setIsEditingDetail(false); }}
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: "spring", damping: 30, stiffness: 200 }}
              className="fixed inset-y-0 right-0 w-full max-w-[698px] bg-white shadow-2xl border-l border-[#F4F3EF] flex flex-col z-[200001] overflow-hidden font-[Outfit]"
            >
              {/* Drawer Header - Sticky Style */}
              <div className="sticky top-0 bg-white/90 backdrop-blur-md border-b border-[#F4F3EF] px-10 py-10 flex items-center justify-between z-20 text-left">
                <div className="flex-1 mr-4">
                  <h2 className="text-2xl font-bold text-[#1A1A2E] font-syne outline-none">
                    {isEditingDetail ? 'Edit Policy Directive' : selectedPolicyDetail.title}
                  </h2>
                  <div className="flex items-center gap-2 mt-1.5 overflow-hidden">
                    <span className="text-[10px] font-bold text-[#1B4DA0] uppercase tracking-[3px] outline-none truncate">
                      {isEditingDetail ? 'Modify reference parameters' : selectedPolicyDetail.category}
                    </span>
                    {!isEditingDetail && (
                      <>
                        <span className="w-1.5 h-1.5 rounded-full bg-[#E8E7E2] flex-shrink-0" />
                        <span className={`text-[10px] font-bold uppercase tracking-[3px] outline-none ${
                          selectedPolicyDetail.status === 'active' ? 'text-emerald-600' : 'text-amber-600'
                        }`}>
                          {selectedPolicyDetail.status}
                        </span>
                      </>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {!isEditingDetail && (
                    <>
                      <button
                        onClick={startEditingDetail}
                        className="w-12 h-12 rounded-xl bg-[#F4F3EF] text-[#6B6B7E] flex items-center justify-center hover:bg-blue-50 hover:text-[#1B4DA0] transition-all border border-[#E8E7E2] hover:border-blue-100 shadow-sm"
                        title="Edit Policy"
                      >
                        <FiEdit2 size={20} />
                      </button>
                      <button
                        onClick={() => {
                          setPolicyToDelete(selectedPolicyDetail);
                          setIsDeleteModalOpen(true);
                        }}
                        className="w-12 h-12 rounded-xl bg-[#F4F3EF] text-[#6B6B7E] flex items-center justify-center hover:bg-red-50 hover:text-red-500 transition-all border border-[#E8E7E2] hover:border-red-100 shadow-sm"
                        title="Delete Policy"
                      >
                        <FiTrash2 size={20} />
                      </button>
                    </>
                  )}
                  <button
                    onClick={() => { setSelectedPolicyDetail(null); setIsEditingDetail(false); }}
                    className="w-12 h-12 rounded-xl bg-[#F4F3EF] text-[#6B6B7E] flex items-center justify-center hover:bg-red-50 hover:text-red-500 transition-all border border-[#E8E7E2] hover:border-red-100 shadow-sm"
                    title="Close"
                  >
                    <FiX size={22} />
                  </button>
                </div>
              </div>

              {/* Drawer Content */}
              <div className="flex-1 overflow-y-auto custom-scrollbar px-10 py-8 space-y-10 text-left">
                
                {/* Big Avatar Branding */}
                <div className="flex flex-col items-center text-center">
                  <div className="w-24 h-24 rounded-[32px] bg-[#F8FAFC] text-[#475569] flex items-center justify-center text-3xl font-extrabold shadow-xl border border-[#F1F5F9] mb-6">
                    {(selectedPolicyDetail.title || 'P').slice(0, 2).toUpperCase()}
                  </div>
                  <div className="space-y-2">
                    <h4 className="text-2xl font-bold text-[#1A1A2E] tracking-tight" style={{ fontFamily: "'Syne', sans-serif" }}>
                      {isEditingDetail ? (
                        <input
                          type="text"
                          value={editablePolicy?.title}
                          onChange={(e) => setEditablePolicy({ ...editablePolicy, title: e.target.value })}
                          className="w-full text-center border-b-2 border-[#1B4DA0] focus:outline-none py-1 font-bold text-2xl bg-transparent"
                        />
                      ) : (
                        selectedPolicyDetail.title
                      )}
                    </h4>
                    <div className="flex items-center justify-center gap-3">
                      <span className="px-4 py-1.5 bg-blue-50 text-[#1B4DA0] rounded-full text-[10px] font-black uppercase tracking-widest border border-blue-100">
                        {isEditingDetail ? (
                          <select
                            value={editablePolicy?.category}
                            onChange={(e) => setEditablePolicy({ ...editablePolicy, category: e.target.value })}
                            className="bg-transparent border-none text-[#1B4DA0] outline-none font-bold"
                          >
                            {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                          </select>
                        ) : (
                          selectedPolicyDetail.category
                        )}
                      </span>
                      <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${selectedPolicyDetail.status === 'active' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                        {selectedPolicyDetail.status}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Information Grid */}
                <div className="bg-[#FAFAF8] rounded-[32px] border border-[#F4F3EF] p-8 space-y-10 shadow-sm">
                  
                  {/* Identity parameters */}
                  <div className="space-y-6">
                    <div className="flex items-center gap-3 border-b border-[#F4F3EF] pb-4">
                      <FiShield className="text-[#1B4DA0]" size={18} />
                      <h5 className="text-[12px] font-black text-[#1A1A2E] uppercase tracking-wider">Directive Identity</h5>
                    </div>
                    <div className="grid grid-cols-2 gap-x-8 gap-y-6">
                      <InfoItem
                        label="Registry Version"
                        value={isEditingDetail ? editablePolicy?.version : `Revision ${selectedPolicyDetail.version}`}
                        isEditing={isEditingDetail}
                        onChange={(val) => setEditablePolicy({ ...editablePolicy, version: val })}
                      />
                      <InfoItem
                        label="Updated By / Auditor"
                        value={isEditingDetail ? editablePolicy?.updatedBy : selectedPolicyDetail.updatedBy}
                        isEditing={isEditingDetail}
                        onChange={(val) => setEditablePolicy({ ...editablePolicy, updatedBy: val })}
                      />
                      <InfoItem
                        label="Effective From"
                        value={isEditingDetail ? editablePolicy?.effectiveFrom : new Date(selectedPolicyDetail.effectiveFrom).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                        isEditing={isEditingDetail}
                        type="date"
                        onChange={(val) => setEditablePolicy({ ...editablePolicy, effectiveFrom: val })}
                      />
                      <InfoItem
                        label="Last Audited"
                        value={selectedPolicyDetail.lastUpdated ? new Date(selectedPolicyDetail.lastUpdated).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) : 'N/A'}
                        isEditing={false}
                      />
                    </div>
                  </div>

                  {/* Operational guidelines */}
                  <div className="space-y-6">
                    <div className="flex items-center gap-3 border-b border-[#F4F3EF] pb-4">
                      <FiFileText className="text-[#1B4DA0]" size={18} />
                      <h5 className="text-[12px] font-black text-[#1A1A2E] uppercase tracking-wider">Guidelines & Scope</h5>
                    </div>
                    <div className="col-span-full">
                      {isEditingDetail ? (
                        <div className="space-y-6">
                          <div className="space-y-2">
                            <label className="text-[10px] font-bold text-[#9B9BAD] uppercase tracking-[2px]">Directive Description</label>
                            <textarea
                              value={editablePolicy?.description}
                              onChange={(e) => setEditablePolicy({ ...editablePolicy, description: e.target.value })}
                              rows={4}
                              className="w-full text-sm font-bold text-[#1A1A2E] bg-white border border-[#F4F3EF] p-4 rounded-xl focus:outline-none"
                            />
                          </div>

                          <div className="space-y-2">
                            <label className="text-[10px] font-bold text-[#9B9BAD] uppercase tracking-[2px]">Attached Document</label>
                            <div
                              onDragOver={handleEditDragOver}
                              onDragLeave={handleEditDragLeave}
                              onDrop={handleEditDrop}
                              className={`border-2 border-dashed rounded-3xl p-5 text-center transition-all duration-300 ${
                                isEditDragOver 
                                  ? 'border-[#1B4DA0] bg-blue-50/30' 
                                  : (editSelectedFile || editablePolicy?.fileName) 
                                    ? 'border-emerald-300 bg-emerald-50/5' 
                                    : 'border-[#F4F3EF] hover:border-[#1B4DA0]/40 bg-white'
                              }`}
                            >
                              {(editSelectedFile || editablePolicy?.fileName) ? (
                                <div className="flex items-center justify-between text-left">
                                  <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-600">
                                      <FiFileText size={20} />
                                    </div>
                                    <div>
                                      <p className="text-xs font-bold text-[#1A1A2E] max-w-[240px] truncate">
                                        {editSelectedFile ? editSelectedFile.name : editablePolicy.fileName}
                                      </p>
                                      <p className="text-[10px] font-bold text-slate-400 mt-0.5">
                                        {editSelectedFile 
                                          ? ((editSelectedFile.size / (1024 * 1024)) >= 1 
                                            ? `${(editSelectedFile.size / (1024 * 1024)).toFixed(1)} MB` 
                                            : `${(editSelectedFile.size / 1024).toFixed(0)} KB`)
                                          : editablePolicy.fileSize}
                                      </p>
                                    </div>
                                  </div>
                                  <button
                                    type="button"
                                    onClick={handleEditRemoveFile}
                                    className="p-2.5 bg-red-50 hover:bg-red-100 rounded-xl text-red-500 transition-all active:scale-95"
                                  >
                                    <FiTrash2 size={14} />
                                  </button>
                                </div>
                              ) : (
                                <label className="cursor-pointer flex flex-col items-center justify-center py-2">
                                  <div className="w-10 h-10 rounded-xl bg-[#F4F3EF] flex items-center justify-center text-[#1B4DA0] mb-2">
                                    <FiUpload size={16} />
                                  </div>
                                  <span className="text-xs font-bold text-[#1A1A2E]">Drag & drop new file, or <span className="text-[#1B4DA0] underline">browse</span></span>
                                  <input
                                    type="file"
                                    onChange={handleEditFileChange}
                                    className="hidden"
                                    accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg"
                                  />
                                </label>
                              )}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <p className="text-[13px] font-bold text-slate-500 leading-relaxed bg-white border border-[#F4F3EF] p-5 rounded-2xl shadow-sm">
                          {selectedPolicyDetail.description}
                        </p>
                      )}
                    </div>
                  </div>

                </div>

                {/* Attached document / download banner */}
                {!isEditingDetail && (
                  selectedPolicyDetail.fileName ? (
                    <div className="p-6 rounded-[2.5rem] border border-[#1B4DA0]/20 bg-[#1B4DA0]/5 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-blue-100 flex items-center justify-center text-[#1B4DA0]">
                          <FiFileText className="w-6 h-6" />
                        </div>
                        <div className="text-left">
                          <h4 className="text-[13px] font-bold text-[#1A1A2E] max-w-[200px] sm:max-w-[320px] truncate">{selectedPolicyDetail.fileName}</h4>
                          <p className="text-[10px] font-bold text-[#9B9BAD] mt-0.5">{selectedPolicyDetail.fileSize || 'Certified Documentation'}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => {
                            setPreviewFile(selectedPolicyDetail);
                          }}
                          className="p-4 bg-white border border-[#E8E7E2] hover:bg-slate-50 rounded-2xl text-[#1B4DA0] shadow-sm hover:scale-105 active:scale-95 transition-all"
                          title="View Document"
                        >
                          <FiEye className="w-5 h-5" />
                        </button>
                        <button 
                          onClick={() => {
                            alert(`Downloading document: ${selectedPolicyDetail.fileName}`);
                          }}
                          className="p-4 bg-gradient-to-br from-[#1B4DA0] to-[#0D47A1] rounded-2xl text-white shadow-xl hover:scale-105 active:scale-95 transition-all"
                          title="Download Document"
                        >
                          <FiDownload className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="p-6 rounded-[2.5rem] border border-[#F4F3EF] bg-slate-50/50 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400">
                          <FiFileText className="w-6 h-6" />
                        </div>
                        <div className="text-left">
                          <h4 className="text-[13px] font-bold text-[#1A1A2E]">No Certified Documentation</h4>
                          <p className="text-[10px] font-bold text-[#9B9BAD] mt-0.5">There is no file attached to this directive.</p>
                        </div>
                      </div>
                    </div>
                  )
                )}

                {/* Actions Grid */}
                {isEditingDetail && (
                  <div className="flex gap-4 pt-4 border-t border-[#F4F3EF]">
                    <button
                      onClick={handleSaveDetailEdits}
                      className="flex-1 py-4 bg-[#1B4DA0] hover:bg-[#153D80] rounded-2xl text-[11px] font-black uppercase tracking-widest text-white transition-all shadow-lg"
                    >
                      Save Modifications
                    </button>
                    <button
                      onClick={() => setIsEditingDetail(false)}
                      className="flex-1 py-4 bg-transparent border-2 border-[#F4F3EF] rounded-2xl text-[11px] font-black uppercase tracking-widest text-slate-500 hover:bg-[#FAFAF8] transition-all"
                    >
                      Cancel
                    </button>
                  </div>
                )}

              </div>
            </motion.div>
          </div>
        </AnimatePresence>,
        document.body
      )}

      {/* Add Policy Modal */}
      {isAddModalOpen && createPortal(
        <AnimatePresence>
          <div className="fixed inset-0 z-[200000] flex items-center justify-center p-4 md:p-6 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-[#1A1A2E]/60 backdrop-blur-xl"
              onClick={() => setIsAddModalOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-2xl bg-white rounded-[40px] shadow-2xl overflow-hidden border border-[#F4F3EF] z-[200001] font-[Outfit]"
            >
              {/* Modal Header */}
              <div className="p-8 border-b border-[#F4F3EF] flex items-center justify-between bg-gradient-to-r from-blue-50/30 to-white text-left">
                <div>
                  <h3 className="text-xl font-bold text-[#1A1A2E] font-syne">New Policy</h3>
                                  </div>
                <button
                  onClick={() => setIsAddModalOpen(false)}
                  className="w-12 h-12 rounded-2xl bg-[#F4F3EF] text-[#9B9BAD] hover:text-red-500 hover:bg-red-50 transition-all flex items-center justify-center shadow-sm"
                >
                  <FiX size={20} />
                </button>
              </div>

              {/* Modal Body Form */}
              <form onSubmit={handleCreatePolicy} className="p-8 max-h-[70vh] overflow-y-auto custom-scrollbar text-left space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                  <div className="space-y-1.5 col-span-full">
                    <label className="text-[10px] font-bold text-[#9B9BAD] uppercase tracking-[2px]">Policy Reference Title</label>
                    <input
                      type="text"
                      required
                      placeholder="Enter Reference Title (e.g. Leave Policy 2026)"
                      value={newPolicy.title}
                      onChange={(e) => setNewPolicy({ ...newPolicy, title: e.target.value })}
                      className="w-full bg-[#F4F3EF] border-none rounded-2xl py-3.5 px-5 text-sm font-medium focus:ring-2 focus:ring-[#1B4DA0]/20 outline-none transition-all placeholder:text-[#9B9BAD]"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-[#9B9BAD] uppercase tracking-[2px]">Classification Category</label>
                    <select
                      value={newPolicy.category}
                      onChange={(e) => setNewPolicy({ ...newPolicy, category: e.target.value })}
                      className="w-full bg-[#F4F3EF] text-sm font-bold text-[#1A1A2E] rounded-2xl px-4 py-3.5 outline-none border-0 cursor-pointer"
                    >
                      {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-[#9B9BAD] uppercase tracking-[2px]">Revision Code</label>
                    <input
                      type="text"
                      placeholder="e.g. 1.0"
                      value={newPolicy.version}
                      onChange={(e) => setNewPolicy({ ...newPolicy, version: e.target.value })}
                      className="w-full bg-[#F4F3EF] border-none rounded-2xl py-3.5 px-5 text-sm font-medium focus:ring-2 focus:ring-[#1B4DA0]/20 outline-none transition-all placeholder:text-[#9B9BAD]"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-[#9B9BAD] uppercase tracking-[2px]">Effective Date</label>
                    <input
                      type="date"
                      required
                      value={newPolicy.effectiveFrom}
                      onChange={(e) => setNewPolicy({ ...newPolicy, effectiveFrom: e.target.value })}
                      className="w-full bg-[#F4F3EF] border-none rounded-2xl py-3.5 px-5 text-sm font-medium focus:ring-2 focus:ring-[#1B4DA0]/20 outline-none transition-all"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-[#9B9BAD] uppercase tracking-[2px]">Auditor / Updated By</label>
                    <input
                      type="text"
                      placeholder="e.g. HR Manager"
                      value={newPolicy.updatedBy}
                      onChange={(e) => setNewPolicy({ ...newPolicy, updatedBy: e.target.value })}
                      className="w-full bg-[#F4F3EF] border-none rounded-2xl py-3.5 px-5 text-sm font-medium focus:ring-2 focus:ring-[#1B4DA0]/20 outline-none transition-all placeholder:text-[#9B9BAD]"
                    />
                  </div>

                  <div className="space-y-1.5 col-span-full">
                    <label className="text-[10px] font-bold text-[#9B9BAD] uppercase tracking-[2px]">Policy Operational Guidelines & Scope</label>
                    <textarea
                      required
                      placeholder="Define policy description, criteria, and compliance scope..."
                      value={newPolicy.description}
                      onChange={(e) => setNewPolicy({ ...newPolicy, description: e.target.value })}
                      rows={4}
                      className="w-full bg-[#F4F3EF] border-none rounded-2xl py-3.5 px-5 text-sm font-medium focus:ring-2 focus:ring-[#1B4DA0]/20 outline-none transition-all placeholder:text-[#9B9BAD]"
                    />
                  </div>

                  <div className="space-y-1.5 col-span-full">
                    <label className="text-[10px] font-bold text-[#9B9BAD] uppercase tracking-[2px]">Upload Policy Document</label>
                    <div
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                      className={`border-2 border-dashed rounded-3xl p-6 text-center transition-all duration-300 ${
                        isDragOver 
                          ? 'border-[#1B4DA0] bg-blue-50/30' 
                          : selectedFile 
                            ? 'border-emerald-300 bg-emerald-50/10' 
                            : 'border-[#F4F3EF] hover:border-[#1B4DA0]/40 bg-[#F4F3EF]/50'
                      }`}
                    >
                      {selectedFile ? (
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3 text-left">
                            <div className="w-12 h-12 rounded-2xl bg-emerald-100 flex items-center justify-center text-emerald-600">
                              <FiFileText size={24} />
                            </div>
                            <div>
                              <p className="text-sm font-bold text-[#1A1A2E] max-w-[300px] truncate">{selectedFile.name}</p>
                              <p className="text-[10px] font-bold text-slate-400 mt-0.5">
                                {(selectedFile.size / (1024 * 1024)) >= 1 
                                  ? `${(selectedFile.size / (1024 * 1024)).toFixed(1)} MB` 
                                  : `${(selectedFile.size / 1024).toFixed(0)} KB`}
                              </p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={handleRemoveFile}
                            className="p-3 bg-red-50 hover:bg-red-100 rounded-xl text-red-500 transition-all active:scale-95"
                          >
                            <FiTrash2 size={16} />
                          </button>
                        </div>
                      ) : (
                        <label className="cursor-pointer flex flex-col items-center justify-center py-4">
                          <div className="w-12 h-12 rounded-2xl bg-white border border-[#E8E7E2] flex items-center justify-center text-[#1B4DA0] shadow-sm mb-3">
                            <FiUpload size={20} />
                          </div>
                          <span className="text-sm font-bold text-[#1A1A2E]">Drag & drop policy document, or <span className="text-[#1B4DA0] underline">browse</span></span>
                          <span className="text-[10px] font-medium text-slate-400 mt-1">Supports PDF, DOCX, XLSX or Images (Max 10MB)</span>
                          <input
                            type="file"
                            onChange={handleFileChange}
                            className="hidden"
                            accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg"
                          />
                        </label>
                      )}
                    </div>
                  </div>

                  <div className="space-y-1.5 col-span-full">
                    <label className="text-[10px] font-bold text-[#9B9BAD] uppercase tracking-[2px]">Initial Audit Status</label>
                    <select
                      value={newPolicy.status}
                      onChange={(e) => setNewPolicy({ ...newPolicy, status: e.target.value })}
                      className="w-full bg-[#F4F3EF] text-sm font-bold text-[#1A1A2E] rounded-2xl px-4 py-3.5 outline-none border-0 cursor-pointer"
                    >
                      <option value="active">Active</option>
                      <option value="under-review">Under Review</option>
                    </select>
                  </div>

                </div>

                {/* Action Buttons */}
                <div className="flex gap-4 pt-4 border-t border-[#F4F3EF]">
                  <button
                    type="submit"
                    className="flex-1 py-4 bg-[#1B4DA0] hover:bg-[#153D80] rounded-2xl text-[11px] font-black uppercase tracking-widest text-white transition-all shadow-lg"
                  >
                    Publish Directive
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsAddModalOpen(false)}
                    className="flex-1 py-4 bg-transparent border-2 border-[#F4F3EF] rounded-2xl text-[11px] font-black uppercase tracking-widest text-slate-500 hover:bg-[#FAFAF8] transition-all"
                  >
                    Discard Draft
                  </button>
                </div>

              </form>
            </motion.div>
          </div>
        </AnimatePresence>,
        document.body
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && createPortal(
        <AnimatePresence>
          <div className="fixed inset-0 z-[210000] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-[#1A1A2E]/60 backdrop-blur-xl"
              onClick={() => setIsDeleteModalOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md bg-white rounded-[40px] shadow-2xl p-10 text-center border border-[#F4F3EF] z-[210001] font-[Outfit]"
            >
              <div className="w-20 h-20 bg-red-50 rounded-3xl flex items-center justify-center text-red-500 mx-auto mb-6 shadow-sm">
                <FiTrash size={36} />
              </div>
              <h3 className="text-2xl font-bold text-[#1A1A2E] mb-2 font-syne">Delete Directive?</h3>
              <p className="text-sm text-[#6B6B7E] mb-8 leading-relaxed">
                Are you sure you want to delete <span className="font-bold text-[#1A1A2E]">{policyToDelete?.title}</span>? This action cannot be undone.
              </p>
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => setIsDeleteModalOpen(false)}
                  className="py-4 bg-[#F8FAFC] border border-[#F4F3EF] rounded-2xl text-[11px] font-black uppercase tracking-widest text-[#1A1A2E] hover:bg-gray-50 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteConfirm}
                  className="py-4 bg-red-500 rounded-2xl text-[11px] font-black uppercase tracking-widest text-white hover:bg-red-600 transition-all shadow-lg shadow-red-500/20"
                >
                  Delete Forever
                </button>
              </div>
            </motion.div>
          </div>
        </AnimatePresence>,
        document.body
      )}

      {/* File Preview Modal */}
      {previewFile && createPortal(
        <AnimatePresence>
          <div className="fixed inset-0 z-[300000] flex items-center justify-center p-4 md:p-10">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-[#1A1A2E]/80 backdrop-blur-xl"
              onClick={() => setPreviewFile(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-4xl h-[85vh] bg-white rounded-[32px] shadow-2xl overflow-hidden border border-[#F4F3EF] z-[300001] flex flex-col font-[Outfit]"
            >
              {/* Viewer Header */}
              <div className="bg-[#1A1A2E] text-white px-8 py-5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center">
                    <FiFileText size={20} />
                  </div>
                  <div className="text-left">
                    <h4 className="text-sm font-bold truncate max-w-[300px] md:max-w-[500px]">{previewFile.fileName}</h4>
                    <p className="text-[10px] font-bold text-slate-400 mt-0.5">{previewFile.fileSize || 'Certified Documentation'} • Dynamic PDF Preview</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => alert(`Downloading document: ${previewFile.fileName}`)}
                    className="p-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-all active:scale-95"
                    title="Download File"
                  >
                    <FiDownload size={18} />
                  </button>
                  <button 
                    onClick={() => setPreviewFile(null)}
                    className="p-2.5 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-xl transition-all active:scale-95"
                    title="Close Preview"
                  >
                    <FiX size={18} />
                  </button>
                </div>
              </div>

              {/* Viewer Body (A4 Styled Document) */}
              <div className="flex-1 bg-[#2C2C35] overflow-y-auto p-8 md:p-12 flex justify-center custom-scrollbar">
                <div className="w-full max-w-[800px] bg-white shadow-xl min-h-[1000px] rounded-sm p-12 md:p-16 relative text-left border border-gray-300 font-[Outfit] text-slate-800 leading-relaxed">
                  
                  {/* Decorative Letterhead Watermark / Header */}
                  <div className="border-b-2 border-[#1B4DA0] pb-6 mb-8 flex justify-between items-start">
                    <div>
                      <h2 className="text-xl font-bold tracking-tight text-[#1B4DA0] uppercase font-syne">MABICONS ERP</h2>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Global Human Resource Portal</p>
                    </div>
                    <div className="text-right">
                      <span className="px-3 py-1 bg-blue-50 text-[#1B4DA0] text-[9px] font-black uppercase tracking-widest rounded-full border border-blue-100">
                        {previewFile.category || 'CORPORATE POLICY'}
                      </span>
                      <p className="text-[10px] font-bold text-slate-400 mt-2">REF: MAB/POL/{previewFile.version || '1.0'}</p>
                    </div>
                  </div>

                  {/* Certified Watermark Overlay */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none opacity-[0.03]">
                    <div className="text-[5rem] font-black text-[#1B4DA0] rotate-[-30deg] border-[12px] border-dashed border-[#1B4DA0] p-10 rounded-[40px]">
                      MABICONS CERTIFIED
                    </div>
                  </div>

                  {/* Document Title */}
                  <div className="mb-10 text-center">
                    <h1 className="text-2xl md:text-3xl font-extrabold text-[#1A1A2E] uppercase font-syne tracking-tight leading-tight">
                      {previewFile.title || 'Corporate Guideline'}
                    </h1>
                    <p className="text-xs text-slate-400 font-bold mt-2 uppercase tracking-wider">
                      Effective Date: {new Date(previewFile.effectiveFrom).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                  </div>

                  {/* Document Content */}
                  <div className="space-y-8 text-sm text-slate-700">
                    <div>
                      <h3 className="text-xs font-black text-[#1A1A2E] uppercase tracking-wider mb-2 border-l-4 border-[#1B4DA0] pl-3">1. Objective & Scope</h3>
                      <p className="pl-4">
                        This official document outlines the rules, guidelines, and compliance expectations regarding the <strong className="text-[#1A1A2E]">{previewFile.title}</strong> at Mabicons. 
                        It applies to all employees, executives, contract partners, and stakeholders of the corporate registry under the {previewFile.category} classification.
                      </p>
                    </div>

                    <div>
                      <h3 className="text-xs font-black text-[#1A1A2E] uppercase tracking-wider mb-2 border-l-4 border-[#1B4DA0] pl-3">2. Detailed Guidelines</h3>
                      <p className="pl-4 leading-relaxed font-medium text-slate-600 bg-slate-50 p-4 rounded-xl border border-slate-100 whitespace-pre-line">
                        {previewFile.description || 'No additional scope details provided. Please review the corporate guidelines index for more information.'}
                      </p>
                    </div>

                    <div>
                      <h3 className="text-xs font-black text-[#1A1A2E] uppercase tracking-wider mb-2 border-l-4 border-[#1B4DA0] pl-3">3. Compliance & Enforcement</h3>
                      <p className="pl-4">
                        Failure to comply with the stipulations set forth in this directive may lead to audit reviews and corrective disciplinary measures. 
                        Mabicons reserves the absolute right to amend, suspend, or update these terms at any time.
                      </p>
                    </div>

                    {/* Signature Block */}
                    <div className="pt-16 grid grid-cols-2 gap-8 border-t border-slate-100 mt-16">
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Prepared & Audited By</p>
                        <div className="h-16 flex items-end">
                          <span className="font-syne text-[#1A1A2E] font-bold text-sm underline decoration-[#1B4DA0] decoration-2 underline-offset-4">
                            {previewFile.updatedBy || 'HR Management'}
                          </span>
                        </div>
                        <p className="text-xs font-bold text-slate-500 mt-1">Authorized Auditor</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Office Verification Stamp</p>
                        <div className="h-16 flex items-end justify-end">
                          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-emerald-500 bg-emerald-50 text-emerald-600 text-[9px] font-black uppercase tracking-widest rounded-lg">
                            <FiCheckCircle size={12} /> APPROVED DIGITAL REGISTER
                          </div>
                        </div>
                        <p className="text-xs font-bold text-slate-500 mt-1">Mabicons Corporate Hub</p>
                      </div>
                    </div>

                  </div>

                </div>
              </div>

            </motion.div>
          </div>
        </AnimatePresence>,
        document.body
      )}

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #E5E7EB; border-radius: 20px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #D1D5DB; }
      `}</style>
    </>
  );
};

export default PolicyTab;