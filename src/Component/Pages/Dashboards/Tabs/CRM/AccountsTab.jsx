import React, { useState, useEffect } from 'react';
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from 'framer-motion';
import { FiBriefcase, FiDollarSign, FiSearch, FiChevronRight, FiCreditCard, FiDownload, FiFilter, FiRefreshCw, FiX, FiFileText, FiUser, FiInfo, FiActivity } from 'react-icons/fi';
import { getClientAccounts, seedFinanceData, getAccountDetails } from '../../../service/api';
import { toast } from 'react-hot-toast';

const AccountsTab = () => {
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [accounts, setAccounts] = useState([]);
  const [summary, setSummary] = useState({ totalOutstanding: 0, totalCleared: 0, overdueCount: 0 });
  
  // Drawer States
  const [selectedAcc, setSelectedAcc] = useState(null);
  const [accDetails, setAccDetails] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await getClientAccounts();
      if (res.success) {
        setAccounts(res.data);
        setSummary(res.summary);
        
        // If still empty, try to seed once
        if (res.data.length === 0) {
           await seedFinanceData();
           const res2 = await getClientAccounts();
           if (res2.success) {
             setAccounts(res2.data);
             setSummary(res2.summary);
           }
        }
      }
    } catch (error) {
      toast.error("Failed to load accounts");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRowClick = async (account) => {
    setSelectedAcc(account);
    setDetailsLoading(true);
    try {
      const res = await getAccountDetails(account.clientId);
      if (res.success) {
        setAccDetails(res.data);
      }
    } catch (error) {
      toast.error("Failed to load account history");
    } finally {
      setDetailsLoading(false);
    }
  };

  const filteredAccounts = accounts.filter(acc => 
    (acc.companyName || '').toLowerCase().includes(search.toLowerCase()) ||
    (acc.lastInvoiceNumber || '').toLowerCase().includes(search.toLowerCase())
  );

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(val || 0);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="space-y-8"
    >
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 text-left">
        <div>
          <h1 className="text-3xl font-bold text-[#1A1A2E] tracking-tight" style={{ fontFamily: '"Syne", sans-serif' }}>Client Accounts</h1>
          <p className="text-sm font-medium text-[#9B9BAD] mt-1">Manage billing, pending invoices, and financial status of clients</p>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={fetchData}
            className="w-12 h-12 bg-white border border-[#F4F3EF] text-[#6B6B7E] rounded-2xl flex items-center justify-center hover:bg-[#F8FAFF] transition-all shadow-sm"
          >
             <FiRefreshCw className={loading ? 'animate-spin' : ''} />
          </button>
          <button className="px-6 py-3 bg-white border border-[#F4F3EF] text-[#6B6B7E] font-bold rounded-2xl flex items-center justify-center gap-2 hover:bg-[#F8FAFF] transition-all shadow-sm">
             <FiDownload size={18} /> Export Data
          </button>
          <button className="px-6 py-3 bg-[#1B4DA0] text-white font-bold rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20 hover:bg-[#0D47A1] transition-all">
             <FiBriefcase size={18} /> Generate Invoice
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
        <div className="bg-white rounded-[32px] p-8 border border-[#F4F3EF] shadow-sm flex flex-col justify-center">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center"><FiDollarSign size={24} /></div>
            <p className="text-[12px] font-black text-[#9B9BAD] uppercase tracking-widest">Total Outstanding</p>
          </div>
          <p className="text-3xl font-black text-[#1A1A2E] tracking-tight">{formatCurrency(summary.totalOutstanding)}</p>
        </div>
        <div className="bg-white rounded-[32px] p-8 border border-[#F4F3EF] shadow-sm flex flex-col justify-center">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center"><FiCreditCard size={24} /></div>
            <p className="text-[12px] font-black text-[#9B9BAD] uppercase tracking-widest">Cleared This Month</p>
          </div>
          <p className="text-3xl font-black text-[#1A1A2E] tracking-tight">{formatCurrency(summary.totalCleared)}</p>
        </div>
        <div className="bg-white rounded-[32px] p-8 border border-[#F4F3EF] shadow-sm flex flex-col justify-center">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center"><FiBriefcase size={24} /></div>
            <p className="text-[12px] font-black text-[#9B9BAD] uppercase tracking-widest">Overdue Invoices</p>
          </div>
          <p className="text-3xl font-black text-[#1A1A2E] tracking-tight">{summary.overdueCount} Pending</p>
        </div>
      </div>

      <div className="bg-white rounded-[32px] shadow-sm border border-[#F4F3EF] overflow-hidden p-2">
        <div className="p-4 flex items-center justify-between gap-4">
          <div className="relative flex-1 group min-w-[200px] max-w-sm">
            <FiSearch className="absolute left-5 top-1/2 -translate-y-1/2 text-[#9B9BAD] transition-colors" size={18} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search accounts..."
              className="w-full bg-[#F4F3EF] border-none rounded-2xl py-3.5 pl-14 pr-5 text-sm font-medium focus:ring-2 focus:ring-[#F4F3EF] outline-none transition-all placeholder:text-[#9B9BAD]"
            />
          </div>
          <button className="px-6 py-3.5 bg-[#F4F3EF] text-[#1A1A2E] font-bold rounded-2xl flex items-center justify-center gap-2 hover:bg-[#E8E7E2] transition-all">
            <FiFilter size={18}/> Filters
          </button>
        </div>
        <div className="overflow-x-auto min-h-[300px]">
          <div className="grid grid-cols-[2fr_1.5fr_1fr_1fr_60px] gap-4 px-8 py-4 border-b border-[#F4F3EF] bg-transparent">
            {["Client Name", "Last Invoice", "Balance", "Status", ""].map((h, i) => (
              <div key={i} className="text-[11px] font-bold text-[#94a3b8] uppercase tracking-widest text-left">
                {h}
              </div>
            ))}
          </div>
          {loading ? (
             <div className="py-20 text-center">
               <FiRefreshCw className="w-8 h-8 text-[#1B4DA0] animate-spin mx-auto mb-4" />
               <p className="text-[11px] font-black text-[#9B9BAD] uppercase tracking-[3px]">Loading live financial data...</p>
             </div>
          ) : filteredAccounts.length === 0 ? (
             <div className="py-20 text-center">
               <p className="text-[11px] font-black text-[#9B9BAD] uppercase tracking-[3px]">No accounts found</p>
             </div>
          ) : filteredAccounts.map(acc => (
             <div key={acc.id} onClick={() => handleRowClick(acc)} className="grid grid-cols-[2fr_1.5fr_1fr_1fr_60px] gap-4 items-center px-8 py-5 border-b border-[#F4F3EF] last:border-0 hover:bg-[#F8FAFF] cursor-pointer transition-all group">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold shrink-0 shadow-sm border border-indigo-100">
                    {(acc.companyName || 'C').charAt(0)}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-[#1A1A2E] group-hover:text-[#1B4DA0] text-left">{acc.companyName}</h4>
                    <span className="text-[11px] text-[#9B9BAD] font-bold uppercase tracking-widest">{acc.accountType}</span>
                  </div>
                </div>
                <div className="text-left text-sm font-bold text-[#6B6B7E]">{acc.lastInvoiceNumber || '—'}</div>
                <div className="text-left text-sm font-black text-[#1A1A2E]">{formatCurrency(acc.totalOutstanding)}</div>
                <div className="text-left">
                  <span className={`px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest ${acc.status === 'Cleared' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : acc.status === 'Overdue' ? 'bg-rose-50 text-rose-600 border border-rose-100' : 'bg-amber-50 text-amber-600 border border-amber-100'}`}>
                    {acc.status}
                  </span>
                </div>
                <div className="flex justify-end">
                  <div className="w-8 h-8 rounded-xl bg-transparent group-hover:bg-blue-50 flex items-center justify-center transition-all">
                    <FiChevronRight size={18} className="text-[#C5C5D2] group-hover:text-[#1B4DA0]" />
                  </div>
                </div>
             </div>
          ))}
        </div>
      </div>

      {/* Account Details Drawer */}
      {createPortal(
        <AnimatePresence>
          {selectedAcc && (
            <div key="acc-drawer-portal" className="fixed inset-0 z-[1100]">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setSelectedAcc(null)}
                className="absolute inset-0 bg-[#1A1A2E]/40 backdrop-blur-md"
              />
              <motion.div
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                className="absolute inset-y-0 right-0 w-full max-w-[520px] bg-white shadow-2xl flex flex-col border-l border-[#F4F3EF]"
              >
                {/* Header */}
                <div className="px-10 py-10 border-b border-[#F4F3EF] flex items-center justify-between">
                   <h2 className="text-2xl font-black text-[#1A1A2E]" style={{ fontFamily: '"Syne", sans-serif' }}>Account History</h2>
                   <button
                    onClick={() => setSelectedAcc(null)}
                    className="w-12 h-12 rounded-xl bg-[#F4F3EF] text-[#6B6B7E] flex items-center justify-center hover:bg-rose-50 hover:text-rose-50 transition-all"
                  >
                    <FiX size={24} />
                  </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-10 space-y-10 custom-scrollbar text-left">
                  <div className="flex flex-col items-center">
                    <div className="w-20 h-20 rounded-[30px] bg-indigo-50 border-4 border-white shadow-xl flex items-center justify-center text-3xl font-black text-indigo-600 mb-6 uppercase">
                      {selectedAcc.companyName.charAt(0)}
                    </div>
                    <h3 className="text-xl font-black text-[#1A1A2E]">{selectedAcc.companyName}</h3>
                    <p className="text-[11px] font-black text-[#1B4DA0] uppercase tracking-[3px] mt-1">{selectedAcc.accountType} ACCOUNT</p>
                  </div>

                    <div className="grid grid-cols-2 gap-4">
                       <div className="p-6 bg-[#FAFAF9] rounded-3xl border border-[#F4F3EF] space-y-1">
                          <p className="text-[9px] font-black text-[#9B9BAD] uppercase tracking-widest">Total Billable</p>
                          <p className="text-xl font-black text-[#1A1A2E]">{formatCurrency(selectedAcc.totalOutstanding)}</p>
                       </div>
                       <div className="p-6 bg-[#FAFAF9] rounded-3xl border border-[#F4F3EF] space-y-1">
                          <p className="text-[9px] font-black text-[#9B9BAD] uppercase tracking-widest">Total Cleared</p>
                          <p className="text-xl font-black text-emerald-600">{formatCurrency(selectedAcc.clearedAmount)}</p>
                       </div>
                       <div className="p-6 bg-[#FAFAF9] rounded-3xl border border-[#F4F3EF] space-y-1">
                          <p className="text-[9px] font-black text-[#9B9BAD] uppercase tracking-widest">Overdue</p>
                          <p className="text-xl font-black text-rose-600">{formatCurrency(selectedAcc.overdueAmount)}</p>
                       </div>
                       <div className="p-6 bg-[#FAFAF9] rounded-3xl border border-[#F4F3EF] space-y-1">
                          <p className="text-[9px] font-black text-[#9B9BAD] uppercase tracking-widest">Pending Invoices</p>
                          <p className="text-xl font-black text-amber-600">{selectedAcc.pendingInvoicesCount || 0}</p>
                       </div>
                    </div>

                    {/* Client Info Section */}
                    {accDetails?.account?.client && (
                        <div className="bg-[#FAFAF9] rounded-[32px] border border-[#F4F3EF] p-8 space-y-6">
                            <h4 className="text-[11px] font-black text-[#1A1A2E] uppercase tracking-[2px] flex items-center gap-2">
                                <FiUser size={14} className="text-[#1B4DA0]" /> Client Contact Info
                            </h4>
                            <div className="grid grid-cols-1 gap-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-widest">SPOC Name</span>
                                    <span className="text-sm font-bold text-[#1A1A2E]">{accDetails.account.client.spocName || '—'}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-widest">Email</span>
                                    <span className="text-sm font-bold text-[#1A1A2E]">{accDetails.account.client.email || '—'}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-widest">Contact</span>
                                    <span className="text-sm font-bold text-[#1A1A2E]">{accDetails.account.client.contactNumber || '—'}</span>
                                </div>
                                <div className="flex items-center justify-between pt-2 border-t border-[#F4F3EF]">
                                    <span className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-widest">GST Number</span>
                                    <span className="text-[11px] font-black text-[#1B4DA0]">{accDetails.account.client.gstNumber || '—'}</span>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="space-y-6 text-left">
                        <h4 className="text-[11px] font-black text-[#1A1A2E] uppercase tracking-[2px] flex items-center gap-2">
                           <FiFileText size={14} className="text-[#1B4DA0]" /> Invoice History
                        </h4>
                    
                    {detailsLoading ? (
                       <div className="flex flex-col items-center py-10">
                          <FiRefreshCw className="animate-spin text-[#1B4DA0] mb-2" size={24} />
                          <p className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-widest">Loading history...</p>
                       </div>
                    ) : (accDetails?.invoices || []).length === 0 ? (
                       <div className="p-8 bg-[#FAFAF9] rounded-3xl border border-dashed border-[#F4F3EF] text-center">
                          <p className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-widest">No invoices generated yet</p>
                       </div>
                    ) : (
                       <div className="space-y-4">
                          {accDetails.invoices.map((inv) => (
                             <div key={inv.id} className="p-5 bg-white border border-[#F4F3EF] rounded-2xl flex items-center justify-between hover:border-[#1B4DA0]/30 transition-all group">
                                <div className="flex items-center gap-4">
                                   <div className="w-10 h-10 rounded-xl bg-[#F8FAFF] flex items-center justify-center text-[#1B4DA0]">
                                      <FiFileText size={18} />
                                   </div>
                                   <div>
                                      <p className="text-sm font-bold text-[#1A1A2E] uppercase tracking-tight">{inv.invoiceNumber}</p>
                                      <p className="text-[10px] font-bold text-[#9B9BAD]">{new Date(inv.createdAt).toDateString()}</p>
                                   </div>
                                </div>
                                <div className="text-right">
                                   <p className="text-sm font-black text-[#1A1A2E]">{formatCurrency(inv.totalAmount)}</p>
                                   <span className={`text-[9px] font-black uppercase tracking-[1px] ${inv.status === 'Sent' ? 'text-[#1B4DA0]' : 'text-emerald-500'}`}>{inv.status}</span>
                                </div>
                             </div>
                          ))}
                       </div>
                    )}
                  </div>
                </div>

                <div className="p-10 border-t border-[#F4F3EF] space-y-4">
                   <div className="grid grid-cols-2 gap-4">
                      <button className="py-4 bg-[#1B4DA0] text-white font-black rounded-2xl text-[11px] uppercase tracking-[3px] hover:bg-[#0D47A1] transition-all flex items-center justify-center gap-2">
                         <FiDownload size={14} /> Statement
                      </button>
                      <button className="py-4 bg-white border border-[#F4F3EF] text-[#6B6B7E] font-black rounded-2xl text-[11px] uppercase tracking-[3px] hover:bg-slate-50 transition-all flex items-center justify-center gap-2">
                         <FiActivity size={14} /> Activity
                      </button>
                   </div>
                   <button 
                    onClick={() => setSelectedAcc(null)}
                    className="w-full py-4 bg-[#F4F3EF] text-[#6B6B7E] font-black rounded-2xl text-[11px] uppercase tracking-[3px] hover:bg-[#F0EEEA] transition-all"
                   >
                     Close Account History
                   </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </motion.div>
  );
};


export default AccountsTab;
