import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiSearch,
  FiStar,
  FiCalendar,
  FiMessageSquare,
  FiAlertCircle,
  FiCheckCircle,
  FiX,
  FiUser,
  FiChevronDown,
  FiChevronRight,
  FiCheck,
  FiBriefcase,
  FiMapPin,
  FiUsers,
  FiDollarSign,
  FiCamera
} from 'react-icons/fi';
import { getAllClients, getClientReviews, createClientReview, createClientMeeting } from '../../../service/api';
import { toast } from 'react-hot-toast';
import { createPortal } from 'react-dom';
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const InfoItem = ({ label, value, subValue, fullWidth = false, isEditing, onChange, type = "text" }) => (
  <div className={`space-y-1.5 ${fullWidth ? 'col-span-full' : ''}`}>
    <label className="text-[10px] font-bold text-[#9B9BAD] uppercase tracking-[2px]">{label}</label>
    <div className="bg-white px-4 py-3 rounded-xl border border-[#F4F3EF]">
      {isEditing ? (
        <input
          type={type}
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          className="w-full text-sm font-bold text-[#1A1A2E] bg-transparent border-none focus:outline-none"
        />
      ) : (
        <>
          <p className="text-sm font-bold text-[#1A1A2E]">{value || 'N/A'}</p>
          {subValue && <p className="text-[10px] font-medium text-[#6B6B7E] mt-0.5">{subValue}</p>}
        </>
      )}
    </div>
  </div>
);

/* ─── Star Rating Row ─── */
const StarRatingRow = ({ label, value, onChange, sectionTag }) => (
  <div className="space-y-2">
    {sectionTag && (
      <span className="inline-block px-3 py-0.5 rounded-full bg-[#EEF2FB] text-[#1B4DA0] text-[10px] font-black uppercase tracking-widest mb-1">
        {sectionTag}
      </span>
    )}
    <label className="text-[10px] font-black uppercase tracking-[2.5px] text-[#9B9BAD] block">{label}</label>
    <div className="flex items-center gap-2">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          className="transition-all hover:scale-125 focus:outline-none"
        >
          <span className={`text-3xl ${star <= value ? 'text-[#D4AF37]' : 'text-[#E2E8F0]'}`}>★</span>
        </button>
      ))}
      <div className="ml-2 px-2.5 py-0.5 rounded-full bg-[#1B4DA0] text-white text-[11px] font-bold">
        {value}/5
      </div>
    </div>
  </div>
);

const getClientAllowedServices = (c) => {
  if (!c) return ['recruitment', 'operations'];
  if (c.allowedServices) return c.allowedServices;
  
  // Determine from workAgreements if present
  const scopes = c.workAgreements?.[0]?.allowedScopes || [];
  const hasRec = scopes.some(s => s.toLowerCase().includes('recruitment'));
  const hasOps = scopes.some(s => s.toLowerCase().includes('operation'));
  
  let allowed = [];
  if (scopes.length > 0) {
    if (hasRec) allowed.push('recruitment');
    if (hasOps) allowed.push('operations');
  } else {
    const type = (c.agreementType || '').toLowerCase();
    const recMatch = type.includes('recruitment');
    const opsMatch = type.includes('operation');
    if (recMatch) allowed.push('recruitment');
    if (opsMatch) allowed.push('operations');
    if (allowed.length === 0) {
      allowed = ['recruitment', 'operations'];
    }
  }
  return allowed;
};

const downloadReviewPDF = (client, review) => {
  if (!client || !review) return;
  const doc = new jsPDF();
  
  doc.setFontSize(18);
  doc.text(`${client.companyName || client.name} Review Report`, 14, 20);
  
  const services = getClientAllowedServices(client);
  const hasRec = services.includes('recruitment');
  const hasOps = services.includes('operations');
  
  const tableBody = [
    ["Client Name", client.companyName || client.name],
    ["SPOC Name", client.spocName || "N/A"],
    ["Review Date", review.reviewDate || review.date || "N/A"],
    ["Next Review Date", review.nextReviewDate || "Pending"],
    ["Review Type", (review.reviewType || "monthly").toUpperCase()],
    ["Overall Satisfaction Index", `${review.overallSatisfaction ?? review.rating ?? 5}/5`],
    ["SPOC Communication & Responsiveness", `${review.spocCommunication ?? 5}/5`],
  ];
  
  if (hasRec) {
    tableBody.push(
      ["Candidate Profile Quality", `${review.candidateProfileQuality ?? 5}/5`],
      ["Sourcing Speed & Time-to-Hire", `${review.sourcingSpeed ?? 5}/5`]
    );
  }
  
  if (hasOps) {
    tableBody.push(
      ["Payroll Accuracy & Timeliness", `${review.payrollAccuracy ?? 5}/5`],
      ["Compliance & Legal Management", `${review.complianceManagement ?? 5}/5`]
    );
  }
  
  tableBody.push(
    ["Feedback & Comments", review.feedback || "-"],
    ["Highlights & Achievements", review.highlights || "-"],
    ["Action Items & Next Steps", review.actionItems || "-"]
  );

  autoTable(doc, {
    startY: 30,
    head: [["Metric / Info", "Details"]],
    body: tableBody,
  });

  doc.save(`${client.companyName || client.name}-Review-Report.pdf`);
};

