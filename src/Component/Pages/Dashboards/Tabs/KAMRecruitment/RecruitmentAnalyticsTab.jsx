import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiTrendingUp,
  FiTrendingDown,
  FiUsers,
  FiClock,
  FiTarget,
  FiBriefcase,
  FiCheckCircle,
  FiCalendar,
  FiBarChart2,
  FiPieChart,
  FiActivity,
  FiAward,
  FiDollarSign,
  FiChevronDown,
  FiFilter,
  FiRefreshCw,
} from 'react-icons/fi';

/* ── Trend Indicator ── */
const TrendBadge = ({ value, isPositive }) => {
  const Icon = isPositive ? FiTrendingUp : FiTrendingDown;
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-semibold ${isPositive ? 'text-emerald-500' : 'text-red-500'}`}>
      <Icon className="w-3.5 h-3.5" />
      {value}%
    </span>
  );
};

/* ── Progress Ring ── */
const ProgressRing = ({ percentage, size = 80, strokeWidth = 8, gradient }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg className="transform -rotate-90" width={size} height={size}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="none"
          className="text-slate-200 dark:text-slate-700"
        />
        <motion.circle
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.5, ease: 'easeOut' }}
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={`url(#${gradient})`}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          fill="none"
          strokeDasharray={circumference}
        />
        <defs>
          <linearGradient id="ring-violet" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#8b5cf6" />
            <stop offset="100%" stopColor="#a855f7" />
          </linearGradient>
          <linearGradient id="ring-emerald" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#10b981" />
            <stop offset="100%" stopColor="#14b8a6" />
          </linearGradient>
          <linearGradient id="ring-blue" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#3b82f6" />
            <stop offset="100%" stopColor="#6366f1" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-xl font-bold">{percentage}%</span>
      </div>
    </div>
  );
};

