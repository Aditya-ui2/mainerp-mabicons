import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiCheck, FiCalendar, FiClock, FiMapPin, FiAlignLeft, FiUsers, FiVideo, FiGlobe, FiSearch, FiChevronDown } from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import { getAllClients, createMeeting, getAllLeads } from '../../../service/api';

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

  const filteredOptions = options.filter(opt => 
    (opt.label || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedOption = options.find(opt => opt.value === value);

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
          <span className={value ? "text-[#1A1A2E]" : "text-[#BDBDC7] font-medium"}>
            {selectedOption ? selectedOption.label : `Select ${label}`}
          </span>
        </div>
        <FiChevronDown className={`absolute right-4 top-1/2 -translate-y-1/2 text-[#9B9BAD] transition-transform pointer-events-none z-10 ${isOpen ? 'rotate-180' : ''}`} size={16} />
        
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
                      onChange({ target: { name, value: opt.value } });
                      setIsOpen(false);
                      setSearchTerm('');
                    }}
                    className={`px-4 py-2.5 text-[13px] font-bold cursor-pointer rounded-xl transition-all ${value === opt.value ? 'bg-[#1B4DA0]/10 text-[#1B4DA0]' : 'text-[#6B6B7E] hover:bg-slate-50 hover:text-[#1A1A2E]'}`}
                  >
                    {opt.label}
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

const SelectField = ({ label, name, value, onChange, options, required = false, icon: Icon }) => (
  <div className="space-y-2.5 text-left relative group">
    <label className="text-[10px] font-bold text-[#9B9BAD] uppercase tracking-[2px] ml-1 flex items-center gap-1.5">
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
        <option value="" disabled>Select {label}</option>
        {options.map((opt, i) => (
          <option key={i} value={opt}>{opt}</option>
        ))}
      </select>
    </div>
  </div>
);

