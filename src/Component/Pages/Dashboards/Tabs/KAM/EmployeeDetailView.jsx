import React, { useState, useEffect, useMemo, useRef } from 'react';
import { toast } from 'react-hot-toast';
import { 
  FiClock, 
  FiCalendar, 
  FiDownload, 
  FiUsers, 
  FiX,
  FiMail,
  FiPhone
} from 'react-icons/fi';
import { 
  Search, ChevronDown, ChevronRight, MapPin, Check, Mail, Phone, Calendar, 
  User, Clock, Shield 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getDepartmentMember } from '../../../service/api';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export const getAttendanceCellStyle = (status, isDarkMode) => {
  if (isDarkMode) {
    switch (status) {
      case 'P':
        return {
          backgroundColor: 'rgba(16, 185, 129, 0.15)', // Emerald/Green 15%
          color: '#34d399',
          borderColor: 'rgba(16, 185, 129, 0.3)'
        };
      case 'A':
        return {
          backgroundColor: 'rgba(244, 63, 94, 0.15)', // Rose/Red 15%
          color: '#fb7185',
          borderColor: 'rgba(244, 63, 94, 0.3)'
        };
      case 'L':
        return {
          backgroundColor: 'rgba(168, 85, 247, 0.15)', // Purple 15%
          color: '#c084fc',
          borderColor: 'rgba(168, 85, 247, 0.3)'
        };
      case 'H':
        return {
          backgroundColor: 'rgba(245, 158, 11, 0.15)', // Amber/Orange 15%
          color: '#fbbf24',
          borderColor: 'rgba(245, 158, 11, 0.3)'
        };
      case 'OFF':
      default:
        return {
          backgroundColor: 'rgba(148, 163, 184, 0.12)', // Slate/Gray 12%
          color: '#94a3b8',
          borderColor: 'rgba(148, 163, 184, 0.2)'
        };
    }
  } else {
    switch (status) {
      case 'P':
        return {
          backgroundColor: '#e6f4ea', // Soft Green
          color: '#137333',
          borderColor: '#c3e6cb'
        };
      case 'A':
        return {
          backgroundColor: '#fce8e6', // Soft Red
          color: '#c5221f',
          borderColor: '#fad2cf'
        };
      case 'L':
        return {
          backgroundColor: '#f3e8ff', // Soft Purple
          color: '#6b21a8',
          borderColor: '#e9d5ff'
        };
      case 'H':
        return {
          backgroundColor: '#fff3e0', // Soft Orange
          color: '#e65100',
          borderColor: '#ffe0b2'
        };
      case 'OFF':
      default:
        return {
          backgroundColor: '#f8fafc', // Soft Slate/Gray
          color: '#475569',
          borderColor: '#e2e8f0'
        };
    }
  }
};

