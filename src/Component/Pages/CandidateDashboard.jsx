import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FiUser, FiFileText, FiUploadCloud, FiCheckCircle, 
  FiClock, FiAlertCircle, FiDownload, FiLogOut, FiMenu, FiX,
  FiCreditCard, FiDollarSign, FiBook, FiBriefcase, FiAward, FiShield, FiFile, FiTrash2, FiEye
} from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { uploadCandidateKYC, BASE_URL } from './service/api';

const CandidateDashboard = () => {
  const [candidate, setCandidate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('Overview');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userType = localStorage.getItem('userType');
    if (!token || userType !== 'candidate') {
      navigate('/candidate-login');
      return;
    }

    // Recover candidate info from token/localstorage
    const name = localStorage.getItem('userName');
    const email = localStorage.getItem('userEmail');
    
    // In a real app, fetch fresh data from backend
    setCandidate({
        name: name || 'Candidate',
        email: email || '',
        stage: 'Document Verification',
        kycDocuments: {} // This would come from an API call normally
    });
    setLoading(false);
  }, [navigate]);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/candidate-login');
  };

  const menuItems = [
    { id: 'Overview', icon: FiUser, label: 'Overview' },
    { id: 'Documents', icon: FiUploadCloud, label: 'Upload KYC' },
    { id: 'Offers', icon: FiFileText, label: 'Offer Letter' },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'Overview':
        return <Overview candidate={candidate} setActiveTab={setActiveTab} />;
      case 'Documents':
        return <DocumentsUpload candidate={candidate} />;
      case 'Offers':
        return <OfferLetter candidate={candidate} />;
      default:
        return <Overview candidate={candidate} setActiveTab={setActiveTab} />;
    }
  };

  if (loading) return null;

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex font-['Outfit']">
      {/* Sidebar - Dark Theme */}
      <AnimatePresence mode='wait'>
        {isSidebarOpen && (
          <motion.aside
            initial={{ x: -300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -300, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="w-[260px] bg-[#1A1A2E] flex flex-col z-50 fixed inset-y-0 lg:relative shadow-2xl"
          >
            {/* Logo Section */}
            <div className="p-6 border-b border-white/5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#1B4DA0] rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30">
                  <FiCheckCircle className="text-white text-lg" />
                </div>
                <div>
                  <span className="font-black text-white text-lg tracking-tight block">Mabicons</span>
                  <span className="text-[9px] font-bold text-[#1B4DA0] uppercase tracking-[0.15em]">ERP Portal</span>
                </div>
              </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
              {menuItems.map((item) => (
                <motion.button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  whileHover={{ x: 4 }}
                  whileTap={{ scale: 0.98 }}
                  className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all font-semibold text-sm ${
                    activeTab === item.id 
                      ? 'bg-[#1B4DA0] text-white shadow-lg shadow-blue-500/20' 
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <item.icon size={18} />
                  {item.label}
                </motion.button>
              ))}
            </nav>

            {/* User Section & Logout */}
            <div className="p-4 border-t border-white/5">
              <div className="flex items-center gap-3 px-3 py-3 mb-3 bg-white/5 rounded-xl">
                <div className="w-9 h-9 rounded-lg bg-[#1B4DA0] flex items-center justify-center text-white font-bold text-sm uppercase">
                  {candidate?.name?.substring(0,1) || 'C'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-white truncate">{candidate?.name}</p>
                  <p className="text-[10px] text-slate-400 uppercase tracking-wider">Candidate</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10 transition-all font-semibold text-sm group"
              >
                <FiLogOut size={18} className="group-hover:rotate-12 transition-transform" />
                Logout
              </button>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>
      
      {/* Mobile Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-1 min-w-0 overflow-auto bg-[#F8FAFC] px-4 py-6 lg:px-10 lg:py-8">
        <header className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-[#1B4DA0] shadow-sm hover:shadow-md hover:scale-105 active:scale-95 transition-all duration-300 border border-slate-200 lg:hidden"
              aria-label="Open menu"
            >
              {isSidebarOpen ? <FiX className="w-5 h-5 stroke-[2]" /> : <FiMenu className="w-5 h-5 stroke-[2]" />}
            </button>
            <div>
              <h2 className="text-xl lg:text-2xl font-bold text-[#1A1A2E] tracking-tight">Onboarding Portal</h2>
              <p className="text-sm text-slate-500 font-medium">Welcome, {candidate?.name}</p>
            </div>
          </div>
          
          <div className="hidden sm:flex items-center gap-3 bg-white px-3 py-2 rounded-2xl shadow-sm border border-slate-100">
             <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#1B4DA0] to-[#2563EB] flex items-center justify-center text-white font-bold uppercase text-sm shadow-lg shadow-blue-500/20">
                {candidate?.name?.substring(0,2)}
             </div>
             <div className="pr-2">
                <p className="text-xs font-bold text-[#1A1A2E] uppercase tracking-wide">{candidate?.name}</p>
                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Candidate</p>
             </div>
          </div>
        </header>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            {renderContent()}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
};

const Overview = ({ candidate, setActiveTab }) => {
    const steps = [
        { id: 1, label: 'Selected', status: 'completed', icon: FiCheckCircle },
        { id: 2, label: 'Document Verification', status: 'current', icon: FiUploadCloud },
        { id: 3, label: 'Offer Generation', status: 'upcoming', icon: FiFileText },
        { id: 4, label: 'Joined', status: 'upcoming', icon: FiBriefcase },
    ];

    const requiredDocs = [
        { name: 'PAN Card', status: 'pending', required: true },
        { name: 'Aadhar Card', status: 'pending', required: true },
        { name: 'Pay Slips', status: 'pending', required: true },
        { name: 'Bank Statement', status: 'pending', required: true },
        { name: 'Degree Certificate', status: 'pending', required: true },
        { name: 'Marksheet', status: 'pending', required: true },
    ];

    return (
        <div className="space-y-8">
            {/* Progress Steps */}
            <div className="bg-white rounded-[32px] p-8 shadow-sm border border-slate-100">
                <h3 className="text-[11px] font-black text-[#9B9BAD] uppercase tracking-[0.2em] mb-8">My Progress</h3>
                <div className="relative flex flex-col md:flex-row justify-between items-start md:items-center gap-8 md:gap-4">
                    {/* Line Connection */}
                    <div className="hidden md:block absolute h-[2px] bg-slate-100 top-6 left-16 right-16 z-0" />
                    
                    {steps.map((step) => (
                        <div key={step.id} className="relative z-10 flex md:flex-col items-center gap-4 md:gap-3 flex-1">
                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${
                                step.status === 'completed' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30' :
                                step.status === 'current' ? 'bg-[#1B4DA0] text-white ring-4 ring-[#1B4DA0]/20 shadow-lg shadow-[#1B4DA0]/30' :
                                'bg-slate-100 text-slate-400'
                            }`}>
                                {step.status === 'completed' ? <FiCheckCircle size={22} /> : <span className="font-bold">{step.id}</span>}
                            </div>
                            <span className={`text-sm font-bold text-center ${
                                step.status === 'current' ? 'text-[#1A1A2E]' : 
                                step.status === 'completed' ? 'text-emerald-600' : 'text-[#9B9BAD]'
                            }`}>{step.label}</span>
                        </div>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Current Status Card */}
                <div className="bg-gradient-to-br from-[#1B4DA0] to-[#2563EB] rounded-[32px] p-8 text-white shadow-xl shadow-blue-500/20">
                    <div className="w-14 h-14 bg-white/10 backdrop-blur rounded-2xl flex items-center justify-center mb-6">
                        <FiClock className="text-white" size={28} />
                    </div>
                    <h3 className="text-2xl font-bold mb-3">Wait for Verification</h3>
                    <p className="text-blue-100 font-medium leading-relaxed">Our HR team is currently reviewing your documents. You'll receive an email once verified.</p>
                    
                    <div className="mt-8 pt-6 border-t border-white/10">
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-blue-200">Estimated Time</span>
                            <span className="font-bold">2-3 Business Days</span>
                        </div>
                    </div>
                </div>

                {/* Document Checklist */}
                <div className="bg-white rounded-[32px] p-8 shadow-sm border border-slate-100">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-[11px] font-black text-[#9B9BAD] uppercase tracking-[0.2em]">Required Documents</h3>
                        <span className="text-xs font-bold text-[#1B4DA0] bg-[#1B4DA0]/10 px-3 py-1 rounded-full">0/{requiredDocs.length} Uploaded</span>
                    </div>
                    <div className="space-y-3">
                        {requiredDocs.map((doc, idx) => (
                            <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                                <div className="flex items-center gap-3">
                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                                        doc.status === 'uploaded' ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-200 text-slate-400'
                                    }`}>
                                        {doc.status === 'uploaded' ? <FiCheckCircle size={16} /> : <FiFile size={16} />}
                                    </div>
                                    <span className="text-sm font-semibold text-[#1A1A2E]">{doc.name}</span>
                                </div>
                                <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded ${
                                    doc.status === 'uploaded' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                                }`}>
                                    {doc.status === 'uploaded' ? 'Done' : 'Pending'}
                                </span>
                            </div>
                        ))}
                    </div>
                    
                    <button 
                        onClick={() => setActiveTab('Documents')}
                        className="w-full mt-6 bg-[#1A1A2E] text-white py-4 rounded-2xl font-bold text-sm hover:bg-[#2A2A3E] transition-all flex items-center justify-center gap-2"
                    >
                        <FiUploadCloud size={18} />
                        Upload Documents
                    </button>
                </div>
            </div>

            {/* Support Material */}
            <div className="bg-white rounded-[32px] p-8 shadow-sm border border-slate-100">
                <h3 className="text-[11px] font-black text-[#9B9BAD] uppercase tracking-[0.2em] mb-6">Support Material</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <button className="flex items-center justify-between p-5 bg-slate-50 hover:bg-slate-100 rounded-2xl transition-all group">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-[#1B4DA0] shadow-sm group-hover:scale-110 transition-all">
                                <FiFileText size={22} />
                            </div>
                            <div className="text-left">
                                <span className="font-bold text-[#1A1A2E] text-sm block">Company Policies</span>
                                <span className="text-[11px] text-[#9B9BAD]">PDF • 2.4 MB</span>
                            </div>
                        </div>
                        <FiDownload className="text-[#9B9BAD] group-hover:text-[#1B4DA0] transition-colors" size={20} />
                    </button>
                    <button className="flex items-center justify-between p-5 bg-slate-50 hover:bg-slate-100 rounded-2xl transition-all group">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-[#1B4DA0] shadow-sm group-hover:scale-110 transition-all">
                                <FiBook size={22} />
                            </div>
                            <div className="text-left">
                                <span className="font-bold text-[#1A1A2E] text-sm block">Onboarding Guide</span>
                                <span className="text-[11px] text-[#9B9BAD]">PDF • 1.8 MB</span>
                            </div>
                        </div>
                        <FiDownload className="text-[#9B9BAD] group-hover:text-[#1B4DA0] transition-colors" size={20} />
                    </button>
                </div>
            </div>
        </div>
    );
};

const DocumentsUpload = ({ candidate }) => {
    const [uploading, setUploading] = useState({});
    const [uploadedDocs, setUploadedDocs] = useState({});

    // Document categories with proper icons and requirements
    const documentCategories = [
        {
            title: 'Identity Documents',
            required: true,
            documents: [
                { type: 'pan', label: 'PAN Card', icon: FiCreditCard, required: true, priority: 1, description: 'Government issued PAN card (mandatory for taxation)' },
                { type: 'aadhar', label: 'Aadhar Card', icon: FiShield, required: true, priority: 2, description: 'Both front and back side required' },
            ]
        },
        {
            title: 'Financial Documents',
            required: true,
            documents: [
                { type: 'payslips', label: 'Pay Slips', icon: FiDollarSign, required: true, description: 'Last 3 months pay slips from current/previous employer' },
                { type: 'bank_statement', label: 'Bank Statement', icon: FiFileText, required: true, description: 'Last 3 months statement showing salary credits' },
            ]
        },
        {
            title: 'Educational Documents',
            required: true,
            documents: [
                { type: 'degree', label: 'Degree Certificate', icon: FiAward, required: true, description: 'Highest qualification degree certificate' },
                { type: 'marksheet', label: 'Marksheet', icon: FiBook, required: true, description: 'All semester/year marksheets' },
            ]
        },
        {
            title: 'Employment Documents',
            required: false,
            documents: [
                { type: 'appointment_letter', label: 'Previous Appointment Letter', icon: FiBriefcase, required: false, description: 'Appointment letter from previous company' },
                { type: 'relieving_letter', label: 'Relieving Letter', icon: FiFileText, required: false, description: 'Relieving/Experience letter from previous employer' },
            ]
        },
    ];

    const handleFileChange = async (e, docType, docLabel) => {
        const file = e.target.files[0];
        if (!file) return;

        // Validate file type
        const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
        if (!allowedTypes.includes(file.type)) {
            toast.error('Only PDF, JPG, and PNG files are allowed');
            return;
        }

        // Validate file size (1MB max)
        if (file.size > 1 * 1024 * 1024) {
            toast.error('File size must be less than 1MB');
            return;
        }

        setUploading(prev => ({ ...prev, [docType]: true }));
        const formData = new FormData();
        formData.append('document', file);
        formData.append('docType', docType);

        try {
            const response = await uploadCandidateKYC(formData);
            setUploadedDocs(prev => ({
                ...prev,
                [docType]: {
                    name: file.name,
                    url: response?.url || null,
                    uploadedAt: new Date().toISOString()
                }
            }));
            toast.success(`${docLabel} uploaded successfully!`);
        } catch (err) {
            toast.error('Upload failed. Please try again.');
        } finally {
            setUploading(prev => ({ ...prev, [docType]: false }));
        }
    };

    const handleRemoveDoc = (docType) => {
        setUploadedDocs(prev => {
            const updated = { ...prev };
            delete updated[docType];
            return updated;
        });
        toast.info('Document removed. Please upload again.');
    };

    const totalRequired = documentCategories.flatMap(c => c.documents).filter(d => d.required).length;
    const uploadedRequired = documentCategories.flatMap(c => c.documents).filter(d => d.required && uploadedDocs[d.type]).length;
    const progressPercent = Math.round((uploadedRequired / totalRequired) * 100);

    return (
        <div className="space-y-8">
            {/* Header Section */}
            <div className="bg-white rounded-[32px] p-8 border border-slate-100 shadow-sm">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <h3 className="text-2xl font-bold text-[#1A1A2E] tracking-tight">Document Verification</h3>
                        <p className="text-[#9B9BAD] font-medium mt-1">Please upload clear scan copies of the required documents</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="text-right">
                            <p className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-[0.2em]">Progress</p>
                            <p className="text-2xl font-black text-[#1A1A2E]">{uploadedRequired}/{totalRequired}</p>
                        </div>
                        <div className="w-16 h-16 relative">
                            <svg className="w-16 h-16 transform -rotate-90">
                                <circle cx="32" cy="32" r="28" stroke="#F4F3EF" strokeWidth="4" fill="none" />
                                <circle 
                                    cx="32" cy="32" r="28" 
                                    stroke={progressPercent === 100 ? '#10B981' : '#1B4DA0'} 
                                    strokeWidth="4" 
                                    fill="none"
                                    strokeDasharray={`${2 * Math.PI * 28}`}
                                    strokeDashoffset={`${2 * Math.PI * 28 * (1 - progressPercent / 100)}`}
                                    strokeLinecap="round"
                                />
                            </svg>
                            <span className="absolute inset-0 flex items-center justify-center text-xs font-black text-[#1A1A2E]">{progressPercent}%</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Document Categories */}
            {documentCategories.map((category, catIdx) => (
                <div key={catIdx} className="space-y-4">
                    <div className="flex items-center gap-3 px-2">
                        <h4 className="text-[11px] font-black text-[#9B9BAD] uppercase tracking-[0.2em]">{category.title}</h4>
                        {category.required && (
                            <span className="px-2 py-0.5 bg-red-50 text-red-600 text-[9px] font-black uppercase tracking-wider rounded-full">Required</span>
                        )}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {category.documents.map((doc) => {
                            const isUploaded = !!uploadedDocs[doc.type];
                            const isLoading = uploading[doc.type];
                            
                            return (
                                <motion.div
                                    key={doc.type}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className={`bg-white rounded-[24px] p-6 border-2 transition-all relative overflow-hidden group ${
                                        isUploaded 
                                            ? 'border-emerald-200 bg-emerald-50/30' 
                                            : doc.required 
                                                ? 'border-slate-100 hover:border-[#1B4DA0]/30' 
                                                : 'border-dashed border-slate-200 hover:border-slate-300'
                                    }`}
                                >
                                    {/* Priority Badge */}
                                    {doc.priority === 1 && !isUploaded && (
                                        <div className="absolute top-4 right-4">
                                            <span className="px-2 py-1 bg-amber-100 text-amber-700 text-[8px] font-black uppercase tracking-wider rounded-lg animate-pulse">Most Important</span>
                                        </div>
                                    )}

                                    {/* Uploaded Badge */}
                                    {isUploaded && (
                                        <div className="absolute top-4 right-4">
                                            <span className="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center">
                                                <FiCheckCircle className="text-white" size={14} />
                                            </span>
                                        </div>
                                    )}

                                    <div className="flex items-start gap-4">
                                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all flex-shrink-0 ${
                                            isUploaded 
                                                ? 'bg-emerald-100 text-emerald-600' 
                                                : 'bg-slate-50 text-[#9B9BAD] group-hover:bg-[#1B4DA0]/10 group-hover:text-[#1B4DA0]'
                                        }`}>
                                            <doc.icon size={22} />
                                        </div>
                                        
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <h5 className="font-bold text-[#1A1A2E] text-sm">{doc.label}</h5>
                                                {doc.required && !isUploaded && (
                                                    <span className="text-red-500 text-xs">*</span>
                                                )}
                                            </div>
                                            <p className="text-[11px] text-[#9B9BAD] font-medium mt-1 leading-relaxed line-clamp-2">{doc.description}</p>
                                            
                                            {isUploaded ? (
                                                <div className="mt-4 space-y-2">
                                                    <div className="flex items-center gap-2 text-xs text-emerald-700 font-medium bg-emerald-100/50 px-3 py-2 rounded-xl">
                                                        <FiFileText size={14} />
                                                        <span className="truncate flex-1">{uploadedDocs[doc.type].name}</span>
                                                    </div>
                                                    <div className="flex gap-2">
                                                        <button 
                                                            onClick={() => handleRemoveDoc(doc.type)}
                                                            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-[10px] font-bold text-red-600 bg-red-50 hover:bg-red-100 rounded-xl transition-all"
                                                        >
                                                            <FiTrash2 size={12} />
                                                            Remove
                                                        </button>
                                                        <label className="flex-1 cursor-pointer">
                                                            <input 
                                                                type="file" 
                                                                className="hidden" 
                                                                accept=".pdf,.jpg,.jpeg,.png"
                                                                onChange={(e) => handleFileChange(e, doc.type, doc.label)}
                                                                disabled={isLoading}
                                                            />
                                                            <div className="flex items-center justify-center gap-1.5 px-3 py-2 text-[10px] font-bold text-[#1B4DA0] bg-[#1B4DA0]/10 hover:bg-[#1B4DA0]/20 rounded-xl transition-all">
                                                                <FiUploadCloud size={12} />
                                                                Replace
                                                            </div>
                                                        </label>
                                                    </div>
                                                </div>
                                            ) : (
                                                <label className="mt-4 block cursor-pointer">
                                                    <input 
                                                        type="file" 
                                                        className="hidden" 
                                                        accept=".pdf,.jpg,.jpeg,.png"
                                                        onChange={(e) => handleFileChange(e, doc.type, doc.label)}
                                                        disabled={isLoading}
                                                    />
                                                    <div className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-bold text-xs transition-all ${
                                                        isLoading 
                                                            ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                                                            : 'bg-[#1A1A2E] text-white hover:bg-[#2A2A3E] active:scale-[0.98]'
                                                    }`}>
                                                        {isLoading ? (
                                                            <>
                                                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                                Uploading...
                                                            </>
                                                        ) : (
                                                            <>
                                                                <FiUploadCloud size={14} />
                                                                Upload {doc.label}
                                                            </>
                                                        )}
                                                    </div>
                                                </label>
                                            )}
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                </div>
            ))}

            {/* Submit Section */}
            <div className="bg-gradient-to-r from-[#1B4DA0] to-[#2563EB] rounded-[32px] p-8 text-white">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <h4 className="text-xl font-bold">Ready to Submit?</h4>
                        <p className="text-blue-100 font-medium mt-1 text-sm">
                            {progressPercent === 100 
                                ? 'All required documents uploaded! Click submit to proceed.'
                                : `Please upload all required documents (${totalRequired - uploadedRequired} remaining)`
                            }
                        </p>
                    </div>
                    <button 
                        disabled={progressPercent < 100}
                        className={`px-8 py-4 rounded-2xl font-bold text-sm transition-all flex items-center gap-2 ${
                            progressPercent === 100 
                                ? 'bg-white text-[#1B4DA0] hover:bg-blue-50 shadow-lg shadow-black/10 active:scale-[0.98]' 
                                : 'bg-white/20 text-white/60 cursor-not-allowed'
                        }`}
                    >
                        <FiCheckCircle size={18} />
                        Submit for Verification
                    </button>
                </div>
            </div>

            {/* Info Note */}
            <div className="flex items-start gap-4 px-6 py-5 bg-amber-50 border border-amber-200 rounded-2xl">
                <FiAlertCircle className="text-amber-600 flex-shrink-0 mt-0.5" size={18} />
                <div>
                    <p className="text-sm font-bold text-amber-800">Important Note</p>
                    <p className="text-xs text-amber-700 mt-1 leading-relaxed">
                        All documents should be clear, readable, and in PDF/JPG/PNG format. Maximum file size is <strong>1MB</strong> per document. 
                        Documents marked with <span className="text-red-500">*</span> are mandatory for verification.
                    </p>
                </div>
            </div>
        </div>
    );
};

const OfferLetter = ({ candidate }) => {
    return (
        <div className="space-y-6">
            <div className="bg-white rounded-[32px] p-8 shadow-sm border border-slate-100 text-center">
                <div className="max-w-md mx-auto">
                    <div className="w-20 h-20 bg-slate-50 rounded-[24px] flex items-center justify-center text-[#9B9BAD] mx-auto mb-6 border border-slate-100">
                        <FiFileText size={36} />
                    </div>
                    
                    {candidate?.offerLetterUrl ? (
                        <>
                            <h3 className="text-2xl font-bold text-[#1A1A2E] mb-3">Offer Letter Ready!</h3>
                            <p className="text-[#9B9BAD] font-medium mb-8 leading-relaxed">
                                Your official offer letter is now available for download. Please review, sign, and return it to complete your onboarding.
                            </p>
                            
                            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 mb-8">
                                <div className="flex items-center justify-center gap-3 text-emerald-700">
                                    <FiCheckCircle size={20} />
                                    <span className="font-bold">Document Verification Complete</span>
                                </div>
                            </div>
                            
                            <a 
                                href={`${BASE_URL}${candidate.offerLetterUrl}`} 
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-3 bg-[#1B4DA0] hover:bg-[#164088] text-white px-10 py-5 rounded-2xl font-bold shadow-xl shadow-[#1B4DA0]/20 active:scale-[0.98] transition-all"
                            >
                                <FiDownload size={20} />
                                Download Offer Letter
                            </a>
                        </>
                    ) : (
                        <>
                            <h3 className="text-2xl font-bold text-[#1A1A2E] mb-3">Offer Letter Pending</h3>
                            <p className="text-[#9B9BAD] font-medium mb-8 leading-relaxed">
                                Your offer letter will be generated and attached here once all your documents have been verified by our HR team.
                            </p>
                            
                            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6">
                                <div className="flex items-center justify-center gap-3 text-amber-700">
                                    <FiClock size={20} />
                                    <span className="font-bold">Awaiting Document Verification</span>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* Timeline */}
            <div className="bg-white rounded-[32px] p-8 shadow-sm border border-slate-100">
                <h3 className="text-[11px] font-black text-[#9B9BAD] uppercase tracking-[0.2em] mb-6">Offer Process Timeline</h3>
                <div className="space-y-4">
                    {[
                        { step: 1, title: 'Documents Submitted', status: 'done', date: 'Completed' },
                        { step: 2, title: 'HR Verification', status: 'current', date: 'In Progress' },
                        { step: 3, title: 'Offer Generation', status: 'pending', date: 'Pending' },
                        { step: 4, title: 'Offer Acceptance', status: 'pending', date: 'Pending' },
                    ].map((item, idx) => (
                        <div key={idx} className="flex items-center gap-4">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold ${
                                item.status === 'done' ? 'bg-emerald-100 text-emerald-600' :
                                item.status === 'current' ? 'bg-[#1B4DA0] text-white' :
                                'bg-slate-100 text-slate-400'
                            }`}>
                                {item.status === 'done' ? <FiCheckCircle size={18} /> : item.step}
                            </div>
                            <div className="flex-1">
                                <p className={`font-bold text-sm ${item.status === 'pending' ? 'text-[#9B9BAD]' : 'text-[#1A1A2E]'}`}>{item.title}</p>
                            </div>
                            <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                                item.status === 'done' ? 'bg-emerald-100 text-emerald-700' :
                                item.status === 'current' ? 'bg-[#1B4DA0]/10 text-[#1B4DA0]' :
                                'bg-slate-100 text-slate-400'
                            }`}>{item.date}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default CandidateDashboard;
