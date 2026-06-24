import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiCheck, FiBriefcase, FiUser, FiCalendar, FiClock, FiFileText, FiSearch, FiChevronDown, FiDollarSign, FiType } from 'react-icons/fi';
import { toast } from 'react-hot-toast';

const FiRupeeSign = ({ className, size }) => (
  <span className={className} style={{ fontSize: size ? `${size}px` : '14px', fontWeight: 'bold', display: 'inline-flex', alignItems: 'center' }}>₹</span>
);

const InputField = ({ label, name, value, onChange, placeholder, type = "text", required = false, icon: Icon }) => (
  <div className="space-y-2.5 text-left relative group">
    <label className="text-[10px] font-bold text-[#9B9BAD] uppercase tracking-[2px] ml-1 flex items-center gap-1.5">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <div className="relative">
      {Icon && <Icon className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9B9BAD] transition-colors group-focus-within:text-[#1B4DA0]" size={14} />}
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        onClick={(e) => {
          if (type === 'date' || type === 'time') {
            try { e.target.showPicker(); } catch (err) {}
          }
        }}
        placeholder={placeholder}
        className={`w-full bg-white border-[#F4F3EF] border-2 rounded-2xl py-3.5 ${Icon ? 'pl-11' : 'px-5'} pr-5 text-[13px] font-bold text-[#1A1A2E] outline-none focus:border-[#1B4DA0]/30 transition-all placeholder:text-[#BDBDC7] placeholder:font-medium shadow-sm focus:shadow-md`}
      />
    </div>
  </div>
);

const FileInputField = ({ label, name, onChange, required = false, icon: Icon }) => (
  <div className="space-y-2.5 text-left relative group">
    <label className="text-[10px] font-bold text-[#9B9BAD] uppercase tracking-[2px] ml-1 flex items-center gap-1.5">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <div className="relative">
      {Icon && <Icon className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9B9BAD] transition-colors group-focus-within:text-[#1B4DA0]" size={14} />}
      <input
        type="file"
        name={name}
        onChange={(e) => onChange({ target: { name, value: e.target.files[0] } })}
        className={`w-full bg-white border-[#F4F3EF] border-2 rounded-2xl py-3 ${Icon ? 'pl-11' : 'px-5'} pr-5 text-[13px] font-bold text-[#1A1A2E] outline-none focus:border-[#1B4DA0]/30 transition-all file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-[11px] file:font-bold file:uppercase file:tracking-widest file:bg-blue-50 file:text-[#1B4DA0] hover:file:bg-blue-100 cursor-pointer shadow-sm focus:shadow-md`}
      />
    </div>
  </div>
);

import { createLead, updateLead, getAllLeads } from '../../../service/api';

const SearchableSelectField = ({ label, name, value, onChange, options, required = false, icon: Icon }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = React.useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredOptions = options.filter(opt => opt.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="space-y-2.5 text-left relative group" ref={dropdownRef}>
      <label className="text-[10px] font-bold text-[#9B9BAD] uppercase tracking-[2px] ml-1 flex items-center gap-1.5">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div className="relative">
        {Icon && <Icon className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9B9BAD] transition-colors z-10 group-focus-within:text-[#1B4DA0]" size={14} />}
        <div 
          onClick={() => setIsOpen(!isOpen)}
          className={`w-full bg-white border-[#F4F3EF] border-2 rounded-2xl py-3.5 ${Icon ? 'pl-11' : 'px-5'} pr-10 text-[13px] font-bold outline-none transition-all cursor-pointer shadow-sm focus:shadow-md flex items-center justify-between ${isOpen ? 'border-[#1B4DA0]/30' : ''}`}
        >
          <span className={value ? "text-[#1A1A2E]" : "text-[#BDBDC7] font-medium"}>{value || `Select ${label}`}</span>
        </div>
        <FiChevronDown className={`absolute right-4 top-1/2 -translate-y-1/2 text-[#9B9BAD] transition-transform pointer-events-none ${isOpen ? 'rotate-180' : ''}`} size={16} />
        
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.15 }}
              className="absolute z-[1000] w-full mt-2 bg-white rounded-2xl shadow-xl border border-[#F4F3EF] overflow-hidden"
            >
              <div className="p-3 border-b border-[#F4F3EF] relative">
                <FiSearch className="absolute left-6 top-1/2 -translate-y-1/2 text-[#9B9BAD]" size={14} />
                <input
                  type="text"
                  placeholder="Search clients..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-slate-50 border-none rounded-xl py-2.5 pl-10 pr-4 text-[13px] font-bold text-[#1A1A2E] outline-none focus:bg-slate-100 transition-colors placeholder:text-[#9B9BAD] placeholder:font-medium"
                  autoFocus
                />
              </div>
              <div className="max-h-48 overflow-y-auto p-1 custom-scrollbar">
                {filteredOptions.length > 0 ? filteredOptions.map((opt, i) => (
                  <div
                    key={i}
                    onClick={() => {
                      onChange({ target: { name, value: opt } });
                      setIsOpen(false);
                      setSearchTerm('');
                    }}
                    className={`px-4 py-2.5 text-[13px] font-bold cursor-pointer rounded-xl transition-all ${value === opt ? 'bg-[#1B4DA0]/10 text-[#1B4DA0]' : 'text-[#6B6B7E] hover:bg-slate-50 hover:text-[#1A1A2E]'}`}
                  >
                    {opt}
                  </div>
                )) : (
                  <div className="px-4 py-4 text-[12px] font-bold text-[#9B9BAD] text-center bg-slate-50/50 rounded-xl m-1">No clients found matching "{searchTerm}"</div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};


const fileToBase64 = (file) => new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.readAsDataURL(file);
  reader.onload = () => resolve(reader.result);
  reader.onerror = error => reject(error);
});


const ProposalOnboardingForm = ({ isOpen, onClose, onComplete, initialData = null }) => {
  const [submitting, setSubmitting] = useState(false);
  const isEdit = !!initialData;

  const initialFormState = {
    clientNameDropdown: '',
    customClientName: '',
    proposalTitle: '',
    value: '',
    owner: '',
    date: '',
    time: '',
    validUntil: '',
    document: null,
    notes: ''
  };

  const [formData, setFormData] = useState(initialFormState);
  const [clients, setClients] = useState([]);
  const [loadingClients, setLoadingClients] = useState(false);

  useEffect(() => {
    const loadClients = async () => {
      try {
        setLoadingClients(true);
        const res = await getAllLeads();
        let leadsList = [];
        if (res) {
          if (Array.isArray(res.data?.leads)) {
            leadsList = res.data.leads;
          } else if (Array.isArray(res.data)) {
            leadsList = res.data;
          } else if (Array.isArray(res.leads)) {
            leadsList = res.leads;
          } else if (Array.isArray(res)) {
            leadsList = res;
          }
        }
        const filteredList = leadsList.filter(l => !['converted', 'lost', 'inactive'].includes((l.status || '').toLowerCase().trim()));
        setClients(filteredList);
      } catch (err) {
        console.error('Failed to load leads:', err);
      } finally {
        setLoadingClients(false);
      }
    };
    if (isOpen) {
      loadClients();
    }
  }, [isOpen]);

  useEffect(() => {
    if (initialData && isOpen) {
      // Extract numeric value from ₹ formatted string if present
      let numericValue = '';
      if (initialData.date && typeof initialData.date === 'string' && initialData.date.includes('₹')) {
        numericValue = initialData.date.replace(/[^\d]/g, '');
      } else {
        numericValue = initialData.value || '';
      }

      const clientNames = clients.map(c => c.companyName || c.name).filter(Boolean);
      const isCustom = !clientNames.includes(initialData.clientName);

      setFormData({
        ...initialFormState,
        ...initialData,
        value: numericValue,
        clientNameDropdown: isCustom ? 'Other' : (initialData.clientName || ''),
        customClientName: isCustom ? (initialData.clientName || '') : '',
        owner: initialData.contactPerson && initialData.contactPerson !== 'N/A' ? initialData.contactPerson : '',
        followupId: initialData._id || initialData.id,
      });
    } else if (isOpen) {
      setFormData(initialFormState);
    }
  }, [initialData, isOpen, clients]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const validateForm = () => {
    const required = ['clientNameDropdown', 'value', 'owner', 'date'];
    for (const field of required) {
      if (!formData[field]) {
        toast.error(`${field.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())} is required`);
        return false;
      }
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    const finalClientName = formData.clientNameDropdown === 'Other' ? formData.customClientName : formData.clientNameDropdown;

    try {
      setSubmitting(true);

      let documentStr = null;
      if (formData.document instanceof File) {
        const base64Data = await fileToBase64(formData.document);
        documentStr = JSON.stringify({
          name: formData.document.name,
          type: formData.document.type,
          data: base64Data
        });
      } else if (typeof formData.document === 'string') {
        documentStr = formData.document;
      }

      const leadData = {
        companyName: finalClientName,
        value: parseFloat(formData.value) || 0,
        owner: formData.owner || 'N/A',
        status: 'Proposal',
        lastContactDate: formData.date,
        notes: formData.notes || '',
        proposalTitle: formData.proposalTitle || '',
        validUntil: formData.validUntil || '',
        time: formData.time || '',
        document: documentStr
      };

      // Find if it's an existing lead selected from the dropdown
      const selectedLead = formData.clientNameDropdown !== 'Other' 
        ? clients.find(c => (c.companyName || c.name || '') === formData.clientNameDropdown) 
        : null;

      let savedLead;
      if (isEdit) {
        const res = await updateLead(formData.followupId, leadData);
        savedLead = res?.data || res?.lead;
        toast.success("Proposal updated in database successfully! ✨");
      } else if (selectedLead) {
        const res = await updateLead(selectedLead.id, leadData);
        savedLead = res?.data || res?.lead;
        toast.success("Lead moved to Proposal successfully! ✨");
      } else {
        const res = await createLead(leadData);
        savedLead = res?.data || res?.lead;
        toast.success("Proposal added to database successfully! 🎉");
      }
      
      if (onComplete && savedLead) {
        onComplete({
          ...savedLead,
          id: savedLead.id || savedLead._id,
          clientName: savedLead.companyName,
          proposalTitle: savedLead.proposalTitle || 'Proposal Draft',
          proposalValue: savedLead.value || 0,
          date: savedLead.lastContactDate ? new Date(savedLead.lastContactDate).toISOString().split('T')[0] : 'N/A',
          contactPerson: savedLead.owner || 'N/A',
          status: savedLead.status === 'Negotiation' ? 'Accepted' : 'Sent',
          validUntil: savedLead.validUntil || '',
          time: savedLead.time || '',
          document: savedLead.document || null,
          notes: savedLead.notes || ''
        });
      }
      onClose();
    } catch (err) {
      console.error('Submission error:', err);
      toast.error(`Failed to ${isEdit ? 'update' : 'add'} proposal in database`);
    } finally {
      setSubmitting(false);
    }
  };

  const modalContent = (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[1000000] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-[#1A1A2E]/60 backdrop-blur-xl"
          />
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="relative w-full max-w-[600px] bg-white rounded-[40px] shadow-2xl flex flex-col overflow-hidden max-h-[90vh]"
          >
            {/* Header */}
            <div className="px-10 py-8 border-b border-[#F4F3EF] flex items-center justify-between bg-white sticky top-0 z-20">
              <div className="flex items-center gap-5">
                <div>
                  <h2 className="text-2xl font-bold text-[#1A1A2E] tracking-tight font-syne">{isEdit ? 'Edit Proposal Details' : 'Add New Proposal'}</h2>
                </div>
              </div>
              <button onClick={onClose} className="w-11 h-11 rounded-2xl bg-[#F8F9FA] text-[#9B9BAD] hover:bg-red-50 hover:text-red-500 transition-all flex items-center justify-center shadow-sm">
                <FiX size={22} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-12 py-12 custom-scrollbar space-y-12">
              <div className="grid grid-cols-1 gap-y-8">
                <SearchableSelectField 
                  label="Client / Lead Name" 
                  name="clientNameDropdown" 
                  value={formData.clientNameDropdown} 
                  onChange={handleInputChange} 
                  options={[
                    ...new Set(clients.map(c => c.companyName || c.name).filter(Boolean)),
                    'Other'
                  ]}
                  required 
                  icon={FiBriefcase}
                />
                {formData.clientNameDropdown === 'Other' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden -mt-4"
                  >
                    <InputField 
                      label="Custom Client Name" 
                      name="customClientName" 
                      value={formData.customClientName} 
                      onChange={handleInputChange} 
                      placeholder="Enter client name manually" 
                      required 
                      icon={FiBriefcase}
                    />
                  </motion.div>
                )}
                <InputField 
                  label="Proposal Title" 
                  name="proposalTitle" 
                  value={formData.proposalTitle} 
                  onChange={handleInputChange} 
                  placeholder="e.g. ERP System Implementation" 
                  required 
                  icon={FiType}
                />
                <div className="grid grid-cols-2 gap-4">
                  <InputField 
                    label="Proposal Value (₹)" 
                    name="value" 
                    type="number"
                    value={formData.value} 
                    onChange={handleInputChange} 
                    placeholder="e.g. 50000" 
                    icon={FiRupeeSign}
                  />
                  <InputField 
                    label="Valid Until" 
                    name="validUntil" 
                    type="date"
                    value={formData.validUntil} 
                    onChange={handleInputChange} 
                    icon={FiCalendar}
                  />
                </div>
                <InputField 
                  label="Sent By" 
                  name="owner" 
                  value={formData.owner} 
                  onChange={handleInputChange} 
                  placeholder="e.g. John Doe" 
                  required 
                  icon={FiUser}
                />
                <div className="grid grid-cols-2 gap-4">
                  <InputField 
                    label="Proposal Date" 
                    name="date" 
                    type="date"
                    value={formData.date} 
                    onChange={handleInputChange} 
                    required 
                    icon={FiCalendar}
                  />
                  <InputField 
                    label="Proposal Time" 
                    name="time" 
                    type="time"
                    value={formData.time} 
                    onChange={handleInputChange} 
                    icon={FiClock}
                  />
                </div>
                <FileInputField 
                  label="Proposal Document" 
                  name="document" 
                  onChange={handleInputChange} 
                  required 
                  icon={FiFileText}
                />
                <InputField 
                  label="Notes / Remarks" 
                  name="notes" 
                  value={formData.notes} 
                  onChange={handleInputChange} 
                  placeholder="Any discussion notes..." 
                  icon={FiFileText}
                />
              </div>
            </div>

            {/* Footer */}
            <div className="px-10 py-8 border-t border-[#F4F3EF] bg-white sticky bottom-0 z-20 flex items-center justify-between shadow-[0_-10px_30px_rgba(0,0,0,0.02)]">
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex items-center gap-2 px-8 py-3.5 rounded-[20px] text-[#6B6B7E] font-black uppercase tracking-widest text-[11px] border border-[#F4F3EF] hover:bg-[#F8F9FA] transition-all"
                >
                  Cancel
                </button>
              </div>
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="flex items-center gap-3 px-12 py-4 bg-[#1B4DA0] text-white font-black uppercase tracking-widest text-[12px] rounded-[20px] hover:bg-[#153D80] transition-all shadow-xl shadow-blue-500/20 active:scale-95 disabled:opacity-50"
                >
                  {submitting ? 'Saving...' : (isEdit ? 'Save Changes' : 'Add Proposal')} <FiCheck size={20} />
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );

  return typeof document !== 'undefined' ? createPortal(modalContent, document.body) : null;
};

export default ProposalOnboardingForm;
