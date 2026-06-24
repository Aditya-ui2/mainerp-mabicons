import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiTrendingUp,
  FiCheckCircle,
  FiAlertTriangle,
  FiClock,
  FiBarChart2,
  FiUsers,
  FiRefreshCw,
  FiChevronUp,
  FiChevronDown,
  FiArrowRight,
  FiActivity,
  FiBriefcase,
} from 'react-icons/fi';
import { getKamProductivity } from '../../../service/api';

/* ── tiny status badge ── */
const StatusBadge = ({ status }) => {
  const map = {
    Active: 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white',
    'Work in Progress': 'bg-gradient-to-r from-amber-500 to-yellow-500 text-white',
    Review: 'bg-gradient-to-r from-purple-500 to-violet-500 text-white',
    Pending: 'bg-gradient-to-r from-orange-500 to-amber-500 text-white',
    Resolved: 'bg-gradient-to-r from-emerald-500 to-green-500 text-white',
  };
  return (
    <motion.span
      whileHover={{ scale: 1.05 }}
      className={`text-[11px] font-semibold px-2.5 py-1 rounded-full shadow-sm ${map[status] || 'bg-slate-500 text-white'}`}
    >
      {status}
    </motion.span>
  );
};

const PriorityBadge = ({ priority }) => {
  const map = {
    High: 'bg-gradient-to-r from-red-500 to-rose-500 text-white',
    Medium: 'bg-gradient-to-r from-yellow-500 to-amber-500 text-white',
    Low: 'bg-gradient-to-r from-green-500 to-emerald-500 text-white',
  };
  return (
    <motion.span
      whileHover={{ scale: 1.05 }}
      className={`text-[11px] font-semibold px-2.5 py-1 rounded-full shadow-sm ${map[priority] || 'bg-slate-500 text-white'}`}
    >
      {priority}
    </motion.span>
  );
};

/* ── Circular progress ring with animation ── */
const ProgressRing = ({ percent, size = 80, stroke = 7, color = '#7c3aed', delay = 0 }) => {
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;

  return (
    <svg width={size} height={size} className="transform -rotate-90">
      <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#e5e7eb" strokeWidth={stroke} />
      <motion.circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke={color}
        strokeWidth={stroke}
        strokeDasharray={circumference}
        strokeLinecap="round"
        initial={{ strokeDashoffset: circumference }}
        animate={{ strokeDashoffset: circumference - (percent / 100) * circumference }}
        transition={{ duration: 1.2, ease: 'easeOut', delay }}
        className="transition-all duration-700 ease-out"
      />
    </svg>
  );
};

/* ── Mini bar for inline charts ── */
const MiniBar = ({ value, max, color = 'bg-violet-500', delay = 0 }) => {
  const pct = max > 0 ? Math.min((value / max) * 100, 100) : 0;
  return (
    <div className="h-2.5 w-full rounded-full bg-slate-100 overflow-hidden">
      <motion.div
        className={`h-full rounded-full ${color}`}
        initial={{ width: 0 }}
        animate={{ width: `${pct}%` }}
        transition={{ duration: 0.8, ease: 'easeOut', delay }}
      />
    </div>
  );
};

