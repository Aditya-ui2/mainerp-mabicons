import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Activity, Briefcase, UserPlus, CheckCircle2, MoreVertical, 
  ShieldCheck, RefreshCw, Search, ChevronDown, Calendar, X
} from 'lucide-react';
import { toast } from "sonner";
import { getDepartmentActivityLogs } from '../../../service/api';

const formatTimeAgo = (date) => {
  const now = new Date();
  const past = new Date(date);
  const diffInSeconds = Math.floor((now - past) / 1000);

  if (diffInSeconds < 60) return 'JUST NOW';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} MINS AGO`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} HOURS AGO`;
  return past.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }).toUpperCase();
};

const formatActionName = (text) => {
  if (!text) return 'Registry Activity';
  // Humanize common backend strings
  const map = {
    'job_opening_created': 'Job Opening Created',
    'new_candidate_applied': 'New Candidate Applied',
    'interview_scheduled': 'Interview Scheduled',
    'task_assigned': 'Task Assigned',
    'offer_letter_generated': 'Offer Letter Generated'
  };
  const key = text.toLowerCase();
  if (map[key]) return map[key];

  return text.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
};

const ActivityIcon = ({ type }) => {
  const map = {
    job: { icon: Briefcase, bg: 'bg-[#EFF6FF]', color: 'text-[#3B82F6]' },
    candidate: { icon: UserPlus, bg: 'bg-[#F5F3FF]', color: 'text-[#8B5CF6]' },
    task: { icon: CheckCircle2, bg: 'bg-[#ECFDF5]', color: 'text-[#10B981]' },
    default: { icon: Activity, bg: 'bg-[#F8FAFC]', color: 'text-[#64748B]' }
  };
  const config = map[type.toLowerCase()] || map.default;
  const Icon = config.icon;
  return (
    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${config.bg} ${config.color}`}>
      <Icon size={18} strokeWidth={1.5} />
    </div>
  );
};

const MOCK_ACTIVITIES_RECRUITMENT = [
  { _id: 'a1', action: 'job_opening_created', description: 'New position opened for Senior React Developer (TechNexus)', performedByName: 'Aravind Swamy', actionType: 'job', createdAt: new Date(Date.now() - 3600000).toISOString() },
  { _id: 'a2', action: 'interview_scheduled', description: 'Technical interview scheduled for candidate "Aarti Singh"', performedByName: 'Rahul Kapoor', actionType: 'candidate', createdAt: new Date(Date.now() - 7200000).toISOString() },
  { _id: 'a3', action: 'task_assigned', description: 'Screening task assigned to junior recruiter', performedByName: 'Aravind Swamy', actionType: 'task', createdAt: new Date(Date.now() - 10800000).toISOString() },
];

const MOCK_ACTIVITIES_OPERATIONS = [
  { _id: 'a4', action: 'Payroll Processed', description: 'March 2024 payroll has been successfully processed for 50 employees.', performedByName: 'Priya Sharma', actionType: 'task', createdAt: new Date(Date.now() - 1800000).toISOString() },
  { _id: 'a5', action: 'Compliance Update', description: 'PF and ESI contribution reports generated for Q1.', performedByName: 'Sameer Khan', actionType: 'job', createdAt: new Date(Date.now() - 5400000).toISOString() },
  { _id: 'a6', action: 'Policy Updated', description: 'New Remote Work Policy has been published to all staff.', performedByName: 'Priya Sharma', actionType: 'default', createdAt: new Date(Date.now() - 14400000).toISOString() },
];

const ActivityFeedTab = ({ department = 'HR Operations' }) => {
  const [activities, setActivities] = useState(department === 'HR Recruitment' ? MOCK_ACTIVITIES_RECRUITMENT : MOCK_ACTIVITIES_OPERATIONS);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('all');

  useEffect(() => {
    fetchActivities();
  }, [department]);

  const filteredActivities = activities.filter(activity => {
    const matchesSearch = 
      (activity.action || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (activity.description || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (activity.performedByName || '').toLowerCase().includes(searchTerm.toLowerCase());
      
    let matchesDate = true;
    if (dateFilter !== 'all') {
      const activityDate = new Date(activity.createdAt);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (dateFilter === 'today') {
        matchesDate = activityDate >= today;
      } else if (dateFilter === 'yesterday') {
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        matchesDate = activityDate >= yesterday && activityDate < today;
      } else if (dateFilter === 'week') {
        const lastWeek = new Date(today);
        lastWeek.setDate(lastWeek.getDate() - 7);
        matchesDate = activityDate >= lastWeek;
      }
    }
    
    return matchesSearch && matchesDate;
  });

  const fetchActivities = async () => {
    try {
      setLoading(true);
      const response = await getDepartmentActivityLogs(department, 50);
      const apiActivities = response.activities || [];
      const mockActivities = department === 'HR Recruitment' ? MOCK_ACTIVITIES_RECRUITMENT : MOCK_ACTIVITIES_OPERATIONS;
      setActivities([...mockActivities, ...apiActivities]);
    } catch (error) {
      console.error('Error fetching activities:', error);
      const mockActivities = department === 'HR Recruitment' ? MOCK_ACTIVITIES_RECRUITMENT : MOCK_ACTIVITIES_OPERATIONS;
      setActivities(mockActivities);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-40 gap-3 font-sans">
        <div className="w-10 h-10 rounded-full border-2 border-[#1B4DA0] border-t-transparent animate-spin" />
        <p className="text-[10px] font-bold tracking-widest text-[#94A3B8] uppercase">Syncing Intelligence...</p>
      </div>
    );
  }

  return (
    <div className="p-0 min-h-screen bg-[#FDFDFD] dark:bg-slate-950 text-left">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Syne:wght@400;500;600;700;800&display=swap');
        .font-syne { font-family: 'Syne', sans-serif !important; }
        .font-jakarta { font-family: 'Plus Jakarta Sans', sans-serif !important; }
      `}</style>
      <div className="w-full" style={{ fontFamily: "'Calibri', sans-serif" }}>
        {/* Structural Header (Match Screenshot exactly) */}
        <div className="mb-10 flex justify-between items-center text-left">
          <div>
            <h1 className="text-3xl font-bold font-syne text-[#1A1A2E] dark:text-white tracking-tight">Activity Feed</h1>
            <p className="text-[#9B9BAD] text-sm mt-1 font-medium tracking-wide">Historical log of all recruitment events and team operations</p>
          </div>
        </div>

        {/* Unified Filter Bar */}
        <div className="bg-white dark:bg-slate-800 rounded-[24px] p-2 mb-8 border border-[#F4F3EF] dark:border-slate-700 shadow-sm flex items-center gap-3 flex-wrap">
          {/* Search Bar */}
          <div className="relative flex-1 group min-w-[200px]">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-[#9B9BAD] transition-colors" size={18} />
            <input 
              type="text" 
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by action, description, or team member..." 
              className="w-full bg-[#F4F3EF] dark:bg-slate-900 border-none rounded-2xl py-3 pl-14 pr-5 text-sm font-medium focus:ring-2 focus:ring-[#F4F3EF] outline-none transition-all placeholder:text-[#9B9BAD] dark:text-white" 
            />
          </div>

          {/* Date Filter */}
          <div className="relative">
            <select 
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="bg-[#F4F3EF] dark:bg-slate-900 text-xs font-bold text-[#1A1A2E] dark:text-slate-400 rounded-xl pl-4 pr-10 py-3 outline-none border-0 cursor-pointer appearance-none min-w-[150px] uppercase tracking-widest"
            >
              <option value="all">All Registry</option>
              <option value="today">Today</option>
              <option value="yesterday">Yesterday</option>
              <option value="week">This Week</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9B9BAD] pointer-events-none" size={14} />
          </div>

          {/* Refresh button */}
          <button 
            onClick={fetchActivities}
            className="w-[48px] h-[48px] flex items-center justify-center bg-[#F4F3EF] dark:bg-slate-900 rounded-xl text-[#9B9BAD] dark:text-slate-400 hover:bg-[#1B4DA0] hover:text-white transition-all shadow-sm active:scale-95"
            title="Refresh Data"
          >
            <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
          </button>

          {/* Reset Button */}
          {(searchTerm !== '' || dateFilter !== 'all') && (
            <button 
              onClick={() => { setSearchTerm(''); setDateFilter('all'); }}
              className="px-4 py-2 text-xs font-bold text-[#1B4DA0] hover:underline uppercase tracking-widest transition-all active:scale-95"
            >
              Reset
            </button>
          )}
        </div>

        {/* Main Feed Container */}
        <div className="bg-[#FFFFFF] dark:bg-slate-900 rounded-[32px] border border-[#F4F3EF] dark:border-slate-800 shadow-sm relative overflow-hidden text-left">
          
          {/* Timeline Header Area */}
          <div className="p-8 flex justify-between items-center relative z-10 border-b border-[#F4F3EF] dark:border-slate-800 bg-[#FAFAFA]/50 dark:bg-slate-900/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#1B4DA0] rounded-xl flex items-center justify-center text-white shadow-xl shadow-blue-900/20">
                <Activity size={20} strokeWidth={2} />
              </div>
              <h3 className="text-xl font-bold font-syne text-[#1A1A2E] dark:text-white tracking-tight">Operation Timeline</h3>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-slate-800 border border-[#F4F3EF] dark:border-slate-700 rounded-full shadow-sm">
              <div className="w-1.5 h-1.5 rounded-full bg-[#10B981] shadow-[0_0_8px_#10B981]" />
              <span className="text-[10px] font-bold text-[#64748B] dark:text-slate-400 uppercase tracking-widest">Active Monitoring</span>
            </div>
          </div>

          {/* Vertical Bridge Line */}
          <div className="absolute left-[88px] lg:left-[108px] top-[140px] bottom-[40px] w-px bg-[#F4F3EF] dark:bg-slate-800 pointer-events-none hidden sm:block" />

          {/* Timeline List */}
          <div className="px-8 py-12 space-y-12 relative z-10">
            <AnimatePresence>
              {filteredActivities.map((activity, index) => (
                <motion.div 
                  key={activity._id || index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.02 }}
                  className="flex items-start group relative text-left"
                >
                  {/* 1. Time Column */}
                  <div className="w-20 lg:w-28 flex-shrink-0 pt-3 text-right pr-6 lg:pr-8 hidden sm:block">
                    <span className="text-[9px] font-bold text-[#9B9BAD] uppercase tracking-[2px] leading-none">
                      {formatTimeAgo(activity.createdAt)}
                    </span>
                  </div>

                  {/* 2. Marker Column */}
                  <div className="relative z-10 flex-shrink-0 hidden sm:block">
                    <div className="group-hover:scale-110 transition-transform duration-500">
                      <ActivityIcon type={activity.actionType || 'default'} />
                    </div>
                  </div>

                  {/* 3. Card Column */}
                  <div className="ml-0 sm:ml-6 lg:ml-8 flex-1">
                    <div className="bg-white dark:bg-slate-900 p-6 lg:p-8 rounded-[32px] border border-[#F4F3EF] dark:border-slate-800 shadow-sm hover:shadow-2xl transition-all duration-500 relative group-hover:-translate-y-1 text-left">
                      <div className="flex justify-between items-start">
                        <div className="space-y-4 flex-1">
                          {/* Type Chip */}
                          <div className="inline-flex px-3 py-1 bg-[#EEF2FB] dark:bg-slate-800 border border-[#DBEAFE] dark:border-slate-700 rounded-lg">
                            <span className="text-[9px] font-bold text-[#1B4DA0] dark:text-blue-400 uppercase tracking-widest">
                              {activity.actionType || 'GENERIC'}
                            </span>
                          </div>

                          {/* Text Content */}
                          <div>
                            <h4 className="text-[20px] font-bold font-syne text-[#1A1A2E] dark:text-white tracking-tight leading-none mb-2">
                               {formatActionName(activity.action)}
                            </h4>
                            <p className="text-[#64748B] dark:text-slate-400 text-[13px] font-medium leading-relaxed opacity-80 mt-2">
                              {activity.description}
                            </p>
                          </div>

                          {/* Card Footer: Logged By */}
                          <div className="flex items-center gap-2 pt-2 border-t border-[#F4F3EF] dark:border-slate-800 mt-4">
                             <div className="w-6 h-6 rounded-lg bg-[#F8FAFC] dark:bg-slate-800 flex items-center justify-center text-[10px] font-bold text-[#1B4DA0] dark:text-blue-400 border border-[#F1F5F9] dark:border-slate-700 mt-2">
                               {activity.performedByName?.charAt(0) || 'U'}
                             </div>
                             <span className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-widest mt-2">
                               Logged by <span className="text-[#1A1A2E] dark:text-white ml-0.5 font-bold">{activity.performedByName || 'System Process'}</span>
                             </span>
                          </div>
                        </div>

                        {/* Side Action */}
                        <button className="text-[#94A3B8] hover:text-[#1A1A2E] dark:hover:text-white transition-colors relative z-10">
                          <MoreVertical size={16} />
                        </button>
                      </div>

                      {/* Design Glow */}
                      <div className="absolute -right-2 -bottom-2 w-24 h-24 bg-[#1B4DA0]/5 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            
            {filteredActivities.length === 0 && (
              <div className="text-center py-20">
                 <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">No matching activities found...</p>
              </div>
            )}
          </div>
        </div>

        {/* Neural Branding Footer */}
        <div className="mt-16 py-10 opacity-30 text-center">
           <p className="text-[9px] font-bold text-[#94A3B8] uppercase tracking-[6px]">Neural Intelligence Feed • Managed Architecture</p>
        </div>
      </div>
    </div>
  );
};

export default ActivityFeedTab;
