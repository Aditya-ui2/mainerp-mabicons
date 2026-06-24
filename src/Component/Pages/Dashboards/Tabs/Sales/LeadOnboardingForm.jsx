import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiCheck, FiSave, FiBriefcase, FiUser, FiUsers, FiMail, FiPhone, FiTarget, FiMapPin, FiGlobe, FiAlignLeft, FiChevronDown } from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import { createLead, updateLead } from '../../../service/api';

const InputField = ({ label, name, value, onChange, placeholder, type = "text", required = false, icon: Icon, className = "" }) => (
  <div className={`space-y-2.5 text-left relative group ${className}`}>
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
        placeholder={placeholder}
        className={`w-full bg-white border-[#F4F3EF] border-2 rounded-2xl py-3.5 ${Icon ? 'pl-11' : 'px-5'} pr-5 text-[13px] font-bold text-[#1A1A2E] outline-none focus:border-[#1B4DA0]/30 transition-all placeholder:text-[#BDBDC7] placeholder:font-medium shadow-sm focus:shadow-md`}
      />
    </div>
  </div>
);

const TextareaField = ({ label, name, value, onChange, placeholder, required = false, icon: Icon, className = "", rows = 3 }) => (
  <div className={`space-y-2.5 text-left relative group ${className}`}>
    <label className="text-[10px] font-bold text-[#9B9BAD] uppercase tracking-[2px] ml-1 flex items-center gap-1.5">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <div className="relative">
      {Icon && <Icon className="absolute left-4 top-5 -translate-y-1/2 text-[#9B9BAD] transition-colors group-focus-within:text-[#1B4DA0]" size={14} />}
      <textarea
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        rows={rows}
        className={`w-full bg-white border-[#F4F3EF] border-2 rounded-2xl py-3.5 ${Icon ? 'pl-11' : 'px-5'} pr-5 text-[13px] font-bold text-[#1A1A2E] outline-none focus:border-[#1B4DA0]/30 transition-all placeholder:text-[#BDBDC7] placeholder:font-medium shadow-sm focus:shadow-md resize-none`}
      />
    </div>
  </div>
);

