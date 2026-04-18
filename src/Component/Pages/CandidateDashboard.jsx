import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    FiFileText, FiUploadCloud, FiCheckCircle, FiCheck,
    FiClock, FiAlertCircle, FiLogOut, FiCreditCard, FiDollarSign,
    FiBook, FiBriefcase, FiAward, FiShield, FiTrash2, FiX, FiPlus, FiChevronDown
} from 'react-icons/fi';
// Framer motion removed for static UI
import { toast } from 'sonner';
import { uploadCandidateKYC, getCandidateProfile, submitCandidateKYC, BASE_URL } from './service/api';
import logo from '../../assets/images/mabicons logo blue.png';

const CandidateDashboard = () => {
    const [candidate, setCandidate] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    navigate('/candidate-login');
                    return;
                }

                const response = await getCandidateProfile();
                if (response.success) {
                    setCandidate(response.data);
                }
            } catch (err) {
                console.error('Profile fetch error:', err);
                const name = localStorage.getItem('userName');
                const email = localStorage.getItem('userEmail');
                setCandidate({
                    name: name || 'Candidate',
                    email: email || '',
                    stage: 'Document Verification',
                    kycDocuments: {}
                });
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, [navigate]);

    const handleLogout = () => {
        localStorage.clear();
        navigate('/candidate-login');
    };



    if (loading) return null;

    return (
        <div className="min-h-screen bg-[#FDFDFD]">
            <nav className="h-16 md:h-20 bg-white border-b border-[#F4F3EF] sticky top-0 z-50">
                <div className="max-w-[1600px] mx-auto h-full px-6 flex items-center justify-between">
                    <img src={logo} alt="Mabicons" className="h-8 md:h-10 w-auto" />

                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-3 px-3 py-1.5 bg-[#FAFAFA] border border-[#F4F3EF] rounded-xl">
                            <div className="h-7 w-7 rounded-lg bg-[#1B4DA0] text-white flex items-center justify-center font-black text-[10px] shadow-lg">
                                {candidate?.name?.charAt(0) || 'C'}
                            </div>
                            <div className="hidden sm:block">
                                <p className="text-[10px] font-black text-[#1A1A2E] leading-none mb-0.5">{candidate?.name || 'Candidate'}</p>
                                <p className="text-[8px] text-[#9B9BAD] font-black uppercase tracking-widest leading-none">{candidate?.email || 'Portal'}</p>
                            </div>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="p-2 text-[#9B9BAD] hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                        >
                            <FiLogOut size={18} />
                        </button>
                    </div>
                </div>
            </nav>

            <main className="max-w-[1600px] mx-auto p-4 md:p-10">
                <DocumentsUpload 
                    candidate={candidate} 
                    setCandidate={setCandidate}
                    isSubmitting={isSubmitting}
                    setIsSubmitting={setIsSubmitting}
                />
            </main>
        </div>
    );
};

