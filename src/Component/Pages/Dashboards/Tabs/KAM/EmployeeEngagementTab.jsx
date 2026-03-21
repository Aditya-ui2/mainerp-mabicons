import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiHeart, FiUsers, FiCalendar, FiGift, FiMessageCircle, FiPlus, FiStar, FiTrendingUp, FiAward, FiSmile } from 'react-icons/fi';

const EmployeeEngagementTab = ({ isDarkMode, selectedClient }) => {
  const [activities, setActivities] = useState([]);
  const [surveys, setSurveys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeSubTab, setActiveSubTab] = useState('activities');
  const [hoveredCard, setHoveredCard] = useState(null);

  useEffect(() => {
    const mockActivities = [
      { id: 1, title: 'Team Outing - Goa Trip', date: '2026-03-25', participants: 45, status: 'upcoming', category: 'Team Building' },
      { id: 2, title: 'Birthday Celebration - March', date: '2026-03-20', participants: 12, status: 'upcoming', category: 'Celebration' },
      { id: 3, title: 'Quarterly Town Hall', date: '2026-03-15', participants: 150, status: 'completed', category: 'Communication' },
      { id: 4, title: 'Wellness Week', date: '2026-03-10', participants: 80, status: 'completed', category: 'Wellness' },
      { id: 5, title: 'Hackathon 2026', date: '2026-04-05', participants: 30, status: 'upcoming', category: 'Learning' },
    ];
    const mockSurveys = [
      { id: 1, title: 'Employee Satisfaction Survey Q1', responses: 120, total: 150, status: 'active', dueDate: '2026-03-31' },
      { id: 2, title: 'Work-Life Balance Feedback', responses: 85, total: 150, status: 'completed', dueDate: '2026-02-28' },
      { id: 3, title: 'Manager Effectiveness Survey', responses: 45, total: 50, status: 'completed', dueDate: '2026-02-15' },
    ];
    setTimeout(() => {
      setActivities(mockActivities);
      setSurveys(mockSurveys);
      setLoading(false);
    }, 500);
  }, [selectedClient]);

  const engagementScore = 78;
  const stats = {
    activities: activities.length,
    upcoming: activities.filter(a => a.status === 'upcoming').length,
    participation: '85%',
    surveys: surveys.filter(s => s.status === 'active').length,
  };

  const statCards = [
    { label: 'Total Activities', value: stats.activities, icon: FiCalendar, gradient: 'from-violet-500 to-purple-600', shadowColor: 'shadow-violet-500/25' },
    { label: 'Upcoming', value: stats.upcoming, icon: FiGift, gradient: 'from-blue-500 to-cyan-600', shadowColor: 'shadow-blue-500/25' },
    { label: 'Participation', value: stats.participation, icon: FiUsers, gradient: 'from-emerald-500 to-green-600', shadowColor: 'shadow-emerald-500/25' },
    { label: 'Active Surveys', value: stats.surveys, icon: FiMessageCircle, gradient: 'from-amber-500 to-yellow-600', shadowColor: 'shadow-amber-500/25' },
  ];

  const getCategoryConfig = (category) => {
    const configs = {
      'Team Building': { gradient: 'from-violet-500 to-purple-600', icon: FiUsers, color: 'text-violet-500' },
      'Celebration': { gradient: 'from-pink-500 to-rose-600', icon: FiGift, color: 'text-pink-500' },
      'Communication': { gradient: 'from-blue-500 to-cyan-600', icon: FiMessageCircle, color: 'text-blue-500' },
      'Wellness': { gradient: 'from-emerald-500 to-green-600', icon: FiHeart, color: 'text-emerald-500' },
      'Learning': { gradient: 'from-amber-500 to-yellow-600', icon: FiStar, color: 'text-amber-500' },
    };
    return configs[category] || { gradient: 'from-gray-500 to-slate-600', icon: FiCalendar, color: 'text-gray-500' };
  };

  const getAvatarGradient = (name) => {
    const gradients = [
      'from-violet-500 to-purple-600',
      'from-blue-500 to-cyan-600',
      'from-emerald-500 to-green-600',
      'from-pink-500 to-rose-600',
      'from-amber-500 to-yellow-600',
    ];
    return gradients[name.charCodeAt(0) % gradients.length];
  };

  // Skeleton Loader
  if (loading) {
    return (
      <div className={`space-y-6 ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
        <div className="flex justify-between items-center">
          <div>
            <div className={`h-8 w-64 rounded-lg ${isDarkMode ? 'bg-slate-700' : 'bg-slate-200'} animate-pulse`} />
            <div className={`h-4 w-48 rounded mt-2 ${isDarkMode ? 'bg-slate-700' : 'bg-slate-200'} animate-pulse`} />
          </div>
          <div className={`h-10 w-36 rounded-lg ${isDarkMode ? 'bg-slate-700' : 'bg-slate-200'} animate-pulse`} />
        </div>
        <div className={`h-40 rounded-2xl ${isDarkMode ? 'bg-slate-800' : 'bg-slate-100'} animate-pulse`} />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className={`h-24 rounded-xl ${isDarkMode ? 'bg-slate-800' : 'bg-slate-100'} animate-pulse`} />
          ))}
        </div>
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className={`h-28 rounded-xl ${isDarkMode ? 'bg-slate-800' : 'bg-slate-100'} animate-pulse`} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`space-y-6 ${isDarkMode ? 'text-white' : 'text-slate-800'}`}
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-4">
          <motion.div 
            className="p-3 rounded-2xl bg-gradient-to-r from-pink-500 to-rose-600 shadow-lg shadow-pink-500/25"
            whileHover={{ scale: 1.05, rotate: 5 }}
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <FiHeart className="w-8 h-8 text-white" />
          </motion.div>
          <div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-pink-600 to-rose-600 bg-clip-text text-transparent">
              Employee Engagement
            </h2>
            <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              Foster workplace culture and employee satisfaction
            </p>
          </div>
        </div>
        <motion.button 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-violet-500 to-purple-600 text-white rounded-xl font-medium shadow-lg shadow-violet-500/25 hover:shadow-xl hover:shadow-violet-500/30 transition-shadow"
        >
          <FiPlus className="w-5 h-5" />
          New Activity
        </motion.button>
      </div>

      {/* Engagement Score Card */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
        className={`p-6 rounded-2xl border overflow-hidden relative ${
          isDarkMode 
            ? 'bg-gradient-to-r from-violet-900/50 to-purple-900/50 border-violet-700' 
            : 'bg-gradient-to-r from-violet-50 to-purple-50 border-violet-200'
        }`}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-violet-500/5 to-purple-500/5" />
        <div className="relative flex items-center justify-between">
          <div>
            <p className={`text-sm font-medium ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>Overall Engagement Score</p>
            <motion.p 
              className="text-5xl font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent mt-2"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              {engagementScore}%
            </motion.p>
            <motion.p 
              className="text-sm text-emerald-500 flex items-center gap-1 mt-2 font-medium"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <FiTrendingUp className="w-4 h-4" /> +5% from last quarter
            </motion.p>
          </div>
          <div className="w-36 h-36 relative">
            <svg className="w-full h-full transform -rotate-90">
              <circle cx="72" cy="72" r="60" stroke={isDarkMode ? '#374151' : '#e5e7eb'} strokeWidth="12" fill="none" />
              <motion.circle 
                cx="72" cy="72" r="60" 
                stroke="url(#engagementGradient)" 
                strokeWidth="12" 
                fill="none" 
                strokeLinecap="round"
                initial={{ strokeDasharray: '0 377' }}
                animate={{ strokeDasharray: `${engagementScore * 3.77} 377` }}
                transition={{ duration: 1.5, ease: 'easeOut', delay: 0.3 }}
              />
              <defs>
                <linearGradient id="engagementGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#8b5cf6" />
                  <stop offset="100%" stopColor="#a855f7" />
                </linearGradient>
              </defs>
            </svg>
            <motion.div 
              className="absolute inset-0 flex items-center justify-center"
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <FiHeart className="w-10 h-10 text-violet-500" />
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {statCards.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 + 0.2 }}
            whileHover={{ scale: 1.03, y: -2 }}
            onMouseEnter={() => setHoveredCard(stat.label)}
            onMouseLeave={() => setHoveredCard(null)}
            className={`relative p-4 rounded-2xl border overflow-hidden cursor-pointer transition-all duration-300 ${
              isDarkMode ? 'bg-slate-800/80 border-slate-700' : 'bg-white border-slate-200'
            } ${hoveredCard === stat.label ? `shadow-xl ${stat.shadowColor}` : 'shadow-lg'}`}
          >
            <div className={`absolute inset-0 bg-gradient-to-r ${stat.gradient} opacity-0 transition-opacity duration-300 ${hoveredCard === stat.label ? 'opacity-10' : ''}`} />
            <div className="relative flex items-center gap-3">
              <div className={`p-2.5 rounded-xl bg-gradient-to-r ${stat.gradient} shadow-lg ${stat.shadowColor}`}>
                <stat.icon className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>{stat.label}</p>
                <p className="text-2xl font-bold">{stat.value}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Sub Tabs */}
      <div className={`flex gap-1 p-1 rounded-xl ${isDarkMode ? 'bg-slate-800' : 'bg-slate-100'}`}>
        {['activities', 'surveys', 'recognition'].map(tab => (
          <motion.button
            key={tab}
            onClick={() => setActiveSubTab(tab)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`flex-1 px-4 py-2.5 font-medium capitalize rounded-lg transition-all duration-300 ${
              activeSubTab === tab 
                ? 'bg-gradient-to-r from-violet-500 to-purple-600 text-white shadow-lg shadow-violet-500/25' 
                : `${isDarkMode ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-700'}`
            }`}
          >
            {tab}
          </motion.button>
        ))}
      </div>

      {/* Activities Tab */}
      <AnimatePresence mode="wait">
        {activeSubTab === 'activities' && (
          <motion.div 
            key="activities"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="grid gap-4"
          >
            {activities.map((activity, index) => {
              const categoryConfig = getCategoryConfig(activity.category);
              const CategoryIcon = categoryConfig.icon;
              return (
                <motion.div 
                  key={activity.id} 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ scale: 1.01, y: -2 }}
                  className={`p-5 rounded-2xl border transition-all duration-300 hover:shadow-xl ${
                    isDarkMode ? 'bg-slate-800/80 border-slate-700' : 'bg-white border-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <motion.div 
                        className={`p-3 rounded-xl bg-gradient-to-r ${categoryConfig.gradient} shadow-lg`}
                        whileHover={{ rotate: 10 }}
                      >
                        <CategoryIcon className="w-6 h-6 text-white" />
                      </motion.div>
                      <div>
                        <h3 className="font-semibold text-lg">{activity.title}</h3>
                        <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                          <FiCalendar className="inline w-3.5 h-3.5 mr-1" />
                          {activity.date} • <FiUsers className="inline w-3.5 h-3.5 mr-1" />{activity.participants} participants
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r ${categoryConfig.gradient} text-white shadow-md`}>
                        {activity.category}
                      </span>
                      <motion.span 
                        whileHover={{ scale: 1.05 }}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium ${
                          activity.status === 'upcoming' 
                            ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' 
                            : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                        }`}
                      >
                        {activity.status}
                      </motion.span>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}

        {/* Surveys Tab */}
        {activeSubTab === 'surveys' && (
          <motion.div 
            key="surveys"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="grid gap-4"
          >
            {surveys.map((survey, index) => {
              const percentage = Math.round((survey.responses / survey.total) * 100);
              return (
                <motion.div 
                  key={survey.id} 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ scale: 1.01, y: -2 }}
                  className={`p-5 rounded-2xl border transition-all duration-300 hover:shadow-xl ${
                    isDarkMode ? 'bg-slate-800/80 border-slate-700' : 'bg-white border-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`p-2.5 rounded-xl bg-gradient-to-r ${
                        survey.status === 'active' ? 'from-emerald-500 to-green-600' : 'from-slate-500 to-slate-600'
                      } shadow-lg`}>
                        <FiMessageCircle className="w-5 h-5 text-white" />
                      </div>
                      <h3 className="font-semibold text-lg">{survey.title}</h3>
                    </div>
                    <motion.span 
                      whileHover={{ scale: 1.05 }}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium ${
                        survey.status === 'active' 
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' 
                          : 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {survey.status}
                    </motion.span>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <div className="flex justify-between mb-2">
                        <span className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Responses</span>
                        <span className="text-sm font-semibold">{survey.responses}/{survey.total}</span>
                      </div>
                      <div className={`h-3 rounded-full overflow-hidden ${isDarkMode ? 'bg-slate-700' : 'bg-slate-200'}`}>
                        <motion.div 
                          className="h-full bg-gradient-to-r from-violet-500 to-purple-600 rounded-full"
                          initial={{ width: 0 }}
                          animate={{ width: `${percentage}%` }}
                          transition={{ duration: 1, ease: 'easeOut', delay: 0.2 }}
                        />
                      </div>
                    </div>
                    <div className={`text-right ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                      <p className="text-sm"><FiCalendar className="inline w-3.5 h-3.5 mr-1" />Due: {survey.dueDate}</p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}

        {/* Recognition Tab */}
        {activeSubTab === 'recognition' && (
          <motion.div 
            key="recognition"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            {[
              { name: 'Rahul Sharma', award: 'Employee of the Month', date: '2026-03', votes: 45 },
              { name: 'Priya Singh', award: 'Best Team Player', date: '2026-03', votes: 38 },
              { name: 'Vikram Rao', award: 'Innovation Award', date: '2026-02', votes: 42 },
            ].map((item, idx) => (
              <motion.div 
                key={idx} 
                initial={{ opacity: 0, y: 20, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ delay: idx * 0.1 }}
                whileHover={{ scale: 1.03, y: -5 }}
                className={`p-6 rounded-2xl border text-center transition-all duration-300 hover:shadow-xl ${
                  isDarkMode ? 'bg-slate-800/80 border-slate-700' : 'bg-white border-slate-200'
                }`}
              >
                <motion.div 
                  className={`w-20 h-20 rounded-full bg-gradient-to-r ${getAvatarGradient(item.name)} mx-auto mb-4 flex items-center justify-center text-white font-bold text-3xl shadow-lg`}
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  animate={{ boxShadow: ['0 0 0 0 rgba(139, 92, 246, 0.4)', '0 0 0 10px rgba(139, 92, 246, 0)', '0 0 0 0 rgba(139, 92, 246, 0)'] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  {item.name.charAt(0)}
                </motion.div>
                <h3 className="font-semibold text-lg">{item.name}</h3>
                <motion.p 
                  className="flex items-center justify-center gap-1 mt-2"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  <FiAward className="w-5 h-5 text-amber-500" />
                  <span className="font-medium bg-gradient-to-r from-amber-500 to-yellow-600 bg-clip-text text-transparent">
                    {item.award}
                  </span>
                </motion.p>
                <p className={`text-sm mt-2 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                  {item.date} • <FiSmile className="inline w-3.5 h-3.5" /> {item.votes} votes
                </p>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default EmployeeEngagementTab;
