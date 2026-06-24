import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  FiUsers, FiUserCheck, FiUserX, FiClock, FiDollarSign, FiTrendingUp,
  FiCalendar, FiCheckCircle, FiAlertCircle, FiFileText, FiActivity,
  FiPieChart, FiBarChart2, FiArrowUp, FiArrowDown
} from 'react-icons/fi';

const DashboardOverviewTab = ({ isDarkMode, onNavigate, stats }) => {
  // Handle card click navigation
  const handleCardClick = (targetTab) => {
    if (onNavigate && targetTab) {
      onNavigate(targetTab);
    }
  };

  const statCards = [
    { label: 'Total Employees', value: stats?.overview?.totalEmployees || 0, icon: FiUsers, gradientStyle: 'linear-gradient(135deg, #8b5cf6, #9333ea)', textHex: '#7c3aed', change: '0', positive: true, navigateTo: 'Master Data (Emp)' },
    { label: 'Active Today', value: (stats?.overview?.totalEmployees || 0) - (stats?.bar?.onLeave || 0), icon: FiUserCheck, gradientStyle: 'linear-gradient(135deg, #10b981, #0d9488)', textHex: '#059669', change: '0', positive: true, navigateTo: 'Attendance' },
    { label: 'On Leave', value: stats?.bar?.onLeave || 0, icon: FiCalendar, gradientStyle: 'linear-gradient(135deg, #f59e0b, #ea580c)', textHex: '#d97706', change: '0', positive: true, navigateTo: 'Leave Management' },
    { label: 'Pending Tasks', value: stats?.bar?.pendingActions || 0, icon: FiAlertCircle, gradientStyle: 'linear-gradient(135deg, #f43f5e, #ec4899)', textHex: '#e11d48', change: '0', positive: false, navigateTo: 'Task by Client' },
    { label: 'Attendance Rate', value: stats?.overview?.attendanceRate || '0%', icon: FiClock, gradientStyle: 'linear-gradient(135deg, #3b82f6, #6366f1)', textHex: '#2563eb', change: '0%', positive: true, navigateTo: 'Attendance' },
    { label: 'Avg. Performance', value: stats?.bar?.satisfaction || '0/5', icon: FiTrendingUp, gradientStyle: 'linear-gradient(135deg, #06b6d4, #3b82f6)', textHex: '#0891b2', change: '0', positive: true, navigateTo: 'Performance' },
  ];

  const quickStats = [
    { label: 'New Hires (Month)', value: stats?.quickStats?.newHires || 0, icon: FiUserCheck, bgColor: '#d1fae5', iconColor: '#059669', navigateTo: 'Onboarding' },
    { label: 'Exits (Month)', value: stats?.quickStats?.exits || 0, icon: FiUserX, bgColor: '#ffe4e6', iconColor: '#e11d48', navigateTo: 'Offboarding' },
    { label: 'Open Positions', value: stats?.quickStats?.openPositions || 0, icon: FiUsers, bgColor: '#fef3c7', iconColor: '#d97706', navigateTo: 'Onboarding' },
    { label: 'Docs Verified', value: `${stats?.quickStats?.docsVerified || 0}%`, icon: FiFileText, bgColor: '#ede9fe', iconColor: '#7c3aed', navigateTo: 'Document Verify' },
  ];



  // Live chart data from props
  const attendanceTrend = stats?.attendanceTrend || [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
  const months = ['Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar'];

  const departmentData = stats?.departmentDistribution || [
    { name: 'Operations', count: stats?.overview?.totalEmployees || 0, color: 'bg-violet-500', hex: '#8b5cf6' },
  ];

  const recentActivities = stats?.recentActivities?.map(a => ({
    action: a.description,
    user: a.performedByName,
    time: new Date(a.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    type: a.actionType === 'task' ? 'info' : 'success',
    navigateTo: a.actionType === 'task' ? 'Task Assignment' : 'Dashboard'
  })) || [];

  if (!stats) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className={`h-32 rounded-2xl ${isDarkMode ? 'bg-slate-800' : 'bg-slate-200'}`} />
          ))}
        </div>
      </div>
    );
  }

  return (

    <div className={`space-y-6 ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4"
      >
        <div className="flex items-center gap-3">
          <div
            className="p-3 rounded-xl shadow-lg"
            style={{ background: 'linear-gradient(135deg, #8b5cf6, #9333ea)' }}
          >
            <FiPieChart className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className={`text-2xl lg:text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-violet-700'}`}>
              Dashboard Overview
            </h2>
            <p className={`text-sm mt-0.5 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              March 2026 • Key Metrics & Analytics
            </p>
          </div>
        </div>
      </motion.div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {statCards.map((card, idx) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            onClick={() => handleCardClick(card.navigateTo)}
            className={`relative overflow-hidden rounded-2xl p-5 border-2 transition-all duration-300 hover:scale-[1.02] cursor-pointer ${isDarkMode
              ? 'bg-slate-800/80 border-slate-700/50 hover:border-slate-600'
              : 'bg-white border-slate-100 hover:shadow-xl hover:border-violet-200'
              }`}
          >
            <div className="flex items-start justify-between">
              <div>
                <p className={`text-xs font-medium mb-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                  {card.label}
                </p>
                <p
                  className="text-2xl lg:text-3xl font-bold"
                  style={{ color: isDarkMode ? '#ffffff' : card.textHex }}
                >
                  {card.value}
                </p>
                <div
                  className="flex items-center gap-1 mt-2 text-xs font-semibold"
                  style={{ color: card.positive ? '#10b981' : '#f43f5e' }}
                >
                  {card.positive ? <FiArrowUp className="w-3 h-3" /> : <FiArrowDown className="w-3 h-3" />}
                  {card.change}
                </div>
              </div>
              <div
                className="p-3 rounded-xl shadow-lg"
                style={{ background: card.gradientStyle }}
              >
                <card.icon className="w-5 h-5 text-white" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Quick Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {quickStats.map((stat, idx) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 + idx * 0.05 }}
            onClick={() => handleCardClick(stat.navigateTo)}
            className={`rounded-xl p-4 border-2 transition-all cursor-pointer hover:scale-[1.02] ${isDarkMode
              ? 'bg-slate-800/50 border-slate-700/50'
              : 'bg-white border-slate-100'
              }`}
          >
            <div className="flex items-center gap-3">
              <div
                className="p-2.5 rounded-lg"
                style={{ backgroundColor: stat.bgColor }}
              >
                <stat.icon className="w-4 h-4" style={{ color: stat.iconColor }} />
              </div>
              <div>
                <p className="text-xl font-bold">{stat.value}</p>
                <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>{stat.label}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Attendance Trend Chart */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          onClick={() => handleCardClick('Attendance')}
          className={`rounded-2xl p-6 border-2 cursor-pointer transition-all hover:scale-[1.01] ${isDarkMode ? 'bg-slate-800/80 border-slate-700/50 hover:border-slate-600' : 'bg-white border-slate-100 hover:shadow-lg hover:border-violet-200'
            }`}
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <FiBarChart2 className="w-5 h-5" style={{ color: '#8b5cf6' }} />
              <h3 className="font-bold">Attendance Trend</h3>
            </div>
            <span
              className="text-xs px-3 py-1 rounded-full"
              style={{ backgroundColor: isDarkMode ? '#334155' : '#ede9fe', color: '#7c3aed' }}
            >
              Last 12 Months
            </span>
          </div>
          <div className="h-48 flex items-end justify-between gap-1.5 pb-6">
            {attendanceTrend.map((value, idx) => {
              const barHeight = Math.round((value / 100) * 140);
              return (
                <div key={idx} className="flex-1 flex flex-col items-center justify-end" style={{ height: '100%' }}>
                  <div
                    className="w-full rounded-t-lg relative group cursor-pointer"
                    style={{
                      height: `${barHeight}px`,
                      background: 'linear-gradient(to top, #8b5cf6, #a78bfa)',
                      minHeight: '8px'
                    }}
                  >
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap z-10">
                      {value}%
                    </div>
                  </div>
                  <span className={`text-[10px] mt-2 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                    {months[idx]}
                  </span>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Department Distribution */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          onClick={() => handleCardClick('Master Data (Emp)')}
          className={`rounded-2xl p-6 border-2 cursor-pointer transition-all hover:scale-[1.01] ${isDarkMode ? 'bg-slate-800/80 border-slate-700/50 hover:border-slate-600' : 'bg-white border-slate-100 hover:shadow-lg hover:border-emerald-200'
            }`}
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <FiPieChart className="w-5 h-5" style={{ color: '#10b981' }} />
              <h3 className="font-bold">Department Distribution</h3>
            </div>
            <span
              className="text-xs px-3 py-1 rounded-full"
              style={{ backgroundColor: isDarkMode ? '#334155' : '#d1fae5', color: '#059669' }}
            >
              {departmentData.reduce((sum, d) => sum + d.count, 0)} Total
            </span>
          </div>
          <div className="space-y-3">
            {departmentData.map((dept, idx) => {
              const maxCount = Math.max(...departmentData.map(d => d.count));
              const barWidth = Math.round((dept.count / maxCount) * 100);
              return (
                <motion.div
                  key={dept.name}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + idx * 0.05 }}
                  className="flex items-center gap-3"
                >
                  <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: dept.hex }} />
                  <span className={`text-sm w-24 ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>{dept.name}</span>
                  <span className="text-sm font-bold w-8 text-right">{dept.count}</span>
                  <div className={`flex-1 h-2.5 rounded-full overflow-hidden ${isDarkMode ? 'bg-slate-700' : 'bg-slate-100'}`}>
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${barWidth}%` }}
                      transition={{ delay: 0.6 + idx * 0.05, duration: 0.5 }}
                      className="h-full rounded-full"
                      style={{ backgroundColor: dept.hex }}
                    />
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activities */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className={`lg:col-span-2 rounded-2xl p-6 border-2 ${isDarkMode ? 'bg-slate-800/80 border-slate-700/50' : 'bg-white border-slate-100'
            }`}
        >
          <div className="flex items-center gap-2 mb-4">
            <FiActivity className="w-5 h-5" style={{ color: '#3b82f6' }} />
            <h3 className="font-bold">Recent Activities</h3>
          </div>
          <div className="space-y-3">
            {recentActivities.map((activity, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 + idx * 0.05 }}
                onClick={() => handleCardClick(activity.navigateTo)}
                className={`flex items-center gap-3 p-3 rounded-xl transition-colors cursor-pointer ${isDarkMode ? 'hover:bg-slate-700/50' : 'hover:bg-slate-50'
                  }`}
              >
                <div
                  className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                  style={{
                    backgroundColor: activity.type === 'success' ? '#10b981' :
                      activity.type === 'warning' ? '#f59e0b' : '#3b82f6'
                  }}
                />
                <div className="flex-1">
                  <p className="text-sm font-medium">{activity.action}</p>
                  <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>{activity.user}</p>
                </div>
                <span className={`text-xs ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>{activity.time}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Payroll Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          onClick={() => handleCardClick('Payroll')}
          className={`rounded-2xl p-6 border-2 cursor-pointer transition-all hover:scale-[1.02] ${isDarkMode ? 'bg-slate-800/80 border-slate-700/50 hover:border-slate-600' : 'bg-white border-slate-100 hover:shadow-xl hover:border-emerald-200'
            }`}
        >
          <div className="flex items-center gap-2 mb-4">
            <FiDollarSign className="w-5 h-5" style={{ color: '#10b981' }} />
            <h3 className="font-bold">Payroll Summary</h3>
          </div>
          <div className="space-y-4">
            <div className={`p-4 rounded-xl ${isDarkMode ? 'bg-slate-700/50' : 'bg-emerald-50'}`}>
              <p className={`text-xs`} style={{ color: '#10b981' }}>Total Disbursed</p>
              <p className="text-2xl font-bold" style={{ color: '#10b981' }}>
                {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(stats?.payroll?.totalDisbursed || 0)}
              </p>
            </div>
            <div className="flex justify-between text-sm">
              <span className={isDarkMode ? 'text-slate-400' : 'text-slate-500'}>Processed</span>
              <span className="font-semibold" style={{ color: '#10b981' }}>
                {stats?.payroll?.processed || 0}/{stats?.payroll?.total || 0}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className={isDarkMode ? 'text-slate-400' : 'text-slate-500'}>Pending</span>
              <span className="font-semibold" style={{ color: '#f59e0b' }}>
                {(stats?.payroll?.total || 0) - (stats?.payroll?.processed || 0)}
              </span>
            </div>
            <div className={`h-2.5 rounded-full overflow-hidden ${isDarkMode ? 'bg-slate-700' : 'bg-slate-200'}`}>
              <div
                className="h-full rounded-full"
                style={{
                  width: `${stats?.payroll?.completion || 0}%`,
                  background: 'linear-gradient(to right, #10b981, #14b8a6)'
                }}
              />
            </div>
            <p className={`text-xs text-center ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
              {stats?.payroll?.completion || 0}% Completed
            </p>
          </div>

        </motion.div>
      </div>
    </div>
  );
};

export default DashboardOverviewTab;
