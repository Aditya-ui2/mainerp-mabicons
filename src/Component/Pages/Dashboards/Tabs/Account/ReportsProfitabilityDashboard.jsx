import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSearch, FiChevronDown, FiChevronRight, FiX, FiCheck, FiMail, FiPhone, FiCalendar, FiClock, FiAlertCircle, FiPlus, FiDownload, FiFileText, FiLayers } from 'react-icons/fi';
import { FaRupeeSign } from 'react-icons/fa';
import { getFinanceProfitabilityReports, getFinanceClientAccounts, generateFinanceProfitabilityReport, updateFinanceProfitabilityReportStatus } from '../../../service/api';
import { Bar, Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend);

const formatINR = (num) => {
  if (!num && num !== 0) return '₹0';
  return '₹' + Number(num).toLocaleString('en-IN');
};

const parseCurrency = (str) => {
  if (typeof str === 'number') return str;
  if (!str) return 0;
  return parseFloat(str.replace(/[^\d.-]/g, '')) || 0;
};


const ReportsProfitabilityDashboard = ({ notificationBell, readOnly }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeDeptFilter, setActiveDeptFilter] = useState('all');
  const [selectedReportDetail, setSelectedReportDetail] = useState(null);
  const [reports, setReports] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeDrawerTab, setActiveDrawerTab] = useState('overview');

  useEffect(() => {
    if (selectedReportDetail) {
      setActiveDrawerTab('overview');
    }
  }, [selectedReportDetail]);

  // Record Report Form State
  const [isRecordModalOpen, setIsRecordModalOpen] = useState(false);
  const [genReportType, setGenReportType] = useState('Monthly');
  const [genDept, setGenDept] = useState('All');
  const [genYear, setGenYear] = useState(new Date().getFullYear());
  const [genMonth, setGenMonth] = useState(new Date().getMonth() + 1);
  const [genQuarter, setGenQuarter] = useState('Q1');
  const [genHalf, setGenHalf] = useState('H1');
  const [genNotes, setGenNotes] = useState('');
  const [genReportName, setGenReportName] = useState('');

  const handleOpenRecordModal = () => {
    setGenReportType('Monthly');
    setGenDept('All');
    setGenYear(new Date().getFullYear());
    setGenMonth(new Date().getMonth() + 1);
    setGenQuarter('Q1');
    setGenHalf('H1');
    setGenNotes('');
    setGenReportName('');
    setIsRecordModalOpen(true);
  };

  const handleMarkReviewed = async (reportId) => {
    const loader = toast.loading('Updating report status...');
    try {
      const res = await updateFinanceProfitabilityReportStatus(reportId, 'Reviewed');
      if (res && res.success) {
        toast.success('Report marked as Reviewed!', { id: loader });
        setSelectedReportDetail(prev => prev ? { ...prev, status: 'Reviewed' } : null);
        await fetchReports();
      } else {
        toast.error(res.message || 'Failed to update status', { id: loader });
      }
    } catch (err) {
      console.error(err);
      toast.error(err.message || 'Failed to update status', { id: loader });
    }
  };


  const fetchReports = async () => {
    setLoading(true);
    try {
      const [resProfit, resClients] = await Promise.allSettled([
        getFinanceProfitabilityReports(),
        getFinanceClientAccounts()
      ]);

      if (resClients.status === 'fulfilled' && resClients.value?.data) {
        setClients(Array.isArray(resClients.value.data) ? resClients.value.data : []);
      }

      if (resProfit.status === 'fulfilled' && resProfit.value?.success && Array.isArray(resProfit.value.data)) {
        const mapped = resProfit.value.data.map((item) => ({
          id: item.id,
          reportNumber: item.reportNumber || item.id,
          name: item.reportName,
          dept: item.department,
          period: item.period,
          revenue: formatINR(item.revenue),
          expenses: formatINR(item.expenses),
          netProfit: formatINR(item.netProfit),
          status: item.status,
          generatedBy: item.generatedBy,
          date: item.createdAt ? new Date(item.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : 'N/A',
          notes: item.notes,
          details: item.details
        }));
        setReports(mapped);
      } else {
        setReports([]);
      }
    } catch (err) {
      console.error('Failed to load profitability reports:', err);
      setReports([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleDownloadReport = (report) => {
    if (!report) return;
    try {
      const textContent = `MABICONS ERP - PROFITABILITY REPORT
=====================================
Report ID: ${report.id}
Report Name: ${report.name}
Department: ${report.dept}
Period: ${report.period}
Revenue: ${report.revenue}
Expenses: ${report.expenses}
Net Profit: ${report.netProfit}
Generated By: ${report.generatedBy}
Date: ${report.date}
Status: ${report.status}

Notes & Analysis:
${report.notes || "No notes available."}
`;
      const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8' });
      const blobUrl = URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `Report_${report.id.replace('#', '')}.txt`;
      link.click();

      setTimeout(() => URL.revokeObjectURL(blobUrl), 100);
      toast.success(`Downloaded report details: Report_${report.id.replace('#', '')}.txt`);
    } catch (err) {
      console.error('Download report failed:', err);
      toast.error('Failed to download report');
    }
  };

  const filteredReports = reports.filter(report => {
    const matchesSearch = report.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDept = activeDeptFilter === 'all' || report.dept.toLowerCase() === activeDeptFilter.toLowerCase();

    return matchesSearch && matchesDept;
  });

  const handleRecordSubmit = async (e) => {
    e.preventDefault();
    setIsRecordModalOpen(false);
    
    let periodVal = '';
    if (genReportType === 'Monthly') {
      periodVal = `${genYear}-${String(genMonth).padStart(2, '0')}`;
    } else if (genReportType === 'Quarterly') {
      periodVal = `${genYear}-${genQuarter}`;
    } else if (genReportType === 'Half-Month') {
      periodVal = `${genYear}-${String(genMonth).padStart(2, '0')}-${genHalf}`;
    } else if (genReportType === 'Yearly') {
      periodVal = `${genYear}`;
    }
    
    const loader = toast.loading('Generating report dynamically from database invoices, expenses & payroll...');
    try {
      const userName = localStorage.getItem('userName') || 'System';
      const payload = {
        reportType: genReportType,
        periodVal,
        department: genDept,
        reportName: genReportName || undefined,
        notes: genNotes || undefined,
        generatedBy: userName
      };
      
      const res = await generateFinanceProfitabilityReport(payload);
      if (res && res.success) {
        toast.success('Profitability Report generated successfully!', { id: loader });
        await fetchReports();
      } else {
        toast.error(res.message || 'Failed to generate report', { id: loader });
      }
    } catch (err) {
      console.error(err);
      toast.error(err.message || 'Failed to generate report', { id: loader });
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500" style={{ fontFamily: "'Calibri', sans-serif" }}>
      {/* Header Section */}
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4 text-left">
        <div className="text-left">
          <h1 className="text-3xl font-bold text-[#1A1A2E] tracking-tight font-syne">Reports & Profitability</h1>
        </div>
        <div className="flex items-center gap-3">
          {notificationBell}
          {!readOnly && (
            <button
              onClick={handleOpenRecordModal}
              className="px-6 py-3 rounded-2xl bg-[#1B4DA0] text-white text-xs font-black uppercase tracking-widest hover:scale-105 transition-all shadow-lg shadow-blue-500/20 flex items-center gap-2"
            >
              <FiPlus size={16} /> Generate Report
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
            placeholder="Search by Report Name or ID..."
            className="w-full bg-[#F4F3EF] border-none rounded-2xl py-3 pl-14 pr-5 text-sm font-medium focus:ring-2 focus:ring-[#F4F3EF] outline-none transition-all placeholder:text-[#9B9BAD]"
          />
        </div>

        <div className="relative">
          <select
            value={activeDeptFilter}
            onChange={(e) => setActiveDeptFilter(e.target.value)}
            className="bg-[#F4F3EF] text-xs font-bold uppercase tracking-wider text-[#1A1A2E] rounded-xl pl-4 pr-10 py-2.5 outline-none border-0 cursor-pointer appearance-none min-w-[140px]"
          >
            <option value="all">All Departments</option>
            <option value="Recruitment">Recruitment</option>
            <option value="Operations">Operations</option>
            <option value="Recruitment + Operations">Recruitment + Operations</option>
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
                <th className="px-8 py-4 text-[11px] font-bold text-[#94a3b8] uppercase tracking-widest text-left">Report ID</th>
                <th className="px-8 py-4 text-[11px] font-bold text-[#94a3b8] uppercase tracking-widest text-left">Report Name</th>
                <th className="px-8 py-4 text-[11px] font-bold text-[#94a3b8] uppercase tracking-widest text-left">Department</th>
                <th className="px-8 py-4 text-[11px] font-bold text-[#94a3b8] uppercase tracking-widest text-left">Period</th>
                <th className="px-8 py-4 text-[11px] font-bold text-[#94a3b8] uppercase tracking-widest text-left">Net Profit</th>
                <th className="px-8 py-4 text-[11px] font-bold text-[#94a3b8] uppercase tracking-widest text-left">Generated By</th>
                <th className="px-8 py-4 text-[11px] font-bold text-[#94a3b8] uppercase tracking-widest text-left">Status</th>
                <th className="px-8 py-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F4F3EF]">
              {loading ? (
                <tr>
                  <td colSpan="8" className="py-24 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <div className="w-8 h-8 border-4 border-[#1B4DA0] border-t-transparent rounded-full animate-spin mb-4" />
                      <p className="text-[#6B6B7E] font-medium text-xs">Loading reports...</p>
                    </div>
                  </td>
                </tr>
              ) : filteredReports.length === 0 ? (
                <tr>
                  <td colSpan="8" className="py-24 text-center">
                    <p className="text-[#9B9BAD] text-sm font-bold uppercase tracking-widest">No reports found</p>
                  </td>
                </tr>
              ) : (
                filteredReports.map((item) => (
                  <tr
                    key={item.id}
                    onClick={() => setSelectedReportDetail(item)}
                    className="hover:bg-[#F8FAFF] transition-all group cursor-pointer"
                  >
                    <td className="px-8 py-4 text-left">
                      <span className="text-[13px] font-black text-[#1A1A2E]">{item.reportNumber || item.id}</span>
                    </td>
                    <td className="px-8 py-4 text-left">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-black text-xs">
                          {item.name.substring(0, 2).toUpperCase()}
                        </div>
                        <span className="text-[14px] font-bold text-[#1A1A2E]">{item.name}</span>
                      </div>
                    </td>
                    <td className="px-8 py-4 text-left">
                      <span className="px-3 py-1 rounded-xl bg-gray-50 text-gray-600 text-[10px] font-black uppercase tracking-widest">
                        {item.dept}
                      </span>
                    </td>
                    <td className="px-8 py-4 text-left">
                      <span className="text-[13px] font-bold text-[#64748B]">{item.period}</span>
                    </td>
                    <td className="px-8 py-4 text-left">
                      <span className="text-[14px] font-black text-emerald-600">{item.netProfit}</span>
                    </td>
                    <td className="px-8 py-4 text-left">
                      <div className="flex flex-col">
                        <span className="text-[13px] font-bold text-[#1A1A2E]">{item.generatedBy}</span>
                        <span className="text-[10px] font-bold text-[#9B9BAD] uppercase tracking-widest">{item.date}</span>
                      </div>
                    </td>
                    <td className="px-8 py-4 text-left">
                      <span className={`px-4 py-2 rounded-xl text-[11px] font-black uppercase tracking-widest
                        ${item.status === 'Reviewed' ? 'bg-emerald-50 text-emerald-600' :
                          item.status === 'Generated' ? 'bg-blue-50 text-blue-600' :
                            'bg-amber-50 text-amber-600'}`}
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
          {selectedReportDetail && (
            <React.Fragment>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-[#1A1A2E]/40 backdrop-blur-md z-[200000]"
                onClick={() => setSelectedReportDetail(null)}
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
                      <h2 className="text-3xl font-bold text-[#0F172A] font-syne mb-2">Report Detail</h2>
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-bold text-[#64748B]">{selectedReportDetail.id}</span>
                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest
                        ${selectedReportDetail.status === 'Reviewed' ? 'bg-emerald-50 text-emerald-600' :
                            selectedReportDetail.status === 'Generated' ? 'bg-blue-50 text-blue-600' :
                              'bg-amber-50 text-amber-600'}`}
                        >
                          {selectedReportDetail.status}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handleDownloadReport(selectedReportDetail)}
                        className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center hover:bg-blue-100 transition-all"
                        title="Download Report Details"
                      >
                        <FiDownload size={18} />
                      </button>
                      <button
                        onClick={() => setSelectedReportDetail(null)}
                        className="w-10 h-10 rounded-xl bg-[#FEE2E2] text-[#EF4444] flex items-center justify-center hover:bg-red-200 transition-all"
                      >
                        <FiX size={20} />
                      </button>
                    </div>
                  </div>

                  {/* Segmented Control for Tabs */}
                  <div className="flex border-b border-gray-100 mt-6 -mx-8 px-8">
                    <button
                      onClick={() => setActiveDrawerTab('overview')}
                      className={`pb-4 px-4 text-xs font-black uppercase tracking-wider transition-all border-b-2 outline-none ${
                        activeDrawerTab === 'overview'
                          ? 'border-[#1B4DA0] text-[#1B4DA0]'
                          : 'border-transparent text-gray-400 hover:text-gray-600'
                      }`}
                    >
                      Overview Statement
                    </button>
                    <button
                      onClick={() => setActiveDrawerTab('graphical')}
                      className={`pb-4 px-4 text-xs font-black uppercase tracking-wider transition-all border-b-2 outline-none ${
                        activeDrawerTab === 'graphical'
                          ? 'border-[#1B4DA0] text-[#1B4DA0]'
                          : 'border-transparent text-gray-400 hover:text-gray-600'
                      }`}
                    >
                      Advanced Graphical Analytics
                    </button>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-8 space-y-6">
                  {activeDrawerTab === 'overview' ? (
                    <div className="space-y-6 animate-in fade-in duration-300">
                      <div className="grid grid-cols-2 gap-6">
                        <div className="bg-white p-6 rounded-[24px] border border-[#E2E8F0] shadow-sm">
                          <p className="text-[10px] font-black text-[#94A3B8] uppercase tracking-widest mb-1">Report Overview</p>
                          <p className="text-[16px] font-bold text-[#0F172A] leading-tight">{selectedReportDetail.name}</p>
                          <p className="text-[13px] font-medium text-[#64748B] mt-2 flex items-center gap-2"><FiLayers size={14} /> {selectedReportDetail.dept}</p>
                          <p className="text-[13px] font-bold text-[#1B4DA0] mt-3">Period:</p>
                          <p className="text-[13px] font-medium text-[#64748B]">{selectedReportDetail.period}</p>
                        </div>
                        <div className="bg-white p-6 rounded-[24px] border border-[#E2E8F0] shadow-sm">
                          <p className="text-[10px] font-black text-[#94A3B8] uppercase tracking-widest mb-1">Financials</p>
                          <p className="text-[14px] font-bold text-[#0F172A] mt-2">Revenue: <span className="font-black text-[#1A1A2E]">{selectedReportDetail.revenue}</span></p>
                          <p className="text-[14px] font-bold text-[#0F172A] mt-1">Expenses: <span className="font-bold text-red-500">{selectedReportDetail.expenses}</span></p>
                          <div className="h-px bg-slate-200 my-2"></div>
                          <p className="text-[15px] font-black text-[#0F172A] mt-1 flex items-center gap-2">Net Profit:
                            <span className="text-emerald-600">
                              {selectedReportDetail.netProfit}
                            </span>
                          </p>
                        </div>
                      </div>

                      {selectedReportDetail.details && (
                        <div className="bg-white rounded-[24px] border border-[#E2E8F0] shadow-sm p-6 space-y-4">
                          <h3 className="text-[12px] font-black text-[#0F172A] uppercase tracking-wider">Expense & Bills Breakdown</h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                              <p className="text-[10px] font-bold text-slate-500 uppercase">💼 Salary Payouts</p>
                              <p className="text-sm font-black text-slate-800 mt-1">{formatINR(selectedReportDetail.details.salary)}</p>
                            </div>
                            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                              <p className="text-[10px] font-bold text-slate-500 uppercase">🏢 Office Rent & Utilities</p>
                              <p className="text-sm font-black text-slate-800 mt-1">{formatINR(selectedReportDetail.details.rent)}</p>
                            </div>
                            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                              <p className="text-[10px] font-bold text-slate-500 uppercase">🧾 Incoming Bills (Requests)</p>
                              <p className="text-sm font-black text-slate-800 mt-1">{formatINR(selectedReportDetail.details.incomingBills)}</p>
                            </div>
                            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                              <p className="text-[10px] font-bold text-slate-500 uppercase">📂 Miscellaneous & Others</p>
                              <p className="text-sm font-black text-slate-800 mt-1">{formatINR(selectedReportDetail.details.misc)}</p>
                            </div>
                          </div>
                          <div className="p-3 bg-indigo-50/50 rounded-xl text-[11px] font-semibold text-indigo-600 flex items-center justify-between">
                            <span>Items Counted:</span>
                            <span>
                              {selectedReportDetail.details.invoicesCount || 0} Invoices | {selectedReportDetail.details.expensesCount || 0} Expenses | {selectedReportDetail.details.paymentRequestsCount || 0} Bills
                            </span>
                          </div>
                        </div>
                      )}

                      <div className="bg-white rounded-[24px] border border-[#E2E8F0] shadow-sm overflow-hidden p-6">
                        <h3 className="text-[14px] font-bold text-[#0F172A] uppercase tracking-wider mb-4">Report Notes & Analysis</h3>
                        <div className="p-4 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0]">
                          <p className="text-sm text-[#475569]">{selectedReportDetail.notes || "No notes available."}</p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-6 animate-in fade-in duration-300">
                      {/* Net Margin Card */}
                      <div className="bg-white p-6 rounded-[24px] border border-[#E2E8F0] shadow-sm">
                        <div className="flex justify-between items-center mb-3">
                          <p className="text-[10px] font-black text-[#94A3B8] uppercase tracking-widest">Net Profit Margin</p>
                          <span className={`text-sm font-bold ${parseCurrency(selectedReportDetail.netProfit) >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                            {selectedReportDetail.netProfit} Net Margin ({(() => {
                              const rev = parseCurrency(selectedReportDetail.revenue);
                              const profit = parseCurrency(selectedReportDetail.netProfit);
                              return rev > 0 ? `${Math.round((profit / rev) * 100)}%` : '0%';
                            })()})
                          </span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                          <div 
                            className={`h-full rounded-full transition-all duration-500 ${
                              parseCurrency(selectedReportDetail.netProfit) >= 0 ? 'bg-emerald-500' : 'bg-red-500'
                            }`}
                            style={{ 
                              width: `${Math.min(100, Math.max(0, (() => {
                                const rev = parseCurrency(selectedReportDetail.revenue);
                                const profit = parseCurrency(selectedReportDetail.netProfit);
                                return rev > 0 ? (profit / rev) * 100 : 0;
                              })()))}%` 
                            }}
                          />
                        </div>
                      </div>

                      {/* Charts Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Bar Chart: Financial Performance */}
                        <div className="bg-white p-6 rounded-[24px] border border-[#E2E8F0] shadow-sm flex flex-col items-center">
                          <h4 className="text-xs font-black text-[#0F172A] uppercase tracking-wider mb-4 w-full text-left">Financial Performance</h4>
                          <div className="h-64 w-full flex items-center justify-center">
                            <Bar
                              data={{
                                labels: ['Revenue', 'Expenses', 'Net Profit'],
                                datasets: [{
                                  data: [
                                    parseCurrency(selectedReportDetail.revenue),
                                    parseCurrency(selectedReportDetail.expenses),
                                    parseCurrency(selectedReportDetail.netProfit)
                                  ],
                                  backgroundColor: [
                                    '#10B981', // green for revenue
                                    '#EF4444', // red for expenses
                                    '#3B82F6'  // blue for profit
                                  ],
                                  borderRadius: 8
                                }]
                              }}
                              options={{
                                responsive: true,
                                maintainAspectRatio: false,
                                plugins: {
                                  legend: { display: false }
                                },
                                scales: {
                                  y: {
                                    ticks: {
                                      callback: (value) => '₹' + Number(value).toLocaleString('en-IN')
                                    }
                                  }
                                }
                              }}
                            />
                          </div>
                        </div>

                        {/* Doughnut Chart: Expense Breakdown */}
                        <div className="bg-white p-6 rounded-[24px] border border-[#E2E8F0] shadow-sm flex flex-col items-center">
                          <h4 className="text-xs font-black text-[#0F172A] uppercase tracking-wider mb-4 w-full text-left">Expense Distribution</h4>
                          <div className="h-64 w-full flex items-center justify-center">
                            {selectedReportDetail.details ? (
                              <Doughnut
                                data={{
                                  labels: ['Salary', 'Office Rent', 'Incoming Bills', 'Misc / Other'],
                                  datasets: [{
                                    data: [
                                      selectedReportDetail.details.salary || 0,
                                      selectedReportDetail.details.rent || 0,
                                      selectedReportDetail.details.incomingBills || 0,
                                      (selectedReportDetail.details.misc || 0) + (selectedReportDetail.details.otherExpenses || 0)
                                    ],
                                    backgroundColor: ['#3D37F1', '#10B981', '#F59E0B', '#EF4444'],
                                    borderWidth: 0
                                  }]
                                }}
                                options={{
                                  responsive: true,
                                  maintainAspectRatio: false,
                                  plugins: {
                                    legend: { position: 'bottom', labels: { boxWidth: 10, font: { size: 10 } } }
                                  }
                                }}
                              />
                            ) : (
                              <p className="text-xs font-bold text-[#9B9BAD] uppercase tracking-widest">No Breakdown Available</p>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Detailed Analytics Table */}
                      <div className="bg-white rounded-[24px] border border-[#E2E8F0] shadow-sm overflow-hidden p-6 text-left">
                        <h4 className="text-xs font-black text-[#0F172A] uppercase tracking-wider mb-4">Detailed Statement</h4>
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="border-b border-gray-100">
                                <th className="pb-3 font-bold text-[#94a3b8] uppercase text-[10px] tracking-wider text-left">Category</th>
                                <th className="pb-3 font-bold text-[#94a3b8] uppercase text-[10px] tracking-wider text-right">Amount</th>
                                <th className="pb-3 font-bold text-[#94a3b8] uppercase text-[10px] tracking-wider text-right">Percentage</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                              <tr>
                                <td className="py-3 font-bold text-gray-700">Gross Revenue</td>
                                <td className="py-3 text-right font-black text-emerald-600">{selectedReportDetail.revenue}</td>
                                <td className="py-3 text-right font-bold text-gray-500">100%</td>
                              </tr>
                              <tr>
                                <td className="py-3 font-bold text-gray-700">Total Expenses</td>
                                <td className="py-3 text-right font-black text-red-500">{selectedReportDetail.expenses}</td>
                                <td className="py-3 text-right font-bold text-gray-500">
                                  {(() => {
                                    const rev = parseCurrency(selectedReportDetail.revenue);
                                    const exp = parseCurrency(selectedReportDetail.expenses);
                                    return rev > 0 ? `${Math.round((exp / rev) * 100)}%` : '0%';
                                  })()} (of Rev)
                                </td>
                              </tr>
                              {selectedReportDetail.details && (() => {
                                const totalExp = parseCurrency(selectedReportDetail.expenses) || 1;
                                return (
                                  <>
                                    <tr>
                                      <td className="py-3 text-gray-600 pl-4">└ Salary Payouts</td>
                                      <td className="py-3 text-right font-bold text-slate-800">{formatINR(selectedReportDetail.details.salary)}</td>
                                      <td className="py-3 text-right text-gray-500">
                                        {Math.round((selectedReportDetail.details.salary / totalExp) * 100)}%
                                      </td>
                                    </tr>
                                    <tr>
                                      <td className="py-3 text-gray-600 pl-4">└ Office Rent & Utilities</td>
                                      <td className="py-3 text-right font-bold text-slate-800">{formatINR(selectedReportDetail.details.rent)}</td>
                                      <td className="py-3 text-right text-gray-500">
                                        {Math.round((selectedReportDetail.details.rent / totalExp) * 100)}%
                                      </td>
                                    </tr>
                                    <tr>
                                      <td className="py-3 text-gray-600 pl-4">└ Incoming Bills</td>
                                      <td className="py-3 text-right font-bold text-slate-800">{formatINR(selectedReportDetail.details.incomingBills)}</td>
                                      <td className="py-3 text-right text-gray-500">
                                        {Math.round((selectedReportDetail.details.incomingBills / totalExp) * 100)}%
                                      </td>
                                    </tr>
                                    <tr>
                                      <td className="py-3 text-gray-600 pl-4">└ Miscellaneous & Others</td>
                                      <td className="py-3 text-right font-bold text-slate-800">
                                        {formatINR((selectedReportDetail.details.misc || 0) + (selectedReportDetail.details.otherExpenses || 0))}
                                      </td>
                                      <td className="py-3 text-right text-gray-500">
                                        {Math.round((((selectedReportDetail.details.misc || 0) + (selectedReportDetail.details.otherExpenses || 0)) / totalExp) * 100)}%
                                      </td>
                                    </tr>
                                  </>
                                );
                              })()}
                              <tr className="bg-slate-50/50">
                                <td className="py-3.5 font-black text-[#0F172A]">Net Operating Profit</td>
                                <td className={`py-3.5 text-right font-black ${parseCurrency(selectedReportDetail.netProfit) >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                                  {selectedReportDetail.netProfit}
                                </td>
                                <td className={`py-3.5 text-right font-black ${parseCurrency(selectedReportDetail.netProfit) >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                                  {(() => {
                                    const rev = parseCurrency(selectedReportDetail.revenue);
                                    const profit = parseCurrency(selectedReportDetail.netProfit);
                                    return rev > 0 ? `${Math.round((profit / rev) * 100)}%` : '0%';
                                  })()}
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  )}

                  {selectedReportDetail.status === 'Generated' && !readOnly && (
                    <div className="bg-blue-50 p-6 rounded-[24px] border border-blue-200">
                      <div className="flex items-center gap-2 mb-2">
                        <FiAlertCircle className="text-blue-600" />
                        <h3 className="text-[14px] font-bold text-blue-800 uppercase tracking-wider">Review Required</h3>
                      </div>
                      <p className="text-[13px] text-blue-700">Please review the financial figures and mark the report as reviewed.</p>
                      <div className="flex gap-3 mt-4">
                        <button
                          onClick={() => handleMarkReviewed(selectedReportDetail.id)}
                          className="px-6 py-3 rounded-xl bg-[#1B4DA0] text-white text-xs font-black uppercase tracking-widest hover:bg-[#0D47A1] transition-all flex items-center gap-2"
                        >
                          <FiCheck /> Mark Reviewed
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

      {/* Record Report Form Modal */}
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
                      <h2 className="text-2xl font-bold text-[#1A1A2E] font-syne">Generate Report</h2>
                      <p className="text-xs font-bold text-[#1B4DA0] uppercase tracking-widest mt-1">Create a new profitability report</p>
                    </div>
                    <button onClick={() => setIsRecordModalOpen(false)} className="w-10 h-10 bg-white border border-[#E2E8F0] rounded-xl flex items-center justify-center text-[#94A3B8] hover:text-red-500 hover:bg-red-50 transition-all shadow-sm">
                      <FiX size={20} />
                    </button>
                  </div>

                  <form onSubmit={handleRecordSubmit} className="p-8 space-y-6 text-left">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-[#9B9BAD] uppercase tracking-[2px]">Report Interval</label>
                        <select
                          value={genReportType}
                          onChange={(e) => setGenReportType(e.target.value)}
                          className="w-full px-4 py-3 bg-[#FAFAF8] border border-[#F4F3EF] rounded-xl text-sm font-bold text-[#1A1A2E] focus:outline-none focus:border-[#1B4DA0] transition-all"
                        >
                          <option value="Monthly">Monthly</option>
                          <option value="Quarterly">Quarterly</option>
                          <option value="Half-Month">Half-Month</option>
                          <option value="Yearly">Yearly</option>
                        </select>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-[#9B9BAD] uppercase tracking-[2px]">Department</label>
                        <select
                          value={genDept}
                          onChange={(e) => setGenDept(e.target.value)}
                          className="w-full px-4 py-3 bg-[#FAFAF8] border border-[#F4F3EF] rounded-xl text-sm font-bold text-[#1A1A2E] focus:outline-none focus:border-[#1B4DA0] transition-all"
                        >
                          <option value="All">All Departments</option>
                          <option value="Recruitment">Recruitment</option>
                          <option value="Operations">Operations</option>
                          <option value="Sales">Sales</option>
                        </select>
                      </div>
                    </div>

                    {(genReportType === 'Monthly' || genReportType === 'Half-Month') && (
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold text-[#9B9BAD] uppercase tracking-[2px]">Month</label>
                          <select
                            value={genMonth}
                            onChange={(e) => setGenMonth(Number(e.target.value))}
                            className="w-full px-4 py-3 bg-[#FAFAF8] border border-[#F4F3EF] rounded-xl text-sm font-bold text-[#1A1A2E] focus:outline-none focus:border-[#1B4DA0] transition-all"
                          >
                            {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map((m, idx) => (
                              <option key={m} value={idx + 1}>{m}</option>
                            ))}
                          </select>
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold text-[#9B9BAD] uppercase tracking-[2px]">Year</label>
                          <input
                            type="number"
                            value={genYear}
                            onChange={(e) => setGenYear(Number(e.target.value))}
                            className="w-full px-4 py-3 bg-[#FAFAF8] border border-[#F4F3EF] rounded-xl text-sm font-bold text-[#1A1A2E] focus:outline-none focus:border-[#1B4DA0] transition-all"
                            min="2020"
                            max="2100"
                          />
                        </div>
                      </div>
                    )}

                    {genReportType === 'Half-Month' && (
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-[#9B9BAD] uppercase tracking-[2px]">Half of Month</label>
                        <select
                          value={genHalf}
                          onChange={(e) => setGenHalf(e.target.value)}
                          className="w-full px-4 py-3 bg-[#FAFAF8] border border-[#F4F3EF] rounded-xl text-sm font-bold text-[#1A1A2E] focus:outline-none focus:border-[#1B4DA0] transition-all"
                        >
                          <option value="H1">First Half (1st - 15th)</option>
                          <option value="H2">Second Half (16th - End)</option>
                        </select>
                      </div>
                    )}

                    {genReportType === 'Quarterly' && (
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold text-[#9B9BAD] uppercase tracking-[2px]">Quarter</label>
                          <select
                            value={genQuarter}
                            onChange={(e) => setGenQuarter(e.target.value)}
                            className="w-full px-4 py-3 bg-[#FAFAF8] border border-[#F4F3EF] rounded-xl text-sm font-bold text-[#1A1A2E] focus:outline-none focus:border-[#1B4DA0] transition-all"
                          >
                            <option value="Q1">Q1 (Jan - Mar)</option>
                            <option value="Q2">Q2 (Apr - Jun)</option>
                            <option value="Q3">Q3 (Jul - Sep)</option>
                            <option value="Q4">Q4 (Oct - Dec)</option>
                          </select>
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold text-[#9B9BAD] uppercase tracking-[2px]">Year</label>
                          <input
                            type="number"
                            value={genYear}
                            onChange={(e) => setGenYear(Number(e.target.value))}
                            className="w-full px-4 py-3 bg-[#FAFAF8] border border-[#F4F3EF] rounded-xl text-sm font-bold text-[#1A1A2E] focus:outline-none focus:border-[#1B4DA0] transition-all"
                            min="2020"
                            max="2100"
                          />
                        </div>
                      </div>
                    )}

                    {genReportType === 'Yearly' && (
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-[#9B9BAD] uppercase tracking-[2px]">Year</label>
                        <input
                          type="number"
                          value={genYear}
                          onChange={(e) => setGenYear(Number(e.target.value))}
                          className="w-full px-4 py-3 bg-[#FAFAF8] border border-[#F4F3EF] rounded-xl text-sm font-bold text-[#1A1A2E] focus:outline-none focus:border-[#1B4DA0] transition-all"
                          min="2020"
                          max="2100"
                        />
                      </div>
                    )}

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-[#9B9BAD] uppercase tracking-[2px]">Report Name (Optional)</label>
                      <input
                        type="text"
                        value={genReportName}
                        onChange={(e) => setGenReportName(e.target.value)}
                        className="w-full px-4 py-3 bg-[#FAFAF8] border border-[#F4F3EF] rounded-xl text-sm font-bold text-[#1A1A2E] focus:outline-none focus:border-[#1B4DA0] focus:ring-1 focus:ring-[#1B4DA0] transition-all"
                        placeholder="Default period-wise name will be used if blank"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-[#9B9BAD] uppercase tracking-[2px]">Analysis Notes (Optional)</label>
                      <textarea
                        value={genNotes}
                        onChange={(e) => setGenNotes(e.target.value)}
                        className="w-full px-4 py-3 bg-[#FAFAF8] border border-[#F4F3EF] rounded-xl text-sm font-medium text-[#1A1A2E] focus:outline-none focus:border-[#1B4DA0] transition-all h-20 resize-none"
                        placeholder="Any additional remarks..."
                      />
                    </div>

                    <div className="pt-4 mt-6 border-t border-[#F4F3EF]">
                      <button
                        type="submit"
                        className="w-full py-4 rounded-xl bg-[#1B4DA0] text-white text-xs font-black uppercase tracking-widest hover:bg-[#0D47A1] transition-all shadow-xl shadow-blue-500/20"
                      >
                        Generate Report
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

export default ReportsProfitabilityDashboard;