import React, { useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiX, FiCheck, FiChevronDown, FiChevronRight, FiInfo, FiFileText, FiActivity 
} from 'react-icons/fi';
import { toast } from 'react-hot-toast';

const SectionHeader = ({ num, title, badge = "Required", skippable = false }) => (
  <div className="flex items-center gap-3 mb-6 mt-10 first:mt-0">
    <div className="flex items-center gap-2">
      <span className="text-[13px] font-black text-[#9B9BAD]">{num}.</span>
      <h3 className="text-[15px] font-black text-[#1A1A2E] uppercase tracking-tight">{title}</h3>
    </div>
    <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest ${skippable ? 'bg-[#F4F3EF] text-[#9B9BAD]' : 'bg-[#1B4DA0]/10 text-[#1B4DA0]'}`}>
      {badge}
    </span>
  </div>
);

const InputField = ({ label, name, value, onChange, placeholder, type = "text", skippable = false }) => (
  <div className="space-y-1.5 text-left">
    <div className="flex items-center gap-2">
      <label className="text-[11px] font-bold text-[#6B6B7E]">{label}</label>
      {skippable && <span className="px-1.5 py-0.5 rounded bg-[#F4F3EF] text-[8px] font-black text-[#9B9BAD] uppercase tracking-widest">Skippable</span>}
    </div>
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className="w-full bg-[#F8F9FA] border border-[#E5E7EB] rounded-xl py-3 px-5 text-[13px] font-medium text-[#1A1A2E] outline-none focus:border-[#1B4DA0] transition-all placeholder:text-[#BDBDC7]"
    />
  </div>
);

const SelectField = ({ label, name, value, onChange, options, skippable = false }) => (
  <div className="space-y-1.5 text-left">
    <div className="flex items-center gap-2">
      <label className="text-[11px] font-bold text-[#6B6B7E]">{label}</label>
      {skippable && <span className="px-1.5 py-0.5 rounded bg-[#F4F3EF] text-[8px] font-black text-[#9B9BAD] uppercase tracking-widest">Skippable</span>}
    </div>
    <div className="relative">
      <select
        name={name}
        value={value}
        onChange={onChange}
        className="w-full bg-[#F4F3EF] border border-transparent rounded-xl py-3 pl-5 pr-10 text-[13px] font-bold text-[#1A1A2E] outline-none focus:border-[#1B4DA0] transition-all appearance-none cursor-pointer placeholder:text-[#9B9BAD]"
      >
        {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
      </select>
      <FiChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-[#1B4DA0] pointer-events-none opacity-50" size={16} />
    </div>
  </div>
);

const ToggleGroup = ({ label, value, onChange, options }) => (
  <div className="space-y-1.5 text-left">
    <label className="text-[11px] font-bold text-[#6B6B7E]">{label}</label>
    <div className="flex p-1 bg-[#F4F3EF] rounded-[20px] gap-1 border border-[#F4F3EF]">
      {options.map(opt => (
        <button
          key={opt}
          type="button"
          onClick={() => onChange(opt)}
          className={`flex-1 py-3.5 rounded-[16px] text-[12px] font-bold transition-all flex items-center justify-center gap-2 ${value === opt ? 'bg-white text-[#1B4DA0] shadow-sm border border-[#1B4DA0]/10' : 'text-[#9B9BAD]'}`}
        >
          {value === opt && <div className="w-1.5 h-1.5 rounded-full bg-[#1B4DA0]" />}
          {opt}
        </button>
      ))}
    </div>
  </div>
);

const StepIndicator = ({ step, steps }) => (
  <div className="flex items-center justify-center gap-4 mb-10">
    {steps.map((s, idx) => (
      <React.Fragment key={s.n}>
        <div className="flex flex-col items-center gap-2 relative">
          <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 border-2 ${step >= s.n ? 'bg-[#1B4DA0] border-[#1B4DA0] text-white shadow-lg shadow-blue-500/20' : 'bg-white border-[#F4F3EF] text-[#9B9BAD]'}`}>
            {step > s.n ? <FiCheck size={20} /> : (s.icon ? React.cloneElement(s.icon, { size: 18 }) : s.n)}
          </div>
          <span className={`text-[10px] font-black uppercase tracking-widest ${step >= s.n ? 'text-[#1B4DA0]' : 'text-[#9B9BAD]'}`}>{s.title}</span>
        </div>
        {idx < steps.length - 1 && (
          <div className="w-20 h-[2px] bg-[#F4F3EF] -mt-6">
            <motion.div 
              className="h-full bg-[#1B4DA0]"
              initial={{ width: 0 }}
              animate={{ width: step > s.n ? '100%' : '0%' }}
            />
          </div>
        )}
      </React.Fragment>
    ))}
  </div>
);

