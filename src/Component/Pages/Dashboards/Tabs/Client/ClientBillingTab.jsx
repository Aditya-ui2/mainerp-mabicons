import React, { useState, useEffect } from 'react';
import { FiDownload, FiDollarSign, FiClock, FiCheckCircle, FiAlertCircle, FiTrendingUp, FiChevronRight, FiFileText, FiX, FiMail } from 'react-icons/fi';
import { FaRupeeSign } from 'react-icons/fa';
import { getFinancePaymentRequests, getFinanceInvoices, BASE_URL } from '../../../service/api';
import { StatCard } from '../../AdminLayout';
import { motion, AnimatePresence } from 'framer-motion';
import { createPortal } from 'react-dom';

const formatINR = (num) => {
  if (!num && num !== 0) return '₹0';
  return '₹' + Number(num).toLocaleString('en-IN');
};

export default function ClientBillingTab({ isDarkMode, clientData, notificationBell }) {
  const [invoices, setInvoices] = useState([]);
  const [paymentRequests, setPaymentRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeSubTab, setActiveSubTab] = useState('pending'); // 'pending' | 'all_invoices'
  const [selectedItem, setSelectedItem] = useState(null);

  useEffect(() => {
    const fetchBillingData = async () => {
      setLoading(true);
      try {
        const [requestsRes, invoicesRes] = await Promise.allSettled([
          getFinancePaymentRequests(),
          getFinanceInvoices()
        ]);

        const myClientId = clientData?.id || clientData?._id;

        if (requestsRes.status === 'fulfilled' && requestsRes.value?.data) {
          const reqs = Array.isArray(requestsRes.value.data) ? requestsRes.value.data : [];
          // Filter by client ID
          const filteredReqs = reqs.filter(r => r.clientId === myClientId);
          setPaymentRequests(filteredReqs);
        }

        if (invoicesRes.status === 'fulfilled' && invoicesRes.value?.data) {
          const invs = Array.isArray(invoicesRes.value.data) ? invoicesRes.value.data : [];
          // Filter by client ID
          const filteredInvs = invs.filter(i => i.clientId === myClientId);
          setInvoices(filteredInvs);
        }
      } catch (err) {
        console.error('Failed to load billing data:', err);
      } finally {
        setLoading(false);
      }
    };

    if (clientData) {
      fetchBillingData();
    }
  }, [clientData]);

  // Calculations
  const pendingRequests = paymentRequests.filter(r => r.status === 'Pending');
  
  // Pending Invoices
  const unpaidInvoices = invoices.filter(i => i.status !== 'Paid' && i.status !== 'Cancelled');

  return (
    <div className="p-0 min-h-screen bg-[#FDFDFD] text-left animate-in fade-in duration-500" style={{ fontFamily: 'Calibri, sans-serif' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&family=Syne:wght@400;500;600;700;800&display=swap');
        .font-syne { font-family: 'Syne', sans-serif !important; }
        .font-jakarta { font-family: 'Plus Jakarta Sans', sans-serif !important; }
      `}</style>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div className="flex flex-col items-start text-left">
          <h1 className="text-4xl font-bold text-[#1A1A2E] tracking-tight font-syne mb-1">Invoices & Payments</h1>
          <p className="text-sm font-medium text-[#9B9BAD] mt-1">Manage, track, and pay your pending outstanding requests and invoices</p>
        </div>
        {notificationBell && (
          <div className="flex items-center gap-3">
            {notificationBell}
          </div>
        )}
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <div className="relative">
            <div className="w-12 h-12 border-4 border-slate-100 rounded-full" />
            <div className="absolute inset-0 w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          </div>
          <p className="text-xs font-bold text-[#9B9BAD] uppercase tracking-widest">Loading billing overview...</p>
        </div>
      ) : (
        <div className="space-y-10">
          {/* Sub-navigation Tabs */}
          <div className="border-b border-[#F4F3EF] flex gap-8">
            <button
              onClick={() => setActiveSubTab('pending')}
              className={`pb-4 text-sm font-bold uppercase tracking-wider transition-all border-b-2 ${
                activeSubTab === 'pending'
                  ? 'border-[#1B4DA0] text-[#1A1A2E]'
                  : 'border-transparent text-[#9B9BAD] hover:text-[#1A1A2E]'
              }`}
            >
              Pending Outstanding ({pendingRequests.length + unpaidInvoices.length})
            </button>
            <button
              onClick={() => setActiveSubTab('all_invoices')}
              className={`pb-4 text-sm font-bold uppercase tracking-wider transition-all border-b-2 ${
                activeSubTab === 'all_invoices'
                  ? 'border-[#1B4DA0] text-[#1A1A2E]'
                  : 'border-transparent text-[#9B9BAD] hover:text-[#1A1A2E]'
              }`}
            >
              Invoice History ({invoices.length})
            </button>
          </div>

          {/* Lists Section */}
          <div className="bg-white rounded-[32px] border border-[#F4F3EF] overflow-hidden shadow-sm">
            {activeSubTab === 'pending' ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-[#F4F3EF]">
                      <th className="px-8 py-4 text-[10px] font-bold text-[#94a3b8] uppercase tracking-widest">Billing Reference</th>
                      <th className="px-8 py-4 text-[10px] font-bold text-[#94a3b8] uppercase tracking-widest">Notes / Description</th>
                      <th className="px-8 py-4 text-[10px] font-bold text-[#94a3b8] uppercase tracking-widest text-right">Amount</th>
                      <th className="px-8 py-4 text-[10px] font-bold text-[#94a3b8] uppercase tracking-widest text-center">Due Date</th>
                      <th className="px-8 py-4 text-[10px] font-bold text-[#94a3b8] uppercase tracking-widest text-center">Status</th>
                      <th className="px-8 py-4 text-[10px] font-bold text-[#94a3b8] uppercase tracking-widest text-center">Document</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F4F3EF]">
                    {pendingRequests.length === 0 && unpaidInvoices.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="py-16 text-center text-[#9B9BAD] text-xs font-bold uppercase tracking-widest">
                          No pending outstanding payments found
                        </td>
                      </tr>
                    ) : (
                      <>
                        {/* Render Payment Requests */}
                        {pendingRequests.map((req) => (
                          <tr key={req.id} className="hover:bg-slate-50 transition-all cursor-pointer" onClick={() => setSelectedItem({ type: 'payment_request', data: req })}>
                            <td className="px-8 py-5">
                              <span className="text-sm font-black text-[#1A1A2E]">{req.id}</span>
                            </td>
                            <td className="px-8 py-5 text-sm text-slate-500 max-w-xs truncate">
                              {req.notes || 'No description available'}
                            </td>
                            <td className="px-8 py-5 text-right font-black text-[#1A1A2E]">
                              {formatINR(req.amount)}
                            </td>
                            <td className="px-8 py-5 text-center text-sm font-bold text-slate-600">
                              {req.dueDate ? new Date(req.dueDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : 'N/A'}
                            </td>
                            <td className="px-8 py-5 text-center">
                              <span className="px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider bg-amber-50 text-amber-600 border border-amber-100">
                                {req.status}
                              </span>
                            </td>
                            <td className="px-8 py-5 text-center" onClick={(e) => e.stopPropagation()}>
                              {req.attachmentUrl ? (
                                <a
                                  href={req.attachmentUrl.startsWith('http') ? req.attachmentUrl : `${BASE_URL}${req.attachmentUrl}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 text-[#1B4DA0] hover:text-[#0D47A1] font-bold text-xs"
                                >
                                  <FiFileText size={16} />
                                  <span>View Bill</span>
                                </a>
                              ) : (
                                <span className="text-xs text-slate-400 font-medium">No Bill</span>
                              )}
                            </td>
                          </tr>
                        ))}

                        {/* Render Unpaid Invoices */}
                        {unpaidInvoices.map((inv) => (
                          <tr key={inv.id} className="hover:bg-slate-50 transition-all cursor-pointer" onClick={() => setSelectedItem({ type: 'invoice', data: inv })}>
                            <td className="px-8 py-5">
                              <span className="text-sm font-black text-[#1A1A2E]">{inv.invoiceNumber}</span>
                            </td>
                            <td className="px-8 py-5 text-sm text-slate-500 max-w-xs truncate">
                              {inv.notes || `Invoice for ${inv.companyName}`}
                            </td>
                            <td className="px-8 py-5 text-right font-black text-[#1A1A2E]">
                              {formatINR(inv.totalAmount || inv.amount)}
                            </td>
                            <td className="px-8 py-5 text-center text-sm font-bold text-slate-600">
                              {inv.dueDate ? new Date(inv.dueDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : 'N/A'}
                            </td>
                            <td className="px-8 py-5 text-center">
                              <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider border ${
                                inv.status === 'Overdue' 
                                  ? 'bg-rose-50 text-rose-600 border-rose-100'
                                  : 'bg-blue-50 text-blue-600 border-blue-100'
                              }`}>
                                {inv.status}
                              </span>
                            </td>
                            <td className="px-8 py-5 text-center" onClick={(e) => e.stopPropagation()}>
                              <span className="text-xs text-slate-400 font-medium">-</span>
                            </td>
                          </tr>
                        ))}
                      </>
                    )}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-[#F4F3EF]">
                      <th className="px-8 py-4 text-[10px] font-bold text-[#94a3b8] uppercase tracking-widest">Invoice Number</th>
                      <th className="px-8 py-4 text-[10px] font-bold text-[#94a3b8] uppercase tracking-widest">Description</th>
                      <th className="px-8 py-4 text-[10px] font-bold text-[#94a3b8] uppercase tracking-widest text-right">Tax Amount</th>
                      <th className="px-8 py-4 text-[10px] font-bold text-[#94a3b8] uppercase tracking-widest text-right">Total Amount</th>
                      <th className="px-8 py-4 text-[10px] font-bold text-[#94a3b8] uppercase tracking-widest text-center">Due Date</th>
                      <th className="px-8 py-4 text-[10px] font-bold text-[#94a3b8] uppercase tracking-widest text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F4F3EF]">
                    {invoices.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="py-16 text-center text-[#9B9BAD] text-xs font-bold uppercase tracking-widest">
                          No invoices found
                        </td>
                      </tr>
                    ) : (
                      invoices.map((inv) => (
                        <tr key={inv.id} className="hover:bg-slate-50 transition-all cursor-pointer" onClick={() => setSelectedItem({ type: 'invoice', data: inv })}>
                          <td className="px-8 py-5">
                            <span className="text-sm font-black text-[#1A1A2E]">{inv.invoiceNumber}</span>
                          </td>
                          <td className="px-8 py-5 text-sm text-slate-500 max-w-xs truncate">
                            {inv.notes || `Invoice for ${inv.companyName}`}
                          </td>
                          <td className="px-8 py-5 text-right text-sm font-semibold text-slate-600">
                            {formatINR(inv.taxAmount)}
                          </td>
                          <td className="px-8 py-5 text-right font-black text-[#1B4DA0]">
                            {formatINR(inv.totalAmount || inv.amount)}
                          </td>
                          <td className="px-8 py-5 text-center text-sm font-bold text-slate-600">
                            {inv.dueDate ? new Date(inv.dueDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : 'N/A'}
                          </td>
                          <td className="px-8 py-5 text-center">
                            <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider border ${
                              inv.status === 'Paid'
                                ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                                : inv.status === 'Overdue'
                                ? 'bg-rose-50 text-rose-600 border-rose-100'
                                : 'bg-amber-50 text-amber-600 border-amber-100'
                            }`}>
                              {inv.status}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Detail Drawer */}
      {createPortal(
        <AnimatePresence>
          {selectedItem && (
            <React.Fragment>
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-[#1A1A2E]/40 backdrop-blur-md z-[200000]"
                onClick={() => setSelectedItem(null)}
              />

              {/* Drawer Container */}
              <motion.div
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: "spring", damping: 30, stiffness: 200 }}
                className="fixed inset-y-0 right-0 w-full max-w-[698px] bg-[#F8FAFC] shadow-2xl border-l border-[#E2E8F0] flex flex-col z-[200001] overflow-hidden text-left"
                style={{ fontFamily: "'Calibri', sans-serif" }}
              >
                {/* Header */}
                <div className="flex-none p-8 bg-white border-b border-[#E2E8F0]">
                  <div className="flex items-start justify-between">
                    <div>
                      <h2 className="text-3xl font-bold text-[#0F172A] font-syne mb-2">
                        {selectedItem.type === 'payment_request' ? 'Payment Detail' : 'Invoice Details'}
                      </h2>
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-bold text-[#64748B]">
                          {selectedItem.type === 'payment_request' ? selectedItem.data.id : selectedItem.data.invoiceNumber}
                        </span>
                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest
                        ${selectedItem.data.status === 'Approved' || selectedItem.data.status === 'Paid' ? 'bg-emerald-50 text-emerald-600' :
                            selectedItem.data.status === 'Processing' || selectedItem.data.status === 'Sent' ? 'bg-blue-50 text-blue-600' :
                              'bg-amber-50 text-amber-600'}`}
                        >
                          {selectedItem.data.status}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => setSelectedItem(null)}
                      className="w-10 h-10 rounded-xl bg-[#FEE2E2] text-[#EF4444] flex items-center justify-center hover:bg-red-200 transition-all ml-2"
                    >
                      <FiX size={20} />
                    </button>
                  </div>
                </div>

                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto p-8 space-y-6">
                  {selectedItem.type === 'payment_request' ? (
                    <>
                      {/* Side-by-side Payee & Status Cards */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
                        {/* Left: Payee Info */}
                        <div className="bg-white p-6 rounded-[24px] border border-[#E2E8F0] shadow-sm">
                          <p className="text-[10px] font-black text-[#94A3B8] uppercase tracking-widest mb-1">Payee Info</p>
                          <p className="text-[16px] font-bold text-[#0F172A]">{selectedItem.data.payee || 'N/A'}</p>
                          {selectedItem.data.contactEmail && (
                            <p className="text-[13px] font-medium text-[#64748B] mt-2 flex items-center gap-2">
                              <FiMail size={14} /> {selectedItem.data.contactEmail}
                            </p>
                          )}
                          {selectedItem.data.bankDetails && (
                            <>
                              <p className="text-[13px] font-bold text-[#1B4DA0] mt-3">Bank Details:</p>
                              <p className="text-[13px] font-medium text-[#64748B] whitespace-pre-wrap">{selectedItem.data.bankDetails}</p>
                            </>
                          )}
                        </div>

                        {/* Right: Payment Status */}
                        <div className="bg-white p-6 rounded-[24px] border border-[#E2E8F0] shadow-sm">
                          <p className="text-[10px] font-black text-[#94A3B8] uppercase tracking-widest mb-1">Payment Status</p>
                          <p className="text-[14px] font-bold text-[#0F172A] mt-2">Amount: <span className="font-black text-[#1A1A2E]">{formatINR(selectedItem.data.amount)}</span></p>
                          <p className="text-[14px] font-bold text-[#0F172A] mt-1">Due Date: <span className="font-medium text-[#64748B]">{selectedItem.data.dueDate ? new Date(selectedItem.data.dueDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : 'N/A'}</span></p>
                          {selectedItem.data.priority && (
                            <p className="text-[14px] font-bold text-[#0F172A] mt-1 flex items-center gap-2">Priority:
                              <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest ${selectedItem.data.priority?.toLowerCase() === 'high' ? 'bg-red-50 text-red-600' : selectedItem.data.priority?.toLowerCase() === 'medium' ? 'bg-amber-50 text-amber-600' : 'bg-emerald-50 text-emerald-600'}`}>
                                {selectedItem.data.priority}
                              </span>
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Description/Notes Card */}
                      <div className="bg-white rounded-[24px] border border-[#E2E8F0] shadow-sm overflow-hidden p-6 text-left">
                        <h3 className="text-[14px] font-bold text-[#0F172A] uppercase tracking-wider mb-4">Payment Notes</h3>
                        <div className="p-4 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0]">
                          <p className="text-sm text-[#475569] whitespace-pre-wrap">{selectedItem.data.notes || "No notes available."}</p>
                        </div>
                      </div>

                      {/* Attachment View Card */}
                      {selectedItem.data.attachmentUrl && (
                        <div className="bg-white p-6 rounded-[24px] border border-[#E2E8F0] shadow-sm overflow-hidden mt-4 flex items-center justify-between text-left">
                          <div>
                            <p className="text-[10px] font-black text-[#94A3B8] uppercase tracking-widest">Attached Bill / Document</p>
                            <p className="text-[12px] font-medium text-slate-500 mt-1">Invoice or receipt associated with this request</p>
                          </div>
                          <a
                            href={selectedItem.data.attachmentUrl.startsWith('http') ? selectedItem.data.attachmentUrl : `${BASE_URL}${selectedItem.data.attachmentUrl}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-md shadow-indigo-500/20 flex items-center gap-2"
                          >
                            <FiFileText size={14} /> View Document
                          </a>
                        </div>
                      )}
                    </>
                  ) : (
                    <>
                      {/* Side-by-side Company & Invoice Status Cards */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
                        {/* Left: Company Info */}
                        <div className="bg-white p-6 rounded-[24px] border border-[#E2E8F0] shadow-sm">
                          <p className="text-[10px] font-black text-[#94A3B8] uppercase tracking-widest mb-1">Company Info</p>
                          <p className="text-[16px] font-bold text-[#0F172A]">{selectedItem.data.companyName || 'N/A'}</p>
                          {selectedItem.data.clientEmail && (
                            <p className="text-[13px] font-medium text-[#64748B] mt-2 flex items-center gap-2">
                              <FiMail size={14} /> {selectedItem.data.clientEmail}
                            </p>
                          )}
                        </div>

                        {/* Right: Invoice Status */}
                        <div className="bg-white p-6 rounded-[24px] border border-[#E2E8F0] shadow-sm">
                          <p className="text-[10px] font-black text-[#94A3B8] uppercase tracking-widest mb-1">Invoice Status</p>
                          <p className="text-[14px] font-bold text-[#0F172A] mt-2">Amount: <span className="font-black text-[#1A1A2E]">{formatINR(selectedItem.data.totalAmount || selectedItem.data.amount)}</span></p>
                          {selectedItem.data.taxAmount && (
                            <p className="text-[14px] font-bold text-[#0F172A] mt-1">Tax Amount: <span className="font-medium text-[#64748B]">{formatINR(selectedItem.data.taxAmount)}</span></p>
                          )}
                          <p className="text-[14px] font-bold text-[#0F172A] mt-1">Due Date: <span className="font-medium text-[#64748B]">{selectedItem.data.dueDate ? new Date(selectedItem.data.dueDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : 'N/A'}</span></p>
                        </div>
                      </div>

                      {/* Description/Notes Card */}
                      <div className="bg-white rounded-[24px] border border-[#E2E8F0] shadow-sm overflow-hidden p-6 text-left">
                        <h3 className="text-[14px] font-bold text-[#0F172A] uppercase tracking-wider mb-4">Description / Notes</h3>
                        <div className="p-4 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0]">
                          <p className="text-sm text-[#475569] whitespace-pre-wrap">{selectedItem.data.notes || "Invoice issued for outstanding balance."}</p>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </motion.div>
            </React.Fragment>
          )}
        </AnimatePresence>,
        document.body
      )}
    </div>
  );
}
