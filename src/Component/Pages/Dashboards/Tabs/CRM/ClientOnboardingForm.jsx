import React, { useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiX, FiCheck, FiChevronDown, FiChevronRight, FiInfo, FiFileText, FiActivity 
} from 'react-icons/fi';
import { toast } from 'react-hot-toast';

const STATES_CITIES = {
  "Andhra Pradesh": ["Visakhapatnam", "Vijayawada", "Guntur", "Nellore", "Kurnool"],
  "Arunachal Pradesh": ["Itanagar", "Naharlagun", "Pasighat"],
  "Assam": ["Guwahati", "Silchar", "Dibrugarh", "Jorhat", "Nagaon"],
  "Bihar": ["Patna", "Gaya", "Bhagalpur", "Muzaffarpur", "Purnia"],
  "Chhattisgarh": ["Raipur", "Bhilai", "Bilaspur", "Korba", "Rajnandgaon"],
  "Goa": ["Panaji", "Margao", "Vasco da Gama", "Mapusa"],
  "Gujarat": ["Ahmedabad", "Surat", "Vadodara", "Rajkot", "Bhavnagar"],
  "Haryana": ["Faridabad", "Gurgaon", "Panipat", "Ambala", "Yamunanagar"],
  "Himachal Pradesh": ["Shimla", "Dharamshala", "Solan", "Mandi"],
  "Jharkhand": ["Ranchi", "Jamshedpur", "Dhanbad", "Bokaro", "Deoghar"],
  "Karnataka": ["Bangalore", "Hubli-Dharwad", "Mysore", "Gulbarga", "Belgaum"],
  "Kerala": ["Thiruvananthapuram", "Kochi", "Kozhikode", "Thrissur", "Kollam"],
  "Madhya Pradesh": ["Indore", "Bhopal", "Jabalpur", "Gwalior", "Ujjain"],
  "Maharashtra": ["Mumbai", "Pune", "Nagpur", "Thane", "Nashik", "Aurangabad", "Solapur", "Amravati", "Navi Mumbai"],
  "Manipur": ["Imphal", "Bishnupur", "Thoubal"],
  "Meghalaya": ["Shillong", "Tura", "Jowai"],
  "Mizoram": ["Aizawl", "Lunglei", "Saiha"],
  "Nagaland": ["Kohima", "Dimapur", "Mokokchung"],
  "Odisha": ["Bhubaneswar", "Cuttack", "Rourkela", "Berhampur", "Sambalpur"],
  "Punjab": ["Ludhiana", "Amritsar", "Jalandhar", "Patiala", "Bathinda"],
  "Rajasthan": ["Jaipur", "Jodhpur", "Kota", "Bikaner", "Ajmer"],
  "Sikkim": ["Gangtok", "Namchi", "Geyzing"],
  "Tamil Nadu": ["Chennai", "Coimbatore", "Madurai", "Tiruchirappalli", "Salem"],
  "Telangana": ["Hyderabad", "Warangal", "Nizamabad", "Karimnagar", "Ramagundam"],
  "Tripura": ["Agartala", "Udaipur", "Dharmanagar"],
  "Uttar Pradesh": ["Lucknow", "Kanpur", "Ghaziabad", "Agra", "Meerut", "Varanasi", "Prayagraj", "Bareilly", "Aligarh", "Noida"],
  "Uttarakhand": ["Dehradun", "Haridwar", "Roorkee", "Haldwani"],
  "West Bengal": ["Kolkata", "Howrah", "Asansol", "Siliguri", "Durgapur"],
  "Delhi": ["New Delhi", "North Delhi", "South Delhi", "East Delhi", "West Delhi"],
  "Chandigarh": ["Chandigarh"],
  "Jammu and Kashmir": ["Srinagar", "Jammu", "Anantnag"],
  "Ladakh": ["Leh", "Kargil"],
  "Puducherry": ["Puducherry", "Karaikal"]
};

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

const LockedFieldsContext = React.createContext({});

