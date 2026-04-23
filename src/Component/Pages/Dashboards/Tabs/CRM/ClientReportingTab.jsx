import React, { useState, lazy, Suspense } from 'react';
import { motion } from 'framer-motion';
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
  Filter
} from 'lucide-react';
import { Bar } from 'react-chartjs-2';

const ClientReportingTab = ({ clients = [] }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const stats = [
    { label: 'Reports Shared', value: '124', icon: FileText, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Pending Review', value: '08', icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: 'Avg. Accuracy', value: '98.5%', icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Active Schedules', value: '42', icon: Calendar, color: 'text-indigo-600', bg: 'bg-indigo-50' },
  ];

  const recentReports = [
    { id: 'R-2024-001', client: 'TechNova Solutions', type: 'Monthly Performance', date: '2024-03-20', status: 'Verified', size: '2.4 MB' },
    { id: 'R-2024-002', client: 'Global Retail Corp', type: 'Strategy Review', date: '2024-03-18', status: 'Pending', size: '1.8 MB' },
    { id: 'R-2024-003', client: 'Zenith Manufacturing', type: 'Audit Sync', date: '2024-03-15', status: 'Verified', size: '3.1 MB' },
    { id: 'R-2024-004', client: 'BlueSky Logistics', type: 'Quarterly Analysis', date: '2024-03-12', status: 'Draft', size: '4.2 MB' },
    { id: 'R-2024-005', client: 'Evergreen Wellness', type: 'Onboarding Report', date: '2024-03-10', status: 'Verified', size: '1.2 MB' },
  ];

  const chartData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Reports Generated',
        data: [45, 52, 63, 48, 70, 85],
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
        <button className="flex items-center justify-center gap-3 px-8 py-4 bg-[#1B4DA0] text-white rounded-2xl text-[11px] font-black uppercase tracking-[2px] shadow-xl shadow-blue-500/20 hover:scale-[1.02] active:scale-95 transition-all">
          <Plus size={16} strokeWidth={3} />
          Generate New Report
        </button>
      </div>

      {/* KPI Stats */}


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
                placeholder="Search reports..."
                className="bg-transparent border-none outline-none text-xs font-bold text-[#1A1A2E] w-full placeholder:text-[#9B9BAD]/50"
              />
            </div>
          </div>

          <div className="overflow-x-auto -mx-8">
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
                {recentReports.map((report, idx) => (
                  <motion.tr
                    key={idx}
                    whileHover={{ backgroundColor: '#FDFDFD' }}
                    className="group"
                  >
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-slate-50 text-[#6B6B7E] rounded-xl flex items-center justify-center shrink-0">
                          <FileText size={18} />
                        </div>
                        <div className="text-left">
                          <p className="text-[13px] font-black text-[#1A1A2E]">{report.type}</p>
                          <p className="text-[10px] font-bold text-[#9B9BAD] uppercase tracking-widest mt-0.5">{report.id} • {report.size}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <p className="text-[12px] font-bold text-[#6B6B7E]">{report.client}</p>
                      <p className="text-[10px] font-bold text-[#9B9BAD] uppercase mt-0.5">{report.date}</p>
                    </td>
                    <td className="px-6 py-5">
                      <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full ${report.status === 'Verified' ? 'bg-emerald-50 text-emerald-600' :
                        report.status === 'Pending' ? 'bg-amber-50 text-amber-600' : 'bg-slate-100 text-[#9B9BAD]'
                        }`}>
                        {report.status === 'Verified' ? <CheckCircle size={10} /> : <Clock size={10} />}
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
          </div>

          <button className="mt-6 w-full py-4 border-2 border-dashed border-[#F4F3EF] rounded-2xl text-[10px] font-black text-[#9B9BAD] uppercase tracking-[3px] hover:border-[#1B4DA0] hover:text-[#1B4DA0] hover:bg-blue-50/20 transition-all">
            View Archive Records
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default ClientReportingTab;
