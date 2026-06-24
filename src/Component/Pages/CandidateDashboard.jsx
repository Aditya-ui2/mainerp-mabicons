import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    FiFileText, FiUploadCloud, FiCheckCircle, FiCheck,
    FiClock, FiAlertCircle, FiLogOut, FiCreditCard, FiDollarSign,
    FiBook, FiBriefcase, FiAward, FiShield, FiTrash2, FiX, FiPlus, FiChevronDown,
    FiInfo, FiEye
} from 'react-icons/fi';
// Framer motion removed for static UI
import { toast } from 'sonner';
import { IndianRupee } from 'lucide-react';
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

    if (loading) return (
        <div className="min-h-screen bg-[#F8F9FA] flex items-center justify-center p-6">
            <div className="w-8 h-8 border-4 border-[#1B4DA0] border-t-transparent rounded-full animate-spin" />
        </div>
    );

    const hasRejectedDocs = candidate?.kycDocuments && Object.values(candidate.kycDocuments).some(doc => doc && doc.verified === false);
    const isSubmitted = candidate?.bgvStatus &&
        ['Document submitted', 'pending review', 'verified', 'approved', 'completed'].includes(candidate.bgvStatus.toLowerCase()) &&
        !hasRejectedDocs;

    return (
        <div className="min-h-screen bg-[#F0F2F5] md:py-10 flex justify-center overflow-x-hidden">
            <div className="w-full max-w-[450px] bg-white min-h-screen md:min-h-[85vh] md:rounded-[32px] shadow-2xl relative flex flex-col overflow-hidden border border-slate-200">

                <header className="sticky top-0 z-[60] bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between">
                    <img src={logo} alt="Mabicons" className="h-6 w-auto" />
                    <button
                        onClick={handleLogout}
                        className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                    >
                        <FiLogOut size={18} />
                    </button>
                </header>

                <div className="flex-1 overflow-y-auto px-5 py-8 pb-32 space-y-8 custom-scrollbar">
                    {candidate?.offerLetterUrl && (
                        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-[24px] p-5 shadow-sm space-y-4 text-left">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-[#1B4DA0] text-white flex items-center justify-center shadow-md shadow-blue-500/20">
                                    <FiFileText size={20} />
                                </div>
                                <div className="space-y-0.5">
                                    <h3 className="text-sm font-bold text-slate-800">Your Offer Letter</h3>
                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Available for Download</p>
                                </div>
                            </div>
                            <div className="flex items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-blue-50">
                                <span className="text-[10px] font-bold text-blue-700 truncate max-w-[200px] uppercase tracking-wider">
                                    {candidate.offerLetterFileName || 'Offer_Letter.pdf'}
                                </span>
                                <a
                                    href={`${BASE_URL}${candidate.offerLetterUrl}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="bg-[#1B4DA0] hover:bg-[#153b7a] text-white px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest shadow-md transition-all flex items-center gap-1.5"
                                >
                                    Download
                                </a>
                            </div>
                        </div>
                    )}

                    {candidate?.joiningDate && (
                        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-100 rounded-[24px] p-5 shadow-sm space-y-4 text-left">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-500/20">
                                    <FiClock size={20} />
                                </div>
                                <div className="space-y-0.5">
                                    <h3 className="text-sm font-bold text-slate-800">Your Joining Date</h3>
                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Official Date of Joining</p>
                                </div>
                            </div>
                            <div className="bg-white p-4 rounded-xl border border-indigo-50 flex items-center justify-between">
                                <span className="text-sm font-extrabold text-indigo-950">
                                    {new Date(candidate.joiningDate).toLocaleDateString('en-US', {
                                        month: 'long',
                                        day: 'numeric',
                                        year: 'numeric'
                                    })}
                                </span>
                                <span className={`text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg flex items-center gap-1 border ${candidate.joiningStatus === 'Joined'
                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                                    : candidate.joiningStatus === 'Not Joined'
                                        ? 'bg-rose-50 text-rose-700 border-rose-100'
                                        : candidate.joiningStatus === 'Rescheduled'
                                            ? 'bg-amber-50 text-amber-700 border-amber-100'
                                            : 'bg-indigo-50 text-indigo-700 border-indigo-100'
                                    }`}>
                                    {candidate.joiningStatus === 'Rescheduled' && <FiClock size={12} strokeWidth={3} />}
                                    {candidate.joiningStatus === 'Joined' && <FiCheck size={12} strokeWidth={3} />}
                                    {candidate.joiningStatus === 'Not Joined' && <FiX size={12} strokeWidth={3} />}
                                    {!['Joined', 'Not Joined', 'Rescheduled'].includes(candidate.joiningStatus) && <FiCheck size={12} strokeWidth={3} />}
                                    {candidate.joiningStatus || 'Scheduled'}
                                </span>
                            </div>
                        </div>
                    )}

                    {isSubmitted ? (
                        <div className="flex flex-col items-center justify-center py-16 px-4 text-center space-y-6">
                            <div className="w-16 h-16 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-2 shadow-sm animate-pulse">
                                <FiCheckCircle size={32} />
                            </div>
                            <div className="space-y-2">
                                <h2 className="text-xl font-bold text-slate-900">Upload Complete</h2>
                                <p className="text-slate-500 text-[11px] leading-relaxed max-w-[280px] mx-auto font-medium">
                                    Your documents have been submitted for verification. We are currently reviewing your details.
                                </p>
                            </div>
                            <div className="w-full pt-6 border-t border-slate-100 text-left space-y-3">
                                <div className="flex justify-between items-center bg-slate-50 p-4 rounded-2xl">
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Verification Status</span>
                                    <span className="text-[10px] font-black uppercase tracking-widest bg-emerald-50 text-emerald-600 border border-emerald-100 px-3 py-1.5 rounded-lg">
                                        {candidate.bgvStatus || 'Document Submitted'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <>
                            <div className="space-y-1 text-center">
                                <h1 className="text-xl font-bold text-slate-900">Welcome to Mabicons</h1>
                                <p className="text-[11px] text-slate-500 font-medium uppercase tracking-[0.2em]">Upload the documents</p>
                            </div>

                            {/* Upload Guidelines Card */}
                            <div className="bg-white rounded-[24px] border border-slate-100 p-6 shadow-sm space-y-4">
                                <div className="flex items-center gap-3">
                                    <h2 className="text-sm font-bold text-slate-800">Upload Guidelines</h2>
                                </div>

                                <div className="divide-y divide-slate-50">
                                    {[
                                        { icon: FiCheckCircle, text: "Suitable documents are mandatory." },
                                        { icon: FiFileText, text: (<>Each document must be less than <span className="font-bold">1MB</span>.</>) },
                                        { icon: FiFileText, text: "Accepted formats: PDF, JPG, PNG" },
                                        { icon: FiEye, text: "Ensure documents are clear and readable." },
                                        { icon: FiShield, text: "All uploads are secure and confidential." },
                                    ].map((item, idx) => (
                                        <div key={idx} className="flex items-center gap-4 py-3 first:pt-0 last:pb-0 text-left">
                                            <item.icon className="text-slate-400" size={14} />
                                            <span className="text-[11px] font-medium text-slate-500">{item.text}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <DocumentsUpload
                                candidate={candidate}
                                setCandidate={setCandidate}
                                isSubmitting={isSubmitting}
                                setIsSubmitting={setIsSubmitting}
                            />
                        </>
                    )}
                </div>
            </div>
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
                { type: 'university_marksheet', label: 'University Marksheet', icon: FiAward, required: false, isSemester: true, description: 'Semester-wise Marksheets' },
                { type: 'degree', label: 'Degree Certificate', icon: FiAward, required: false, description: 'Highest qualification degree' },
            ]
        },
        {
            title: 'Financial Documents',
            documents: [
                { type: 'payslips', label: 'Pay Slips', icon: IndianRupee, required: false, description: 'Last 3 months pay slips' },
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

        if (file.size > 1 * 1024 * 1024) {
            setShowSizeModal(true);
            e.target.value = '';
            return;
        }

        const uploadKey = side ? `${docType}_${side}` : docType;
        setUploading(prev => ({ ...prev, [uploadKey]: true }));

        const formData = new FormData();
        formData.append('document', file);
        formData.append('docType', docType);
        if (side) formData.append('side', side);

        try {
            const response = await uploadCandidateKYC(formData);
            setUploadedDocs(prev => {
                const newDocs = {
                    ...prev,
                    [uploadKey]: { name: file.name, url: response?.url || null }
                };
                if (setCandidate) {
                    setCandidate(cand => cand ? { ...cand, kycDocuments: newDocs } : cand);
                }
                return newDocs;
            });
            toast.success(`${docLabel} uploaded!`);
        } catch (err) {
            toast.error('Upload failed.');
        } finally {
            setUploading(prev => ({ ...prev, [uploadKey]: false }));
        }
    };

    const handleRemoveDoc = (uploadKey) => {
        setUploadedDocs(prev => {
            const updated = { ...prev };
            delete updated[uploadKey];
            if (setCandidate) {
                setCandidate(cand => cand ? { ...cand, kycDocuments: updated } : cand);
            }
            return updated;
        });
    };

    const getDocStatus = (doc) => {
        if (doc.isSemester) {
            const semKeys = Object.keys(uploadedDocs).filter(key => key.startsWith('university_marksheet_sem'));
            if (semKeys.length === 0) return false;
            return semKeys.every(key => uploadedDocs[key] && uploadedDocs[key].verified !== false);
        }
        if (doc.isSplit) {
            const front = uploadedDocs[`${doc.type}_front`];
            const back = uploadedDocs[`${doc.type}_back`];
            return !!(front && front.verified !== false && back && back.verified !== false);
        }
        const document = uploadedDocs[doc.type];
        return !!(document && document.verified !== false);
    };

    const totalRequiredDocs = documentCategories.flatMap(c => c.documents.flatMap(d => d.required ? (d.isSplit ? [`${d.type}_front`, `${d.type}_back`] : [d.type]) : []));
    const isFullyComplete = totalRequiredDocs.every(key => uploadedDocs[key] && uploadedDocs[key].verified !== false);

    const handleSubmitProfile = async () => {
        if (!isFullyComplete) return;
        setIsSubmitting(true);
        try {
            await submitCandidateKYC();
            if (setCandidate) {
                setCandidate(prev => ({ ...prev, bgvStatus: 'Document Submitted' }));
            }
            setShowSuccessModal(true);
        } catch (error) {
            toast.error("Failed to submit");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="space-y-6 text-left">
            {showSizeModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/20 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl p-6 max-w-[320px] w-full text-center shadow-2xl border border-slate-100">
                        <div className="w-12 h-12 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                            <FiAlertCircle size={24} />
                        </div>
                        <h2 className="text-lg font-bold text-slate-900 mb-1">File Too Large</h2>
                        <p className="text-slate-500 text-xs mb-6 leading-relaxed">Please upload a document smaller than <span className="text-red-600 font-bold">1 MB</span>.</p>
                        <button onClick={() => setShowSizeModal(false)} className="w-full py-3 bg-[#1B4DA0] text-white rounded-xl font-bold text-sm">Okay, I'll resize</button>
                    </div>
                </div>
            )}

            {showSuccessModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/20 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl p-8 max-w-[320px] w-full text-center shadow-2xl border border-slate-100">
                        <div className="w-16 h-16 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
                            <FiCheckCircle size={32} />
                        </div>
                        <h2 className="text-xl font-bold text-slate-900 mb-1">Upload Complete</h2>
                        <p className="text-slate-500 text-xs mb-8">Your documents have been submitted for verification.</p>
                        <button onClick={() => setShowSuccessModal(false)} className="w-full py-3 bg-[#1B4DA0] text-white rounded-xl font-bold text-sm">Return to Dashboard</button>
                    </div>
                </div>
            )}

            <div className="space-y-10">
                {documentCategories.map((category, catIdx) => (
                    <div key={catIdx} className="space-y-4">
                        <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] px-1">{category.title}</h3>
                        <div className="space-y-4">
                            {category.documents.map((doc, docIdx) => {
                                const isReady = getDocStatus(doc);
                                return (
                                    <div key={docIdx} className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm space-y-4">
                                        <div className="flex items-start justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${isReady ? 'bg-emerald-50 text-emerald-500' : 'bg-slate-50 text-slate-400'}`}>
                                                    <doc.icon size={20} />
                                                </div>
                                                <div className="space-y-0.5">
                                                    <h4 className="text-sm font-bold text-slate-900">{doc.label} {doc.required && <span className="text-red-500">*</span>}</h4>
                                                    <p className="text-[10px] text-slate-400 font-medium">{doc.description}</p>
                                                </div>
                                            </div>
                                            {isReady && <FiCheck className="text-emerald-500" size={18} strokeWidth={3} />}
                                        </div>
                                        <div className="pt-2">
                                            {doc.isSemester ? (
                                                <div className="space-y-3">
                                                    <button onClick={() => setIsUniversityExpanded(!isUniversityExpanded)} className="w-full py-3 bg-slate-50 text-slate-600 rounded-xl text-[11px] font-bold flex items-center justify-center gap-2 hover:bg-slate-100 transition-colors">
                                                        {isUniversityExpanded ? 'Hide Semesters' : 'Manage Semesters'}
                                                        <FiChevronDown className={`transition-transform ${isUniversityExpanded ? 'rotate-180' : ''}`} />
                                                    </button>
                                                    {isUniversityExpanded && (
                                                        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-50">
                                                            {[1, 2, 3, 4, 5, 6, 7, 8].map(sem => (
                                                                <div key={sem} className="relative">
                                                                    <DocumentActions docType="university_marksheet" docLabel={`Sem ${sem}`} side={`sem${sem}`} uploadedDocs={uploadedDocs} uploading={uploading} handleFileChange={handleFileChange} handleRemoveDoc={handleRemoveDoc} />
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            ) : doc.isSplit ? (
                                                <div className="grid grid-cols-2 gap-3">
                                                    <DocumentActions side="front" {...doc} uploadedDocs={uploadedDocs} uploading={uploading} handleFileChange={handleFileChange} handleRemoveDoc={handleRemoveDoc} docType={doc.type} docLabel={doc.label} />
                                                    <DocumentActions side="back" {...doc} uploadedDocs={uploadedDocs} uploading={uploading} handleFileChange={handleFileChange} handleRemoveDoc={handleRemoveDoc} docType={doc.type} docLabel={doc.label} />
                                                </div>
                                            ) : (
                                                <DocumentActions {...doc} uploadedDocs={uploadedDocs} uploading={uploading} handleFileChange={handleFileChange} handleRemoveDoc={handleRemoveDoc} docType={doc.type} docLabel={doc.label} />
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>

            <div className="absolute bottom-0 left-0 right-0 bg-white/90 backdrop-blur-md border-t border-slate-100 p-6">
                <button
                    onClick={handleSubmitProfile}
                    disabled={!isFullyComplete || isSubmitting}
                    className={`w-full py-4 rounded-xl font-bold text-xs uppercase tracking-[0.1em] transition-all flex items-center justify-center gap-2 shadow-lg ${isFullyComplete && !isSubmitting ? 'bg-[#1B4DA0] text-white hover:bg-[#153b7a] active:scale-95' : 'bg-slate-100 text-slate-300 cursor-not-allowed'}`}
                >
                    {isSubmitting ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><FiCheckCircle size={18} /> Submit for Verification</>}
                </button>
            </div>
        </div>
    );
};

const DocumentActions = ({ docType, docLabel, side, uploadedDocs, uploading, handleFileChange, handleRemoveDoc }) => {
    const uploadKey = side ? `${docType}_${side}` : docType;
    const isLoading = uploading[uploadKey];
    const docData = uploadedDocs[uploadKey];

    return (
        <div className="w-full">
            <input type="file" id={`input-${uploadKey}`} className="hidden" accept=".pdf,.jpg,.jpeg,.png" onChange={(e) => handleFileChange(e, docType, docLabel, side)} disabled={isLoading} />

            {docData ? (
                docData.verified === false ? (
                    <div className="space-y-1.5 w-full">
                        <div className="flex items-center gap-2 p-3 bg-rose-50 border border-rose-100 rounded-xl group/doc relative overflow-hidden">
                            <FiAlertCircle className="text-rose-500 shrink-0" size={14} />
                            <span className="text-[10px] font-bold text-rose-700 truncate flex-1 uppercase">
                                Rejected: {docData.name}
                            </span>
                            <label htmlFor={`input-${uploadKey}`} className="cursor-pointer text-rose-600 hover:bg-rose-100 p-1.5 rounded-md transition-all flex items-center gap-1" title="Re-upload">
                                <FiUploadCloud size={14} />
                            </label>
                        </div>
                        {(docData.rejectionReason || docData.comment) && (
                            <p className="text-[9px] text-rose-600 font-semibold bg-rose-50/50 p-2 rounded-lg border border-rose-100/50">
                                <span className="font-bold">Reason:</span> {docData.rejectionReason || docData.comment}
                            </p>
                        )}
                    </div>
                ) : (
                    <div className="flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-100 rounded-xl group/doc relative overflow-hidden">
                        <FiFileText className="text-emerald-500 shrink-0" size={14} />
                        <span className="text-[10px] font-bold text-emerald-700 truncate flex-1 uppercase">{docData.name}</span>
                        <label htmlFor={`input-${uploadKey}`} className="cursor-pointer text-emerald-600 hover:bg-emerald-100 p-1.5 rounded-md transition-all flex items-center gap-1">
                            <FiUploadCloud size={14} />
                            <span className="text-[8px] font-bold uppercase"> </span>
                        </label>
                    </div>
                )
            ) : (
                <label htmlFor={`input-${uploadKey}`} className="cursor-pointer block group">
                    <div className={`w-full py-3.5 rounded-xl border-2 border-dashed flex flex-col items-center justify-center gap-1.5 transition-all ${isLoading ? 'bg-slate-50 border-slate-200' : 'bg-slate-50 border-slate-200 group-hover:border-[#1B4DA0] group-hover:bg-blue-50/30'}`}>
                        {isLoading ? <div className="w-4 h-4 border-2 border-[#1B4DA0] border-t-transparent rounded-full animate-spin" /> : <><FiUploadCloud className="text-slate-400 group-hover:text-[#1B4DA0]" size={18} /><span className="text-[9px] font-bold text-slate-400 group-hover:text-[#1B4DA0] uppercase tracking-wider">{side ? side : 'Upload'}</span></>}
                    </div>
                </label>
            )}
        </div>
    );
};

export default CandidateDashboard;
