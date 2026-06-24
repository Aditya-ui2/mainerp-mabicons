import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSearch, FiChevronDown, FiChevronRight, FiX, FiCheck, FiMail, FiPhone, FiCalendar, FiDollarSign, FiClock, FiAlertCircle, FiPlus, FiRefreshCw, FiEdit2, FiBell, FiFileText } from 'react-icons/fi';
import { FaRupeeSign } from 'react-icons/fa';
import { getFinanceClientAccounts, getFinancePaymentRequests, createFinancePaymentRequest, getFinanceExpenses, updateFinanceExpenseStatus, updateFinancePaymentRequest, updateFinanceExpense, sendFinancePaymentReminder, BASE_URL } from '../../../service/api';
import { toast } from 'react-hot-toast';

const formatINR = (num) => {
  if (!num && num !== 0) return '₹0';
  return '₹' + Number(num).toLocaleString('en-IN');
};

const STATIC_PAYMENTS = [];
const mockPendingPayments = [];

const AccountsPendingPaymentsTab = ({ notificationBell, readOnly }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategoryFilter, setActiveCategoryFilter] = useState('all');
  const [selectedPaymentDetail, setSelectedPaymentDetail] = useState(null);
  const [payments, setPayments] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editingPaymentId, setEditingPaymentId] = useState(null);
  const [customCategory, setCustomCategory] = useState('');

  // Record Payment Form State
  const [isRecordModalOpen, setIsRecordModalOpen] = useState(false);
  const [recordData, setRecordData] = useState({
    payee: '',
    category: 'Vendor Payment',
    amount: '',
    dueDate: '',
    priority: 'Medium',
    bankDetails: '',
    notes: '',
    department: 'Recruitment',
    paymentSource: 'Client Side',
    clientId: '',
    billFile: null,
    billFileName: '',
    attachmentUrl: null
  });

  // Confirm Payment Modal State
  const [isConfirmPaymentModalOpen, setIsConfirmPaymentModalOpen] = useState(false);
  const [paymentToConfirm, setPaymentToConfirm] = useState(null);
  const [confirmPaymentForm, setConfirmPaymentForm] = useState({
    paymentMethod: 'Bank Transfer',
    transactionRef: '',
    paymentDate: new Date().toISOString().split('T')[0],
    receiptFile: null,
    receiptFileName: '',
    notes: ''
  });

  const fetchPayments = async () => {
    setLoading(true);
    try {
      const [accountsRes, requestsRes, expensesRes] = await Promise.allSettled([
        getFinanceClientAccounts(),
        getFinancePaymentRequests(),
        getFinanceExpenses()
      ]);

      let merged = [];
      let expensesList = [];
      if (expensesRes.status === 'fulfilled' && expensesRes.value?.data) {
        expensesList = Array.isArray(expensesRes.value.data) ? expensesRes.value.data : [];
      }

      // Add pending expenses from DB
      const pendingExpenses = expensesList
        .filter(e => (e.status || '').toLowerCase().trim() === 'pending')
        .map((exp, idx) => ({
          id: `#PAY-2026-${String(500 + idx).padStart(3, '0')}`,
          dbId: exp.id,
          isExpense: true,
          payee: exp.vendor || 'Unknown Vendor',
          category: exp.category || 'Expense',
          amount: '₹' + Number(exp.amount).toLocaleString('en-IN'),
          status: exp.status || 'Pending',
          priority: 'Medium',
          dueDate: exp.date ? new Date(new Date(exp.date).setDate(new Date(exp.date).getDate() + 15)).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : 'N/A',
          bankDetails: 'Bank details on file',
          contactEmail: 'finance@company.com',
          notes: exp.notes || 'Expense record',
          rawAmount: exp.amount,
          rawDueDate: exp.date
        }));
      merged = [...merged, ...pendingExpenses];

      // 1. Process client accounts overdue oustanding payments
      if (accountsRes.status === 'fulfilled' && accountsRes.value?.data) {
        const accounts = Array.isArray(accountsRes.value.data) ? accountsRes.value.data : [];
        setClients(accounts);
        const overduePayments = accounts
          .filter(a => a.status === 'Overdue' || parseFloat(a.totalOutstanding || 0) > 0)
          .map((acc, idx) => ({
            id: acc.lastInvoiceNumber || `#PAY-${new Date().getFullYear()}-${String(200 + idx).padStart(3, '0')}`,
            payee: acc.companyName || 'Unknown Client',
            category: 'Client Outstanding',
            amount: formatINR(parseFloat(acc.totalOutstanding || 0)),
            status: acc.status === 'Overdue' ? 'Overdue' : 'Pending',
            priority: acc.status === 'Overdue' ? 'High' : 'Medium',
            dueDate: acc.updatedAt ? new Date(new Date(acc.updatedAt).setDate(new Date(acc.updatedAt).getDate() + 15)).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : 'N/A',
            bankDetails: 'Bank details on file',
            contactEmail: `accounts@${(acc.companyName || 'co').toLowerCase().replace(/\s+/g, '')}.com`,
            notes: `Pending invoices: ${acc.pendingInvoicesCount || 0}. Account type: ${acc.accountType || 'Standard'}.`
          }));
        merged = [...merged, ...overduePayments];
      }

      // 2. Process real custom payment requests from DB
      if (requestsRes.status === 'fulfilled' && requestsRes.value?.data) {
        const customRequests = Array.isArray(requestsRes.value.data) ? requestsRes.value.data : [];
        const dbRequests = customRequests.map((req, idx) => {
          const dt = req.dueDate ? new Date(req.dueDate) : new Date();
          return {
            id: `#PAY-2026-${String(300 + idx).padStart(3, '0')}`,
            dbId: req.id,
            payee: req.payee,
            category: req.category,
            amount: formatINR(parseFloat(req.amount)),
            status: req.status || 'Pending',
            priority: req.priority || 'Medium',
            dueDate: dt.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
            bankDetails: req.bankDetails || 'N/A',
            contactEmail: 'finance@mabicons.com',
            notes: req.notes || 'Manual payment request',
            paymentSource: req.paymentSource || 'Client Side',
            rawAmount: req.amount,
            rawDueDate: req.dueDate,
            department: req.department || 'Recruitment',
            clientId: req.clientId || '',
            attachmentUrl: req.attachmentUrl || null
          };
        });
        merged = [...merged, ...dbRequests];
      }

      setPayments(merged);
    } catch (err) {
      console.error('Failed to load payments:', err);
      setPayments([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  const filteredPayments = payments.filter(payment => {
    const matchesSearch = payment.payee.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = activeCategoryFilter === 'all' || payment.category.toLowerCase() === activeCategoryFilter.toLowerCase();

    return matchesSearch && matchesCategory;
  });

  const handleRecordSubmit = async (e) => {
    e.preventDefault();
    if (!recordData.payee || !recordData.amount || !recordData.dueDate) {
      toast.error('Please fill in Payee Name, Amount and Due Date');
      return;
    }

    const loader = toast.loading(isEditing ? 'Updating payment request...' : 'Submitting payment request to database...');
    try {
      if (isEditing) {
        if (recordData.isExpense) {
          if (editingPaymentId && !String(editingPaymentId).startsWith('#')) {
            await updateFinanceExpense(editingPaymentId, {
              category: recordData.category,
              vendor: recordData.payee,
              amount: parseFloat(recordData.amount),
              status: 'Pending',
              date: recordData.dueDate,
              notes: recordData.notes
            });
            toast.success('Expense updated in database successfully!', { id: loader });
          } else {
            // Mock expense update
            setPayments(prevPayments => prevPayments.map(p => {
              if (p.id === editingPaymentId) {
                return {
                  ...p,
                  payee: recordData.payee,
                  category: recordData.category,
                  amount: formatINR(parseFloat(recordData.amount)),
                  dueDate: new Date(recordData.dueDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
                  notes: recordData.notes,
                  rawAmount: recordData.amount,
                  rawDueDate: recordData.dueDate
                };
              }
              return p;
            }));
            toast.success('Mock expense updated successfully!', { id: loader });
          }
        } else {
          if (editingPaymentId && !String(editingPaymentId).startsWith('#')) {
            const isClientSide = !recordData.paymentSource || recordData.paymentSource === 'Client Side';
            const categoryVal = isClientSide ? 'Client Outstanding' : (recordData.category === 'Other' ? customCategory : recordData.category);

            let payload;
            if (recordData.billFile) {
              payload = new FormData();
              payload.append('payee', recordData.payee);
              payload.append('category', categoryVal);
              payload.append('amount', recordData.amount);
              payload.append('dueDate', recordData.dueDate);
              payload.append('priority', recordData.priority);
              payload.append('bankDetails', recordData.bankDetails || '');
              payload.append('notes', recordData.notes || '');
              payload.append('paymentSource', recordData.paymentSource || 'Client Side');
              if (recordData.clientId) payload.append('clientId', recordData.clientId);
              if (isClientSide && recordData.department) payload.append('department', recordData.department);
              payload.append('bill', recordData.billFile);
            } else {
              payload = {
                payee: recordData.payee,
                category: categoryVal,
                amount: parseFloat(recordData.amount),
                dueDate: recordData.dueDate,
                priority: recordData.priority,
                bankDetails: recordData.bankDetails,
                notes: recordData.notes,
                department: isClientSide ? recordData.department : null,
                paymentSource: recordData.paymentSource || 'Client Side',
                clientId: recordData.clientId || null
              };
            }

            await updateFinancePaymentRequest(editingPaymentId, payload);
            toast.success('Payment request updated in database successfully!', { id: loader });
          } else {
            // Mock payment request update
            setPayments(prevPayments => prevPayments.map(p => {
              if (p.id === editingPaymentId) {
                return {
                  ...p,
                  payee: recordData.payee,
                  category: (!recordData.paymentSource || recordData.paymentSource === 'Client Side') ? 'Client Outstanding' : (recordData.category === 'Other' ? customCategory : recordData.category),
                  amount: formatINR(parseFloat(recordData.amount)),
                  dueDate: new Date(recordData.dueDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
                  priority: recordData.priority,
                  bankDetails: recordData.bankDetails,
                  notes: recordData.notes,
                  department: (!recordData.paymentSource || recordData.paymentSource === 'Client Side') ? recordData.department : null,
                  paymentSource: recordData.paymentSource || 'Client Side',
                  clientId: recordData.clientId,
                  rawAmount: recordData.amount,
                  rawDueDate: recordData.dueDate
                };
              }
              return p;
            }));
            toast.success('Mock payment request updated successfully!', { id: loader });
          }
        }
        setCustomCategory('');
        setIsRecordModalOpen(false);
        setIsEditing(false);
        setEditingPaymentId(null);
      } else {
        const isClientSide = !recordData.paymentSource || recordData.paymentSource === 'Client Side';
        const categoryVal = isClientSide ? 'Client Outstanding' : (recordData.category === 'Other' ? customCategory : recordData.category);

        let payload;
        if (recordData.billFile) {
          payload = new FormData();
          payload.append('payee', recordData.payee);
          payload.append('category', categoryVal);
          payload.append('amount', recordData.amount);
          payload.append('dueDate', recordData.dueDate);
          payload.append('priority', recordData.priority);
          payload.append('bankDetails', recordData.bankDetails || '');
          payload.append('notes', recordData.notes || '');
          payload.append('paymentSource', recordData.paymentSource || 'Client Side');
          if (recordData.clientId) payload.append('clientId', recordData.clientId);
          if (isClientSide && recordData.department) payload.append('department', recordData.department);
          payload.append('bill', recordData.billFile);
        } else {
          payload = {
            payee: recordData.payee,
            category: categoryVal,
            amount: parseFloat(recordData.amount),
            dueDate: recordData.dueDate,
            priority: recordData.priority,
            bankDetails: recordData.bankDetails,
            notes: recordData.notes,
            department: isClientSide ? recordData.department : null,
            paymentSource: recordData.paymentSource || 'Client Side',
            clientId: recordData.clientId || null
          };
        }

        await createFinancePaymentRequest(payload);
        toast.success('Payment request saved to database successfully!', { id: loader });
        setCustomCategory('');
        setIsRecordModalOpen(false);
      }

      setRecordData({
        payee: '',
        category: 'Vendor Payment',
        amount: '',
        dueDate: '',
        priority: 'Medium',
        bankDetails: '',
        notes: '',
        department: 'Recruitment',
        paymentSource: 'Client Side',
        clientId: '',
        isExpense: false,
        billFile: null,
        billFileName: '',
        attachmentUrl: null
      });
      fetchPayments();
    } catch (err) {
      toast.error(err.message || 'Failed to save payment request', { id: loader });
    }
  };

  const handleEditPayment = (payment) => {
    let formattedDueDate = '';
    if (payment.rawDueDate) {
      formattedDueDate = payment.rawDueDate.split('T')[0];
    } else {
      try {
        formattedDueDate = new Date(payment.dueDate).toISOString().split('T')[0];
      } catch (e) {
        formattedDueDate = payment.dueDate || '';
      }
    }

    const knownCategories = [
      'Vendor Payment',
      'Employee Reimbursement',
      'Salary / Payroll',
      'Office Expenses',
      'Utilities',
      'Rent',
      'Marketing',
      'Tax',
      'Subscription',
      'Professional Fees',
      'Miscellaneous'
    ];
    const isCustom = payment.category && !knownCategories.includes(payment.category);

    setRecordData({
      payee: payment.payee || '',
      category: isCustom ? 'Other' : (payment.category || 'Vendor Payment'),
      amount: payment.rawAmount || parseFloat(payment.amount.replace(/[^\d.]/g, '')) || '',
      dueDate: formattedDueDate,
      priority: payment.priority || 'Medium',
      bankDetails: payment.bankDetails || '',
      notes: payment.notes || '',
      department: payment.department || 'Recruitment',
      paymentSource: payment.isExpense ? 'Our Side' : (payment.paymentSource || 'Client Side'),
      clientId: payment.clientId || '',
      isExpense: !!payment.isExpense,
      attachmentUrl: payment.attachmentUrl || null,
      billFile: null,
      billFileName: ''
    });
    setCustomCategory(isCustom ? payment.category : '');

    setIsEditing(true);
    setEditingPaymentId(payment.dbId || payment.id);
    setSelectedPaymentDetail(null);
    setIsRecordModalOpen(true);
  };

  const handleCloseRecordModal = () => {
    setIsRecordModalOpen(false);
    setIsEditing(false);
    setEditingPaymentId(null);
    setRecordData({
      payee: '',
      category: 'Vendor Payment',
      amount: '',
      dueDate: '',
      priority: 'Medium',
      bankDetails: '',
      notes: '',
      department: 'Recruitment',
      paymentSource: 'Client Side',
      clientId: '',
      isExpense: false,
      billFile: null,
      billFileName: '',
      attachmentUrl: null
    });
    setCustomCategory('');
  };

  const handleOpenRecordModal = () => {
    setIsEditing(false);
    setEditingPaymentId(null);
    setRecordData({
      payee: '',
      category: 'Vendor Payment',
      amount: '',
      dueDate: '',
      priority: 'Medium',
      bankDetails: '',
      notes: '',
      department: 'Recruitment',
      paymentSource: 'Client Side',
      clientId: '',
      isExpense: false,
      billFile: null,
      billFileName: '',
      attachmentUrl: null
    });
    setCustomCategory('');
    setIsRecordModalOpen(true);
  };

  const handleApprovePayment = (paymentId) => {
    const paymentObj = payments.find(p => p.id === paymentId);
    if (!paymentObj) return;

    setPaymentToConfirm(paymentObj);
    setConfirmPaymentForm({
      paymentMethod: 'Bank Transfer',
      transactionRef: '',
      paymentDate: new Date().toISOString().split('T')[0],
      receiptFile: null,
      receiptFileName: '',
      notes: ''
    });
    setIsConfirmPaymentModalOpen(true);
  };

  const handleConfirmPaymentSubmit = async (e) => {
    e.preventDefault();
    if (!paymentToConfirm) return;

    const loader = toast.loading('Recording payment approval...');
    try {
      const payload = {
        paymentMethod: confirmPaymentForm.paymentMethod,
        transactionRef: confirmPaymentForm.transactionRef,
        paymentDate: confirmPaymentForm.paymentDate,
        receiptFileName: confirmPaymentForm.receiptFileName,
        notes: confirmPaymentForm.notes
      };

      if (paymentToConfirm.dbId) {
        await updateFinanceExpenseStatus(paymentToConfirm.dbId, 'Paid', payload);
      } else {
        // Mocking latency for static/mock entries
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      toast.success('Payment approved and recorded successfully!', { id: loader });
      setIsConfirmPaymentModalOpen(false);

      // Remove approved item from list
      setPayments(prevPayments => prevPayments.filter(p => p.id !== paymentToConfirm.id));
      if (selectedPaymentDetail && selectedPaymentDetail.id === paymentToConfirm.id) {
        setSelectedPaymentDetail(null);
      }
      setPaymentToConfirm(null);
    } catch (err) {
      console.error(err);
      toast.error(err.message || 'Failed to approve payment', { id: loader });
    }
  };

  const handleRejectPayment = async (paymentId) => {
    const loader = toast.loading('Rejecting payment...');
    try {
      // Mocking API call latency
      await new Promise(resolve => setTimeout(resolve, 500));

      setPayments(prevPayments => prevPayments.map(p =>
        p.id === paymentId ? { ...p, status: 'Rejected' } : p
      ));
      if (selectedPaymentDetail && selectedPaymentDetail.id === paymentId) {
        setSelectedPaymentDetail({ ...selectedPaymentDetail, status: 'Rejected' });
      }
      toast.success('Payment rejected successfully!', { id: loader });
    } catch (err) {
      toast.error('Failed to reject payment', { id: loader });
    }
  };

  const handleSendReminder = async (payment) => {
    const isMock = !payment.dbId || String(payment.id).startsWith('#PAY-2026-2') || String(payment.id).startsWith('#PAY-2026-5');
    const loader = toast.loading('Sending payment reminder...');
    try {
      if (isMock) {
        await new Promise(resolve => setTimeout(resolve, 500));
        toast.success('Reminder sent successfully! (Mock)', { id: loader });
        return;
      }

      let senderId = localStorage.getItem('userId');
      let senderType = localStorage.getItem('userType');

      if (!senderId) {
        try {
          const token = localStorage.getItem('token');
          if (token) {
            const decoded = JSON.parse(atob(token.split('.')[1]));
            senderId = decoded.id || decoded.userId;
            senderType = decoded.role || decoded.userType;
          }
        } catch (e) {
          console.error(e);
        }
      }

      await sendFinancePaymentReminder(payment.dbId, {
        senderId: senderId || '00000000-0000-0000-0000-000000000000',
        senderType: senderType || 'Admin'
      });

      toast.success('Payment reminder sent to client successfully!', { id: loader });
    } catch (err) {
      console.error(err);
      toast.error(err.message || 'Failed to send payment reminder', { id: loader });
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500" style={{ fontFamily: "'Calibri', sans-serif" }}>
      {/* Header Section */}
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4 text-left">
        <div className="text-left">
          <h1 className="text-3xl font-bold text-[#1A1A2E] tracking-tight font-syne">Pending Payments</h1>
        </div>
        <div className="flex items-center gap-3">
          {notificationBell}
          {!readOnly && (
            <button
              onClick={handleOpenRecordModal}
              className="px-6 py-3 rounded-2xl bg-[#1B4DA0] text-white text-xs font-black uppercase tracking-widest hover:scale-105 transition-all shadow-lg shadow-blue-500/20 flex items-center gap-2"
            >
              <FiPlus size={16} /> New Payment Request
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
            placeholder="Search by Payee or Payment ID..."
            className="w-full bg-[#F4F3EF] border-none rounded-2xl py-3 pl-14 pr-5 text-sm font-medium focus:ring-2 focus:ring-[#F4F3EF] outline-none transition-all placeholder:text-[#9B9BAD]"
          />
        </div>

        <div className="relative">
          <select
            value={activeCategoryFilter}
            onChange={(e) => setActiveCategoryFilter(e.target.value)}
            className="bg-[#F4F3EF] text-xs font-bold uppercase tracking-wider text-[#1A1A2E] rounded-xl pl-4 pr-10 py-2.5 outline-none border-0 cursor-pointer appearance-none min-w-[140px]"
          >
            <option value="all">All Categories</option>
            <option value="vendor payment">Vendor Payment</option>
            <option value="employee reimbursement">Employee Reimbursement</option>
            <option value="salary / payroll">Salary / Payroll</option>
            <option value="office expenses">Office Expenses</option>
            <option value="utilities">Utilities</option>
            <option value="rent">Rent</option>
            <option value="marketing">Marketing</option>
            <option value="tax">Tax</option>
            <option value="subscription">Subscription</option>
            <option value="professional fees">Professional Fees</option>
            <option value="miscellaneous">Miscellaneous</option>
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
                <th className="px-8 py-4 text-[11px] font-bold text-[#94a3b8] uppercase tracking-widest text-left w-[15%]">Payment ID</th>
                <th className="px-8 py-4 text-[11px] font-bold text-[#94a3b8] uppercase tracking-widest text-left w-[25%]">Payee</th>
                <th className="px-8 py-4 text-[11px] font-bold text-[#94a3b8] uppercase tracking-widest text-left w-[18%]">Category</th>
                <th className="px-8 py-4 text-[11px] font-bold text-[#94a3b8] uppercase tracking-widest text-right w-[12%]">Amount</th>
                <th className="px-8 py-4 text-[11px] font-bold text-[#94a3b8] uppercase tracking-widest text-center w-[12%]">Due Date</th>
                <th className="px-8 py-4 text-[11px] font-bold text-[#94a3b8] uppercase tracking-widest text-center w-[10%]">Priority</th>
                <th className="px-8 py-4 text-[11px] font-bold text-[#94a3b8] uppercase tracking-widest text-center w-[10%]">Status</th>
                <th className="px-8 py-4 w-[3%]"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F4F3EF]">
              {filteredPayments.length === 0 ? (
                <tr>
                  <td colSpan="8" className="py-24 text-center">
                    <p className="text-[#9B9BAD] text-sm font-bold uppercase tracking-widest">No pending payments found</p>
                  </td>
                </tr>
              ) : (
                filteredPayments.map((item) => (
                  <tr
                    key={item.id}
                    onClick={() => setSelectedPaymentDetail(item)}
                    className="hover:bg-[#F8FAFF] transition-all group cursor-pointer"
                  >
                    <td className="px-8 py-4 text-left w-[15%]">
                      <span className="text-[13px] font-black text-[#1A1A2E]">{item.id}</span>
                    </td>
                    <td className="px-8 py-4 text-left w-[25%]">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-black text-xs">
                          {item.payee.substring(0, 2).toUpperCase()}
                        </div>
                        <span className="text-[14px] font-bold text-[#1A1A2E]">
                          {item.payee}{item.paymentSource === 'Our Side' ? ' (Our Side)' : ''}
                        </span>
                      </div>
                    </td>
                    <td className="px-8 py-4 text-left w-[18%]">
                      <span className="px-3 py-1 rounded-xl bg-gray-50 text-gray-600 text-[10px] font-black uppercase tracking-widest">
                        {item.category}
                      </span>
                    </td>
                    <td className="px-8 py-4 text-right w-[12%]">
                      <span className="text-[14px] font-black text-[#1A1A2E]">{item.amount}</span>
                    </td>
                    <td className="px-8 py-4 text-center w-[12%]">
                      <span className="text-[13px] font-bold text-[#1A1A2E]">{item.dueDate}</span>
                    </td>
                    <td className="px-8 py-4 text-center w-[10%]">
                      <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest
                        ${item.priority === 'High' ? 'bg-red-50 text-red-600' :
                          item.priority === 'Medium' ? 'bg-amber-50 text-amber-600' :
                            'bg-emerald-50 text-emerald-600'}`}
                      >
                        {item.priority}
                      </span>
                    </td>
                    <td className="px-8 py-4 text-center w-[10%]">
                      <span className={`inline-block px-4 py-2 rounded-xl text-[11px] font-black uppercase tracking-widest
                        ${item.status === 'Approved' ? 'bg-emerald-50 text-emerald-600' :
                          item.status === 'Processing' ? 'bg-blue-50 text-blue-600' :
                            'bg-amber-50 text-amber-600'}`}
                      >
                        {item.status}
                      </span>
                    </td>
                    <td className="px-8 py-4 text-right w-[3%]">
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
          {selectedPaymentDetail && (
            <React.Fragment>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-[#1A1A2E]/40 backdrop-blur-md z-[200000]"
                onClick={() => setSelectedPaymentDetail(null)}
              />

              <motion.div
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: "spring", damping: 30, stiffness: 200 }}
                className="fixed inset-y-0 right-0 w-full max-w-[698px] bg-[#F8FAFC] shadow-2xl border-l border-[#F4F3EF] flex flex-col z-[200001] overflow-hidden text-left"
                style={{ fontFamily: "'Calibri', sans-serif" }}
              >
                <div className="flex-none p-8 bg-white border-b border-[#E2E8F0]">
                  <div className="flex items-start justify-between">
                    <div>
                      <h2 className="text-3xl font-bold text-[#0F172A] font-syne mb-2">Payment Detail</h2>
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-bold text-[#64748B]">{selectedPaymentDetail.id}</span>
                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest
                        ${selectedPaymentDetail.status === 'Approved' ? 'bg-emerald-50 text-emerald-600' :
                            selectedPaymentDetail.status === 'Processing' ? 'bg-blue-50 text-blue-600' :
                              'bg-amber-50 text-amber-600'}`}
                        >
                          {selectedPaymentDetail.status}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {!readOnly && (
                        <button
                          onClick={() => handleEditPayment(selectedPaymentDetail)}
                          className="w-10 h-10 rounded-xl bg-[#F1F5F9] text-[#64748B] flex items-center justify-center hover:bg-[#E2E8F0] hover:text-[#0F172A] transition-all"
                          title="Edit Payment"
                        >
                          <FiEdit2 size={18} />
                        </button>
                      )}
                      <button
                        onClick={() => setSelectedPaymentDetail(null)}
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
                      <p className="text-[10px] font-black text-[#94A3B8] uppercase tracking-widest mb-1">Payee Info</p>
                      <p className="text-[16px] font-bold text-[#0F172A]">{selectedPaymentDetail.payee}</p>
                      {selectedPaymentDetail.clientId && (() => {
                        const linkedClient = clients.find(c => c.clientId === selectedPaymentDetail.clientId);
                        if (linkedClient) {
                          return (
                            <p className="text-xs font-bold text-[#1B4DA0] mt-1 bg-blue-50/50 px-2 py-1 rounded-lg border border-blue-100 inline-block">
                              Client: {linkedClient.companyName}
                            </p>
                          );
                        }
                        return null;
                      })()}
                      <p className="text-[13px] font-medium text-[#64748B] mt-2 flex items-center gap-2"><FiMail size={14} /> {selectedPaymentDetail.contactEmail}</p>
                      <p className="text-[13px] font-bold text-[#1B4DA0] mt-3">Bank Details:</p>
                      <p className="text-[13px] font-medium text-[#64748B]">{selectedPaymentDetail.bankDetails}</p>
                    </div>
                    <div className="bg-white p-6 rounded-[24px] border border-[#E2E8F0] shadow-sm">
                      <p className="text-[10px] font-black text-[#94A3B8] uppercase tracking-widest mb-1">Payment Status</p>
                      <p className="text-[14px] font-bold text-[#0F172A] mt-2">Amount: <span className="font-black text-[#1A1A2E]">{selectedPaymentDetail.amount}</span></p>
                      <p className="text-[14px] font-bold text-[#0F172A] mt-1">Due Date: <span className="font-medium text-[#64748B]">{selectedPaymentDetail.dueDate}</span></p>
                      <p className="text-[14px] font-bold text-[#0F172A] mt-1 flex items-center gap-2">Priority:
                        <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest ${selectedPaymentDetail.priority === 'High' ? 'bg-red-50 text-red-600' : selectedPaymentDetail.priority === 'Medium' ? 'bg-amber-50 text-amber-600' : 'bg-emerald-50 text-emerald-600'}`}>
                          {selectedPaymentDetail.priority}
                        </span>
                      </p>
                    </div>
                  </div>

                  <div className="bg-white rounded-[24px] border border-[#E2E8F0] shadow-sm overflow-hidden p-6">
                    <h3 className="text-[14px] font-bold text-[#0F172A] uppercase tracking-wider mb-4">Payment Notes</h3>
                    <div className="p-4 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0]">
                      <p className="text-sm text-[#475569]">{selectedPaymentDetail.notes || "No notes available."}</p>
                    </div>
                  </div>

                  {selectedPaymentDetail.attachmentUrl && (
                    <div className="bg-white p-6 rounded-[24px] border border-[#E2E8F0] shadow-sm overflow-hidden mt-4 flex items-center justify-between">
                      <div>
                        <p className="text-[10px] font-black text-[#94A3B8] uppercase tracking-widest">Attached Bill / Document</p>
                        <p className="text-[12px] font-medium text-slate-500 mt-1">Invoice or receipt associated with this request</p>
                      </div>
                      <a
                        href={selectedPaymentDetail.attachmentUrl.startsWith('http') ? selectedPaymentDetail.attachmentUrl : `${BASE_URL}${selectedPaymentDetail.attachmentUrl}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-md shadow-indigo-500/20 flex items-center gap-2"
                      >
                        <FiFileText size={14} /> View Document
                      </a>
                    </div>
                  )}

                  {selectedPaymentDetail.status?.toLowerCase() === 'pending' && selectedPaymentDetail.clientId && (
                    <div className="bg-white p-6 rounded-[24px] border border-[#E2E8F0] shadow-sm overflow-hidden mt-4 flex items-center justify-between">
                      <div>
                        <p className="text-[10px] font-black text-[#94A3B8] uppercase tracking-widest">Client Reminder</p>
                        <p className="text-[12px] font-medium text-slate-500 mt-1">Notify client about this pending payment request</p>
                      </div>
                      <button
                        onClick={() => handleSendReminder(selectedPaymentDetail)}
                        className="px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-md shadow-amber-500/20 flex items-center gap-2"
                      >
                        <FiBell size={14} /> Send Reminder
                      </button>
                    </div>
                  )}
                </div>
              </motion.div>
            </React.Fragment>
          )}
        </AnimatePresence>,
        document.body
      )}

      {/* Record Payment Form Modal */}
      {createPortal(
        <AnimatePresence>
          {isRecordModalOpen && (
            <React.Fragment>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-[#1A1A2E]/40 backdrop-blur-md z-[200000]"
                onClick={handleCloseRecordModal}
              />
              <div className="fixed inset-0 flex items-center justify-center z-[200001] p-4 pointer-events-none">
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 20 }}
                  className="w-full max-w-[600px] bg-white rounded-[32px] shadow-2xl flex flex-col overflow-hidden border border-[#F4F3EF] pointer-events-auto max-h-[85vh]"
                >
                  <div className="p-8 border-b border-[#F4F3EF] flex justify-between items-center bg-gradient-to-r from-blue-50/50 to-white text-left shrink-0">
                    <div>
                      <h2 className="text-2xl font-bold text-[#1A1A2E] font-syne">
                        {isEditing ? (recordData.isExpense ? 'Edit Expense' : 'Edit Payment Request') : 'New Payment Request'}
                      </h2>
                      <p className="text-xs font-bold text-[#1B4DA0] uppercase tracking-widest mt-1">
                        {isEditing ? 'Update details' : ''}
                      </p>
                    </div>
                    <button type="button" onClick={handleCloseRecordModal} className="w-10 h-10 bg-white border border-[#E2E8F0] rounded-xl flex items-center justify-center text-[#94A3B8] hover:text-red-500 hover:bg-red-50 transition-all shadow-sm shrink-0">
                      <FiX size={20} />
                    </button>
                  </div>

                  <form onSubmit={handleRecordSubmit} className="p-8 space-y-6 text-left flex-1 overflow-y-auto" style={{ scrollbarWidth: 'thin' }}>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-[#9B9BAD] uppercase tracking-[2px]">Payment Source</label>
                      <select
                        value={recordData.paymentSource || 'Client Side'}
                        onChange={(e) => {
                          const val = e.target.value;
                          setRecordData({
                            ...recordData,
                            paymentSource: val,
                            clientId: val === 'Our Side' ? '' : recordData.clientId,
                            category: val === 'Our Side' ? 'Vendor Payment' : recordData.category,
                            payee: val === 'Our Side' ? '' : recordData.payee
                          });
                        }}
                        className="w-full px-4 py-3 bg-[#FAFAF8] border border-[#F4F3EF] rounded-xl text-sm font-bold text-[#1A1A2E] focus:outline-none focus:border-[#1B4DA0] transition-all"
                      >
                        <option value="Client Side">Client Side</option>
                        <option value="Our Side">Our Side</option>
                      </select>
                    </div>

                    {(!recordData.paymentSource || recordData.paymentSource === 'Client Side') && (
                      <div className="grid grid-cols-2 gap-4">
                        <div className={recordData.clientId ? "col-span-1" : "col-span-2"}>
                          <label className="text-[10px] font-bold text-[#9B9BAD] uppercase tracking-[2px]">Client (Optional)</label>
                          <select
                            value={recordData.clientId || ''}
                            onChange={(e) => {
                              const val = e.target.value;
                              const selectedClient = clients.find(c => c.clientId === val);

                              let autoDept = recordData.department;
                              if (selectedClient && selectedClient.agreementType) {
                                const type = selectedClient.agreementType;
                                if (type.includes('Recruitment') && type.includes('Operations')) {
                                  autoDept = 'Recruitment + Operations';
                                } else if (type.includes('Recruitment')) {
                                  autoDept = 'Recruitment';
                                } else if (type.includes('Operations')) {
                                  autoDept = 'Operations';
                                }
                              }

                              setRecordData({
                                ...recordData,
                                clientId: val,
                                payee: selectedClient ? selectedClient.companyName : '',
                                department: autoDept
                              });
                            }}
                            className="w-full px-4 py-3 bg-[#FAFAF8] border border-[#F4F3EF] rounded-xl text-sm font-bold text-[#1A1A2E] focus:outline-none focus:border-[#1B4DA0] transition-all"
                          >
                            <option value="">Select Client (None)</option>
                            {clients.map(client => (
                              <option key={client.clientId} value={client.clientId}>
                                {client.companyName}
                              </option>
                            ))}
                          </select>
                        </div>
                        {recordData.clientId && (
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-[#9B9BAD] uppercase tracking-[2px]">Department</label>
                            <select
                              value={recordData.department}
                              onChange={(e) => setRecordData({ ...recordData, department: e.target.value })}
                              className="w-full px-4 py-3 bg-[#FAFAF8] border border-[#F4F3EF] rounded-xl text-sm font-bold text-[#1A1A2E] focus:outline-none focus:border-[#1B4DA0] transition-all"
                            >
                              <option value="Recruitment">Recruitment</option>
                              <option value="Operations">Operations</option>
                              <option value="Recruitment + Operations">Recruitment + Operations</option>
                            </select>
                          </div>
                        )}
                      </div>
                    )}

                    {(!recordData.paymentSource || recordData.paymentSource === 'Client Side') && recordData.clientId && (() => {
                      const selectedClient = clients.find(c => c.clientId === recordData.clientId);
                      if (!selectedClient) return null;
                      const outstanding = parseFloat(selectedClient.totalOutstanding || 0);
                      return (
                        <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 flex items-center justify-between">
                          <div>
                            <p className="text-[10px] font-black text-amber-800 uppercase tracking-widest">Pending Payment / Outstanding</p>
                            <p className="text-lg font-black text-amber-950 mt-1">{formatINR(outstanding)}</p>
                          </div>
                          {outstanding > 0 && (
                            <button
                              type="button"
                              onClick={() => setRecordData({ ...recordData, amount: outstanding.toString() })}
                              className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold transition-all"
                            >
                              Auto-Fill Amount
                            </button>
                          )}
                        </div>
                      );
                    })()}

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-[#9B9BAD] uppercase tracking-[2px]">Payee Name</label>
                      <input
                        type="text"
                        required
                        value={recordData.payee}
                        onChange={(e) => setRecordData({ ...recordData, payee: e.target.value })}
                        className="w-full px-4 py-3 bg-[#FAFAF8] border border-[#F4F3EF] rounded-xl text-sm font-bold text-[#1A1A2E] focus:outline-none focus:border-[#1B4DA0] focus:ring-1 focus:ring-[#1B4DA0] transition-all"
                        placeholder="e.g. Mabicons Vendor"
                      />
                    </div>

                    {!recordData.paymentSource || recordData.paymentSource === 'Client Side' ? (
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-[#9B9BAD] uppercase tracking-[2px]">Amount (₹)</label>
                        <input
                          type="number"
                          required
                          value={recordData.amount}
                          onChange={(e) => setRecordData({ ...recordData, amount: e.target.value })}
                          className="w-full px-4 py-3 bg-[#FAFAF8] border border-[#F4F3EF] rounded-xl text-sm font-bold text-[#1A1A2E] focus:outline-none focus:border-[#1B4DA0] transition-all"
                          placeholder="0.00"
                        />
                      </div>
                    ) : (
                      <>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-[#9B9BAD] uppercase tracking-[2px]">Category</label>
                            <select
                              value={recordData.category}
                              onChange={(e) => setRecordData({ ...recordData, category: e.target.value })}
                              className="w-full px-4 py-3 bg-[#FAFAF8] border border-[#F4F3EF] rounded-xl text-sm font-bold text-[#1A1A2E] focus:outline-none focus:border-[#1B4DA0] transition-all"
                            >
                              <option value="Vendor Payment">Vendor Payment</option>
                              <option value="Employee Reimbursement">Employee Reimbursement</option>
                              <option value="Salary / Payroll">Salary / Payroll</option>
                              <option value="Office Expenses">Office Expenses</option>
                              <option value="Utilities">Utilities</option>
                              <option value="Rent">Rent</option>
                              <option value="Marketing">Marketing</option>
                              <option value="Tax">Tax</option>
                              <option value="Subscription">Subscription</option>
                              <option value="Professional Fees">Professional Fees</option>
                              <option value="Miscellaneous">Miscellaneous</option>
                              <option value="Other">Other</option>
                            </select>
                          </div>
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-[#9B9BAD] uppercase tracking-[2px]">Amount (₹)</label>
                            <input
                              type="number"
                              required
                              value={recordData.amount}
                              onChange={(e) => setRecordData({ ...recordData, amount: e.target.value })}
                              className="w-full px-4 py-3 bg-[#FAFAF8] border border-[#F4F3EF] rounded-xl text-sm font-bold text-[#1A1A2E] focus:outline-none focus:border-[#1B4DA0] transition-all"
                              placeholder="0.00"
                            />
                          </div>
                        </div>

                        {recordData.category === 'Other' && (
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-[#9B9BAD] uppercase tracking-[2px]">Custom Category Name</label>
                            <input
                              type="text"
                              required
                              value={customCategory}
                              onChange={(e) => setCustomCategory(e.target.value)}
                              className="w-full px-4 py-3 bg-[#FAFAF8] border border-[#F4F3EF] rounded-xl text-sm font-bold text-[#1A1A2E] focus:outline-none focus:border-[#1B4DA0] focus:ring-1 focus:ring-[#1B4DA0] transition-all"
                              placeholder="Enter custom category name"
                            />
                          </div>
                        )}
                      </>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-[#9B9BAD] uppercase tracking-[2px]">Due Date</label>
                        <input
                          type="date"
                          required
                          value={recordData.dueDate}
                          onChange={(e) => setRecordData({ ...recordData, dueDate: e.target.value })}
                          className="w-full px-4 py-3 bg-[#FAFAF8] border border-[#F4F3EF] rounded-xl text-sm font-bold text-[#1A1A2E] focus:outline-none focus:border-[#1B4DA0] transition-all"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-[#9B9BAD] uppercase tracking-[2px]">Priority</label>
                        <select
                          value={recordData.priority}
                          onChange={(e) => setRecordData({ ...recordData, priority: e.target.value })}
                          className="w-full px-4 py-3 bg-[#FAFAF8] border border-[#F4F3EF] rounded-xl text-sm font-bold text-[#1A1A2E] focus:outline-none focus:border-[#1B4DA0] transition-all"
                        >
                          <option value="Low">Low</option>
                          <option value="Medium">Medium</option>
                          <option value="High">High</option>
                        </select>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-[#9B9BAD] uppercase tracking-[2px]">Bank Details</label>
                      <input
                        type="text"
                        required
                        value={recordData.bankDetails}
                        onChange={(e) => setRecordData({ ...recordData, bankDetails: e.target.value })}
                        className="w-full px-4 py-3 bg-[#FAFAF8] border border-[#F4F3EF] rounded-xl text-sm font-bold text-[#1A1A2E] focus:outline-none focus:border-[#1B4DA0] transition-all"
                        placeholder="Account Number / UPI / Portal"
                      />
                    </div>

                    {/* Upload Bill field */}
                    {(!recordData.paymentSource || recordData.paymentSource === 'Client Side') && (
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-[#9B9BAD] uppercase tracking-[2px]">Upload Bill / Invoice (Optional)</label>
                        <div className="w-full flex items-center justify-center gap-3 px-4 py-4 bg-[#FAFAF8] border-2 border-dashed border-[#E2E8F0] rounded-2xl cursor-pointer hover:border-[#1B4DA0] hover:bg-blue-50/10 transition-all group relative">
                          <input
                            type="file"
                            accept=".pdf, image/*"
                            className="absolute inset-0 opacity-0 cursor-pointer"
                            onChange={(e) => {
                              if (e.target.files && e.target.files[0]) {
                                const file = e.target.files[0];
                                setRecordData(prev => ({
                                  ...prev,
                                  billFile: file,
                                  billFileName: file.name
                                }));
                                toast.success(`Attached bill: ${file.name}`);
                              }
                            }}
                          />
                          <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#1B4DA0] flex items-center justify-center group-hover:bg-[#1B4DA0] group-hover:text-white transition-all flex-shrink-0">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                            </svg>
                          </div>
                          <div className="text-left overflow-hidden">
                            <p className="text-xs font-bold text-[#1A1A2E] truncate">
                              {recordData.billFileName || (recordData.attachmentUrl ? "Change Uploaded Bill" : "Attach Bill / Invoice")}
                            </p>
                            <p className="text-[10px] text-[#9B9BAD] mt-0.5">
                              {recordData.billFileName ? "Click to change file" : (recordData.attachmentUrl ? `Existing: ${recordData.attachmentUrl.split('/').pop()}` : "PDF, JPEG, or PNG up to 10MB")}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-[#9B9BAD] uppercase tracking-[2px]">Notes (Optional)</label>
                      <textarea
                        value={recordData.notes}
                        onChange={(e) => setRecordData({ ...recordData, notes: e.target.value })}
                        className="w-full px-4 py-3 bg-[#FAFAF8] border border-[#F4F3EF] rounded-xl text-sm font-medium text-[#1A1A2E] focus:outline-none focus:border-[#1B4DA0] transition-all h-16 resize-none"
                        placeholder="Any additional remarks..."
                      />
                    </div>

                    <div className="pt-4 mt-6 border-t border-[#F4F3EF]">
                      <button
                        type="submit"
                        className="w-full py-4 rounded-xl bg-[#1B4DA0] text-white text-xs font-black uppercase tracking-widest hover:bg-[#0D47A1] transition-all shadow-xl shadow-blue-500/20"
                      >
                        {isEditing ? 'Update Request' : 'Submit Request'}
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

      {/* Confirm Payment Modal */}
      {createPortal(
        <AnimatePresence>
          {isConfirmPaymentModalOpen && paymentToConfirm && (
            <React.Fragment>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-[#1A1A2E]/40 backdrop-blur-md z-[210000]"
                onClick={() => setIsConfirmPaymentModalOpen(false)}
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
                      <p className="text-xs text-[#9B9BAD] font-bold mt-1 uppercase tracking-widest text-left">Enter payment details for auditing</p>
                    </div>
                    <button
                      onClick={() => setIsConfirmPaymentModalOpen(false)}
                      className="w-10 h-10 rounded-xl bg-white text-[#9B9BAD] hover:text-red-500 flex items-center justify-center shadow-sm border border-[#F4F3EF]"
                    >
                      <FiX size={20} />
                    </button>
                  </div>

                  <form onSubmit={handleConfirmPaymentSubmit} className="flex-1 overflow-y-auto p-8 space-y-6 text-left">
                    <div className="bg-[#F8FAFC] p-4 rounded-2xl border border-[#E2E8F0] grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-[10px] font-black text-[#94A3B8] uppercase tracking-widest mb-0.5">Payee / Vendor</p>
                        <p className="text-sm font-bold text-[#1A1A2E]">{paymentToConfirm.payee}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-[#94A3B8] uppercase tracking-widest mb-0.5">Amount Due</p>
                        <p className="text-sm font-black text-red-500">{paymentToConfirm.amount}</p>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-black text-[#1A1A2E] uppercase tracking-widest mb-2">Payment Method</label>
                      <select
                        value={confirmPaymentForm.paymentMethod}
                        onChange={(e) => setConfirmPaymentForm(prev => ({ ...prev, paymentMethod: e.target.value }))}
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
                        value={confirmPaymentForm.transactionRef}
                        onChange={(e) => setConfirmPaymentForm(prev => ({ ...prev, transactionRef: e.target.value }))}
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
                          value={confirmPaymentForm.paymentDate}
                          onChange={(e) => setConfirmPaymentForm(prev => ({ ...prev, paymentDate: e.target.value }))}
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
                          onChange={(e) => {
                            if (e.target.files && e.target.files[0]) {
                              const file = e.target.files[0];
                              setConfirmPaymentForm(prev => ({
                                ...prev,
                                receiptFile: file,
                                receiptFileName: file.name
                              }));
                              toast.success(`Attached ${file.name}`);
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
                            {confirmPaymentForm.receiptFileName || "Add Receipt File"}
                          </p>
                          <p className="text-[10px] text-[#9B9BAD] mt-0.5">
                            {confirmPaymentForm.receiptFileName ? "Click to change file" : "Drag & drop or click to browse"}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-black text-[#1A1A2E] uppercase tracking-widest mb-2">Notes</label>
                      <textarea
                        value={confirmPaymentForm.notes}
                        onChange={(e) => setConfirmPaymentForm(prev => ({ ...prev, notes: e.target.value }))}
                        className="w-full bg-[#F8FAFC] border border-[#F4F3EF] rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#1B4DA0]/20 outline-none transition-all h-20 resize-none"
                        placeholder="Add payment notes..."
                      ></textarea>
                    </div>

                    <div className="pt-4 flex gap-4">
                      <button
                        type="submit"
                        className="flex-1 py-4 rounded-2xl bg-emerald-600 text-white text-xs font-black uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-lg shadow-green-500/20 font-bold animate-pulse"
                      >
                        Confirm Payment
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsConfirmPaymentModalOpen(false)}
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

export default AccountsPendingPaymentsTab;
