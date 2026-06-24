import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSearch, FiChevronDown, FiHome, FiWifi, FiTrendingUp, FiTruck, FiTool, FiClipboard, FiCheck, FiX, FiChevronRight, FiDownload, FiPrinter, FiEdit2 } from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import { getFinanceExpenses, createFinanceExpense, updateFinanceExpenseStatus, updateFinanceExpense } from '../../../service/api';

const mockExpenses = [];

const base64ToBlob = (base64Data, contentType) => {
  const byteCharacters = atob(base64Data.split(',')[1]);
  const byteArrays = [];
  for (let offset = 0; offset < byteCharacters.length; offset += 512) {
    const slice = byteCharacters.slice(offset, offset + 512);
    const byteNumbers = new Array(slice.length);
    for (let i = 0; i < slice.length; i++) {
      byteNumbers[i] = slice.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    byteArrays.push(byteArray);
  }
  return new Blob(byteArrays, { type: contentType });
};

const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
  });
};

const AccountsExpenseVendorsTab = ({ notificationBell, readOnly }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategoryFilter, setActiveCategoryFilter] = useState('all');
  const [activeStatusFilter, setActiveStatusFilter] = useState('all');
  const [selectedIds, setSelectedIds] = useState([]);
  const [selectedExpenseDetail, setSelectedExpenseDetail] = useState(null);
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingExpenseId, setEditingExpenseId] = useState(null);

  const [expenses, setExpenses] = useState([]);
  const [expenseForm, setExpenseForm] = useState({
    vendor: '',
    category: 'Office Rent',
    customCategory: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    status: 'Paid',
    notes: '',
    paymentMethod: 'Bank Transfer',
    transactionRef: '',
    paymentDate: new Date().toISOString().split('T')[0],
    receiptFile: null,
    receiptFileName: ''
  });

  // Record Payment Modal States
  const [isRecordModalOpen, setIsRecordModalOpen] = useState(false);
  const [pendingExpenseToPay, setPendingExpenseToPay] = useState(null);
  const [recordPaymentForm, setRecordPaymentForm] = useState({
    paymentMethod: 'Bank Transfer',
    transactionRef: '',
    paymentDate: new Date().toISOString().split('T')[0],
    receiptFile: null,
    receiptFileName: '',
    notes: ''
  });

  const fetchExpenses = async () => {
    setLoading(true);
    try {
      const res = await getFinanceExpenses();
      if (res && res.success && Array.isArray(res.data)) {
        const mapped = res.data.map((item, idx) => {
          const dt = item.date ? new Date(item.date) : new Date();
          let paymentMethod = 'Bank Transfer';
          let transactionRef = '';
          let paymentDate = dt.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
          let receiptFileName = '';
          let receiptFileData = '';
          let additionalNotes = item.notes || '';
          let hasPaymentDetails = false;
          let details = null;

          if (item.notes && item.notes.trim().startsWith('{')) {
            try {
              details = JSON.parse(item.notes);
              paymentMethod = details.paymentMethod || 'Bank Transfer';
              transactionRef = details.transactionRef || '';
              if (details.paymentDate) {
                paymentDate = new Date(details.paymentDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
              }
              receiptFileName = details.receiptFileName || '';
              receiptFileData = details.receiptFileData || '';
              additionalNotes = details.additionalNotes || '';
              hasPaymentDetails = true;
            } catch (e) {
              console.error('Failed to parse notes JSON:', e);
            }
          }

          return {
            id: `#EXP-2026-${String(idx + 1).padStart(3, '0')}`,
            dbId: item.id,
            category: item.category,
            vendor: item.vendor,
            amount: '₹' + Number(item.amount).toLocaleString('en-IN'),
            status: item.status || 'Paid',
            date: dt.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
            dueDate: new Date(new Date(dt).setDate(dt.getDate() + 15)).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
            contactEmail: 'finance@mabicons.com',
            paymentMethod,
            transactionRef,
            paymentDate,
            receiptFileName,
            receiptFileData,
            notes: additionalNotes,
            hasPaymentDetails,
            rawDate: item.date,
            rawAmount: item.amount,
            rawPaymentDate: (hasPaymentDetails && details.paymentDate) ? details.paymentDate : item.date
          };
        });
        setExpenses(mapped);
      } else {
        setExpenses([]);
      }
    } catch (err) {
      console.error('Failed to fetch expenses:', err);
      setExpenses([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

  const filteredExpenses = expenses.filter(expense => {
    const matchesSearch = expense.vendor.toLowerCase().includes(searchTerm.toLowerCase()) ||
      expense.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = activeCategoryFilter === 'all' || expense.category === activeCategoryFilter;
    const matchesStatus = activeStatusFilter === 'all' || expense.status.toLowerCase() === activeStatusFilter.toLowerCase();

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const handleAddExpense = async (e, addAnother = false) => {
    if (e) e.preventDefault();
    if (!expenseForm.vendor || !expenseForm.amount || !expenseForm.date) {
      toast.error('Please fill in Vendor Name, Amount and Date');
      return;
    }

    const finalCategory = expenseForm.category === 'Other' ? expenseForm.customCategory : expenseForm.category;
    if (expenseForm.category === 'Other' && !finalCategory) {
      toast.error('Please specify the custom category');
      return;
    }

    const loader = toast.loading(isEditing ? 'Updating expense in database...' : 'Recording expense to database...');
    try {
      let finalNotes = expenseForm.notes;
      if (expenseForm.status === 'Paid') {
        finalNotes = JSON.stringify({
          paymentMethod: expenseForm.paymentMethod || 'Bank Transfer',
          transactionRef: expenseForm.transactionRef || '',
          paymentDate: expenseForm.paymentDate || expenseForm.date,
          receiptFileName: expenseForm.receiptFileName || '',
          receiptFileData: expenseForm.receiptFileData || '',
          additionalNotes: expenseForm.notes || ''
        });
      }

      const payload = {
        category: finalCategory,
        vendor: expenseForm.vendor,
        amount: parseFloat(expenseForm.amount),
        status: expenseForm.status,
        date: expenseForm.date,
        notes: finalNotes
      };

      if (isEditing) {
        if (editingExpenseId && !String(editingExpenseId).startsWith('#')) {
          await updateFinanceExpense(editingExpenseId, payload);
          toast.success('Expense updated in database successfully!', { id: loader });
        } else {
          // Mock expense update
          setExpenses(prevExpenses => prevExpenses.map(p => {
            if (p.id === editingExpenseId) {
              return {
                ...p,
                category: finalCategory,
                vendor: expenseForm.vendor,
                amount: '₹' + Number(expenseForm.amount).toLocaleString('en-IN'),
                status: expenseForm.status,
                date: new Date(expenseForm.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
                notes: expenseForm.notes,
                rawDate: expenseForm.date,
                rawAmount: expenseForm.amount
              };
            }
            return p;
          }));
          toast.success('Mock expense updated successfully!', { id: loader });
        }
      } else {
        await createFinanceExpense(payload);
        toast.success('Expense recorded to database successfully!', { id: loader });
      }
      
      if (!addAnother) {
        setIsAddExpenseOpen(false);
        setIsEditing(false);
        setEditingExpenseId(null);
      }
      
      setExpenseForm({
        vendor: '',
        category: 'Office Rent',
        customCategory: '',
        amount: '',
        date: new Date().toISOString().split('T')[0],
        status: 'Paid',
        notes: '',
        paymentMethod: 'Bank Transfer',
        transactionRef: '',
        paymentDate: new Date().toISOString().split('T')[0],
        receiptFile: null,
        receiptFileName: '',
        receiptFileData: ''
      });
      fetchExpenses();
    } catch (err) {
      toast.error(err.message || 'Failed to save expense', { id: loader });
    }
  };

  const handleEditExpense = (expense) => {
    const isPredefined = ["Office Rent", "Electricity", "Marketing", "Software Costs", "Petty Cash"].includes(expense.category);
    
    let formattedDate = '';
    if (expense.rawDate) {
      formattedDate = expense.rawDate.split('T')[0];
    } else {
      try {
        formattedDate = new Date(expense.date).toISOString().split('T')[0];
      } catch (e) {
        formattedDate = new Date().toISOString().split('T')[0];
      }
    }

    let formattedPaymentDate = '';
    if (expense.rawPaymentDate) {
      formattedPaymentDate = expense.rawPaymentDate.split('T')[0];
    } else if (expense.paymentDate) {
      try {
        formattedPaymentDate = new Date(expense.paymentDate).toISOString().split('T')[0];
      } catch (e) {
        formattedPaymentDate = formattedDate;
      }
    } else {
      formattedPaymentDate = formattedDate;
    }

    setExpenseForm({
      vendor: expense.vendor || '',
      category: isPredefined ? expense.category : 'Other',
      customCategory: isPredefined ? '' : expense.category,
      amount: expense.rawAmount || parseFloat(expense.amount.replace(/[^\d.]/g, '')) || '',
      date: formattedDate,
      status: expense.status || 'Paid',
      notes: expense.notes || '',
      paymentMethod: expense.paymentMethod || 'Bank Transfer',
      transactionRef: expense.transactionRef || '',
      paymentDate: formattedPaymentDate,
      receiptFile: null,
      receiptFileName: expense.receiptFileName || '',
      receiptFileData: expense.receiptFileData || ''
    });
    
    setIsEditing(true);
    setEditingExpenseId(expense.dbId || expense.id);
    setSelectedExpenseDetail(null);
    setIsAddExpenseOpen(true);
  };

  const handleCloseAddExpense = () => {
    setIsAddExpenseOpen(false);
    setIsEditing(false);
    setEditingExpenseId(null);
    setExpenseForm({
      vendor: '',
      category: 'Office Rent',
      customCategory: '',
      amount: '',
      date: new Date().toISOString().split('T')[0],
      status: 'Paid',
      notes: '',
      paymentMethod: 'Bank Transfer',
      transactionRef: '',
      paymentDate: new Date().toISOString().split('T')[0],
      receiptFile: null,
      receiptFileName: '',
      receiptFileData: ''
    });
  };

  const handleOpenAddExpense = () => {
    setIsEditing(false);
    setEditingExpenseId(null);
    setExpenseForm({
      vendor: '',
      category: 'Office Rent',
      customCategory: '',
      amount: '',
      date: new Date().toISOString().split('T')[0],
      status: 'Paid',
      notes: '',
      paymentMethod: 'Bank Transfer',
      transactionRef: '',
      paymentDate: new Date().toISOString().split('T')[0],
      receiptFile: null,
      receiptFileName: '',
      receiptFileData: ''
    });
    setIsAddExpenseOpen(true);
  };

  const handleConfirmPayment = async (e) => {
    e.preventDefault();
    if (!pendingExpenseToPay) return;

    const loader = toast.loading('Recording payment details...');
    try {
      const payload = {
        paymentMethod: recordPaymentForm.paymentMethod,
        transactionRef: recordPaymentForm.transactionRef,
        paymentDate: recordPaymentForm.paymentDate,
        receiptFileName: recordPaymentForm.receiptFileName,
        receiptFileData: recordPaymentForm.receiptFileData || '',
        notes: recordPaymentForm.notes
      };

      if (pendingExpenseToPay.dbId) {
        await updateFinanceExpenseStatus(pendingExpenseToPay.dbId, 'Paid', payload);
      }

      toast.success('Payment details recorded successfully!', { id: loader });
      setIsRecordModalOpen(false);

      // Reset form
      setRecordPaymentForm({
        paymentMethod: 'Bank Transfer',
        transactionRef: '',
        paymentDate: new Date().toISOString().split('T')[0],
        receiptFile: null,
        receiptFileName: '',
        receiptFileData: '',
        notes: ''
      });

      // Update state
      if (pendingExpenseToPay.dbId) {
        await fetchExpenses();
        // Since list is re-fetched, let's retrieve the updated record from DB
        // but to ensure the drawer displays it immediately:
        const formattedDate = new Date(payload.paymentDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
        const updatedExpense = {
          ...pendingExpenseToPay,
          status: 'Paid',
          paymentMethod: payload.paymentMethod,
          transactionRef: payload.transactionRef,
          paymentDate: formattedDate,
          receiptFileName: payload.receiptFileName,
          receiptFileData: payload.receiptFileData,
          notes: payload.notes,
          hasPaymentDetails: true
        };
        setSelectedExpenseDetail(updatedExpense);
      } else {
        const formattedDate = new Date(payload.paymentDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
        const updatedExpense = {
          ...pendingExpenseToPay,
          status: 'Paid',
          paymentMethod: payload.paymentMethod,
          transactionRef: payload.transactionRef,
          paymentDate: formattedDate,
          receiptFileName: payload.receiptFileName,
          receiptFileData: payload.receiptFileData,
          notes: payload.notes,
          hasPaymentDetails: true
        };
        setExpenses(prev => prev.map(e => e.id === pendingExpenseToPay.id ? updatedExpense : e));
        setSelectedExpenseDetail(updatedExpense);
      }
    } catch (err) {
      console.error(err);
      toast.error(err.message || 'Failed to record payment details', { id: loader });
    }
  };

  const handlePrintExpense = (expense) => {
    if (!expense) return;
    if (expense.receiptFileData) {
      const printWindow = window.open('', '_blank');
      if (expense.receiptFileData.startsWith('data:image/')) {
        printWindow.document.write(`
          <html>
            <body style="margin:0; display:flex; align-items:center; justify-content:center; height:100vh; background:#fafaf8;">
              <img src="${expense.receiptFileData}" style="max-width:100%; max-height:100%; object-fit:contain;" />
              <script>
                window.onload = function() {
                  window.print();
                  window.close();
                }
              <\/script>
            </body>
          </html>
        `);
      } else {
        printWindow.document.write(`
          <html>
            <body style="margin:0; height:100vh;">
              <iframe src="${expense.receiptFileData}" style="width:100%; height:100%; border:none;"></iframe>
              <script>
                window.onload = function() {
                  window.print();
                  window.close();
                }
              <\/script>
            </body>
          </html>
        `);
      }
      printWindow.document.close();
      return;
    }

    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>Expense Receipt - ${expense.id}</title>
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 40px; color: #1a1a2e; }
            .header { display: flex; justify-content: space-between; border-bottom: 2px solid #f4f3ef; padding-bottom: 20px; margin-bottom: 30px; }
            .title { font-size: 24px; font-weight: bold; color: #1b4da0; }
            .meta { text-align: right; font-size: 14px; color: #9b9bad; }
            .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 30px; }
            .card { background: #fafaf8; border: 1px solid #f4f3ef; padding: 20px; border-radius: 16px; }
            .card h3 { margin-top: 0; font-size: 11px; text-transform: uppercase; color: #9b9bad; letter-spacing: 1px; }
            .card p { margin: 5px 0; font-size: 14px; font-weight: bold; }
            .table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
            .table th, .table td { padding: 12px; text-align: left; border-bottom: 1px solid #f4f3ef; }
            .table th { color: #9b9bad; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; }
            .amount { font-size: 18px; font-weight: 900; color: #ef4444; }
            .status { display: inline-block; padding: 4px 12px; border-radius: 8px; font-size: 11px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; }
            .status-paid { background: #dcfce7; color: #166534; }
            .status-pending { background: #fef3c7; color: #92400e; }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <div class="title">Mabicons ERP - Expense Receipt</div>
              <div style="font-size: 14px; margin-top: 5px; font-weight: bold;">ID: ${expense.id}</div>
            </div>
            <div class="meta">
              <div>Date: ${expense.date}</div>
              <div style="margin-top: 5px;">Status: <span class="status ${expense.status === 'Paid' ? 'status-paid' : 'status-pending'}">${expense.status}</span></div>
            </div>
          </div>
          <div class="grid">
            <div class="card">
              <h3>Vendor Info</h3>
              <p>${expense.vendor}</p>
              <p style="font-size: 12px; color: #64748b; font-weight: normal; margin-top: 8px;">${expense.contactEmail || 'finance@mabicons.com'}</p>
            </div>
            <div class="card">
              <h3>Payment Details</h3>
              <p>Method: ${expense.paymentMethod || 'N/A'}</p>
              <p>Txn/UTR: ${expense.transactionRef || 'N/A'}</p>
              <p>Payment Date: ${expense.paymentDate || expense.date}</p>
            </div>
          </div>
          <table class="table">
            <thead>
              <tr>
                <th>Category</th>
                <th style="text-align: right;">Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style="font-weight: bold;">${expense.category}</td>
                <td style="text-align: right;" class="amount">${expense.amount}</td>
              </tr>
            </tbody>
          </table>
          <div style="margin-top: 20px; font-size: 13px; color: #1a1a2e; background: #fafaf8; padding: 15px; border-radius: 12px; border: 1px solid #f4f3ef;">
            <strong style="color: #9b9bad; font-size: 11px; text-transform: uppercase; display: block; margin-bottom: 5px;">Notes</strong>
            ${expense.notes || 'N/A'}
          </div>
          <script>
            window.onload = function() {
              window.print();
              window.close();
            }
          <\/script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const handleDownloadExpense = (expense) => {
    if (!expense) return;
    if (expense.receiptFileData) {
      try {
        const parts = expense.receiptFileData.split(';base64,');
        const contentType = parts[0].split(':')[1];
        const blob = base64ToBlob(expense.receiptFileData, contentType);
        const blobUrl = URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.href = blobUrl;
        link.download = expense.receiptFileName || `Receipt_${expense.id}`;
        link.click();
        
        setTimeout(() => URL.revokeObjectURL(blobUrl), 100);
        toast.success(`Downloaded attached file: ${expense.receiptFileName}`);
        return;
      } catch (err) {
        console.error('Blob download failed, trying direct link:', err);
        const link = document.createElement('a');
        link.href = expense.receiptFileData;
        link.download = expense.receiptFileName || `Receipt_${expense.id}`;
        link.click();
        toast.success(`Downloaded attached file: ${expense.receiptFileName}`);
        return;
      }
    }

    const textContent = `MABICONS ERP - EXPENSE RECEIPT
=================================
Expense ID: ${expense.id}
Vendor: ${expense.vendor}
Contact Email: ${expense.contactEmail || 'finance@mabicons.com'}
Category: ${expense.category}
Amount: ${expense.amount}
Date: ${expense.date}
Due Date: ${expense.dueDate}
Status: ${expense.status}

PAYMENT DETAILS
---------------
Payment Method: ${expense.paymentMethod || 'N/A'}
Transaction Ref: ${expense.transactionRef || 'N/A'}
Payment Date: ${expense.paymentDate || expense.date}
Notes: ${expense.notes || 'N/A'}
`;
    const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `Expense_Receipt_${expense.id}.txt`;
    link.click();
    toast.success('Expense receipt text file downloaded successfully!');
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500" style={{ fontFamily: "'Calibri', sans-serif" }}>
      {/* Header Section */}
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4 text-left">
        <div className="text-left">
          <h1 className="text-3xl font-bold text-[#1A1A2E] tracking-tight font-syne">Expense & Vendors</h1>

        </div>
        <div className="flex items-center gap-3">
          {notificationBell}
          {!readOnly && (
            <button
              onClick={handleOpenAddExpense}
              className="px-6 py-3 rounded-2xl bg-[#1B4DA0] text-white text-xs font-black uppercase tracking-widest hover:scale-105 transition-all shadow-lg shadow-blue-500/20"
            >
              + Add Expense
            </button>
          )}
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
                        ${expense.status === 'Paid' ? 'bg-[#DCFCE7] text-[#166534]' :
                          expense.status === 'Pending' ? 'bg-[#FEF3C7] text-[#92400E]' :
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
                      {!readOnly && (
                        <button
                          onClick={() => handleEditExpense(selectedExpenseDetail)}
                          className="w-10 h-10 rounded-xl bg-[#F1F5F9] text-[#64748B] flex items-center justify-center hover:bg-[#E2E8F0] hover:text-[#0F172A] transition-all"
                          title="Edit Expense"
                        >
                          <FiEdit2 size={18} />
                        </button>
                      )}
                      <button
                        onClick={() => handleDownloadExpense(selectedExpenseDetail)}
                        className="w-10 h-10 rounded-xl bg-[#F1F5F9] text-[#64748B] flex items-center justify-center hover:bg-[#E2E8F0] hover:text-[#0F172A] transition-all"
                        title="Download Receipt"
                      >
                        <FiDownload size={18} />
                      </button>
                      <button
                        onClick={() => handlePrintExpense(selectedExpenseDetail)}
                        className="w-10 h-10 rounded-xl bg-[#F1F5F9] text-[#64748B] flex items-center justify-center hover:bg-[#E2E8F0] hover:text-[#0F172A] transition-all"
                        title="Print Receipt"
                      >
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
                  {selectedExpenseDetail.status === 'Pending' && !readOnly ? (
                    <div className="bg-white p-6 rounded-[24px] border border-[#E2E8F0] shadow-sm flex items-center justify-between">
                      <div>
                        <h3 className="text-[14px] font-bold text-[#0F172A] uppercase tracking-wider">Update Payment Status</h3>
                        <p className="text-[12px] text-[#64748B] mt-1">Mark this expense as Paid.</p>
                      </div>
                      <button
                        onClick={() => {
                          setPendingExpenseToPay(selectedExpenseDetail);
                          setRecordPaymentForm({
                            paymentMethod: 'Bank Transfer',
                            transactionRef: '',
                            paymentDate: new Date().toISOString().split('T')[0],
                            receiptFile: null,
                            receiptFileName: '',
                            notes: ''
                          });
                          setIsRecordModalOpen(true);
                        }}
                        className="px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-md active:scale-95 bg-[#DCFCE7] text-[#166534] hover:bg-[#BBF7D0] shadow-green-500/10"
                      >
                        Mark as Paid
                      </button>
                    </div>
                  ) : (
                    <div className="bg-[#F0FDF4] p-6 rounded-[24px] border border-[#BBF7D0] shadow-sm text-left">
                      <div className="flex items-center gap-2 mb-4">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                        <h3 className="text-[14px] font-black text-[#166534] uppercase tracking-wider">Payment Cleared</h3>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-[10px] font-black text-[#64748B] uppercase tracking-widest mb-0.5">Payment Method</p>
                          <p className="text-[13px] font-bold text-[#0F172A]">{selectedExpenseDetail.paymentMethod || 'Bank Transfer'}</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-black text-[#64748B] uppercase tracking-widest mb-0.5">Transaction ID / UTR</p>
                          <p className="text-[13px] font-bold text-[#0F172A]">{selectedExpenseDetail.transactionRef || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-black text-[#64748B] uppercase tracking-widest mb-0.5">Payment Date</p>
                          <p className="text-[13px] font-bold text-[#0F172A]">{selectedExpenseDetail.paymentDate || selectedExpenseDetail.date}</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-black text-[#64748B] uppercase tracking-widest mb-0.5">Notes</p>
                          <p className="text-[13px] font-bold text-[#0F172A] truncate" title={selectedExpenseDetail.notes || 'N/A'}>
                            {selectedExpenseDetail.notes || 'N/A'}
                          </p>
                        </div>
                      </div>

                      {selectedExpenseDetail.receiptFileName && (
                        <div className="space-y-3">
                          <div className="mt-4 p-3 bg-white rounded-xl border border-emerald-100 flex items-center justify-between">
                            <div className="flex items-center gap-2 overflow-hidden flex-1">
                              <FiClipboard className="text-emerald-500 flex-shrink-0" size={16} />
                              <span className="text-xs font-bold text-[#0F172A] truncate" title={selectedExpenseDetail.receiptFileName}>
                                {selectedExpenseDetail.receiptFileName}
                              </span>
                            </div>
                            <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-[9px] font-black uppercase tracking-widest flex-shrink-0">
                              Receipt
                            </span>
                          </div>

                          {selectedExpenseDetail.receiptFileData && (
                            <div className="mt-2 p-2 bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm flex flex-col items-center justify-center min-h-[150px]">
                              {selectedExpenseDetail.receiptFileData.startsWith('data:image/') ? (
                                <img
                                  src={selectedExpenseDetail.receiptFileData}
                                  alt="Receipt Preview"
                                  className="max-w-full max-h-[300px] object-contain rounded-xl hover:scale-[1.01] transition-all cursor-zoom-in"
                                  onClick={() => {
                                    const imgWindow = window.open();
                                    imgWindow.document.write(`<img src="${selectedExpenseDetail.receiptFileData}" style="max-width:100%;" />`);
                                  }}
                                />
                              ) : selectedExpenseDetail.receiptFileData.startsWith('data:application/pdf') ? (
                                <iframe
                                  src={selectedExpenseDetail.receiptFileData}
                                  title="Receipt PDF Preview"
                                  className="w-full h-[300px] rounded-xl border-none"
                                ></iframe>
                              ) : (
                                <div className="text-center p-4">
                                  <p className="text-xs font-bold text-[#64748B] mb-2">Document Attached</p>
                                  <button
                                    onClick={() => handleDownloadExpense(selectedExpenseDetail)}
                                    className="px-4 py-2 bg-emerald-50 text-emerald-700 text-[10px] font-black uppercase tracking-wider rounded-lg hover:bg-emerald-100 transition-all"
                                  >
                                    Open Document File
                                  </button>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
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
                onClick={handleCloseAddExpense}
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
                      <h2 className="text-2xl font-bold text-[#1A1A2E] font-syne">
                        {isEditing ? 'Edit Expense' : 'Add New Expense'}
                      </h2>
                      <p className="text-xs text-[#9B9BAD] font-bold mt-1 uppercase tracking-widest">
                        {isEditing ? 'Update expense details' : 'Record a new vendor payment'}
                      </p>
                    </div>
                    <button
                      onClick={handleCloseAddExpense}
                      className="w-10 h-10 rounded-xl bg-white text-[#9B9BAD] hover:text-red-500 flex items-center justify-center shadow-sm border border-[#F4F3EF]"
                    >
                      <FiX size={20} />
                    </button>
                  </div>

                  <div className="flex-1 overflow-y-auto p-8 space-y-6">
                    <div>
                      <label className="block text-[11px] font-black text-[#1A1A2E] uppercase tracking-widest mb-2">Vendor Name</label>
                      <input
                        type="text"
                        value={expenseForm.vendor}
                        onChange={(e) => setExpenseForm(prev => ({ ...prev, vendor: e.target.value }))}
                        className="w-full bg-[#F8FAFC] border border-[#F4F3EF] rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#1B4DA0]/20 outline-none transition-all"
                        placeholder="Enter vendor name"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-black text-[#1A1A2E] uppercase tracking-widest mb-2">Category</label>
                      <select
                        value={expenseForm.category}
                        onChange={(e) => setExpenseForm(prev => ({ ...prev, category: e.target.value }))}
                        className="w-full bg-[#F8FAFC] border border-[#F4F3EF] rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#1B4DA0]/20 outline-none transition-all"
                      >
                        <option>Office Rent</option>
                        <option>Electricity</option>
                        <option>Marketing</option>
                        <option>Software Costs</option>
                        <option>Petty Cash</option>
                        <option>Other</option>
                      </select>
                      {expenseForm.category === 'Other' && (
                        <input
                          type="text"
                          value={expenseForm.customCategory}
                          onChange={(e) => setExpenseForm(prev => ({ ...prev, customCategory: e.target.value }))}
                          className="w-full mt-3 bg-[#F8FAFC] border border-[#F4F3EF] rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#1B4DA0]/20 outline-none transition-all"
                          placeholder="Enter custom category"
                        />
                      )}
                    </div>
                    <div>
                      <label className="block text-[11px] font-black text-[#1A1A2E] uppercase tracking-widest mb-2">Amount</label>
                      <input
                        type="number"
                        value={expenseForm.amount}
                        onChange={(e) => setExpenseForm(prev => ({ ...prev, amount: e.target.value }))}
                        className="w-full bg-[#F8FAFC] border border-[#F4F3EF] rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#1B4DA0]/20 outline-none transition-all"
                        placeholder="0.00"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[11px] font-black text-[#1A1A2E] uppercase tracking-widest mb-2">Date</label>
                        <input
                          type="date"
                          value={expenseForm.date}
                          onChange={(e) => setExpenseForm(prev => ({ ...prev, date: e.target.value }))}
                          className="w-full bg-[#F8FAFC] border border-[#F4F3EF] rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#1B4DA0]/20 outline-none transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-black text-[#1A1A2E] uppercase tracking-widest mb-2">Status</label>
                        <select
                          value={expenseForm.status}
                          onChange={(e) => setExpenseForm(prev => ({ ...prev, status: e.target.value }))}
                          className="w-full bg-[#F8FAFC] border border-[#F4F3EF] rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#1B4DA0]/20 outline-none transition-all"
                        >
                          <option>Paid</option>
                          <option>Pending</option>
                        </select>
                      </div>
                    </div>
                    {expenseForm.status === 'Paid' && (
                      <div className="space-y-6 pt-4 border-t border-[#F4F3EF] animate-in fade-in slide-in-from-top-4 duration-300 text-left">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-[11px] font-black text-[#1A1A2E] uppercase tracking-widest mb-2">Payment Method</label>
                            <select
                              value={expenseForm.paymentMethod}
                              onChange={(e) => setExpenseForm(prev => ({ ...prev, paymentMethod: e.target.value }))}
                              className="w-full bg-[#F8FAFC] border border-[#F4F3EF] rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#1B4DA0]/20 outline-none transition-all font-bold cursor-pointer"
                            >
                              <option>Bank Transfer</option>
                              <option>Credit Card</option>
                              <option>UPI</option>
                              <option>Cash</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-[11px] font-black text-[#1A1A2E] uppercase tracking-widest mb-2">Payment Date</label>
                            <input
                              type="date"
                              value={expenseForm.paymentDate}
                              onChange={(e) => setExpenseForm(prev => ({ ...prev, paymentDate: e.target.value }))}
                              className="w-full bg-[#F8FAFC] border border-[#F4F3EF] rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#1B4DA0]/20 outline-none transition-all"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-[11px] font-black text-[#1A1A2E] uppercase tracking-widest mb-2">Transaction Reference / UTR Number</label>
                          <input
                            type="text"
                            value={expenseForm.transactionRef}
                            onChange={(e) => setExpenseForm(prev => ({ ...prev, transactionRef: e.target.value }))}
                            className="w-full bg-[#F8FAFC] border border-[#F4F3EF] rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#1B4DA0]/20 outline-none transition-all"
                            placeholder="Enter UTR or TXN reference"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-black text-[#1A1A2E] uppercase tracking-widest mb-2">Attach Receipt / Expense File</label>
                          <div className="w-full flex items-center justify-center gap-3 px-4 py-5 bg-[#F8FAFC] border-2 border-dashed border-[#E2E8F0] rounded-2xl cursor-pointer hover:border-emerald-500 hover:bg-emerald-50/10 transition-all group relative">
                            <input
                              type="file"
                              accept=".pdf, image/*"
                              className="absolute inset-0 opacity-0 cursor-pointer"
                              onChange={async (e) => {
                                if (e.target.files && e.target.files[0]) {
                                  const file = e.target.files[0];
                                  try {
                                    const base64 = await fileToBase64(file);
                                    setExpenseForm(prev => ({
                                      ...prev,
                                      receiptFile: file,
                                      receiptFileName: file.name,
                                      receiptFileData: base64
                                    }));
                                    toast.success(`Attached ${file.name}`);
                                  } catch (err) {
                                    toast.error('Failed to process file');
                                  }
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
                      <textarea
                        value={expenseForm.notes}
                        onChange={(e) => setExpenseForm(prev => ({ ...prev, notes: e.target.value }))}
                        className="w-full bg-[#F8FAFC] border border-[#F4F3EF] rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#1B4DA0]/20 outline-none transition-all h-24 resize-none"
                        placeholder="Add any details here..."
                      ></textarea>
                    </div>
                  </div>

                  <div className="p-8 bg-[#F8FAFC] border-t border-[#F4F3EF] flex gap-4">
                    <button
                      onClick={(e) => handleAddExpense(e, false)}
                      className="flex-1 py-4 rounded-2xl bg-[#1B4DA0] text-white text-xs font-black uppercase tracking-widest hover:bg-[#0D47A1] transition-all shadow-lg shadow-blue-500/20"
                    >
                      {isEditing ? 'Update Expense' : 'Save Expense'}
                    </button>
                    {!isEditing && (
                      <button
                        onClick={(e) => handleAddExpense(e, true)}
                        className="flex-1 py-4 rounded-2xl bg-white border-2 border-[#1B4DA0] text-[#1B4DA0] text-xs font-black uppercase tracking-widest hover:bg-blue-50 transition-all shadow-lg shadow-blue-500/10"
                      >
                        Save & Add Another
                      </button>
                    )}
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

      {/* Record Payment Modal */}
      {createPortal(
        <AnimatePresence>
          {isRecordModalOpen && pendingExpenseToPay && (
            <React.Fragment>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-[#1A1A2E]/40 backdrop-blur-md z-[210000]"
                onClick={() => setIsRecordModalOpen(false)}
              />

              <div className="fixed inset-0 z-[210001] flex items-center justify-center p-4 pointer-events-none">
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
                      <h2 className="text-2xl font-bold text-[#1A1A2E] font-syne">Record Payment</h2>
                      <p className="text-xs text-[#9B9BAD] font-bold mt-1 uppercase tracking-widest text-left">Enter payment details for accounting</p>
                    </div>
                    <button
                      onClick={() => setIsRecordModalOpen(false)}
                      className="w-10 h-10 rounded-xl bg-white text-[#9B9BAD] hover:text-red-500 flex items-center justify-center shadow-sm border border-[#F4F3EF]"
                    >
                      <FiX size={20} />
                    </button>
                  </div>

                  <form onSubmit={handleConfirmPayment} className="flex-1 overflow-y-auto p-8 space-y-6 text-left">
                    <div className="bg-[#F8FAFC] p-4 rounded-2xl border border-[#E2E8F0] grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-[10px] font-black text-[#94A3B8] uppercase tracking-widest mb-0.5">Vendor Name</p>
                        <p className="text-sm font-bold text-[#1A1A2E]">{pendingExpenseToPay.vendor}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-[#94A3B8] uppercase tracking-widest mb-0.5">Amount Due</p>
                        <p className="text-sm font-black text-red-500">{pendingExpenseToPay.amount}</p>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-black text-[#1A1A2E] uppercase tracking-widest mb-2">Payment Method</label>
                      <select
                        value={recordPaymentForm.paymentMethod}
                        onChange={(e) => setRecordPaymentForm(prev => ({ ...prev, paymentMethod: e.target.value }))}
                        className="w-full bg-[#F8FAFC] border border-[#F4F3EF] rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#1B4DA0]/20 outline-none transition-all font-bold"
                      >
                        <option>Bank Transfer</option>
                        <option>Credit Card</option>
                        <option>UPI</option>
                        <option>Cash</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-black text-[#1A1A2E] uppercase tracking-widest mb-2">Transaction Reference / UTR Number</label>
                      <input
                        type="text"
                        required
                        value={recordPaymentForm.transactionRef}
                        onChange={(e) => setRecordPaymentForm(prev => ({ ...prev, transactionRef: e.target.value }))}
                        className="w-full bg-[#F8FAFC] border border-[#F4F3EF] rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#1B4DA0]/20 outline-none transition-all"
                        placeholder="Enter UTR or TXN reference"
                      />
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                      <div>
                        <label className="block text-[11px] font-black text-[#1A1A2E] uppercase tracking-widest mb-2">Payment Date</label>
                        <input
                          type="date"
                          required
                          value={recordPaymentForm.paymentDate}
                          onChange={(e) => setRecordPaymentForm(prev => ({ ...prev, paymentDate: e.target.value }))}
                          className="w-full bg-[#F8FAFC] border border-[#F4F3EF] rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#1B4DA0]/20 outline-none transition-all"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-black text-[#1A1A2E] uppercase tracking-widest mb-2">Attach Receipt / Expense File</label>
                      <div className="w-full flex items-center justify-center gap-3 px-4 py-5 bg-[#F8FAFC] border-2 border-dashed border-[#E2E8F0] rounded-2xl cursor-pointer hover:border-emerald-500 hover:bg-emerald-50/10 transition-all group relative">
                        <input
                          type="file"
                          accept=".pdf, image/*"
                          className="absolute inset-0 opacity-0 cursor-pointer"
                          onChange={async (e) => {
                            if (e.target.files && e.target.files[0]) {
                              const file = e.target.files[0];
                              try {
                                const base64 = await fileToBase64(file);
                                setRecordPaymentForm(prev => ({
                                  ...prev,
                                  receiptFile: file,
                                  receiptFileName: file.name,
                                  receiptFileData: base64
                                }));
                                toast.success(`Attached ${file.name}`);
                              } catch (err) {
                                toast.error('Failed to process file');
                              }
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
                            {recordPaymentForm.receiptFileName || "Add Receipt File"}
                          </p>
                          <p className="text-[10px] text-[#9B9BAD] mt-0.5">
                            {recordPaymentForm.receiptFileName ? "Click to change file" : "Drag & drop or click to browse"}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-black text-[#1A1A2E] uppercase tracking-widest mb-2">Notes</label>
                      <textarea
                        value={recordPaymentForm.notes}
                        onChange={(e) => setRecordPaymentForm(prev => ({ ...prev, notes: e.target.value }))}
                        className="w-full bg-[#F8FAFC] border border-[#F4F3EF] rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#1B4DA0]/20 outline-none transition-all h-20 resize-none"
                        placeholder="Add payment notes..."
                      ></textarea>
                    </div>

                    <div className="pt-4 flex gap-4">
                      <button
                        type="submit"
                        className="flex-1 py-4 rounded-2xl bg-emerald-600 text-white text-xs font-black uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-lg shadow-green-500/20"
                      >
                        Confirm Payment
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsRecordModalOpen(false)}
                        className="flex-1 py-4 rounded-2xl bg-white border border-[#E2E8F0] text-[#64748B] text-xs font-black uppercase tracking-widest hover:bg-gray-50 transition-all"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </motion.div>
              </div>
            </React.Fragment>
          )}
        </AnimatePresence>,
        document.body
      )}
    </div>
  );
};

export default AccountsExpenseVendorsTab;