const ClientOnboardingForm = ({ isOpen, onClose, onComplete, mode = "minimal", initialData = null }) => {
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    companyName: '',
    industry: 'General',
    location: '',
    city: '',
    pinCode: '',
    serviceType: 'Recruitment',
    spocName: '',
    spocEmail: '',
    spocPhone: '',
    gstNumber: '',
    registeredAddress: '',
    ownerName: '',
    ownerEmail: '',
    agreementType: 'Select agreement',
    agreementEffectiveDate: '',
    feeAmount: '',
    paymentTerms: 'Net 15',
    shopsLicense: '',
    factoryLicense: '',
    msmeRegistered: 'Yes',
    totalEmployees: '',
    payrollCycle: 'Monthly',
    pfApplicable: 'Yes',
    esicApplicable: 'Yes',
    assignKAM: 'Priya Mehta',
    leadSource: 'Reference',
    onboardingNotes: ''
  });

  // Update form data when initialData changes
  React.useEffect(() => {
    if (initialData) {
      setFormData({
        companyName: initialData.companyName || '',
        industry: initialData.industry || 'General',
        location: initialData.location || '',
        city: initialData.city || '',
        pinCode: initialData.pinCode || '', 
        serviceType: initialData.serviceType || 'Recruitment',
        spocName: initialData.spocName || '',
        spocEmail: initialData.spocEmail || initialData.email || '',
        spocPhone: initialData.spocPhone || initialData.phone || '',
        gstNumber: initialData.gstNumber || '',
        registeredAddress: initialData.registeredAddress || initialData.location || '',
        ownerName: initialData.ownerName || '',
        ownerEmail: initialData.ownerEmail || '',
        agreementType: initialData.agreementType || 'Select agreement',
        agreementEffectiveDate: initialData.agreementEffectiveDate || '',
        feeAmount: initialData.feeAmount || '',
        paymentTerms: initialData.paymentTerms || 'Net 15',
        shopsLicense: initialData.shopsLicense || '',
        factoryLicense: initialData.factoryLicense || '',
        msmeRegistered: initialData.msmeRegistered || 'Yes',
        totalEmployees: initialData.totalEmployees || '',
        payrollCycle: initialData.payrollCycle || 'Monthly',
        pfApplicable: initialData.pfApplicable || 'Yes',
        esicApplicable: initialData.esicApplicable || 'Yes',
        assignKAM: initialData.assignKAM || 'Priya Mehta',
        leadSource: initialData.leadSource || 'Reference',
        onboardingNotes: initialData.onboardingNotes || ''
      });
      setStep(1); // Reset step when new data loaded
    }
  }, [initialData]);

  const steps = mode === "minimal" 
    ? [{ n: 1, title: 'Basic Info', icon: <FiInfo /> }]
    : [
        { n: 1, title: 'Identity', icon: <FiInfo /> },
        { n: 2, title: 'Docs', icon: <FiFileText /> },
        { n: 3, title: 'Detail', icon: <FiActivity /> }
      ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const nextStep = () => {
    if (step === 1 && !formData.companyName) {
      toast.error('Company Name is required to proceed');
      return;
    }
    setStep(s => Math.min(s + 1, steps.length));
  };

  const prevStep = () => setStep(s => Math.max(s - 1, 1));

  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      await onComplete(formData);
      onClose();
    } catch (err) {
      toast.error("Failed to save client details");
    } finally {
      setSubmitting(false);
    }
  };

  const modalContent = (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[999999] flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-[#1A1A2E]/40 backdrop-blur-sm"
          />
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            className="relative w-full max-w-[800px] bg-white rounded-[40px] shadow-2xl border border-[#F4F3EF] flex flex-col overflow-hidden max-h-[90vh]"
          >
            <div className="px-10 py-6 border-b border-[#F4F3EF] flex items-center justify-between bg-white">
              <div className="flex items-center gap-4">
                <h2 className="text-[18px] font-black text-[#1A1A2E] tracking-tight">
                  {mode === 'minimal' ? 'Add New Client' : 'Finalize Client Onboarding'}
                </h2>
              </div>
              <button onClick={onClose} className="w-8 h-8 rounded-full bg-[#F4F3EF] text-[#9B9BAD] hover:bg-red-50 hover:text-red-500 transition-all flex items-center justify-center">
                <FiX size={18} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-10 custom-scrollbar bg-white">

              <div className="min-h-[450px]">
                <AnimatePresence mode="wait">
                  {mode === "minimal" ? (
                    <motion.div key="minimal" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                      <SectionHeader num="1" title="Basic Client Info" />
                      <div className="grid grid-cols-1 gap-5">
                        <InputField label="Company name" name="companyName" value={formData.companyName} onChange={handleInputChange} placeholder="Registered company name" />
                        <div className="grid grid-cols-2 gap-5">
                          <InputField label="Industry" name="industry" value={formData.industry} onChange={handleInputChange} placeholder="e.g. IT, Healthcare" />
                          <InputField label="Location" name="location" value={formData.location} onChange={handleInputChange} placeholder="Location" />
                          <InputField label="City" name="city" value={formData.city} onChange={handleInputChange} placeholder="City" />
                          <InputField label="Pin Code" name="pinCode" value={formData.pinCode} onChange={handleInputChange} placeholder="Pin Code" />
                        </div>
                        <SelectField 
                          label="Service Type" 
                          name="serviceType" 
                          value={formData.serviceType} 
                          onChange={handleInputChange} 
                          options={['Recruitment', 'Operation', 'Recruitment + Operation']} 
                        />
                      </div>

                      <SectionHeader num="2" title="Contact Details" />
                      <div className="grid grid-cols-1 gap-5">
                        <InputField label="SPOC Name" name="spocName" value={formData.spocName} onChange={handleInputChange} placeholder="Name" />
                        <InputField label="SPOC Email" name="spocEmail" value={formData.spocEmail} onChange={handleInputChange} placeholder="spoc@company.com" />
                        <InputField label="SPOC Phone" name="spocPhone" value={formData.spocPhone} onChange={handleInputChange} placeholder="+91 XXXXX XXXXX" />
                      </div>
                    </motion.div>
                  ) : (
                    <>
                      {step === 1 && (
                        <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-2">
                          <SectionHeader num="1" title="Company Identity" />
                          <div className="grid grid-cols-1 gap-5">
                            <InputField label="Company name" name="companyName" value={formData.companyName} onChange={handleInputChange} placeholder="Registered company name" />
                            <div className="grid grid-cols-2 gap-5">
                              <InputField label="GST number" name="gstNumber" value={formData.gstNumber} onChange={handleInputChange} placeholder="27AABCU9603R1ZX" />
                            </div>
                          </div>

                          <SectionHeader num="2" title="Address Details" />
                          <div className="grid grid-cols-2 gap-5">
                            <div className="col-span-full">
                              <InputField label="Registered address" name="registeredAddress" value={formData.registeredAddress} onChange={handleInputChange} placeholder="Full address" />
                            </div>
                            <InputField label="City" name="city" value={formData.city} onChange={handleInputChange} placeholder="City" />
                            <InputField label="PIN code" name="pinCode" value={formData.pinCode} onChange={handleInputChange} placeholder="400001" />
                          </div>

                          <SectionHeader num="3" title="Key Contacts" />
                          <div className="grid grid-cols-2 gap-5">
                            <InputField label="Owner Name" name="ownerName" value={formData.ownerName} onChange={handleInputChange} placeholder="Name" />
                            <InputField label="Owner Email" name="ownerEmail" value={formData.ownerEmail} onChange={handleInputChange} placeholder="owner@email.com" />
                            <InputField label="SPOC Name" name="spocName" value={formData.spocName} onChange={handleInputChange} placeholder="Name" />
                            <InputField label="SPOC Phone" name="spocPhone" value={formData.spocPhone} onChange={handleInputChange} placeholder="+91 XXXXX XXXXX" />
                          </div>
                        </motion.div>
                      )}

                      {step === 2 && (
                        <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-2">
                          <SectionHeader num="4" title="Agreement & Documents" />
                          <div className="grid grid-cols-2 gap-5">
                            <SelectField label="Agreement type" name="agreementType" value={formData.agreementType} onChange={handleInputChange} options={['Select agreement', 'MSA', 'SLA']} />
                            <InputField label="Effective date" name="agreementEffectiveDate" value={formData.agreementEffectiveDate} onChange={handleInputChange} type="date" />
                            <InputField label="Fee % / amount" name="feeAmount" value={formData.feeAmount} onChange={handleInputChange} placeholder="e.g. 8.33%" />
                            <SelectField label="Payment terms" name="paymentTerms" value={formData.paymentTerms} onChange={handleInputChange} options={['Net 15', 'Net 30', 'Net 45']} />
                          </div>

                          <SectionHeader num="5" title="Compliance Licenses" />
                          <div className="grid grid-cols-2 gap-5">
                            <InputField label="Shops license" name="shopsLicense" value={formData.shopsLicense} onChange={handleInputChange} placeholder="No." skippable />
                            <InputField label="Factory license" name="factoryLicense" value={formData.factoryLicense} onChange={handleInputChange} placeholder="No." skippable />
                            <div className="col-span-full">
                              <ToggleGroup 
                                label="MSME registered?" 
                                value={formData.msmeRegistered} 
                                onChange={(val) => handleInputChange({ target: { name: 'msmeRegistered', value: val }})} 
                                options={['Yes', 'No']} 
                              />
                            </div>
                          </div>
                        </motion.div>
                      )}

                      {step === 3 && (
                        <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-2">
                          <SectionHeader num="6" title="Workforce & Payroll" />
                          <div className="grid grid-cols-2 gap-5">
                            <InputField label="Total employees" name="totalEmployees" value={formData.totalEmployees} onChange={handleInputChange} placeholder="e.g. 500" />
                            <SelectField label="Payroll cycle" name="payrollCycle" value={formData.payrollCycle} onChange={handleInputChange} options={['Monthly', 'Bi-weekly']} />
                            <ToggleGroup 
                              label="PF applicable" 
                              value={formData.pfApplicable} 
                              onChange={(val) => handleInputChange({ target: { name: 'pfApplicable', value: val }})} 
                              options={['Yes', 'No']} 
                            />
                            <ToggleGroup 
                              label="ESIC applicable" 
                              value={formData.esicApplicable} 
                              onChange={(val) => handleInputChange({ target: { name: 'esicApplicable', value: val }})} 
                              options={['Yes', 'No']} 
                            />
                          </div>

                          <SectionHeader num="7" title="CRM Assignment" />
                          <div className="grid grid-cols-2 gap-5">
                            <SelectField label="Assign KAM" name="assignKAM" value={formData.assignKAM} onChange={handleInputChange} options={['Priya Mehta', 'Rahul Mehta']} />
                            <SelectField label="Lead Source" name="leadSource" value={formData.leadSource} onChange={handleInputChange} options={['Reference', 'Direct']} />
                            <div className="col-span-full">
                              <InputField label="Onboarding notes" name="onboardingNotes" value={formData.onboardingNotes} onChange={handleInputChange} placeholder="Notes..." skippable />
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </>
                  )}
                </AnimatePresence>
              </div>
            </div>

            <div className="px-10 py-8 bg-white border-t border-[#F4F3EF] flex items-center justify-between relative z-[100]">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${step === steps.length ? 'bg-emerald-500 animate-pulse' : 'bg-[#1B4DA0]'}`} />
                <p className="text-[10px] font-bold text-[#9B9BAD] uppercase tracking-widest italic">
                  {step === steps.length ? 'Ready to finish' : 'Fill info to proceed'}
                </p>
              </div>
              <div className="flex gap-4">
                <button 
                  type="button"
                  onClick={onClose} 
                  className="px-8 py-3.5 rounded-[20px] text-[#6B6B7E] font-black uppercase tracking-widest text-[11px] border border-[#F4F3EF] hover:bg-[#F8F9FA] transition-all"
                >
                  Cancel
                </button>
                {step > 1 && (
                  <button 
                    type="button"
                    onClick={prevStep} 
                    className="px-8 py-3.5 rounded-[20px] text-[#1B4DA0] font-black uppercase tracking-widest text-[11px] border border-[#F4F3EF] hover:bg-[#F8F9FA] transition-all"
                  >
                    Back
                  </button>
                )}
                {step < steps.length ? (
                  <button 
                    type="button"
                    onClick={nextStep} 
                    className="px-10 py-3.5 bg-[#1B4DA0] text-white font-black uppercase tracking-widest text-[11px] rounded-[20px] hover:bg-[#153D80] transition-all flex items-center gap-3 shadow-xl shadow-blue-500/20 active:scale-95"
                  >
                    Next Step <FiChevronRight />
                  </button>
                ) : (
                  <button 
                    type="button"
                    onClick={handleSubmit} 
                    disabled={submitting} 
                    className="px-12 py-4 bg-[#1B4DA0] text-white font-black uppercase tracking-widest text-[12px] rounded-[20px] hover:bg-[#153D80] transition-all flex items-center gap-3 shadow-xl shadow-blue-500/20 active:scale-95 disabled:opacity-50"
                  >
                    {submitting ? 'Processing...' : (mode === 'minimal' ? 'Add Client' : 'Finish Onboarding')} <FiCheck size={18} />
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
