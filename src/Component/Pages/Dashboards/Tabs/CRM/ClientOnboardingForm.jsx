import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiX, FiCheck, FiChevronDown, FiChevronRight, FiInfo, FiFileText, FiActivity,
  FiMapPin, FiBriefcase, FiUsers, FiDollarSign, FiShield, FiUserCheck, FiUploadCloud,
  FiArrowLeft, FiSave, FiAlertCircle, FiUserPlus, FiUpload, FiCheckCircle
} from 'react-icons/fi';
import { toast } from 'sonner';
import { onboardClient, editClient, createClient } from '../../../service/api';

const STATES_INDIA = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat", "Haryana",
  "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur",
  "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu",
  "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal", "Delhi", "Chandigarh",
  "Jammu and Kashmir", "Ladakh", "Puducherry"
];

const SectionHeader = ({ title, number }) => (
  <div className="flex items-center gap-4 mb-8 mt-10 first:mt-0 pb-3 border-b border-[#F4F3EF]">
    <div className="flex items-center gap-3">
      {number && <span className="text-[14px] font-bold text-[#9B9BAD]">{number}.</span>}
      <h3 className="text-[16px] font-bold text-[#1A1A2E] uppercase tracking-tight font-syne">{title}</h3>
    </div>
  </div>
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
        placeholder={placeholder}
        className={`w-full bg-white border-[#F4F3EF] border-2 rounded-2xl py-3.5 ${Icon ? 'pl-11' : 'px-5'} pr-5 text-[13px] font-bold text-[#1A1A2E] outline-none focus:border-[#1B4DA0]/30 transition-all placeholder:text-[#BDBDC7] placeholder:font-medium shadow-sm focus:shadow-md`}
      />
    </div>
  </div>
);