/* ══════════════════════════════════════════════════════ */
const RecruitmentAnalyticsTab = ({ isDarkMode }) => {
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('this-month');
  const [analytics, setAnalytics] = useState(null);

  // Mock analytics data
  useEffect(() => {
    const mockData = {
      summary: {
        totalOpenings: 28,
        openingsTrend: 12,
        activeOpenings: 18,
        totalApplications: 342,
        applicationsTrend: 24,
        hiredThisMonth: 8,
        hiredTrend: -5,
        avgTimeToHire: 22,
        timeTrend: -8,
      },
      funnelMetrics: {
        applied: 342,
        screened: 186,
        interviewed: 94,
        offered: 28,
        hired: 8,
      },
      sourceAnalysis: [
        { source: 'LinkedIn', count: 142, conversion: 32 },
        { source: 'Naukri', count: 98, conversion: 28 },
        { source: 'Employee Referral', count: 56, conversion: 45 },
        { source: 'Website', count: 32, conversion: 18 },
        { source: 'Campus', count: 14, conversion: 55 },
      ],
      positionMetrics: [
        { position: 'Software Engineer', openings: 8, filled: 3, avgDays: 18 },
        { position: 'Product Manager', openings: 4, filled: 2, avgDays: 28 },
        { position: 'UI/UX Designer', openings: 3, filled: 1, avgDays: 22 },
        { position: 'DevOps Engineer', openings: 5, filled: 2, avgDays: 20 },
        { position: 'Data Analyst', openings: 6, filled: 0, avgDays: 0 },
      ],
      clientMetrics: [
        { client: 'TechCorp India', openings: 12, filled: 4, satisfaction: 92 },
        { client: 'StartupXYZ', openings: 6, filled: 2, satisfaction: 88 },
        { client: 'CloudScale', openings: 4, filled: 1, satisfaction: 95 },
        { client: 'DesignHub', openings: 3, filled: 1, satisfaction: 85 },
        { client: 'DataMinds', openings: 3, filled: 0, satisfaction: 78 },
      ],
      monthlyTrend: [
        { month: 'Oct', hired: 6, target: 8 },
        { month: 'Nov', hired: 9, target: 10 },
        { month: 'Dec', hired: 5, target: 6 },
        { month: 'Jan', hired: 7, target: 8 },
        { month: 'Feb', hired: 10, target: 10 },
        { month: 'Mar', hired: 8, target: 12 },
      ],
    };
    setTimeout(() => {
      setAnalytics(mockData);
      setLoading(false);
    }, 600);
  }, []);

  const statCards = analytics ? [
    { label: 'Total Openings', value: analytics.summary.totalOpenings, trend: analytics.summary.openingsTrend, isPositive: true, icon: FiBriefcase, bgColor: '#8b5cf6', bgGradient: 'linear-gradient(135deg, #8b5cf6, #7c3aed)', shadowColor: '139, 92, 246' },
    { label: 'Applications', value: analytics.summary.totalApplications, trend: analytics.summary.applicationsTrend, isPositive: true, icon: FiUsers, bgColor: '#3b82f6', bgGradient: 'linear-gradient(135deg, #3b82f6, #4f46e5)', shadowColor: '59, 130, 246' },
    { label: 'Hired This Month', value: analytics.summary.hiredThisMonth, trend: Math.abs(analytics.summary.hiredTrend), isPositive: analytics.summary.hiredTrend >= 0, icon: FiCheckCircle, bgColor: '#10b981', bgGradient: 'linear-gradient(135deg, #10b981, #0d9488)', shadowColor: '16, 185, 129' },
    { label: 'Avg Time-to-Hire', value: `${analytics.summary.avgTimeToHire}d`, trend: Math.abs(analytics.summary.timeTrend), isPositive: analytics.summary.timeTrend < 0, icon: FiClock, bgColor: '#f59e0b', bgGradient: 'linear-gradient(135deg, #f59e0b, #ea580c)', shadowColor: '245, 158, 11' },
  ] : [];

  // Skeleton loader
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div className="space-y-2">
            <div className={`h-8 w-64 rounded-lg animate-pulse ${isDarkMode ? 'bg-slate-700' : 'bg-slate-200'}`}></div>
            <div className={`h-4 w-40 rounded-lg animate-pulse ${isDarkMode ? 'bg-slate-700' : 'bg-slate-200'}`}></div>
          </div>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className={`h-28 rounded-2xl animate-pulse ${isDarkMode ? 'bg-slate-800' : 'bg-slate-200'}`}></div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {[1, 2].map(i => (
            <div key={i} className={`h-64 rounded-2xl animate-pulse ${isDarkMode ? 'bg-slate-800' : 'bg-slate-200'}`}></div>
          ))}
        </div>
      </div>
    );
  }

  const maxFunnel = analytics.funnelMetrics.applied;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center md:justify-between gap-4"
      >
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl" style={{ background: 'linear-gradient(135deg, #6366f1, #9333ea)', boxShadow: '0 10px 15px -3px rgba(99, 102, 241, 0.25)' }}>
            <FiBarChart2 className="w-6 h-6" style={{ color: 'white' }} />
          </div>
          <div>
            <h2 className="text-2xl font-bold" style={{ background: 'linear-gradient(90deg, #4f46e5, #9333ea)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Recruitment Analytics
            </h2>
            <p className={`text-sm mt-0.5 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              Performance metrics & insights
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className={`appearance-none pl-4 pr-10 py-2.5 rounded-xl text-sm font-medium border-2 ${isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-700'}`}
            >
              <option value="this-week">This Week</option>
              <option value="this-month">This Month</option>
              <option value="last-month">Last Month</option>
              <option value="this-quarter">This Quarter</option>
              <option value="this-year">This Year</option>
            </select>
            <FiChevronDown className={`absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`} />
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`p-2.5 rounded-xl ${isDarkMode ? 'bg-slate-700 text-slate-300 hover:bg-slate-600' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
          >
            <FiRefreshCw className="w-4 h-4" />
          </motion.button>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            whileHover={{ scale: 1.02, y: -2 }}
            className={`relative overflow-hidden rounded-2xl p-5 ${isDarkMode ? 'bg-slate-800/80 border border-slate-700/50' : 'bg-white border border-slate-200/50 shadow-lg'}`}
            style={{ boxShadow: `0 10px 15px -3px rgba(${card.shadowColor}, 0.15)` }}
          >
            <div className="absolute -right-4 -top-4 w-24 h-24 opacity-10">
              <div className="w-full h-full rounded-full" style={{ background: card.bgGradient }}></div>
            </div>
            <div className="relative flex items-start justify-between">
              <div>
                <p className={`text-xs font-medium uppercase tracking-wider ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                  {card.label}
                </p>
                <p className="text-3xl font-extrabold mt-1" style={{ background: card.bgGradient, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                  {card.value}
                </p>
                <TrendBadge value={card.trend} isPositive={card.isPositive} />
              </div>
              <div className="p-3 rounded-xl" style={{ background: card.bgGradient, boxShadow: `0 10px 15px -3px rgba(${card.shadowColor}, 0.3)` }}>
                <card.icon className="w-5 h-5" style={{ color: 'white' }} />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Main Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recruitment Funnel */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className={`rounded-2xl border-2 p-6 ${isDarkMode ? 'bg-slate-800/80 border-slate-700/50' : 'bg-white border-slate-200/50 shadow-lg'}`}
        >
          <div className="flex items-center gap-2 mb-6">
            <FiActivity className={`w-5 h-5 ${isDarkMode ? 'text-violet-400' : 'text-violet-600'}`} />
            <h3 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>Recruitment Funnel</h3>
          </div>
          <div className="space-y-4">
            {Object.entries(analytics.funnelMetrics).map(([stage, count], i) => {
              const percentage = Math.round((count / maxFunnel) * 100);
              const labels = { applied: 'Applied', screened: 'Screened', interviewed: 'Interviewed', offered: 'Offered', hired: 'Hired' };
              const colors = ['from-blue-500 to-indigo-600', 'from-violet-500 to-purple-600', 'from-fuchsia-500 to-pink-600', 'from-amber-500 to-orange-600', 'from-emerald-500 to-teal-600'];
              return (
                <div key={stage}>
                  <div className="flex justify-between mb-1.5">
                    <span className={`text-sm font-medium ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>{labels[stage]}</span>
                    <span className={`text-sm font-bold ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>{count}</span>
                  </div>
                  <div className={`h-3 rounded-full overflow-hidden ${isDarkMode ? 'bg-slate-700' : 'bg-slate-200'}`}>
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${percentage}%` }}
                      transition={{ duration: 1, delay: i * 0.15 }}
                      className={`h-full rounded-full bg-gradient-to-r ${colors[i]}`}
                    />
                  </div>
                </div>
              );
            })}
          </div>
          <div className={`mt-6 pt-4 border-t ${isDarkMode ? 'border-slate-700' : 'border-slate-200'}`}>
            <div className="flex justify-between text-sm">
              <span className={isDarkMode ? 'text-slate-400' : 'text-slate-500'}>Overall Conversion</span>
              <span className="font-bold text-emerald-500">{Math.round((analytics.funnelMetrics.hired / analytics.funnelMetrics.applied) * 100)}%</span>
            </div>
          </div>
        </motion.div>

        {/* Source Analysis */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className={`rounded-2xl border-2 p-6 ${isDarkMode ? 'bg-slate-800/80 border-slate-700/50' : 'bg-white border-slate-200/50 shadow-lg'}`}
        >
          <div className="flex items-center gap-2 mb-6">
            <FiPieChart className={`w-5 h-5 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />
            <h3 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>Source Analysis</h3>
          </div>
          <div className="space-y-4">
            {analytics.sourceAnalysis.map((src, i) => {
              const colors = ['from-blue-500 to-indigo-600', 'from-emerald-500 to-teal-600', 'from-violet-500 to-purple-600', 'from-amber-500 to-orange-600', 'from-rose-500 to-pink-600'];
              return (
                <div key={src.source} className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${colors[i]} flex items-center justify-center text-white text-xs font-bold shadow-lg`}>
                    {src.source.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between mb-1">
                      <span className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-slate-700'}`}>{src.source}</span>
                      <span className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>{src.count} candidates</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className={`flex-1 h-2 rounded-full overflow-hidden ${isDarkMode ? 'bg-slate-700' : 'bg-slate-200'}`}>
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${src.conversion}%` }}
                          transition={{ duration: 1, delay: i * 0.1 }}
                          className={`h-full rounded-full bg-gradient-to-r ${colors[i]}`}
                        />
                      </div>
                      <span className={`text-xs font-semibold ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>{src.conversion}%</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Position Metrics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className={`rounded-2xl border-2 p-6 ${isDarkMode ? 'bg-slate-800/80 border-slate-700/50' : 'bg-white border-slate-200/50 shadow-lg'}`}
        >
          <div className="flex items-center gap-2 mb-6">
            <FiBriefcase className={`w-5 h-5 ${isDarkMode ? 'text-amber-400' : 'text-amber-600'}`} />
            <h3 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>By Position</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className={isDarkMode ? 'text-slate-400' : 'text-slate-500'}>
                  <th className="text-left font-medium pb-3">Position</th>
                  <th className="text-center font-medium pb-3">Open</th>
                  <th className="text-center font-medium pb-3">Filled</th>
                  <th className="text-center font-medium pb-3">Avg Days</th>
                </tr>
              </thead>
              <tbody>
                {analytics.positionMetrics.map((pos, i) => (
                  <motion.tr
                    key={pos.position}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 + i * 0.1 }}
                    className={`border-t ${isDarkMode ? 'border-slate-700' : 'border-slate-200'}`}
                  >
                    <td className={`py-3 font-medium ${isDarkMode ? 'text-white' : 'text-slate-700'}`}>{pos.position}</td>
                    <td className="text-center py-3">{pos.openings}</td>
                    <td className="text-center py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${pos.filled > 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                        {pos.filled}
                      </span>
                    </td>
                    <td className="text-center py-3">
                      {pos.avgDays > 0 ? `${pos.avgDays}d` : '—'}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Client Satisfaction */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className={`rounded-2xl border-2 p-6 ${isDarkMode ? 'bg-slate-800/80 border-slate-700/50' : 'bg-white border-slate-200/50 shadow-lg'}`}
        >
          <div className="flex items-center gap-2 mb-6">
            <FiAward className={`w-5 h-5 ${isDarkMode ? 'text-emerald-400' : 'text-emerald-600'}`} />
            <h3 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>Client Performance</h3>
          </div>
          <div className="space-y-4">
            {analytics.clientMetrics.map((client, i) => (
              <div key={client.client} className="flex items-center justify-between">
                <div className="flex-1">
                  <p className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-slate-700'}`}>{client.client}</p>
                  <p className={`text-xs ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>{client.filled}/{client.openings} positions filled</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className={`w-16 h-1.5 rounded-full overflow-hidden ${isDarkMode ? 'bg-slate-700' : 'bg-slate-200'}`}>
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${client.satisfaction}%` }}
                      transition={{ duration: 1, delay: i * 0.15 }}
                      className={`h-full rounded-full ${client.satisfaction >= 90 ? 'bg-emerald-500' : client.satisfaction >= 80 ? 'bg-blue-500' : 'bg-amber-500'}`}
                    />
                  </div>
                  <span className={`text-sm font-bold w-10 text-right ${client.satisfaction >= 90 ? 'text-emerald-500' : client.satisfaction >= 80 ? 'text-blue-500' : 'text-amber-500'}`}>
                    {client.satisfaction}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Monthly Trend */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className={`rounded-2xl border-2 p-6 ${isDarkMode ? 'bg-slate-800/80 border-slate-700/50' : 'bg-white border-slate-200/50 shadow-lg'}`}
      >
        <div className="flex items-center gap-2 mb-6">
          <FiTrendingUp className={`w-5 h-5 ${isDarkMode ? 'text-indigo-400' : 'text-indigo-600'}`} />
          <h3 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>Hiring Trend</h3>
        </div>
        <div className="flex items-end gap-4 h-48">
          {analytics.monthlyTrend.map((month, i) => {
            const maxVal = Math.max(...analytics.monthlyTrend.map(m => Math.max(m.hired, m.target)));
            const hiredHeight = (month.hired / maxVal) * 100;
            const targetHeight = (month.target / maxVal) * 100;
            return (
              <div key={month.month} className="flex-1 flex flex-col items-center gap-2">
                <div className="flex-1 w-full flex items-end justify-center gap-1">
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${targetHeight}%` }}
                    transition={{ duration: 0.8, delay: i * 0.1 }}
                    className={`w-4 rounded-t-lg ${isDarkMode ? 'bg-slate-600' : 'bg-slate-300'}`}
                    title={`Target: ${month.target}`}
                  />
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${hiredHeight}%` }}
                    transition={{ duration: 0.8, delay: i * 0.1 + 0.1 }}
                    className="w-4 rounded-t-lg bg-gradient-to-t from-violet-600 to-purple-500"
                    title={`Hired: ${month.hired}`}
                  />
                </div>
                <span className={`text-xs font-medium ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>{month.month}</span>
              </div>
            );
          })}
        </div>
        <div className="flex items-center justify-center gap-6 mt-4">
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded ${isDarkMode ? 'bg-slate-600' : 'bg-slate-300'}`}></div>
            <span className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Target</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-gradient-to-r from-violet-600 to-purple-500"></div>
            <span className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Hired</span>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default RecruitmentAnalyticsTab;
