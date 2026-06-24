import React, { useState, useEffect } from 'react';
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiSearch, FiFilter, FiDownload, FiPlus, FiChevronRight, FiChevronDown,
  FiMail, FiPhone, FiMapPin, FiActivity, FiBriefcase, FiUsers, FiTrash,
  FiX, FiUser, FiDollarSign, FiClock, FiZap, FiCheckSquare, FiDatabase, FiEdit3, FiTrendingUp, FiTarget, FiCheckCircle, FiCheck,
  FiEdit2, FiFileText, FiEye, FiUpload, FiRefreshCw, FiCamera
} from 'react-icons/fi';
import { getClientReports, seedReports, createReport } from '../../../service/api';
import { toast } from 'react-hot-toast';

const InfoItem = ({ label, value, subValue, fullWidth = false, isEditing, onChange, type = "text" }) => (
  <div className={`space-y-1.5 ${fullWidth ? 'col-span-full' : ''}`}>
    <label className="text-[10px] font-bold text-[#9B9BAD] uppercase tracking-[2px]">{label}</label>
    <div className="bg-white px-4 py-3 rounded-xl border border-[#F4F3EF]">
      {isEditing ? (
        <input
          type={type}
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          className="w-full text-sm font-bold text-[#1A1A2E] bg-transparent border-none focus:outline-none"
        />
      ) : (
        <>
          <p className="text-sm font-bold text-[#1A1A2E]">{value || 'N/A'}</p>
          {subValue && <p className="text-[10px] font-medium text-[#6B6B7E] mt-0.5">{subValue}</p>}
        </>
      )}
    </div>
  </div>
);

const StatusDropdown = ({ currentStatus, onChange, reportId }) => {
  const [isOpen, setIsOpen] = useState(false);

  const getStatusColor = (status) => {
    switch (status) {
      case 'VERIFIED': return '#10B981'; // Green
      case 'PENDING': return '#F59E0B'; // Amber
      case 'DRAFT': return '#64748B'; // Slate
      default: return '#64748B';
    }
  };

  const bgClass = currentStatus === 'VERIFIED' ? 'bg-[#10B981]/10 text-[#10B981] hover:bg-[#10B981]/20 border-[#10B981]/20'
    : currentStatus === 'PENDING' ? 'bg-[#F59E0B]/10 text-[#F59E0B] hover:bg-[#F59E0B]/20 border-[#F59E0B]/20'
      : 'bg-slate-100 text-slate-600 hover:bg-slate-200 border-slate-200';

  const dotClass = currentStatus === 'VERIFIED' ? 'bg-[#10B981]'
    : currentStatus === 'PENDING' ? 'bg-[#F59E0B]'
      : 'bg-slate-400';

  return (
    <div className="relative inline-block" onClick={e => e.stopPropagation()}>
      <button
        id={`status-btn-${reportId}`}
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center justify-between gap-2 px-3 py-2 rounded-xl text-[11px] uppercase tracking-widest font-black transition-all min-w-[110px] border ${bgClass}`}
      >
        <div className="flex items-center gap-2">
          <div className={`w-1.5 h-1.5 rounded-full ${dotClass} ${currentStatus === 'PENDING' ? 'animate-pulse' : ''}`} />
          <span className="truncate">{currentStatus}</span>
        </div>
        <FiChevronDown size={14} className={`transition-transform opacity-60 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && createPortal(
        <>
          <div className="fixed inset-0 z-[1100] bg-transparent" onClick={() => setIsOpen(false)} />
          <div
            className="fixed z-[1101] w-36 bg-white rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.12)] border border-[#F4F3EF] py-2 flex flex-col"
            style={(() => {
              const btn = document.getElementById(`status-btn-${reportId}`);
              if (!btn) return { top: 0, left: 0 };
              const rect = btn.getBoundingClientRect();
              const spaceBelow = window.innerHeight - rect.bottom;
              if (spaceBelow < 150) {
                return { bottom: window.innerHeight - rect.top + 6, left: rect.left };
              }
              return { top: rect.bottom + 6, left: rect.left };
            })()}
          >
            {['VERIFIED', 'PENDING', 'DRAFT'].map((s) => (
              <button
                key={s}
                onClick={() => { onChange(s); setIsOpen(false); }}
                className={`w-full text-left px-4 py-3 text-[11px] font-black uppercase tracking-widest flex items-center gap-2 transition-all ${currentStatus === s
                    ? (s === 'VERIFIED' ? 'bg-[#10B981]/10 text-[#10B981]' : s === 'PENDING' ? 'bg-[#F59E0B]/10 text-[#F59E0B]' : 'bg-slate-100 text-slate-600')
                    : 'hover:bg-slate-50 text-slate-500'
                  }`}
              >
                <div className={`w-1.5 h-1.5 rounded-full ${s === 'VERIFIED' ? 'bg-[#10B981]' : s === 'PENDING' ? 'bg-[#F59E0B]' : 'bg-slate-400'}`} />
                {s}
              </button>
            ))}
          </div>
        </>,
        document.body
      )}
    </div>
  );
};