const DocumentsUpload = ({ candidate, setCandidate, isSubmitting, setIsSubmitting }) => {
    const [uploading, setUploading] = useState({});
    const [uploadedDocs, setUploadedDocs] = useState({});
    const [showSizeModal, setShowSizeModal] = useState(false);
    const [isUniversityExpanded, setIsUniversityExpanded] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);

    useEffect(() => {
        if (candidate?.kycDocuments) {
            setUploadedDocs(candidate.kycDocuments);
        }
    }, [candidate]);

    const uniRef = useRef(null);

    const documentCategories = [
        {
            title: 'Identity Documents',
            documents: [
                { type: 'pan', label: 'PAN Card', icon: FiCreditCard, required: true, isSplit: true, description: 'Government issued PAN card' },
                { type: 'aadhar', label: 'Aadhar Card', icon: FiShield, required: true, isSplit: true, description: 'Both front and back side required' },
            ]
        },
        {
            title: 'Educational Documents',
            documents: [
                { type: 'marksheet_10', label: '10th Marksheet', icon: FiBook, required: true, description: 'Secondary school certificate' },
                { type: 'marksheet_12', label: '12th Marksheet', icon: FiBook, required: true, description: 'Higher secondary certificate' },
                { type: 'university_marksheet', label: 'University Marksheet', icon: FiAward, required: false, isSemester: true, description: 'Semester-wise Marksheets (Upload 1-8)' },
                { type: 'degree', label: 'Degree Certificate', icon: FiAward, required: false, description: 'Highest qualification degree' },
            ]
        },
        {
            title: 'Financial Documents',
            documents: [
                { type: 'payslips', label: 'Pay Slips', icon: FiDollarSign, required: false, description: 'Last 3 months pay slips' },
                { type: 'bank_statement', label: 'Bank Statement', icon: FiFileText, required: false, description: 'Last 3 months statement' },
            ]
        },
        {
            title: 'Employment Documents',
            documents: [
                { type: 'appointment_letter', label: 'Appointment Letter', icon: FiBriefcase, required: false, description: 'Previous company appointment letter' },
                { type: 'relieving_letter', label: 'Relieving Letter', icon: FiFileText, required: false, description: 'Relieving/Experience letter' },
            ]
        },
    ];

    const handleFileChange = async (e, docType, docLabel, side = null, isMultiple = false) => {
        const file = e.target.files[0];
        if (!file) return;

        // Strict 1MB Limit Check with App Pop-up
        if (file.size > 1 * 1024 * 1024) {
            setShowSizeModal(true);
            e.target.value = ''; // Reset input
            return;
        }

        // Generate unique key. For multiple, use timestamp to avoid overwriting
        const uploadKey = isMultiple
            ? `${docType}_${Date.now()}`
            : (side ? `${docType}_${side}` : docType);

        setUploading(prev => ({ ...prev, [uploadKey]: true }));

        const formData = new FormData();
        formData.append('document', file);
        formData.append('docType', isMultiple ? uploadKey : docType); // Send unique key as docType for multiple
        if (side) formData.append('side', side);

        try {
            const response = await uploadCandidateKYC(formData);
            setUploadedDocs(prev => ({
                ...prev,
                [uploadKey]: {
                    name: file.name,
                    url: response?.url || null,
                    uploadedAt: new Date().toISOString()
                }
            }));
            toast.success(`${docLabel} uploaded successfully!`);
        } catch (err) {
            toast.error('Upload failed. Please try again.');
        } finally {
            setUploading(prev => ({ ...prev, [uploadKey]: false }));
            e.target.value = ''; // Reset input to allow re-uploading same file if desired
        }
    };

    const handleRemoveDoc = (uploadKey) => {
        setUploadedDocs(prev => {
            const updated = { ...prev };
            delete updated[uploadKey];
            return updated;
        });
        toast.info('Document removed.');
    };

    // Calculate completion status comprehensively
    const getDocStatus = (doc) => {
        if (doc.isSemester) {
            // Check if ANY semester is uploaded
            return Object.keys(uploadedDocs).some(key => key.startsWith('university_marksheet_sem'));
        }
        if (doc.isMultiple) {
            return Object.keys(uploadedDocs).some(key => key.startsWith(`${doc.type}_`));
        }
        if (!doc.isSplit) {
            return !!uploadedDocs[doc.type];
        }
        // Support split documents (Aadhar/PAN)
        const hasFront = !!(uploadedDocs[`${doc.type}_front`] || uploadedDocs[`${doc.type}Front`]);
        const hasBack = !!(uploadedDocs[`${doc.type}_back`] || uploadedDocs[`${doc.type}Back`]);
        return hasFront && hasBack;
    };

    // Check if any split document is in a partial state (one side uploaded, other missing)
    const hasAnyPartialUpload = documentCategories.some(cat =>
        cat.documents.some(doc => {
            if (!doc.isSplit) return false;
            const hasFront = !!(uploadedDocs[`${doc.type}_front`] || uploadedDocs[`${doc.type}Front`]);
            const hasBack = !!(uploadedDocs[`${doc.type}_back`] || uploadedDocs[`${doc.type}Back`]);
            return (hasFront || hasBack) && !(hasFront && hasBack);
        })
    );

    const totalRequiredDocs = documentCategories.flatMap(c =>
        c.documents.flatMap(d => d.required ? (d.isSplit ? [`${d.type}_front`, `${d.type}_back`] : [d.type]) : [])
    );
    const totalRequiredCount = totalRequiredDocs.length;
    const uploadedRequiredItems = totalRequiredDocs.filter(key => uploadedDocs[key]);
    const uploadedRequiredCount = uploadedRequiredItems.length;

    // Strict 100% check: all required items present AND no partial uploads anywhere
    const isFullyComplete = (uploadedRequiredCount === totalRequiredCount) && !hasAnyPartialUpload;

    // Detect if there are any changes compared to what's already saved in the backend
    const hasPendingChanges = JSON.stringify(uploadedDocs) !== JSON.stringify(candidate?.kycDocuments || {});

    const handleSubmitProfile = async () => {
        if (!isFullyComplete) return;

        setIsSubmitting(true);
        const loadingId = toast.loading("Submitting your profile...");
        
        try {
            await submitCandidateKYC();
            toast.success("Profile submitted successfully!", { id: loadingId });
            setShowSuccessModal(true);
            // Refresh profile to show new status
            const updated = await getCandidateProfile();
            setCandidate(updated.data);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } catch (error) {
            toast.error(error.message || "Failed to submit profile", { id: loadingId });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="space-y-8">
            {/* Custom Modal for Size Limit - Positioned at Top */}
            {showSizeModal && (
                <div className="fixed inset-0 z-[100] flex justify-center p-4 pt-10 md:pt-20 overflow-hidden">
                    <div
                        onClick={() => setShowSizeModal(false)}
                        className="absolute inset-0 bg-[#1A1A2E]/40 backdrop-blur-[2px]"
                    />
                    <div className="bg-white rounded-[24px] md:rounded-[32px] p-6 md:p-8 max-w-md w-full relative z-10 shadow-[0_20px_60px_rgba(0,0,0,0.15)] text-center border border-[#F4F3EF] h-fit">
                        <div className="w-12 h-12 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                            <FiAlertCircle size={28} />
                        </div>
                        <h2 className="text-xl md:text-2xl font-black text-[#1A1A2E] uppercase tracking-tight mb-2">File Too Large!</h2>
                        <p className="text-[#9B9BAD] font-bold text-[10px] md:text-xs uppercase tracking-widest leading-relaxed mb-6">
                            Please upload a document smaller than <span className="text-red-500 font-black">1 MB</span>.
                        </p>
                        <button
                            onClick={() => setShowSizeModal(false)}
                            className="w-full py-3.5 bg-[#1B4DA0] text-white rounded-xl font-black uppercase tracking-[0.2em] text-[10px] md:text-xs hover:bg-[#153b7a] transition-all active:scale-95"
                        >
                            Got it
                        </button>
                    </div>
                </div>
            )}
            {/* Success Modal - Premium Design */}
            {showSuccessModal && (
                <div className="fixed inset-0 z-[100] flex justify-center items-center p-4 overflow-hidden">
                    <div
                        onClick={() => setShowSuccessModal(false)}
                        className="absolute inset-0 bg-[#1A1A2E]/60 backdrop-blur-[4px]"
                    />
                    <div className="bg-white rounded-[32px] p-8 md:p-10 max-w-sm w-full relative z-10 shadow-[0_32px_80px_rgba(27,77,160,0.25)] text-center border-2 border-blue-50">
                        <div className="w-20 h-20 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner ring-8 ring-emerald-50/50">
                            <FiCheckCircle size={40} />
                        </div>
                        <h2 className="text-2xl md:text-3xl font-black text-[#1A1A2E] uppercase tracking-tight mb-3">Profile Submitted!</h2>
                        <p className="text-[#6B6B7E] font-bold text-[10px] md:text-xs uppercase tracking-widest leading-relaxed mb-8">
                            Your documents have been received successfully. Our team will verify them shortly.
                        </p>
                        <button
                            onClick={() => setShowSuccessModal(false)}
                            className="w-full py-4 bg-[#1B4DA0] text-white rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] md:text-xs hover:bg-[#153b7a] transition-all shadow-xl hover:shadow-blue-200 active:scale-95"
                        >
                            Back to Dashboard
                        </button>
                    </div>
                </div>
            )}

            <header className="bg-white rounded-[24px] md:rounded-[32px] p-6 md:p-8 border border-[#F4F3EF] shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50/50 rounded-full -mr-32 -mt-32" />
                <div className="relative z-10">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 text-[#1B4DA0] rounded-full mb-3 text-[10px] uppercase font-black tracking-widest">
                        <FiAward /> Portal Dashboard
                    </div>
                    <h1 className="text-2xl md:text-3xl font-black text-[#1A1A2E] uppercase tracking-tight leading-none mb-2">Welcome to Mabicons Portal</h1>
                    <p className="text-[#9B9BAD] text-[10px] md:text-xs font-black uppercase tracking-[0.1em]">
                        Max Size Per Document: <span className="text-[#1B4DA0]">1 MB</span>
                    </p>
                </div>
            </header>

            {documentCategories.map((category, catIdx) => (
                <section key={catIdx} className="space-y-4">
                    <h2 className="text-[11px] font-black text-[#1B4DA0] uppercase tracking-[0.3em] px-2">{category.title}</h2>

                    <div className="grid grid-cols-1 gap-4 md:gap-6">
                        {category.documents.map((doc) => {
                            const isFullyUploaded = getDocStatus(doc);
                            const isPartial = doc.isSplit && !isFullyUploaded && (uploadedDocs[`${doc.type}_front`] || uploadedDocs[`${doc.type}_back`]);

                            return (
                                <div
                                    key={doc.type}
                                    ref={doc.isSemester ? uniRef : null}
                                    className={`bg-white rounded-[20px] md:rounded-[24px] p-4 md:p-6 border-2 transition-all relative overflow-hidden ${isFullyUploaded
                                        ? 'border-emerald-200 bg-emerald-50/10'
                                        : 'border-[#F4F3EF] hover:border-blue-200 shadow-xs'}`}
                                >
                                    {/* COMPLETED TICK - SIMPLE & VIBRANT */}
                                    {isFullyUploaded && (
                                        <div className="absolute top-3 right-3 z-20">
                                            <div className="w-6 h-6 bg-[#10B981] rounded-full flex items-center justify-center text-white shadow-sm">
                                                <FiCheck size={14} strokeWidth={4} />
                                            </div>
                                        </div>
                                    )}

                                    <div className="relative z-10 text-left">
                                        <div className="flex-1">
                                            <h3 
                                                className={`font-black text-[#1A1A2E] text-sm md:text-[15px] uppercase tracking-tight flex items-center gap-3 ${doc.isSemester ? 'cursor-pointer hover:text-[#1B4DA0]' : ''}`}
                                                onClick={() => doc.isSemester && setIsUniversityExpanded(!isUniversityExpanded)}
                                            >
                                                <div className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all flex-shrink-0 ${isFullyUploaded ? 'bg-emerald-100 text-emerald-600' : 'bg-blue-50 text-[#1B4DA0]'}`}>
                                                    <doc.icon size={18} />
                                                </div>
                                                <span className="flex-1">{doc.label}</span>
                                                {doc.required && !isFullyUploaded && <span className="text-red-500 font-black text-xl leading-none">*</span>}
                                                {doc.isSemester && (
                                                    <div className={`transition-transform duration-300 ${isUniversityExpanded ? 'rotate-180' : ''}`}>
                                                        <FiChevronDown size={18} className="text-[#9B9BAD]" />
                                                    </div>
                                                )}
                                            </h3>
                                            <p className="text-[9px] text-[#9B9BAD] font-bold uppercase tracking-wider mt-1 opacity-80 min-h-[14px] ml-11">
                                                {doc.description}
                                            </p>

                                            <div className="mt-4">
                                                {doc.isSplit ? (
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                        {['front', 'back'].map((side) => (
                                                            <div key={side}>
                                                                <div className="flex items-center gap-1.5 ml-1 mb-1">
                                                                    <div className={`w-1.5 h-1.5 rounded-full ${uploadedDocs[`${doc.type}_${side}`] ? 'bg-emerald-500' : 'bg-blue-400'}`} />
                                                                    <p className="text-[9px] font-black uppercase text-[#1B4DA0] tracking-widest">{side} Side</p>
                                                                </div>
                                                                <DocumentActions
                                                                    docType={doc.type}
                                                                    docLabel={doc.label}
                                                                    side={side}
                                                                    uploadedDocs={uploadedDocs}
                                                                    uploading={uploading}
                                                                    handleFileChange={handleFileChange}
                                                                    handleRemoveDoc={handleRemoveDoc}
                                                                    isSplit={true}
                                                                    isMultiple={false}
                                                                />
                                                            </div>
                                                        ))}
                                                    </div>
                                                ) : doc.isSemester ? (
                                                    isUniversityExpanded ? (
                                                        <div className="space-y-4">
                                                            <div className="grid grid-cols-1 gap-2">
                                                                {[1, 2, 3, 4, 5, 6, 7, 8].map(sem => {
                                                                    const semKey = `university_marksheet_sem${sem}`;
                                                                    return (
                                                                        <div key={sem} className="flex items-center justify-between p-2 bg-[#FAFAFA] rounded-xl border border-[#F4F3EF]">
                                                                            <span className="text-[9px] font-black text-[#1A1A2E] uppercase">Sem {sem}</span>
                                                                            <div className="flex-1 max-w-[200px] px-3">
                                                                                {uploadedDocs[semKey] ? (
                                                                                    <span className="text-[8px] text-[#9B9BAD] font-bold truncate block">{uploadedDocs[semKey].name}</span>
                                                                                ) : (
                                                                                    <span className="text-[8px] text-[#9B9BAD] font-bold opacity-40 italic">Not Uploaded</span>
                                                                                )}
                                                                            </div>
                                                                            <div className="flex items-center gap-2">
                                                                                {uploadedDocs[semKey] ? (
                                                                                    <>
                                                                                        <div className="w-5 h-5 bg-emerald-500 rounded-lg flex items-center justify-center text-white">
                                                                                            <FiCheck size={12} strokeWidth={4} />
                                                                                        </div>
                                                                                        <button onClick={() => handleRemoveDoc(semKey)} className="p-1 hover:text-red-500 transition-colors">
                                                                                            <FiTrash2 size={12} />
                                                                                        </button>
                                                                                    </>
                                                                                ) : (
                                                                                    <label className="cursor-pointer">
                                                                                        <input
                                                                                            type="file"
                                                                                            className="hidden"
                                                                                            onChange={(e) => handleFileChange(e, doc.type, `Sem ${sem}`, `sem${sem}`, false)}
                                                                                        />
                                                                                        <div className="w-8 h-8 bg-blue-50 text-[#1B4DA0] rounded-lg flex items-center justify-center hover:bg-[#1B4DA0] hover:text-white transition-all">
                                                                                            <FiPlus size={18} />
                                                                                        </div>
                                                                                    </label>
                                                                                )}
                                                                            </div>
                                                                        </div>
                                                                    );
                                                                })}
                                                            </div>
                                                            <button 
                                                                onClick={(e) => { e.stopPropagation(); setIsUniversityExpanded(false); }}
                                                                className="w-full py-2.5 text-[9px] font-black uppercase text-[#9B9BAD] tracking-widest hover:text-[#1A1A2E] transition-colors"
                                                            >
                                                                Collapse List
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <div 
                                                            onClick={() => setIsUniversityExpanded(true)}
                                                            className="mt-4 p-4 bg-blue-50/50 border border-dashed border-blue-200 rounded-2xl flex items-center justify-center gap-2 cursor-pointer hover:bg-blue-50 transition-all text-[#1B4DA0] font-black text-[9px] uppercase tracking-widest"
                                                        >
                                                            <FiPlus size={14} /> Click to manage semesters
                                                        </div>
                                                    )
                                                ) : (
                                                    <DocumentActions
                                                        docType={doc.type}
                                                        docLabel={doc.label}
                                                        uploadedDocs={uploadedDocs}
                                                        uploading={uploading}
                                                        handleFileChange={handleFileChange}
                                                        handleRemoveDoc={handleRemoveDoc}
                                                        isSplit={false}
                                                        isMultiple={doc.isMultiple}
                                                    />
                                                )}

                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </section>
            ))}



            {/* Submission Section */}
            <footer className="mt-12 bg-[#EEF2FB] rounded-[24px] md:rounded-[32px] p-6 md:p-8 border border-[#D1D9F0] flex items-center justify-center shadow-xs">
                
                {candidate?.bgvStatus === 'KYC Submitted' && !hasPendingChanges ? (
                    <div className="flex items-center gap-3 px-8 py-4 bg-emerald-50 border-2 border-emerald-100 rounded-2xl text-emerald-600 font-black text-xs uppercase tracking-widest shadow-sm">
                        <FiCheckCircle size={20} /> Application Under Review
                    </div>
                ) : (
                    <button
                        onClick={handleSubmitProfile}
                        disabled={!isFullyComplete || isSubmitting || (candidate?.bgvStatus === 'KYC Submitted' && !hasPendingChanges)}
                        className={`px-10 py-5 rounded-2xl font-black text-xs transition-all flex items-center gap-3 uppercase tracking-widest shadow-lg ${isFullyComplete && !isSubmitting && (candidate?.bgvStatus !== 'KYC Submitted' || hasPendingChanges)
                            ? 'bg-[#1B4DA0] text-white hover:bg-[#153b7a] hover:scale-105'
                            : 'bg-[#1B4DA0]/10 text-[#1B4DA0]/30 cursor-not-allowed'}`}
                    >
                        {isSubmitting ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                {candidate?.bgvStatus === 'KYC Submitted' ? 'Updating...' : 'Submitting...'}
                            </>
                        ) : (
                            <>
                                <FiCheckCircle size={20} /> 
                                {candidate?.bgvStatus === 'KYC Submitted' ? 'Update Submission' : 'Submit Profile'}
                            </>
                        )}
                    </button>
                )}
            </footer>
        </div>
    );
};

const DocumentActions = ({
    docType, docLabel, side, uploadedDocs, uploading, handleFileChange, handleRemoveDoc, isSplit, isMultiple
}) => {
    const isLoading = uploading[isMultiple ? docType : (side ? `${docType}_${side}` : docType)];

    // For multiple uploads, we find all keys that match the pattern
    const matchingKeys = isMultiple
        ? Object.keys(uploadedDocs).filter(key => key.startsWith(`${docType}_`))
        : (side ? [`${docType}_${side}`] : [docType]);

    return (
        <div className="space-y-3">
            {/* List of uploaded files */}
            {matchingKeys.map((key) => {
                const doc = uploadedDocs[key];
                if (!doc) return null;
                
                return (
                    <div 
                        key={key}
                        className="flex items-center gap-3 bg-[#FAFAFA] px-3 py-2 rounded-xl border border-[#F4F3EF] shadow-xs"
                    >
                        <FiFileText className="text-[#1B4DA0] shrink-0" size={14} />
                        <span className="truncate flex-1 text-[10px] font-black text-[#1A1A2E] uppercase">{doc.name || doc.fileName}</span>
                        <div className="flex items-center gap-1">
                            <div className="w-4 h-4 bg-emerald-500 rounded-full flex items-center justify-center text-white text-[8px] font-bold">
                                <FiCheck />
                            </div>
                            <button onClick={() => handleRemoveDoc(key)} className="p-1.5 text-slate-400 hover:text-red-500 transition-colors">
                                <FiTrash2 size={14} />
                            </button>
                        </div>
                    </div>
                );
            })}

            {/* Upload Button - Hidden if single/split and already uploaded, always visible if multiple */}
            {(isMultiple || matchingKeys.every(k => !uploadedDocs[k])) && (
                <label className="block cursor-pointer group">
                    <input
                        type="file"
                        className="hidden"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={(e) => handleFileChange(e, docType, docLabel, side, isMultiple)}
                        disabled={isLoading}
                    />
                    <div className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-black text-[9px] uppercase tracking-widest transition-all border ${isLoading
                        ? 'bg-slate-100 text-slate-400 border-slate-200'
                        : 'bg-[#EEF2FB] text-[#1B4DA0] border-[#D1D9F0] group-hover:bg-white group-hover:border-blue-300 active:scale-95'}`}>
                        {isLoading ? 'Uploading...' : <><FiUploadCloud size={14} /> {isMultiple && matchingKeys.length > 0 ? 'Add Another' : 'Upload Now'}</>}
                    </div>
                </label>
            )}
        </div>
    );
};

export default CandidateDashboard;