const EmployeeDetailView = ({ 
  employee, 
  onBack, 
  isDarkMode, 
  getStatusConfig,
  getCellStatus,
  onUpdateStatus,
  musterOverrides
}) => {
  const topRef = useRef(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activePopover, setActivePopover] = useState(null);
  const [reportPeriod, setReportPeriod] = useState("1");

  useEffect(() => {
    topRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, []);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!employee.memberId && !employee.empId) {
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const targetId = employee.memberId || employee.empId;
        const res = await getDepartmentMember(targetId);
        if (res.success && res.member) {
          setProfile(res.member);
        }
      } catch (err) {
        console.error('Error fetching member profile:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [employee.memberId, employee.empId]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'TEXTAREA') {
        return;
      }

      if (activePopover === null) return;

      // Arrow key navigation inside single-employee calendar
      if (e.key === 'ArrowRight' || e.key === 'ArrowLeft' || e.key === 'ArrowUp' || e.key === 'ArrowDown') {
        e.preventDefault();
        let newDayNum = activePopover;
        if (e.key === 'ArrowRight') {
          if (newDayNum < 30) newDayNum += 1;
        } else if (e.key === 'ArrowLeft') {
          if (newDayNum > 1) newDayNum -= 1;
        } else if (e.key === 'ArrowDown') {
          if (newDayNum + 7 <= 30) newDayNum += 7;
        } else if (e.key === 'ArrowUp') {
          if (newDayNum - 7 >= 1) newDayNum -= 7;
        }
        setActivePopover(newDayNum);
        return;
      }

      const key = e.key.toLowerCase();
      let newStatus = null;
      if (key === 'p') newStatus = 'P';
      else if (key === 'a') newStatus = 'A';
      else if (key === 'l') newStatus = 'L';
      else if (key === 'h') newStatus = 'H';
      else if (key === 'o' || key === 'w') newStatus = 'OFF';
      else if (e.key === 'Escape') {
        setActivePopover(null);
        return;
      }

      if (newStatus) {
        onUpdateStatus(employee.empId, activePopover, newStatus);
        // Auto advance to next day
        if (activePopover < 30) {
          setActivePopover(activePopover + 1);
        } else {
          setActivePopover(null);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [activePopover, employee.empId, onUpdateStatus]);

  // Resolve values dynamically based on API profile or employee fallback
  const designation = profile?.role || employee.designation || 'Team Member';
  const department = profile?.department || employee.department || 'HR Operations';
  
  const formattedJoinDate = profile?.joinDate 
    ? new Date(profile.joinDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
    : 'June 1, 2026';
    
  const email = profile?.email || `${employee.name.toLowerCase().replace(/\s+/g, '.')}@mabicons.com`;
  const phone = profile?.phone || '+91 99999-00000';

  const generateMonthAttendance = (emp, year, monthZeroIndexed) => {
    const daysInMonth = new Date(year, monthZeroIndexed + 1, 0).getDate();
    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const monthName = monthNames[monthZeroIndexed];
    
    const days = [];
    let P = 0, A = 0, L = 0, H = 0, OFF = 0;
    
    for (let day = 1; day <= daysInMonth; day++) {
      const curDate = new Date(year, monthZeroIndexed, day);
      const dayOfWeek = curDate.getDay();
      const weekdayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const weekday = weekdayNames[dayOfWeek];
      
      let status = 'P';
      
      if (dayOfWeek === 0) {
        status = 'OFF';
      } 
      else if (year === 2026 && monthZeroIndexed === 5 && musterOverrides?.[emp.empId]?.[day]) {
        status = musterOverrides[emp.empId][day];
      } 
      else if (day === 15) {
        status = 'H';
      }
      else {
        const leaveQuota = emp.stats?.L || 0;
        if (leaveQuota > 0 && day % 11 === 0) status = 'L';
        else if (leaveQuota > 2 && day % 8 === 0) status = 'L';
      }
      
      if (status === 'P') P++;
      else if (status === 'A') A++;
      else if (status === 'L') L++;
      else if (status === 'H') H++;
      else if (status === 'OFF') OFF++;
      
      days.push({
        dateStr: `${year}-${String(monthZeroIndexed + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
        day,
        weekday,
        status
      });
    }
    
    return {
      monthName,
      year,
      days,
      stats: { P, A, L, H, OFF, total: daysInMonth }
    };
  };

  const handleDownloadCSV = () => {
    const monthsData = [];
    const numMonths = parseInt(reportPeriod);
    
    for (let i = numMonths - 1; i >= 0; i--) {
      const monthIdx = 5 - i;
      monthsData.push(generateMonthAttendance(employee, 2026, monthIdx));
    }
    
    const rows = [];
    rows.push(['Employee Name', employee.name]);
    rows.push(['Employee ID', employee.empId]);
    rows.push(['Designation', designation]);
    rows.push(['Department', department]);
    rows.push(['Period', numMonths === 1 ? 'June 2026' : `Last ${numMonths} Months`]);
    rows.push([]);
    
    rows.push(['Month', 'Present (P)', 'Absent (A)', 'Leave (L)', 'Holiday (H)', 'Weekly Off (OFF)', 'Total Days']);
    monthsData.forEach(m => {
      rows.push([
        `"${m.monthName} ${m.year}"`,
        m.stats.P,
        m.stats.A,
        m.stats.L,
        m.stats.H,
        m.stats.OFF,
        m.stats.total
      ]);
    });
    rows.push([]);
    
    rows.push(['Date', 'Day', 'Weekday', 'Status']);
    monthsData.forEach(m => {
      m.days.forEach(d => {
        rows.push([
          d.dateStr,
          d.day,
          d.weekday,
          d.status
        ]);
      });
    });
    
    const csvContent = rows.map(r => r.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Attendance_Report_${employee.name.replace(/\s+/g, '_')}_${numMonths}m.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success('Report downloaded successfully as Excel CSV!', {
      style: {
        borderRadius: '12px',
        background: '#1A1A2E',
        color: '#fff',
        fontSize: '13px',
        fontWeight: 'bold',
      }
    });
  };

  const handleDownloadPDF = () => {
    const numMonths = parseInt(reportPeriod);
    const monthsData = [];
    
    for (let i = numMonths - 1; i >= 0; i--) {
      const monthIdx = 5 - i;
      monthsData.push(generateMonthAttendance(employee, 2026, monthIdx));
    }
    
    const doc = new jsPDF();
    
    doc.setFillColor(13, 71, 161);
    doc.rect(0, 0, 210, 35, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(20);
    doc.text("MABICONS DIGITAL SOLUTIONS", 15, 15);
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    doc.text("Employee Attendance Ledger & Report", 15, 23);
    
    doc.setTextColor(60, 60, 60);
    doc.setFontSize(9.5);
    
    let y = 45;
    doc.setFont("helvetica", "bold");
    doc.text("EMPLOYEE DETAILS", 15, y);
    doc.setDrawColor(220, 220, 220);
    doc.line(15, y + 1.5, 195, y + 1.5);
    
    y += 8;
    doc.setFont("helvetica", "normal");
    doc.text(`Employee Name: ${employee.name}`, 15, y);
    doc.text(`Employee ID: ${employee.empId}`, 110, y);
    
    y += 5;
    doc.text(`Designation: ${designation}`, 15, y);
    doc.text(`Department: ${department}`, 110, y);
    
    y += 5;
    doc.text(`Email: ${email}`, 15, y);
    doc.text(`Shift: Gen Shift (09:30 AM - 06:30 PM)`, 110, y);
    
    y += 5;
    const periodText = numMonths === 1 
      ? 'June 2026' 
      : `${monthsData[0].monthName} 2026 - ${monthsData[monthsData.length - 1].monthName} 2026`;
    doc.text(`Report Period: ${periodText}`, 15, y);
    doc.text(`Generated On: ${new Date().toLocaleDateString()}`, 110, y);
    
    y += 10;
    doc.setFont("helvetica", "bold");
    doc.text("ATTENDANCE SUMMARY", 15, y);
    doc.line(15, y + 1.5, 195, y + 1.5);
    
    y += 5;
    
    const summaryHead = [["Month", "Present (P)", "Absent (A)", "Leave (L)", "Holiday (H)", "Off Day (OFF)", "Total Days"]];
    const summaryBody = monthsData.map(m => [
      `${m.monthName} ${m.year}`,
      m.stats.P,
      m.stats.A,
      m.stats.L,
      m.stats.H,
      m.stats.OFF,
      m.stats.total
    ]);
    
    autoTable(doc, {
      startY: y,
      head: summaryHead,
      body: summaryBody,
      theme: 'striped',
      headStyles: { fillColor: [13, 71, 161] },
      styles: { fontSize: 8.5, cellPadding: 2 }
    });
    
    y = doc.lastAutoTable.finalY + 10;
    
    doc.setFont("helvetica", "bold");
    doc.text("DAILY ATTENDANCE LOGS", 15, y);
    doc.line(15, y + 1.5, 195, y + 1.5);
    
    y += 5;
    
    const logsHead = [["Date", "Weekday", "Status", "Remarks"]];
    const logsBody = [];
    monthsData.forEach(m => {
      m.days.forEach(d => {
        let remarks = "-";
        if (d.status === "OFF") remarks = "Weekly Off";
        else if (d.status === "H") remarks = "Public Holiday";
        else if (d.status === "L") remarks = "Approved Leave";
        
        logsBody.push([
          d.dateStr,
          d.weekday,
          d.status,
          remarks
        ]);
      });
    });
    
    autoTable(doc, {
      startY: y,
      head: logsHead,
      body: logsBody,
      theme: 'grid',
      headStyles: { fillColor: [50, 60, 70] },
      styles: { fontSize: 8, cellPadding: 1.8 },
      rowPageBreak: 'avoid'
    });
    
    doc.save(`Attendance_Report_${employee.name.replace(/\s+/g, '_')}_${numMonths}m.pdf`);
    
    toast.success('Report downloaded successfully as PDF!', {
      style: {
        borderRadius: '12px',
        background: '#1A1A2E',
        color: '#fff',
        fontSize: '13px',
        fontWeight: 'bold',
      }
    });
  };

  // Dynamic statistics for June 2026
  const stats = useMemo(() => {
    let P = 0, A = 0, L = 0, H = 0, OFF = 0;
    for (let d = 1; d <= 30; d++) {
      const status = getCellStatus(employee, d);
      if (status === 'P') P++;
      else if (status === 'A') A++;
      else if (status === 'L') L++;
      else if (status === 'H') H++;
      else if (status === 'OFF') OFF++;
    }
    return { P, A, L, H, OFF };
  }, [employee, getCellStatus]);

  const InfoItem = ({ label, value, fullWidth = false }) => (
    <div className={`space-y-1.5 ${fullWidth ? 'col-span-full' : ''} text-left`}>
      <label className="text-[10px] font-bold text-[#9B9BAD] dark:text-slate-400 uppercase tracking-[2px]">{label}</label>
      <div className="bg-white dark:bg-slate-800 px-4 py-3 rounded-xl border border-[#F4F3EF] dark:border-slate-700 shadow-sm">
        <p className="text-xs font-bold text-[#1A1A2E] dark:text-white">{value || 'N/A'}</p>
      </div>
    </div>
  );

  const StatBadge = ({ type, count, label, colorClass }) => (
    <div className={`p-3 rounded-2xl border text-center flex flex-col justify-center min-w-[70px] ${colorClass}`}>
      <span className="text-xl font-extrabold leading-none">{count}</span>
      <span className="text-[9px] font-black uppercase tracking-wider mt-1.5">{label}</span>
    </div>
  );

  // June 2026 starts on Monday (1 padding day before for Sunday)
  const paddingDays = 1;
  const daysInJune = 30;
  const calendarCells = [];

  // Add padding cells
  for (let i = 0; i < paddingDays; i++) {
    calendarCells.push(null);
  }
  // Add days of month
  for (let i = 1; i <= daysInJune; i++) {
    calendarCells.push(i);
  }

  return (
    <motion.div
      ref={topRef}
      initial={{ x: '100%', opacity: 0.5 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: '100%', opacity: 0.5 }}
      transition={{ type: "spring", damping: 30, stiffness: 300 }}
      className={`flex flex-col h-full relative ${
        isDarkMode ? 'bg-slate-900 text-white' : 'bg-white text-[#1A1A2E]'
      }`}
      style={{ fontFamily: "'Calibri', sans-serif" }}
    >
      {/* Drawer Header */}
      <div className={`p-6 border-b flex items-center justify-between z-20 shrink-0 ${
        isDarkMode ? 'bg-slate-900/95 border-slate-800' : 'bg-gradient-to-r from-blue-50/30 to-white border-[#F4F3EF]'
      }`}>
        <div className="text-left">
          <h3 className="text-lg font-bold text-[#1A1A2E] dark:text-white font-syne">Employee Portfolio</h3>
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-0.5">Attendance Ledger & Details</p>
        </div>
        <button 
          onClick={onBack} 
          className="w-10 h-10 rounded-2xl flex items-center justify-center text-[#9B9BAD] hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-all duration-300"
        >
          <FiX size={20} />
        </button>
      </div>

      {/* Drawer Content */}
      <div className={`flex-1 overflow-y-auto custom-scrollbar ${isDarkMode ? 'bg-slate-950' : 'bg-white'}`}>
        {loading ? (
          <div className="p-10 space-y-6 animate-pulse">
            <div className="flex flex-col items-center space-y-4">
              <div className={`w-24 h-24 rounded-[32px] ${isDarkMode ? 'bg-slate-800' : 'bg-slate-200'}`} />
              <div className={`h-6 w-48 rounded ${isDarkMode ? 'bg-slate-800' : 'bg-slate-200'}`} />
              <div className={`h-4 w-32 rounded ${isDarkMode ? 'bg-slate-800' : 'bg-slate-200'}`} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-[280px_1fr] gap-6 mt-8">
              <div className={`h-80 rounded-[32px] ${isDarkMode ? 'bg-slate-800' : 'bg-slate-200'}`} />
              <div className={`h-96 rounded-[32px] ${isDarkMode ? 'bg-slate-800' : 'bg-slate-200'}`} />
            </div>
          </div>
        ) : (
          <div className="p-8 max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-8">
              
              {/* Left Column: Profile Card & Quick Info */}
              <div className="space-y-6">
                
                {/* Profile Identity Card */}
                <div className={`rounded-[32px] border p-6 flex flex-col items-center text-center relative overflow-hidden ${
                  isDarkMode ? 'bg-slate-900/40 border-slate-800' : 'bg-[#FAFAF8] border-[#F4F3EF]'
                }`}>
                  <div className="relative mb-5 z-10">
                    <div className="w-20 h-20 rounded-[28px] bg-[#1B4DA0] flex items-center justify-center text-white text-2xl font-extrabold shadow-xl shadow-blue-500/20 overflow-hidden"
                         style={{ background: 'linear-gradient(135deg, #1B4DA0 0%, #0D47A1 100%)' }}>
                      <span>{(employee.name || 'M').substring(0, 2).toUpperCase()}</span>
                    </div>
                  </div>
                  <div className="space-y-1 w-full flex flex-col items-center z-10">
                    <h4 className="text-lg font-bold text-[#1A1A2E] dark:text-white tracking-tight font-syne truncate max-w-full">{employee.name}</h4>
                    <p className="text-[10px] font-bold text-[#0D47A1] dark:text-blue-400 uppercase tracking-[2px] truncate max-w-full">{designation}</p>
                    <p className="text-[9px] font-semibold text-slate-400 dark:text-slate-500">{department}</p>
                  </div>
                </div>

                {/* Monthly Summary Statistics Grid */}
                <div className="space-y-3">
                  <h5 className="text-[10px] font-black uppercase tracking-wider text-[#1A1A2E] dark:text-white text-left pl-1">June 2026 Summary</h5>
                  <div className="grid grid-cols-3 gap-2">
                    <StatBadge 
                      type="P" 
                      count={stats.P} 
                      label="Present" 
                      colorClass={isDarkMode ? 'bg-emerald-950/20 border-emerald-900/50 text-emerald-400' : 'bg-emerald-50 border-emerald-100 text-emerald-600'} 
                    />
                    <StatBadge 
                      type="A" 
                      count={stats.A} 
                      label="Absent" 
                      colorClass={isDarkMode ? 'bg-rose-950/20 border-rose-900/50 text-rose-400' : 'bg-rose-50 border-rose-100 text-rose-500'} 
                    />
                    <StatBadge 
                      type="L" 
                      count={stats.L} 
                      label="Leave" 
                      colorClass={isDarkMode ? 'bg-blue-950/20 border-blue-900/50 text-blue-400' : 'bg-blue-50 border-blue-100 text-blue-600'} 
                    />
                    <StatBadge 
                      type="H" 
                      count={stats.H} 
                      label="Holiday" 
                      colorClass={isDarkMode ? 'bg-purple-950/20 border-purple-900/50 text-purple-400' : 'bg-purple-50 border-purple-100 text-purple-600'} 
                    />
                    <StatBadge 
                      type="OFF" 
                      count={stats.OFF} 
                      label="Off Day" 
                      colorClass={isDarkMode ? 'bg-slate-800/40 border-slate-700/50 text-slate-400' : 'bg-slate-50 border-slate-200 text-slate-500'} 
                    />
                  </div>
                </div>

                {/* Identity Metadata List */}
                <div className="bg-[#FAFAF8] dark:bg-slate-900/20 rounded-[32px] border border-[#F4F3EF] dark:border-slate-800 p-6 space-y-6 shadow-sm">
                  {/* Employee Identity Group */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 border-b border-[#F4F3EF] dark:border-slate-800 pb-3 text-left">
                      <User className="text-[#0D47A1] dark:text-blue-400" size={16} />
                      <h5 className="text-[11px] font-black text-[#1A1A2E] dark:text-white uppercase tracking-wider">Employee Identity</h5>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <InfoItem label="Employee ID" value={employee.empId} />
                      <InfoItem label="Date of Joining" value={formattedJoinDate} />
                      <InfoItem label="Designation" value={designation} fullWidth />
                      <InfoItem label="Department" value={department} fullWidth />
                    </div>
                  </div>

                  {/* Contact Info Group */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 border-b border-[#F4F3EF] dark:border-slate-800 pb-3 text-left">
                      <Mail className="text-[#0D47A1] dark:text-blue-400" size={16} />
                      <h5 className="text-[11px] font-black text-[#1A1A2E] dark:text-white uppercase tracking-wider">Contact Links</h5>
                    </div>
                    <div className="grid grid-cols-1 gap-4">
                      <InfoItem label="Official Email" value={email} />
                      <InfoItem label="Secure Contact" value={phone} />
                    </div>
                  </div>

                  {/* Shift & Scheduling */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 border-b border-[#F4F3EF] dark:border-slate-800 pb-3 text-left">
                      <Clock className="text-[#0D47A1] dark:text-blue-400" size={16} />
                      <h5 className="text-[11px] font-black text-[#1A1A2E] dark:text-white uppercase tracking-wider">Shift & Scheduling</h5>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <InfoItem label="Shift Code" value="GEN" />
                      <InfoItem label="Shift Hours" value="09:30 AM - 06:30 PM" />
                    </div>
                  </div>
                </div>

                {/* Report Download Panel */}
                <div className="space-y-2">
                  <h5 className="text-[10px] font-black uppercase tracking-wider text-[#1A1A2E] dark:text-white text-left pl-1">Download Reports</h5>
                  <div className={`p-4 rounded-3xl border flex flex-col gap-3 ${
                    isDarkMode ? 'bg-slate-900/60 border-slate-800' : 'bg-[#FAFAF8] border-[#F4F3EF]'
                  }`}>
                    <div className="space-y-1 text-left">
                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block pl-1">Select Period</label>
                      <select 
                        value={reportPeriod}
                        onChange={(e) => setReportPeriod(e.target.value)}
                        className={`w-full text-xs font-bold rounded-xl px-3 py-2.5 outline-none border cursor-pointer appearance-none ${
                          isDarkMode ? 'bg-slate-800 text-white border-slate-700' : 'bg-white text-[#1A1A2E] border-[#E8E7E2]'
                        }`}
                      >
                        <option value="1">This Month (June 2026)</option>
                        <option value="3">Last 3 Months (Apr - Jun 2026)</option>
                        <option value="6">Last 6 Months (Jan - Jun 2026)</option>
                      </select>
                    </div>

                    <div className="flex gap-2 w-full">
                      <button
                        onClick={handleDownloadPDF}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs font-bold bg-[#0D47A1] text-white hover:bg-[#0a3a82] active:scale-95 transition-all shadow-md shadow-blue-500/10"
                      >
                        <FiDownload className="w-3.5 h-3.5" />
                        PDF
                      </button>
                      <button
                        onClick={handleDownloadCSV}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs font-bold border border-emerald-500/30 bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 active:scale-95 transition-all"
                      >
                        <FiDownload className="w-3.5 h-3.5" />
                        Excel
                      </button>
                    </div>
                  </div>
                </div>

              </div>

              {/* Right Column: Attendance Calendar View */}
              <div className="space-y-6">
                <div className={`rounded-[32px] border p-6 md:p-8 flex flex-col ${
                  isDarkMode ? 'bg-slate-900/40 border-slate-800' : 'bg-[#FAFAF8] border-[#F4F3EF] shadow-sm'
                }`}>
                  
                  {/* Calendar Header */}
                  <div className="flex items-center justify-between border-b border-[#F4F3EF] dark:border-slate-800 pb-4 mb-6">
                    <div className="text-left">
                      <h4 className="text-base font-bold text-[#1A1A2E] dark:text-white font-syne">Attendance Calendar</h4>
                      <p className="text-[9px] font-black text-[#0D47A1] dark:text-blue-400 uppercase tracking-widest mt-0.5">June 2026</p>
                    </div>
                    <div className={`px-4 py-2 rounded-xl text-xs font-bold ${
                      isDarkMode ? 'bg-slate-800 text-slate-300' : 'bg-white border border-[#F4F3EF] text-slate-500'
                    }`}>
                      Interactive View
                    </div>
                  </div>

                  {/* Calendar Instructions Banner */}
                  <div className={`p-4 rounded-2xl mb-6 text-left flex items-start gap-3 border ${
                    isDarkMode ? 'bg-blue-950/15 border-blue-900/30 text-blue-300' : 'bg-blue-50/50 border-blue-100 text-blue-700'
                  }`}>
                    <Shield className="shrink-0 mt-0.5" size={16} />
                    <div>
                      <p className="text-xs font-bold leading-relaxed">Attendance Regularization Panel</p>
                      <p className="text-[10px] opacity-80 mt-0.5 leading-relaxed">Click any day cell below to override daily punch status. The metrics and main register grid will update instantly.</p>
                    </div>
                  </div>

                  {/* Calendar Grid */}
                  <div className="w-full">
                    {/* Weekdays Headers */}
                    <div className="grid grid-cols-7 gap-2 mb-2 text-center">
                      {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(wd => (
                        <div key={wd} className="py-2 text-[9px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-wider">
                          {wd}
                        </div>
                      ))}
                    </div>

                    {/* Days Cells */}
                    <div className="grid grid-cols-7 gap-2">
                      {calendarCells.map((dayNum, index) => {
                        if (dayNum === null) {
                          return <div key={`pad-${index}`} className="aspect-square rounded-2xl opacity-0" />;
                        }

                        const status = getCellStatus(employee, dayNum);
                        const styles = getAttendanceCellStyle(status, isDarkMode);
                        const isSelected = activePopover === dayNum;

                        return (
                          <div
                            key={`day-${dayNum}`}
                            style={styles}
                            className={`aspect-square rounded-2xl border flex flex-col justify-between p-2.5 relative cursor-pointer select-none transition-all duration-300 ${
                              isSelected 
                                ? 'ring-2 ring-[#0D47A1] dark:ring-blue-500 border-transparent shadow-lg scale-105 z-30' 
                                : 'hover:scale-105 hover:shadow-md'
                            }`}
                            onClick={() => {
                              if (document.activeElement && typeof document.activeElement.blur === 'function') {
                                document.activeElement.blur();
                              }
                              setActivePopover(isSelected ? null : dayNum);
                            }}
                          >
                            {/* Day Number */}
                            <span className="text-xs font-extrabold text-left leading-none">
                              {dayNum < 10 ? `0${dayNum}` : dayNum}
                            </span>

                            {/* Status Indicator pill */}
                            <div className="w-full flex justify-end items-center mt-1">
                              <span className="text-[8px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-md border border-current/10">
                                {status}
                              </span>
                            </div>

                            {/* Backdrop overlay to clear selection on outside click */}
                            <AnimatePresence>
                              {isSelected && (
                                <div 
                                  className="fixed inset-0 z-30" 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setActivePopover(null);
                                  }} 
                                />
                              )}
                            </AnimatePresence>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Legend Grid */}
                  <div className="flex items-center gap-4 mt-8 flex-wrap border-t border-[#F4F3EF] dark:border-slate-800 pt-6 justify-center">
                    <span className="text-[8px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Legend:</span>
                    <div className="flex items-center gap-1.5">
                      <span className="w-4 h-4 rounded-md flex items-center justify-center text-[8px] font-bold border" style={getAttendanceCellStyle('P', isDarkMode)}>P</span>
                      <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400">Present</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-4 h-4 rounded-md flex items-center justify-center text-[8px] font-bold border" style={getAttendanceCellStyle('A', isDarkMode)}>A</span>
                      <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400">Absent</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-4 h-4 rounded-md flex items-center justify-center text-[8px] font-bold border" style={getAttendanceCellStyle('L', isDarkMode)}>L</span>
                      <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400">Leave</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-4 h-4 rounded-md flex items-center justify-center text-[8px] font-bold border" style={getAttendanceCellStyle('H', isDarkMode)}>H</span>
                      <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400">Holiday</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-4 h-4 rounded-md flex items-center justify-center text-[8px] font-bold border" style={getAttendanceCellStyle('OFF', isDarkMode)}>OFF</span>
                      <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400">Off Day</span>
                    </div>
                  </div>

                </div>
              </div>

            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default EmployeeDetailView;
