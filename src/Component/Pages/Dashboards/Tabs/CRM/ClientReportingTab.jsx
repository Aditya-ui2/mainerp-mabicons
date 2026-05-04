import React, { useState, useEffect } from 'react';
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText,
  Download,
  Eye,
  Plus,
  Search,
  CheckCircle,
  Clock,
  TrendingUp,
  Calendar,
  MoreVertical,
  ArrowRight,
  Mail,
  Filter,
  RefreshCw,
  X
} from 'lucide-react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { getClientReports, seedReports, createReport } from '../../../service/api';
import { toast } from 'react-hot-toast';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

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
                <X size={20} />
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
                    <option key={c.id} value={c.id}>{c.companyName || c.name}</option>
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

const ClientReportingTab = ({ clients = [] }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [reports, setReports] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await getClientReports();
      if (res.success) {
        setReports(res.data);

        // Auto-seed if empty
        if (res.data.length === 0) {
          await seedReports();
          const res2 = await getClientReports();
          if (res2.success) setReports(res2.data);
        }
      }
    } catch (error) {
      toast.error("Failed to load reports");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const stats = [
    { label: 'Reports Shared', value: reports.length, icon: FileText, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Pending Review', value: reports.filter(r => r.status === 'PENDING').length, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: 'Verified', value: reports.filter(r => r.status === 'VERIFIED').length, icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Active Drafts', value: reports.filter(r => r.status === 'DRAFT').length, icon: FileText, color: 'text-indigo-600', bg: 'bg-indigo-50' },
  ];

  const filteredReports = reports.filter(r =>
    (r.reportName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (r.companyName || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const chartData = {
    labels: (() => {
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const result = [];
      const now = new Date();
      for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        result.push(months[d.getMonth()]);
      }
      return result;
    })(),
    datasets: [
      {
        label: 'Reports Generated',
        data: (() => {
          const counts = [0, 0, 0, 0, 0, 0];
          const now = new Date();
          const currentMonth = now.getMonth();
          const currentYear = now.getFullYear();

          reports.forEach(report => {
            const date = new Date(report.createdAt);
            const reportMonth = date.getMonth();
            const reportYear = date.getFullYear();

            // Calculate month difference
            const diff = (currentYear - reportYear) * 12 + (currentMonth - reportMonth);
            if (diff >= 0 && diff < 6) {
              counts[5 - diff]++;
            }
          });
          return counts;
        })(),
        backgroundColor: '#1B4DA0',
        borderRadius: 12,
        barThickness: 20,
      }
    ]
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8 p-1 text-left"
    >
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-[#1A1A2E] tracking-tight" style={{ fontFamily: "'Syne', sans-serif" }}>Client Performance Reports</h1>
        </div>
        <div className="flex gap-4">

          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center justify-center gap-3 px-8 py-4 bg-[#1B4DA0] text-white rounded-2xl text-[11px] font-black uppercase tracking-[2px] shadow-xl shadow-blue-500/20 hover:scale-[1.02] active:scale-95 transition-all"
          >
            <Plus size={16} strokeWidth={3} />
            Generate New Report
          </button>
        </div>
      </div>



      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Chart Section */}
        <div className="lg:col-span-1 bg-white p-8 rounded-[40px] border border-[#F4F3EF] shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-lg font-black text-[#1A1A2E]">Activity Trends</h3>
              <p className="text-[10px] font-bold text-[#9B9BAD] uppercase tracking-widest mt-1">Monthly report volume</p>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-600 rounded-full">
              <TrendingUp size={12} />
              <span className="text-[10px] font-black">+24%</span>
            </div>
          </div>
          <div className="flex-1 h-64">
            <Bar
              data={chartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                  x: { grid: { display: false }, ticks: { font: { size: 10, weight: '700' }, color: '#9B9BAD' } },
                  y: { grid: { color: '#F8F9FA' }, ticks: { font: { size: 10, weight: '700' }, color: '#9B9BAD' } }
                }
              }}
            />
          </div>
        </div>

        {/* Recent Reports List */}
        <div className="lg:col-span-2 bg-white p-8 rounded-[40px] border border-[#F4F3EF] shadow-sm overflow-hidden flex flex-col">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-8">
            <div>
              <h3 className="text-lg font-black text-[#1A1A2E]">Recent Deliverables</h3>
              <p className="text-[10px] font-bold text-[#9B9BAD] uppercase tracking-widest mt-1">Last 30 days activity</p>
            </div>
            <div className="flex items-center gap-3 bg-[#F8FAFC] rounded-2xl px-5 py-3 border border-[#F1F5F9] w-full sm:w-64">
              <Search size={16} className="text-[#9B9BAD]" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search reports..."
                className="bg-transparent border-none outline-none text-xs font-bold text-[#1A1A2E] w-full placeholder:text-[#9B9BAD]/50"
              />
            </div>
          </div>

          <div className="overflow-x-auto -mx-8 min-h-[300px]">
            {loading ? (
              <div className="py-20 text-center">
                <RefreshCw className="w-8 h-8 text-[#1B4DA0] animate-spin mx-auto mb-4" />
                <p className="text-[11px] font-black text-[#9B9BAD] uppercase tracking-[3px]">Mapping report database...</p>
              </div>
            ) : filteredReports.length === 0 ? (
              <div className="py-20 text-center">
                <p className="text-[11px] font-black text-[#9B9BAD] uppercase tracking-[3px]">No records found</p>
              </div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#F4F3EF]">
                    <th className="px-8 py-4 text-left text-[10px] font-black text-[#9B9BAD] uppercase tracking-widest">Report Detail</th>
                    <th className="px-6 py-4 text-left text-[10px] font-black text-[#9B9BAD] uppercase tracking-widest">Client</th>
                    <th className="px-6 py-4 text-left text-[10px] font-black text-[#9B9BAD] uppercase tracking-widest">Status</th>
                    <th className="px-8 py-4 text-right text-[10px] font-black text-[#9B9BAD] uppercase tracking-widest">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F8FAFC]">
                  {filteredReports.map((report, idx) => (
                    <motion.tr
                      key={idx}
                      whileHover={{ backgroundColor: '#FDFDFD' }}
                      className="group"
                    >
                      <td className="px-8 py-5 text-left">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-slate-50 text-[#6B6B7E] rounded-xl flex items-center justify-center shrink-0">
                            <FileText size={18} />
                          </div>
                          <div className="text-left">
                            <p className="text-[13px] font-black text-[#1A1A2E]">{report.reportName}</p>
                            <p className="text-[10px] font-bold text-[#9B9BAD] uppercase tracking-widest mt-0.5">{report.reportNumber} • {report.size}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5 text-left">
                        <p className="text-[12px] font-bold text-[#6B6B7E]">{report.companyName}</p>
                        <p className="text-[10px] font-bold text-[#9B9BAD] uppercase mt-0.5">{new Date(report.createdAt).toDateString()}</p>
                      </td>
                      <td className="px-6 py-5 text-left">
                        <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full ${report.status === 'VERIFIED' ? 'bg-emerald-50 text-emerald-600' :
                          report.status === 'PENDING' ? 'bg-amber-50 text-amber-600' : 'bg-slate-100 text-[#9B9BAD]'
                          }`}>
                          {report.status === 'VERIFIED' ? <CheckCircle size={10} /> : <Clock size={10} />}
                          <span className="text-[9px] font-black uppercase tracking-wider">{report.status}</span>
                        </div>
                      </td>
                      <td className="px-8 py-5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button className="p-2 text-[#9B9BAD] hover:text-[#1B4DA0] hover:bg-blue-50 rounded-lg transition-all" title="View">
                            <Eye size={16} />
                          </button>
                          <button className="p-2 text-[#9B9BAD] hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all" title="Download">
                            <Download size={16} />
                          </button>
                          <button className="p-2 text-[#9B9BAD] hover:text-[#1A1A2E] hover:bg-slate-100 rounded-lg transition-all">
                            <MoreVertical size={16} />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          <button className="mt-6 w-full py-4 border-2 border-dashed border-[#F4F3EF] rounded-2xl text-[10px] font-black text-[#9B9BAD] uppercase tracking-[3px] hover:border-[#1B4DA0] hover:text-[#1B4DA0] hover:bg-blue-50/20 transition-all">
            View Archive Records
          </button>
        </div>
      </div>

      {createPortal(
        <CreateReportModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          clients={clients}
          onSuccess={fetchData}
        />,
        document.body
      )}
    </motion.div>
  );
};

export default ClientReportingTab;
