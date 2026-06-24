import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, Briefcase, CheckCircle, TrendingUp, Calendar, Filter, Plus, Search } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import ModernSidebar from '../../Utilities/ModernSidebar';

const ModernRecruitmentHeadDashboard = () => {
  const [dateFilter, setDateFilter] = useState(new Date().toISOString().split('T')[0]);
  const [collapsed, setCollapsed] = useState(false);

  const stats = [
    { label: 'Total Positions', value: '12', icon: Briefcase, color: 'bg-blue-50 text-blue-600', borderColor: 'border-blue-200' },
    { label: 'Active Candidates', value: '285', icon: Users, color: 'bg-green-50 text-green-600', borderColor: 'border-green-200' },
    { label: 'Interviews Scheduled', value: '23', icon: Calendar, color: 'bg-purple-50 text-purple-600', borderColor: 'border-purple-200' },
    { label: 'Offers Extended', value: '8', icon: CheckCircle, color: 'bg-orange-50 text-orange-600', borderColor: 'border-orange-200' },
  ];

  const pipelineData = [
    { stage: 'Applied', count: 85, color: '#3b82f6' },
    { stage: 'Screening', count: 62, color: '#8b5cf6' },
    { stage: 'Interview', count: 38, color: '#ec4899' },
    { stage: 'Offer', count: 15, color: '#f59e0b' },
    { stage: 'Hired', count: 8, color: '#10b981' },
  ];

  const trendData = [
    { month: 'Jan', applications: 45, interviews: 12, hires: 3 },
    { month: 'Feb', applications: 62, interviews: 18, hires: 5 },
    { month: 'Mar', applications: 78, interviews: 25, hires: 8 },
    { month: 'Apr', applications: 92, interviews: 28, hires: 10 },
  ];

  const recentCandidates = [
    { id: 1, name: 'John Doe', position: 'Senior Developer', stage: 'Interview', date: '2026-04-03' },
    { id: 2, name: 'Sarah Ahmed', position: 'Product Manager', stage: 'Offer', date: '2026-04-02' },
    { id: 3, name: 'Mike Johnson', position: 'UI/UX Designer', stage: 'Screening', date: '2026-04-01' },
    { id: 4, name: 'Emma Wilson', position: 'Data Scientist', stage: 'Applied', date: '2026-03-31' },
    { id: 5, name: 'Alex Kumar', position: 'DevOps Engineer', stage: 'Interview', date: '2026-03-30' },
  ];

  const StatCard = ({ icon: Icon, label, value, color, borderColor }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      className={`${color} border ${borderColor} rounded-2xl p-6 backdrop-blur-sm`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium opacity-75 mb-2">{label}</p>
          <p className="text-4xl font-bold">{value}</p>
        </div>
        <Icon size={40} className="opacity-20" />
      </div>
    </motion.div>
  );

  const StageChip = ({ stage }) => {
    const stageColors = {
      'Applied': 'bg-blue-100 text-blue-700',
      'Screening': 'bg-purple-100 text-purple-700',
      'Interview': 'bg-pink-100 text-pink-700',
      'Offer': 'bg-amber-100 text-amber-700',
      'Hired': 'bg-emerald-100 text-emerald-700'
    };
    return <span className={`px-3 py-1 rounded-full text-sm font-medium ${stageColors[stage] || 'bg-gray-100'}`}>{stage}</span>;
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Modern Sidebar */}
      <ModernSidebar role="recruitmentHead" />

      {/* Main Content */}
      <main className="flex-1 md:ml-0 p-8 overflow-auto">
        {/* Header */}
        <div className="mb-12">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <h1 className="text-5xl font-bold text-gray-900 mb-2">Recruitment Dashboard</h1>
            <p className="text-lg text-gray-600">Manage your hiring pipeline and track recruitment metrics</p>
          </motion.div>
        </div>

        {/* Action Bar */}
        <div className="flex gap-4 mb-8 flex-wrap">
          <div className="flex-1 min-w-[250px] relative">
            <Search className="absolute left-4 top-3.5 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search candidates, positions..."
              className="w-full pl-12 pr-4 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="px-4 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button className="bg-blue-600 text-white px-6 py-2.5 rounded-lg hover:bg-blue-700 transition-all flex items-center gap-2 font-medium">
            <Plus size={20} /> New Position
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {stats.map((stat, idx) => (
            <StatCard key={idx} {...stat} />
          ))}
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {/* Pipeline Distribution */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-lg p-8 col-span-1"
          >
            <h3 className="text-xl font-bold text-gray-900 mb-6">Pipeline Distribution</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pipelineData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  dataKey="count"
                >
                  {pipelineData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-6 space-y-2">
              {pipelineData.map((stage, idx) => (
                <div key={idx} className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">{stage.stage}</span>
                  <span className="font-semibold text-gray-900">{stage.count}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Trends */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl shadow-lg p-8 col-span-2"
          >
            <h3 className="text-xl font-bold text-gray-900 mb-6">Recruitment Trends</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="applications" stroke="#3b82f6" strokeWidth={2} dot={{ fill: '#3b82f6', r: 5 }} />
                <Line type="monotone" dataKey="interviews" stroke="#8b5cf6" strokeWidth={2} dot={{ fill: '#8b5cf6', r: 5 }} />
                <Line type="monotone" dataKey="hires" stroke="#10b981" strokeWidth={2} dot={{ fill: '#10b981', r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
          </motion.div>
        </div>

        {/* Recent Candidates Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl shadow-lg p-8"
        >
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-gray-900">Recent Candidates</h3>
            <button className="text-blue-600 hover:text-blue-700 font-medium text-sm">View All →</button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-gray-200">
                  <th className="text-left py-4 px-4 text-sm font-semibold text-gray-600">Name</th>
                  <th className="text-left py-4 px-4 text-sm font-semibold text-gray-600">Position</th>
                  <th className="text-left py-4 px-4 text-sm font-semibold text-gray-600">Stage</th>
                  <th className="text-left py-4 px-4 text-sm font-semibold text-gray-600">Date</th>
                  <th className="text-left py-4 px-4 text-sm font-semibold text-gray-600">Action</th>
                </tr>
              </thead>
              <tbody>
                {recentCandidates.map((candidate, idx) => (
                  <motion.tr
                    key={idx}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: idx * 0.05 }}
                    className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                  >
                    <td className="py-4 px-4 font-medium text-gray-900">{candidate.name}</td>
                    <td className="py-4 px-4 text-gray-600">{candidate.position}</td>
                    <td className="py-4 px-4"><StageChip stage={candidate.stage} /></td>
                    <td className="py-4 px-4 text-gray-500 text-sm">{candidate.date}</td>
                    <td className="py-4 px-4">
                      <button className="text-blue-600 hover:text-blue-700 font-medium text-sm">View</button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default ModernRecruitmentHeadDashboard;
