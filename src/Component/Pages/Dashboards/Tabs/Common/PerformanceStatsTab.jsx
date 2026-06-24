import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiTrendingUp, FiCheckCircle, FiClock, FiTarget, FiAward, FiZap, FiBarChart2 } from 'react-icons/fi';
import { getPerformanceStats } from '../../../service/api';

const PerformanceStatsTab = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('month');

  useEffect(() => { fetchStats(); }, [period]);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const res = await getPerformanceStats(period);
      setStats(res.stats);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => <div key={i} className="h-28 rounded-xl bg-gray-200" />)}
        </div>
        <div className="h-64 rounded-2xl bg-gray-200" />
      </div>
    );
  }

  const kpiCards = [
    { icon: FiCheckCircle, label: 'Tasks Completed', value: stats?.taskStats?.completed || 0, color: '#10b981', bg: '#d1fae5' },
    { icon: FiClock, label: 'Tasks In Progress', value: stats?.taskStats?.inProgress || 0, color: '#3b82f6', bg: '#dbeafe' },
    { icon: FiTarget, label: 'Completion Rate', value: `${stats?.taskStats?.completionRate || 0}%`, color: '#8b5cf6', bg: '#ede9fe' },
    { icon: FiTrendingUp, label: 'Attendance Rate', value: `${stats?.attendanceRate || 0}%`, color: '#f59e0b', bg: '#fef3c7' },
  ];

  const totalTasks = (stats?.taskStats?.completed || 0) + (stats?.taskStats?.inProgress || 0) + (stats?.taskStats?.todo || 0);
  const completedPerc = totalTasks > 0 ? Math.round(((stats?.taskStats?.completed || 0) / totalTasks) * 100) : 0;
  const inProgressPerc = totalTasks > 0 ? Math.round(((stats?.taskStats?.inProgress || 0) / totalTasks) * 100) : 0;
  const todoPerc = 100 - completedPerc - inProgressPerc;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Performance</h2>
          <p className="text-gray-500 text-sm mt-1">Your work performance overview</p>
        </div>
        <div className="flex gap-1 p-1 bg-gray-100 rounded-xl">
          {['week', 'month', 'quarter'].map(p => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className="px-4 py-1.5 rounded-lg text-sm font-medium transition-all capitalize"
              style={period === p ? { background: '#fff', color: '#6366f1', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' } : { color: '#6b7280' }}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {kpiCards.map((k, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-lg" style={{ background: k.bg }}>
                <k.icon style={{ width: '20px', height: '20px', color: k.color }} />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900">{k.value}</p>
            <p className="text-xs text-gray-500 mt-1">{k.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Task Distribution Bar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm"
      >
        <div className="flex items-center gap-2 mb-4">
          <FiBarChart2 style={{ width: '20px', height: '20px', color: '#6366f1' }} />
          <h3 className="font-semibold text-gray-900">Task Distribution</h3>
        </div>
        <div className="flex rounded-full h-5 overflow-hidden bg-gray-100">
          {completedPerc > 0 && (
            <div style={{ width: `${completedPerc}%`, background: '#10b981' }} className="transition-all duration-500" />
          )}
          {inProgressPerc > 0 && (
            <div style={{ width: `${inProgressPerc}%`, background: '#3b82f6' }} className="transition-all duration-500" />
          )}
          {todoPerc > 0 && (
            <div style={{ width: `${todoPerc}%`, background: '#e5e7eb' }} className="transition-all duration-500" />
          )}
        </div>
        <div className="flex items-center gap-6 mt-3">
          <span className="flex items-center gap-2 text-sm">
            <span className="w-3 h-3 rounded-full" style={{ background: '#10b981' }} /> Completed ({stats?.taskStats?.completed || 0})
          </span>
          <span className="flex items-center gap-2 text-sm">
            <span className="w-3 h-3 rounded-full" style={{ background: '#3b82f6' }} /> In Progress ({stats?.taskStats?.inProgress || 0})
          </span>
          <span className="flex items-center gap-2 text-sm">
            <span className="w-3 h-3 rounded-full" style={{ background: '#e5e7eb' }} /> To Do ({stats?.taskStats?.todo || 0})
          </span>
        </div>
      </motion.div>

      {/* Additional Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Streak */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2.5 rounded-xl" style={{ background: '#fef3c7' }}>
              <FiZap style={{ width: '22px', height: '22px', color: '#f59e0b' }} />
            </div>
            <div>
              <p className="font-semibold text-gray-900">Current Streak</p>
              <p className="text-sm text-gray-500">Consecutive days present</p>
            </div>
          </div>
          <p className="text-4xl font-bold" style={{ color: '#f59e0b' }}>
            {stats?.streak || 0} <span className="text-lg text-gray-400">days</span>
          </p>
        </motion.div>

        {/* Reports Submitted */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2.5 rounded-xl" style={{ background: '#ede9fe' }}>
              <FiAward style={{ width: '22px', height: '22px', color: '#8b5cf6' }} />
            </div>
            <div>
              <p className="font-semibold text-gray-900">Reports Submitted</p>
              <p className="text-sm text-gray-500">Daily reports this period</p>
            </div>
          </div>
          <p className="text-4xl font-bold" style={{ color: '#8b5cf6' }}>
            {stats?.reportsSubmitted || 0}
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default PerformanceStatsTab;
