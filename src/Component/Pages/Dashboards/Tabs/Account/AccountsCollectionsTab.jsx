import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { getFinanceClientAccounts, getAllClients, recordFinancePayment } from '../../../service/api';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSearch, FiChevronDown, FiChevronRight, FiX, FiCheck, FiMail, FiPhone, FiCalendar, FiClock, FiAlertCircle, FiPlus } from 'react-icons/fi';
import { FaRupeeSign } from 'react-icons/fa';

const mockCollections = [
  {
    id: "#INV-2026-003",
    client: "Wipro India",
    dept: "CRM",
    amount: "₹2,59,600",
    status: "Overdue",
    dueDate: "19 May, 2026",
    lastFollowUp: "20 May, 2026",
    contactEmail: "billing@wipro.com",
    contactPhone: "+91 9876543210",
    spoc: "Vikram Singh",
    notes: "Client promised to clear by end of the week."
  },
  {
    id: "#INV-2026-002",
    client: "TCS Consultancy",
    dept: "Operations",
    amount: "₹10,03,000",
    status: "Pending",
    dueDate: "02 Jun, 2026",
    lastFollowUp: "18 May, 2026",
    contactEmail: "finance@tcs.com",
    contactPhone: "+91 9876500000",
    spoc: "Anita Desai",
    notes: "Invoice acknowledged. Processing in their system."
  },
  {
    id: "#INV-2026-008",
    client: "Reliance Retail",
    dept: "Recruitment",
    amount: "₹1,15,000",
    status: "Collected",
    dueDate: "15 May, 2026",
    lastFollowUp: "12 May, 2026",
    contactEmail: "accounts@reliance.com",
    contactPhone: "+91 9123456780",
    spoc: "Neha Sharma",
    notes: "Payment received via NEFT."
  },
  {
    id: "#INV-2026-009",
    client: "HDFC Bank",
    dept: "CRM",
    amount: "₹4,20,000",
    status: "Pending",
    dueDate: "28 May, 2026",
    lastFollowUp: "N/A",
    contactEmail: "vendor.payments@hdfc.com",
    contactPhone: "+91 9988776655",
    spoc: "Rajesh Kumar",
    notes: "Just generated."
  }
];

const formatINR = (num) => {
  if (!num && num !== 0) return '₹0';
  return '₹' + Number(num).toLocaleString('en-IN');
};

