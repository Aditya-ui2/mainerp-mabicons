import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSearch, FiChevronDown, FiHome, FiWifi, FiTrendingUp, FiTruck, FiTool, FiClipboard, FiCheck, FiX, FiChevronRight, FiDownload, FiPrinter } from 'react-icons/fi';

const mockExpenses = [
  {
    id: "#EXP-2026-001",
    category: "Office Rent",
    vendor: "DLF Offices",
    amount: "₹45,000",
    status: "Paid",
    date: "20 May, 2026",
    dueDate: "05 Jun, 2026",
    contactEmail: "billing@dlf.com",
    paymentMethod: "Bank Transfer"
  },
  {
    id: "#EXP-2026-002",
    category: "Internet",
    vendor: "Airtel",
    amount: "₹12,000",
    status: "Pending",
    date: "18 May, 2026",
    dueDate: "28 May, 2026",
    contactEmail: "care@airtel.com",
    paymentMethod: "Credit Card"
  },
  {
    id: "#EXP-2026-003",
    category: "Marketing",
    vendor: "Meta Ads",
    amount: "₹35,000",
    status: "Processing",
    date: "12 May, 2026",
    dueDate: "22 May, 2026",
    contactEmail: "billing@meta.com",
    paymentMethod: "Auto-Debit"
  },
  {
    id: "#EXP-2026-004",
    category: "Software Costs",
    vendor: "AWS Cloud",
    amount: "₹85,000",
    status: "Paid",
    date: "10 May, 2026",
    dueDate: "15 May, 2026",
    contactEmail: "aws-billing@amazon.com",
    paymentMethod: "Credit Card"
  },
  {
    id: "#EXP-2026-005",
    category: "Petty Cash",
    vendor: "Internal",
    amount: "₹15,000",
    status: "Paid",
    date: "05 May, 2026",
    dueDate: "05 May, 2026",
    contactEmail: "admin@company.com",
    paymentMethod: "Cash"
  }
];

