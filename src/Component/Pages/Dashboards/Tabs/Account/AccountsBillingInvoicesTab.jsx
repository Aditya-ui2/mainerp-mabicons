import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { getFinanceInvoices, createFinanceInvoice, getAllClients } from '../../../service/api';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSearch, FiChevronDown, FiCreditCard, FiTrendingUp, FiUsers, FiClipboard, FiFileText, FiCheck, FiX, FiChevronRight, FiDownload, FiMail, FiPrinter, FiPlus, FiUpload } from 'react-icons/fi';
import { FaRupeeSign } from 'react-icons/fa';



const formatINR = (num) => {
  if (!num && num !== 0) return '₹0';
  return '₹' + Number(num).toLocaleString('en-IN');
};

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

const mapInvoiceToRow = (invoice, idx) => {
  const depts = ['Recruitment', 'Operations', 'CRM'];
  let dept = depts[idx % depts.length];
  let reference = '';
  let date = invoice.createdAt ? new Date(invoice.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : 'N/A';
  
  if (invoice.notes && invoice.notes.includes('Department:')) {
    const parts = invoice.notes.split(' | ');
    parts.forEach(p => {
      if (p.startsWith('Department:')) {
        dept = p.replace('Department:', '').trim();
      } else if (p.startsWith('Ref:')) {
        reference = p.replace('Ref:', '').trim();
      } else if (p.startsWith('Date:')) {
        date = p.replace('Date:', '').trim();
      }
    });
  }

  const amt = parseFloat(invoice.amount || 0);
  const tax = parseFloat(invoice.taxAmount || 0);
  const total = parseFloat(invoice.totalAmount || 0);

  return {
    id: invoice.invoiceNumber || invoice.id,
    dbId: invoice.id,
    client: invoice.Client?.companyName || invoice.companyName || 'Unknown Client',
    dept,
    amount: formatINR(amt),
    gst: `18% (${formatINR(tax)})`,
    total: formatINR(total),
    status: invoice.status || 'Pending',
    date,
    dueDate: invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : 'N/A',
    contactEmail: invoice.Client?.email || `accounts@${(invoice.companyName || 'company').toLowerCase().replace(/\s+/g, '')}.com`,
    spoc: invoice.Client?.spocName || 'N/A',
    _clientId: invoice.clientId,
    invoiceFileName: invoice.invoiceFileName,
    invoiceFileData: invoice.invoiceFileData,
    notes: invoice.notes
  };
};

const AccountsBillingInvoicesTab = ({ notificationBell, readOnly, onDataChange }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeDeptFilter, setActiveDeptFilter] = useState('all');
  const [activeStatusFilter, setActiveStatusFilter] = useState('all');
  const [selectedIds, setSelectedIds] = useState([]);
  const [selectedInvoiceDetail, setSelectedInvoiceDetail] = useState(null);
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [clientsList, setClientsList] = useState([]);
  
  // Modal state
  const [isAddBillingOpen, setIsAddBillingOpen] = useState(false);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [billingForm, setBillingForm] = useState({
    clientId: '',
    client: '',
    department: 'Recruitment',
    amount: '',
    date: '',
    dueDate: '',
    reference: '',
    document: null,
    invoiceFileName: '',
    invoiceFileData: ''
  });

  const handleDownloadInvoice = (invoice) => {
    if (!invoice) return;
    if (invoice.invoiceFileData) {
      try {
        const parts = invoice.invoiceFileData.split(';base64,');
        const contentType = parts[0].split(':')[1];
        const blob = base64ToBlob(invoice.invoiceFileData, contentType);
        const blobUrl = URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.href = blobUrl;
        link.download = invoice.invoiceFileName || `Invoice_${invoice.id}`;
        link.click();
        
        setTimeout(() => URL.revokeObjectURL(blobUrl), 100);
        toast.success(`Downloaded attached file: ${invoice.invoiceFileName}`);
        return;
      } catch (err) {
        console.error('Blob download failed, trying direct link:', err);
        const link = document.createElement('a');
        link.href = invoice.invoiceFileData;
        link.download = invoice.invoiceFileName || `Invoice_${invoice.id}`;
        link.click();
        toast.success(`Downloaded attached file: ${invoice.invoiceFileName}`);
        return;
      }
    }

    // Fallback: Generate a text invoice receipt
    const textContent = `MABICONS ERP - BILLING INVOICE
=================================
Invoice ID: ${invoice.id}
Client: ${invoice.client}
Contact Email: ${invoice.contactEmail}
Department: ${invoice.dept}
Amount: ${invoice.amount}
GST: ${invoice.gst}
Total Amount: ${invoice.total}
Date: ${invoice.date}
Due Date: ${invoice.dueDate}
Status: ${invoice.status}
`;
    const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `Invoice_Receipt_${invoice.id}.txt`;
    link.click();
    toast.success('Invoice receipt text file downloaded successfully!');
  };

  const fetchInvoices = async () => {
    setLoading(true);
    try {
      const [financeRes, clientsRes] = await Promise.allSettled([
        getFinanceInvoices(),
        getAllClients()
      ]);
      let clients = [];
      if (clientsRes.status === 'fulfilled') {
        const cData = clientsRes.value;
        clients = cData?.data?.clients || cData?.clients || (Array.isArray(cData?.data) ? cData.data : null) || (Array.isArray(cData) ? cData : []);
        setClientsList(clients);
      }
      let invoiceData = [];
      if (financeRes.status === 'fulfilled' && financeRes.value?.data) {
        invoiceData = Array.isArray(financeRes.value.data) ? financeRes.value.data : [];
      }
      if (clientsRes.status !== 'fulfilled' || !clients.length) {
        const uniqueClients = [];
        const seen = new Set();
        invoiceData.forEach(inv => {
          if (inv.clientId && !seen.has(inv.clientId)) {
            seen.add(inv.clientId);
            uniqueClients.push({
              id: inv.clientId,
              companyName: inv.companyName || 'Unknown Client',
              name: inv.companyName || 'Unknown Client'
            });
          }
        });
        clients = uniqueClients.length > 0 ? uniqueClients : [
          { id: 'reliance', companyName: 'Reliance', name: 'Reliance' },
          { id: 'tcs', companyName: 'TCS', name: 'TCS' },
          { id: 'wipro', companyName: 'Wipro', name: 'Wipro' },
          { id: 'infosys', companyName: 'Infosys', name: 'Infosys' },
          { id: 'hcl', companyName: 'HCL', name: 'HCL' }
        ];
        setClientsList(clients);
      }
      if (invoiceData.length > 0) {
        setInvoices(invoiceData.map(mapInvoiceToRow));
      } else {
        setInvoices([]);
      }
    } catch (err) {
      console.error('Failed to load invoices:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchInvoices(); }, []);

  const filteredInvoices = invoices.filter(invoice => {
    const matchesSearch = invoice.client.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          invoice.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDept = activeDeptFilter === 'all' || invoice.dept === activeDeptFilter;
    const matchesStatus = activeStatusFilter === 'all' || invoice.status.toLowerCase() === activeStatusFilter.toLowerCase();
    
    return matchesSearch && matchesDept && matchesStatus;
  });

  const handleAddBilling = async (e) => {
    e.preventDefault();
    const selectedClientId = billingForm.clientId;
    if (!selectedClientId) {
      toast.error('Please select a valid client');
      return;
    }
    const loader = toast.loading('Recording billing to database...');
    try {
      const amt = parseFloat(billingForm.amount || 0);
      await createFinanceInvoice({
        clientId: selectedClientId,
        amount: amt,
        dueDate: billingForm.dueDate,
        taxAmount: Math.round(amt * 0.18),
        notes: `Department: ${billingForm.department} | Ref: ${billingForm.reference} | Date: ${billingForm.date}`,
        invoiceFileName: billingForm.invoiceFileName || null,
        invoiceFileData: billingForm.invoiceFileData || null
      });
      toast.success('Billing recorded successfully!', { id: loader });
      setIsAddBillingOpen(false);
      setBillingForm({
        clientId: '', client: '', department: 'Recruitment', amount: '', date: '', dueDate: '', reference: '', document: null, invoiceFileName: '', invoiceFileData: ''
      });
      fetchInvoices();
      if (onDataChange) onDataChange();
    } catch (err) {
      toast.error(err.message || 'Failed to create billing', { id: loader });
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500" style={{ fontFamily: "'Calibri', sans-serif" }}>
      {/* Header Section */}
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4 text-left">
        <div className="text-left">
          <h1 className="text-3xl font-bold text-[#1A1A2E] tracking-tight font-syne">Billing & Invoices</h1>
        </div>
        <div className="flex items-center gap-3">
          {notificationBell}
          {!readOnly && (
            <button
              onClick={() => setIsAddBillingOpen(true)}
              className="px-6 py-3 rounded-2xl bg-[#1B4DA0] text-white text-xs font-black uppercase tracking-widest hover:scale-105 transition-all shadow-lg shadow-blue-500/20"
            >
              + Add Billing
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
            placeholder="Search invoices by client or ID..." 
            className="w-full bg-[#F4F3EF] border-none rounded-2xl py-3 pl-14 pr-5 text-sm font-medium focus:ring-2 focus:ring-[#F4F3EF] outline-none transition-all placeholder:text-[#9B9BAD]"
          />
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
                    <button 
                      onClick={() => handleDownloadInvoice(selectedInvoiceDetail)}
                      className="w-10 h-10 rounded-xl bg-[#F1F5F9] text-[#64748B] flex items-center justify-center hover:bg-[#E2E8F0] hover:text-[#0F172A] transition-all"
                      title="Download Invoice Document"
                    >
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
                      <span className="font-black text-[#0F172A]">{selectedInvoiceDetail.gst.split(' ')[1]?.replace(/[()]/g, '')}</span>
                    </div>
                    <div className="w-full h-px bg-[#E2E8F0] my-4"></div>
                    <div className="flex justify-between items-center text-[18px]">
                      <span className="font-black text-[#0F172A]">Total Amount</span>
                      <span className="font-black text-blue-600">{selectedInvoiceDetail.total}</span>
                    </div>
                  </div>
                </div>

                {selectedInvoiceDetail.invoiceFileName && (
                  <div className="bg-white p-6 rounded-[24px] border border-[#E2E8F0] shadow-sm space-y-3">
                    <p className="text-[10px] font-black text-[#94A3B8] uppercase tracking-widest mb-1">Attached Document</p>
                    <div className="p-3 bg-[#F8FAFC] rounded-xl border border-gray-100 flex items-center justify-between">
                      <div className="flex items-center gap-2 overflow-hidden flex-1">
                        <FiClipboard className="text-blue-500 flex-shrink-0" size={16} />
                        <span className="text-xs font-bold text-[#0F172A] truncate" title={selectedInvoiceDetail.invoiceFileName}>
                          {selectedInvoiceDetail.invoiceFileName}
                        </span>
                      </div>
                      <button
                        onClick={() => handleDownloadInvoice(selectedInvoiceDetail)}
                        className="px-3 py-1 bg-blue-50 text-blue-700 text-[10px] font-black uppercase tracking-wider rounded-lg hover:bg-blue-100 transition-all flex items-center gap-1"
                      >
                        <FiDownload size={12} /> Download
                      </button>
                    </div>

                    {selectedInvoiceDetail.invoiceFileData && (
                      <div className="mt-2 p-2 bg-[#F8FAFC] rounded-2xl border border-gray-100 overflow-hidden shadow-sm flex flex-col items-center justify-center min-h-[150px]">
                        {selectedInvoiceDetail.invoiceFileData.startsWith('data:image/') ? (
                          <img
                            src={selectedInvoiceDetail.invoiceFileData}
                            alt="Invoice Preview"
                            className="max-w-full max-h-[300px] object-contain rounded-xl hover:scale-[1.01] transition-all cursor-zoom-in"
                            onClick={() => {
                              const imgWindow = window.open();
                              imgWindow.document.write(`<img src="${selectedInvoiceDetail.invoiceFileData}" style="max-width:100%;" />`);
                            }}
                          />
                        ) : selectedInvoiceDetail.invoiceFileData.startsWith('data:application/pdf') ? (
                          <iframe
                            src={selectedInvoiceDetail.invoiceFileData}
                            title="Invoice PDF Preview"
                            className="w-full h-[300px] rounded-xl border-none"
                          ></iframe>
                        ) : (
                          <div className="text-center p-4">
                            <p className="text-xs font-bold text-[#64748B]">Document Preview Not Available</p>
                            <p className="text-[10px] text-[#94A3B8] mt-1">Use download button to save and view the file.</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

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

      {/* Receipt Modal */}
      {createPortal(
        <AnimatePresence>
          {isReceiptModalOpen && selectedInvoiceDetail && (
            <React.Fragment>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-[#1A1A2E]/40 backdrop-blur-md z-[300000]"
                onClick={() => setIsReceiptModalOpen(false)}
              />
              <div className="fixed inset-0 z-[300001] flex items-center justify-center p-4 pointer-events-none">
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 20 }}
                  transition={{ type: "spring", damping: 30, stiffness: 300 }}
                  className="w-full max-w-[400px] bg-white rounded-[32px] shadow-2xl border border-[#F4F3EF] flex flex-col overflow-hidden pointer-events-auto text-center p-8 relative"
                  style={{ fontFamily: "'Calibri', sans-serif" }}
                >
                  <button
                    onClick={() => setIsReceiptModalOpen(false)}
                    className="absolute top-6 right-6 w-10 h-10 rounded-xl bg-[#F8FAFC] text-[#94A3B8] flex items-center justify-center hover:bg-red-50 hover:text-red-500 transition-all border border-[#E2E8F0]"
                  >
                    <FiX size={18} />
                  </button>
                  <div className="w-20 h-20 bg-emerald-50 text-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-6 mt-4">
                    <FiCheck size={40} />
                  </div>
                  <h2 className="text-3xl font-bold text-[#1A1A2E] font-syne mb-1">Payment Receipt</h2>
                  <p className="text-xs font-bold text-[#94A3B8] uppercase tracking-widest mb-8">Receipt for {selectedInvoiceDetail.id}</p>
                  
                  <div className="bg-[#F8FAFC] rounded-2xl p-6 text-left space-y-4 border border-[#E2E8F0]">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-[#64748B] font-bold uppercase tracking-widest text-[10px]">Amount Paid</span>
                      <span className="text-[#1A1A2E] font-black text-lg">{selectedInvoiceDetail.total}</span>
                    </div>
                    <div className="w-full h-px bg-[#E2E8F0] my-2"></div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-[#64748B] font-bold uppercase tracking-widest text-[10px]">Date Paid</span>
                      <span className="text-[#1A1A2E] font-bold">{selectedInvoiceDetail.date}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-[#64748B] font-bold uppercase tracking-widest text-[10px]">Payment Method</span>
                      <span className="text-[#1A1A2E] font-bold">Bank Transfer</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-[#64748B] font-bold uppercase tracking-widest text-[10px]">Billed To</span>
                      <span className="text-[#1A1A2E] font-bold truncate max-w-[150px]">{selectedInvoiceDetail.client}</span>
                    </div>
                  </div>
                  
                  <button 
                    onClick={() => {
                      toast.success('Downloading Receipt PDF...');
                    }}
                    className="mt-8 w-full py-4 rounded-xl bg-[#1B4DA0] text-white text-xs font-black uppercase tracking-widest hover:bg-[#0D47A1] transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20"
                  >
                    <FiDownload size={16} /> Download PDF
                  </button>
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
      
      {/* Add Billing Form Drawer */}
      {createPortal(
        <AnimatePresence>
          {isAddBillingOpen && (
            <React.Fragment>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-[#1A1A2E]/40 backdrop-blur-md z-[200000]"
                onClick={() => setIsAddBillingOpen(false)}
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
                      <h2 className="text-2xl font-bold text-[#1A1A2E] font-syne">Add New Billing</h2>
                      <p className="text-xs text-[#9B9BAD] font-bold mt-1 uppercase tracking-widest">Create a new invoice record</p>
                    </div>
                    <button
                      onClick={() => setIsAddBillingOpen(false)}
                      className="w-10 h-10 rounded-xl bg-white text-[#9B9BAD] hover:text-red-500 flex items-center justify-center shadow-sm border border-[#F4F3EF]"
                    >
                      <FiX size={20} />
                    </button>
                  </div>

                  <div className="flex-1 overflow-y-auto p-8 space-y-6 text-left">
                    <div>
                      <label className="block text-[11px] font-black text-[#1A1A2E] uppercase tracking-widest mb-2">Client</label>
                      <div className="relative">
                        <select
                          value={billingForm.clientId}
                          onChange={(e) => {
                            const selected = clientsList.find(c => String(c.id || c._id) === String(e.target.value));
                            let autoDept = 'Recruitment';
                            if (selected) {
                              const agreement = String(selected.agreementType || '').toLowerCase();
                              if (agreement.includes('recruit') && agreement.includes('operat')) {
                                autoDept = 'Recruitment + Operations';
                              } else if (agreement.includes('recruit')) {
                                autoDept = 'Recruitment';
                              } else if (agreement.includes('operat')) {
                                autoDept = 'Operations';
                              } else {
                                const otherDept = String(selected.department || selected.invoiceDept || selected.industry || '').toLowerCase();
                                if (otherDept.includes('recruit') && otherDept.includes('operat')) {
                                  autoDept = 'Recruitment + Operations';
                                } else if (otherDept.includes('recruit')) {
                                  autoDept = 'Recruitment';
                                } else if (otherDept.includes('operat')) {
                                  autoDept = 'Operations';
                                }
                              }
                            }
                            setBillingForm(prev => ({ 
                              ...prev, 
                              clientId: e.target.value,
                              client: selected ? (selected.companyName || selected.name) : '',
                              department: autoDept
                            }));
                          }}
                          className="w-full bg-[#F8FAFC] border border-[#F4F3EF] rounded-xl pl-4 pr-12 py-3 text-sm focus:ring-2 focus:ring-[#1B4DA0]/20 outline-none transition-all appearance-none cursor-pointer"
                        >
                          <option value="">Select Client</option>
                          {clientsList.map(c => (
                            <option key={c.id || c._id} value={c.id || c._id}>{c.companyName || c.name}</option>
                          ))}
                        </select>
                        <FiChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-[#9B9BAD] pointer-events-none" size={18} />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[11px] font-black text-[#1A1A2E] uppercase tracking-widest mb-2">Department</label>
                      <div className="relative">
                        <select
                          value={billingForm.department}
                          onChange={(e) => setBillingForm(prev => ({ ...prev, department: e.target.value }))}
                          className="w-full bg-[#F8FAFC] border border-[#F4F3EF] rounded-xl pl-4 pr-12 py-3 text-sm focus:ring-2 focus:ring-[#1B4DA0]/20 outline-none transition-all appearance-none cursor-pointer"
                        >
                          <option value="Recruitment">Recruitment</option>
                          <option value="Operations">Operations</option>
                          <option value="Recruitment + Operations">Recruitment + Operations</option>
                        </select>
                        <FiChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-[#9B9BAD] pointer-events-none" size={18} />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[11px] font-black text-[#1A1A2E] uppercase tracking-widest mb-2">Amount (₹)</label>
                      <input
                        type="number"
                        value={billingForm.amount}
                        onChange={(e) => setBillingForm(prev => ({ ...prev, amount: e.target.value }))}
                        className="w-full bg-[#F8FAFC] border border-[#F4F3EF] rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#1B4DA0]/20 outline-none transition-all"
                        placeholder="0.00"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[11px] font-black text-[#1A1A2E] uppercase tracking-widest mb-2">Date</label>
                        <input
                          type="date"
                          value={billingForm.date}
                          onChange={(e) => setBillingForm(prev => ({ ...prev, date: e.target.value }))}
                          className="w-full bg-[#F8FAFC] border border-[#F4F3EF] rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#1B4DA0]/20 outline-none transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-black text-[#1A1A2E] uppercase tracking-widest mb-2">Due Date</label>
                        <input
                          type="date"
                          value={billingForm.dueDate}
                          onChange={(e) => setBillingForm(prev => ({ ...prev, dueDate: e.target.value }))}
                          className="w-full bg-[#F8FAFC] border border-[#F4F3EF] rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#1B4DA0]/20 outline-none transition-all"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[11px] font-black text-[#1A1A2E] uppercase tracking-widest mb-2">Reference / Notes</label>
                      <textarea
                        value={billingForm.reference}
                        onChange={(e) => setBillingForm(prev => ({ ...prev, reference: e.target.value }))}
                        className="w-full bg-[#F8FAFC] border border-[#F4F3EF] rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#1B4DA0]/20 outline-none transition-all h-24 resize-none"
                        placeholder="Add any details or reference here..."
                      ></textarea>
                    </div>

                    <div className="space-y-2">
                      <label className="block text-[11px] font-black text-[#1A1A2E] uppercase tracking-widest mb-2">
                        Attach Invoice / Billing File
                      </label>
                      <label className="w-full flex items-center justify-center gap-3 px-4 py-6 bg-[#FAFAF8] border-2 border-dashed border-[#D6D6E7] rounded-2xl cursor-pointer hover:border-[#1B4DA0] hover:bg-blue-50/30 transition-all group">
                        <div className="w-12 h-12 rounded-2xl bg-[#1B4DA0]/10 flex items-center justify-center group-hover:bg-[#1B4DA0] transition-all">
                          <FiUpload className="text-[#1B4DA0] group-hover:text-white text-xl" />
                        </div>
                        <div className="text-left">
                          <p className="text-sm font-bold text-[#1A1A2E]">
                            Upload Document
                          </p>
                          <p className="text-xs text-[#9B9BAD] mt-1">
                            PDF, Image, Excel, or CSV (max 10MB)
                          </p>
                        </div>
                        <input
                          type="file"
                          accept=".pdf, image/*, .csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
                          className="hidden"
                          onChange={async (e) => {
                            if (e.target.files && e.target.files[0]) {
                              const file = e.target.files[0];
                              try {
                                const base64 = await fileToBase64(file);
                                setBillingForm(prev => ({
                                  ...prev,
                                  document: file,
                                  invoiceFileName: file.name,
                                  invoiceFileData: base64
                                }));
                                toast.success(`Attached ${file.name}`);
                              } catch (err) {
                                toast.error('Failed to process file');
                              }
                            }
                          }}
                        />
                      </label>
                      {billingForm.invoiceFileName && (
                        <div className="flex items-center justify-between px-4 py-3 bg-green-50 border border-green-200 rounded-xl mt-2">
                          <p className="text-xs font-bold text-green-700 truncate">
                            {billingForm.invoiceFileName}
                          </p>
                          <FiCheck className="text-green-600" />
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="p-8 bg-[#F8FAFC] border-t border-[#F4F3EF]">
                    <button
                      onClick={handleAddBilling}
                      className="w-full py-4 rounded-2xl bg-[#1B4DA0] text-white text-xs font-black uppercase tracking-widest hover:bg-[#0D47A1] transition-all shadow-lg shadow-blue-500/20"
                    >
                      Save Billing
                    </button>
                  </div>
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

export default AccountsBillingInvoicesTab;