const AccountsCollectionsTab = ({ notificationBell }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeStatusFilter, setActiveStatusFilter] = useState('all');
  const [selectedIds, setSelectedIds] = useState([]);
  const [selectedCollectionDetail, setSelectedCollectionDetail] = useState(null);
  const [collections, setCollections] = useState([]);
  const [clientsList, setClientsList] = useState([]);
  const [loading, setLoading] = useState(true);

  // Record Collection Form State
  const [isRecordModalOpen, setIsRecordModalOpen] = useState(false);
  const [recordData, setRecordData] = useState({
    clientId: '',
    invoiceId: '',
    amountReceived: '',
    dateReceived: '',
    paymentMethod: 'Bank Transfer',
    transactionRef: '',
    notes: ''
  });

  const fetchCollections = async () => {
    setLoading(true);
    try {
      const [financeRes, clientsRes] = await Promise.allSettled([
        getFinanceClientAccounts(),
        getAllClients()
      ]);

      let accounts = [];
      let clients = [];
      if (financeRes.status === 'fulfilled' && financeRes.value?.data) {
        accounts = Array.isArray(financeRes.value.data) ? financeRes.value.data : [];
      }
      if (clientsRes.status === 'fulfilled') {
        const cData = clientsRes.value;
        clients = cData?.data?.clients || cData?.clients || (Array.isArray(cData?.data) ? cData.data : null) || (Array.isArray(cData) ? cData : []);
        setClientsList(clients);
      }
      if (clientsRes.status !== 'fulfilled' || !clients.length) {
        const uniqueClients = [];
        const seen = new Set();
        accounts.forEach(acc => {
          if (acc.clientId && !seen.has(acc.clientId)) {
            seen.add(acc.clientId);
            uniqueClients.push({
              id: acc.clientId,
              companyName: acc.companyName || 'Unknown Client',
              name: acc.companyName || 'Unknown Client'
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

      if (accounts.length > 0) {
        const depts = ['Operations', 'Recruitment', 'CRM'];
        const mapped = accounts
          .filter(a => a.status !== 'Cleared')
          .map((acc, idx) => {
            const clientMatch = clients.find(c => c.id === acc.clientId || c._id === acc.clientId);
            return {
              id: acc.lastInvoiceNumber || `#INV-${new Date().getFullYear()}-${String(idx + 1).padStart(3, '0')}`,
              client: acc.companyName || 'Unknown',
              dept: depts[idx % 3],
              amount: formatINR(parseFloat(acc.totalOutstanding || 0)),
              status: acc.status === 'Overdue' ? 'Overdue' : 'Pending',
              dueDate: acc.updatedAt
                ? new Date(new Date(acc.updatedAt).setDate(new Date(acc.updatedAt).getDate() + 15)).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
                : 'N/A',
              lastFollowUp: acc.updatedAt ? new Date(acc.updatedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : 'N/A',
              contactEmail: clientMatch?.spocEmail || `accounts@${(acc.companyName || 'co').toLowerCase().replace(/\s+/g, '')}.com`,
              contactPhone: clientMatch?.contactNumber || 'N/A',
              spoc: clientMatch?.spocName || 'N/A',
              notes: `Outstanding: ${formatINR(parseFloat(acc.totalOutstanding || 0))}. Pending invoices: ${acc.pendingInvoicesCount || 0}.`
            };
          });
        setCollections(mapped.length > 0 ? mapped : buildFromClients(clients));
      } else {
        setCollections(buildFromClients(clients));
      }
    } catch (err) {
      console.error('Error fetching collections:', err);
    } finally {
      setLoading(false);
    }
  };

  const buildFromClients = (clients) =>
    clients.slice(0, 6).map((c, i) => ({
      id: `#INV-${new Date().getFullYear()}-${String(i + 1).padStart(3, '0')}`,
      client: c.companyName || c.name || 'Unknown',
      dept: ['Operations', 'Recruitment', 'CRM'][i % 3],
      amount: '\u20b9N/A',
      status: ['Overdue', 'Pending'][i % 2],
      dueDate: 'N/A', lastFollowUp: 'N/A',
      contactEmail: c.spocEmail || 'N/A',
      contactPhone: c.contactNumber || 'N/A',
      spoc: c.spocName || 'N/A',
      notes: 'No finance record found.'
    }));

  useEffect(() => { fetchCollections(); }, []);

  const filteredCollections = collections.filter(col => {
    const matchesSearch = col.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
      col.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = activeStatusFilter === 'all' || col.status.toLowerCase() === activeStatusFilter.toLowerCase();

    return matchesSearch && matchesStatus;
  });

  const handleRecordSubmit = async (e) => {
    e.preventDefault();
    const { clientId, amountReceived, paymentMethod, transactionRef, notes, invoiceId } = recordData;
    if (!clientId) {
      toast.error('Please select a client');
      return;
    }
    const loader = toast.loading('Recording collection...');
    try {
      await recordFinancePayment(clientId, {
        amountReceived: parseFloat(amountReceived),
        paymentMethod,
        transactionRef,
        notes,
        invoiceId
      });
      toast.success('Collection recorded successfully!', { id: loader });
      setIsRecordModalOpen(false);
      setRecordData({
        clientId: '',
        invoiceId: '',
        amountReceived: '',
        dateReceived: '',
        paymentMethod: 'Bank Transfer',
        transactionRef: '',
        notes: ''
      });
      fetchCollections();
    } catch (err) {
      toast.error(err.message || 'Failed to record collection', { id: loader });
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500" style={{ fontFamily: "'Calibri', sans-serif" }}>
      {/* Header Section */}
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4 text-left">
        <div className="text-left">
          <h1 className="text-3xl font-bold text-[#1A1A2E] tracking-tight font-syne">Collections Management</h1>
        </div>
        <div className="flex items-center gap-3">
          {notificationBell}
          <button
            onClick={() => setIsRecordModalOpen(true)}
            className="px-6 py-3 rounded-2xl bg-[#1B4DA0] text-white text-xs font-black uppercase tracking-widest hover:scale-105 transition-all shadow-lg shadow-blue-500/20 flex items-center gap-2"
          >
            <FiPlus size={16} /> Add Collection
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
            placeholder="Search collections by client or Invoice ID..."
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
            <option value="Collected">Collected</option>
            <option value="Pending">Pending</option>
            <option value="Overdue">Overdue</option>
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
                <th className="px-8 py-4 text-[11px] font-bold text-[#94a3b8] uppercase tracking-widest text-left">Invoice ID</th>
                <th className="px-8 py-4 text-[11px] font-bold text-[#94a3b8] uppercase tracking-widest text-left">Client</th>
                <th className="px-8 py-4 text-[11px] font-bold text-[#94a3b8] uppercase tracking-widest text-left">Amount Due</th>
                <th className="px-8 py-4 text-[11px] font-bold text-[#94a3b8] uppercase tracking-widest text-left">Due Date</th>
                <th className="px-8 py-4 text-[11px] font-bold text-[#94a3b8] uppercase tracking-widest text-left">Last Follow-up</th>
                <th className="px-8 py-4 text-[11px] font-bold text-[#94a3b8] uppercase tracking-widest text-left">Status</th>
                <th className="px-8 py-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F4F3EF]">
              {filteredCollections.length === 0 ? (
                <tr>
                  <td colSpan="8" className="py-24 text-center">
                    <p className="text-[#9B9BAD] text-sm font-bold uppercase tracking-widest">No collections found</p>
                  </td>
                </tr>
              ) : (
                filteredCollections.map((item) => (
                  <tr
                    key={item.id}
                    onClick={() => setSelectedCollectionDetail(item)}
                    className="hover:bg-[#F8FAFF] transition-all group cursor-pointer"
                  >
                    <td className="px-8 py-4 text-left">
                      <span className="text-[13px] font-black text-[#1A1A2E]">{item.id}</span>
                    </td>
                    <td className="px-8 py-4 text-left">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-black text-xs">
                          {item.client.substring(0, 2).toUpperCase()}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[14px] font-bold text-[#1A1A2E]">{item.client}</span>
                          <span className="text-[10px] font-bold text-[#9B9BAD] uppercase tracking-widest">{item.dept}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-4 text-left">
                      <span className="text-[14px] font-black text-[#1A1A2E]">{item.amount}</span>
                    </td>
                    <td className="px-8 py-4 text-left">
                      <span className="text-[13px] font-bold text-[#1A1A2E]">{item.dueDate}</span>
                    </td>
                    <td className="px-8 py-4 text-left">
                      <span className="text-[13px] font-bold text-[#64748B]">{item.lastFollowUp}</span>
                    </td>
                    <td className="px-8 py-4 text-left">
                      <span className={`px-4 py-2 rounded-xl text-[11px] font-black uppercase tracking-widest
                        ${item.status === 'Collected' ? 'bg-emerald-50 text-emerald-600' :
                          item.status === 'Pending' ? 'bg-amber-50 text-amber-600' :
                            item.status === 'Overdue' ? 'bg-red-50 text-red-500' :
                              'bg-gray-100 text-gray-600'}`}
                      >
                        {item.status}
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
          {selectedCollectionDetail && (
            <React.Fragment>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-[#1A1A2E]/40 backdrop-blur-md z-[200000]"
                onClick={() => setSelectedCollectionDetail(null)}
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
                      <h2 className="text-3xl font-bold text-[#0F172A] font-syne mb-2">Collection Detail</h2>
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-bold text-[#64748B]">{selectedCollectionDetail.id}</span>
                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest
                        ${selectedCollectionDetail.status === 'Collected' ? 'bg-emerald-50 text-emerald-600' :
                            selectedCollectionDetail.status === 'Pending' ? 'bg-amber-50 text-amber-600' :
                              selectedCollectionDetail.status === 'Overdue' ? 'bg-red-50 text-red-500' :
                                'bg-gray-100 text-gray-600'}`}
                        >
                          {selectedCollectionDetail.status}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setSelectedCollectionDetail(null)}
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
                      <p className="text-[10px] font-black text-[#94A3B8] uppercase tracking-widest mb-1">Client Contact</p>
                      <p className="text-[16px] font-bold text-[#0F172A]">{selectedCollectionDetail.client}</p>
                      <p className="text-[13px] font-medium text-[#64748B] mt-2 flex items-center gap-2"><FiMail size={14} /> {selectedCollectionDetail.contactEmail}</p>
                      <p className="text-[13px] font-medium text-[#64748B] mt-1 flex items-center gap-2"><FiPhone size={14} /> {selectedCollectionDetail.contactPhone}</p>
                    </div>
                    <div className="bg-white p-6 rounded-[24px] border border-[#E2E8F0] shadow-sm">
                      <p className="text-[10px] font-black text-[#94A3B8] uppercase tracking-widest mb-1">Invoice Status</p>
                      <p className="text-[14px] font-bold text-[#0F172A] mt-2">Amount: <span className="font-black text-red-500">{selectedCollectionDetail.amount}</span></p>
                      <p className="text-[14px] font-bold text-[#0F172A] mt-1">Due Date: <span className="font-medium text-[#64748B]">{selectedCollectionDetail.dueDate}</span></p>
                      <p className="text-[14px] font-bold text-[#0F172A] mt-1">Last Follow-up: <span className="font-medium text-[#64748B]">{selectedCollectionDetail.lastFollowUp}</span></p>
                    </div>
                  </div>

                  <div className="bg-white rounded-[24px] border border-[#E2E8F0] shadow-sm overflow-hidden p-6">
                    <h3 className="text-[14px] font-bold text-[#0F172A] uppercase tracking-wider mb-4">Latest Notes</h3>
                    <div className="p-4 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0]">
                      <p className="text-sm text-[#475569]">{selectedCollectionDetail.notes || "No recent notes available."}</p>
                    </div>
                  </div>

                  {selectedCollectionDetail.status !== 'Collected' && (
                    <div className="bg-amber-50 p-6 rounded-[24px] border border-amber-200">
                      <div className="flex items-center gap-2 mb-2">
                        <FiAlertCircle className="text-amber-600" />
                        <h3 className="text-[14px] font-bold text-amber-800 uppercase tracking-wider">Action Needed</h3>
                      </div>
                      <p className="text-[13px] text-amber-700">Follow up with the client to clear the dues. Record the payment once received.</p>
                      <div className="flex gap-3 mt-4">
                        <button className="px-6 py-3 rounded-xl bg-amber-500 text-white text-xs font-black uppercase tracking-widest hover:bg-amber-600 transition-all flex items-center gap-2">
                          <FiMail /> Send Reminder
                        </button>
                        <button
                          onClick={() => {
                            setRecordData({ ...recordData, invoiceId: selectedCollectionDetail.id });
                            setIsRecordModalOpen(true);
                          }}
                          className="px-6 py-3 rounded-xl bg-white text-amber-600 border border-amber-200 text-xs font-black uppercase tracking-widest hover:bg-amber-100 transition-all"
                        >
                          Mark as Collected
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            </React.Fragment>
          )}
        </AnimatePresence>,
        document.body
      )}

      {/* Record Collection Form Modal */}
      {createPortal(
        <AnimatePresence>
          {isRecordModalOpen && (
            <React.Fragment>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-[#1A1A2E]/40 backdrop-blur-md z-[200000]"
                onClick={() => setIsRecordModalOpen(false)}
              />
              <div className="fixed inset-0 flex items-center justify-center z-[200001] p-4 pointer-events-none">
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 20 }}
                  className="w-full max-w-lg bg-white rounded-[32px] shadow-2xl overflow-hidden border border-[#F4F3EF] pointer-events-auto"
                >
                  <div className="p-8 border-b border-[#F4F3EF] flex justify-between items-center bg-gradient-to-r from-blue-50/50 to-white text-left">
                    <div>
                      <h2 className="text-2xl font-bold text-[#1A1A2E] font-syne">Record Collection</h2>
                      <p className="text-xs font-bold text-[#1B4DA0] uppercase tracking-widest mt-1">Log Received Payment</p>
                    </div>
                    <button onClick={() => setIsRecordModalOpen(false)} className="w-10 h-10 bg-white border border-[#E2E8F0] rounded-xl flex items-center justify-center text-[#94A3B8] hover:text-red-500 hover:bg-red-50 transition-all shadow-sm">
                      <FiX size={20} />
                    </button>
                  </div>

                  <form onSubmit={handleRecordSubmit} className="p-8 space-y-6 text-left">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-[#9B9BAD] uppercase tracking-[2px]">Client Name</label>
                      <select 
                        required 
                        value={recordData.clientId} 
                        onChange={(e) => setRecordData({ ...recordData, clientId: e.target.value })} 
                        className="w-full px-4 py-3 bg-[#FAFAF8] border border-[#F4F3EF] rounded-xl text-sm font-bold text-[#1A1A2E] focus:outline-none focus:border-[#1B4DA0] transition-all"
                      >
                        <option value="">Select Client</option>
                        {clientsList.map(c => (
                          <option key={c.id || c._id} value={c.id || c._id}>{c.companyName || c.name}</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-[#9B9BAD] uppercase tracking-[2px]">Invoice ID (Optional)</label>
                      <input
                        type="text"
                        value={recordData.invoiceId}
                        onChange={(e) => setRecordData({ ...recordData, invoiceId: e.target.value })}
                        className="w-full px-4 py-3 bg-[#FAFAF8] border border-[#F4F3EF] rounded-xl text-sm font-bold text-[#1A1A2E] focus:outline-none focus:border-[#1B4DA0] focus:ring-1 focus:ring-[#1B4DA0] transition-all"
                        placeholder="#INV-..."
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-[#9B9BAD] uppercase tracking-[2px]">Amount Received (₹)</label>
                        <input
                          type="number"
                          required
                          value={recordData.amountReceived}
                          onChange={(e) => setRecordData({ ...recordData, amountReceived: e.target.value })}
                          className="w-full px-4 py-3 bg-[#FAFAF8] border border-[#F4F3EF] rounded-xl text-sm font-bold text-[#1A1A2E] focus:outline-none focus:border-[#1B4DA0] transition-all"
                          placeholder="0.00"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-[#9B9BAD] uppercase tracking-[2px]">Date Received</label>
                        <input
                          type="date"
                          required
                          value={recordData.dateReceived}
                          onChange={(e) => setRecordData({ ...recordData, dateReceived: e.target.value })}
                          className="w-full px-4 py-3 bg-[#FAFAF8] border border-[#F4F3EF] rounded-xl text-sm font-bold text-[#1A1A2E] focus:outline-none focus:border-[#1B4DA0] transition-all"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-[#9B9BAD] uppercase tracking-[2px]">Payment Method</label>
                        <select
                          value={recordData.paymentMethod}
                          onChange={(e) => setRecordData({ ...recordData, paymentMethod: e.target.value })}
                          className="w-full px-4 py-3 bg-[#FAFAF8] border border-[#F4F3EF] rounded-xl text-sm font-bold text-[#1A1A2E] focus:outline-none focus:border-[#1B4DA0] transition-all"
                        >
                          <option value="Bank Transfer">Bank Transfer</option>
                          <option value="Cheque">Cheque</option>
                          <option value="UPI">UPI / Digital</option>
                          <option value="Cash">Cash</option>
                        </select>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-[#9B9BAD] uppercase tracking-[2px]">Transaction Ref No.</label>
                        <input
                          type="text"
                          value={recordData.transactionRef}
                          onChange={(e) => setRecordData({ ...recordData, transactionRef: e.target.value })}
                          className="w-full px-4 py-3 bg-[#FAFAF8] border border-[#F4F3EF] rounded-xl text-sm font-bold text-[#1A1A2E] focus:outline-none focus:border-[#1B4DA0] transition-all"
                          placeholder="e.g. UTR / Chq No."
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-[#9B9BAD] uppercase tracking-[2px]">Notes (Optional)</label>
                      <textarea
                        value={recordData.notes}
                        onChange={(e) => setRecordData({ ...recordData, notes: e.target.value })}
                        className="w-full px-4 py-3 bg-[#FAFAF8] border border-[#F4F3EF] rounded-xl text-sm font-medium text-[#1A1A2E] focus:outline-none focus:border-[#1B4DA0] transition-all h-20 resize-none"
                        placeholder="Any additional remarks..."
                      />
                    </div>

                    <div className="pt-4 mt-6 border-t border-[#F4F3EF]">
                      <button
                        type="submit"
                        className="w-full py-4 rounded-xl bg-[#1B4DA0] text-white text-xs font-black uppercase tracking-widest hover:bg-[#0D47A1] transition-all shadow-xl shadow-blue-500/20"
                      >
                        Save Record
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

export default AccountsCollectionsTab;
