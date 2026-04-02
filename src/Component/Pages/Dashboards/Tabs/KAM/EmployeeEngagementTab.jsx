

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiHeart, FiUsers, FiCalendar, FiGift, FiMessageCircle, FiPlus, FiStar, FiTrendingUp, FiAward, FiSmile, FiArrowLeft, FiChevronRight, FiSearch, FiTarget, FiDownload, FiCheckCircle } from 'react-icons/fi';

const EmployeeEngagementTab = ({ isDarkMode, selectedClient }) => {
  const [activities, setActivities] = useState([]);
  const [surveys, setSurveys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeSubTab, setActiveSubTab] = useState('Activities');
  const [view, setView] = useState('list');
  const [selectedItem, setSelectedItem] = useState(null);

  useEffect(() => {
    const mockActivities = [
      { id: 1, title: 'Team Outing - Goa Trip', date: '2026-03-25', participants: 45, status: 'upcoming', category: 'Team Building', description: 'Annual team retreat to Goa for relaxation and team bonding activities.', budget: '₹2,50,000', location: 'Goa, India' },
      { id: 2, title: 'Birthday Celebration - March', date: '2026-03-20', participants: 12, status: 'upcoming', category: 'Celebration', description: 'Monthly birthday celebration for the March-born employees with cake and snacks.', budget: '₹5,000', location: 'Office Cafeteria' },
      { id: 3, title: 'Quarterly Town Hall', date: '2026-03-15', participants: 150, status: 'completed', category: 'Communication', description: 'Review of Q1 performance and roadmap for Q2 2026.', budget: '₹15,000', location: 'Main Conference Hall' },
      { id: 4, title: 'Wellness Week', date: '2026-03-10', participants: 80, status: 'completed', category: 'Wellness', description: 'A week focused on mental and physical health with yoga sessions and health checkups.', budget: '₹50,000', location: 'Virtual & Office' },
      { id: 5, title: 'Hackathon 2026', date: '2026-04-05', participants: 30, status: 'upcoming', category: 'Learning', description: '24-hour innovation challenge for the tech team to build new product prototypes.', budget: '₹1,00,000', location: 'Tech Hub' },
    ];
    const mockSurveys = [
      { id: 1, title: 'Employee Satisfaction Survey Q1', responses: 120, total: 150, status: 'active', dueDate: '2026-03-31', type: 'Clinical Audit', integrity: 'High' },
      { id: 2, title: 'Work-Life Balance Feedback', responses: 85, total: 150, status: 'completed', dueDate: '2026-02-28', type: 'Pulse Audit', integrity: 'Medium' },
      { id: 3, title: 'Manager Effectiveness Survey', responses: 45, total: 50, status: 'completed', dueDate: '2026-02-15', type: 'Leadership Check', integrity: 'High' },
    ];
    setTimeout(() => {
      setActivities(mockActivities);
      setSurveys(mockSurveys);
      setLoading(false);
    }, 500);
  }, [selectedClient]);

  const engagementScore = 78;
  const statCards = [
    { label: 'Engagement Index', value: `${engagementScore}%`, icon: FiHeart, gradient: 'from-[#3FA9F5] via-[#1E88E5] to-[#0D47A1]' },
    { label: 'Live Activities', value: activities.filter(a => a.status === 'upcoming').length, icon: FiCalendar, gradient: 'from-[#81C784] to-[#43A047]' },
    { label: 'Active Participation', value: '85%', icon: FiUsers, gradient: 'from-[#FFB300] to-[#F57C00]' },
    { label: 'Pulse Surveys', value: surveys.filter(s => s.status === 'active').length, icon: FiMessageCircle, gradient: 'from-[#f43f5e] to-[#881337]' },
  ];

  if (loading) {
    return (
      <div className="space-y-6 text-left">
        <div className={`h-8 w-64 rounded-lg animate-pulse ${isDarkMode ? 'bg-slate-700' : 'bg-slate-200'}`}></div>
        <div className={`h-48 rounded-[2rem] animate-pulse ${isDarkMode ? 'bg-slate-800' : 'bg-slate-100'}`}></div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className={`h-24 rounded-2xl animate-pulse ${isDarkMode ? 'bg-slate-800' : 'bg-slate-100'}`}></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={`relative min-h-[600px] font-[Outfit] ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
      <AnimatePresence mode="wait">
        {view === 'list' && (
          <motion.div
            key="list"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="space-y-10"
          >
            {/* Premium Header */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-12">
              <div className="flex items-center gap-4 text-left">
                <div className="p-4 rounded-2xl bg-gradient-to-br from-[#3FA9F5] via-[#1E88E5] to-[#0D47A1] shadow-xl shadow-blue-500/20">
                  <FiHeart className="w-8 h-8 text-white" />
                </div>
                <div className="flex flex-col">
                  <h2 className="text-3xl lg:text-4xl font-black text-[#1E88E5] tracking-tight mb-1">
                    Engagement Hub
                  </h2>
                  <div className="flex items-center gap-2 text-slate-600 font-bold">
                    <FiTrendingUp className="w-4 h-4" />
                    <span className="text-sm">
                      Culture Milestone • {engagementScore}% Happiness Index
                    </span>
                  </div>
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setView('add')}
                className="flex items-center justify-center gap-2.5 px-6 py-3 bg-gradient-to-r from-[#3FA9F5] via-[#1E88E5] to-[#0D47A1] text-white rounded-[1.2rem] font-black shadow-xl shadow-blue-500/30 transition-all text-[11px]"
              >
                <FiPlus className="w-4 h-4" />
                Initiate Activity
              </motion.button>
            </div>

            {/* Score Insight Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`relative overflow-hidden rounded-[3rem] p-10 border ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-gradient-to-br from-indigo-50 to-blue-50 border-white shadow-xl shadow-blue-500/5'}`}
            >
              <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-10 text-left text-left">
                <div className="space-y-6">
                  <div>
                    <h3 className="text-[13px] font-black text-blue-600 uppercase tracking-[0.2em] mb-2">Happiness Pulse Index</h3>
                    <p className="text-6xl lg:text-7xl font-black bg-gradient-to-r from-[#1E88E5] to-[#0D47A1] bg-clip-text text-transparent leading-none">
                      {engagementScore}%
                    </p>
                  </div>
                  <div className="flex items-center gap-4 py-2 px-5 bg-emerald-50 text-emerald-600 rounded-full w-fit border border-emerald-100">
                    <FiTrendingUp className="w-5 h-5" />
                    <span className="text-sm font-black text-[11px] uppercase tracking-widest">+5% Retention Growth</span>
                  </div>
                  <p className="max-w-md text-base font-medium text-slate-500 leading-relaxed capitalize text-left">Your workforce is currently experiencing peak productivity and cultural alignment.</p>
                </div>
                <div className="relative flex-shrink-0">
                  <div className={`w-48 h-48 rounded-full border-[12px] flex items-center justify-center ${isDarkMode ? 'border-slate-800' : 'border-white'}`}>
                    <FiAward className="w-20 h-20 text-[#1E88E4]" />
                    <svg className="absolute inset-0 w-full h-full -rotate-90">
                      <circle cx="96" cy="96" r="84" fill="none" stroke="currentColor" strokeWidth="12" className="text-blue-500" strokeDasharray={`${engagementScore * 5.27} 527`} strokeLinecap="round" />
                    </svg>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Stats Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {statCards.map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`relative p-8 rounded-3xl border transition-all duration-300 ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100 shadow-sm'}`}
                >
                  <div className="relative z-10 flex flex-col gap-4 text-left">
                    <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.gradient} w-fit shadow-lg shadow-blue-500/10`}>
                      <stat.icon className="w-5 h-5 text-white" />
                    </div>
                    <p className={`text-[12px] font-black uppercase tracking-widest ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>{stat.label}</p>
                    <p className="text-3xl font-black leading-none">{stat.value}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Navigation Switcher */}
            <div className={`flex gap-3 p-2 rounded-[1.5rem] w-fit ${isDarkMode ? 'bg-slate-900' : 'bg-slate-100'}`}>
              {['Activities', 'Surveys', 'Recognition'].map((tab) => (
                <motion.button
                  key={tab}
                  whileHover={{ y: -1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setActiveSubTab(tab)}
                  className={`px-8 py-3 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all ${activeSubTab === tab
                    ? 'bg-gradient-to-r from-[#3FA9F5] via-[#1E88E5] to-[#0D47A1] text-white shadow-xl shadow-blue-500/20'
                    : 'text-slate-500 hover:text-blue-600'
                    }`}
                >
                  {tab}
                </motion.button>
              ))}
            </div>

            {/* Dynamic Content Grid */}
            <div className="flex flex-col gap-4 pb-12 max-w-6xl mx-auto">
              <AnimatePresence mode="wait">
                {activeSubTab === 'Activities' && (
                  <motion.div key="act" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-4">
                    {activities.map((activity, idx) => (
                      <motion.div
                        key={activity.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        onClick={() => { setSelectedItem({ ...activity, type: 'Activity' }); setView('details'); }}
                        className={`group relative overflow-hidden rounded-[2.5rem] border transition-all duration-300 cursor-pointer ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-[#f8fbff] border-white shadow-sm hover:shadow-md hover:border-blue-500/20'}`}
                      >
                        <div className="p-4 px-10 flex items-center justify-between gap-6">
                          <div className="flex items-center gap-6 min-w-[350px] text-left">
                            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#3FA9F5] via-[#1E88E5] to-[#0D47A1] flex items-center justify-center text-white font-black shadow-lg">
                              <FiStar className="w-6 h-6" />
                            </div>
                            <div className="flex flex-col">
                              <h3 className="font-extrabold text-xl text-slate-800 dark:text-white capitalize leading-tight">{activity.title}</h3>
                              <div className="flex items-center gap-3 mt-1.5 font-bold text-[10px] text-slate-400 uppercase tracking-widest">
                                <FiCalendar className="w-3 h-3" /> {new Date(activity.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long' })}
                                <span className="w-1.5 h-1.5 rounded-full bg-slate-300 mx-1" />
                                <FiUsers className="w-3 h-3" /> {activity.participants} Hub Participants
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <span className={`px-5 py-2.5 rounded-full text-[11px] font-black uppercase tracking-widest border ${activity.status === 'upcoming' ? 'bg-blue-50 text-blue-600 border-blue-100' : 'bg-emerald-50 text-emerald-600 border-emerald-100'
                              } shadow-sm`}>{activity.status}</span>
                            <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 text-slate-400 group-hover:text-blue-500 transition-colors shadow-sm">
                              <FiChevronRight className="w-6 h-6" />
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </motion.div>
                )}

                {activeSubTab === 'Surveys' && (
                  <motion.div key="sur" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-4">
                    {surveys.map((survey, idx) => (
                      <motion.div
                        key={survey.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        onClick={() => { setSelectedItem({ ...survey, type: 'Survey' }); setView('details'); }}
                        className={`group relative overflow-hidden rounded-[2.5rem] border transition-all duration-300 cursor-pointer ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100 shadow-sm hover:shadow-md hover:border-blue-500/20'}`}
                      >
                        <div className="p-6 px-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                          <div className="flex items-center gap-6 min-w-[400px] text-left">
                            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#3FA9F5] via-[#1E88E5] to-[#0D47A1] flex items-center justify-center text-white">
                              <FiMessageCircle className="w-6 h-6" />
                            </div>
                            <div className="flex flex-col">
                              <h3 className="font-extrabold text-xl capitalize leading-tight">{survey.title}</h3>
                              <p className="text-[11px] font-bold text-slate-400 mt-2 uppercase tracking-widest">Protocol Matrix • Due {new Date(survey.dueDate).toLocaleDateString('en-IN')}</p>
                            </div>
                          </div>
                          <div className="flex-1 max-w-sm text-left">
                            <div className="flex justify-between items-center mb-3">
                              <span className="text-[11px] font-black uppercase text-blue-600">Response Integrity</span>
                              <span className="text-sm font-black">{Math.round((survey.responses / survey.total) * 100)}% Verified</span>
                            </div>
                            <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden border border-slate-200 dark:border-slate-700">
                              <motion.div initial={{ width: 0 }} animate={{ width: `${(survey.responses / survey.total) * 100}%` }} className="h-full bg-gradient-to-r from-[#3FA9F5] to-[#0D47A1]" />
                            </div>
                          </div>
                          <motion.button
                            whileHover={{ scale: 1.05, y: -2 }}
                            whileTap={{ scale: 0.95 }}
                            className="px-6 py-3 bg-gradient-to-r from-[#3FA9F5] via-[#1E88E5] to-[#0D47A1] text-white rounded-xl text-[11px] font-black shadow-xl shadow-blue-500/20"
                          >
                            Retrieve Audit
                          </motion.button>
                        </div>
                      </motion.div>
                    ))}
                  </motion.div>
                )}

                {activeSubTab === 'Recognition' && (
                  <motion.div key="rec" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[
                      { id: 'r1', name: 'Rahul Sharma', award: 'Employee of the Month', date: '2026-03', votes: 45, category: 'Award' },
                      { id: 'r2', name: 'Priya Singh', award: 'Best Team Player', date: '2026-03', votes: 38, category: 'Award' },
                      { id: 'r3', name: 'Vikram Rao', award: 'Innovation Award', date: '2026-02', votes: 42, category: 'Award' },
                    ].map((item, idx) => (
                      <motion.div
                        key={item.id}
                        whileHover={{ y: -10 }}
                        onClick={() => { setSelectedItem({ ...item, type: 'Recognition', title: item.award }); setView('details'); }}
                        className={`p-10 rounded-[3.5rem] border text-center transition-all duration-300 relative overflow-hidden cursor-pointer ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100 shadow-xl shadow-blue-500/5'}`}
                      >
                        <div className="absolute top-0 right-0 p-8 opacity-5">
                          <FiAward className="w-24 h-24" />
                        </div>
                        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#3FA9F5] via-[#1E88E5] to-[#0D47A1] mx-auto mb-6 flex items-center justify-center text-white font-black text-4xl shadow-2xl">
                          {item.name.charAt(0)}
                        </div>
                        <h3 className="text-2xl font-black mb-2">{item.name}</h3>
                        <div className="px-5 py-2 whitespace-nowrap bg-blue-50 text-[#1E88E5] rounded-full text-[11px] font-black uppercase tracking-widest w-fit mx-auto mb-6 border border-blue-100">{item.award}</div>
                        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">{item.date} • {item.votes} Happiness Votes</p>
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}

        {view === 'add' && (
          <motion.div
            key="add"
            initial={{ x: '100%', opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="space-y-10"
          >
            <div className="flex flex-col gap-8 text-left">
              <motion.button
                whileHover={{ x: -10 }}
                onClick={() => setView('list')}
                className="flex items-center gap-2.5 self-start px-6 py-3 rounded-xl border-2 border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all font-black text-[11px]"
              >
                <FiArrowLeft className="w-4 h-4" />
                Return To Hub
              </motion.button>
              <div className="flex items-center gap-6">
                <div className="p-6 rounded-[2.5rem] bg-gradient-to-br from-[#3FA9F5] via-[#1E88E5] to-[#0D47A1] shadow-2xl shadow-blue-500/20">
                  <FiPlus className="w-12 h-12 text-white" />
                </div>
                <div className="flex flex-col text-left">
                  <h2 className="text-5xl font-black text-slate-900 dark:text-white tracking-tight leading-none">Initiate Engagement</h2>
                  <p className="text-sm font-bold text-[#1E88E5] mt-4 ml-1 uppercase tracking-widest underline decoration-2 underline-offset-8 text-left">Corporate Culture Protocol</p>
                </div>
              </div>
            </div>

            <div className={`p-16 rounded-[4rem] border-2 text-left ${isDarkMode ? 'bg-slate-900 border-slate-800 shadow-2xl' : 'bg-white border-slate-100 shadow-2xl shadow-blue-500/10'}`}>
              <form className="space-y-12">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                  <div className="space-y-4 text-left">
                    <label className="block text-[11px] font-black text-[#1E88E5] ml-2 uppercase tracking-widest">Protocol Title</label>
                    <input type="text" placeholder="Enter Activity Theme" className={`w-full rounded-2xl border-2 px-6 py-5 transition-all outline-none font-bold text-base ${isDarkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-50 border-slate-100'}`} />
                  </div>
                  <div className="space-y-4 text-left text-left">
                    <label className="block text-[11px] font-black text-[#1E88E5] ml-2 uppercase tracking-widest">Culture Classification</label>
                    <select className={`w-full rounded-2xl border-2 px-6 py-5 transition-all outline-none font-bold text-base ${isDarkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-50 border-slate-100'}`}>
                      <option>Team Building</option>
                      <option>Recognition</option>
                      <option>Wellness</option>
                    </select>
                  </div>
                  <div className="space-y-4 text-left">
                    <label className="block text-[11px] font-black text-[#1E88E5] ml-2 uppercase tracking-widest">Milestone Date</label>
                    <input type="date" className={`w-full rounded-2xl border-2 px-6 py-5 transition-all outline-none font-bold text-base ${isDarkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-50 border-slate-100'}`} />
                  </div>
                  <div className="space-y-4 text-left">
                    <label className="block text-[11px] font-black text-[#1E88E5] ml-2 uppercase tracking-widest">Estimated Attendance</label>
                    <input type="number" placeholder="Capacity Hub" className={`w-full rounded-2xl border-2 px-6 py-5 transition-all outline-none font-bold text-base ${isDarkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-50 border-slate-100'}`} />
                  </div>
                </div>
                <motion.button
                  whileHover={{ scale: 1.02, y: -5 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setView('list')}
                  className="px-16 py-6 bg-gradient-to-r from-[#3FA9F5] via-[#1E88E5] to-[#0D47A1] text-white rounded-[2rem] font-black text-[13px] shadow-2xl shadow-blue-500/40"
                >
                  Deploy Activity Hub
                </motion.button>
              </form>
            </div>
          </motion.div>
        )}

        {view === 'details' && selectedItem && (
          <motion.div
            key="details"
            initial={{ x: '100%', opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="space-y-10"
          >
            <div className="flex flex-col gap-8 text-left">
              <motion.button
                whileHover={{ x: -10 }}
                onClick={() => setView('list')}
                className="flex items-center gap-2.5 self-start px-6 py-3 rounded-xl border-2 border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all font-black text-[11px]"
              >
                <FiArrowLeft className="w-4 h-4" />
                Return To Hub
              </motion.button>
              <div className="flex items-center gap-8 text-left">
                <div className="w-32 h-32 rounded-[2.5rem] bg-gradient-to-br from-[#3FA9F5] via-[#1E88E5] to-[#0D47A1] flex items-center justify-center text-white font-black text-5xl shadow-2xl shadow-blue-500/30">
                  {selectedItem.type === 'Activity' ? <FiStar className="w-16 h-16" /> : <FiMessageCircle className="w-16 h-16" />}
                </div>
                <div className="flex flex-col text-left">
                  <h2 className="text-5xl font-black text-slate-900 dark:text-white tracking-tight leading-none capitalize">{selectedItem.title}</h2>
                  <div className="flex items-center gap-3 mt-4">
                    <span className="px-4 py-1.5 bg-blue-50 dark:bg-blue-900/30 text-[#1E88E5] rounded-full text-[11px] font-black uppercase tracking-widest">{selectedItem.category || selectedItem.type} Monitoring</span>
                    <span className={`px-4 py-1.5 rounded-full text-[11px] font-black capitalize ${selectedItem.status === 'upcoming' || selectedItem.status === 'active' ? 'bg-blue-50 text-blue-600' : 'bg-emerald-50 text-emerald-600'
                      }`}>Protocol {selectedItem.status}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 text-left">
              <div className={`col-span-1 lg:col-span-2 p-12 rounded-[3.5rem] border ${isDarkMode ? 'bg-slate-900 border-slate-800 shadow-2xl' : 'bg-white border-slate-100 shadow-2xl shadow-blue-500/5'}`}>
                <div className="space-y-10">
                  <div className="border-b border-slate-100 dark:border-slate-800 pb-8 space-y-4">
                    <h3 className="text-2xl font-black text-slate-900 dark:text-white capitalize">Directive Implementation Audit</h3>
                    <p className="text-base font-bold text-slate-500 dark:text-slate-400 leading-relaxed capitalize text-left">
                      {selectedItem.description || "Comprehensive engagement analysis for organizational cultural alignment and workforce satisfaction monitoring."}
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-8 text-left">
                    <div className="p-6 rounded-3xl bg-slate-50 dark:bg-slate-800/20 border border-slate-100 dark:border-slate-800 text-left">
                      <p className="text-[10px] font-black text-blue-600 mb-2 uppercase tracking-widest">Milestone Date</p>
                      <p className="text-xl font-extrabold text-slate-800 dark:text-white">{new Date(selectedItem.date || selectedItem.dueDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                    </div>
                    <div className="p-6 rounded-3xl bg-slate-50 dark:bg-slate-800/20 border border-slate-100 dark:border-slate-800 text-left">
                      <p className="text-[10px] font-black text-blue-600 mb-2 uppercase tracking-widest">Target Attendance</p>
                      <p className="text-xl font-extrabold text-slate-800 dark:text-white">{selectedItem.participants || selectedItem.total || 0} Professional Hubs</p>
                    </div>
                    {selectedItem.location && (
                      <div className="p-6 rounded-3xl bg-slate-50 dark:bg-slate-800/20 border border-slate-100 dark:border-slate-800">
                        <p className="text-[10px] font-black text-blue-600 mb-2 uppercase tracking-widest">Strategic Venue</p>
                        <p className="text-xl font-extrabold text-slate-800 dark:text-white">{selectedItem.location}</p>
                      </div>
                    )}
                    {selectedItem.integrity && (
                      <div className="p-6 rounded-3xl bg-slate-50 dark:bg-slate-800/20 border border-slate-100 dark:border-slate-800">
                        <p className="text-[10px] font-black text-blue-600 mb-2 uppercase tracking-widest">Audit Integrity</p>
                        <p className="text-xl font-extrabold text-slate-800 dark:text-white">{selectedItem.integrity} Verification</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-8 text-left">
                <div className={`p-10 rounded-[3rem] border ${isDarkMode ? 'bg-slate-900 border-slate-800 shadow-2xl' : 'bg-gradient-to-br from-[#1E88E5] to-[#0D47A1] border-blue-500 shadow-2xl shadow-blue-500/20'}`}>
                  <div className="space-y-6 text-white text-left">
                    <p className="text-[11px] font-black uppercase tracking-[0.2em] opacity-60">Engagement Matrix</p>
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-black">{selectedItem.status === 'completed' ? 'Fully Certified' : 'Active Protocol'}</span>
                      <FiCheckCircle className="w-8 h-8 text-emerald-400" />
                    </div>
                    <div className="w-full h-2 rounded-full overflow-hidden bg-white/20">
                      <div className={`h-full shadow-[0_0_15px_rgba(52,211,153,0.5)] ${selectedItem.status === 'completed' ? 'w-full bg-emerald-400' : 'w-1/2 bg-amber-400'}`}></div>
                    </div>
                    <div className="space-y-4 pt-4 border-t border-white/10">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center font-black text-sm">KAM</div>
                        <div>
                          <p className="text-xs font-black opacity-60 uppercase">Strategy Lead</p>
                          <p className="text-sm font-black text-left">Protocol Verified</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-4">
                  <motion.button
                    whileHover={{ scale: 1.02, y: -5 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full py-6 bg-gradient-to-r from-[#3FA9F5] via-[#1E88E5] to-[#0D47A1] text-white rounded-[2rem] font-black text-[12px] shadow-2xl shadow-blue-500/30"
                  >
                    Download Audit Report
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02, y: -5 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setView('list')}
                    className="w-full px-12 py-6 bg-gradient-to-r from-[#3FA9F5] via-[#1E88E5] to-[#0D47A1] text-white rounded-[2rem] font-black text-[12px] shadow-2xl shadow-blue-500/30 flex items-center justify-center gap-3"
                  >
                    Return To Hub
                  </motion.button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default EmployeeEngagementTab;