const SelectField = ({ label, name, value, onChange, options, required = false, icon: Icon }) => (
  <div className="space-y-2.5 text-left relative group">
    <label className="text-[10px] font-bold text-[#9B9BAD] uppercase tracking-[2px] ml-1">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <div className="relative">
      {Icon && <Icon className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9B9BAD] transition-colors group-focus-within:text-[#1B4DA0] z-10" size={14} />}
      <select
        name={name}
        value={value}
        onChange={onChange}
        className={`w-full bg-white border-[#F4F3EF] border-2 rounded-2xl py-3.5 ${Icon ? 'pl-11' : 'px-5'} pr-10 text-[13px] font-bold text-[#1A1A2E] outline-none focus:border-[#1B4DA0]/30 transition-all appearance-none cursor-pointer shadow-sm focus:shadow-md`}
      >
        <option value="">Select {label}</option>
        {options.map(opt => (
          <option key={typeof opt === 'object' ? opt.value : opt} value={typeof opt === 'object' ? opt.value : opt}>
            {typeof opt === 'object' ? opt.label : opt}
          </option>
        ))}
      </select>
      <FiChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-[#1B4DA0] pointer-events-none opacity-50" size={16} />
    </div>
  </div>
);

const FileUpload = ({ label, name, onChange, fileName, required = false }) => (
  <div className="space-y-2.5 text-left relative group">
    <label className="text-[10px] font-bold text-[#9B9BAD] uppercase tracking-[2px] ml-1">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <div className="relative group/file">
      <input type="file" id={name} name={name} onChange={onChange} className="hidden" />
      <label
        htmlFor={name}
        className="flex items-center justify-between p-4 bg-[#F8FAFF] border-2 border-dashed border-[#E2E8F0] rounded-2xl group-hover/file:border-[#1B4DA0]/30 transition-all cursor-pointer"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-[#C5C5D2] group-hover/file:text-[#1B4DA0] transition-all shadow-sm">
            <FiFileText size={20} />
          </div>
          <div className="text-left">
            <p className="text-[11px] font-bold text-[#1A1A2E] truncate max-w-[200px]">{fileName || 'Select File'}</p>
            <p className="text-[9px] font-medium text-[#9B9BAD]">PDF, JPG (Max 2MB)</p>
          </div>
        </div>
        <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-[#9B9BAD] group-hover/file:text-[#1B4DA0] transition-all">
          <FiUpload size={16} />
        </div>
      </label>
    </div>
  </div>
);

const StepIndicator = ({ currentStep }) => {
  const steps = [
    { n: 1, title: 'Identity', icon: <FiBriefcase /> },
    { n: 2, title: 'Commercials', icon: <FiDollarSign /> },
    { n: 3, title: 'Finalize', icon: <FiCheck /> }
  ];

  return (
    <div className="flex items-center justify-between mb-16 px-4 max-w-2xl mx-auto relative">
      <div className="absolute top-5 left-0 right-0 h-[2px] bg-[#F4F3EF] -z-0" />
      <div
        className="absolute top-5 left-0 h-[2px] bg-[#1B4DA0] transition-all duration-500 -z-0"
        style={{ width: currentStep === 1 ? '0%' : currentStep === 2 ? '50%' : '100%' }}
      />
      {steps.map((s) => (
        <div key={s.n} className="relative z-10 flex flex-col items-center gap-3">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 border-2 ${currentStep === s.n ? 'bg-[#1B4DA0] border-[#1B4DA0] text-white shadow-xl shadow-blue-500/20 scale-110' :
            currentStep > s.n ? 'bg-[#1B4DA0] border-[#1B4DA0] text-white' :
              'bg-white border-[#F4F3EF] text-[#9B9BAD]'
            }`}>
            {currentStep > s.n ? <FiCheck size={18} /> : React.cloneElement(s.icon, { size: 18 })}
          </div>
          <span className={`text-[10px] font-black uppercase tracking-widest ${currentStep >= s.n ? 'text-[#1B4DA0]' : 'text-[#9B9BAD]'
            }`}>{s.title}</span>
        </div>
      ))}
    </div>
  );
};

const ClientOnboardingForm = ({ isOpen, onClose, onComplete, initialData = null }) => {
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const formRef = useRef(null);
  const isEdit = !!initialData;

  const initialFormState = {
    companyName: '', cin: '', pan: '', clientType: 'Startup', industry: 'IT & Software', website: '', yearIncorporation: '',
    address: '', city: '', state: '', pinCode: '', country: 'India', sameAsRegistered: false,
    owner1Name: '', owner1Phone: '', owner1Email: '', owner1Designation: '', owner1LinkedIn: '',
    owner2Name: '', owner2Phone: '', owner2Email: '',
    spocName: '', spocPhone: '', spocEmail: '', spocDesignation: '', spocApproval: '', spocBestTime: '',
    agreementType: '', agreementEffectiveDate: '', agreementStartDate: '', agreementVersion: '',
    feeStructure: '', feeValue: '', paymentTerms: '', noticePeriod: '', invoiceDept: '', paymentDays: '',
    exclusivity: 'No', agreementFile: null,
    totalEmployees: '', employeeCategory: '', numLocations: '', workingModel: 'Hybrid',
    payrollFrequency: 'Monthly', salaryMode: 'Bank Transfer', esiApplicable: 'No', pfEsiState: '',
    gratuityApplicable: 'No', payrollSystem: '', attendanceSystem: '', salaryDate: '', salaryBank: '',
    gstApplicable: 'Yes', panTanLabor: '', tradeLicenseAvailable: 'No', tradeLicenseFile: null,
    accountManager: '', region: '', leadSource: '', vertical: '', notes: '',
    confirmOnboarding: false
  };

  const [formData, setFormData] = useState(initialFormState);

  useEffect(() => {
    if (initialData && isOpen) {
      // Map initialData database fields to frontend form fields
      setFormData({
        ...initialFormState,
        ...initialData,
        address: initialData.corporateAddress || initialData.address || '',
        pan: initialData.panNumber || initialData.pan || '',
        cin: initialData.cinNumber || initialData.cin || '',
        owner1Name: initialData.ownerName || initialData.owner1Name || '',
        owner1Email: initialData.ownerEmail || initialData.owner1Email || '',
        owner1Phone: initialData.contactNumber || initialData.owner1Phone || '',
        spocPhone: initialData.spocContact || initialData.spocPhone || '',
        spocEmail: initialData.spocEmail || (initialData.authorizedSignatory?.email) || '',
        feeValue: initialData.feeAmount || initialData.feeValue || '',
        agreementStartDate: initialData.agreementEffectiveDate || initialData.agreementStartDate || '',
        payrollFrequency: initialData.payrollCycle || initialData.payrollFrequency || 'Monthly',
        // Ensure ID is preserved for editing
        clientId: initialData._id || initialData.id,
        confirmOnboarding: true // Pre-confirm for edits usually
      });
      setStep(1);
    } else if (isOpen) {
      setFormData(initialFormState);
      setStep(1);
    }
  }, [initialData, isOpen]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    let processedValue = value;
    
    // PAN Card Validation: Max 10 alphanumeric characters, auto-uppercase
    if (name === 'pan') {
      processedValue = value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 10);
    }
    // PIN Code Validation: Max 6 digits
    else if (name === 'pinCode') {
      processedValue = value.replace(/[^0-9]/g, '').slice(0, 6);
    }
    // Phone Validation: Max 10 digits
    else if (['owner1Phone', 'owner2Phone', 'spocPhone'].includes(name)) {
      processedValue = value.replace(/[^0-9]/g, '').slice(0, 10);
    }

    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : processedValue
    }));
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    if (files && files[0]) {
      setFormData(prev => ({ ...prev, [name]: files[0] }));
    }
  };

  const validateStep = () => {
    if (step === 1) {
      const required = ['companyName', 'pan', 'clientType', 'industry', 'address', 'city', 'state', 'pinCode', 'owner1Name', 'owner1Phone', 'owner1Email', 'spocName', 'spocPhone', 'spocEmail'];
      for (const field of required) {
        if (!formData[field]) {
          toast.error(`${field.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())} is required`);
          return false;
        }
      }
      
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.owner1Email)) {
        toast.error("Please enter a valid Owner Email address");
        return false;
      }
      if (!emailRegex.test(formData.spocEmail)) {
        toast.error("Please enter a valid SPOC Email address");
        return false;
      }
      if (formData.pan && formData.pan.length !== 10) {
        toast.error("PAN number must be exactly 10 alphanumeric characters");
        return false;
      }
      if (formData.pinCode && formData.pinCode.length !== 6) {
        toast.error("PIN Code must be exactly 6 digits");
        return false;
      }
    }
    if (step === 2) {
      const required = ['agreementType', 'agreementEffectiveDate', 'agreementStartDate', 'feeStructure', 'paymentTerms'];
      for (const field of required) {
        if (!formData[field]) {
          toast.error(`${field.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())} is required`);
          return false;
        }
      }
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!formData.confirmOnboarding) {
      toast.error("Please confirm the onboarding to proceed.");
      return;
    }
    try {
      setSubmitting(true);

      // Call appropriate API based on mode
      if (isEdit) {
        await editClient(formData);
        toast.success("Client details updated successfully! ✨");
      } else {
        await createClient(formData);
        toast.success("Client onboarded successfully! 🎉");
        
        // Open local mail client with prefilled credentials
        try {
          const cleanCompanyName = formData.companyName.replace(/[^a-zA-Z0-9]/g, '');
          const defaultPassword = `${cleanCompanyName}@123`;
          const email = formData.owner1Email || formData.spocEmail || '';
          const name = formData.owner1Name || formData.spocName || formData.companyName || 'Client';
          
          const subject = encodeURIComponent("Welcome to MabiconsERP - Account Created");
          const body = encodeURIComponent(
            `Dear ${name},\n\n` +
            `Your client account has been successfully created. You can now login to your dashboard using the following credentials:\n\n` +
            `Email: ${email}\n` +
            `Password: ${defaultPassword}\n\n` +
            `Important: Please change your password after your first login for security purposes.\n\n` +
            `Access your dashboard at: https://erp.mabicons.com\n\n` +
            `Best regards,\nMabiconsERP Team`
          );
          
          window.location.href = `mailto:${email}?subject=${subject}&body=${body}`;
        } catch (mailError) {
          console.error("Failed to open mail app:", mailError);
        }
      }

      if (onComplete) onComplete(formData);
      onClose();
    } catch (err) {
      console.error('Submission error:', err);
      toast.error(err?.message || `Failed to ${isEdit ? 'update' : 'onboard'} client`);
    } finally {
      setSubmitting(false);
    }
  };

  const SummarySection = ({ title, data }) => (
    <div className="bg-[#F8FAFF] rounded-[24px] p-6 border border-[#F4F3EF] space-y-4">
      <h4 className="text-[12px] font-black text-[#1B4DA0] uppercase tracking-widest flex items-center gap-2">
        <FiCheckCircle className="text-[#10B981]" /> {title}
      </h4>
      <div className="grid grid-cols-2 gap-y-3 gap-x-6">
        {Object.entries(data).map(([label, value]) => (
          <div key={label}>
            <p className="text-[9px] font-black text-[#9B9BAD] uppercase tracking-widest">{label}</p>
            <p className="text-[12px] font-bold text-[#1A1A2E] truncate">{value || 'N/A'}</p>
          </div>
        ))}
      </div>
    </div>
  );

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
            className="relative w-full max-w-[1000px] bg-white rounded-[40px] shadow-2xl flex flex-col overflow-hidden max-h-[90vh]"
          >
            {/* Header */}
            <div className="px-10 py-8 border-b border-[#F4F3EF] flex items-center justify-between bg-white sticky top-0 z-20">
              <div className="flex items-center gap-5">

                <div>
                  <h2 className="text-2xl font-bold text-[#1A1A2E] tracking-tight font-syne">{isEdit ? 'Edit Client Details' : 'Client Onboarding'}</h2>
                </div>
              </div>
              <button onClick={onClose} className="w-11 h-11 rounded-2xl bg-[#F8F9FA] text-[#9B9BAD] hover:bg-red-50 hover:text-red-500 transition-all flex items-center justify-center shadow-sm">
                <FiX size={22} />
              </button>
            </div>

            <div ref={formRef} className="flex-1 overflow-y-auto px-12 py-12 custom-scrollbar space-y-12 pb-32">
              <StepIndicator currentStep={step} />

              <AnimatePresence mode="wait">
                {step === 1 && (
                  <motion.div
                    key="step1"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-12"
                  >
                    <div>
                      <SectionHeader title="Company Identity" number="1" />
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-8">
                        <InputField label="Registered Company Name" name="companyName" value={formData.companyName} onChange={handleInputChange} placeholder="e.g. Acme Corp" required />
                        <InputField label="CIN" name="cin" value={formData.cin} onChange={handleInputChange} placeholder="L12345MH2023PTC123456" />
                        <InputField label="PAN Number" name="pan" value={formData.pan} onChange={handleInputChange} placeholder="ABCDE1234F" required />
                        <SelectField label="Client Type" name="clientType" value={formData.clientType} onChange={handleInputChange} options={['Startup', 'SME', 'Enterprise', 'Multinational']} required />
                        <SelectField label="Industry / Sector" name="industry" value={formData.industry} onChange={handleInputChange} options={['IT & Software', 'Healthcare', 'Manufacturing', 'Finance', 'Retail', 'Education']} required />
                        <InputField label="Company Website" name="website" value={formData.website} onChange={handleInputChange} placeholder="https://www.company.com" />
                        <InputField label="Year of Incorporation" name="yearIncorporation" value={formData.yearIncorporation} onChange={handleInputChange} placeholder="2023" />
                      </div>
                    </div>

                    <div>
                      <SectionHeader title="Address Details" number="2" />
                      <div className="grid grid-cols-1 gap-8">
                        <InputField label="Full Registered Address" name="address" value={formData.address} onChange={handleInputChange} placeholder="Street, Building, Floor..." required />
                        <div className="flex items-center gap-3 py-2 px-2">
                          <input type="checkbox" name="sameAsRegistered" checked={formData.sameAsRegistered} onChange={handleInputChange} className="w-4 h-4 accent-[#1B4DA0]" />
                          <span className="text-[11px] font-bold text-[#6B6B7E] uppercase tracking-wider">Same as registered address</span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-8">
                          <InputField label="City" name="city" value={formData.city} onChange={handleInputChange} placeholder="Mumbai" required />
                          <SelectField label="State" name="state" value={formData.state} onChange={handleInputChange} options={STATES_INDIA} required />
                          <InputField label="PIN Code" name="pinCode" value={formData.pinCode} onChange={handleInputChange} placeholder="400001" required />
                          <InputField label="Country" name="country" value={formData.country} onChange={handleInputChange} placeholder="India" required />
                        </div>
                      </div>
                    </div>

                    <div>
                      <SectionHeader title="Key Contacts" number="3" />
                      <div className="space-y-10">
                        <div className="p-8 bg-[#F8FAFF] rounded-[32px] border border-[#F4F3EF] space-y-8">
                          <h4 className="text-[11px] font-black text-[#1B4DA0] uppercase tracking-widest flex items-center gap-2">Owner / Director 1</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-8">
                            <InputField label="Full Name" name="owner1Name" value={formData.owner1Name} onChange={handleInputChange} placeholder="Name" required />
                            <InputField label="Phone" name="owner1Phone" value={formData.owner1Phone} onChange={handleInputChange} placeholder="+91 9876543210" required />
                            <InputField label="Email" name="owner1Email" value={formData.owner1Email} onChange={handleInputChange} placeholder="owner@company.com" required />
                            <InputField label="Designation" name="owner1Designation" value={formData.owner1Designation} onChange={handleInputChange} placeholder="CEO / Director" required />
                            <InputField label="LinkedIn Profile" name="owner1LinkedIn" value={formData.owner1LinkedIn} onChange={handleInputChange} placeholder="https://linkedin.com/in/user" />
                          </div>
                        </div>

                        <div className="p-8 bg-white border border-[#F4F3EF] rounded-[32px] space-y-8">
                          <h4 className="text-[11px] font-black text-[#6B6B7E] uppercase tracking-widest">Owner / Director 2 (Optional)</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-8">
                            <InputField label="Full Name" name="owner2Name" value={formData.owner2Name} onChange={handleInputChange} placeholder="Name" />
                            <InputField label="Phone" name="owner2Phone" value={formData.owner2Phone} onChange={handleInputChange} placeholder="Phone" />
                            <InputField label="Email" name="owner2Email" value={formData.owner2Email} onChange={handleInputChange} placeholder="Email" />
                          </div>
                        </div>

                        <div className="p-8 bg-blue-50/30 border border-blue-100/50 rounded-[32px] space-y-8">
                          <h4 className="text-[11px] font-black text-[#1B4DA0] uppercase tracking-widest">SPOC - Single Point of Contact</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-8">
                            <InputField label="Full Name" name="spocName" value={formData.spocName} onChange={handleInputChange} placeholder="Name" required />
                            <InputField label="Phone" name="spocPhone" value={formData.spocPhone} onChange={handleInputChange} placeholder="Phone" required />
                            <InputField label="Email" name="spocEmail" value={formData.spocEmail} onChange={handleInputChange} placeholder="Email" required />
                            <InputField label="Designation" name="spocDesignation" value={formData.spocDesignation} onChange={handleInputChange} placeholder="HR Head / Admin" required />
                            <InputField label="Approval Authority" name="spocApproval" value={formData.spocApproval} onChange={handleInputChange} placeholder="Level of authority" />
                            <InputField label="Best Time to Contact" name="spocBestTime" value={formData.spocBestTime} onChange={handleInputChange} placeholder="e.g. 10 AM - 4 PM" />
                          </div>
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
                    className="space-y-12"
                  >
                    <div>
                      <SectionHeader title="Agreement & Commercial Terms" number="4" />
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-8">
                        <SelectField label="Agreement Type" name="agreementType" value={formData.agreementType} onChange={handleInputChange} options={['Recruitment', 'Operations', 'Recruitment + Operations']} required />
                        <InputField label="Agreement Effective Date" name="agreementEffectiveDate" value={formData.agreementEffectiveDate} onChange={handleInputChange} type="date" required />
                        <InputField label="Agreement Start Date" name="agreementStartDate" value={formData.agreementStartDate} onChange={handleInputChange} type="date" required />
                        <InputField label="Agreement Version" name="agreementVersion" value={formData.agreementVersion} onChange={handleInputChange} placeholder="v1.0" />
                        <SelectField label="Fee Structure" name="feeStructure" value={formData.feeStructure} onChange={handleInputChange} options={['One-time', 'Monthly Retainer', 'Success Based']} required />
                        <InputField label="Fee (In Numbers)" name="feeValue" value={formData.feeValue} onChange={handleInputChange} placeholder="e.g. 50000" type="number" />
                        <SelectField label="Payment Terms" name="paymentTerms" value={formData.paymentTerms} onChange={handleInputChange} options={['Immediate', 'Net 15', 'Net 30', 'Net 45']} required />
                        <InputField label="Notice Period (Days)" name="noticePeriod" value={formData.noticePeriod} onChange={handleInputChange} placeholder="e.g. 30" />
                        <InputField label="Name / Dept on Invoice" name="invoiceDept" value={formData.invoiceDept} onChange={handleInputChange} placeholder="e.g. Accounts Dept" />
                        <InputField label="Payment Terms (In Days)" name="paymentDays" value={formData.paymentDays} onChange={handleInputChange} placeholder="e.g. 15" />
                        <SelectField label="Exclusivity" name="exclusivity" value={formData.exclusivity} onChange={handleInputChange} options={['Yes', 'No']} />
                        <FileUpload label="Upload Signed Agreement" name="agreementFile" onChange={handleFileChange} fileName={formData.agreementFile?.name} />
                      </div>
                    </div>

                    <div>
                      <SectionHeader title="Workforce & Operations Data" number="5" />
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-8">
                        <InputField label="Total Employees" name="totalEmployees" value={formData.totalEmployees} onChange={handleInputChange} placeholder="e.g. 250" />
                        <InputField label="Employee Category" name="employeeCategory" value={formData.employeeCategory} onChange={handleInputChange} placeholder="e.g. Skilled / Semi-skilled" />
                        <InputField label="Number of Locations" name="numLocations" value={formData.numLocations} onChange={handleInputChange} placeholder="e.g. 5" />
                        <SelectField label="Working Model" name="workingModel" value={formData.workingModel} onChange={handleInputChange} options={['Remote', 'On-site', 'Hybrid']} />
                      </div>
                    </div>

                    <div>
                      <SectionHeader title="Payroll & Compliance Details" number="6" />
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-8">
                        <SelectField label="Payroll Frequency" name="payrollFrequency" value={formData.payrollFrequency} onChange={handleInputChange} options={['Weekly', 'Bi-weekly', 'Monthly']} />
                        <SelectField label="Salary Disbursement Mode" name="salaryMode" value={formData.salaryMode} onChange={handleInputChange} options={['Cash', 'Cheque', 'Bank Transfer']} />
                        <SelectField label="ESI Applicable?" name="esiApplicable" value={formData.esiApplicable} onChange={handleInputChange} options={['Yes', 'No']} />
                        <InputField label="PF / ESI Registration State" name="pfEsiState" value={formData.pfEsiState} onChange={handleInputChange} placeholder="e.g. Maharashtra" />
                        <SelectField label="Gratuity Applicable?" name="gratuityApplicable" value={formData.gratuityApplicable} onChange={handleInputChange} options={['Yes', 'No']} />
                        <InputField label="Payroll System" name="payrollSystem" value={formData.payrollSystem} onChange={handleInputChange} placeholder="e.g. Keka, Zoho" />
                        <SelectField label="Attendance System" name="attendanceSystem" value={formData.attendanceSystem} onChange={handleInputChange} options={['Keka', 'greytHR', 'Zoho People', 'Darwinbox', 'Spine HR', 'Pocket HRMS', 'Biometric Device', 'Web/Mobile Portal', 'Manual Excel/Sheets', 'Other']} />
                        <InputField label="Salary Processing Date" name="salaryDate" value={formData.salaryDate} onChange={handleInputChange} placeholder="e.g. 1st of month" />
                        <InputField label="Bank for Salary Transfer" name="salaryBank" value={formData.salaryBank} onChange={handleInputChange} placeholder="e.g. HDFC Bank" />
                      </div>
                    </div>
                  </motion.div>
                )}

                {step === 3 && (
                  <motion.div
                    key="step3"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="space-y-12"
                  >
                    <div>
                      <SectionHeader title="Compliance & Legal" number="7" />
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-8">
                        <SelectField label="GST Applicable?" name="gstApplicable" value={formData.gstApplicable} onChange={handleInputChange} options={['Yes', 'No']} />
                        <InputField label="PAN / TAN / Labor License" name="panTanLabor" value={formData.panTanLabor} onChange={handleInputChange} placeholder="License Numbers" />
                        <SelectField label="Trade License Available?" name="tradeLicenseAvailable" value={formData.tradeLicenseAvailable} onChange={handleInputChange} options={['Yes', 'No']} />
                        <FileUpload label="Upload Trade License" name="tradeLicenseFile" onChange={handleFileChange} fileName={formData.tradeLicenseFile?.name} />
                      </div>
                    </div>

                    <div>
                      <SectionHeader title="CRM Assignment" number="8" />
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-8">
                        <SelectField label="Account Manager" name="accountManager" value={formData.accountManager} onChange={handleInputChange} options={['Priya Mehta', 'Rahul Mehta', 'Suresh Kumar']} />
                        <InputField label="Region" name="region" value={formData.region} onChange={handleInputChange} placeholder="e.g. West / Mumbai" />
                        <SelectField label="Lead Source" name="leadSource" value={formData.leadSource} onChange={handleInputChange} options={['Reference', 'Website', 'LinkedIn', 'Direct Sales']} />
                        <InputField label="Vertical / Industry" name="vertical" value={formData.vertical} onChange={handleInputChange} placeholder="e.g. Fintech" />
                        <div className="col-span-full space-y-2">
                          <label className="text-[10px] font-bold text-[#9B9BAD] uppercase tracking-[2px] ml-1">
                            Notes / Remarks
                          </label>
                          <textarea
                            name="notes"
                            value={formData.notes}
                            onChange={handleInputChange}
                            rows={4}
                            placeholder="Add any additional onboarding notes..."
                            className="w-full bg-white border-[#F4F3EF] border-2 rounded-[24px] p-5 text-[13px] font-medium text-[#1A1A2E] outline-none focus:border-[#1B4DA0]/30 transition-all shadow-sm"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-8">
                      <h3 className="text-[18px] font-bold text-[#1A1A2E] uppercase tracking-tight font-syne">Review & Finalize</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <SummarySection
                          title="Company Profile"
                          data={{
                            'Company': formData.companyName,
                            'PAN': formData.pan,
                            'Industry': formData.industry,
                            'City': formData.city
                          }}
                        />
                        <SummarySection
                          title="Commercials"
                          data={{
                            'Agreement': formData.agreementType,
                            'Fee': `${formData.feeStructure} (${formData.feeValue})`,
                            'Terms': formData.paymentTerms
                          }}
                        />
                        <SummarySection
                          title="Contact Persons"
                          data={{
                            'Director': formData.owner1Name,
                            'SPOC': formData.spocName,
                            'SPOC Phone': formData.spocPhone
                          }}
                        />
                      </div>
                    </div>

                    <div className="p-8 bg-[#ECFDF5]/50 border border-[#A7F3D0] rounded-[32px] flex items-start gap-5">
                      <div className="w-6 h-6 rounded bg-[#D1FAE5] text-[#059669] flex items-center justify-center shrink-0 mt-1">
                        <input
                          type="checkbox"
                          name="confirmOnboarding"
                          checked={formData.confirmOnboarding}
                          onChange={handleInputChange}
                          className="accent-[#059669] w-4 h-4"
                        />
                      </div>
                      <div>
                        <h5 className="text-[15px] font-bold text-[#064E3B]">Confirm Onboarding Details</h5>
                        <p className="text-[12px] font-medium text-[#047857]/80 leading-relaxed">
                          I confirm that all provided data is accurate and matches the signed enterprise agreement. This will create a new client account and trigger account manager assignments.
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Footer */}
            <div className="px-10 py-8 border-t border-[#F4F3EF] bg-white sticky bottom-0 z-20 flex items-center justify-between shadow-[0_-10px_30px_rgba(0,0,0,0.02)]">
              <div className="flex gap-4">

              </div>
              <div className="flex gap-4">
                {step > 1 && (
                  <button
                    type="button"
                    onClick={() => {
                      setStep(s => s - 1);
                      formRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="flex items-center gap-2 px-8 py-3.5 rounded-[20px] text-[#1B4DA0] font-black uppercase tracking-widest text-[11px] border border-[#F4F3EF] hover:bg-[#F8F9FA] transition-all"
                  >
                    <FiArrowLeft /> Back
                  </button>
                )}

                {step < 3 ? (
                  <button
                    type="button"
                    onClick={() => {
                      if (validateStep()) {
                        setStep(s => s + 1);
                        formRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
                      }
                    }}
                    className="flex items-center gap-3 px-10 py-4 bg-[#1B4DA0] text-white font-black uppercase tracking-widest text-[12px] rounded-[20px] hover:bg-[#153D80] transition-all shadow-xl shadow-blue-500/20 active:scale-95"
                  >
                    Next Step <FiChevronRight size={18} />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={submitting}
                    className="flex items-center gap-3 px-12 py-4 bg-[#10B981] text-white font-black uppercase tracking-widest text-[12px] rounded-[20px] hover:bg-[#059669] transition-all shadow-xl shadow-[#10B981]/20 active:scale-95 disabled:opacity-50"
                  >
                    {submitting ? 'Onboarding...' : 'Final Onboard Client'} <FiCheck size={20} />
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );

  return typeof document !== 'undefined' ? createPortal(modalContent, document.body) : null;
};

export default ClientOnboardingForm;