const MeetingOnboardingForm = ({ isOpen, onClose, onComplete, initialData = null }) => {
  const [submitting, setSubmitting] = useState(false);
  const isEdit = !!initialData;

  const initialFormState = {
    subject: '',
    clientNameDropdown: '',
    customClientName: '',
    date: '',
    time: '',
    platform: 'Google Meet',
    meetingLink: '',
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
        if (res && res.data) {
          if (Array.isArray(res.data.leads)) {
            leadsList = res.data.leads;
          } else if (Array.isArray(res.data.data)) {
            leadsList = res.data.data;
          } else if (Array.isArray(res.data)) {
            leadsList = res.data;
          }
        }
        setClients(leadsList);
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
      setFormData({
        ...initialFormState,
        ...initialData,
        meetingId: initialData.id,
        clientNameDropdown: initialData.clientId || '',
        platform: initialData.platform || 'Google Meet',
        meetingLink: initialData.meetingLink || ''
      });
    } else if (isOpen) {
      setFormData(initialFormState);
    }
  }, [initialData, isOpen]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const validateForm = () => {
    const required = ['subject', 'date', 'time', 'platform'];
    for (const field of required) {
      if (!formData[field]) {
        toast.error(`${field.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())} is required`);
        return false;
      }
    }
    if (!formData.clientNameDropdown) {
      toast.error('Client is required');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      setSubmitting(true);
      
      const selectedClient = clients.find(c => c.id === formData.clientNameDropdown);
      const dataToSubmit = {
        title: formData.subject,
        clientId: formData.clientNameDropdown,
        meetingDate: formData.date,
        meetingTime: formData.time,
        meetingType: 'Virtual',
        platform: formData.meetingLink || formData.platform,
        attendees: 2
      };
      
      const res = await createMeeting(dataToSubmit);
      
      if (res && res.success) {
        toast.success("Meeting generated in database successfully! 🎉");
        if (onComplete) onComplete(res.data);
        onClose();
      } else {
        throw new Error('Failed to create meeting');
      }
    } catch (err) {
      console.error('Submission error:', err);
      toast.error(`Failed to ${isEdit ? 'update' : 'generate'} meeting in database`);
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
                  <h2 className="text-2xl font-bold text-[#1A1A2E] tracking-tight font-syne">{isEdit ? 'Edit Meeting Details' : 'Generate New Meeting'}</h2>
                </div>
              </div>
              <button onClick={onClose} className="w-11 h-11 rounded-2xl bg-[#F8F9FA] text-[#9B9BAD] hover:bg-red-50 hover:text-red-500 transition-all flex items-center justify-center shadow-sm">
                <FiX size={22} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-12 py-12 custom-scrollbar space-y-12">
              <div className="grid grid-cols-1 gap-y-8">
                <InputField 
                  label="Meeting Subject" 
                  name="subject" 
                  value={formData.subject} 
                  onChange={handleInputChange} 
                  placeholder="e.g. Initial Discovery Call" 
                  required 
                  icon={FiAlignLeft}
                />
                <SearchableSelectField 
                  label="Client / Lead Name" 
                  name="clientNameDropdown" 
                  value={formData.clientNameDropdown} 
                  onChange={handleInputChange} 
                  options={clients.filter(c => c && c.id).map(c => ({
                    value: c.id,
                    label: c.companyName || c.contactPerson || c.name || 'Unknown'
                  }))}
                  required 
                  icon={FiUsers}
                />
                
                <div className="grid grid-cols-2 gap-4">
                  <InputField 
                    label="Date" 
                    name="date" 
                    type="date"
                    value={formData.date} 
                    onChange={handleInputChange} 
                    required 
                    icon={FiCalendar}
                  />
                  <InputField 
                    label="Time" 
                    name="time" 
                    type="time"
                    value={formData.time} 
                    onChange={handleInputChange} 
                    required 
                    icon={FiClock}
                  />
                </div>

                <SelectField 
                  label="Platform" 
                  name="platform" 
                  value={formData.platform} 
                  onChange={handleInputChange}
                  options={['Google Meet']} 
                  required 
                  icon={FiVideo}
                />

                {formData.platform === 'Google Meet' && (
                  <div className="flex gap-4 items-end">
                    <div className="flex-1">
                      <InputField 
                        label="Meeting Link" 
                        name="meetingLink" 
                        value={formData.meetingLink} 
                        onChange={handleInputChange} 
                        placeholder="https://" 
                        icon={FiGlobe}
                      />
                    </div>
                    <button 
                      type="button" 
                      onClick={() => {
                        const randomString = Math.random().toString(36).substring(2, 5) + '-' + Math.random().toString(36).substring(2, 6) + '-' + Math.random().toString(36).substring(2, 5);
                        let prefix = 'https://meet.google.com/';
                        if(formData.platform === 'Zoom') prefix = 'https://zoom.us/j/';
                        if(formData.platform === 'Microsoft Teams') prefix = 'https://teams.microsoft.com/l/meetup-join/';
                        setFormData(prev => ({ ...prev, meetingLink: prefix + randomString }));
                        toast.success(`${formData.platform} link generated!`);
                      }}
                      className="h-[52px] px-6 bg-blue-50 text-[#1B4DA0] font-bold text-xs rounded-2xl border border-blue-100 hover:bg-blue-100 transition-all flex items-center justify-center whitespace-nowrap mb-0.5"
                    >
                      Generate Link
                    </button>
                  </div>
                )}

                <div className="space-y-2 text-left">
                  <label className="text-[10px] font-bold text-[#9B9BAD] uppercase tracking-[2px] ml-1">Notes</label>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    placeholder="Add agenda or notes..."
                    rows={4}
                    className="w-full bg-white border-[#F4F3EF] border-2 rounded-2xl p-4 text-[13px] font-medium text-[#1A1A2E] outline-none focus:border-[#1B4DA0]/30 transition-all placeholder:text-[#BDBDC7] shadow-sm"
                  />
                </div>

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
                  {submitting ? 'Saving...' : (isEdit ? 'Save Changes' : 'Generate Meeting')} <FiCheck size={20} />
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

export default MeetingOnboardingForm;
