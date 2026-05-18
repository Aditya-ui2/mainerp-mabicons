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
  FiInfo
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
    updatedBy: 'HR Manager'
  });

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

  useEffect(() => {
    const mockData = [
      { id: 1, title: 'Leave Policy 2026', category: 'Leave Management', description: 'Comprehensive leave policy covering all types of leaves including sick, casual, earned, and special leaves.', version: '2.0', effectiveFrom: '2026-01-01', status: 'active', lastUpdated: '2025-12-15', updatedBy: 'HR Manager' },
      { id: 2, title: 'Remote Work Policy', category: 'HR Management', description: 'Guidelines for work from home arrangements, eligibility, and productivity expectations.', version: '1.5', effectiveFrom: '2025-06-01', status: 'active', lastUpdated: '2025-05-20', updatedBy: 'HR Director' },
      { id: 3, title: 'Code of Conduct', category: 'Code Of Conduct', description: 'Professional behavior standards, ethics guidelines, and workplace conduct expectations.', version: '3.0', effectiveFrom: '2024-01-01', status: 'active', lastUpdated: '2024-01-01', updatedBy: 'Legal Team' },
      { id: 4, title: 'Data Security Policy', category: 'IT Security', description: 'Information security guidelines, data handling procedures, and compliance requirements.', version: '2.1', effectiveFrom: '2025-09-01', status: 'active', lastUpdated: '2025-08-25', updatedBy: 'IT Security' },
      { id: 5, title: 'Travel & Expense Policy', category: 'Travel & Expense', description: 'Business travel guidelines, expense claims, and reimbursement procedures.', version: '1.8', effectiveFrom: '2025-04-01', status: 'under-review', lastUpdated: '2026-02-10', updatedBy: 'Finance Team' },
      { id: 6, title: 'Attendance Policy', category: 'Attendance Protocol', description: 'Working hours, punctuality expectations, overtime rules, and attendance tracking.', version: '2.2', effectiveFrom: '2026-01-01', status: 'active', lastUpdated: '2025-12-20', updatedBy: 'HR Manager' },
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

    const created = {
      ...newPolicy,
      id: Date.now(),
      lastUpdated: new Date().toISOString().split('T')[0]
    };

    setPolicies(prev => [created, ...prev]);
    setIsAddModalOpen(false);

    // Reset Form
    setNewPolicy({
      title: '',
      category: 'HR Management',
      description: '',
      version: '1.0',
      effectiveFrom: new Date().toISOString().split('T')[0],
      status: 'active',
      updatedBy: 'HR Manager'
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
      setPolicies(prev => prev.map(p => p.id === editablePolicy.id ? { ...editablePolicy, lastUpdated: new Date().toISOString().split('T')[0] } : p));
      setSelectedPolicyDetail({ ...editablePolicy, lastUpdated: new Date().toISOString().split('T')[0] });
      setIsEditingDetail(false);
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
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold text-[#9B9BAD] uppercase tracking-[2px]">Directive Description</label>
                          <textarea
                            value={editablePolicy?.description}
                            onChange={(e) => setEditablePolicy({ ...editablePolicy, description: e.target.value })}
                            rows={4}
                            className="w-full text-sm font-bold text-[#1A1A2E] bg-white border border-[#F4F3EF] p-4 rounded-xl focus:outline-none"
                          />
                        </div>
                      ) : (
                        <p className="text-[13px] font-bold text-slate-500 leading-relaxed bg-white border border-[#F4F3EF] p-5 rounded-2xl shadow-sm">
                          {selectedPolicyDetail.description}
                        </p>
                      )}
                    </div>
                  </div>

                </div>

                {/* PDF download banner */}
                {!isEditingDetail && (
                  <div className="p-6 rounded-[2.5rem] border border-[#1B4DA0]/20 bg-blue-50/20 flex items-center justify-between">
                    <div>
                      <h4 className="text-[14px] font-black text-[#1B4DA0]">Certified Documentation</h4>
                      <p className="text-[10px] font-bold text-slate-400 mt-1">Acquire technical PDF formatting for reference.</p>
                    </div>
                    <button className="p-4 bg-gradient-to-br from-[#1B4DA0] to-[#0D47A1] rounded-2xl text-white shadow-xl hover:scale-105 active:scale-95 transition-all">
                      <FiDownload className="w-5 h-5" />
                    </button>
                  </div>
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
                  <h3 className="text-xl font-bold text-[#1A1A2E] font-syne">Authenticate Directive</h3>
                  <p className="text-[11px] font-bold text-[#1B4DA0] uppercase tracking-widest mt-1">Publish new corporate guidelines</p>
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