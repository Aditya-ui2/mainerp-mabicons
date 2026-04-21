import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Activity, Briefcase, UserPlus, CheckCircle2, MoreVertical,
  ShieldCheck, RefreshCw, Search, ChevronDown, Calendar, X, Clock,
  FileText, User
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
    <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center ${config.bg} ${config.color} shadow-sm`}>
      <Icon size={20} strokeWidth={1.5} />
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
  const [specificDate, setSpecificDate] = useState('');
  const [selectedActivity, setSelectedActivity] = useState(null);

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

      if (specificDate) {
        const activityDateStr = activityDate.toDateString();
        const filterDateStr = new Date(specificDate).toDateString();
        matchesDate = activityDateStr === filterDateStr;
      } else if (dateFilter === 'today') {
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
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #E5E7EB; border-radius: 100px; }
        input[type="date"]::-webkit-calendar-picker-indicator {
          display: none;
          -webkit-appearance: none;
        }
      `}</style>

      {/* Activity Detail Drawer */}
      {createPortal(
        <AnimatePresence>
          {selectedActivity && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/30 z-[9999]"
                onClick={() => setSelectedActivity(null)}
              />
              <motion.div
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                className="fixed right-0 top-0 bottom-0 w-full max-w-[520px] bg-white dark:bg-slate-950 z-[10000] shadow-2xl flex flex-col border-l border-[#F4F3EF] dark:border-slate-800"
              >
                {/* Drawer Header */}
                <div className="p-10 pb-6 border-b border-[#F4F3EF] dark:border-slate-800 bg-[#FAFAFA] dark:bg-slate-950">
                  <div className="flex items-start justify-between gap-6">
                    <div className="flex-1 min-w-0">
                      <h2 className="text-2xl font-bold text-[#1A1A2E] dark:text-white font-syne truncate">
                        {formatActionName(selectedActivity.action)}
                      </h2>
                      <p className="text-xs font-medium text-[#9B9BAD] mt-1 flex items-center gap-1.5">
                        <Clock size={12} />
                        {formatTimeAgo(selectedActivity.createdAt)}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setSelectedActivity(null)}
                        className="w-10 h-10 rounded-xl bg-[#F4F3EF] dark:bg-slate-900 text-[#6B6B7E] flex items-center justify-center hover:bg-red-50 dark:hover:bg-red-900/30 hover:text-red-500 transition-all active:scale-90 shadow-sm"
                        title="Close"
                      >
                        <X size={20} />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Drawer Content */}
                <div className="flex-1 p-10 pt-6 space-y-6 overflow-y-auto pb-10 custom-scrollbar text-left scroll-smooth">
                  {/* Type Badge */}
                  <div className="flex items-center gap-3">
                    <div className="inline-flex px-4 py-2 bg-[#EEF2FB] dark:bg-slate-800 border border-[#DBEAFE] dark:border-slate-700 rounded-xl">
                      <span className="text-[10px] font-bold text-[#1B4DA0] dark:text-blue-400 uppercase tracking-widest">
                        {selectedActivity.actionType || 'GENERIC'}
                      </span>
                    </div>
                  </div>

                  {/* Description */}
                  <div className="space-y-4 text-left">
                    <div className="flex items-center gap-3 mb-2 justify-start text-left">
                      <div className="w-8 h-8 rounded-lg bg-[#0D47A1]/5 flex items-center justify-center text-[#0D47A1]">
                        <FileText size={16} />
                      </div>
                      <h4 className="text-sm font-bold text-[#1A1A2E] dark:text-white uppercase tracking-widest text-left">DESCRIPTION</h4>
                    </div>

                    <div className="bg-[#FAFAFA] dark:bg-slate-900 rounded-[24px] border border-[#F4F3EF] dark:border-slate-800 p-8 transition-all duration-300">
                      <p className="text-[#475569] dark:text-slate-300 text-[13.5px] leading-[1.6] font-medium whitespace-pre-wrap text-left opacity-90">
                        {selectedActivity.description}
                      </p>
                    </div>
                  </div>

                  {/* Performed By */}
                  {selectedActivity.performedByName && (
                    <div className="space-y-4 text-left">
                      <div className="flex items-center gap-3 mb-2 justify-start text-left">
                        <div className="w-8 h-8 rounded-lg bg-[#10B981]/5 flex items-center justify-center text-[#10B981]">
                          <User size={16} />
                        </div>
                        <h4 className="text-sm font-bold text-[#1A1A2E] dark:text-white uppercase tracking-widest text-left">PERFORMED BY</h4>
                      </div>

                      <div className="bg-[#FAFAFA] dark:bg-slate-900 rounded-[24px] border border-[#F4F3EF] dark:border-slate-800 p-8 transition-all duration-300">
                        <p className="text-[#475569] dark:text-slate-300 text-[13.5px] leading-[1.6] font-medium text-left">
                          {selectedActivity.performedByName}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>,
        document.body
      )}

      <div className="w-full" style={{ fontFamily: "'Calibri', sans-serif" }}>
        {/* Structural Header (Match Screenshot exactly) */}
        <div className="mb-10 flex justify-between items-center text-left">
          <div>
            <h1 className="text-3xl font-bold font-syne text-[#1A1A2E] dark:text-white tracking-tight">Activity Feed</h1>

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

          {/* Specific Date Picker */}
          <div 
            className="relative group cursor-pointer"
            onClick={(e) => {
              const input = e.currentTarget.querySelector('input[type="date"]');
              if (input && typeof input.showPicker === 'function') {
                input.showPicker();
              }
            }}
          >
            <Calendar className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${specificDate ? 'text-[#1B4DA0]' : 'text-[#9B9BAD]'}`} size={16} />
            <input
              type="date"
              value={specificDate}
              onChange={(e) => {
                setSpecificDate(e.target.value);
                if (e.target.value) setDateFilter('all');
              }}
              className={`bg-[#F4F3EF] dark:bg-slate-900 text-[11px] font-bold uppercase tracking-widest rounded-xl pl-12 pr-4 py-3 outline-none border-none cursor-pointer transition-all ${specificDate ? 'text-[#1B4DA0] ring-1 ring-[#1B4DA0]/20' : 'text-[#1A1A2E] dark:text-slate-400'}`}
            />
            {specificDate && (
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  setSpecificDate('');
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-500 transition-colors z-20"
                title="Clear Date"
              >
                <X size={14} />
              </button>
            )}
          </div>

           



        </div>

        {/* Main Feed Container */}
        <div className="bg-[#FFFFFF] dark:bg-slate-900 rounded-[32px] border border-[#F4F3EF] dark:border-slate-800 shadow-sm relative overflow-hidden text-left">

          {/* Timeline Header Area */}
          <div className="p-8 flex justify-between items-center relative z-10 border-b border-[#F4F3EF] dark:border-slate-800 bg-[#FAFAFA]/50 dark:bg-slate-900/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#1B4DA0] rounded-xl flex items-center justify-center text-white shadow-xl shadow-blue-900/20">
                <Activity size={20} strokeWidth={2} />
              </div>
              <h3 className="text-xl font-bold font-syne text-[#1A1A2E] dark:text-white tracking-tight">Activity Timeline</h3>
            </div>
          </div>
          {/* Vertical Bridge Line */}
          <div className="absolute left-[116px] sm:left-[128px] top-[100px] bottom-[40px] w-px bg-[#F4F3EF] dark:bg-slate-800 pointer-events-none hidden sm:block" />

          {/* Timeline List */}
          <div className="px-8 py-12 space-y-8 relative z-10">
            <AnimatePresence>
              {filteredActivities.map((activity, index) => {
                const activityDate = new Date(activity.createdAt);
                const dateStr = activityDate.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }).toUpperCase();

                return (
                  <motion.div
                    key={activity._id || index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.02 }}
                    className="flex items-center gap-4 sm:gap-6 group relative text-left"
                  >
                    {/* Time Column */}
                    <div className="w-16 sm:w-20 flex-shrink-0 text-right hidden sm:block">
                      <span className="text-[9px] font-bold text-[#9B9BAD] uppercase tracking-[2px] leading-none">
                        {dateStr}
                      </span>
                    </div>

                    {/* Marker */}
                    <div className="relative z-10 flex-shrink-0 group-hover:scale-110 transition-transform duration-500">
                      <ActivityIcon type={activity.actionType || 'default'} />
                    </div>

                    {/* Card */}
                    <div className="flex-1">
                      <div 
                        onClick={() => setSelectedActivity(activity)}
                        className="bg-white dark:bg-slate-900 p-6 rounded-[24px] border border-[#F4F3EF] dark:border-slate-800 shadow-sm hover:shadow-2xl transition-all duration-500 relative cursor-pointer group-hover:-translate-y-1 text-left"
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            {/* Mobile date */}
                            <span className="text-[9px] font-bold text-[#9B9BAD] uppercase tracking-[2px] sm:hidden mb-2 block">
                              {dateStr}
                            </span>
                            <h4 className="text-[18px] font-bold font-syne text-[#1A1A2E] dark:text-white tracking-tight leading-tight mb-2 group-hover:text-[#1B4DA0] transition-colors">
                              {formatActionName(activity.action)}
                            </h4>
                            <p className="text-[#64748B] dark:text-slate-400 text-[13px] font-medium leading-relaxed opacity-80 line-clamp-2">
                              {activity.description}
                            </p>
                          </div>
                        </div>

                        {/* Design Glow */}
                        <div className="absolute -right-2 -bottom-2 w-24 h-24 bg-[#1B4DA0]/5 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                      </div>
                    </div>
                  </motion.div>
                );
              })}
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