const ClientReviewTab = ({
      notificationBell,
      clientId,
      clientData
  }) => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('ALL');

  const [selectedMonth, setSelectedMonth] = useState("");
  const [selectedYear, setSelectedYear] = useState(
    new Date().getFullYear().toString()
  );
  const [selectedWeek, setSelectedWeek] = useState("");

  // Client Detail Drawer
  const [selectedClientDetail, setSelectedClientDetail] = useState(null);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [reviewClient, setReviewClient] = useState(null);

  const defaultReviewData = {
    // General ratings
    overallSatisfaction: 5,
    spocCommunication: 5,
    // Recruitment Services
    candidateProfileQuality: 5,
    sourcingSpeed: 5,
    // Operations Services
    payrollAccuracy: 5,
    complianceManagement: 5,
    // Dates
    reviewDate: '',
    nextReviewDate: '',
    reviewType: "monthly",
    // Text fields
    feedback: '',
    highlights: '',
    actionItems: '',
    // Options
    needMeeting: false,
  };

  const [reviewData, setReviewData] = useState(defaultReviewData);

  const setField = (key, val) => setReviewData(prev => ({ ...prev, [key]: val }));

  const openReviewModal = (client) => {
    setReviewClient(client);

    const clientId = client.id || client._id;
    const clientReviews = reviewsHistory[clientId] || [];
    const currentMonth = new Date().toISOString().slice(0, 7);
    const existingReview = clientReviews.find(r => r.reviewMonth === currentMonth);
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    const nextMonth = new Date();
    nextMonth.setMonth(nextMonth.getMonth() + 1);

    if (existingReview) {
      setReviewData({
        overallSatisfaction: existingReview.overallSatisfaction ?? existingReview.rating ?? 5,
        spocCommunication: existingReview.spocCommunication ?? 5,
        candidateProfileQuality: existingReview.candidateProfileQuality ?? 5,
        sourcingSpeed: existingReview.sourcingSpeed ?? 5,
        payrollAccuracy: existingReview.payrollAccuracy ?? 5,
        complianceManagement: existingReview.complianceManagement ?? 5,
        reviewDate: existingReview.reviewDate || (existingReview.createdAt ? new Date(existingReview.createdAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]),
        nextReviewDate: existingReview.nextReviewDate || '',
        reviewType: existingReview.reviewType || "monthly",
        feedback: existingReview.feedback || '',
        highlights: existingReview.highlights || '',
        actionItems: existingReview.actionItems || '',
        needMeeting: false,
      });
    } else {
       
       
      setReviewData({
        ...defaultReviewData,
        reviewDate: todayStr,
        nextReviewDate: nextMonth.toISOString().split('T')[0],
        reviewType: reviewData.reviewType || "monthly"
      });
    }

    setIsReviewModalOpen(true);
  }; 
  const closeReviewModal = () => {
    setIsReviewModalOpen(false);
    setReviewClient(null);
  };

  const handleSaveReview = async () => {
    if (!reviewClient) { toast.error("No client selected."); return; }
    const clientId = reviewClient.id || reviewClient._id;
    if (!reviewData.reviewDate) { toast.error("Please select a review date."); return; }

    setIsSaving(true);
    try {
      const services = getClientAllowedServices(reviewClient);
      const hasRec = services.includes('recruitment');
      const hasOps = services.includes('operations');

      let sum = reviewData.overallSatisfaction + reviewData.spocCommunication;
      let count = 2;

      if (hasRec) {
        sum += reviewData.candidateProfileQuality + reviewData.sourcingSpeed;
        count += 2;
      }
      if (hasOps) {
        sum += reviewData.payrollAccuracy + reviewData.complianceManagement;
        count += 2;
      }

      const avgRating = Math.round(sum / count);

      const payload = {
        clientId,
        reviewType: reviewData.reviewType,
        rating: avgRating,
        overallSatisfaction: reviewData.overallSatisfaction,
        spocCommunication: reviewData.spocCommunication,
        candidateProfileQuality: reviewData.candidateProfileQuality,
        sourcingSpeed: reviewData.sourcingSpeed,
        payrollAccuracy: reviewData.payrollAccuracy,
        complianceManagement: reviewData.complianceManagement,
        feedback: reviewData.feedback,
        highlights: reviewData.highlights,
        actionItems: reviewData.actionItems,
        reviewDate: reviewData.reviewDate,
        nextReviewDate: reviewData.nextReviewDate,
      };

      const res = await createClientReview(payload);
      if (res && res.success) {
        if (reviewData.needMeeting) {
          try {
            await createClientMeeting({
              title: 'Client Review Follow-up',
              clientId,
              meetingDate: reviewData.reviewDate,
              meetingTime: '10:00',
              meetingType: 'Virtual',
              platform: 'Zoom Meeting',
              attendees: 2,
            });
            toast.success("Meeting scheduled successfully!");
          } catch (e) { console.error("Failed to schedule meeting:", e); }
        }
        toast.success(res.message || "Review saved successfully!");
        closeReviewModal();
        await loadClientReviews(clientId);
      } else {
        toast.error("Failed to save review.");
      }
    } catch (error) {
      console.error("Save review error:", error);
      toast.error(error.message || "An error occurred while saving the review.");
    } finally {
      setIsSaving(false);
    }
  };

  const downloadMonthReport = () => {
  const reviews =
    reviewsHistory[
      selectedClientDetail.id ||
      selectedClientDetail._id
    ] || [];

  const filtered = reviews.filter((r) => {
    const d = new Date(r.reviewDate);

    return (
      String(d.getMonth() + 1).padStart(2, "0") === selectedMonth &&
      String(d.getFullYear()) === selectedYear
    );
  });

  if (!filtered.length) {
    toast.error("No monthly reviews found");
    return;
  }

  downloadReviewPDF(selectedClientDetail, filtered[0]);
};

const downloadYearReport = () => {
  const reviews =
    reviewsHistory[
      selectedClientDetail.id ||
      selectedClientDetail._id
    ] || [];

  const filtered = reviews.filter((r) => {
    const d = new Date(r.reviewDate);
    return String(d.getFullYear()) === selectedYear;
  });

  if (!filtered.length) {
    toast.error("No yearly reviews found");
    return;
  }

  downloadReviewPDF(selectedClientDetail, filtered[0]);
};