/* ══════════════════════════════════════════════════════════════════════ */
const KamProductivityTab = ({ isDarkMode }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortField, setSortField] = useState('completionRate');
  const [sortDir, setSortDir] = useState('desc');

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getKamProductivity();
      setData(res);
    } catch (err) {
      setError(err.message || 'Failed to load productivity data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  /* ── sort assignees ── */
  const sortedAssignees = useMemo(() => {
    if (!data?.assigneeStats) return [];
    return [...data.assigneeStats].sort((a, b) => {
      const aVal = a[sortField] ?? 0;
      const bVal = b[sortField] ?? 0;
      return sortDir === 'asc' ? aVal - bVal : bVal - aVal;
    });
  }, [data, sortField, sortDir]);

  const toggleSort = (field) => {
    if (sortField === field) setSortDir(prev => (prev === 'asc' ? 'desc' : 'asc'));
    else { setSortField(field); setSortDir('desc'); }
  };

  const SortIcon = ({ field }) =>
    sortField === field
      ? sortDir === 'asc' ? <FiChevronUp className="w-3.5 h-3.5" /> : <FiChevronDown className="w-3.5 h-3.5" />
      : <FiChevronDown className="w-3.5 h-3.5 opacity-30" />;

  /* ── Loading state ── */
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <div className="h-8 w-56 rounded-lg bg-slate-200 animate-pulse" />
            <div className="h-4 w-72 rounded mt-2 bg-slate-200 animate-pulse" />
          </div>
          <div className="h-10 w-28 rounded-xl bg-slate-200 animate-pulse" />
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-28 rounded-2xl bg-slate-100 animate-pulse" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-56 rounded-2xl bg-slate-100 animate-pulse" />
          ))}
        </div>
        <div className="h-72 rounded-2xl bg-slate-100 animate-pulse" />
      </div>
    );
  }

  /* ── Error state ── */
  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center justify-center h-96 gap-4"
      >
        <motion.div
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <FiAlertTriangle className="w-16 h-16 text-red-400" />
        </motion.div>
        <p className="text-slate-600 font-medium text-lg">{error}</p>
        <motion.button
          onClick={fetchData}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="px-6 py-3 text-sm bg-gradient-to-r from-violet-500 to-purple-600 text-white rounded-xl font-medium shadow-lg shadow-violet-500/25 hover:shadow-xl transition-shadow"
        >
          Retry
        </motion.button>
      </motion.div>
    );
  }

  if (!data) return null;

  const { summary, statusCounts, priorityCounts, clientStats, weeklyTrend, recentTasks } = data;

  /* ── Status bar widths ── */
  const maxStatus = Math.max(...Object.values(statusCounts), 1);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      {/* ── Header ── */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-4">
          <motion.div
            className="p-3 rounded-2xl bg-gradient-to-r from-violet-500 to-purple-600 shadow-lg shadow-violet-500/25"
            whileHover={{ scale: 1.05, rotate: 5 }}
          >
            <FiTrendingUp className="w-8 h-8 text-white" />
          </motion.div>
          <div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">KAM Productivity</h2>
            <p className="text-sm text-slate-500 mt-1">Track task performance, team output &amp; client coverage</p>
          </div>
        </div>
        <motion.button
          onClick={fetchData}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex items-center gap-2 px-5 py-2.5 text-sm font-medium bg-gradient-to-r from-violet-500 to-purple-600 text-white rounded-xl shadow-lg shadow-violet-500/25 hover:shadow-xl transition-shadow"
        >
          <FiRefreshCw className="w-4 h-4" />
          Refresh
        </motion.button>
      </div>

      {/* ══════════ SUMMARY CARDS ══════════ */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Tasks', value: summary.totalTasks, icon: FiBarChart2, accent: 'violet', sub: `${summary.activeRecurring} recurring active`, gradient: 'from-violet-500 to-purple-600' },
          { label: 'Resolved', value: summary.resolvedTasks, icon: FiCheckCircle, accent: 'emerald', sub: `${summary.completionRate}% completion rate`, gradient: 'from-emerald-500 to-green-600' },
          { label: 'Overdue', value: summary.overdueCount, icon: FiAlertTriangle, accent: 'red', sub: 'Past due date', gradient: 'from-red-500 to-rose-600' },
          { label: 'In Progress', value: (statusCounts['Work in Progress'] || 0), icon: FiClock, accent: 'amber', sub: `${statusCounts.Review || 0} in review`, gradient: 'from-amber-500 to-yellow-600' },
        ].map((card, i) => {
          const Icon = card.icon;
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ scale: 1.03, y: -2 }}
              className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <div className={`absolute inset-0 bg-gradient-to-r ${card.gradient} opacity-5`} />
              <div className="relative flex items-start justify-between">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-slate-400">{card.label}</p>
                  <motion.p
                    className="text-3xl font-extrabold text-slate-800 mt-1"
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.1 + 0.2 }}
                  >
                    {card.value}
                  </motion.p>
                  <p className="text-[11px] text-slate-500 mt-1.5">{card.sub}</p>
                </div>
                <div className={`p-2.5 rounded-xl bg-gradient-to-r ${card.gradient} shadow-lg`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* ══════════ MID-ROW: Status + Priority + Completion ══════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Status distribution */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="rounded-2xl border border-slate-200 bg-white p-5 shadow-lg hover:shadow-xl transition-shadow"
        >
          <h3 className="text-sm font-semibold text-slate-700 mb-4 flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-gradient-to-r from-violet-500 to-purple-600">
              <FiActivity className="w-4 h-4 text-white" />
            </div>
            Task Status
          </h3>
          <div className="space-y-3">
            {Object.entries(statusCounts).map(([status, count], idx) => (
              <div key={status} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-600 font-medium">{status}</span>
                  <span className="font-bold text-slate-800">{count}</span>
                </div>
                <MiniBar
                  value={count}
                  max={maxStatus}
                  delay={idx * 0.1}
                  color={
                    status === 'Resolved' ? 'bg-gradient-to-r from-emerald-500 to-green-500' :
                      status === 'Active' ? 'bg-gradient-to-r from-blue-500 to-cyan-500' :
                        status === 'Work in Progress' ? 'bg-gradient-to-r from-amber-500 to-yellow-500' :
                          status === 'Review' ? 'bg-gradient-to-r from-purple-500 to-violet-500' :
                            'bg-gradient-to-r from-orange-500 to-amber-500'
                  }
                />
              </div>
            ))}
          </div>
        </motion.div>

        {/* Priority breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="rounded-2xl border border-slate-200 bg-white p-5 shadow-lg hover:shadow-xl transition-shadow"
        >
          <h3 className="text-sm font-semibold text-slate-700 mb-4 flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-gradient-to-r from-violet-500 to-purple-600">
              <FiTrendingUp className="w-4 h-4 text-white" />
            </div>
            Priority Breakdown
          </h3>
          <div className="flex items-center justify-center gap-6 h-[calc(100%-28px)]">
            {[
              { label: 'High', count: priorityCounts.High, color: '#ef4444' },
              { label: 'Medium', count: priorityCounts.Medium, color: '#f59e0b' },
              { label: 'Low', count: priorityCounts.Low, color: '#22c55e' },
            ].map((p, idx) => (
              <motion.div
                key={p.label}
                className="flex flex-col items-center gap-2"
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 + idx * 0.15 }}
              >
                <div className="relative flex items-center justify-center">
                  <ProgressRing percent={summary.totalTasks > 0 ? (p.count / summary.totalTasks) * 100 : 0} size={72} stroke={7} color={p.color} delay={0.5 + idx * 0.15} />
                  <span className="absolute text-base font-bold text-slate-800">{p.count}</span>
                </div>
                <span className="text-xs font-medium text-slate-500">{p.label}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Overall completion ring */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
          className="rounded-2xl border border-slate-200 bg-white p-5 flex flex-col items-center justify-center shadow-lg hover:shadow-xl transition-shadow"
        >
          <h3 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-gradient-to-r from-violet-500 to-purple-600">
              <FiCheckCircle className="w-4 h-4 text-white" />
            </div>
            Completion Rate
          </h3>
          <div className="relative flex items-center justify-center">
            <ProgressRing percent={summary.completionRate} size={130} stroke={12} color="#7c3aed" delay={0.6} />
            <div className="absolute text-center">
              <motion.span
                className="text-3xl font-extrabold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
              >
                {summary.completionRate}%
              </motion.span>
              <p className="text-[10px] text-slate-400 mt-0.5">resolved</p>
            </div>
          </div>
          <p className="text-xs text-slate-500 mt-3">
            {summary.resolvedTasks} of {summary.totalTasks} tasks resolved
          </p>
        </motion.div>
      </div>

      {/* ══════════ TEAM PERFORMANCE TABLE ══════════ */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-lg hover:shadow-xl transition-shadow"
      >
        <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2 bg-gradient-to-r from-slate-50 to-white">
          <div className="p-1.5 rounded-lg bg-gradient-to-r from-violet-500 to-purple-600">
            <FiUsers className="w-4 h-4 text-white" />
          </div>
          <h3 className="text-sm font-semibold text-slate-700">Team Member Performance</h3>
          <span className="ml-auto text-xs text-slate-400 px-2 py-1 bg-slate-100 rounded-full">{sortedAssignees.length} members</span>
        </div>

        {sortedAssignees.length === 0 ? (
          <div className="p-8 text-center text-sm text-slate-400">No assignee data available</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
                  <th className="text-left px-5 py-3 font-semibold">Member</th>
                  <th className="px-4 py-3 font-semibold cursor-pointer select-none hover:text-violet-600 transition-colors" onClick={() => toggleSort('total')}>
                    <span className="inline-flex items-center gap-1">Total <SortIcon field="total" /></span>
                  </th>
                  <th className="px-4 py-3 font-semibold cursor-pointer select-none hover:text-violet-600 transition-colors" onClick={() => toggleSort('resolved')}>
                    <span className="inline-flex items-center gap-1">Resolved <SortIcon field="resolved" /></span>
                  </th>
                  <th className="px-4 py-3 font-semibold cursor-pointer select-none hover:text-violet-600 transition-colors" onClick={() => toggleSort('inProgress')}>
                    <span className="inline-flex items-center gap-1">In Prog. <SortIcon field="inProgress" /></span>
                  </th>
                  <th className="px-4 py-3 font-semibold cursor-pointer select-none hover:text-violet-600 transition-colors" onClick={() => toggleSort('overdue')}>
                    <span className="inline-flex items-center gap-1">Overdue <SortIcon field="overdue" /></span>
                  </th>
                  <th className="px-4 py-3 font-semibold cursor-pointer select-none hover:text-violet-600 transition-colors" onClick={() => toggleSort('completionRate')}>
                    <span className="inline-flex items-center gap-1">Completion <SortIcon field="completionRate" /></span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <AnimatePresence>
                  {sortedAssignees.map((a, i) => (
                    <motion.tr
                      key={a.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="hover:bg-violet-50/40 transition-colors"
                    >
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          <motion.div
                            whileHover={{ scale: 1.1 }}
                            className="h-9 w-9 rounded-full bg-gradient-to-br from-violet-400 to-indigo-500 text-white flex items-center justify-center text-xs font-bold flex-shrink-0 shadow-md"
                          >
                            {a.name?.charAt(0)?.toUpperCase() || '?'}
                          </motion.div>
                          <div>
                            <p className="font-semibold text-slate-700 text-sm">{a.name}</p>
                            <p className="text-[11px] text-slate-400">{a.type}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center font-bold text-slate-700">{a.total}</td>
                      <td className="px-4 py-3 text-center font-bold text-emerald-600">{a.resolved}</td>
                      <td className="px-4 py-3 text-center font-bold text-amber-600">{a.inProgress}</td>
                      <td className="px-4 py-3 text-center">
                        <span className={`font-bold ${a.overdue > 0 ? 'text-red-600' : 'text-slate-400'}`}>{a.overdue}</span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2 justify-center">
                          <MiniBar value={a.completionRate} max={100} color={a.completionRate >= 75 ? 'bg-gradient-to-r from-emerald-500 to-green-500' : a.completionRate >= 50 ? 'bg-gradient-to-r from-amber-500 to-yellow-500' : 'bg-gradient-to-r from-red-500 to-rose-500'} delay={i * 0.05} />
                          <span className="text-xs font-bold text-slate-700 w-10 text-right">{a.completionRate}%</span>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        )}
      </motion.div>

      {/* ══════════ BOTTOM ROW: Clients + Weekly Trend + Recent Tasks ══════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Client coverage */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="rounded-2xl border border-slate-200 bg-white p-5 shadow-lg hover:shadow-xl transition-shadow"
        >
          <h3 className="text-sm font-semibold text-slate-700 mb-4 flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-gradient-to-r from-violet-500 to-purple-600">
              <FiBriefcase className="w-4 h-4 text-white" />
            </div>
            Client Coverage
          </h3>
          {clientStats.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-6">No client data</p>
          ) : (
            <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
              {clientStats.map((c, idx) => (
                <motion.div
                  key={c.id}
                  className="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-50 transition-colors"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.8 + idx * 0.05 }}
                >
                  <div className="h-9 w-9 rounded-xl bg-gradient-to-r from-violet-500 to-purple-600 text-white flex items-center justify-center text-xs font-bold flex-shrink-0 shadow-md">
                    {c.company?.charAt(0)?.toUpperCase() || c.name?.charAt(0)?.toUpperCase() || '?'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-700 truncate">{c.company || c.name}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <MiniBar value={c.resolved} max={c.total} color="bg-gradient-to-r from-emerald-500 to-green-500" delay={0.8 + idx * 0.05} />
                      <span className="text-[11px] text-slate-500 whitespace-nowrap font-medium">{c.resolved}/{c.total}</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Weekly trend */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="rounded-2xl border border-slate-200 bg-white p-5 shadow-lg hover:shadow-xl transition-shadow"
        >
          <h3 className="text-sm font-semibold text-slate-700 mb-4 flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-gradient-to-r from-violet-500 to-purple-600">
              <FiTrendingUp className="w-4 h-4 text-white" />
            </div>
            Weekly Resolved (30d)
          </h3>
          {weeklyTrend.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-6">No trend data yet</p>
          ) : (
            <div className="flex items-end gap-2 h-40 px-1">
              {(() => {
                const maxVal = Math.max(...weeklyTrend.map(w => w.resolved), 1);
                return weeklyTrend.map((w, i) => (
                  <motion.div
                    key={i}
                    className="flex-1 flex flex-col items-center gap-1"
                    initial={{ opacity: 0, scaleY: 0 }}
                    animate={{ opacity: 1, scaleY: 1 }}
                    transition={{ delay: 0.9 + i * 0.1 }}
                    style={{ transformOrigin: 'bottom' }}
                  >
                    <span className="text-[10px] font-bold text-slate-600">{w.resolved}</span>
                    <div
                      className="w-full bg-gradient-to-t from-violet-600 to-purple-400 rounded-t-lg transition-all duration-500 shadow-md"
                      style={{ height: `${(w.resolved / maxVal) * 100}%`, minHeight: 8 }}
                    />
                    <span className="text-[9px] text-slate-400 whitespace-nowrap">
                      {new Date(w.week).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </span>
                  </motion.div>
                ));
              })()}
            </div>
          )}
        </motion.div>

        {/* Recent tasks */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className="rounded-2xl border border-slate-200 bg-white p-5 shadow-lg hover:shadow-xl transition-shadow"
        >
          <h3 className="text-sm font-semibold text-slate-700 mb-4 flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-gradient-to-r from-violet-500 to-purple-600">
              <FiArrowRight className="w-4 h-4 text-white" />
            </div>
            Recent Tasks
          </h3>
          {(!recentTasks || recentTasks.length === 0) ? (
            <p className="text-sm text-slate-400 text-center py-6">No recent tasks</p>
          ) : (
            <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
              {recentTasks.map((t, idx) => (
                <motion.div
                  key={t.id}
                  className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1 + idx * 0.05 }}
                  whileHover={{ scale: 1.02 }}
                >
                  <div className="mt-0.5">
                    <StatusBadge status={t.status} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-700 truncate">{t.title}</p>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      {t.client && <span className="text-[10px] text-slate-400">{t.client}</span>}
                      {t.priority && <PriorityBadge priority={t.priority} />}
                      {t.dueDate && (
                        <span className={`text-[10px] ${new Date(t.dueDate) < new Date() && t.status !== 'Resolved' ? 'text-red-500 font-semibold' : 'text-slate-400'}`}>
                          {new Date(t.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </span>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
};

export default KamProductivityTab;