const CreateReportModal = ({ isOpen, onClose, clients, onSuccess }) => {
  const [formData, setFormData] = useState({
    reportName: '',
    clientId: '',
    status: 'PENDING'
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.reportName || !formData.clientId) {
      return toast.error("Please fill all required fields");
    }

    try {
      setLoading(true);
      const res = await createReport(formData);
      if (res.success) {
        toast.success("Report generated successfully");
        onSuccess();
        onClose();
        setFormData({ reportName: '', clientId: '', status: 'PENDING' });
      }
    } catch (error) {
      toast.error(error.message || "Failed to generate report");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-[#1A1A2E]/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-md bg-white rounded-[40px] shadow-2xl overflow-hidden text-left"
          >
            <div className="px-10 py-10 border-b border-[#F4F3EF] flex items-center justify-between">
              <h1 className="text-3xl font-bold text-[#1A1A2E] tracking-tight" style={{ fontFamily: "'Syne', sans-serif" }}>
                New Report
              </h1>
              <button onClick={onClose} className="w-10 h-10 rounded-xl bg-[#F4F3EF] text-[#6B6B7E] flex items-center justify-center hover:bg-rose-50 hover:text-rose-500 transition-all">
                <FiX size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-10 space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-widest ml-1">Report Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Monthly Performance"
                  className="w-full px-5 py-4 bg-[#F4F3EF] border-none rounded-2xl text-sm font-bold text-[#1A1A2E] outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                  value={formData.reportName}
                  onChange={(e) => setFormData({ ...formData, reportName: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-widest ml-1">Select Client</label>
                <select
                  required
                  className="w-full px-5 py-4 bg-[#F4F3EF] border-none rounded-2xl text-sm font-bold text-[#1A1A2E] outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                  value={formData.clientId}
                  onChange={(e) => setFormData({ ...formData, clientId: e.target.value })}
                >
                  <option value="">Choose a client...</option>
                  {clients.map(c => (
                    <option key={c.id || c._id} value={c.id || c._id}>{c.companyName || c.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-widest ml-1">Initial Status</label>
                <select
                  className="w-full px-5 py-4 bg-[#F4F3EF] border-none rounded-2xl text-sm font-bold text-[#1A1A2E] outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                >
                  <option value="DRAFT">DRAFT</option>
                  <option value="PENDING">PENDING</option>
                  <option value="VERIFIED">VERIFIED</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-5 bg-[#1B4DA0] text-white font-black text-[11px] uppercase tracking-[3px] rounded-2xl shadow-xl shadow-blue-500/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
              >
                {loading ? 'Generating...' : 'Confirm Generation'}
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

const ClientReportingTab = ({ clients = [], notificationBell }) => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [selectedReportDetail, setSelectedReportDetail] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [reportToDelete, setReportToDelete] = useState(null);

  const [isEditingInDetail, setIsEditingInDetail] = useState(false);
  const [isSavingDetail, setIsSavingDetail] = useState(false);
  const [editableReport, setEditableReport] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await getClientReports();
      if (res.success) {
        let apiReports = res.data;
        if (!apiReports || apiReports.length === 0) {
          await seedReports();
          const res2 = await getClientReports();
          if (res2.success) apiReports = res2.data;
        }

        if (!apiReports || apiReports.length === 0) {
          apiReports = [
            { id: '1', reportName: 'Q1 Performance Review', companyName: 'Zomato', status: 'VERIFIED', size: '2.4 MB', reportNumber: 'REP-001', createdAt: new Date().toISOString() },
            { id: '2', reportName: 'Monthly Audit', companyName: 'TCS', status: 'PENDING', size: '1.1 MB', reportNumber: 'REP-002', createdAt: new Date().toISOString() },
            { id: '3', reportName: 'Annual Strategy Report', companyName: 'Infosys', status: 'DRAFT', size: '5.6 MB', reportNumber: 'REP-003', createdAt: new Date().toISOString() },
          ];
        }
        setReports(apiReports);
      }
    } catch (error) {
      toast.error("Failed to load reports");
      setReports([
        { id: '1', reportName: 'Q1 Performance Review', companyName: 'Zomato', status: 'VERIFIED', size: '2.4 MB', reportNumber: 'REP-001', createdAt: new Date().toISOString() },
        { id: '2', reportName: 'Monthly Audit', companyName: 'TCS', status: 'PENDING', size: '1.1 MB', reportNumber: 'REP-002', createdAt: new Date().toISOString() }
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleToggleStatus = (report, newStatus) => {
    const reportId = report.id || report._id;
    setReports(prev => prev.map(r =>
      (r.id === reportId || r._id === reportId) ? { ...r, status: newStatus } : r
    ));
    if (selectedReportDetail && (selectedReportDetail.id === reportId || selectedReportDetail._id === reportId)) {
      setSelectedReportDetail(prev => ({ ...prev, status: newStatus }));
    }
    toast.success(`${report.reportName} status updated to ${newStatus}`);
  };

  const handleBulkStatusUpdate = (status) => {
    const loadingToast = toast.loading(`Updating ${selectedIds.length} reports...`);
    setReports(prev => prev.map(r => {
      const rid = r.id || r._id;
      return selectedIds.includes(rid) ? { ...r, status } : r;
    }));
    setSelectedIds([]);
    toast.success(`${selectedIds.length} reports updated to ${status}`, { id: loadingToast });
  };

  const handleBulkDelete = () => {
    const loadingToast = toast.loading(`Deleting ${selectedIds.length} reports...`);
    setReports(prev => prev.filter(r => {
      const rid = r.id || r._id;
      return !selectedIds.includes(rid);
    }));
    setSelectedIds([]);
    toast.success(`${selectedIds.length} reports removed`, { id: loadingToast });
  };

  const handleDeleteConfirm = () => {
    if (!reportToDelete) return;
    setReports(prev => prev.filter(r => (r.id !== (reportToDelete.id || reportToDelete._id)) && (r._id !== (reportToDelete.id || reportToDelete._id))));
    toast.success('Report deleted successfully');
    setIsDeleteModalOpen(false);
    setReportToDelete(null);
    setSelectedReportDetail(null);
  };

  const handleSaveReportDetails = () => {
    setIsSavingDetail(true);
    setTimeout(() => {
      const reportId = selectedReportDetail.id || selectedReportDetail._id;
      const updatedReport = { ...selectedReportDetail, ...editableReport };
      setSelectedReportDetail(updatedReport);
      setReports(prev => prev.map(r =>
        (r.id === reportId || r._id === reportId) ? updatedReport : r
      ));
      setIsEditingInDetail(false);
      setIsSavingDetail(false);
      toast.success('Report details updated successfully');
    }, 500);
  };

  const filteredReports = reports.filter(r => {
    const matchesSearch = (r.reportName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (r.companyName || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = selectedStatus === 'ALL' || (r.status || 'PENDING').toUpperCase() === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <>
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8 p-1 text-left">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-bold text-[#1A1A2E] tracking-tight" style={{ fontFamily: "'Syne', sans-serif" }}>
              Client Reports
            </h1>
          </div>
          <div className="flex items-center gap-4">
            {notificationBell}
            <button
              onClick={() => setShowCreateModal(true)}
              className="w-full sm:w-auto flex items-center justify-center gap-3 px-8 py-3 bg-[#1B4DA0] text-white rounded-2xl text-[11px] font-black uppercase tracking-[2px] shadow-xl shadow-blue-500/20 hover:scale-[1.02] active:scale-95 transition-all"
            >
              <FiPlus size={18} strokeWidth={3} />
              Generate New Report
            </button>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="bg-white rounded-[24px] p-2 border border-[#F4F3EF] shadow-sm flex items-center gap-3 flex-wrap mb-8">
          <div className="relative flex-1 group min-w-[200px]">
            <FiSearch className="absolute left-5 top-1/2 -translate-y-1/2 text-[#9B9BAD] transition-colors" size={18} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search reports..."
              className="w-full bg-[#F4F3EF] border-none rounded-2xl py-3 pl-14 pr-5 text-sm font-medium focus:ring-2 focus:ring-[#F4F3EF] outline-none transition-all placeholder:text-[#9B9BAD]"
            />
          </div>

          <div className="relative group">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="bg-[#F4F3EF] text-[11px] font-black uppercase tracking-widest text-[#1A1A2E] rounded-xl pl-4 pr-10 py-2.5 outline-none border-0 cursor-pointer appearance-none min-w-[150px] hover:bg-[#EEF2FB] transition-all"
            >
              <option value="ALL">ALL STATUS</option>
              <option value="VERIFIED">VERIFIED</option>
              <option value="PENDING">PENDING</option>
              <option value="DRAFT">DRAFT</option>
            </select>
            <FiChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#1B4DA0] opacity-50 group-hover:opacity-100 transition-all pointer-events-none" />
          </div>
        </div>

        {/* Reports Table */}
        <div className="bg-white rounded-[32px] shadow-sm border border-[#F4F3EF] overflow-hidden flex flex-col">
          <div className="overflow-x-auto min-h-[400px] flex flex-col">
            {loading ? (
              <div className="flex-1 flex flex-col items-center justify-center py-20">
                <FiRefreshCw className="w-10 h-10 text-[#1B4DA0] animate-spin mb-4" />
                <p className="text-[#6B6B7E] font-medium">Mapping report database...</p>
              </div>
            ) : filteredReports.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center py-20 text-center px-8">
                <div className="w-20 h-20 bg-[#F4F3EF] rounded-full flex items-center justify-center mb-6 text-[#1B4DA0]">
                  <FiDatabase size={32} />
                </div>
                <h3 className="text-xl font-bold text-[#1A1A2E] mb-2">No records found</h3>
                <p className="text-[#6B6B7E] max-w-xs mx-auto mb-8">
                  {searchQuery ? `No reports match your search "${searchQuery}"` : "We couldn't find any deliverables in the database."}
                </p>
                <button
                  onClick={fetchData}
                  className="px-6 py-3 bg-[#1B4DA0] text-white rounded-xl font-bold text-sm hover:bg-[#153a7a] transition-all shadow-lg"
                >
                  Refresh Data
                </button>
              </div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#F4F3EF] bg-transparent">
                    <th className="pl-8 pr-4 py-4 w-10">
                      <div
                        className={`w-5 h-5 rounded-md border-2 flex items-center justify-center cursor-pointer transition-all ${selectedIds.length === filteredReports.length && filteredReports.length > 0
                            ? 'bg-[#1B4DA0] border-[#1B4DA0] text-white shadow-lg'
                            : 'bg-white border-[#E2E8F0] hover:border-gray-400'
                          }`}
                        onClick={() => {
                          if (selectedIds.length === filteredReports.length) {
                            setSelectedIds([]);
                          } else {
                            setSelectedIds(filteredReports.map(r => r.id || r._id));
                          }
                        }}
                      >
                        {selectedIds.length === filteredReports.length && filteredReports.length > 0 && <FiCheck size={14} strokeWidth={4} />}
                      </div>
                    </th>
                    <th className="px-8 py-4 text-[11px] font-bold text-[#94a3b8] uppercase tracking-widest text-left">Report Detail</th>
                    <th className="px-8 py-4 text-[11px] font-bold text-[#94a3b8] uppercase tracking-widest text-left">Client</th>
                    <th className="px-8 py-4 text-[11px] font-bold text-[#94a3b8] uppercase tracking-widest text-left">Date</th>
                    <th className="px-8 py-4 text-[11px] font-bold text-[#94a3b8] uppercase tracking-widest text-left">Status</th>
                    <th className="px-8 py-4"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F4F3EF]">
                  {filteredReports.map((report) => {
                    const reportId = report.id || report._id;
                    const isSelected = selectedIds.includes(reportId);
                    return (
                      <tr
                        key={reportId}
                        onClick={() => setSelectedReportDetail(report)}
                        className={`hover:bg-[#F8FAFF] transition-all group cursor-pointer ${isSelected ? 'bg-blue-50/50' : ''}`}
                      >
                        <td className="pl-8 pr-4 py-4">
                          <div
                            className={`w-5 h-5 rounded-md border-2 flex items-center justify-center cursor-pointer transition-all ${isSelected
                                ? 'bg-[#1B4DA0] border-[#1B4DA0] text-white'
                                : 'bg-white border-[#E2E8F0] hover:border-gray-400'
                              }`}
                            onClick={(e) => {
                              e.stopPropagation();
                              if (isSelected) {
                                setSelectedIds(prev => prev.filter(id => id !== reportId));
                              } else {
                                setSelectedIds(prev => [...prev, reportId]);
                              }
                            }}
                          >
                            {isSelected && <FiCheck size={14} strokeWidth={4} />}
                          </div>
                        </td>
                        <td className="px-8 py-4 text-left">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-slate-50 text-[#1B4DA0] border border-[#E2E8F0] rounded-xl flex items-center justify-center shrink-0 shadow-sm">
                              <FiFileText size={18} />
                            </div>
                            <div className="text-left">
                              <p className="text-[14px] font-bold text-[#1A1A2E]">{report.reportName}</p>
                              <p className="text-[10px] font-bold text-[#6B6B7E] uppercase tracking-widest mt-0.5">{report.reportNumber || 'REP-000'} • {report.size || 'N/A'}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-4 text-left">
                          <p className="text-[13px] font-bold text-[#1A1A2E]">{report.companyName || 'N/A'}</p>
                        </td>
                        <td className="px-8 py-4 text-left">
                          <p className="text-[12px] font-bold text-[#6B6B7E]">{new Date(report.createdAt).toDateString()}</p>
                        </td>
                        <td className="px-8 py-4 text-left">
                          <StatusDropdown
                            reportId={reportId}
                            currentStatus={report.status}
                            onChange={(val) => handleToggleStatus(report, val)}
                          />
                        </td>
                        <td className="px-8 py-4 text-right">
                          <FiChevronRight className="inline-block text-[#9B9BAD]" size={18} />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </motion.div>

      {/* Bulk Selection Bar */}
      {createPortal(
        <AnimatePresence>
          {selectedIds.length > 0 && (
            <motion.div
              initial={{ y: 100, x: '-50%', opacity: 0 }}
              animate={{ y: 0, x: '-50%', opacity: 1 }}
              exit={{ y: 100, x: '-50%', opacity: 0 }}
              className="fixed bottom-10 left-1/2 -translate-x-1/2 bg-[#1A1A2E] text-white px-8 py-5 rounded-[28px] shadow-2xl flex items-center gap-10 z-[1000] border border-white/10"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-blue-500 text-white rounded-xl flex items-center justify-center font-black text-sm">
                  {selectedIds.length}
                </div>
                <div>
                  <p className="text-xs font-black uppercase tracking-widest">Reports Selected</p>
                  <button
                    onClick={() => setSelectedIds([])}
                    className="text-[10px] font-bold text-red-400 hover:text-red-300 uppercase tracking-widest mt-0.5"
                  >
                    Deselect All
                  </button>
                </div>
              </div>

              <div className="h-10 w-[1px] bg-white/10" />

              <div className="flex items-center gap-4">
                <button
                  onClick={() => handleBulkStatusUpdate('VERIFIED')}
                  className="flex items-center gap-2 group px-4 py-2 rounded-2xl transition-all hover:bg-white/5 active:scale-95"
                >
                  <FiCheckCircle size={16} className="text-emerald-400 group-hover:text-white" />
                  <span className="text-[11px] font-bold uppercase tracking-widest">Mark Verified</span>
                </button>

                <button
                  onClick={() => handleBulkStatusUpdate('PENDING')}
                  className="flex items-center gap-2 group px-4 py-2 rounded-2xl transition-all hover:bg-white/5 active:scale-95"
                >
                  <FiClock size={16} className="text-amber-400 group-hover:text-white" />
                  <span className="text-[11px] font-bold uppercase tracking-widest">Mark Pending</span>
                </button>

                <button
                  onClick={handleBulkDelete}
                  className="flex items-center gap-2 group px-4 py-2 rounded-2xl transition-all hover:bg-white/5 active:scale-95"
                >
                  <FiTrash size={16} className="text-red-400 group-hover:text-white" />
                  <span className="text-[11px] font-bold uppercase tracking-widest">Delete</span>
                </button>
              </div>

              <button
                onClick={() => setSelectedIds([])}
                className="p-3 rounded-xl bg-white/5 hover:bg-white/10 hover:text-white transition-all text-[#9B9BAD]"
              >
                <FiX size={20} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}

      {/* Drawer for Report Details */}
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
                className="fixed inset-y-0 right-0 w-full max-w-[698px] bg-white shadow-2xl border-l border-[#F4F3EF] flex flex-col z-[200001] overflow-hidden"
              >
                {/* Drawer Header */}
                <div className="p-6 border-b border-[#F4F3EF] flex items-center justify-between bg-gradient-to-r from-blue-50/30 to-white">
                  <h3 className="text-xl font-bold text-[#1A1A2E]" style={{ fontFamily: "'Syne', sans-serif" }}>Report Portfolio</h3>
                  <div className="flex items-center gap-3">
                    {isEditingInDetail ? (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setIsEditingInDetail(false)}
                          className="px-4 py-2.5 rounded-xl text-xs font-bold text-[#6B6B7E] bg-[#F4F3EF] hover:bg-[#E8E7E2] transition-all"
                        >
                          Cancel
                        </button>
                        <button
                          disabled={isSavingDetail}
                          onClick={handleSaveReportDetails}
                          className="px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-[#1B4DA0] hover:bg-[#153D80] transition-all flex items-center gap-2 shadow-md shadow-blue-500/10"
                        >
                          {isSavingDetail ? <FiRefreshCw className="animate-spin w-3.5 h-3.5" /> : <FiCheck className="w-3.5 h-3.5" />}
                          {isSavingDetail ? 'Saving...' : 'Save Changes'}
                        </button>
                      </div>
                    ) : (
                      <>
                        <button
                          onClick={() => {
                            setEditableReport(selectedReportDetail);
                            setIsEditingInDetail(true);
                          }}
                          className="w-10 h-10 rounded-2xl flex items-center justify-center text-[#9B9BAD] hover:text-[#1B4DA0] hover:bg-blue-50 transition-all duration-300"
                          title="Edit Report"
                        >
                          <FiEdit2 size={18} />
                        </button>
                        <button
                          onClick={() => {
                            setReportToDelete(selectedReportDetail);
                            setIsDeleteModalOpen(true);
                          }}
                          className="w-10 h-10 rounded-2xl flex items-center justify-center text-[#9B9BAD] hover:text-red-500 hover:bg-red-50 transition-all duration-300"
                          title="Delete Report"
                        >
                          <FiTrash size={18} />
                        </button>
                        <button onClick={() => setSelectedReportDetail(null)} className="w-10 h-10 rounded-2xl flex items-center justify-center text-[#9B9BAD] hover:text-red-500 hover:bg-red-50 transition-all duration-300">
                          <FiX size={20} />
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* Drawer Content */}
                <div className="flex-1 overflow-y-auto px-10 py-8 space-y-10 custom-scrollbar text-left">

                  {/* Profile Header (Centered) */}
                  <div className="flex flex-col items-center text-center">
                    <div className="relative mb-6">
                      <div className={`w-24 h-24 rounded-[32px] bg-[#1B4DA0] flex items-center justify-center text-white text-3xl font-extrabold shadow-xl shadow-blue-500/20 overflow-hidden ${isEditingInDetail ? 'cursor-pointer hover:scale-105 transition-all' : ''}`}
                        style={{ background: 'linear-gradient(135deg, #1B4DA0 0%, #0D47A1 100%)' }}>
                        <FiFileText size={36} />
                      </div>
                    </div>
                    <div className="space-y-1.5 w-full flex flex-col items-center">
                      {isEditingInDetail ? (
                        <input
                          type="text"
                          className="w-full max-w-[320px] text-2xl font-bold text-[#1A1A2E] bg-[#FAFAF8] border-none rounded-2xl py-2 px-4 text-center focus:outline-none transition-all font-syne"
                          value={editableReport?.reportName || ''}
                          onChange={(e) => setEditableReport({ ...editableReport, reportName: e.target.value })}
                        />
                      ) : (
                        <h4 className="text-2xl font-bold text-[#1A1A2E] tracking-tight font-syne">{selectedReportDetail.reportName}</h4>
                      )}

                      <p className="text-[11px] font-bold text-[#0D47A1] uppercase tracking-[3px]">{selectedReportDetail.reportNumber || 'REP-000'}</p>
                    </div>
                  </div>

                  {/* Information Grid */}
                  <div className="bg-[#FAFAF8] rounded-[32px] border border-[#F4F3EF] p-8 space-y-10 shadow-sm">

                    {/* Report Identity */}
                    <div className="space-y-6">
                      <div className="flex items-center gap-3 border-b border-[#F4F3EF] pb-4">
                        <FiBriefcase className="text-[#1B4DA0]" size={18} />
                        <h5 className="text-[12px] font-black text-[#1A1A2E] uppercase tracking-wider">Report Details</h5>
                      </div>
                      <div className="grid grid-cols-2 gap-x-8 gap-y-6">
                        <InfoItem
                          label="Client Name"
                          value={isEditingInDetail ? editableReport?.companyName : selectedReportDetail.companyName}
                          isEditing={isEditingInDetail}
                          onChange={(val) => setEditableReport({ ...editableReport, companyName: val })}
                        />
                        <InfoItem
                          label="Status"
                          value={isEditingInDetail ? editableReport?.status : selectedReportDetail.status}
                          isEditing={isEditingInDetail}
                          onChange={(val) => setEditableReport({ ...editableReport, status: val })}
                        />
                        <InfoItem
                          label="Size"
                          value={isEditingInDetail ? editableReport?.size : selectedReportDetail.size}
                          isEditing={isEditingInDetail}
                          onChange={(val) => setEditableReport({ ...editableReport, size: val })}
                        />
                        <InfoItem
                          label="Created At"
                          value={new Date(isEditingInDetail ? editableReport?.createdAt : selectedReportDetail.createdAt).toDateString()}
                          isEditing={false}
                        />
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

      {/* Delete Confirmation Modal */}
      {createPortal(
        <AnimatePresence>
          {isDeleteModalOpen && (
            <React.Fragment>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-[#1A1A2E]/60 backdrop-blur-xl z-[400000]"
                onClick={() => setIsDeleteModalOpen(false)}
              />
              <div className="fixed inset-0 flex items-center justify-center z-[400001] p-4">
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 20 }}
                  className="w-full max-w-md bg-white rounded-[40px] shadow-2xl p-10 text-center border border-[#F4F3EF]"
                >
                  <div className="w-20 h-20 bg-red-50 rounded-3xl flex items-center justify-center text-red-500 mx-auto mb-6 shadow-sm">
                    <FiTrash size={36} />
                  </div>
                  <h3 className="text-2xl font-bold text-[#1A1A2E] mb-2 font-syne">Delete Report?</h3>
                  <p className="text-sm text-[#6B6B7E] mb-8 leading-relaxed">
                    Are you sure you want to delete <span className="font-bold text-[#1A1A2E]">{reportToDelete?.reportName}</span>? This action cannot be undone.
                  </p>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      onClick={() => setIsDeleteModalOpen(false)}
                      className="py-4 bg-[#F8FAFC] border border-[#F4F3EF] rounded-2xl text-[11px] font-black uppercase tracking-widest text-[#1A1A2E] hover:bg-gray-50 transition-all"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleDeleteConfirm}
                      className="py-4 bg-red-500 rounded-2xl text-[11px] font-black uppercase tracking-widest text-white hover:bg-red-600 transition-all shadow-lg shadow-red-500/20"
                    >
                      Delete Forever
                    </button>
                  </div>
                </motion.div>
              </div>
            </React.Fragment>
          )}
        </AnimatePresence>,
        document.body
      )}

      {/* Create Report Modal */}
      {createPortal(
        <CreateReportModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          clients={clients}
          onSuccess={fetchData}
        />,
        document.body
      )}

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #E5E7EB; border-radius: 20px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #D1D5DB; }
      `}</style>
    </>
  );
};

export default ClientReportingTab;
