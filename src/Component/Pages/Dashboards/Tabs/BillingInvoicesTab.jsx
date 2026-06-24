import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSearch, FiChevronDown, FiCreditCard, FiDollarSign, FiTrendingUp, FiUsers, FiClipboard, FiFileText, FiCheck, FiX, FiChevronRight, FiDownload, FiMail, FiPrinter } from 'react-icons/fi';

const mockInvoices = [
  {
    id: "#INV-2026-001",
    client: "Infosys Technologies",
    dept: "Recruitment",
    amount: "₹4,50,000",
    gst: "18% (₹81,000)",
    total: "₹5,31,000",
    status: "Paid",
    date: "20 May, 2026",
    dueDate: "04 Jun, 2026",
    contactEmail: "accounts@infosys.com",
    spoc: "Rajeev Sharma"
  },
  {
    id: "#INV-2026-002",
    client: "TCS Consultancy",
    dept: "Operations",
    amount: "₹8,50,000",
    gst: "18% (₹1,53,000)",
    total: "₹10,03,000",
    status: "Pending",
    date: "18 May, 2026",
    dueDate: "02 Jun, 2026",
    contactEmail: "finance@tcs.com",
    spoc: "Anita Desai"
  },
  {
    id: "#INV-2026-003",
    client: "Wipro India",
    dept: "CRM",
    amount: "₹2,20,000",
    gst: "18% (₹39,600)",
    total: "₹2,59,600",
    status: "Overdue",
    date: "05 May, 2026",
    dueDate: "19 May, 2026",
    contactEmail: "billing@wipro.com",
    spoc: "Vikram Singh"
  },
  {
    id: "#INV-2026-004",
    client: "HCL Technologies",
    dept: "Recruitment",
    amount: "₹3,15,000",
    gst: "18% (₹56,700)",
    total: "₹3,71,700",
    status: "Paid",
    date: "15 May, 2026",
    dueDate: "29 May, 2026",
    contactEmail: "payables@hcl.com",
    spoc: "Meera Reddy"
  },
  {
    id: "#INV-2026-005",
    client: "Tech Mahindra",
    dept: "Operations",
    amount: "₹1,80,000",
    gst: "18% (₹32,400)",
    total: "₹2,12,400",
    status: "Draft",
    date: "21 May, 2026",
    dueDate: "05 Jun, 2026",
    contactEmail: "vendor.payments@techm.com",
    spoc: "Sanjay Gupta"
  }
];