const downloadWeekReport = () => {
  const reviews =
    reviewsHistory[
      selectedClientDetail.id ||
      selectedClientDetail._id
    ] || [];

  const filtered = reviews.filter((r) => {
    const reviewDate = new Date(r.reviewDate);

    const weekStart = new Date(selectedWeek);
    const weekEnd = new Date(selectedWeek);

    weekEnd.setDate(weekEnd.getDate() + 6);

    return (
      reviewDate >= weekStart &&
      reviewDate <= weekEnd &&
      r.reviewType === "weekly"
    );
  });

  if (!filtered.length) {
    toast.error("No weekly reviews found");
    return;
  }

  const doc = new jsPDF();

  doc.setFontSize(18);
  doc.text(
    `${selectedClientDetail.companyName} Weekly Review Report`,
    14,
    20
  );

  autoTable(doc, {
    startY: 35,
    head: [[
      "Date",
      "Rating",
      "Feedback",
      "Highlights"
    ]],
    body: filtered.map((r) => [
      r.reviewDate,
      r.overallSatisfaction || r.rating,
      r.feedback || "-",
      r.highlights || "-"
    ])
  });

  doc.save(
    `${selectedClientDetail.companyName}-Weekly-Report.pdf`
  );
};

  const getNextReviewDate = (createdAt) => {
    try {
      if (!createdAt) return null;
      const date = new Date(createdAt);
      if (isNaN(date.getTime())) return null;
      date.setMonth(date.getMonth() + 1);
      return date;
    } catch (e) { return null; }
  };

  const [reviewsHistory, setReviewsHistory] = useState({});

  useEffect(() => {
      fetchClients();
  }, [clientData]);
   

  const loadClientReviews = async (clientId) => {
    try {
      const res = await getClientReviews(clientId);
      setReviewsHistory(prev => ({ ...prev, [clientId]: res.data || [] }));
    } catch (error) { console.log(error); }
  };

  const MOCK_REVIEWS = [
    { id: 'mock1', _id: 'mock1', companyName: 'Acme Corp', spocName: 'John Doe', city: 'Mumbai', industry: 'E-Commerce' },
    { id: 'mock2', _id: 'mock2', companyName: 'Stark Industries', spocName: 'Tony Stark', city: 'New York', industry: 'Defense' },
    { id: 'mock3', _id: 'mock3', companyName: 'Wayne Enterprises', spocName: 'Bruce Wayne', city: 'Gotham', industry: 'Investment' },
    { id: 'mock4', _id: 'mock4', companyName: 'Cyberdyne Systems', spocName: 'Miles Dyson', city: 'Los Angeles', industry: 'Robotics' },
  ];

  const fetchClients = async () => {
    try {
        setLoading(true);

        if (clientData) {
            setClients([clientData]);

            const id = clientData._id || clientData.id;
            await loadClientReviews(id);

            return;
        }

        const res = await getAllClients();

        if (res?.success) {
          const clientList = res.data.clients || [];

          setClients(clientList);

          for (const client of clientList) {
              const id = client._id || client.id;
              await loadClientReviews(id);
          }
      }
    } catch (error) {
        console.log(error);
    } finally {
        setLoading(false);
    }
};

  const filteredClients = clients.filter(c => {

    const name = c.companyName || c.name || '';
    const matchesSearch =
      name.toLowerCase().includes(search.toLowerCase()) ||
      (c.spocName || '').toLowerCase().includes(search.toLowerCase());
    const clientReviews = reviewsHistory[c.id || c._id] || [];
    const currentMonth = new Date().toISOString().slice(0, 7);
    const isReviewed = clientReviews.some(r => r.reviewMonth === currentMonth);
    if (selectedStatus === 'NEEDS REVIEW') return matchesSearch && !isReviewed;
    if (selectedStatus === 'COMPLETED') return matchesSearch && isReviewed;
    return matchesSearch;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header */}
       <div className="flex items-center justify-between mb-6">

      <div>
        <h2
          className="text-2xl font-bold text-[#1A1A2E]"
          style={{ fontFamily: "'Syne', sans-serif" }}
        >
          Client Reviews
        </h2>
      </div>

      <div className="flex items-center gap-4">

        <button className="w-[44px] h-[44px] rounded-[14px] bg-[#FFFDF8] border border-[#E7D7A5] flex items-center justify-center shadow-sm hover:shadow-md transition-all">
          {notificationBell}
        </button>

        {clientData && (
          <button
            onClick={() => openReviewModal(clientData)}
            className="h-[44px] px-6 rounded-[14px] bg-[#1B4DA0] text-white text-xs font-bold uppercase tracking-wider shadow-md hover:bg-[#16408A] transition-all flex items-center gap-2"
          >
            <span className="text-[18px]">+</span>
            Add Feedback
          </button>
        )}

      </div>

    </div>
           

      {/* Filter Bar */}
      <div className="bg-white rounded-[24px] p-2 border border-[#F4F3EF] shadow-sm flex items-center gap-3 flex-wrap mb-8">
        <div className="relative flex-1 group min-w-[200px]">
          <FiSearch className="absolute left-5 top-1/2 -translate-y-1/2 text-[#9B9BAD] transition-colors" size={18} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search clients..."
            className="w-full bg-[#F4F3EF] border-none rounded-2xl py-3 pl-14 pr-5 text-sm font-medium focus:ring-2 focus:ring-[#F4F3EF] outline-none transition-all placeholder:text-[#9B9BAD]"
          />
        </div>
         
      </div>

      {/* Client Table */}
      <div className="bg-white rounded-[32px] shadow-sm border border-[#F4F3EF] overflow-hidden text-left">
        <div className="overflow-x-auto min-h-[400px]">
          {loading ? (
            <div className="py-20 text-center flex flex-col items-center justify-center">
              <div className="w-10 h-10 border-4 border-[#1B4DA0] border-t-transparent rounded-full animate-spin mb-4" />
              <p className="text-[11px] font-black text-[#9B9BAD] uppercase tracking-[3px]">Loading clients...</p>
            </div>
          ) : filteredClients.length === 0 ? (
            <div className="py-20 text-center flex flex-col items-center justify-center">
              <div className="w-16 h-16 bg-[#F4F3EF] rounded-full flex items-center justify-center mb-6 text-[#1B4DA0]">
                <FiAlertCircle size={28} />
              </div>
              <h3 className="text-lg font-bold text-[#1A1A2E] mb-2">No reviews match</h3>
              <p className="text-xs text-[#9B9BAD] max-w-xs leading-relaxed">No reviews found matching the search criteria.</p>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#F4F3EF] bg-transparent">
                  <th className="px-8 py-4 text-[11px] font-bold text-[#94a3b8] uppercase tracking-widest text-left">Client</th>
                  <th className="px-8 py-4 text-[11px] font-bold text-[#94a3b8] uppercase tracking-widest text-left">SPOC</th>
                  <th className="px-8 py-4 text-[11px] font-bold text-[#94a3b8] uppercase tracking-widest text-left">Rating</th>
                  <th className="px-8 py-4 text-[11px] font-bold text-[#94a3b8] uppercase tracking-widest text-center">Next Review</th>
                  <th className="px-8 py-4 text-[11px] font-bold text-[#94a3b8] uppercase tracking-widest text-center">Status</th>
                  <th className="px-8 py-4 text-[11px] font-bold text-[#94a3b8] uppercase tracking-widest text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F4F3EF]">
                {filteredClients.map((c) => {
                  const clientId = c.id || c._id;
                  const clientReviews = reviewsHistory[clientId] || [];
                  const currentMonth = new Date().toISOString().slice(0, 7);
                  const isMonthlyReviewed =
                    clientReviews.some(
                        r =>
                        r.reviewType === "monthly" &&
                        r.reviewMonth === currentMonth
                    );
                  const isReviewed = clientReviews.some(r => r.reviewMonth === currentMonth);
                  const sortedReviews = [...clientReviews].sort((a, b) => {
                    const dA = a?.createdAt ? new Date(a.createdAt).getTime() : 0;
                    const dB = b?.createdAt ? new Date(b.createdAt).getTime() : 0;
                    return dB - dA;
                  });
                  const latestReview = sortedReviews[0] || null;

                  const nextReviewDateObj = latestReview ? getNextReviewDate(latestReview.createdAt) : null;
                  const nextReviewDateString = nextReviewDateObj && !isNaN(nextReviewDateObj.getTime())
                    ? nextReviewDateObj.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
                    : 'Pending';

                  // Display the overall satisfaction if available, otherwise fall back to legacy rating
                  const displayRating = latestReview?.overallSatisfaction ?? latestReview?.rating ?? null;

                  return (
                    <tr
                      key={clientId}
                      onClick={() => setSelectedClientDetail(c)}
                      className="hover:bg-[#F8FAFF] transition-all group cursor-pointer"
                    >
                      <td className="px-8 py-4 text-left">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-[#EEF2FB] text-[#1B4DA0] flex items-center justify-center font-black">
                            {(c.companyName || c.name || 'C').substring(0, 2).toUpperCase()}
                          </div>
                          <p className="text-[14px] font-bold text-[#1A1A2E]">{c.companyName || c.name}</p>
                        </div>
                      </td>
                      <td className="px-8 py-4 text-left">
                        <p className="text-[13px] font-bold text-[#1A1A2E]">{c.spocName || 'N/A'}</p>
                      </td>
                      <td className="px-8 py-4 text-left">
                        <div className="flex flex-col gap-1.5">
                          {displayRating ? (
                            <div className="flex items-center gap-1">
                              {Array.from({ length: 5 }).map((_, idx) => (
                                <span key={idx} className={`text-sm ${idx < displayRating ? 'text-[#D4AF37]' : 'text-slate-200'}`}>★</span>
                              ))}
                              <span className="text-xs font-bold text-slate-400 ml-1">({displayRating}/5)</span>
                            </div>
                          ) : (
                            <span className="text-[#9B9BAD] text-[12px] font-bold">N/A</span>
                          )}
                          <div className="flex flex-wrap gap-1">
                            {getClientAllowedServices(c).map(srv => (
                              <span key={srv} className={`px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider ${
                                srv === 'recruitment' ? 'bg-blue-50 text-blue-600 border border-blue-100' : 'bg-purple-50 text-purple-600 border border-purple-100'
                              }`}>
                                {srv}
                              </span>
                            ))}
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-4 text-center">
                        <span className="text-[12px] font-bold text-[#6B6B7E]">
                          {latestReview?.nextReviewDate || nextReviewDateString}
                        </span>
                      </td>
                      <td className="px-8 py-4 text-center">
                        <span className={`px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          isReviewed
                            ? 'bg-[#10B981]/10 text-[#10B981] border border-[#10B981]/20'
                            : latestReview
                              ? 'bg-rose-50 text-rose-600 border border-rose-100'
                              : 'bg-slate-100 text-slate-600 border border-slate-200'
                        }`}>
                          {isReviewed ? 'COMPLETED' : latestReview ? `Needs Review (Due: ${nextReviewDateString})` : 'Needs Review'}
                        </span>
                      </td>
                      <td className="px-8 py-4 text-center">
                        <button
                          disabled={isMonthlyReviewed}
                          onClick={(e) => { e.stopPropagation(); if (!isMonthlyReviewed) openReviewModal(c); }}
                          className={`px-4 py-2 rounded-xl transition-all shadow-sm text-[11px] font-black uppercase tracking-widest whitespace-nowrap ${
                            isReviewed
                              ? 'bg-slate-100 text-slate-400 cursor-not-allowed opacity-50'
                              : 'bg-[#F4F3EF] text-[#1B4DA0] hover:bg-[#1B4DA0] hover:text-white active:scale-95'
                          }`}
                        >
                          Take Review
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Client Detail Side Drawer */}
      {createPortal(
        <AnimatePresence>
          {selectedClientDetail && (
            <React.Fragment>
              <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="fixed inset-0 bg-[#1A1A2E]/40 backdrop-blur-md z-[200000]"
                onClick={() => setSelectedClientDetail(null)}
              />
              <motion.div
                initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
                transition={{ type: "spring", damping: 30, stiffness: 200 }}
                className="fixed inset-y-0 right-0 w-full max-w-[698px] bg-white shadow-2xl border-l border-[#F4F3EF] flex flex-col z-[200001] overflow-hidden"
              >
                <div className="p-6 border-b border-[#F4F3EF] flex items-center justify-between bg-gradient-to-r from-blue-50/30 to-white">
                  <h3 className="text-xl font-bold text-[#1A1A2E]" style={{ fontFamily: "'Syne', sans-serif" }}>Client Review Portfolio</h3>
                  <div className="flex items-center gap-3">
                    {(() => {
                      const drawerReviews = reviewsHistory[selectedClientDetail.id || selectedClientDetail._id] || [];
                      const isReviewedDrawer = drawerReviews.some(r => r.reviewMonth === new Date().toISOString().slice(0, 7));
                      return (
                        <button
                          disabled={isReviewedDrawer}
                          onClick={() => { if (!isReviewedDrawer) openReviewModal(selectedClientDetail); }}
                          className={`px-4 py-2 rounded-xl text-sm font-bold ${isReviewedDrawer ? 'bg-slate-200 text-slate-400 cursor-not-allowed opacity-50' : 'bg-[#1B4DA0] text-white'}`}
                        >
                          Take Review
                        </button>
                      );
                    })()}
                    <button onClick={() => setSelectedClientDetail(null)} className="w-10 h-10 rounded-2xl flex items-center justify-center text-[#9B9BAD] hover:text-red-500 hover:bg-red-50 transition-all duration-300">
                      <FiX size={20} />
                    </button>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto px-10 py-8 space-y-10 custom-scrollbar text-left">
                  {/* Profile Header */}
                  <div className="flex flex-col items-center text-center">
                    <div className="w-24 h-24 rounded-[32px] flex items-center justify-center text-white text-3xl font-extrabold shadow-xl shadow-blue-500/20"
                      style={{ background: 'linear-gradient(135deg, #1B4DA0 0%, #0D47A1 100%)' }}>
                      <span>{(selectedClientDetail.companyName || selectedClientDetail.name || 'C').substring(0, 2).toUpperCase()}</span>
                    </div>
                    <div className="space-y-1.5 mt-4">
                      <h4 className="text-2xl font-bold text-[#1A1A2E] tracking-tight font-syne">{selectedClientDetail.companyName || selectedClientDetail.name}</h4>
                      <p className="text-[11px] font-bold text-[#0D47A1] uppercase tracking-[3px]">{selectedClientDetail.industry || 'Enterprise'} Sector</p>
                    </div>
                  </div>

                  {/* Satisfaction Analytics */}
                  <div className="bg-[#FAFAF8] rounded-[32px] border border-[#F4F3EF] p-8 space-y-6 shadow-sm">
                    <div className="flex items-center justify-between border-b border-[#F4F3EF] pb-4">
                      <div className="flex items-center gap-3">
                        <FiStar className="text-[#D4AF37]" size={18} />
                        <h5 className="text-[12px] font-black text-[#1A1A2E] uppercase tracking-wider">Satisfaction Analytics</h5>
                      </div>
                    </div>
                    {(() => {
                      const clientReviews = reviewsHistory[selectedClientDetail.id || selectedClientDetail._id] || [];
                      const avgRating = clientReviews.length > 0
                        ? (clientReviews.reduce((sum, r) => sum + (r.overallSatisfaction ?? r.rating ?? 0), 0) / clientReviews.length).toFixed(1)
                        : 'N/A';
                      return (
                        <div className="grid grid-cols-2 gap-6 text-center">
                          <div className="bg-white p-5 rounded-2xl border border-[#F4F3EF] shadow-sm">
                            <p className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-widest mb-2">Average Score</p>
                            <div className="flex items-center justify-center gap-1.5">
                              <span className="text-3xl font-black text-[#1A1A2E]">{avgRating}</span>
                              {avgRating !== 'N/A' && <span className="text-xl text-[#D4AF37]">★</span>}
                            </div>
                          </div>
                          <div className="bg-white p-5 rounded-2xl border border-[#F4F3EF] shadow-sm">
                            <p className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-widest mb-2">Reviews Logged</p>
                            <span className="text-3xl font-black text-[#1B4DA0]">{clientReviews.length}</span>
                          </div>
                        </div>
                      );
                    })()}
                  </div>

                  {/* Historical Review Logs */}
                  <div className="bg-white rounded-[32px] border border-[#F4F3EF] p-8 space-y-6 shadow-sm">
                    <div className="flex items-center gap-3 border-b border-[#F4F3EF] pb-4">
                      <FiMessageSquare className="text-[#1B4DA0]" size={18} />
                      <h5 className="text-[12px] font-black text-[#1A1A2E] uppercase tracking-wider">Historical Review Logs</h5>
                    </div>
                    <div className="space-y-4 max-h-[320px] overflow-y-auto custom-scrollbar pr-2">
                      {(() => {
                        const clientReviews = reviewsHistory[selectedClientDetail.id || selectedClientDetail._id] || [];
                        if (clientReviews.length === 0) {
                          return (
                            <div className="text-center py-10 text-[#9B9BAD]">
                              <FiAlertCircle size={28} className="mx-auto mb-2 opacity-35" />
                              <p className="text-xs font-bold">No historical reviews logged for this client</p>
                            </div>
                          );
                        }
                        return clientReviews.map(r => (
                          <div key={r.id} className="p-5 bg-[#FAFAF8] border border-[#F4F3EF] rounded-2xl text-left space-y-3 relative overflow-hidden">
                            <div className="flex justify-between items-center">
                              <div className="flex items-center gap-1">
                                {Array.from({ length: 5 }).map((_, idx) => (
                                  <span key={idx} className={`text-sm ${idx < (r.overallSatisfaction ?? r.rating) ? 'text-[#D4AF37]' : 'text-slate-200'}`}>★</span>
                                ))}
                              </div>
                              <span className="text-[9px] font-black text-[#9B9BAD] uppercase tracking-widest">{r.reviewDate}</span>
                            </div>
                            {r.feedback && <p className="text-[13px] font-bold text-[#4B4B5E] leading-relaxed">"{r.feedback}"</p>}
                            {r.highlights && (
                              <div className="text-[12px] text-[#4B4B5E]">
                                <span className="font-black text-[#1B4DA0] text-[10px] uppercase tracking-wider">Highlights: </span>{r.highlights}
                              </div>
                            )}
                            {r.actionItems && (
                              <div className="text-[12px] text-[#4B4B5E]">
                                <span className="font-black text-[#1B4DA0] text-[10px] uppercase tracking-wider">Action Items: </span>{r.actionItems}
                              </div>
                            )}
                            
                            {/* Detailed Sub-Ratings Breakdown */}
                            <div className="grid grid-cols-2 gap-x-4 gap-y-2 pt-3 text-[11px] font-medium text-slate-500 border-t border-[#ECEAE4]/60">
                              <div className="flex items-center justify-between">
                                <span>Overall Satisf.:</span>
                                <span className="font-bold text-slate-700">{r.overallSatisfaction ?? r.rating ?? 5}/5</span>
                              </div>
                              <div className="flex items-center justify-between">
                                <span>SPOC Comm.:</span>
                                <span className="font-bold text-slate-700">{r.spocCommunication ?? 5}/5</span>
                              </div>
                              {getClientAllowedServices(selectedClientDetail).includes('recruitment') && (
                                <>
                                  <div className="flex items-center justify-between">
                                    <span>Profile Quality:</span>
                                    <span className="font-bold text-slate-700">{r.candidateProfileQuality ?? 5}/5</span>
                                  </div>
                                  <div className="flex items-center justify-between">
                                    <span>Sourcing Speed:</span>
                                    <span className="font-bold text-slate-700">{r.sourcingSpeed ?? 5}/5</span>
                                  </div>
                                </>
                              )}
                              {getClientAllowedServices(selectedClientDetail).includes('operations') && (
                                <>
                                  <div className="flex items-center justify-between">
                                    <span>Payroll Accuracy:</span>
                                    <span className="font-bold text-slate-700">{r.payrollAccuracy ?? 5}/5</span>
                                  </div>
                                  <div className="flex items-center justify-between">
                                    <span>Compliance Mgmt:</span>
                                    <span className="font-bold text-slate-700">{r.complianceManagement ?? 5}/5</span>
                                  </div>
                                </>
                              )}
                            </div>

                            {r.actionRequired && (
                              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-rose-50 border border-rose-100 rounded-lg text-rose-600">
                                <FiAlertCircle size={10} />
                                <span className="text-[8px] font-black uppercase tracking-wider">Action Flagged</span>
                              </div>
                            )}
                          </div>
                        ));
                      })()}
                    </div>
                  </div>

                  {!clientData && (
                     <div className="bg-[#FAFAF8] rounded-[32px] border border-[#F4F3EF] p-8 shadow-sm">
                      <div className="flex items-center gap-3 border-b border-[#F4F3EF] pb-4 mb-6">
                        <FiCalendar className="text-[#1B4DA0]" size={18} />
                        <h5 className="text-[12px] font-black text-[#1A1A2E] uppercase tracking-wider">
                          Download Reports
                        </h5>
                      </div>

                      {/* Week Report */}
                      <div className="space-y-3 mb-6">
                        <label className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-[2px]">
                          Weekly Report
                        </label>

                        <input
                          type="date"
                          value={selectedWeek}
                          onChange={(e) => setSelectedWeek(e.target.value)}
                          className="w-full h-[54px] px-4 rounded-2xl border border-[#ECEAE4] bg-white focus:ring-2 focus:ring-[#1B4DA0] outline-none"
                        />

                        <button
                          onClick={downloadWeekReport}
                          className="w-full h-[52px] rounded-2xl bg-[#1B4DA0] text-white font-bold hover:bg-[#153f84] transition-all shadow-lg"
                        >
                          Download Weekly PDF
                        </button>
                      </div>

                      {/* Month & Year */}
                      <div className="space-y-4">
                        <label className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-[2px]">
                          Monthly / Yearly Reports
                        </label>

                        <div className="grid grid-cols-2 gap-4">
                          <select
                            value={selectedMonth}
                            onChange={(e) => setSelectedMonth(e.target.value)}
                            className="h-[54px] px-4 rounded-2xl border border-[#ECEAE4] bg-white"
                          >
                            <option value="">Month</option>
                            <option value="01">January</option>
                            <option value="02">February</option>
                            <option value="03">March</option>
                            <option value="04">April</option>
                            <option value="05">May</option>
                            <option value="06">June</option>
                            <option value="07">July</option>
                            <option value="08">August</option>
                            <option value="09">September</option>
                            <option value="10">October</option>
                            <option value="11">November</option>
                            <option value="12">December</option>
                          </select>

                          <select
                            value={selectedYear}
                            onChange={(e) => setSelectedYear(e.target.value)}
                            className="h-[54px] px-4 rounded-2xl border border-[#ECEAE4] bg-white"
                          >
                            <option value="2026">2026</option>
                            <option value="2025">2025</option>
                            <option value="2024">2024</option>
                          </select>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <button
                            onClick={downloadMonthReport}
                            className="h-[52px] rounded-2xl bg-[#1B4DA0] text-white font-bold hover:bg-[#153f84] transition-all shadow-lg"
                          >
                            Monthly PDF
                          </button>

                          <button
                            onClick={downloadYearReport}
                            className="h-[52px] rounded-2xl bg-[#10B981] text-white font-bold hover:bg-[#059669] transition-all shadow-lg"
                          >
                            Yearly PDF
                          </button>
                        </div>
                      </div>
                    </div>
                   )}

                  {/* Portfolio Contact Metadata */}
                  <div className="bg-[#FAFAF8] rounded-[32px] border border-[#F4F3EF] p-8 space-y-8 shadow-sm">
                    <div className="flex items-center gap-3 border-b border-[#F4F3EF] pb-4">
                      <FiUser className="text-[#1B4DA0]" size={18} />
                      <h5 className="text-[12px] font-black text-[#1A1A2E] uppercase tracking-wider">Portfolio Contact Metadata</h5>
                    </div>
                    <div className="grid grid-cols-2 gap-x-8 gap-y-6">
                      <InfoItem label="Primary SPOC" value={selectedClientDetail.spocName || 'N/A'} isEditing={false} />
                      <InfoItem label="Primary SPOC Contact" value={selectedClientDetail.spocContact || 'N/A'} isEditing={false} />
                      <InfoItem label="Client Headquarters" value={selectedClientDetail.city || 'Gurgaon / Remote'} isEditing={false} />
                      <InfoItem label="Industry Segment" value={selectedClientDetail.industry || 'IT Services / Technology'} isEditing={false} />
                    </div>
                  </div>
                </div>
              </motion.div>
            </React.Fragment>
          )}

          {/* ─── Review Modal ─── */}
          <AnimatePresence>
            {isReviewModalOpen && (
              <div
                className="fixed inset-0 z-[300000] flex items-center justify-center bg-black/60 backdrop-blur-sm"
                onClick={closeReviewModal}
              >
                <motion.div
                  initial={{ opacity: 0, scale: 0.96, y: 16 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.96, y: 16 }}
                  transition={{ type: 'spring', damping: 28, stiffness: 220 }}
                  className="bg-white rounded-[40px] shadow-2xl w-full max-w-[620px] max-h-[92vh] flex flex-col relative overflow-hidden"
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* Close */}
                  <button
                    onClick={closeReviewModal}
                    className="absolute top-6 right-6 text-gray-400 hover:text-red-500 transition z-10 bg-white rounded-full p-1 shadow-sm"
                  >
                    <FiX size={22} />
                  </button>

                  {/* Modal Header */}
                  <div className="px-10 pt-8 pb-6 border-b border-[#F4F3EF] shrink-0">
                    <h2 className="text-[28px] font-bold text-[#1A1A2E]" style={{ fontFamily: "'Syne', sans-serif" }}>
                      Monthly Client Review
                    </h2>
                    <p className="text-[#9B9BAD] mt-1 text-[13px] font-medium">
                      {reviewClient?.companyName || reviewClient?.name} — Capture feedback &amp; review performance
                    </p>
                  </div>

                  {/* Scrollable Form */}
                  <div className="flex-1 overflow-y-auto px-10 py-8 space-y-8 custom-scrollbar">

                    {/* ── General Ratings ── */}
                    <div className="bg-[#F8FAFF] border border-[#E8EDF8] rounded-[20px] p-6 space-y-6">
                      <StarRatingRow
                        label="Overall Satisfaction Index"
                        value={reviewData.overallSatisfaction}
                        onChange={(v) => setField('overallSatisfaction', v)}
                      />
                      <div className="border-t border-[#E8EDF8]" />
                      <StarRatingRow
                        label="SPOC Communication & Responsiveness"
                        value={reviewData.spocCommunication}
                        onChange={(v) => setField('spocCommunication', v)}
                      />
                    </div>

                    {/* ── Recruitment Services Ratings ── */}
                    {getClientAllowedServices(reviewClient).includes('recruitment') && (
                      <div className="bg-[#F8FAFF] border border-[#E8EDF8] rounded-[20px] p-6 space-y-6">
                        <StarRatingRow
                          label="Candidate Profile Quality"
                          value={reviewData.candidateProfileQuality}
                          onChange={(v) => setField('candidateProfileQuality', v)}
                          sectionTag="Recruitment Services"
                        />
                        <div className="border-t border-[#E8EDF8]" />
                        <StarRatingRow
                          label="Sourcing Speed & Time-to-Hire"
                          value={reviewData.sourcingSpeed}
                          onChange={(v) => setField('sourcingSpeed', v)}
                        />
                      </div>
                    )}

                    {/* ── Operations Services Ratings ── */}
                    {getClientAllowedServices(reviewClient).includes('operations') && (
                      <div className="bg-[#F8FAFF] border border-[#E8EDF8] rounded-[20px] p-6 space-y-6">
                        <StarRatingRow
                          label="Payroll Accuracy & Timeliness"
                          value={reviewData.payrollAccuracy}
                          onChange={(v) => setField('payrollAccuracy', v)}
                          sectionTag="Operations Services"
                        />
                        <div className="border-t border-[#E8EDF8]" />
                        <StarRatingRow
                          label="Compliance & Legal Management"
                          value={reviewData.complianceManagement}
                          onChange={(v) => setField('complianceManagement', v)}
                        />
                      </div>
                    )}

                    <div>
                      <label className="text-[11px] font-black uppercase tracking-[2px] text-[#9B9BAD] mb-3 block">
                        Review Type
                      </label>

                      <select
                        value={reviewData.reviewType}
                        onChange={(e) => setField("reviewType", e.target.value)}
                        className="w-full h-[56px] px-5 rounded-2xl border border-[#ECEAE4] bg-white"
                      >
                        <option value="weekly">Weekly Feedback</option>
                        <option value="monthly">Monthly Feedback</option>
                      </select>
                    </div>

                    {/* ── Dates ── */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="text-[11px] font-black uppercase tracking-[2px] text-[#9B9BAD] mb-3 block">Review Date</label>
                        <div className="relative cursor-pointer" onClick={(e) => e.currentTarget.querySelector('input')?.showPicker?.()}>
                          <input
                            type="date"
                            value={reviewData.reviewDate}
                            onChange={(e) => {
                              const newDate = e.target.value;
                              let nextDate = reviewData.nextReviewDate;
                              if (newDate) {
                                const d = new Date(newDate);
                                if (!isNaN(d.getTime())) { d.setMonth(d.getMonth() + 1); nextDate = d.toISOString().split('T')[0]; }
                              }
                              setReviewData({ ...reviewData, reviewDate: newDate, nextReviewDate: nextDate, reviewType: reviewData.reviewType });
                            }}
                            className="w-full h-[56px] px-5 rounded-2xl border border-[#ECEAE4] bg-white cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#1B4DA0] [&::-webkit-calendar-picker-indicator]:hidden"
                          />
                          <FiCalendar className="absolute right-4 top-1/2 -translate-y-1/2 text-[#1B4DA0]" size={18} />
                        </div>
                      </div>
                      <div>
                        <label className="text-[11px] font-black uppercase tracking-[2px] text-[#9B9BAD] mb-3 block">Next Review Date</label>
                        <div className="relative cursor-pointer" onClick={(e) => e.currentTarget.querySelector('input')?.showPicker?.()}>
                          <input
                            type="date"
                            value={reviewData.nextReviewDate}
                            onChange={(e) => setField('nextReviewDate', e.target.value)}
                            className="w-full h-[56px] px-5 rounded-2xl border border-[#ECEAE4] bg-white cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#1B4DA0] [&::-webkit-calendar-picker-indicator]:hidden"
                          />
                          <FiCalendar className="absolute right-4 top-1/2 -translate-y-1/2 text-[#1B4DA0]" size={18} />
                        </div>
                      </div>
                    </div>

                    {/* ── Client Feedback & Comments ── */}
                    <div>
                      <label className="text-[11px] font-black uppercase tracking-[2px] text-[#9B9BAD] mb-3 block">Client Feedback &amp; Comments</label>
                      <textarea
                        rows={3}
                        placeholder="Enter client feedback..."
                        value={reviewData.feedback}
                        onChange={(e) => setField('feedback', e.target.value)}
                        className="w-full border border-gray-200 rounded-2xl p-5 resize-none focus:outline-none focus:ring-2 focus:ring-[#1B4DA0] text-sm"
                      />
                    </div>

                    {/* ── Key Highlights & Achievements ── */}
                    <div>
                      <label className="text-[11px] font-black uppercase tracking-[2px] text-[#9B9BAD] mb-3 block">Key Highlights &amp; Achievements</label>
                      <textarea
                        rows={3}
                        placeholder="What were the main highlights or achievements this month?"
                        value={reviewData.highlights}
                        onChange={(e) => setField('highlights', e.target.value)}
                        className="w-full border border-gray-200 rounded-2xl p-5 resize-none focus:outline-none focus:ring-2 focus:ring-[#1B4DA0] text-sm"
                      />
                    </div>

                    {/* ── Action Items & Next Steps ── */}
                    <div>
                      <label className="text-[11px] font-black uppercase tracking-[2px] text-[#9B9BAD] mb-3 block">Action Items &amp; Next Steps</label>
                      <textarea
                        rows={3}
                        placeholder="What are the agreed action items for next month?"
                        value={reviewData.actionItems}
                        onChange={(e) => setField('actionItems', e.target.value)}
                        className="w-full border border-gray-200 rounded-2xl p-5 resize-none focus:outline-none focus:ring-2 focus:ring-[#1B4DA0] text-sm"
                      />
                    </div>

                    {/* ── Need Meeting ── */}
                    <div
                      className="flex items-center gap-3 bg-[#F8FAFF] p-4 rounded-2xl border border-[#EEF2FB] cursor-pointer"
                      onClick={() => setField('needMeeting', !reviewData.needMeeting)}
                    >
                      <div className="relative flex items-center">
                        <input
                          type="checkbox"
                          id="needMeeting"
                          checked={reviewData.needMeeting}
                          onChange={(e) => setField('needMeeting', e.target.checked)}
                          className="peer appearance-none w-6 h-6 border-2 border-[#1B4DA0]/20 rounded-lg checked:bg-[#1B4DA0] checked:border-[#1B4DA0] transition-colors cursor-pointer"
                          onClick={(e) => e.stopPropagation()}
                        />
                        <FiCheck className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-white opacity-0 peer-checked:opacity-100 pointer-events-none transition-opacity" size={14} />
                      </div>
                      <label htmlFor="needMeeting" className="text-sm font-bold text-[#1A1A2E] cursor-pointer select-none" onClick={(e) => e.stopPropagation()}>
                        Need Meeting <span className="text-[11px] text-[#9B9BAD] font-medium ml-2">(Auto-schedules a meeting in Client Meetings tab)</span>
                      </label>
                    </div>

                    {/* ── Save Button ── */}
                    <button
                      type="button"
                      onClick={handleSaveReview}
                      disabled={isSaving}
                      className="w-full bg-[#0D47A1] hover:bg-[#0a3a82] text-white py-4 rounded-2xl font-bold transition-all shadow-lg shadow-[#0D47A1]/20 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {isSaving ? (
                        <><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />Saving...</>
                      ) : 'Save Review'}
                    </button>

                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>
        </AnimatePresence>,
        document.body
      )}
    </div>
  );
};

export default ClientReviewTab;
