import React, { useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiUsers, FiBriefcase, FiTarget, FiDollarSign, FiPlus, FiX, FiCheck, FiChevronRight, 
  FiTrash2, FiClock, FiShield, FiFileText, FiTag, FiUpload, FiActivity, FiDatabase,
  FiGlobe, FiPhone, FiMail, FiUser, FiInfo, FiCheckCircle, FiLayout, FiTrash, FiMapPin,
  FiCloudLightning, FiFile, FiChevronDown
} from 'react-icons/fi';
import { toast } from 'react-hot-toast';

const ClientOnboardingForm = ({ isOpen, onClose, onComplete }) => {
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [files, setFiles] = useState([]);
  const fileInputRef = useRef(null);
  
  const [formData, setFormData] = useState({
    // Step 1: Information
    companyName: '',
    industry: '',
    website: '',
    location: '',
    contactPerson: '',
    contactEmail: '',
    contactPhone: '',
    
    // Step 2: Documents (Handled via files state)
    
    // Step 3: Details
    assignedKAM: '',
    valuation: '',
    serviceTier: 'Standard',
    portalAccess: true,
    initialPassword: Math.random().toString(36).slice(-8).toUpperCase()
  });

  const steps = [
    { n: 1, title: 'Information', icon: <FiInfo /> },
    { n: 2, title: 'Documents', icon: <FiFile /> },
    { n: 3, title: 'Details', icon: <FiTarget /> }
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileUpload = (e) => {
    const newFiles = Array.from(e.target.files);
    setFiles(prev => [...prev, ...newFiles]);
    toast.success(`${newFiles.length} file(s) added`);
  };

  const removeFile = (index) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const nextStep = () => setStep(s => Math.min(s + 1, 3));
  const prevStep = () => setStep(s => Math.max(s - 1, 1));

  const handleSubmit = async () => {
    if (!formData.companyName || !formData.contactEmail) {
      toast.error('Company Name and Contact Email are mandatory');
      return;
    }
    
    setSubmitting(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    setSubmitting(false);
    
    const finalData = {
      ...formData,
      industry: formData.industry === 'Other' ? (formData.otherIndustry || 'Other') : formData.industry,
      files
    };
    
    onComplete(finalData);
    onClose();
  };

  const InputField = ({ label, name, value, onChange, placeholder, type = "text", required = false }) => (
    <div className="space-y-1.5 text-left">
      <label className="text-[10px] font-black text-[#6B7280] uppercase tracking-[2px] pl-1">{label} {required && "*"}</label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full bg-[#F9F8F6] border border-[#E5E7EB] rounded-2xl py-4 px-6 text-[14px] font-semibold text-[#1F2937] outline-none focus:bg-white focus:ring-2 focus:ring-[#1B4DA0]/5 focus:border-[#1B4DA0] transition-all placeholder:text-[#9CA3AF]"
      />
    </div>
  );

  const SelectField = ({ label, name, value, onChange, options }) => (
    <div className="space-y-1.5 text-left">
      <label className="text-[10px] font-black text-[#6B7280] uppercase tracking-[2px] pl-1">{label}</label>
      <div className="relative group">
        <select
          name={name}
          value={value}
          onChange={onChange}
          className="w-full bg-[#F9F8F6] border border-[#E5E7EB] rounded-2xl py-4 pl-6 pr-10 text-[14px] font-semibold text-[#1F2937] outline-none focus:bg-white focus:border-[#1B4DA0] transition-all appearance-none cursor-pointer"
        >
          {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
        </select>
        <FiChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 text-[#9CA3AF] pointer-events-none" size={16} />
      </div>
    </div>
  );

  const StepIndicator = () => (
    <div className="flex items-center justify-between mb-12 px-4 max-w-2xl mx-auto">
      {steps.map((s, idx) => (
        <React.Fragment key={s.n}>
          <div className="flex flex-col items-center gap-3 relative z-10">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500 shadow-sm ${step >= s.n ? 'bg-[#1B4DA0] text-white' : 'bg-white border border-[#E5E7EB] text-[#9CA3AF]'}`}>
              {step > s.n ? <FiCheck size={20} /> : s.icon}
            </div>
            <span className={`text-[10px] font-black uppercase tracking-widest ${step >= s.n ? 'text-[#1B4DA0]' : 'text-[#9CA3AF]'}`}>{s.title}</span>
          </div>
          {idx < steps.length - 1 && (
            <div className="flex-1 h-[2px] bg-[#E5E7EB] -mt-8 mx-4">
              <motion.div 
                className="h-full bg-[#1B4DA0]"
                initial={{ width: 0 }}
                animate={{ width: step > s.n ? '100%' : '0%' }}
                transition={{ duration: 0.5 }}
              />
            </div>
          )}
        </React.Fragment>
      ))}
    </div>
  );

  const modalContent = (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[999999] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-[#1A1A2E]/60 backdrop-blur-md"
          />
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 40 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            className="relative w-full max-w-[700px] bg-white rounded-[40px] shadow-2xl overflow-hidden flex flex-col max-h-[95vh] z-10"
          >
            {/* Header matching reference */}
            <div className="px-12 py-10 flex items-center justify-between">
              <h2 className="text-2xl font-black text-[#1F2937] tracking-tight" style={{ fontFamily: '"Inter", sans-serif' }}>Add New Client</h2>
              <button onClick={onClose} className="w-10 h-10 rounded-xl bg-[#F3F4F6] text-[#6B7280] hover:bg-rose-50 hover:text-rose-500 transition-all flex items-center justify-center">
                <FiX size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-12 pt-0 custom-scrollbar">
              <StepIndicator />

              <form onSubmit={e => e.preventDefault()} className="space-y-6">
                <AnimatePresence mode="wait">
                  {step === 1 && (
                    <motion.div
                      key="step1"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-6"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="col-span-full">
                          <InputField label="Business Name" name="companyName" value={formData.companyName} onChange={handleInputChange} placeholder="e.g. Google India" required />
                        </div>
                        <InputField label="Business Website" name="website" value={formData.website} onChange={handleInputChange} placeholder="https://..." />
                        <SelectField 
                          label="Business Sector" 
                          name="industry" 
                          value={formData.industry} 
                          onChange={handleInputChange} 
                          options={['Select Industry', 'Fintech', 'Healthcare', 'E-commerce', 'Logistics', 'Real Estate', 'Manufacturing', 'Education', 'Technology', 'Services', 'Other']} 
                        />
                        {formData.industry === 'Other' && (
                          <div className="col-span-full">
                            <InputField 
                              label=" Specify Business Sector" 
                              name="otherIndustry" 
                              value={formData.otherIndustry || ''} 
                              onChange={handleInputChange} 
                              placeholder="Type your industry name" 
                            />
                          </div>
                        )}
                        <InputField label="Location" name="location" value={formData.location} onChange={handleInputChange} placeholder="City, State" />
                        <div className="col-span-full border-t border-[#F3F4F6] pt-6 mt-2">
                          <p className="text-[11px] font-black text-[#9CA3AF] uppercase tracking-widest mb-4">Primary Contact Point</p>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <InputField label="SPOC Name" name="contactPerson" value={formData.contactPerson} onChange={handleInputChange} placeholder="Contact Person" />
                            <InputField label="Email Address" name="contactEmail" value={formData.contactEmail} onChange={handleInputChange} placeholder="email@company.com" type="email" required />
                            <InputField label="Phone Number" name="contactPhone" value={formData.contactPhone} onChange={handleInputChange} placeholder="+91 00000 00000" />
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {step === 2 && (
                    <motion.div
                      key="step2"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-8"
                    >
                      <div className="space-y-4">
                        <label className="text-[10px] font-black text-[#6B7280] uppercase tracking-[2px] pl-1 block text-left">Upload MOU / KYC Documents</label>
                        <div 
                          onClick={() => fileInputRef.current.click()}
                          className="border-2 border-dashed border-[#E5E7EB] rounded-[32px] p-12 flex flex-col items-center justify-center gap-4 bg-[#F9F8F6] hover:bg-[#F3F4F6] hover:border-[#1B4DA0] transition-all cursor-pointer group"
                        >
                          <div className="w-16 h-16 rounded-2xl bg-white flex items-center justify-center text-[#1B4DA0] shadow-sm group-hover:scale-110 transition-transform">
                            <FiUpload size={24} />
                          </div>
                          <div className="text-center">
                            <p className="text-[14px] font-bold text-[#1F2937]">Drag & drop or <span className="text-[#1B4DA0] underline">click to browse</span></p>
                            <p className="text-[11px] text-[#9CA3AF] mt-1 font-medium">Support PDF, JPG, PNG (Max 10MB)</p>
                          </div>
                          <input 
                            type="file" 
                            ref={fileInputRef} 
                            onChange={handleFileUpload} 
                            multiple 
                            className="hidden" 
                          />
                        </div>

                        {files.length > 0 && (
                          <div className="grid grid-cols-1 gap-3">
                            {files.map((f, i) => (
                              <div key={i} className="flex items-center justify-between p-4 bg-white border border-[#E5E7EB] rounded-2xl shadow-sm">
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#1B4DA0] flex items-center justify-center">
                                    <FiFileText size={18} />
                                  </div>
                                  <div className="text-left">
                                    <p className="text-sm font-bold text-[#1F2937] truncate max-w-[200px]">{f.name}</p>
                                    <p className="text-[10px] text-[#9CA3AF] font-bold uppercase tracking-widest">{(f.size / 1024 / 1024).toFixed(2)} MB</p>
                                  </div>
                                </div>
                                <button onClick={() => removeFile(i)} className="p-2 text-[#9CA3AF] hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all">
                                  <FiTrash2 size={16} />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="p-6 bg-amber-50 rounded-[24px] border border-amber-100 flex gap-4 text-left">
                        <FiInfo size={18} className="text-amber-500 shrink-0 mt-0.5" />
                        <p className="text-[12px] font-medium text-amber-800 leading-relaxed">
                          Documents uploaded here will be encrypted and stored securely in the client portal for future compliance audits.
                        </p>
                      </div>
                    </motion.div>
                  )}

                  {step === 3 && (
                    <motion.div
                      key="step3"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-8"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <SelectField label="Assigned KAM" name="assignedKAM" value={formData.assignedKAM} onChange={handleInputChange} options={['Select KAM', 'Sanya Gupta', 'Rahul Mehta', 'Priya Mehta', 'Siddharth Singh']} />
                        <InputField label="Deal Valuation" name="valuation" value={formData.valuation} onChange={handleInputChange} placeholder="e.g. ₹ 25,00,000" />
                        <SelectField label="Service Tier" name="serviceTier" value={formData.serviceTier} onChange={handleInputChange} options={['Standard', 'Premium', 'Enterprise']} />
                        <div className="space-y-4 pt-4 text-left">
                          <label className="text-[10px] font-black text-[#6B7280] uppercase tracking-[2px] pl-1 block">Portal Settings</label>
                          <div className="flex items-center gap-4 p-5 bg-[#F9F8F6] rounded-2xl border border-[#E5E7EB]">
                            <div className="flex-1">
                              <p className="text-sm font-bold text-[#1F2937]">Auto-generate Access</p>
                              <p className="text-[11px] font-medium text-[#9CA3AF]">Generate credentials on save</p>
                            </div>
                            <div className="px-4 py-2 bg-white border border-[#E5E7EB] rounded-xl text-[12px] font-black text-[#1B4DA0] tracking-widest shadow-sm">
                              {formData.initialPassword}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="p-6 bg-blue-50 rounded-[24px] border border-blue-100 flex gap-4 text-left">
                        <FiCheckCircle size={18} className="text-[#1B4DA0] shrink-0 mt-0.5" />
                        <p className="text-[12px] font-medium text-[#1B4DA0] leading-relaxed">
                          By completing this onboarding, you agree to the platform's service terms and data privacy protocols.
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </form>
            </div>

            {/* Footer with clean styling */}
            <div className="p-12 pt-6 bg-white border-t border-[#F3F4F6] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                 
              </div>
              <div className="flex gap-4">
                {step > 1 && (
                  <button
                    type="button"
                    onClick={prevStep}
                    className="h-14 px-8 rounded-2xl text-[#6B7280] text-[13px] font-bold hover:bg-[#F9FAFB] transition-all"
                  >
                    Back
                  </button>
                )}
                {step < 3 ? (
                  <button
                    type="button"
                    onClick={nextStep}
                    className="h-14 px-10 bg-[#1B4DA0] text-white text-[13px] font-bold rounded-2xl shadow-lg shadow-blue-500/20 hover:bg-[#153D80] transition-all flex items-center gap-2"
                  >
                    Save & Continue <FiChevronRight size={16} />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={submitting}
                    className={`h-14 px-10 bg-emerald-500 text-white text-[13px] font-bold rounded-2xl shadow-lg shadow-emerald-500/20 hover:bg-emerald-600 transition-all flex items-center gap-2 ${submitting ? 'opacity-50 grayscale' : ''}`}
                  >
                    {submitting ? 'Creating...' : 'Finish Onboarding'} <FiCheck size={16} />
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );

  if (typeof document !== 'undefined') {
    return createPortal(modalContent, document.body);
  }
  return null;
};

export default ClientOnboardingForm;