const SelectField = ({ label, name, value, onChange, options, required = false, icon: Icon, className = "" }) => (
  <div className={`space-y-2.5 text-left relative group ${className}`}>
    <label className="text-[10px] font-bold text-[#9B9BAD] uppercase tracking-[2px] ml-1 flex items-center gap-1.5">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <div className="relative">
      {Icon && <Icon className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9B9BAD] transition-colors group-focus-within:text-[#1B4DA0]" size={14} />}
      <select
        name={name}
        value={value}
        onChange={onChange}
        className={`w-full bg-white border-[#F4F3EF] border-2 rounded-2xl py-3.5 ${Icon ? 'pl-11' : 'px-5'} pr-10 text-[13px] font-bold text-[#1A1A2E] outline-none focus:border-[#1B4DA0]/30 transition-all appearance-none cursor-pointer shadow-sm focus:shadow-md`}
      >
        <option value="" disabled>Select {label}</option>
        {options.map((opt, idx) => (
          <option key={idx} value={opt}>{opt}</option>
        ))}
      </select>
      <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
        <FiChevronDown className="text-[#9B9BAD]" size={16} />
      </div>
    </div>
  </div>
);

const initialFormState = {
  companyName: '',
  ownerName: '',
  spocName: '',
  strengthOfEmployees: '',
  email: '',
  phone: '',
  industryDropdown: '',
  customIndustry: '',
  sourceDropdown: '',
  customSource: '',
  reasonDropdown: '',
  customReason: '',
  location: '',
  notes: ''
};

const LeadOnboardingForm = ({ isOpen, onClose, onComplete, initialData = null }) => {
  const [submitting, setSubmitting] = useState(false);
  const isEdit = !!initialData;

  const [formData, setFormData] = useState(initialFormState);

  // Restore draft if available on open
  useEffect(() => {
    if (initialData && isOpen) {
      const standardIndustries = ['Technology', 'Healthcare', 'Finance', 'Manufacturing', 'Retail', 'Education', 'Other'];
      const isOtherIndustry = initialData.industry && !standardIndustries.includes(initialData.industry);

      const standardSources = ['LinkedIn', 'Referral', 'Cold Email', 'Website', 'Direct Walk-in'];
      const isOtherSource = initialData.source && !standardSources.includes(initialData.source);

      const standardReasons = ['Recruitment', 'Operation', 'Recruitment + Operation', 'HR Services'];
      const isOtherReason = initialData.reason && !standardReasons.includes(initialData.reason);

      setFormData({
        ...initialFormState,
        ...initialData,
        leadId: initialData._id || initialData.id,
        ownerName: initialData.ownerName || initialData.owner || '',
        spocName: initialData.spocName || initialData.contactPerson || '',
        industryDropdown: isOtherIndustry ? 'Other' : (initialData.industry || ''),
        customIndustry: (isOtherIndustry && initialData.industry !== 'Other') ? initialData.industry : '',
        sourceDropdown: isOtherSource ? 'Other' : (initialData.source || ''),
        customSource: isOtherSource ? initialData.source : '',
        reasonDropdown: isOtherReason ? 'Other' : (initialData.reason || ''),
        customReason: isOtherReason ? initialData.reason : ''
      });
    } else if (isOpen) {
      const draft = localStorage.getItem('lead_onboarding_draft');
      if (draft) {
        try {
          const parsed = JSON.parse(draft);
          setFormData(parsed);
          toast.success("Saved draft restored! 📝", { id: 'draft-restore' });
        } catch (e) {
          setFormData(initialFormState);
        }
      } else {
        setFormData(initialFormState);
      }
    }
  }, [initialData, isOpen]);

  // Auto-save form draft on change
  useEffect(() => {
    if (!isEdit && isOpen) {
      const hasValue = Object.entries(formData).some(([key, val]) => {
        if (key === 'value') return false;
        return val !== '' && val !== null && val !== undefined;
      });
      if (hasValue) {
        localStorage.setItem('lead_onboarding_draft', JSON.stringify(formData));
      } else {
        localStorage.removeItem('lead_onboarding_draft');
      }
    }
  }, [formData, isEdit, isOpen]);

  const handleInputChange = (e) => {
    let { name, value, type, checked } = e.target;
    if (name === 'phone') {
      value = value.replace(/\D/g, '').slice(0, 10);
    }
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const validateForm = () => {
    const required = ['companyName'];
    for (const field of required) {
      if (!formData[field]) {
        toast.error(`${field.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())} is required`);
        return false;
      }
    }
    if (formData.phone && formData.phone.length !== 10) {
      toast.error("Phone number must be exactly 10 digits");
      return false;
    }
    return true;
  };

  const handleSubmit = async (keepOpen = false) => {
    if (!validateForm()) return;

    try {
      setSubmitting(true);
      const finalIndustry = formData.industryDropdown === 'Other' ? formData.customIndustry : formData.industryDropdown;
      const finalSource = formData.sourceDropdown === 'Other' ? formData.customSource : formData.sourceDropdown;
      const finalReason = formData.reasonDropdown === 'Other' ? formData.customReason : formData.reasonDropdown;
      
      const dataToSubmit = {
        companyName: formData.companyName,
        owner: formData.ownerName || '',
        contactPerson: formData.spocName || '',
        email: formData.email,
        phone: formData.phone,
        value: formData.value || 0,
        strengthOfEmployees: formData.strengthOfEmployees || '',
        segment: finalIndustry || 'General',
        source: finalSource || '',
        reason: finalReason || '',
        notes: formData.notes
      };

      let response;
      if (isEdit) {
        response = await updateLead(formData.leadId, dataToSubmit);
        toast.success("Lead updated in database successfully! ✨");
      } else {
        response = await createLead(dataToSubmit);
        toast.success("Lead added to database successfully! 🎉");
      }
      
      const savedLead = response && response.data ? response.data : null;
      if (onComplete && savedLead) {
        onComplete({
          id: savedLead.id,
          companyName: savedLead.companyName,
          ownerName: savedLead.owner || 'N/A',
          spocName: savedLead.contactPerson || 'N/A',
          strengthOfEmployees: savedLead.strengthOfEmployees || 'N/A',
          status: savedLead.status || 'Active',
          source: savedLead.source || 'N/A',
          reason: savedLead.reason || 'N/A',
          ...savedLead
        });
      } else if (onComplete) {
        onComplete({
          id: formData.leadId || `lead-${Date.now()}`,
          companyName: dataToSubmit.companyName,
          ownerName: dataToSubmit.owner || 'N/A',
          spocName: dataToSubmit.contactPerson || 'N/A',
          strengthOfEmployees: dataToSubmit.strengthOfEmployees || 'N/A',
          status: 'Active',
          source: dataToSubmit.source || 'N/A',
          reason: dataToSubmit.reason || 'N/A',
          ...dataToSubmit
        });
      }
      
      // Clear draft on successful save
      localStorage.removeItem('lead_onboarding_draft');

      if (keepOpen) {
        setFormData(initialFormState);
      } else {
        onClose();
      }
    } catch (err) {
      console.error('Submission error:', err);
      toast.error(`Failed to ${isEdit ? 'update' : 'add'} lead in database`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSave = () => handleSubmit(false);
  const handleSaveAndAddAnother = () => handleSubmit(true);

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
            className="relative w-full max-w-[800px] bg-white rounded-[40px] shadow-2xl flex flex-col overflow-hidden max-h-[90vh]"
          >
            {/* Header */}
            <div className="px-10 py-8 border-b border-[#F4F3EF] flex items-center justify-between bg-white sticky top-0 z-20">
              <div className="flex items-center gap-5">
                <div>
                  <h2 className="text-2xl font-bold text-[#1A1A2E] tracking-tight font-syne">{isEdit ? 'Edit Lead Details' : 'Add New Lead'}</h2>
                </div>
              </div>
              <button onClick={onClose} className="w-11 h-11 rounded-2xl bg-[#F8F9FA] text-[#9B9BAD] hover:bg-red-50 hover:text-red-500 transition-all flex items-center justify-center shadow-sm">
                <FiX size={22} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-12 py-12 custom-scrollbar space-y-12">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-8">
                <InputField 
                  label="Company Name" 
                  name="companyName" 
                  value={formData.companyName} 
                  onChange={handleInputChange} 
                  placeholder="e.g. Acme Corp" 
                  required 
                  icon={FiBriefcase}
                />
                <InputField 
                  label="Owner Name" 
                  name="ownerName" 
                  value={formData.ownerName} 
                  onChange={handleInputChange} 
                  placeholder="e.g. Jane Doe" 
                  icon={FiUser}
                />
                <InputField 
                  label="SPOC Name" 
                  name="spocName" 
                  value={formData.spocName} 
                  onChange={handleInputChange} 
                  placeholder="e.g. John Smith" 
                  icon={FiUser}
                />
                <InputField 
                  label="Email Address" 
                  name="email" 
                  value={formData.email} 
                  onChange={handleInputChange} 
                  placeholder="e.g. jane@acme.com" 
                  type="email"
                  icon={FiMail}
                />
                <InputField 
                  label="Phone Number" 
                  name="phone" 
                  value={formData.phone} 
                  onChange={handleInputChange} 
                  placeholder="e.g. 6378865094" 
                  type="tel"
                  icon={FiPhone}
                />
                <SelectField 
                  label="Industry" 
                  name="industryDropdown" 
                  value={formData.industryDropdown} 
                  onChange={handleInputChange} 
                  options={['Technology', 'Healthcare', 'Finance', 'Manufacturing', 'Retail', 'Education', 'Other']}
                  icon={FiTarget}
                />
                {formData.industryDropdown === 'Other' && (
                  <InputField 
                    label="Specify Other Industry" 
                    name="customIndustry" 
                    value={formData.customIndustry} 
                    onChange={handleInputChange} 
                    placeholder="e.g. Aerospace, Logistics" 
                    required 
                    icon={FiTarget}
                  />
                )}
                <InputField 
                  label="Location" 
                  name="location" 
                  value={formData.location} 
                  onChange={handleInputChange} 
                  placeholder="e.g. New York, USA" 
                  icon={FiMapPin}
                />
                <InputField 
                  label="Strength of Employees" 
                  name="strengthOfEmployees" 
                  value={formData.strengthOfEmployees} 
                  onChange={handleInputChange} 
                  placeholder="e.g. 50" 
                  type="number"
                  icon={FiUsers}
                />
                <SelectField 
                  label="Lead Source" 
                  name="sourceDropdown" 
                  value={formData.sourceDropdown} 
                  onChange={handleInputChange} 
                  options={['LinkedIn', 'Referral', 'Cold Email', 'Website', 'Direct Walk-in', 'Other']}
                  icon={FiGlobe}
                />
                {formData.sourceDropdown === 'Other' && (
                  <InputField 
                    label="Custom Lead Source" 
                    name="customSource" 
                    value={formData.customSource} 
                    onChange={handleInputChange} 
                    placeholder="Enter custom lead source" 
                    required 
                    icon={FiGlobe}
                  />
                )}
                <SelectField 
                  label="Reason for Lead" 
                  name="reasonDropdown" 
                  value={formData.reasonDropdown} 
                  onChange={handleInputChange} 
                  options={['Recruitment', 'Operation', 'Recruitment + Operation', 'HR Services', 'Other']}
                  icon={FiTarget}
                />
                {formData.reasonDropdown === 'Other' && (
                  <InputField 
                    label="Custom Reason for Lead" 
                    name="customReason" 
                    value={formData.customReason} 
                    onChange={handleInputChange} 
                    placeholder="Enter custom reason" 
                    required 
                    icon={FiTarget}
                  />
                )}
                <TextareaField 
                  label="Primary Requirement / Notes" 
                  name="notes" 
                  value={formData.notes} 
                  onChange={handleInputChange} 
                  placeholder="Add any specific requirements or notes about this lead..." 
                  icon={FiAlignLeft}
                  className="md:col-span-2"
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
                {!isEdit && (
                  <button
                    type="button"
                    onClick={handleSaveAndAddAnother}
                    disabled={submitting}
                    className="flex items-center gap-3 px-8 py-4 border-2 border-[#1B4DA0] text-[#1B4DA0] font-black uppercase tracking-widest text-[11px] rounded-[20px] hover:bg-[#1B4DA0]/5 transition-all active:scale-95 disabled:opacity-50"
                  >
                    {submitting ? 'Saving...' : 'Save & Add Another'} <FiSave size={18} />
                  </button>
                )}
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={submitting}
                  className="flex items-center gap-3 px-12 py-4 bg-[#1B4DA0] text-white font-black uppercase tracking-widest text-[12px] rounded-[20px] hover:bg-[#153D80] transition-all shadow-xl shadow-blue-500/20 active:scale-95 disabled:opacity-50"
                >
                  {submitting ? 'Saving...' : (isEdit ? 'Save Changes' : 'Add Lead')} <FiCheck size={20} />
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

export default LeadOnboardingForm;
