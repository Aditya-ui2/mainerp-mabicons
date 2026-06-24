import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiClipboard, FiUsers, FiActivity, FiBriefcase, FiTarget, FiSearch, FiChevronDown, FiCalendar, FiX } from 'react-icons/fi';
import TeamMISReportsTab from './TeamMISReportsTab';

const misCategories = [
  { id: 'Recruitment', label: 'Recruitment', icon: FiBriefcase, color: 'blue' },
  { id: 'KAM', label: 'KAM', icon: FiUsers, color: 'purple' },
  { id: 'Operations', label: 'Operations', icon: FiActivity, color: 'emerald' },
  { id: 'Sales', label: 'Sales', icon: FiTarget, color: 'rose' },
];

const SuperAdminMISTab = ({ notificationBell }) => {
  const [activeCategory, setActiveCategory] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  
  // Default date to today in YYYY-MM-DD format (local timezone)
  const [selectedDate, setSelectedDate] = useState(() => {
    const d = new Date();
    const offset = d.getTimezoneOffset();
    const localDate = new Date(d.getTime() - (offset * 60 * 1000));
    return localDate.toISOString().split('T')[0];
  });
  
  const dateInputRef = useRef(null);

  const formattedDate = selectedDate === 'All Dates' 
    ? 'All Dates'
    : new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-IN', {
        weekday: 'long', day: '2-digit', month: 'long', year: 'numeric',
      });

  const openDatePicker = () => {
    if (!dateInputRef.current) return;
    if (typeof dateInputRef.current.showPicker === 'function') {
      dateInputRef.current.showPicker();
      return;
    }
    dateInputRef.current.focus();
    dateInputRef.current.click();
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 text-left">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-[#1A1A2E] font-syne">MIS Reports</h1>
        <div className="flex items-center gap-3">
          {notificationBell}
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-[24px] p-2 border border-[#F4F3EF] shadow-sm flex items-center gap-3 flex-wrap mb-8">
        {/* Search */}
        <div className="relative flex-1 group min-w-[200px]">
          <FiSearch className="absolute left-5 top-1/2 -translate-y-1/2 text-[#9B9BAD] transition-colors" size={18} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, role, email..."
            className="w-full bg-[#F4F3EF] border-none rounded-2xl py-3 pl-14 pr-5 text-sm font-medium focus:ring-2 focus:ring-[#F4F3EF] outline-none transition-all placeholder:text-[#9B9BAD]"
          />
        </div>

        {/* Category select */}
        <div className="relative group">
          <select 
            value={activeCategory}
            onChange={(e) => setActiveCategory(e.target.value)}
            className="bg-[#F4F3EF] text-[11px] font-black uppercase tracking-widest text-[#1A1A2E] rounded-xl pl-4 pr-10 py-2.5 outline-none border-0 cursor-pointer appearance-none min-w-[150px] hover:bg-[#EEF2FB] transition-all"
          >
            <option value="ALL">ALL DEPARTMENTS</option>
            <option value="Recruitment">RECRUITMENT</option>
            <option value="KAM">KAM</option>
            <option value="Operations">OPERATIONS</option>
            <option value="Sales">SALES</option>
          </select>
          <FiChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#1B4DA0] opacity-50 group-hover:opacity-100 transition-all pointer-events-none" />
        </div>

        {/* Status select */}
        <div className="relative group">
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-[#F4F3EF] text-[11px] font-black uppercase tracking-widest text-[#1A1A2E] rounded-xl pl-4 pr-10 py-2.5 outline-none border-0 cursor-pointer appearance-none min-w-[150px] hover:bg-[#EEF2FB] transition-all"
          >
            <option value="ALL">ALL STATUS</option>
            <option value="SUBMITTED">SUBMITTED</option>
            <option value="PENDING">PENDING</option>
          </select>
          <FiChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#1B4DA0] opacity-50 group-hover:opacity-100 transition-all pointer-events-none" />
        </div>

        {/* Date Filter */}
        <div className="relative flex items-center">
          <button
            type="button"
            onClick={openDatePicker}
            className="relative flex items-center gap-2 px-6 py-3 bg-[#1B4DA0] text-white rounded-xl text-[11px] font-bold uppercase tracking-widest hover:bg-[#153e82] transition-all shadow-lg shadow-blue-500/20 active:scale-95 h-[42px]"
          >
            <FiCalendar size={14} />
            <span>{formattedDate}</span>
            <input
              ref={dateInputRef}
              type="date"
              value={selectedDate === 'All Dates' ? '' : selectedDate}
              onChange={(e) => setSelectedDate(e.target.value || 'All Dates')}
              className="absolute inset-0 opacity-0 cursor-pointer"
            />
          </button>
        </div>
      </div>

      {/* Content Area */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`${activeCategory}-${selectedDate}-${statusFilter}`}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          <TeamMISReportsTab 
            department={
              activeCategory === 'ALL' ? 'ALL' :
              activeCategory === 'Recruitment' ? 'HR Recruitment' :
              activeCategory === 'Operations' ? 'HR Operations' :
              activeCategory
            }
            notificationBell={null} // Keep it null so it doesn't double-render
            isEmbedded={true}
            searchQuery={searchQuery}
            externalDate={selectedDate}
            statusFilter={statusFilter}
          />
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default SuperAdminMISTab;
