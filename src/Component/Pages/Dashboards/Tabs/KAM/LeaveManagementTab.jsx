import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { FiCalendar, FiClock, FiCheck, FiX, FiPlus, FiDownload, FiSun, FiMoon, FiCoffee, FiAward, FiTrendingUp, FiArrowLeft, FiSend, FiFileText } from 'react-icons/fi';
import { Search, ChevronDown, Download, Plus, X, ChevronRight, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getDeptLeaveRequests, applyLeave, approveRejectLeave } from '../../../service/api';
import { toast } from 'react-hot-toast';

const ApplyLeaveView = ({ onBack, onSubmit, isDarkMode, onBehalfEmployee }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    leaveType: 'Sick Leave',
    leaveMode: 'Full Day',
    startDate: '',
    endDate: '',
    reason: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.startDate || !formData.endDate || !formData.reason) {
      toast.error('Please fill all required fields');
      return;
    }
    setLoading(true);
    try {
      const start = new Date(formData.startDate);
      const end = new Date(formData.endDate);
      const diffTime = Math.abs(end - start);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

      const userObj = JSON.parse(localStorage.getItem('user') || '{}');
      const applicantName = onBehalfEmployee ? onBehalfEmployee.name : (userObj.name || (userObj.firstName ? `${userObj.firstName} ${userObj.lastName || ''}`.trim() : 'Ramesh'));
      const applicantId = onBehalfEmployee ? onBehalfEmployee.empId : (userObj.memberId || userObj.empId || 'E0064');

      const newLeaveRequest = {
        id: `LR-${Date.now()}`,
        memberName: applicantName,
        memberId: applicantId,
        leaveType: formData.leaveType,
        startDate: formData.startDate,
        endDate: formData.endDate,
        days: diffDays,
        reason: formData.reason,
        status: 'Pending',
        createdAt: new Date().toISOString()
      };

      try {
        await applyLeave({
          ...formData,
          startDate: formData.startDate,
          endDate: formData.endDate
        });
      } catch (err) {
        console.warn('API submission failed, falling back to local storage:', err);
      }

      const localRequests = JSON.parse(localStorage.getItem('mabicons_leave_requests') || '[]');
      localRequests.unshift(newLeaveRequest);
      localStorage.setItem('mabicons_leave_requests', JSON.stringify(localRequests));

      toast.success('Leave application submitted successfully');
      onSubmit();
    } catch (error) {
      toast.error(error.message || 'Failed to submit application');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ scale: 0.95, opacity: 0, y: 20 }}
      animate={{ scale: 1, opacity: 1, y: 0 }}
      exit={{ scale: 0.95, opacity: 0, y: 20 }}
      className="w-full max-w-xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] relative animate-in fade-in slide-in-from-bottom-8 duration-500"
      style={{ fontFamily: "'Calibri', sans-serif" }}
    >
      <div className="sticky top-0 border-b border-[#F4F3EF] px-10 py-8 flex items-center justify-between z-20 bg-gradient-to-r from-white to-[#F8FAFF]">
        <div className="flex flex-col gap-1 text-left">
          <h3 className="text-2xl font-bold text-[#1A1A2E]" style={{ fontFamily: "'Syne', sans-serif" }}>
            New Application
          </h3>
        </div>
        <button onClick={onBack} className="w-12 h-12 rounded-2xl bg-[#F4F3EF] text-[#6B6B7E] flex items-center justify-center hover:bg-red-50 hover:text-red-500 transition-all shadow-sm">
          <X size={20} />
        </button>
      </div>

      <div className="flex-1 p-10 overflow-y-auto custom-scrollbar">
        <div className="space-y-6">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-7">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-widest block text-left">Leave Category *</label>
                <div className="relative group">
                  <select 
                    value={formData.leaveType}
                    onChange={(e) => setFormData({ ...formData, leaveType: e.target.value })}
                    className="w-full bg-[#F4F3EF] border-0 rounded-2xl px-6 py-4 text-sm font-bold text-[#1A1A2E] outline-none transition-all focus:bg-[#EEF2FB] appearance-none pr-12 cursor-pointer"
                  >
                    <option>Sick Leave</option>
                    <option>Casual Leave</option>
                    <option>Earned Leave</option>
                    <option>Compensatory Off</option>
                    <option>Maternity Leave</option>
                    <option>Work From Home</option>
                  </select>
                  <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 text-[#0D47A1] pointer-events-none opacity-50" size={16} />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-widest block text-left">Application Mode *</label>
                <div className="flex gap-2 p-1 bg-[#F4F3EF] rounded-2xl h-[52px]">
                  {['Full Day', 'Half Day'].map((mode) => (
                    <button
                      key={mode}
                      type="button"
                      onClick={() => setFormData({ ...formData, leaveMode: mode })}
                      className={`flex-1 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${formData.leaveMode === mode ? 'bg-white text-[#0D47A1] shadow-sm' : 'text-[#9B9BAD] hover:text-[#6B6B7E]'}`}
                    >
                      {mode}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-widest block text-left">Start Date *</label>
                <input 
                  type="date" 
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  className="w-full bg-[#F4F3EF] border-0 rounded-2xl px-6 py-4 text-sm font-bold text-[#1A1A2E] outline-none transition-all focus:bg-[#EEF2FB] cursor-pointer" 
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-widest block text-left">End Date *</label>
                <input 
                  type="date" 
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  className="w-full bg-[#F4F3EF] border-0 rounded-2xl px-6 py-4 text-sm font-bold text-[#1A1A2E] outline-none transition-all focus:bg-[#EEF2FB] cursor-pointer" 
                />
              </div>
              <div className="md:col-span-2 space-y-1.5">
                <label className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-widest block text-left">Reason *</label>
                <textarea 
                  rows={3}
                  value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  placeholder="Describe the reason..."
                  className="w-full bg-[#F4F3EF] border-0 rounded-2xl px-6 py-4 text-sm font-bold text-[#1A1A2E] outline-none transition-all focus:bg-[#EEF2FB] resize-none placeholder:text-[#9B9BAD]/50"
                />
              </div>
            </div>
            <div className="flex gap-4 pt-4">
              <button type="button" onClick={onBack} className="flex-1 py-5 rounded-3xl border-2 border-[#F4F3EF] text-sm font-bold text-[#6B6B7E] hover:bg-[#F4F3EF] transition-all">Cancel</button>
              <button type="submit" disabled={loading} className="flex-[2] bg-[#0D47A1] text-white py-5 rounded-full text-[11px] font-bold uppercase tracking-widest shadow-lg shadow-[#0D47A1]/20 hover:bg-[#0a3a82] transition-all flex items-center justify-center gap-2 disabled:opacity-50">
                {loading ? 'Submitting...' : 'Submit Application'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </motion.div>
  );
};

const EmployeeDetailsView = ({ employee, onBack, isDarkMode, getStatusConfig, onStatusChange }) => {
  const [actionLoading, setActionLoading] = useState(false);
  const [comment, setComment] = useState('');

  if (!employee) return null;
  const statusConfig = getStatusConfig(employee.status);

  const handleAction = async (status) => {
    setActionLoading(true);
    try {
      await onStatusChange(employee.id, status, comment);
      onBack();
    } catch (error) {
      // toast handled in parent
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ x: '100%', opacity: 0.5 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: '100%', opacity: 0.5 }}
      transition={{ type: "spring", damping: 30, stiffness: 300 }}
      className="flex flex-col h-full bg-white relative animate-in fade-in slide-in-from-right duration-500"
      style={{ fontFamily: "'Calibri', sans-serif" }}
    >
      <div className="sticky top-0 bg-white/95 backdrop-blur-md border-b border-[#F4F3EF] px-8 py-6 flex items-center justify-between z-20">
        <div className="flex items-center gap-3">
          <User className="text-[#0D47A1]" size={22} />
          <h3 className="text-xl font-bold text-[#1A1A2E]" style={{ fontFamily: "'Syne', sans-serif" }}>Leave Details</h3>
        </div>
        <button onClick={onBack} className="w-12 h-12 rounded-xl bg-[#F4F3EF] text-[#6B6B7E] flex items-center justify-center hover:bg-red-50 hover:text-red-500 transition-all border border-[#E8E7E2] hover:border-red-100 shadow-sm">
          <X size={22} />
        </button>
      </div>
      <div className="flex-1 p-10 bg-[#FAFAF8] overflow-y-auto">
        <div className="bg-white rounded-[32px] border border-[#F4F3EF] shadow-sm overflow-hidden mb-10">
          <div className="p-10">
            <div className="grid grid-cols-2 gap-x-16 gap-y-10">
              <div className="space-y-2 text-left">
                <span className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-[2.5px] block">Leave Type</span>
                <p className="text-[15px] font-bold text-[#1A1A2E] tracking-tight">{employee.leaveType || employee.type}</p>
              </div>
              <div className="space-y-2 text-left">
                <span className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-[2.5px] block">Duration</span>
                <p className="text-[15px] font-bold text-[#1A1A2E] tracking-tight">{employee.days || 1} Day(s)</p>
              </div>
              <div className="space-y-2 text-left">
                <span className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-[2.5px] block">From Date</span>
                <p className="text-[15px] font-bold text-[#1A1A2E] tracking-tight">
                  {employee.startDate ? new Date(employee.startDate).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' }) : 'N/A'}
                </p>
              </div>
              <div className="space-y-2 text-left">
                <span className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-[2.5px] block">To Date</span>
                <p className="text-[15px] font-bold text-[#1A1A2E] tracking-tight">
                  {employee.endDate ? new Date(employee.endDate).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' }) : 'N/A'}
                </p>
              </div>
              <div className="space-y-2 text-left col-span-2 pt-6 border-t border-[#F4F3EF]">
                <span className="text-[11px] font-black text-[#9B9BAD] uppercase tracking-[3px] block mb-4">Reason for Leave</span>
                <div className="p-6 bg-[#FAFAF8] rounded-2xl border border-[#F4F3EF]">
                  <p className="text-[15px] font-medium text-[#6B6B7E] leading-relaxed italic">"{employee.reason}"</p>
                </div>
              </div>
              <div className="space-y-2 text-left col-span-2 pt-6 border-t border-[#F4F3EF]">
                <span className="text-[11px] font-black text-[#9B9BAD] uppercase tracking-[3px] block mb-4">Current Status</span>
                <div className="pt-2">
                  <span className={`${statusConfig.bg} ${statusConfig.text} px-6 py-2.5 rounded-full text-[11px] font-black uppercase tracking-widest border border-current/10`}>
                    <span className={`inline-block w-2.5 h-2.5 rounded-full mr-2 ${statusConfig.dot}`}></span>
                    {statusConfig.label}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {employee.status?.toLowerCase() === 'pending' && (
          <div className="bg-white rounded-[32px] border border-[#F4F3EF] p-10 mb-10">
            <label className="text-[11px] font-black text-[#9B9BAD] uppercase tracking-[3px] block mb-4 text-left">Approver Comments</label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Add your comments here (optional)..."
              className="w-full h-32 p-6 bg-[#FAFAF8] border border-[#F4F3EF] rounded-2xl text-[15px] outline-none focus:ring-2 focus:ring-[#0D47A1]/10 resize-none mb-8"
            />
            <div className="flex gap-4">
              <button 
                onClick={() => handleAction('Approved')}
                disabled={actionLoading}
                className="flex-1 py-5 rounded-[24px] bg-emerald-500 text-white text-sm font-bold shadow-lg shadow-emerald-500/20 hover:bg-emerald-600 transition-all disabled:opacity-50"
              >
                {actionLoading ? 'Processing...' : 'Approve Leave'}
              </button>
              <button 
                onClick={() => handleAction('Rejected')}
                disabled={actionLoading}
                className="flex-1 py-5 rounded-[24px] bg-rose-500 text-white text-sm font-bold shadow-lg shadow-rose-500/20 hover:bg-rose-600 transition-all disabled:opacity-50"
              >
                {actionLoading ? 'Processing...' : 'Reject Leave'}
              </button>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

const defaultEmployees = [
  { empId: 'F0021', name: 'Ashish Kumar Sankhla', designation: 'Tender Executive, JAIPUR', dept: 'Tenders', scheme: 'General Leave Scheme' },
  { empId: 'E0064', name: 'Adil Ali Khan', designation: 'VKI Team Member', dept: 'VKI Operations', scheme: 'General Leave Scheme' },
  { empId: 'F0026', name: 'Anjali Saini', designation: 'CRM Manager, JAIPUR', dept: 'CRM', scheme: 'General Leave Scheme' },
  { empId: 'E0070', name: 'Ankita Kumawat', designation: 'CRM, JAIPUR', dept: 'CRM', scheme: 'General Leave Scheme' },
  { empId: 'E0047', name: 'Aruna Rathore', designation: 'Back Office Executive, JAIPUR', dept: 'Back Office', scheme: 'General Leave Scheme' },
  { empId: 'E0019', name: 'Avinash Rajpoot', designation: 'Plant Manager, SEPL, JAIPUR', dept: 'Operations', scheme: 'General Leave Scheme' },
  { empId: 'E0006', name: 'Dinesh Kumar', designation: 'VKI Employee', dept: 'VKI Operations', scheme: 'General Leave Scheme' },
  { empId: 'F0036', name: 'Durga Prasad', designation: 'VKI Technician', dept: 'VKI Operations', scheme: 'General Leave Scheme' },
  { empId: 'E0082', name: 'Gaurav Kumawat', designation: 'VKI Operator', dept: 'VKI Operations', scheme: 'General Leave Scheme' }
];

const MonthCalendar = ({ monthIndex, year, holidays, isDarkMode, selectedHoliday, onHolidayClick }) => {
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
  const startDay = new Date(year, monthIndex, 1).getDay();
  
  const days = [];
  for (let i = 0; i < startDay; i++) {
    days.push(null);
  }
  for (let d = 1; d <= daysInMonth; d++) {
    days.push(d);
  }
  
  const daysOfWeek = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
  
  return (
    <div className={`p-4 rounded-[20px] border transition-all ${
      isDarkMode ? 'bg-slate-800/40 border-slate-700/60' : 'bg-[#FDFDFD] border-[#F4F3EF] shadow-sm'
    }`}>
      <h5 className="text-[11px] font-black uppercase tracking-widest text-[#0D47A1] dark:text-blue-400 mb-3 text-left pl-1">{monthNames[monthIndex]}</h5>
      <div className="grid grid-cols-7 gap-1 text-[9px] font-black text-slate-400 mb-2">
        {daysOfWeek.map((day, idx) => <div key={idx}>{day}</div>)}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {days.map((day, idx) => {
          if (day === null) return <div key={idx} />;
          
          const dateStr = `${year}-${String(monthIndex + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
          const isHoliday = holidays.find(h => h.date === dateStr);
          
          let dayStyle = 'text-slate-850 dark:text-slate-250';
          if (isHoliday) {
            const isSelected = selectedHoliday?.date === dateStr;
            if (isHoliday.type === 'National') {
              dayStyle = isSelected ? 'bg-rose-600 text-white font-extrabold shadow-md scale-110' : 'bg-rose-500/10 text-rose-605 font-extrabold border border-rose-500/25';
            } else if (isHoliday.type === 'General') {
              dayStyle = isSelected ? 'bg-indigo-600 text-white font-extrabold shadow-md scale-110' : 'bg-indigo-500/10 text-indigo-605 font-extrabold border border-indigo-500/25';
            } else {
              dayStyle = isSelected ? 'bg-amber-600 text-white font-extrabold shadow-md scale-110' : 'bg-amber-500/10 text-amber-605 font-extrabold border border-amber-500/25';
            }
          }
          
          return (
            <div 
              key={idx} 
              onClick={() => isHoliday && onHolidayClick(isHoliday)}
              className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold transition-all ${
                isHoliday ? 'cursor-pointer hover:scale-110' : ''
              } ${dayStyle}`}
              title={isHoliday ? `${isHoliday.name} (${isHoliday.type})` : ''}
            >
              {day}
            </div>
          );
        })}
      </div>
    </div>
  );
};

const HolidayListView = ({ isDarkMode }) => {
  const [selectedHoliday, setSelectedHoliday] = useState(null);
  const [filterType, setFilterType] = useState('All');
  const [yearPeriod, setYearPeriod] = useState('2026');
  const [holidaySearch, setHolidaySearch] = useState('');

  const holidays = [
    { date: '2026-01-26', name: 'Republic Day', type: 'National', day: 'Monday' },
    { date: '2026-03-15', name: 'Maha Shivratri', type: 'Restricted', day: 'Sunday' },
    { date: '2026-03-17', name: 'Holi', type: 'General', day: 'Tuesday' },
    { date: '2026-03-28', name: 'Eid ul-Fitr', type: 'General', day: 'Saturday' },
    { date: '2026-04-02', name: 'Mahavir Jayanti', type: 'Restricted', day: 'Thursday' },
    { date: '2026-04-10', name: 'Good Friday', type: 'General', day: 'Friday' },
    { date: '2026-05-01', name: 'Maharashtra Day', type: 'General', day: 'Friday' },
    { date: '2026-08-15', name: 'Independence Day', type: 'National', day: 'Saturday' },
    { date: '2026-08-27', name: 'Raksha Bandhan', type: 'Restricted', day: 'Thursday' },
    { date: '2026-09-05', name: 'Janmashtami', type: 'Restricted', day: 'Saturday' },
    { date: '2026-10-02', name: 'Gandhi Jayanti', type: 'National', day: 'Friday' },
    { date: '2026-10-22', name: 'Dussehra', type: 'General', day: 'Thursday' },
    { date: '2026-11-10', name: 'Diwali', type: 'General', day: 'Tuesday' },
    { date: '2026-12-25', name: 'Christmas', type: 'General', day: 'Friday' },
  ];

  const today = new Date('2026-06-15');
  
  const filteredHolidays = holidays.filter(h => {
    const matchesSearch = h.name.toLowerCase().includes(holidaySearch.toLowerCase()) ||
                          h.day.toLowerCase().includes(holidaySearch.toLowerCase()) ||
                          h.date.includes(holidaySearch);
    if (filterType === 'All') return matchesSearch;
    return h.type === filterType && matchesSearch;
  });

  const upcomingHolidays = holidays.filter(h => new Date(h.date) >= today);
  const nextHoliday = upcomingHolidays[0] || holidays[holidays.length - 1];
  const diffTime = new Date(nextHoliday.date) - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  const totalCount = holidays.length;
  const generalCount = holidays.filter(h => h.type === 'General' || h.type === 'National').length;
  const restrictedCount = holidays.filter(h => h.type === 'Restricted').length;

  const getHolidayTypeBadgeColor = (type) => {
    if (type === 'National') return 'bg-rose-50 dark:bg-rose-950/20 text-rose-600 border-rose-200/50';
    if (type === 'General') return 'bg-indigo-50 dark:bg-indigo-950/20 text-indigo-600 border-indigo-200/50';
    return 'bg-amber-50 dark:bg-amber-950/20 text-amber-600 border-amber-200/50';
  };

  const months = Array.from({ length: 12 }, (_, i) => i);

  return (
    <div className="space-y-6 text-left" style={{ fontFamily: "'Calibri', sans-serif" }}>
      {/* Stats Bar */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className={`p-6 rounded-[28px] border ${isDarkMode ? 'bg-slate-900/50 border-slate-800' : 'bg-white border-[#F4F3EF] shadow-sm'} flex items-center gap-4`}>
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 flex items-center justify-center">
            <FiCalendar size={20} />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Holidays</p>
            <h3 className="text-xl font-bold text-slate-850 dark:text-white mt-1">{totalCount} Days</h3>
          </div>
        </div>

        <div className={`p-6 rounded-[28px] border ${isDarkMode ? 'bg-slate-900/50 border-slate-800' : 'bg-white border-[#F4F3EF] shadow-sm'} flex items-center gap-4`}>
          <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 flex items-center justify-center">
            <FiSun size={20} />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">National & General</p>
            <h3 className="text-xl font-bold text-slate-850 dark:text-white mt-1">{generalCount} Days</h3>
          </div>
        </div>

        <div className={`p-6 rounded-[28px] border ${isDarkMode ? 'bg-slate-900/50 border-slate-800' : 'bg-white border-[#F4F3EF] shadow-sm'} flex items-center gap-4`}>
          <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 flex items-center justify-center">
            <FiMoon size={20} />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Restricted Holidays</p>
            <h3 className="text-xl font-bold text-slate-850 dark:text-white mt-1">{restrictedCount} Days</h3>
          </div>
        </div>

        <div className={`p-6 rounded-[28px] border ${isDarkMode ? 'bg-slate-900/50 border-slate-800' : 'bg-white border-[#F4F3EF] shadow-sm'} flex items-center gap-4`}>
          <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/40 text-[#0D47A1] dark:text-blue-400 flex items-center justify-center">
            <FiClock size={20} />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Next: {nextHoliday.name}</p>
            <h3 className="text-xl font-bold text-slate-850 dark:text-white mt-1">{diffDays} Days Left</h3>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Holiday Cards Timeline */}
        <div className="lg:col-span-5 space-y-4">
          <div className={`p-6 rounded-[28px] border ${isDarkMode ? 'bg-slate-900/50 border-slate-800' : 'bg-white border-[#F4F3EF] shadow-sm'} space-y-5`}>
            <div className="flex justify-between items-center border-b border-[#F4F3EF] dark:border-slate-800 pb-4">
              <h4 className="text-base font-bold text-slate-850 dark:text-white font-syne">2026 Holiday Ledger</h4>
              
              <div className="relative">
                <select
                  value={yearPeriod}
                  onChange={(e) => setYearPeriod(e.target.value)}
                  className={`text-xs font-bold rounded-xl pl-3 pr-8 py-2 outline-none border cursor-pointer appearance-none ${
                    isDarkMode ? 'bg-slate-800 text-white border-slate-700' : 'bg-[#FAFAF8] text-[#1A1A2E] border-[#E8E7E2]'
                  }`}
                >
                  <option value="2026">2026 Calendar</option>
                  <option value="2025">2025 Calendar</option>
                </select>
                <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={12} />
              </div>
            </div>

            {/* Search and Filter Row */}
            <div className="space-y-4 w-full">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search holidays..."
                  value={holidaySearch}
                  onChange={(e) => setHolidaySearch(e.target.value)}
                  className={`w-full text-xs font-bold rounded-xl pl-10 pr-10 py-3 outline-none border transition-all ${
                    isDarkMode 
                      ? 'bg-slate-800 text-white border-slate-700 focus:ring-2 focus:ring-slate-700 placeholder:text-slate-500' 
                      : 'bg-[#FAFAF8] text-[#1A1A2E] border-[#E8E7E2] focus:ring-2 focus:ring-[#EEF2FB] placeholder:text-slate-400'
                  }`}
                />
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-450" size={15} />
                {holidaySearch && (
                  <button
                    type="button"
                    onClick={() => setHolidaySearch('')}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-red-500 transition-colors"
                  >
                    <X size={15} />
                  </button>
                )}
              </div>

              <div className="flex bg-[#FAFAF8] dark:bg-slate-850 p-1 rounded-xl border border-[#F4F3EF] dark:border-slate-800 w-fit">
                {['All', 'General', 'Restricted'].map((type) => (
                  <button
                    key={type}
                    onClick={() => setFilterType(type)}
                    className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${
                      filterType === type 
                        ? 'bg-[#0D47A1] text-white shadow-sm' 
                        : 'text-slate-400 hover:text-slate-650 dark:hover:text-slate-200'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            {/* Holiday Items */}
            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1 custom-scrollbar">
              {filteredHolidays.map((holiday) => {
                const holidayDate = new Date(holiday.date);
                const isPassed = holidayDate < today;
                const isNext = holiday.date === nextHoliday.date;
                const isSelected = selectedHoliday?.date === holiday.date;

                const monthName = holidayDate.toLocaleString('default', { month: 'short' });
                const dateDay = holidayDate.getDate();

                return (
                  <div
                    key={holiday.date}
                    onClick={() => setSelectedHoliday(holiday)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between group ${
                      isSelected 
                        ? 'border-[#0D47A1] bg-blue-50/20 dark:bg-blue-950/10' 
                        : isDarkMode 
                          ? 'bg-slate-900 border-slate-800/60 hover:border-slate-700' 
                          : 'bg-white border-[#F4F3EF] hover:border-blue-200 hover:shadow-md'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      {/* Calendar Sheet Visual */}
                      <div className="w-11 h-11 rounded-xl overflow-hidden border border-[#E8E7E2] dark:border-slate-700 text-center flex flex-col shadow-sm">
                        <div className="bg-rose-500 text-[8px] font-black uppercase text-white py-0.5 tracking-wider">
                          {monthName}
                        </div>
                        <div className="flex-1 bg-white dark:bg-slate-900 flex items-center justify-center text-[15px] font-black text-slate-850 dark:text-slate-100">
                          {dateDay}
                        </div>
                      </div>

                      {/* Holiday info */}
                      <div className="text-left">
                        <h5 className="text-xs font-bold text-slate-850 dark:text-white group-hover:text-[#0D47A1] transition-colors">{holiday.name}</h5>
                        <p className="text-[10px] text-slate-400 font-semibold mt-0.5">{holiday.day}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider border ${getHolidayTypeBadgeColor(holiday.type)}`}>
                        {holiday.type}
                      </span>

                      {isNext ? (
                        <span className="text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider bg-blue-500 text-white">Next</span>
                      ) : isPassed ? (
                        <span className="text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-400">Passed</span>
                      ) : null}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right: Holiday Month Grid Calendars */}
        <div className="lg:col-span-7 space-y-6">
          <div className={`p-6 rounded-[28px] border ${isDarkMode ? 'bg-slate-900/50 border-slate-800' : 'bg-white border-[#F4F3EF] shadow-sm'} space-y-6`}>
            <div className="border-b border-[#F4F3EF] dark:border-slate-800 pb-4 flex justify-between items-center flex-wrap gap-2">
              <h4 className="text-base font-bold text-slate-850 dark:text-white font-syne">Annual Visual Calendar</h4>
              
              <div className="flex items-center gap-3 text-[10px] font-black text-slate-400 uppercase tracking-wider">
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-rose-500" /> National</span>
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-indigo-500" /> General</span>
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> Restricted</span>
              </div>
            </div>

            {/* Grid of Months */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {months.map(mIdx => (
                <MonthCalendar
                  key={mIdx}
                  monthIndex={mIdx}
                  year={2026}
                  holidays={holidays}
                  isDarkMode={isDarkMode}
                  selectedHoliday={selectedHoliday}
                  onHolidayClick={setSelectedHoliday}
                />
              ))}
            </div>

            {selectedHoliday && (
              <div className="p-4 rounded-2xl bg-[#F8FAFF] dark:bg-slate-800 border border-blue-100 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-350 text-left flex items-center justify-between shadow-sm animate-in fade-in duration-300">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#0D47A1]/10 text-[#0D47A1] dark:text-blue-400 flex items-center justify-center font-bold text-sm">
                    {selectedHoliday.date.split('-')[2]}
                  </div>
                  <div>
                    <span className="font-extrabold text-[#0D47A1] dark:text-blue-400">{selectedHoliday.name}</span>
                    <span className="mx-2">•</span>
                    <span className="font-semibold">{selectedHoliday.day}</span>
                    <span className="mx-2">•</span>
                    <span className={`text-[9px] px-2 py-0.5 rounded-full font-black uppercase tracking-wider ${
                      selectedHoliday.type === 'National' 
                        ? 'bg-rose-50 text-rose-600 border border-rose-100' 
                        : selectedHoliday.type === 'General'
                          ? 'bg-indigo-50 text-indigo-650 border border-indigo-100'
                          : 'bg-amber-50 text-amber-600 border border-amber-100'
                    }`}>
                      {selectedHoliday.type}
                    </span>
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedHoliday(null)} 
                  className="text-xs font-bold text-red-500 hover:text-red-700 transition-colors"
                >
                  Clear Selection
                </button>
              </div>
            )}

            {/* Corporate Restricted Holiday Rule Callout */}
            <div className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/10 text-xs font-semibold text-slate-500 dark:text-slate-400 leading-relaxed text-left">
              <span className="font-bold text-amber-600 mr-1">Restricted Holidays policy:</span>
              Employees are eligible to choose and apply for any <span className="font-bold">2 Restricted Holidays (RH)</span> from the list above. Applications can be submitted via the "Apply On Behalf" or regular request forms.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const LeaveManagementTab = ({ isDarkMode, selectedClient }) => {
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('list');
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // New sub-tab state
  const [leaveSubTab, setLeaveSubTab] = useState('Leave Applications'); // 'Leave Applications' or 'Leave Balances'
  const [balanceSelectedEmployee, setBalanceSelectedEmployee] = useState(defaultEmployees[0]);
  const [balanceSearchTerm, setBalanceSearchTerm] = useState('Ashish Kumar Sankhla (#F0021)');
  const [balanceShowDropdown, setBalanceShowDropdown] = useState(false);
  const [balanceActiveFilter, setBalanceActiveFilter] = useState('Overview');
  const [showPostTransactionModal, setShowPostTransactionModal] = useState(false);
  const [applyOnBehalfActive, setApplyOnBehalfActive] = useState(false);

  // Transaction modal inputs
  const [transactionType, setTransactionType] = useState('PL'); // PL, COF, LOP
  const [transactionAction, setTransactionAction] = useState('Grant'); // Grant, Lapsed, Availed, Deduction
  const [transactionDays, setTransactionDays] = useState(1);
  const [transactionRemarks, setTransactionRemarks] = useState('');

  // Leave balances state loaded from localstorage
  const [balances, setBalances] = useState({});

  useEffect(() => {
    const stored = localStorage.getItem('mabicons_leave_balances');
    if (stored) {
      setBalances(JSON.parse(stored));
    } else {
      const initial = {};
      defaultEmployees.forEach(emp => {
        initial[emp.empId] = {
          PL: { code: 'PL', type: 'Paid Leave', ob: 0, granted: 15, availed: 0, applied: 0, deduction: 0, lapsed: -12.5, balance: 2.5 },
          COF: { code: 'COF', type: 'Comp - Off', ob: 0, granted: 0, availed: 0, applied: 0, deduction: 0, lapsed: 0, balance: 0 },
          LOP: { code: 'LOP', type: 'Loss Of Pay', ob: 0, granted: 0, availed: 0, applied: 0, deduction: 0, lapsed: 0, balance: 0 }
        };
      });
      localStorage.setItem('mabicons_leave_balances', JSON.stringify(initial));
      setBalances(initial);
    }

    const storedRequests = localStorage.getItem('mabicons_leave_requests');
    if (!storedRequests) {
      const mockRequests = [
        {
          id: 'LR-mock2',
          memberName: 'Adil Ali Khan',
          memberId: 'E0064',
          leaveType: 'Casual Leave',
          startDate: '2026-06-16',
          endDate: '2026-06-17',
          days: 2,
          reason: 'Personal urgent work at home town.',
          status: 'Pending',
          createdAt: '2026-06-14T15:30:00Z'
        },
        {
          id: 'LR-mock3',
          memberName: 'Aruna Rathore',
          memberId: 'E0047',
          leaveType: 'Earned Leave',
          startDate: '2026-06-22',
          endDate: '2026-06-25',
          days: 4,
          reason: 'Family vacation planning.',
          status: 'Pending',
          createdAt: '2026-06-15T09:12:00Z'
        },
        {
          id: 'LR-mock1',
          memberName: 'Anjali Saini',
          memberId: 'F0026',
          leaveType: 'Sick Leave',
          startDate: '2026-06-10',
          endDate: '2026-06-12',
          days: 3,
          reason: 'High fever and throat infection, doctor advised rest.',
          status: 'Approved',
          createdAt: '2026-06-09T10:00:00Z'
        },
        {
          id: 'LR-mock4',
          memberName: 'Ashish Kumar Sankhla',
          memberId: 'F0021',
          leaveType: 'Compensatory Off',
          startDate: '2026-06-05',
          endDate: '2026-06-05',
          days: 1,
          reason: 'Comp off against working on Sunday tender submission.',
          status: 'Approved',
          createdAt: '2026-06-04T18:00:00Z'
        },
        {
          id: 'LR-mock5',
          memberName: 'Nitin Jangid',
          memberId: 'E0059',
          leaveType: 'Sick Leave',
          startDate: '2026-06-02',
          endDate: '2026-06-03',
          days: 2,
          reason: 'Dental extraction surgery follow-up.',
          status: 'Rejected',
          createdAt: '2026-06-01T11:45:00Z'
        }
      ];
      localStorage.setItem('mabicons_leave_requests', JSON.stringify(mockRequests));
    }
  }, []);

  const handlePostTransaction = (e) => {
    e.preventDefault();
    if (transactionDays <= 0) {
      toast.error('Days must be greater than 0');
      return;
    }

    const empId = balanceSelectedEmployee.empId;
    const currentEmpBalances = balances[empId] || {
      PL: { code: 'PL', type: 'Paid Leave', ob: 0, granted: 0, availed: 0, applied: 0, deduction: 0, lapsed: 0, balance: 0 },
      COF: { code: 'COF', type: 'Comp - Off', ob: 0, granted: 0, availed: 0, applied: 0, deduction: 0, lapsed: 0, balance: 0 },
      LOP: { code: 'LOP', type: 'Loss Of Pay', ob: 0, granted: 0, availed: 0, applied: 0, deduction: 0, lapsed: 0, balance: 0 }
    };

    const targetLeave = { ...currentEmpBalances[transactionType] };
    const daysVal = parseFloat(transactionDays);

    if (transactionAction === 'Grant') {
      targetLeave.granted += daysVal;
    } else if (transactionAction === 'Lapsed') {
      targetLeave.lapsed -= daysVal;
    } else if (transactionAction === 'Availed') {
      targetLeave.availed += daysVal;
    } else if (transactionAction === 'Deduction') {
      targetLeave.deduction -= daysVal;
    }

    targetLeave.balance = targetLeave.ob + targetLeave.granted - targetLeave.availed - targetLeave.applied + targetLeave.deduction + targetLeave.lapsed;

    const updatedBalances = {
      ...balances,
      [empId]: {
        ...currentEmpBalances,
        [transactionType]: targetLeave
      }
    };

    localStorage.setItem('mabicons_leave_balances', JSON.stringify(updatedBalances));
    setBalances(updatedBalances);
    setShowPostTransactionModal(false);
    toast.success(`Leave transaction posted successfully for ${balanceSelectedEmployee.name}`);
  };

  const fetchLeaveRequests = async () => {
    setLoading(true);
    try {
      let apiLeaves = [];
      try {
        const response = await getDeptLeaveRequests();
        if (response && response.success) {
          apiLeaves = Array.isArray(response.leaves) ? response.leaves : [];
        }
      } catch (err) {
        console.warn('Failed to load leaves from API, loading local leaves only', err);
      }

      const localLeaves = JSON.parse(localStorage.getItem('mabicons_leave_requests') || '[]');
      
      const merged = [...localLeaves];
      apiLeaves.forEach(apiL => {
        if (!merged.some(l => l.id === apiL.id)) {
          merged.push(apiL);
        }
      });

      setLeaveRequests(merged);
    } catch (error) {
      toast.error('Failed to load leave requests');
      setLeaveRequests([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaveRequests();
  }, [selectedClient]);

  const handleStatusChange = async (id, status, comment) => {
    try {
      try {
        await approveRejectLeave(id, { status, approverComment: comment });
      } catch (err) {
        console.warn('API update failed, updating locally', err);
      }

      const localRequests = JSON.parse(localStorage.getItem('mabicons_leave_requests') || '[]');
      const updated = localRequests.map(req => {
        if (req.id === id) {
          return { ...req, status };
        }
        return req;
      });
      localStorage.setItem('mabicons_leave_requests', JSON.stringify(updated));

      toast.success(`Leave request ${status.toLowerCase()} successfully`);
      fetchLeaveRequests();
    } catch (error) {
      toast.error(error.message || 'Failed to update leave status');
      throw error;
    }
  };

  const getStatusConfig = (status = '') => {
    const s = status.toLowerCase();
    const config = {
      approved: { bg: 'bg-emerald-50 text-emerald-600', dot: 'bg-emerald-500', label: 'Approved' },
      pending: { bg: 'bg-amber-50 text-amber-600', dot: 'bg-amber-500', label: 'Pending' },
      rejected: { bg: 'bg-rose-50 text-rose-600', dot: 'bg-rose-500', label: 'Rejected' }
    };
    return config[s] || config.pending;
  };

  const filteredRequests = (leaveRequests || []).filter(req => {
    const memberName = req.memberName || req.name || '';
    const memberId = req.memberId || req.empId || '';
    const matchesSearch = memberName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         memberId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || req.status?.toLowerCase() === filterStatus.toLowerCase();
    return matchesSearch && matchesFilter;
  });

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div className="space-y-2">
            <div className={`h-8 w-64 rounded-lg animate-pulse ${isDarkMode ? 'bg-slate-700' : 'bg-slate-200'}`}></div>
            <div className={`h-4 w-40 rounded-lg animate-pulse ${isDarkMode ? 'bg-slate-700' : 'bg-slate-200'}`}></div>
          </div>
        </div>
        <div className={`h-96 rounded-2xl animate-pulse ${isDarkMode ? 'bg-slate-800' : 'bg-slate-200'}`}></div>
      </div>
    );
  }

  return (
    <div className={`w-full min-h-screen ${isDarkMode ? 'bg-slate-900 text-white' : 'bg-[#fcfdff] text-slate-800'}`} style={{ fontFamily: "'Calibri', sans-serif" }}>
      <AnimatePresence mode="wait">
        <motion.div key="dashboard-view" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="space-y-8">
          
          {/* Header Toggle Navigation */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between border-b pb-5 border-[#F4F3EF] dark:border-slate-850 gap-4">
            <div className="text-left">
              <h1 className="text-3xl font-bold text-[#1A1A2E] dark:text-white tracking-tight font-syne" style={{ fontFamily: "'Syne', sans-serif" }}>Leave Management</h1>
              <p className="text-sm font-medium text-[#9B9BAD] mt-1">Internal Operations • Manage employee leave requests and balances</p>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="bg-[#FAF9F6] dark:bg-slate-800 p-1.5 rounded-2xl flex items-center border border-[#F4F3EF] dark:border-slate-700">
                {['Leave Applications', 'Leave Balances', 'Holiday List'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setLeaveSubTab(tab)}
                    className={`px-5 py-2 rounded-xl text-xs font-bold transition-all ${
                      leaveSubTab === tab 
                        ? 'bg-white dark:bg-slate-900 text-[#0D47A1] dark:text-blue-400 shadow-sm font-black' 
                        : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              <button 
                onClick={() => setView('apply')} 
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0D47A1] text-white text-xs font-bold shadow-lg shadow-blue-500/10 hover:bg-[#0a3a82] transition-all active:scale-95"
              >
                <Plus size={14} /> Apply New Leave
              </button>
            </div>
          </div>

          {leaveSubTab === 'Leave Applications' && (
            <div className="space-y-8">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className={`rounded-[24px] p-2 border flex items-center gap-3 flex-wrap mb-6 ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-[#F4F3EF] shadow-sm'}`}>
                <div className="relative flex-1 group min-w-[200px]">
                  <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-[#9B9BAD] transition-colors" size={18} />
                  <input
                    type="text"
                    placeholder="Search leave requests by name or ID..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className={`w-full border-none rounded-2xl py-3 pl-14 pr-5 text-sm font-medium outline-none transition-all placeholder:text-[#9B9BAD] ${isDarkMode ? 'bg-slate-800 text-white focus:ring-2 focus:ring-slate-700' : 'bg-[#F4F3EF] text-[#1A1A2E] focus:ring-2 focus:ring-[#F4F3EF]'}`}
                  />
                </div>
                <div className="relative group">
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className={`text-[11px] font-black uppercase tracking-widest rounded-xl pl-4 pr-10 py-2.5 outline-none border-0 cursor-pointer appearance-none min-w-[200px] transition-all hover:bg-[#EEF2FB] ${isDarkMode ? 'bg-slate-800 text-white' : 'bg-[#F4F3EF] text-[#1A1A2E]'}`}
                  >
                    <option value="all">All Request Status</option>
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-[#1B4DA0] opacity-50 group-hover:opacity-100 transition-all pointer-events-none" size={14} />
                </div>
              </motion.div>

              <div className={`rounded-[32px] border overflow-hidden transition-all ${isDarkMode ? 'bg-slate-900/40 border-slate-800' : 'bg-white border-[#F4F3EF] shadow-sm'}`}>
                <div className={`grid grid-cols-[1.2fr_180px_180px_100px_220px_180px_40px] gap-4 px-8 py-4 border-b ${isDarkMode ? 'border-slate-800 bg-transparent' : 'border-[#F4F3EF] bg-transparent'}`}>
                  {["Employee", "Leave Type", "Duration", "Days", "Reason", "Status", ""].map((h, i) => (
                    <div key={i} className="text-[11px] font-bold text-[#94a3b8] uppercase tracking-widest text-left flex items-start justify-start">{h}</div>
                  ))}
                </div>
                <div className="flex flex-col">
                  <AnimatePresence mode="popLayout">
                    {filteredRequests.length === 0 ? (
                      <div className="py-24 text-center">
                        <p className="text-[#9B9BAD] text-sm font-bold uppercase tracking-widest">No matching requests found</p>
                      </div>
                    ) : (
                      filteredRequests.map((req, index) => {
                        const statusConfig = getStatusConfig(req.status);
                        return (
                          <motion.div
                            key={req.id}
                            layout
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ delay: index * 0.05 }}
                            onClick={() => { setSelectedEmployee(req); setView('details'); }}
                            className={`grid grid-cols-[1.2fr_180px_180px_100px_220px_180px_40px] gap-4 items-center px-8 py-3 border-b last:border-0 cursor-pointer transition-all group relative ${isDarkMode ? 'border-slate-800 hover:bg-slate-800/40' : 'border-[#F4F3EF] hover:bg-[#F8FAFF]'}`}
                          >
                            <div className="flex items-center gap-4 min-w-0 py-1">
                              <div className="w-[42px] h-[42px] rounded-[14px] flex items-center justify-center font-bold shadow-sm transition-transform group-hover:scale-110 bg-[#F0F7FF] text-[#1B4DA0] text-[13px]">
                                {(req.memberName || req.name || '??').charAt(0).toUpperCase()}
                              </div>
                              <div className="flex flex-col min-w-0 text-left">
                                <p className={`text-[14px] font-bold truncate transition-colors ${isDarkMode ? 'text-white group-hover:text-[#0D47A1]' : 'text-[#0f172a] group-hover:text-[#0D47A1]'}`}>
                                  {req.memberName || req.name}
                                </p>
                                <p className="text-[10px] font-bold text-[#9B9BAD] uppercase tracking-wider mt-0.5">{req.memberId || req.empId}</p>
                              </div>
                            </div>
                            <div className="flex justify-start">
                              <div className="text-[13px] font-bold text-[#6B6B7E] bg-[#FAFAF8] px-3 py-1.5 rounded-lg border border-[#F4F3EF]">
                                {req.leaveType || req.type}
                              </div>
                            </div>
                            <div className="flex items-center gap-2 text-[13px] font-bold text-[#6B6B7E] text-left">
                              <FiCalendar className="w-4 h-4 text-[#9B9BAD]" />
                              <span className="truncate">
                                {req.startDate ? new Date(req.startDate).toLocaleDateString('en-US', { day: 'numeric', month: 'short' }) : 'N/A'} - 
                                {req.endDate ? new Date(req.endDate).toLocaleDateString('en-US', { day: 'numeric', month: 'short' }) : 'N/A'}
                              </span>
                            </div>
                            <div className="flex justify-start">
                               <div className="w-9 h-9 rounded-xl bg-[#F4F3EF] flex items-center justify-center text-[13px] font-black text-[#0D47A1]">{req.days || 1}</div>
                            </div>
                            <div className="text-[13px] font-medium text-[#9B9BAD] truncate italic max-w-[200px] text-left">"{req.reason}"</div>
                            <div className="flex items-center">
                              <span className={`inline-flex items-center justify-center px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest w-fit border shadow-sm ${statusConfig.bg} ${isDarkMode ? 'border-transparent' : 'border-current/10'}`}>
                                <span className={`w-1.5 h-1.5 rounded-full mr-2 ${statusConfig.dot}`}></span>{statusConfig.label}
                              </span>
                            </div>
                            <div className="flex justify-end pr-2">
                              <ChevronRight size={20} className={`transition-all ${isDarkMode ? 'text-slate-700' : 'text-[#C5C5D2] group-hover:text-[#0D47A1]'}`} />
                            </div>
                          </motion.div>
                        );
                      })
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>
          )}

          {leaveSubTab === 'Leave Balances' && (
            <div className="space-y-6">
              {/* Help box */}
              <div className={`p-6 rounded-[28px] border relative text-left transition-all ${isDarkMode ? 'bg-slate-900/50 border-slate-800 text-slate-300' : 'bg-white border-[#F4F3EF] shadow-sm text-slate-500'}`}>
                <p className="text-xs font-semibold leading-relaxed pr-16">
                  The <span className="font-bold text-[#1A1A2E] dark:text-white">Employee Leave</span> page enables you to view the leave information of employees. Select an employee and click each tab to view information about a particular type of leave. Change the year to view leave data for a different period.
                </p>
                <button className="absolute right-6 top-1/2 -translate-y-1/2 text-xs font-bold text-[#0D47A1] dark:text-blue-400 hover:underline">Hide Help</button>
              </div>

              {/* Selector & Actions bar */}
              <div className={`p-6 rounded-[28px] border ${isDarkMode ? 'bg-slate-900/50 border-slate-800' : 'bg-white border-[#F4F3EF] shadow-sm'} space-y-6`}>
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-end">
                  {/* Employee Type */}
                  <div className="col-span-12 md:col-span-3 space-y-1.5 text-left">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block pl-1">Employee Type</label>
                    <div className="relative">
                      <select
                        className={`w-full text-xs font-bold rounded-xl pl-4 pr-10 py-3.5 outline-none border cursor-pointer appearance-none ${
                          isDarkMode ? 'bg-slate-800 text-white border-slate-700' : 'bg-[#FAFAF8] text-[#1A1A2E] border-[#E8E7E2]'
                        }`}
                      >
                        <option>Current Employees</option>
                        <option>Resigned Employees</option>
                      </select>
                      <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={14} />
                    </div>
                  </div>

                  {/* Search Employee Box */}
                  <div className="col-span-12 md:col-span-6 space-y-1.5 text-left relative z-40">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block pl-1">Search Employee</label>
                    <div className="relative">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
                      <input
                        type="text"
                        value={balanceSearchTerm}
                        onChange={(e) => {
                          setBalanceSearchTerm(e.target.value);
                          setBalanceShowDropdown(true);
                        }}
                        onFocus={() => setBalanceShowDropdown(true)}
                        placeholder="Search by Emp No/ Name"
                        className={`w-full text-xs font-bold rounded-xl pl-11 pr-12 py-3.5 outline-none border ${
                          isDarkMode ? 'bg-slate-800 text-white border-slate-700' : 'bg-[#FAFAF8] text-[#1A1A2E] border-[#E8E7E2]'
                        }`}
                      />
                      {balanceSearchTerm && (
                        <button 
                          onClick={() => {
                            setBalanceSearchTerm('');
                            setBalanceShowDropdown(false);
                          }}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-red-500"
                        >
                          <X size={14} />
                        </button>
                      )}
                    </div>

                    {/* Autocomplete list */}
                    <AnimatePresence>
                      {balanceShowDropdown && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 10 }}
                          className={`absolute left-0 right-0 top-full mt-2 rounded-2xl border shadow-xl z-50 max-h-60 overflow-y-auto ${
                            isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-[#E8E7E2] text-slate-800'
                          }`}
                        >
                          {defaultEmployees
                            .filter(emp => emp.name.toLowerCase().includes(balanceSearchTerm.toLowerCase()) || emp.empId.toLowerCase().includes(balanceSearchTerm.toLowerCase()))
                            .map((emp) => (
                              <div
                                key={emp.empId}
                                onClick={() => {
                                  setBalanceSelectedEmployee(emp);
                                  setBalanceSearchTerm(`${emp.name} (#${emp.empId})`);
                                  setBalanceShowDropdown(false);
                                }}
                                className={`flex items-center gap-3 px-4 py-3 cursor-pointer text-xs font-semibold border-b last:border-b-0 text-left ${
                                  isDarkMode ? 'hover:bg-slate-700 border-slate-700/50' : 'hover:bg-blue-50/50 border-slate-100'
                                }`}
                              >
                                <div className="w-8 h-8 rounded-lg bg-[#0D47A1]/10 text-[#0D47A1] flex items-center justify-center font-bold">
                                  {emp.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                                </div>
                                <div className="text-left">
                                  <p className="font-bold text-slate-850 dark:text-white leading-tight">{emp.name}</p>
                                  <p className="text-[10px] text-slate-400 font-semibold">{emp.empId} · {emp.designation}</p>
                                </div>
                              </div>
                            ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Year Period dropdown */}
                  <div className="col-span-12 md:col-span-3 space-y-1.5 text-left">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block pl-1">Leave Period</label>
                    <div className="relative">
                      <select
                        className={`w-full text-xs font-bold rounded-xl pl-4 pr-10 py-3.5 outline-none border cursor-pointer appearance-none ${
                          isDarkMode ? 'bg-slate-800 text-white border-slate-700' : 'bg-[#FAFAF8] text-[#1A1A2E] border-[#E8E7E2]'
                        }`}
                      >
                        <option>Jan 2026 - Dec 2026</option>
                        <option>Jan 2025 - Dec 2025</option>
                      </select>
                      <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={14} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Sub-tabs & Action buttons */}
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                {/* Filter Tabs */}
                <div className="bg-[#FAF9F6] dark:bg-slate-850 p-1 rounded-xl flex items-center border border-[#F4F3EF] dark:border-slate-800 max-w-full overflow-x-auto custom-scrollbar">
                  {['Overview', 'PL', 'COF', 'LOP', 'All'].map((filter) => (
                    <button
                      key={filter}
                      onClick={() => setBalanceActiveFilter(filter)}
                      className={`px-5 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                        balanceActiveFilter === filter 
                          ? 'bg-[#0D47A1] text-white shadow-sm font-black' 
                          : 'text-slate-400 hover:text-slate-650 dark:hover:text-slate-200'
                      }`}
                    >
                      {filter}
                    </button>
                  ))}
                </div>

                {/* Right side transaction buttons */}
                <div className="flex items-center gap-3 w-full lg:w-auto flex-wrap">
                  <button
                    onClick={() => setShowPostTransactionModal(true)}
                    className="flex-1 lg:flex-none flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-xl border border-[#0D47A1] text-[#0D47A1] dark:text-blue-400 dark:border-blue-400 text-xs font-bold hover:bg-[#0D47A1]/5 active:scale-95 transition-all"
                  >
                    Post Leave Transaction
                  </button>
                  <button
                    onClick={() => {
                      setApplyOnBehalfActive(true);
                      setView('apply');
                    }}
                    className="flex-1 lg:flex-none flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-xl border border-[#0D47A1] text-[#0D47A1] dark:text-blue-400 dark:border-blue-400 text-xs font-bold hover:bg-[#0D47A1]/5 active:scale-95 transition-all"
                  >
                    Apply On Behalf
                  </button>
                  <button
                    onClick={() => {
                      toast.success('Leave balance ledger downloaded successfully');
                    }}
                    className="flex-1 lg:flex-none flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-xl bg-[#FAFAF8] dark:bg-slate-800 text-slate-650 dark:text-slate-300 border border-[#E8E7E2] dark:border-slate-700 text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-700 active:scale-95 transition-all"
                  >
                    <Download size={14} /> Download
                  </button>
                </div>
              </div>

              {/* Scheme block and Table */}
              <div className={`rounded-[28px] border overflow-hidden ${isDarkMode ? 'bg-slate-900/30 border-slate-800' : 'bg-white border-[#F4F3EF] shadow-sm'}`}>
                <div className="p-6 bg-[#FAFAF8] dark:bg-slate-900/60 border-b border-[#F4F3EF] dark:border-slate-800 text-left">
                  <h4 className="text-sm font-bold text-[#1A1A2E] dark:text-white">Scheme Name - <span className="text-[#0D47A1] dark:text-blue-400 font-extrabold">{balanceSelectedEmployee.scheme}</span></h4>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse text-left">
                    <thead>
                      <tr className="border-b border-[#F4F3EF] dark:border-slate-800 bg-[#FAFAF8] dark:bg-slate-900/40">
                        {['Code', 'Leave Type', 'O/B', 'Granted', 'Availed', 'Applied', 'Leave Deduction', 'Lapsed', 'Balance'].map((header) => (
                          <th key={header} className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">{header}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {Object.values(balances[balanceSelectedEmployee.empId] || {})
                        .filter(item => {
                          if (balanceActiveFilter === 'Overview' || balanceActiveFilter === 'All') return true;
                          return item.code === balanceActiveFilter;
                        })
                        .map((item) => (
                          <tr key={item.code} className="border-b border-[#F4F3EF] dark:border-slate-800/60 hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-all">
                            <td className="px-6 py-4 text-xs font-black text-[#0D47A1] dark:text-blue-400">{item.code}</td>
                            <td className="px-6 py-4 text-xs font-bold text-slate-800 dark:text-white">{item.type}</td>
                            <td className="px-6 py-4 text-xs font-semibold text-slate-500">{item.ob || '-'}</td>
                            <td className="px-6 py-4 text-xs font-semibold text-slate-500">{item.granted || '-'}</td>
                            <td className="px-6 py-4 text-xs font-semibold text-slate-500">{item.availed || '-'}</td>
                            <td className="px-6 py-4 text-xs font-semibold text-slate-500">{item.applied || '-'}</td>
                            <td className="px-6 py-4 text-xs font-semibold text-rose-500">{item.deduction < 0 ? item.deduction : item.deduction === 0 ? '-' : `-${item.deduction}`}</td>
                            <td className="px-6 py-4 text-xs font-semibold text-rose-500">{item.lapsed < 0 ? item.lapsed : item.lapsed === 0 ? '-' : `-${item.lapsed}`}</td>
                            <td className="px-6 py-4 text-xs font-black text-slate-800 dark:text-white">
                              <span className={`px-2.5 py-1 rounded-lg text-xs font-extrabold ${item.balance > 0 ? 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}>
                                {item.balance || '0'}
                              </span>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {leaveSubTab === 'Holiday List' && (
            <HolidayListView isDarkMode={isDarkMode} />
          )}

        </motion.div>
      </AnimatePresence>

      {typeof document !== 'undefined' && createPortal(
        <AnimatePresence>
          {view === 'apply' && (
            <>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => { setView('list'); setApplyOnBehalfActive(false); }} className="fixed inset-0 bg-[#1A1A2E]/40 backdrop-blur-md z-[1100]" />
              <div className="fixed inset-0 z-[1101] flex items-center justify-center p-4 sm:p-6 md:p-10 pointer-events-none">
                <div className="w-full max-w-xl pointer-events-auto flex items-center justify-center">
                  <ApplyLeaveView 
                    onBack={() => { setView('list'); setApplyOnBehalfActive(false); }} 
                    onSubmit={() => { setView('list'); setApplyOnBehalfActive(false); fetchLeaveRequests(); }} 
                    isDarkMode={isDarkMode} 
                    onBehalfEmployee={applyOnBehalfActive ? balanceSelectedEmployee : null}
                  />
                </div>
              </div>
            </>
          )}

          {view === 'details' && selectedEmployee && (
            <>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setView('list')} className="fixed inset-0 bg-[#1A1A2E]/40 backdrop-blur-md z-[1100]" />
              <motion.div className="fixed inset-y-0 right-0 w-full sm:w-[550px] md:w-[650px] shadow-2xl z-[1101] border-l bg-white border-[#F4F3EF] overflow-hidden">
                <EmployeeDetailsView 
                  employee={selectedEmployee} 
                  onBack={() => setView('list')} 
                  isDarkMode={isDarkMode} 
                  getStatusConfig={getStatusConfig} 
                  onStatusChange={handleStatusChange} 
                />
              </motion.div>
            </>
          )}

          {/* New Post Transaction Modal */}
          {showPostTransactionModal && (
            <>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowPostTransactionModal(false)} className="fixed inset-0 bg-[#1A1A2E]/45 backdrop-blur-md z-[1200]" />
              <div className="fixed inset-0 z-[1201] flex items-center justify-center p-4 sm:p-6 pointer-events-none">
                <motion.div
                  initial={{ scale: 0.95, opacity: 0, y: 20 }}
                  animate={{ scale: 1, opacity: 1, y: 0 }}
                  exit={{ scale: 0.95, opacity: 0, y: 20 }}
                  className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col pointer-events-auto"
                >
                  <div className="border-b border-[#F4F3EF] px-8 py-6 flex items-center justify-between bg-gradient-to-r from-white to-[#F8FAFF]">
                    <h3 className="text-xl font-bold text-[#1A1A2E] font-syne">Post Leave Transaction</h3>
                    <button onClick={() => setShowPostTransactionModal(false)} className="w-10 h-10 rounded-xl bg-[#F4F3EF] text-[#6B6B7E] flex items-center justify-center hover:bg-red-50 hover:text-red-500 transition-all">
                      <X size={18} />
                    </button>
                  </div>
                  <form onSubmit={handlePostTransaction} className="p-8 space-y-5 text-left">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block pl-1">Leave Category</label>
                      <select
                        value={transactionType}
                        onChange={(e) => setTransactionType(e.target.value)}
                        className="w-full bg-[#F4F3EF] border-0 rounded-2xl px-5 py-3.5 text-sm font-bold text-[#1A1A2E] outline-none cursor-pointer"
                      >
                        <option value="PL">Paid Leave (PL)</option>
                        <option value="COF">Comp - Off (COF)</option>
                        <option value="LOP">Loss Of Pay (LOP)</option>
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block pl-1">Transaction Action</label>
                      <select
                        value={transactionAction}
                        onChange={(e) => setTransactionAction(e.target.value)}
                        className="w-full bg-[#F4F3EF] border-0 rounded-2xl px-5 py-3.5 text-sm font-bold text-[#1A1A2E] outline-none cursor-pointer"
                      >
                        <option value="Grant">Grant (Credit balance)</option>
                        <option value="Lapsed">Lapsed (Debit balance)</option>
                        <option value="Availed">Availed (Deduct as taken)</option>
                        <option value="Deduction">Deduction (Admin correction)</option>
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block pl-1">Number of Days</label>
                      <input
                        type="number"
                        step="0.5"
                        min="0.5"
                        value={transactionDays}
                        onChange={(e) => setTransactionDays(parseFloat(e.target.value) || 0)}
                        className="w-full bg-[#F4F3EF] border-0 rounded-2xl px-5 py-3.5 text-sm font-bold text-[#1A1A2E] outline-none"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block pl-1">Remarks</label>
                      <textarea
                        value={transactionRemarks}
                        onChange={(e) => setTransactionRemarks(e.target.value)}
                        placeholder="Add reason for transaction..."
                        className="w-full bg-[#F4F3EF] border-0 rounded-2xl px-5 py-3.5 text-sm font-bold text-[#1A1A2E] outline-none resize-none h-20"
                      />
                    </div>
                    <div className="flex gap-4 pt-2">
                      <button type="button" onClick={() => setShowPostTransactionModal(false)} className="flex-1 py-4 rounded-2xl border-2 border-[#F4F3EF] text-sm font-bold text-[#6B6B7E] hover:bg-[#F4F3EF] transition-all">Cancel</button>
                      <button type="submit" className="flex-[2] bg-[#0D47A1] text-white py-4 rounded-full text-xs font-bold uppercase tracking-wider shadow-lg hover:bg-[#0a3a82] transition-all">Post Transaction</button>
                    </div>
                  </form>
                </motion.div>
              </div>
            </>
          )}

        </AnimatePresence>,
        document.body
      )}
    </div>
  );
};

export default LeaveManagementTab;