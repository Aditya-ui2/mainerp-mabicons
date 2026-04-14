import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FiUser, FiFileText, FiUploadCloud, FiCheckCircle, 
  FiClock, FiAlertCircle, FiDownload, FiLogOut, FiMenu, FiX 
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
        return <Overview candidate={candidate} />;
      case 'Documents':
        return <DocumentsUpload candidate={candidate} />;
      case 'Offers':
        return <OfferLetter candidate={candidate} />;
      default:
        return <Overview candidate={candidate} />;
    }
  };

  if (loading) return null;

  return (
    <div className="min-h-screen bg-slate-50 flex font-jakarta">
      {/* Sidebar */}
      <AnimatePresence mode='wait'>
        {isSidebarOpen && (
          <motion.aside
            initial={{ x: -300 }}
            animate={{ x: 0 }}
            exit={{ x: -300 }}
            className="w-72 bg-white border-r border-slate-100 flex flex-col z-50 fixed inset-y-0 lg:relative"
          >
            <div className="p-8">
              <div className="flex items-center gap-3 mb-10">
                <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                  <FiCheckCircle className="text-white text-xl" />
                </div>
                <span className="font-black text-slate-800 text-xl tracking-tight">Mabicons<span className="text-blue-600">ERP</span></span>
              </div>

              <nav className="space-y-2">
                {menuItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl transition-all font-bold text-sm ${
                      activeTab === item.id 
                        ? 'bg-blue-50 text-blue-600 shadow-sm' 
                        : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <item.icon size={20} />
                    {item.label}
                  </button>
                ))}
              </nav>
            </div>

            <div className="mt-auto p-8 pt-0">
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-red-500 hover:bg-red-50 transition-all font-bold text-sm"
              >
                <FiLogOut size={20} />
                Logout
              </button>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-1 min-w-0 overflow-auto bg-slate-50 px-6 py-8 lg:px-12 lg:py-12">
        <header className="flex items-center justify-between mb-12">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="lg:hidden p-2 bg-white rounded-lg shadow-sm"
            >
              {isSidebarOpen ? <FiX size={20} /> : <FiMenu size={20} />}
            </button>
            <div>
              <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Onboarding Portal</h2>
              <p className="text-slate-500 font-medium">Welcome, {candidate?.name}</p>
            </div>
          </div>
          
          <div className="hidden sm:flex items-center gap-4 bg-white p-2 rounded-2xl shadow-sm border border-slate-100">
             <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 font-bold uppercase">
                {candidate?.name.substring(0,2)}
             </div>
             <div className="pr-4">
                <p className="text-xs font-black text-slate-800 uppercase tracking-wider">{candidate?.name}</p>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Candidate</p>
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

const Overview = ({ candidate }) => {
    const steps = [
        { id: 1, label: 'Selected', status: 'completed' },
        { id: 2, label: 'Document Verification', status: 'current' },
        { id: 3, label: 'Offer Generation', status: 'upcoming' },
        { id: 4, label: 'Joined', status: 'upcoming' },
    ];

    return (
        <div className="space-y-8">
            <div className="bg-white rounded-[40px] p-10 shadow-sm border border-slate-100">
                <h3 className="text-xl font-bold text-slate-800 mb-8">My Progress</h3>
                <div className="relative flex flex-col md:flex-row justify-between items-start md:items-center gap-8 md:gap-4">
                    {/* Line Connection */}
                    <div className="hidden md:block absolute h-0.5 bg-slate-100 top-6 left-12 right-12 z-0" />
                    
                    {steps.map((step) => (
                        <div key={step.id} className="relative z-10 flex md:flex-col items-center gap-4 md:gap-3 flex-1">
                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg transition-all ${
                                step.status === 'completed' ? 'bg-emerald-500 text-white' :
                                step.status === 'current' ? 'bg-blue-600 text-white ring-4 ring-blue-100' :
                                'bg-slate-100 text-slate-400'
                            }`}>
                                {step.status === 'completed' ? <FiCheckCircle size={24} /> : <span>{step.id}</span>}
                            </div>
                            <span className={`text-sm font-bold ${
                                step.status === 'current' ? 'text-slate-900' : 'text-slate-400'
                            }`}>{step.label}</span>
                        </div>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[40px] p-10 text-white shadow-xl shadow-blue-500/20">
                    <FiClock className="text-blue-200 mb-6" size={32} />
                    <h3 className="text-2xl font-bold mb-2">Wait for Verification</h3>
                    <p className="text-blue-100/80 font-medium">Our HR team is currently reviewing your documents. You'll receive an email once verified.</p>
                </div>

                <div className="bg-white rounded-[40px] p-10 shadow-sm border border-slate-100">
                    <h3 className="text-xl font-bold text-slate-800 mb-6">Support Material</h3>
                    <div className="space-y-4">
                        <button className="w-full flex items-center justify-between p-4 bg-slate-50 hover:bg-slate-100 rounded-2xl transition-all group">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-white rounded-xl text-blue-600 shadow-sm group-hover:scale-110 transition-all">
                                    <FiFileText size={20} />
                                </div>
                                <span className="font-bold text-slate-700 text-sm italic">Company Policies.pdf</span>
                            </div>
                            <FiDownload className="text-slate-400" />
                        </button>
                        <button className="w-full flex items-center justify-between p-4 bg-slate-50 hover:bg-slate-100 rounded-2xl transition-all group">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-white rounded-xl text-blue-600 shadow-sm group-hover:scale-110 transition-all">
                                    <FiFileText size={20} />
                                </div>
                                <span className="font-bold text-slate-700 text-sm italic">Onboarding Guide.pdf</span>
                            </div>
                            <FiDownload className="text-slate-400" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const DocumentsUpload = ({ candidate }) => {
    const [uploading, setUploading] = useState(false);
    const docTypes = [
        { type: 'aadhar', label: 'Aadhar Card', icon: FiFileText },
        { type: 'pan', label: 'PAN Card', icon: FiFileText },
        { type: 'photo', label: 'Passport Size Photo', icon: FiUser },
    ];

    const handleFileChange = async (e, docType) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploading(true);
        const formData = new FormData();
        formData.append('document', file);
        formData.append('docType', docType);

        try {
            await uploadCandidateKYC(formData);
            toast.success(`${docType.toUpperCase()} uploaded successfully!`);
        } catch (err) {
            toast.error('Upload failed. Please try again.');
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="space-y-8">
            <header className="mb-10">
                <h3 className="text-2xl font-bold text-slate-800">Knowledge Requirements</h3>
                <p className="text-slate-500 font-medium mt-1">Please upload clear scan copies of the following documents</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {docTypes.map((doc) => (
                    <div key={doc.type} className="bg-white rounded-[32px] p-8 border border-slate-100 shadow-sm flex flex-col items-center text-center group hover:border-blue-500/30 transition-all">
                        <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 mb-6 group-hover:bg-blue-50 group-hover:text-blue-500 transition-all">
                            <doc.icon size={32} />
                        </div>
                        <h4 className="font-bold text-slate-800 mb-2">{doc.label}</h4>
                        <p className="text-xs text-slate-400 font-medium mb-8 leading-relaxed">Required for background verification</p>
                        
                        <label className="cursor-pointer">
                            <input 
                                type="file" 
                                className="hidden" 
                                onChange={(e) => handleFileChange(e, doc.type)}
                                disabled={uploading}
                            />
                            <div className="bg-slate-900 text-white px-6 py-3 rounded-2xl font-bold text-xs hover:bg-slate-800 transition-all flex items-center gap-2">
                                <FiUploadCloud />
                                {uploading ? 'Uploading...' : 'Upload File'}
                            </div>
                        </label>
                    </div>
                ))}
            </div>
        </div>
    );
};

const OfferLetter = ({ candidate }) => {
    return (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-[40px] shadow-sm border border-slate-100 border-dashed">
            <div className="w-24 h-24 bg-slate-50 rounded-[32px] flex items-center justify-center text-slate-300 mb-8 border border-slate-100">
                <FiFileText size={48} />
            </div>
            {candidate?.offerLetterUrl ? (
                <>
                    <h3 className="text-2xl font-bold text-slate-800 mb-2">Offer Letter Ready!</h3>
                    <p className="text-slate-500 font-medium mb-10 max-w-sm text-center">Your official offer letter is now available for download. Please sign and return it.</p>
                    <a 
                        href={`${BASE_URL}${candidate.offerLetterUrl}`} 
                        target="_blank"
                        rel="noreferrer"
                        className="bg-blue-600 hover:bg-blue-500 text-white px-10 py-5 rounded-[24px] font-bold shadow-xl shadow-blue-500/20 active:scale-95 transition-all flex items-center gap-3"
                    >
                        <FiDownload />
                        Download Offer Letter
                    </a>
                </>
            ) : (
                <>
                    <h3 className="text-2xl font-bold text-slate-300 mb-2">No Offer Letter Yet</h3>
                    <p className="text-slate-400 font-medium text-center max-w-sm px-6">Your offer letter will be attached here once the document verification is complete.</p>
                </>
            )}
        </div>
    );
};

export default CandidateDashboard;