const BillingInvoicesTab = ({ notificationBell }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeDeptFilter, setActiveDeptFilter] = useState('all');
  const [activeStatusFilter, setActiveStatusFilter] = useState('all');
  const [selectedIds, setSelectedIds] = useState([]);
  const [selectedInvoiceDetail, setSelectedInvoiceDetail] = useState(null);

  const filteredInvoices = mockInvoices.filter(invoice => {
    const matchesSearch = invoice.client.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          invoice.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDept = activeDeptFilter === 'all' || invoice.dept === activeDeptFilter;
    const matchesStatus = activeStatusFilter === 'all' || invoice.status.toLowerCase() === activeStatusFilter.toLowerCase();
    
    return matchesSearch && matchesDept && matchesStatus;
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-500" style={{ fontFamily: "'Calibri', sans-serif" }}>
      {/* Header Section */}
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4 text-left">
        <div className="text-left">
          <h1 className="text-3xl font-bold text-[#1A1A2E] tracking-tight font-syne">Billing & Invoices</h1>
        </div>
        <div className="flex items-center gap-3">
          {notificationBell}
        </div>
      </div>

      {/* Action Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        {[
          { title: "Create Invoice", icon: FiCreditCard },
          { title: "GST Billing", icon: FiDollarSign },
          { title: "Recurring", icon: FiTrendingUp },
          { title: "Payroll Billing", icon: FiUsers },
          { title: "Credit Notes", icon: FiClipboard },
          { title: "Invoice History", icon: FiFileText }
        ].map((item, idx) => {
          const Icon = item.icon;
          return (
            <motion.div
              whileHover={{ y: -4 }}
              key={idx}
              className="bg-white rounded-[40px] p-8 shadow-sm border border-[#F4F3EF] transition-all duration-300 group cursor-pointer active:scale-[0.98] hover:shadow-xl hover:shadow-blue-500/5 hover:border-transparent"
            >
              <div className="flex items-center justify-between">
                <div className="p-4 rounded-[20px] bg-white text-black border border-[#F4F3EF] shadow-sm transition-all duration-500 group-hover:bg-[#1B4DA0] group-hover:text-white group-hover:scale-110">
                  <Icon size={24} />
                </div>
              </div>
              <div className="mt-6 text-left">
                <p className="text-[#9B9BAD] text-[10px] font-black uppercase tracking-[2px]">{item.title}</p>
                <p className="text-3xl font-black text-[#1A1A2E] mt-2 tracking-tight">&nbsp;</p>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-[24px] p-2 border border-[#F4F3EF] shadow-sm flex items-center gap-3 mb-8 flex-wrap">
        <div className="relative flex-1 group min-w-[200px]">
          <FiSearch className="absolute left-5 top-1/2 -translate-y-1/2 text-[#9B9BAD] transition-colors" size={18} />
          <input 
            type="text" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search invoices by client or ID..." 
            className="w-full bg-[#F4F3EF] border-none rounded-2xl py-3 pl-14 pr-5 text-sm font-medium focus:ring-2 focus:ring-[#F4F3EF] outline-none transition-all placeholder:text-[#9B9BAD]"
          />
        </div>

        <div className="relative">
          <select 
            value={activeDeptFilter}
            onChange={(e) => setActiveDeptFilter(e.target.value)}
            className="bg-[#F4F3EF] text-xs font-bold uppercase tracking-wider text-[#1A1A2E] rounded-xl pl-4 pr-10 py-2.5 outline-none border-0 cursor-pointer appearance-none min-w-[170px]"
          >
            <option value="all">All Departments</option>
            <option value="CRM">CRM</option>
            <option value="Operations">Operations</option>
            <option value="Recruitment">Recruitment</option>
          </select>
          <FiChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9B9BAD] pointer-events-none" size={14} />
        </div>

        <div className="relative">
          <select 
            value={activeStatusFilter}
            onChange={(e) => setActiveStatusFilter(e.target.value)}
            className="bg-[#F4F3EF] text-xs font-bold uppercase tracking-wider text-[#1A1A2E] rounded-xl pl-4 pr-10 py-2.5 outline-none border-0 cursor-pointer appearance-none min-w-[140px]"
          >
            <option value="all">All Status</option>
            <option value="Paid">Paid</option>
            <option value="Pending">Pending</option>
            <option value="Overdue">Overdue</option>
            <option value="Draft">Draft</option>
          </select>
          <FiChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9B9BAD] pointer-events-none" size={14} />
        </div>
      </div>

      {/* Table Interface */}
      <div className="bg-white rounded-[32px] shadow-sm border border-[#F4F3EF] overflow-hidden relative">
        <div className="overflow-x-auto min-h-[300px]">
          <table className="w-full min-w-[1200px]">
            <thead>
              <tr className="border-b border-[#F4F3EF]">
                <th className="pl-8 pr-4 py-4 w-[60px]">
                  <input 
                    type="checkbox" 
                    checked={selectedIds.length > 0 && selectedIds.length === filteredInvoices.length}
                    onChange={() => setSelectedIds(selectedIds.length === filteredInvoices.length ? [] : filteredInvoices.map(i => i.id))}
                    className="w-4 h-4 rounded border-gray-300 text-[#1B4DA0] focus:ring-[#1B4DA0] cursor-pointer shadow-sm"
                  />
                </th>
                <th className="px-8 py-4 text-[11px] font-bold text-[#94a3b8] uppercase tracking-widest text-left">Invoice ID</th>
                <th className="px-8 py-4 text-[11px] font-bold text-[#94a3b8] uppercase tracking-widest text-left">Client</th>
                <th className="px-8 py-4 text-[11px] font-bold text-[#94a3b8] uppercase tracking-widest text-left">Department</th>
                <th className="px-8 py-4 text-[11px] font-bold text-[#94a3b8] uppercase tracking-widest text-left">Amount</th>
                <th className="px-8 py-4 text-[11px] font-bold text-[#94a3b8] uppercase tracking-widest text-left">Date</th>
                <th className="px-8 py-4 text-[11px] font-bold text-[#94a3b8] uppercase tracking-widest text-left">Status</th>
                <th className="px-8 py-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F4F3EF]">
              {filteredInvoices.length === 0 ? (
                <tr>
                  <td colSpan="8" className="py-24 text-center">
                    <p className="text-[#9B9BAD] text-sm font-bold uppercase tracking-widest">No invoices found</p>
                  </td>
                </tr>
              ) : (
                filteredInvoices.map((invoice) => (
                  <tr 
                    key={invoice.id}
                    onClick={() => setSelectedInvoiceDetail(invoice)}
                    className="hover:bg-[#F8FAFF] transition-all group cursor-pointer"
                  >
                    <td className="pl-8 pr-4 py-4" onClick={(e) => e.stopPropagation()}>
                      <input 
                        type="checkbox" 
                        checked={selectedIds.includes(invoice.id)}
                        onChange={() => setSelectedIds(prev => prev.includes(invoice.id) ? prev.filter(id => id !== invoice.id) : [...prev, invoice.id])}
                        className="w-4 h-4 rounded border-gray-300 text-[#1B4DA0] focus:ring-[#1B4DA0] cursor-pointer shadow-sm"
                      />
                    </td>
                    <td className="px-8 py-4 text-left">
                      <span className="text-[13px] font-black text-[#1A1A2E]">{invoice.id}</span>
                    </td>
                    <td className="px-8 py-4 text-left">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-black text-xs">
                          {invoice.client.substring(0, 2).toUpperCase()}
                        </div>
                        <span className="text-[14px] font-bold text-[#1A1A2E]">{invoice.client}</span>
                      </div>
                    </td>
                    <td className="px-8 py-4 text-left">
                      <span className="px-3 py-1 rounded-xl bg-gray-50 text-gray-600 text-[10px] font-black uppercase tracking-widest">
                        {invoice.dept}
                      </span>
                    </td>
                    <td className="px-8 py-4 text-left">
                      <div className="flex flex-col">
                        <span className="text-[13px] font-black text-[#1A1A2E]">{invoice.total}</span>
                        <span className="text-[10px] font-bold text-[#9B9BAD] uppercase tracking-widest">Includes {invoice.gst}</span>
                      </div>
                    </td>
                    <td className="px-8 py-4 text-left">
                      <div className="flex flex-col">
                        <span className="text-[13px] font-bold text-[#1A1A2E]">{invoice.date}</span>
                        <span className="text-[10px] font-bold text-[#9B9BAD] uppercase tracking-widest">Due: {invoice.dueDate}</span>
                      </div>
                    </td>
                    <td className="px-8 py-4 text-left">
                      <span className={`px-4 py-2 rounded-xl text-[11px] font-black uppercase tracking-widest
                        ${invoice.status === 'Paid' ? 'bg-emerald-50 text-emerald-600' : 
                          invoice.status === 'Pending' ? 'bg-amber-50 text-amber-600' : 
                          invoice.status === 'Overdue' ? 'bg-red-50 text-red-500' : 
                          'bg-gray-100 text-gray-600'}`}
                      >
                        {invoice.status}
                      </span>
                    </td>
                    <td className="px-8 py-4 text-right">
                      <div className="w-8 h-8 rounded-xl bg-transparent group-hover:bg-[#0D47A1]/5 flex items-center justify-center transition-all ml-auto">
                        <FiChevronRight size={18} className="text-[#C5C5D2] group-hover:text-[#0D47A1] transition-all" />
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Drawer */}
      {createPortal(
        <AnimatePresence>
          {selectedInvoiceDetail && (
            <React.Fragment>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-[#1A1A2E]/40 backdrop-blur-md z-[200000]"
                onClick={() => setSelectedInvoiceDetail(null)}
              />

              <motion.div
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: "spring", damping: 30, stiffness: 200 }}
                className="fixed inset-y-0 right-0 w-full max-w-[698px] bg-[#F8FAFC] shadow-2xl border-l border-[#F4F3EF] flex flex-col z-[200001] overflow-hidden"
                style={{ fontFamily: "'Calibri', sans-serif" }}
              >
              <div className="flex-none p-8 bg-white border-b border-[#E2E8F0]">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-3xl font-bold text-[#0F172A] font-syne mb-2">Invoice Details</h2>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-bold text-[#64748B]">{selectedInvoiceDetail.id}</span>
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest
                        ${selectedInvoiceDetail.status === 'Paid' ? 'bg-emerald-50 text-emerald-600' : 
                          selectedInvoiceDetail.status === 'Pending' ? 'bg-amber-50 text-amber-600' : 
                          selectedInvoiceDetail.status === 'Overdue' ? 'bg-red-50 text-red-500' : 
                          'bg-gray-100 text-gray-600'}`}
                      >
                        {selectedInvoiceDetail.status}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <button className="w-10 h-10 rounded-xl bg-[#F1F5F9] text-[#64748B] flex items-center justify-center hover:bg-[#E2E8F0] hover:text-[#0F172A] transition-all">
                      <FiDownload size={18} />
                    </button>
                    <button className="w-10 h-10 rounded-xl bg-[#F1F5F9] text-[#64748B] flex items-center justify-center hover:bg-[#E2E8F0] hover:text-[#0F172A] transition-all">
                      <FiPrinter size={18} />
                    </button>
                    <button
                      onClick={() => setSelectedInvoiceDetail(null)}
                      className="w-10 h-10 rounded-xl bg-[#FEE2E2] text-[#EF4444] flex items-center justify-center hover:bg-red-200 transition-all ml-2"
                    >
                      <FiX size={20} />
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-8 space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div className="bg-white p-6 rounded-[24px] border border-[#E2E8F0] shadow-sm">
                    <p className="text-[10px] font-black text-[#94A3B8] uppercase tracking-widest mb-1">Billed To</p>
                    <p className="text-[16px] font-bold text-[#0F172A]">{selectedInvoiceDetail.client}</p>
                    <p className="text-[13px] font-medium text-[#64748B] mt-2 flex items-center gap-2"><FiMail size={14} /> {selectedInvoiceDetail.contactEmail}</p>
                    <p className="text-[13px] font-medium text-[#64748B] mt-1">SPOC: {selectedInvoiceDetail.spoc}</p>
                  </div>
                  <div className="bg-white p-6 rounded-[24px] border border-[#E2E8F0] shadow-sm">
                    <p className="text-[10px] font-black text-[#94A3B8] uppercase tracking-widest mb-1">Invoice Info</p>
                    <p className="text-[14px] font-bold text-[#0F172A] mt-2">Date: <span className="font-medium text-[#64748B]">{selectedInvoiceDetail.date}</span></p>
                    <p className="text-[14px] font-bold text-[#0F172A] mt-1">Due Date: <span className="font-medium text-[#64748B]">{selectedInvoiceDetail.dueDate}</span></p>
                    <p className="text-[14px] font-bold text-[#0F172A] mt-1">Department: <span className="font-medium text-[#64748B]">{selectedInvoiceDetail.dept}</span></p>
                  </div>
                </div>

                <div className="bg-white rounded-[24px] border border-[#E2E8F0] shadow-sm overflow-hidden">
                  <div className="p-6 border-b border-[#E2E8F0] bg-[#F8FAFC]">
                    <h3 className="text-[14px] font-bold text-[#0F172A] uppercase tracking-wider">Payment Breakdown</h3>
                  </div>
                  <div className="p-6 space-y-4">
                    <div className="flex justify-between items-center text-[14px]">
                      <span className="font-bold text-[#64748B]">Subtotal</span>
                      <span className="font-black text-[#0F172A]">{selectedInvoiceDetail.amount}</span>
                    </div>
                    <div className="flex justify-between items-center text-[14px]">
                      <span className="font-bold text-[#64748B]">GST (18%)</span>
                      <span className="font-black text-[#0F172A]">{selectedInvoiceDetail.gst.split(' ')[1].replace(/[()]/g, '')}</span>
                    </div>
                    <div className="w-full h-px bg-[#E2E8F0] my-4"></div>
                    <div className="flex justify-between items-center text-[18px]">
                      <span className="font-black text-[#0F172A]">Total Amount</span>
                      <span className="font-black text-blue-600">{selectedInvoiceDetail.total}</span>
                    </div>
                  </div>
                </div>

                {selectedInvoiceDetail.status === 'Pending' || selectedInvoiceDetail.status === 'Overdue' ? (
                  <div className="bg-amber-50 p-6 rounded-[24px] border border-amber-200">
                    <h3 className="text-[14px] font-bold text-amber-800 uppercase tracking-wider mb-2">Action Required</h3>
                    <p className="text-[13px] text-amber-700">This invoice is awaiting payment. A reminder email was sent on {selectedInvoiceDetail.date}.</p>
                    <button className="mt-4 px-6 py-3 rounded-xl bg-amber-500 text-white text-xs font-black uppercase tracking-widest hover:bg-amber-600 transition-all">
                      Send Reminder
                    </button>
                  </div>
                ) : null}
              </div>
              </motion.div>
            </React.Fragment>
          )}
        </AnimatePresence>,
        document.body
      )}

      {/* Floating Action Bar */}
      {createPortal(
        <AnimatePresence>
          {selectedIds.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 100, x: '-50%' }}
              animate={{ opacity: 1, y: 0, x: '-50%' }}
              exit={{ opacity: 0, y: 100, x: '-50%' }}
              className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[1500] flex items-center gap-6 px-10 py-5 bg-[#1A1A2E] rounded-[32px] shadow-2xl min-w-[400px]"
            >
              <div className="flex items-center gap-4 pr-8 border-r border-white/10">
                <div className="w-12 h-12 rounded-2xl bg-[#0D47A1] flex items-center justify-center text-white font-black text-lg">
                  {selectedIds.length}
                </div>
                <div className="text-left flex flex-col justify-center">
                  <p className="text-[14px] font-black text-white">Selected</p>
                  <button onClick={() => setSelectedIds([])} className="text-[10px] font-bold text-red-400 uppercase tracking-widest">
                    Deselect All
                  </button>
                </div>
              </div>
              <div className="flex items-center gap-4 flex-1 justify-center">
                <button className="px-6 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-black uppercase tracking-widest transition-all">
                  Download PDFs
                </button>
                <button className="px-6 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2">
                  <FiMail /> Send Reminders
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </div>
  );
};

export default BillingInvoicesTab;
