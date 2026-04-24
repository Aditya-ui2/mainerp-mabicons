import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FiBriefcase, FiDollarSign, FiSearch, FiChevronRight, FiCreditCard, FiDownload, FiFilter } from 'react-icons/fi';

const AccountsTab = () => {
  const [search, setSearch] = useState('');

  const accounts = [
    { id: 1, name: 'TechNova Solutions', balance: '₹ 15,40,000', status: 'Cleared', type: 'Premium', lastInvoice: 'INV-2024-001' },
    { id: 2, name: 'Global Retail Corp', balance: '₹ 2,50,000', status: 'Pending', type: 'Standard', lastInvoice: 'INV-2024-012' },
    { id: 3, name: 'Zenith Manufacturing', balance: '₹ 8,90,000', status: 'Cleared', type: 'Premium', lastInvoice: 'INV-2024-034' },
    { id: 4, name: 'Evergreen Wellness', balance: '₹ 3,10,000', status: 'Overdue', type: 'Standard', lastInvoice: 'INV-2024-009' }
  ];

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
          <p className="text-3xl font-black text-[#1A1A2E] tracking-tight">₹ 29,90,000</p>
        </div>
        <div className="bg-white rounded-[32px] p-8 border border-[#F4F3EF] shadow-sm flex flex-col justify-center">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center"><FiCreditCard size={24} /></div>
            <p className="text-[12px] font-black text-[#9B9BAD] uppercase tracking-widest">Cleared This Month</p>
          </div>
          <p className="text-3xl font-black text-[#1A1A2E] tracking-tight">₹ 14,20,000</p>
        </div>
        <div className="bg-white rounded-[32px] p-8 border border-[#F4F3EF] shadow-sm flex flex-col justify-center">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center"><FiBriefcase size={24} /></div>
            <p className="text-[12px] font-black text-[#9B9BAD] uppercase tracking-widest">Overdue Invoices</p>
          </div>
          <p className="text-3xl font-black text-[#1A1A2E] tracking-tight">4 Pending</p>
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
          {accounts.map(acc => (
             <div key={acc.id} className="grid grid-cols-[2fr_1.5fr_1fr_1fr_60px] gap-4 items-center px-8 py-5 border-b border-[#F4F3EF] last:border-0 hover:bg-[#F8FAFF] cursor-pointer transition-all group">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold shrink-0 shadow-sm border border-indigo-100">
                    {acc.name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-[#1A1A2E] group-hover:text-[#1B4DA0] text-left">{acc.name}</h4>
                    <span className="text-[11px] text-[#9B9BAD] font-bold uppercase tracking-widest">{acc.type}</span>
                  </div>
                </div>
                <div className="text-left text-sm font-bold text-[#6B6B7E]">{acc.lastInvoice}</div>
                <div className="text-left text-sm font-black text-[#1A1A2E]">{acc.balance}</div>
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
    </motion.div>
  );
};

export default AccountsTab;