const ExpenseVendorsTab = ({ notificationBell }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategoryFilter, setActiveCategoryFilter] = useState('all');
  const [activeStatusFilter, setActiveStatusFilter] = useState('all');
  const [selectedIds, setSelectedIds] = useState([]);
  const [selectedExpenseDetail, setSelectedExpenseDetail] = useState(null);
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);
  const [expenseForm, setExpenseForm] = useState({
    status: 'Paid',
    receiptFileName: ''
  });

  const filteredExpenses = mockExpenses.filter(expense => {
    const matchesSearch = expense.vendor.toLowerCase().includes(searchTerm.toLowerCase()) ||
      expense.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = activeCategoryFilter === 'all' || expense.category === activeCategoryFilter;
    const matchesStatus = activeStatusFilter === 'all' || expense.status.toLowerCase() === activeStatusFilter.toLowerCase();

    return matchesSearch && matchesCategory && matchesStatus;
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-500" style={{ fontFamily: "'Calibri', sans-serif" }}>
      {/* Header Section */}
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4 text-left">
        <div className="text-left">
          <h1 className="text-3xl font-bold text-[#1A1A2E] tracking-tight font-syne">Expense & Vendors</h1>

        </div>
        <div className="flex items-center gap-3">
          {notificationBell}
          <button
            onClick={() => setIsAddExpenseOpen(true)}
            className="px-6 py-3 rounded-2xl bg-[#1B4DA0] text-white text-xs font-black uppercase tracking-widest hover:scale-105 transition-all shadow-lg shadow-blue-500/20"
          >
            + Add Expense
          </button>
        </div>
      </div>



      {/* Filter Bar */}
      <div className="bg-white rounded-[24px] p-2 border border-[#F4F3EF] shadow-sm flex items-center gap-3 mb-8 flex-wrap">
        <div className="relative flex-1 group min-w-[200px]">
          <FiSearch className="absolute left-5 top-1/2 -translate-y-1/2 text-[#9B9BAD] transition-colors" size={18} />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search expenses by vendor or ID..."
            className="w-full bg-[#F4F3EF] border-none rounded-2xl py-3 pl-14 pr-5 text-sm font-medium focus:ring-2 focus:ring-[#F4F3EF] outline-none transition-all placeholder:text-[#9B9BAD]"
          />
        </div>

        <div className="relative">
          <select
            value={activeCategoryFilter}
            onChange={(e) => setActiveCategoryFilter(e.target.value)}
            className="bg-[#F4F3EF] text-xs font-bold uppercase tracking-wider text-[#1A1A2E] rounded-xl pl-4 pr-10 py-2.5 outline-none border-0 cursor-pointer appearance-none min-w-[170px]"
          >
            <option value="all">All Categories</option>
            <option value="Office Rent">Office Rent</option>
            <option value="Marketing">Marketing</option>
            <option value="Software Costs">Software Costs</option>
            <option value="Internet">Internet</option>
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
            <option value="Processing">Processing</option>
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
                    checked={selectedIds.length > 0 && selectedIds.length === filteredExpenses.length}
                    onChange={() => setSelectedIds(selectedIds.length === filteredExpenses.length ? [] : filteredExpenses.map(i => i.id))}
                    className="w-4 h-4 rounded border-gray-300 text-[#1B4DA0] focus:ring-[#1B4DA0] cursor-pointer shadow-sm"
                  />
                </th>
                <th className="px-8 py-4 text-[11px] font-bold text-[#94a3b8] uppercase tracking-widest text-left">Expense ID</th>
                <th className="px-8 py-4 text-[11px] font-bold text-[#94a3b8] uppercase tracking-widest text-left">Vendor</th>
                <th className="px-8 py-4 text-[11px] font-bold text-[#94a3b8] uppercase tracking-widest text-left">Category</th>
                <th className="px-8 py-4 text-[11px] font-bold text-[#94a3b8] uppercase tracking-widest text-left">Amount</th>
                <th className="px-8 py-4 text-[11px] font-bold text-[#94a3b8] uppercase tracking-widest text-left">Date</th>
                <th className="px-8 py-4 text-[11px] font-bold text-[#94a3b8] uppercase tracking-widest text-left">Status</th>
                <th className="px-8 py-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F4F3EF]">
              {filteredExpenses.length === 0 ? (
                <tr>
                  <td colSpan="8" className="py-24 text-center">
                    <p className="text-[#9B9BAD] text-sm font-bold uppercase tracking-widest">No expenses found</p>
                  </td>
                </tr>
              ) : (
                filteredExpenses.map((expense) => (
                  <tr
                    key={expense.id}
                    onClick={() => setSelectedExpenseDetail(expense)}
                    className="hover:bg-[#F8FAFF] transition-all group cursor-pointer"
                  >
                    <td className="pl-8 pr-4 py-4" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(expense.id)}
                        onChange={() => setSelectedIds(prev => prev.includes(expense.id) ? prev.filter(id => id !== expense.id) : [...prev, expense.id])}
                        className="w-4 h-4 rounded border-gray-300 text-[#1B4DA0] focus:ring-[#1B4DA0] cursor-pointer shadow-sm"
                      />
                    </td>
                    <td className="px-8 py-4 text-left">
                      <span className="text-[13px] font-black text-[#1A1A2E]">{expense.id}</span>
                    </td>
                    <td className="px-8 py-4 text-left">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-black text-xs">
                          {expense.vendor.substring(0, 2).toUpperCase()}
                        </div>
                        <span className="text-[14px] font-bold text-[#1A1A2E]">{expense.vendor}</span>
                      </div>
                    </td>
                    <td className="px-8 py-4 text-left">
                      <span className="px-3 py-1 rounded-xl bg-gray-50 text-gray-600 text-[10px] font-black uppercase tracking-widest">
                        {expense.category}
                      </span>
                    </td>
                    <td className="px-8 py-4 text-left">
                      <span className="text-[13px] font-black text-red-500">{expense.amount}</span>
                    </td>
                    <td className="px-8 py-4 text-left">
                      <span className="text-[13px] font-bold text-[#1A1A2E]">{expense.date}</span>
                    </td>
                    <td className="px-8 py-4 text-left">
                      <span className={`px-4 py-2 rounded-xl text-[11px] font-black uppercase tracking-widest
                        ${expense.status === 'Paid' ? 'bg-emerald-50 text-emerald-600' :
                          expense.status === 'Pending' ? 'bg-amber-50 text-amber-600' :
                            'bg-blue-50 text-blue-600'}`}
                      >
                        {expense.status}
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
          {selectedExpenseDetail && (
            <React.Fragment>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-[#1A1A2E]/40 backdrop-blur-md z-[200000]"
                onClick={() => setSelectedExpenseDetail(null)}
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
                      <h2 className="text-3xl font-bold text-[#0F172A] font-syne mb-2">Expense Details</h2>
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-bold text-[#64748B]">{selectedExpenseDetail.id}</span>
                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest
                          ${selectedExpenseDetail.status === 'Paid' ? 'bg-emerald-50 text-emerald-600' :
                            selectedExpenseDetail.status === 'Pending' ? 'bg-amber-50 text-amber-600' :
                              'bg-blue-50 text-blue-600'}`}
                        >
                          {selectedExpenseDetail.status}
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
                        onClick={() => setSelectedExpenseDetail(null)}
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
                      <p className="text-[10px] font-black text-[#94A3B8] uppercase tracking-widest mb-1">Vendor Info</p>
                      <p className="text-[16px] font-bold text-[#0F172A]">{selectedExpenseDetail.vendor}</p>
                      <p className="text-[13px] font-medium text-[#64748B] mt-2 flex items-center gap-2">{selectedExpenseDetail.contactEmail}</p>
                    </div>
                    <div className="bg-white p-6 rounded-[24px] border border-[#E2E8F0] shadow-sm">
                      <p className="text-[10px] font-black text-[#94A3B8] uppercase tracking-widest mb-1">Payment Info</p>
                      <p className="text-[14px] font-bold text-[#0F172A] mt-2">Date: <span className="font-medium text-[#64748B]">{selectedExpenseDetail.date}</span></p>
                      <p className="text-[14px] font-bold text-[#0F172A] mt-1">Due Date: <span className="font-medium text-[#64748B]">{selectedExpenseDetail.dueDate}</span></p>
                      <p className="text-[14px] font-bold text-[#0F172A] mt-1">Method: <span className="font-medium text-[#64748B]">{selectedExpenseDetail.paymentMethod}</span></p>
                    </div>
                  </div>

                  <div className="bg-white rounded-[24px] border border-[#E2E8F0] shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-[#E2E8F0] bg-[#F8FAFC]">
                      <h3 className="text-[14px] font-bold text-[#0F172A] uppercase tracking-wider">Amount Breakdown</h3>
                    </div>
                    <div className="p-6 space-y-4">
                      <div className="flex justify-between items-center text-[14px]">
                        <span className="font-bold text-[#64748B]">Category</span>
                        <span className="font-black text-[#0F172A]">{selectedExpenseDetail.category}</span>
                      </div>
                      <div className="w-full h-px bg-[#E2E8F0] my-4"></div>
                      <div className="flex justify-between items-center text-[18px]">
                        <span className="font-black text-[#0F172A]">Total Amount</span>
                        <span className="font-black text-red-500">{selectedExpenseDetail.amount}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </React.Fragment>
          )}
        </AnimatePresence>,
        document.body
      )}

      {/* Add Expense Form Drawer */}
      {createPortal(
        <AnimatePresence>
          {isAddExpenseOpen && (
            <React.Fragment>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-[#1A1A2E]/40 backdrop-blur-md z-[200000]"
                onClick={() => setIsAddExpenseOpen(false)}
              />

              <div className="fixed inset-0 z-[200001] flex items-center justify-center p-4 pointer-events-none">
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 20 }}
                  transition={{ type: "spring", damping: 30, stiffness: 300 }}
                  className="w-full max-w-[500px] bg-white rounded-[32px] shadow-2xl border border-[#F4F3EF] flex flex-col overflow-hidden pointer-events-auto"
                  style={{ fontFamily: "'Calibri', sans-serif", maxHeight: '90vh' }}
                >
                  <div className="p-8 border-b border-[#F4F3EF] flex justify-between items-center bg-[#F8FAFC]">
                    <div>
                      <h2 className="text-2xl font-bold text-[#1A1A2E] font-syne">Add New Expense</h2>
                      <p className="text-xs text-[#9B9BAD] font-bold mt-1 uppercase tracking-widest">Record a new vendor payment</p>
                    </div>
                    <button
                      onClick={() => setIsAddExpenseOpen(false)}
                      className="w-10 h-10 rounded-xl bg-white text-[#9B9BAD] hover:text-red-500 flex items-center justify-center shadow-sm border border-[#F4F3EF]"
                    >
                      <FiX size={20} />
                    </button>
                  </div>

                  <div className="flex-1 overflow-y-auto p-8 space-y-6">
                    <div>
                      <label className="block text-[11px] font-black text-[#1A1A2E] uppercase tracking-widest mb-2">Vendor Name</label>
                      <input type="text" className="w-full bg-[#F8FAFC] border border-[#F4F3EF] rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#1B4DA0]/20 outline-none transition-all" placeholder="Enter vendor name" />
                    </div>
                    <div>
                      <label className="block text-[11px] font-black text-[#1A1A2E] uppercase tracking-widest mb-2">Category</label>
                      <select className="w-full bg-[#F8FAFC] border border-[#F4F3EF] rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#1B4DA0]/20 outline-none transition-all">
                        <option>Office Rent</option>
                        <option>Electricity</option>
                        <option>Marketing</option>
                        <option>Software Costs</option>
                        <option>Petty Cash</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[11px] font-black text-[#1A1A2E] uppercase tracking-widest mb-2">Amount</label>
                      <input type="text" className="w-full bg-[#F8FAFC] border border-[#F4F3EF] rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#1B4DA0]/20 outline-none transition-all" placeholder="₹0.00" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[11px] font-black text-[#1A1A2E] uppercase tracking-widest mb-2">Date</label>
                        <input type="date" className="w-full bg-[#F8FAFC] border border-[#F4F3EF] rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#1B4DA0]/20 outline-none transition-all" />
                      </div>
                      <div>
                        <label className="block text-[11px] font-black text-[#1A1A2E] uppercase tracking-widest mb-2">Status</label>
                        <select
                          value={expenseForm.status}
                          onChange={(e) => setExpenseForm(prev => ({ ...prev, status: e.target.value }))}
                          className="w-full bg-[#F8FAFC] border border-[#F4F3EF] rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#1B4DA0]/20 outline-none transition-all cursor-pointer"
                        >
                          <option>Paid</option>
                          <option>Pending</option>
                          <option>Processing</option>
                        </select>
                      </div>
                    </div>
                    {expenseForm.status === 'Paid' && (
                      <div className="space-y-6 pt-4 border-t border-[#F4F3EF] animate-in fade-in slide-in-from-top-4 duration-300 text-left">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-[11px] font-black text-[#1A1A2E] uppercase tracking-widest mb-2">Payment Method</label>
                            <select className="w-full bg-[#F8FAFC] border border-[#F4F3EF] rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#1B4DA0]/20 outline-none transition-all font-bold cursor-pointer">
                              <option>Bank Transfer</option>
                              <option>Credit Card</option>
                              <option>UPI</option>
                              <option>Cash</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-[11px] font-black text-[#1A1A2E] uppercase tracking-widest mb-2">Payment Date</label>
                            <input type="date" className="w-full bg-[#F8FAFC] border border-[#F4F3EF] rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#1B4DA0]/20 outline-none transition-all" />
                          </div>
                        </div>

                        <div>
                          <label className="block text-[11px] font-black text-[#1A1A2E] uppercase tracking-widest mb-2">Transaction Reference / UTR Number</label>
                          <input type="text" className="w-full bg-[#F8FAFC] border border-[#F4F3EF] rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#1B4DA0]/20 outline-none transition-all" placeholder="Enter UTR or TXN reference" />
                        </div>

                        <div>
                          <label className="block text-[11px] font-black text-[#1A1A2E] uppercase tracking-widest mb-2">Attach Receipt / Expense File</label>
                          <div className="w-full flex items-center justify-center gap-3 px-4 py-5 bg-[#F8FAFC] border-2 border-dashed border-[#E2E8F0] rounded-2xl cursor-pointer hover:border-emerald-500 hover:bg-emerald-50/10 transition-all group relative">
                            <input
                              type="file"
                              accept=".pdf, image/*"
                              className="absolute inset-0 opacity-0 cursor-pointer"
                              onChange={(e) => {
                                if (e.target.files && e.target.files[0]) {
                                  setExpenseForm(prev => ({
                                    ...prev,
                                    receiptFileName: e.target.files[0].name
                                  }));
                                }
                              }}
                            />
                            <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center group-hover:bg-emerald-500 transition-all flex-shrink-0">
                              <svg className="w-4 h-4 text-emerald-600 group-hover:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                              </svg>
                            </div>
                            <div className="text-left overflow-hidden">
                              <p className="text-xs font-bold text-[#1A1A2E] truncate">
                                {expenseForm.receiptFileName || "Add Receipt File"}
                              </p>
                              <p className="text-[10px] text-[#9B9BAD] mt-0.5">
                                {expenseForm.receiptFileName ? "Click to change file" : "Drag & drop or click to browse"}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                    <div>
                      <label className="block text-[11px] font-black text-[#1A1A2E] uppercase tracking-widest mb-2">Notes</label>
                      <textarea className="w-full bg-[#F8FAFC] border border-[#F4F3EF] rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#1B4DA0]/20 outline-none transition-all h-24 resize-none" placeholder="Add any details here..."></textarea>
                    </div>
                  </div>

                  <div className="p-8 bg-[#F8FAFC] border-t border-[#F4F3EF]">
                    <button
                      onClick={() => setIsAddExpenseOpen(false)}
                      className="w-full py-4 rounded-2xl bg-[#1B4DA0] text-white text-xs font-black uppercase tracking-widest hover:bg-[#0D47A1] transition-all shadow-lg shadow-blue-500/20"
                    >
                      Save Expense
                    </button>
                  </div>
                </motion.div>
              </div>
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
                  Approve Payments
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

export default ExpenseVendorsTab;