const InputField = ({ label, name, value, onChange, placeholder, type = "text", skippable = false, clientMode = false }) => {
  const lockedFields = React.useContext(LockedFieldsContext);
  const isFilled = clientMode && lockedFields[name];
  return (
    <div className="space-y-1.5 text-left relative">
      <div className="flex items-center gap-2">
        <label className="text-[11px] font-bold text-[#6B6B7E] flex items-center gap-1.5">
          {label}
          {isFilled && <span className="w-4 h-4 rounded-full bg-emerald-100 flex items-center justify-center"><FiCheck className="text-emerald-600" size={10} strokeWidth={3} /></span>}
        </label>
        {skippable && <span className="px-1.5 py-0.5 rounded bg-[#F4F3EF] text-[8px] font-black text-[#9B9BAD] uppercase tracking-widest">Skippable</span>}
      </div>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        readOnly={isFilled}
        className={`w-full ${isFilled ? 'bg-emerald-50/50 border-emerald-200' : 'bg-[#F8F9FA] border-[#E5E7EB]'} border rounded-xl py-3 px-5 text-[13px] font-medium text-[#1A1A2E] outline-none focus:border-[#1B4DA0] transition-all placeholder:text-[#BDBDC7]`}
      />
    </div>
  );
};

const SelectField = ({ label, name, value, onChange, options, skippable = false, clientMode = false }) => {
  const lockedFields = React.useContext(LockedFieldsContext);
  const isFilled = clientMode && lockedFields[name];
  return (
    <div className="space-y-1.5 text-left">
      <div className="flex items-center gap-2">
        <label className="text-[11px] font-bold text-[#6B6B7E] flex items-center gap-1.5">
          {label}
          {isFilled && <span className="w-4 h-4 rounded-full bg-emerald-100 flex items-center justify-center"><FiCheck className="text-emerald-600" size={10} strokeWidth={3} /></span>}
        </label>
        {skippable && <span className="px-1.5 py-0.5 rounded bg-[#F4F3EF] text-[8px] font-black text-[#9B9BAD] uppercase tracking-widest">Skippable</span>}
      </div>
      <div className="relative">
        <select
          name={name}
          value={value}
          onChange={onChange}
          disabled={isFilled}
          className={`w-full ${isFilled ? 'bg-emerald-50/50 border-emerald-200' : 'bg-[#F4F3EF] border-transparent'} border rounded-xl py-3 pl-5 pr-10 text-[13px] font-bold text-[#1A1A2E] outline-none focus:border-[#1B4DA0] transition-all appearance-none cursor-pointer placeholder:text-[#9B9BAD]`}
        >
          <option value="">{label.includes('State') ? 'Select State' : 'Select City'}</option>
          {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
        </select>
        <FiChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-[#1B4DA0] pointer-events-none opacity-50" size={16} />
      </div>
    </div>
  );
};

const ToggleGroup = ({ label, name, value, onChange, options, clientMode = false }) => {
  const lockedFields = React.useContext(LockedFieldsContext);
  const isFilled = clientMode && lockedFields[name];
  return (
    <div className="space-y-1.5 text-left">
      <label className="text-[11px] font-bold text-[#6B6B7E] flex items-center gap-1.5">
        {label}
        {isFilled && <span className="w-4 h-4 rounded-full bg-emerald-100 flex items-center justify-center"><FiCheck className="text-emerald-600" size={10} strokeWidth={3} /></span>}
      </label>
      <div className={`flex p-1 ${isFilled ? 'bg-emerald-50/50 border-emerald-200' : 'bg-[#F4F3EF] border-[#F4F3EF]'} rounded-[20px] gap-1 border`}>
        {options.map(opt => (
          <button
            key={opt}
            type="button"
            onClick={() => !isFilled && onChange(opt)}
            className={`flex-1 py-3.5 rounded-[16px] text-[12px] font-bold transition-all flex items-center justify-center gap-2 ${value === opt ? 'bg-white text-[#1B4DA0] shadow-sm border border-[#1B4DA0]/10' : 'text-[#9B9BAD]'}`}
          >
            {value === opt && <div className="w-1.5 h-1.5 rounded-full bg-[#1B4DA0]" />}
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
};

const StepIndicator = ({ step, steps, setStep }) => (
  <div className="flex items-center justify-center gap-2 mb-8 overflow-x-auto py-2 px-2 custom-scrollbar">
    {steps.map((s, idx) => (
      <React.Fragment key={s.n}>
        <div 
          onClick={() => {
            if (s.n < step) {
              setStep(s.n);
            } else if (s.n === step + 1) {
              nextStep();
            }
          }}
          className="flex flex-col items-center gap-2 relative cursor-pointer group shrink-0"
        >
          <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 border-2 ${step === s.n ? 'bg-[#1B4DA0] border-[#1B4DA0] text-white shadow-lg shadow-blue-500/20 scale-110' : step > s.n ? 'bg-[#1B4DA0] border-[#1B4DA0] text-white' : 'bg-white border-[#F4F3EF] text-[#9B9BAD] group-hover:border-[#1B4DA0]/50'}`}>
            {step > s.n ? <FiCheck size={16} /> : (s.icon ? React.cloneElement(s.icon, { size: 16 }) : s.n)}
          </div>
          <span className={`text-[9px] font-black uppercase tracking-widest ${step === s.n ? 'text-[#1B4DA0]' : step > s.n ? 'text-[#1B4DA0]' : 'text-[#9B9BAD]'}`}>{s.title}</span>
        </div>
        {idx < steps.length - 1 && (
          <div className="w-8 shrink-0 h-[2px] bg-[#F4F3EF] -mt-5">
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

const ClientOnboardingForm = ({ isOpen, onClose, onComplete, mode = "minimal", initialData = null, clientMode = false }) => {
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [lockedFields, setLockedFields] = useState({});
  
  const [formData, setFormData] = useState({
    companyName: '',
    industry: 'General',
    state: '',
    city: '',
    otherCity: '',
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
        state: initialData.location || initialData.state || '',
        city: initialData.city || '',
        otherCity: initialData.otherCity || '',
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
      
      const locks = {};
      if (initialData.companyName) locks.companyName = true;
      if (initialData.gstNumber) locks.gstNumber = true;
      if (initialData.location || initialData.state) locks.state = true;
      if (initialData.city) locks.city = true;
      if (initialData.otherCity) locks.otherCity = true;
      if (initialData.pinCode) locks.pinCode = true;
      if (initialData.spocName) locks.spocName = true;
      if (initialData.spocEmail || initialData.email) locks.spocEmail = true;
      if (initialData.spocPhone || initialData.phone) locks.spocPhone = true;
      if (initialData.registeredAddress || initialData.location) locks.registeredAddress = true;
      if (initialData.ownerName) locks.ownerName = true;
      if (initialData.ownerEmail) locks.ownerEmail = true;
      if (initialData.feeAmount) locks.feeAmount = true;
      if (initialData.shopsLicense) locks.shopsLicense = true;
      if (initialData.factoryLicense) locks.factoryLicense = true;
      if (initialData.totalEmployees) locks.totalEmployees = true;
      if (initialData.onboardingNotes) locks.onboardingNotes = true;
      setLockedFields(locks);
      
      setStep(1); // Reset step when new data loaded
    }
  }, [initialData]);

  const steps = mode === "minimal" 
    ? [{ n: 1, title: 'Basic Info', icon: <FiInfo /> }]
    : [
        { n: 1, title: 'Identity & Contacts', icon: <FiInfo /> },
        { n: 2, title: 'Terms & Compliance', icon: <FiFileText /> },
        { n: 3, title: 'Finalize', icon: <FiCheck /> }
      ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const validateStep = (currentStep) => {
    if (currentStep === 1) {
      const required = [
        { field: 'companyName', label: 'Company Name' },
        { field: 'gstNumber', label: 'GST Number' },
        { field: 'pinCode', label: 'PIN Code' },
        { field: 'registeredAddress', label: 'Registered Address' },
        { field: 'state', label: 'State' },
        { field: 'city', label: 'City' },
        { field: 'ownerName', label: 'Owner Name' },
        { field: 'ownerEmail', label: 'Owner Email' },
        { field: 'spocName', label: 'SPOC Name' },
        { field: 'spocPhone', label: 'SPOC Phone' }
      ];
      
      for (const item of required) {
        if (!formData[item.field]) {
          toast.error(`${item.label} is required`);
          return false;
        }
      }
      
      if (formData.city === 'Other' && !formData.otherCity) {
        toast.error('Please enter the City name');
        return false;
      }
      return true;
    }

    if (currentStep === 2) {
      const required = [
        { field: 'agreementType', label: 'Agreement Type', exclude: 'Select agreement' },
        { field: 'agreementEffectiveDate', label: 'Effective Date' },
        { field: 'feeAmount', label: 'Fee Amount' },
        { field: 'paymentTerms', label: 'Payment Terms' },
        { field: 'totalEmployees', label: 'Total Employees' },
        { field: 'assignKAM', label: 'Assigned KAM' }
      ];

      for (const item of required) {
        if (!formData[item.field] || (item.exclude && formData[item.field] === item.exclude)) {
          toast.error(`${item.label} is required`);
          return false;
        }
      }
      return true;
    }
    
    return true;
  };

  const nextStep = () => {
    if (validateStep(step)) {
      setStep(s => Math.min(s + 1, steps.length));
    }
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
    <LockedFieldsContext.Provider value={lockedFields}>
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
                  {clientMode ? 'Complete Your Profile' : (mode === 'minimal' ? 'Add New Client' : 'Finalize Client Onboarding')}
                </h2>
              </div>
              <button onClick={onClose} className="w-8 h-8 rounded-full bg-[#F4F3EF] text-[#9B9BAD] hover:bg-red-50 hover:text-red-500 transition-all flex items-center justify-center">
                <FiX size={18} />
              </button>
            </div>

              <div className="flex-1 overflow-y-auto p-10 custom-scrollbar bg-white">
                {mode !== 'minimal' && (
                  <StepIndicator step={step} steps={steps} setStep={setStep} />
                )}

                <div className="min-h-[350px]">
                  <AnimatePresence mode="wait">
                    {mode === "minimal" ? (
                      <motion.div key="minimal" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                        <SectionHeader num="1" title="Basic Client Info" />
                        <div className="grid grid-cols-1 gap-5">
                          <InputField label="Company name" name="companyName" value={formData.companyName} onChange={handleInputChange} placeholder="Registered company name" clientMode={clientMode} />
                          <div className="grid grid-cols-2 gap-5">
                            <InputField label="Industry" name="industry" value={formData.industry} onChange={handleInputChange} placeholder="e.g. IT, Healthcare" clientMode={clientMode} />
                            <SelectField 
                              label="State" 
                              name="state" 
                              value={formData.state} 
                              onChange={(e) => {
                                const val = e.target.value;
                                setFormData(prev => ({ ...prev, state: val, city: '' }));
                              }} 
                              options={Object.keys(STATES_CITIES)} 
                              clientMode={clientMode}
                            />
                            <SelectField 
                              label="City" 
                              name="city" 
                              value={formData.city} 
                              onChange={handleInputChange} 
                              options={formData.state ? [...(STATES_CITIES[formData.state] || []), "Other"] : []} 
                              clientMode={clientMode}
                            />
                            {formData.city === 'Other' && (
                              <InputField 
                                label="Other City" 
                                name="otherCity" 
                                value={formData.otherCity} 
                                onChange={handleInputChange} 
                                placeholder="Enter city name" 
                                clientMode={clientMode}
                              />
                            )}
                            <InputField label="Pin Code" name="pinCode" value={formData.pinCode} onChange={handleInputChange} placeholder="Pin Code" clientMode={clientMode} />
                          </div>
                          <SelectField 
                            label="Service Type" 
                            name="serviceType" 
                            value={formData.serviceType} 
                            onChange={handleInputChange} 
                            options={['Recruitment', 'Operation', 'Recruitment + Operation']} 
                            clientMode={clientMode}
                          />
                        </div>

                        <SectionHeader num="2" title="Contact Details" clientMode={clientMode} />
                        <div className="grid grid-cols-1 gap-5">
                          <InputField label="SPOC Name" name="spocName" value={formData.spocName} onChange={handleInputChange} placeholder="Name" clientMode={clientMode} />
                          <InputField label="SPOC Email" name="spocEmail" value={formData.spocEmail} onChange={handleInputChange} placeholder="spoc@company.com" clientMode={clientMode} />
                          <InputField label="SPOC Phone" name="spocPhone" value={formData.spocPhone} onChange={handleInputChange} placeholder="+91 XXXXX XXXXX" clientMode={clientMode} />
                        </div>
                      </motion.div>
                    ) : (
                      <>
                        {step === 1 && (
                          <motion.div key="stage1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
                            <div>
                              <SectionHeader num="1" title="Company Identity" />
                              <div className="grid grid-cols-1 gap-5">
                                <InputField label="Company name" name="companyName" value={formData.companyName} onChange={handleInputChange} placeholder="Registered company name" clientMode={clientMode} />
                                <div className="grid grid-cols-2 gap-5">
                                  <InputField label="GST number" name="gstNumber" value={formData.gstNumber} onChange={handleInputChange} placeholder="27AABCU9603R1ZX" clientMode={clientMode} />
                                  <InputField label="PIN code" name="pinCode" value={formData.pinCode} onChange={handleInputChange} placeholder="400001" clientMode={clientMode} />
                                </div>
                              </div>
                            </div>

                            <div>
                              <SectionHeader num="2" title="Address Details" />
                              <div className="grid grid-cols-2 gap-5">
                                <div className="col-span-full">
                                  <InputField label="Registered address" name="registeredAddress" value={formData.registeredAddress} onChange={handleInputChange} placeholder="Full address" clientMode={clientMode} />
                                </div>
                                <SelectField 
                                  label="State" 
                                  name="state" 
                                  value={formData.state} 
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    setFormData(prev => ({ ...prev, state: val, city: '' }));
                                  }} 
                                  options={Object.keys(STATES_CITIES)} 
                                  clientMode={clientMode}
                                />
                                <SelectField 
                                  label="City" 
                                  name="city" 
                                  value={formData.city} 
                                  onChange={handleInputChange} 
                                  options={formData.state ? [...(STATES_CITIES[formData.state] || []), "Other"] : []} 
                                  clientMode={clientMode}
                                />
                                {formData.city === 'Other' && (
                                  <div className="col-span-full">
                                    <InputField 
                                      label="Other City" 
                                      name="otherCity" 
                                      value={formData.otherCity} 
                                      onChange={handleInputChange} 
                                      placeholder="Enter city name" 
                                      clientMode={clientMode}
                                    />
                                  </div>
                                )}
                              </div>
                            </div>

                            <div>
                              <SectionHeader num="3" title="Key Contacts" />
                              <div className="grid grid-cols-2 gap-5">
                                <InputField label="Owner Name" name="ownerName" value={formData.ownerName} onChange={handleInputChange} placeholder="Name" clientMode={clientMode} />
                                <InputField label="Owner Email" name="ownerEmail" value={formData.ownerEmail} onChange={handleInputChange} placeholder="owner@email.com" clientMode={clientMode} />
                                <InputField label="SPOC Name" name="spocName" value={formData.spocName} onChange={handleInputChange} placeholder="Name" clientMode={clientMode} />
                                <InputField label="SPOC Phone" name="spocPhone" value={formData.spocPhone} onChange={handleInputChange} placeholder="+91 XXXXX XXXXX" clientMode={clientMode} />
                              </div>
                            </div>
                          </motion.div>
                        )}

                        {step === 2 && (
                          <motion.div key="stage2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
                            <div>
                              <SectionHeader num="4" title="Agreement & Terms" />
                              <div className="grid grid-cols-2 gap-5">
                                <SelectField label="Agreement type" name="agreementType" value={formData.agreementType} onChange={handleInputChange} options={['Select agreement', 'MSA', 'SLA']} clientMode={clientMode} />
                                <InputField label="Effective date" name="agreementEffectiveDate" value={formData.agreementEffectiveDate} onChange={handleInputChange} type="date" clientMode={clientMode} />
                                <InputField label="Fee % / amount" name="feeAmount" value={formData.feeAmount} onChange={handleInputChange} placeholder="e.g. 8.33%" clientMode={clientMode} />
                                <SelectField label="Payment terms" name="paymentTerms" value={formData.paymentTerms} onChange={handleInputChange} options={['Net 15', 'Net 30', 'Net 45']} clientMode={clientMode} />
                              </div>
                            </div>

                            <div>
                              <SectionHeader num="5" title="Compliance & Licenses" />
                              <div className="grid grid-cols-2 gap-5">
                                <InputField label="Shops license" name="shopsLicense" value={formData.shopsLicense} onChange={handleInputChange} placeholder="No." skippable clientMode={clientMode} />
                                <InputField label="Factory license" name="factoryLicense" value={formData.factoryLicense} onChange={handleInputChange} placeholder="No." skippable clientMode={clientMode} />
                                <div className="col-span-full">
                                  <ToggleGroup 
                                    label="MSME registered?" 
                                    name="msmeRegistered"
                                    value={formData.msmeRegistered} 
                                    onChange={(val) => handleInputChange({ target: { name: 'msmeRegistered', value: val }})} 
                                    options={['Yes', 'No']} 
                                    clientMode={clientMode}
                                  />
                                </div>
                              </div>
                            </div>

                            <div>
                              <SectionHeader num="6" title="Workforce & Payroll" />
                              <div className="grid grid-cols-2 gap-5">
                                <InputField label="Total employees" name="totalEmployees" value={formData.totalEmployees} onChange={handleInputChange} placeholder="e.g. 500" clientMode={clientMode} />
                                <SelectField label="Payroll cycle" name="payrollCycle" value={formData.payrollCycle} onChange={handleInputChange} options={['Monthly', 'Bi-weekly']} clientMode={clientMode} />
                                <ToggleGroup 
                                  label="PF applicable" 
                                  name="pfApplicable"
                                  value={formData.pfApplicable} 
                                  onChange={(val) => handleInputChange({ target: { name: 'pfApplicable', value: val }})} 
                                  options={['Yes', 'No']} 
                                  clientMode={clientMode}
                                />
                                <ToggleGroup 
                                  label="ESIC applicable" 
                                  name="esicApplicable"
                                  value={formData.esicApplicable} 
                                  onChange={(val) => handleInputChange({ target: { name: 'esicApplicable', value: val }})} 
                                  options={['Yes', 'No']} 
                                  clientMode={clientMode}
                                />
                              </div>
                            </div>

                            <div>
                              <SectionHeader num="7" title="CRM Assignment" />
                              <div className="grid grid-cols-2 gap-5">
                                <SelectField label="Assign KAM" name="assignKAM" value={formData.assignKAM} onChange={handleInputChange} options={['Priya Mehta', 'Rahul Mehta']} clientMode={clientMode} />
                                <SelectField label="Lead Source" name="leadSource" value={formData.leadSource} onChange={handleInputChange} options={['Reference', 'Direct']} clientMode={clientMode} />
                                <div className="col-span-full">
                                  <InputField label="Onboarding notes" name="onboardingNotes" value={formData.onboardingNotes} onChange={handleInputChange} placeholder="Notes..." skippable clientMode={clientMode} />
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        )}

                        {step === 3 && (
                          <motion.div key="stage3" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="py-20 flex flex-col items-center justify-center text-center space-y-6">
                            <div className="w-24 h-24 rounded-full bg-emerald-50 flex items-center justify-center shadow-inner">
                              <FiCheck className="text-emerald-500" size={48} strokeWidth={3} />
                            </div>
                            <div className="space-y-2">
                              <h3 className="text-2xl font-black text-[#1A1A2E] tracking-tight">Onboarding Ready!</h3>
                              <p className="text-[#6B6B7E] font-medium max-w-[320px] mx-auto text-sm">
                                You have successfully completed all the steps. Click finish to finalize the client profile.
                              </p>
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
                    {submitting ? 'Processing...' : (clientMode ? 'Submit Details' : (mode === 'minimal' ? 'Add Client' : 'Finish Onboarding'))} <FiCheck size={18} />
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  </LockedFieldsContext.Provider>
);

  if (typeof document !== 'undefined') {
    return createPortal(modalContent, document.body);
  }
  return null;
};

export default ClientOnboardingForm;
