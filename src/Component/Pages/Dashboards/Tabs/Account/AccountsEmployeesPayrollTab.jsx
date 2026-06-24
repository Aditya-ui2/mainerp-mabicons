import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiSearch, FiFilter, FiDownload, FiPlus, FiChevronRight, FiChevronDown,
  FiMail, FiPhone, FiMapPin, FiActivity, FiBriefcase, FiUsers, FiTrash,
  FiX, FiUser, FiClock, FiZap, FiCheckSquare, FiDatabase, FiEdit3, FiTrendingUp, FiTarget, FiCheckCircle, FiCheck,
  FiEdit2, FiFileText, FiEye, FiUpload, FiRefreshCw, FiCamera, FiCreditCard
} from 'react-icons/fi';
import { FaRupeeSign } from 'react-icons/fa';
import { getFinancePayroll, getEmployeeAttendance, updateEmployeeSalary } from '../../../service/api';

const InfoItem = ({ label, value, subValue, fullWidth = false }) => (
  <div className={`space-y-1.5 ${fullWidth ? 'col-span-full' : ''}`}>
    <label className="text-[10px] font-bold text-[#9B9BAD] uppercase tracking-[2px]">{label}</label>
    <div className="bg-white px-4 py-3 rounded-xl border border-[#F4F3EF]">
      <p className="text-sm font-bold text-[#1A1A2E]">{value || 'N/A'}</p>
      {subValue && <p className="text-[10px] font-medium text-[#6B6B7E] mt-0.5">{subValue}</p>}
    </div>
  </div>
);

const AccountsEmployeesPayrollTab = ({ notificationBell }) => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [selectedEmployeeDetail, setSelectedEmployeeDetail] = useState(null);
  const [isAttendanceModalOpen, setIsAttendanceModalOpen] = useState(false);
  const [attendanceMonth, setAttendanceMonth] = useState(new Date().getMonth());
  const [attendanceYear, setAttendanceYear] = useState(new Date().getFullYear());

  // Payroll date filters
  const [payrollMonth, setPayrollMonth] = useState(new Date().getMonth());
  const [payrollYear, setPayrollYear] = useState(new Date().getFullYear());
  const [dateFilterType, setDateFilterType] = useState('This Month');
  const [customDate, setCustomDate] = useState('');
  const dateInputRef = React.useRef(null);

  // Attendance loading state
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [loadingAttendance, setLoadingAttendance] = useState(false);

  // Payslip form state
  const [basicSalary, setBasicSalary] = useState(0);
  const [leaves, setLeaves] = useState(0);
  const [payrollStatus, setPayrollStatus] = useState('Pending');
  const [savingPayroll, setSavingPayroll] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [bankAccount, setBankAccount] = useState('');
  const [pfNumber, setPfNumber] = useState('');
  const [uanNumber, setUanNumber] = useState('');

  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const res = await getFinancePayroll(payrollMonth, payrollYear);
      if (res && res.success) {
        setEmployees(res.data);
      } else {
        setEmployees([]);
      }
    } catch (err) {
      console.error('Error fetching employees:', err);
      setEmployees([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, [payrollMonth, payrollYear]);

  useEffect(() => {
    if (selectedEmployeeDetail) {
      const basic = selectedEmployeeDetail.basicSalary || 0;
      const working = selectedEmployeeDetail.workingDays || 22;
      const present = selectedEmployeeDetail.presentDays || 0;
      
      setBasicSalary(basic);
      setPayrollStatus(selectedEmployeeDetail.payrollStatus || 'Pending');
      setBankAccount(selectedEmployeeDetail.bankAccount || '');
      setPfNumber(selectedEmployeeDetail.pfNumber || '');
      setUanNumber(selectedEmployeeDetail.uanNumber || '');

      // Calculate leaves from saved deductions or fallback to attendance
      if (selectedEmployeeDetail.payslipId && selectedEmployeeDetail.deductions > 0) {
        const perDay = basic / (working || 22);
        const calculatedLeaves = perDay > 0 ? Math.round(selectedEmployeeDetail.deductions / perDay) : 0;
        setLeaves(calculatedLeaves);
      } else {
        setLeaves(working - present);
      }
    }
  }, [selectedEmployeeDetail]);

  const fetchAttendance = async () => {
    if (!selectedEmployeeDetail) return;
    setLoadingAttendance(true);
    try {
      const res = await getEmployeeAttendance(selectedEmployeeDetail.id, attendanceMonth, attendanceYear);
      if (res && res.success) {
        setAttendanceRecords(res.data);
      }
    } catch (err) {
      console.error('Error fetching attendance:', err);
    } finally {
      setLoadingAttendance(false);
    }
  };

  useEffect(() => {
    if (isAttendanceModalOpen && selectedEmployeeDetail) {
      fetchAttendance();
    }
  }, [isAttendanceModalOpen, selectedEmployeeDetail, attendanceMonth, attendanceYear]);

  const calculatedNetSalary = (() => {
    const working = selectedEmployeeDetail?.workingDays || 22;
    const perDay = parseFloat(basicSalary || 0) / (working || 22);
    const deductionAmount = perDay * parseFloat(leaves || 0);
    const net = Math.round(parseFloat(basicSalary || 0) - deductionAmount);
    return net < 0 ? 0 : net;
  })();

  const handleSavePayslip = async (e) => {
    if (e) e.preventDefault();
    if (!selectedEmployeeDetail) return;
    setSavingPayroll(true);
    setSaveSuccess(false);

    try {
      const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
      const working = selectedEmployeeDetail?.workingDays || 22;
      const perDay = parseFloat(basicSalary || 0) / (working || 22);
      const deductionAmount = Math.round(perDay * parseFloat(leaves || 0));

      const payload = {
        month: monthNames[payrollMonth],
        year: payrollYear,
        basicSalary: parseFloat(basicSalary || 0),
        hra: 0,
        otherAllowances: 0,
        deductions: deductionAmount,
        netSalary: calculatedNetSalary,
        status: payrollStatus,
        memberName: selectedEmployeeDetail.name,
        department: selectedEmployeeDetail.department,
        bankAccount,
        pfNumber,
        uanNumber
      };

      const res = await updateEmployeeSalary(selectedEmployeeDetail.id, payload);
      if (res && res.success) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
        
        setSelectedEmployeeDetail(prev => ({
          ...prev,
          ...payload,
          payslipId: res.data.id || prev.payslipId,
          payrollStatus: payload.status
        }));
        
        fetchEmployees();
      }
    } catch (err) {
      console.error('Error saving payslip:', err);
      alert(err.message || 'Failed to save payslip.');
    } finally {
      setSavingPayroll(false);
    }
  };

  const filteredEmployees = employees.filter(e => {
    const matchesSearch = (e.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (e.role || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (e.department || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = selectedStatus === 'ALL' || (e.status || 'Active').toUpperCase() === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <>
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
        <div className="flex items-center justify-between mb-8 text-left">
          <div className="flex flex-col text-left">
            <h1 className="text-3xl font-bold text-[#1A1A2E] tracking-tight" style={{ fontFamily: "'Syne', sans-serif" }}>
              Employees & Payroll
            </h1>
          </div>
          <div className="flex items-center gap-3">
            {notificationBell}
          </div>
        </div>

        {/* Filter Bar */}
        <div className="bg-white rounded-[24px] p-2 border border-[#F4F3EF] shadow-sm flex items-center gap-3 flex-wrap mb-8">
          <div className="relative flex-1 group min-w-[200px]">
            <FiSearch className="absolute left-5 top-1/2 -translate-y-1/2 text-[#9B9BAD] transition-colors" size={18} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search employees..."
              className="w-full bg-[#F4F3EF] border-none rounded-2xl py-3 pl-14 pr-5 text-sm font-medium focus:ring-2 focus:ring-[#F4F3EF] outline-none transition-all placeholder:text-[#9B9BAD]"
            />
          </div>

          {/* Unified Date Filter */}
          <div className="relative group flex items-center gap-2">
            <div className="relative">
              <select
                value={dateFilterType}
                onChange={(e) => {
                  const val = e.target.value;
                  setDateFilterType(val);
                  if (val === 'This Month') {
                    setPayrollMonth(new Date().getMonth());
                    setPayrollYear(new Date().getFullYear());
                  } else if (val === 'This Week') {
                    setPayrollMonth(new Date().getMonth());
                    setPayrollYear(new Date().getFullYear());
                  } else if (val === 'All Date') {
                    setPayrollMonth(null);
                    setPayrollYear(null);
                  } else if (val === 'Custom Date') {
                    if (dateInputRef.current && dateInputRef.current.showPicker) {
                      try {
                        dateInputRef.current.showPicker();
                      } catch (err) {}
                    }
                  }
                }}
                className="bg-[#F4F3EF] text-[11px] font-black uppercase tracking-widest text-[#1A1A2E] rounded-xl pl-4 pr-10 py-2.5 outline-none border-0 cursor-pointer appearance-none min-w-[150px] hover:bg-[#EEF2FB] transition-all"
              >
                <option value="All Date">ALL DATE</option>
                <option value="This Month">THIS MONTH</option>
                <option value="This Week">THIS WEEK</option>
                <option value="Custom Date">CUSTOM DATE</option>
              </select>
              <FiChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#1B4DA0] opacity-50 group-hover:opacity-100 transition-all pointer-events-none" />
            </div>
            
            <input
              ref={dateInputRef}
              type="date"
              value={customDate}
              style={{ display: dateFilterType === 'Custom Date' ? 'block' : 'none' }}
              onChange={(e) => {
                setCustomDate(e.target.value);
                if (e.target.value) {
                  const date = new Date(e.target.value);
                  setPayrollMonth(date.getMonth());
                  setPayrollYear(date.getFullYear());
                }
              }}
              className="bg-[#F4F3EF] border-none rounded-xl py-2 px-3 text-sm font-medium focus:ring-2 focus:ring-[#F4F3EF] outline-none transition-all"
            />
          </div>

          <div className="relative group">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="bg-[#F4F3EF] text-[11px] font-black uppercase tracking-widest text-[#1A1A2E] rounded-xl pl-4 pr-10 py-2.5 outline-none border-0 cursor-pointer appearance-none min-w-[150px] hover:bg-[#EEF2FB] transition-all"
            >
              <option value="ALL">ALL STATUS</option>
              <option value="ACTIVE">ACTIVE</option>
              <option value="INACTIVE">INACTIVE</option>
            </select>
            <FiChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#1B4DA0] opacity-50 group-hover:opacity-100 transition-all pointer-events-none" />
          </div>
        </div>

        <div className="bg-white rounded-[32px] shadow-sm border border-[#F4F3EF] overflow-hidden">
          <div className="overflow-x-auto min-h-[400px] flex flex-col">
            {loading ? (
              <div className="flex-1 flex flex-col items-center justify-center py-20">
                <div className="w-12 h-12 border-4 border-[#1B4DA0] border-t-transparent rounded-full animate-spin mb-4" />
                <p className="text-[#6B6B7E] font-medium">Loading employees...</p>
              </div>
            ) : filteredEmployees.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center py-20 text-center px-8">
                <div className="w-20 h-20 bg-[#F4F3EF] rounded-full flex items-center justify-center mb-6 text-[#1B4DA0]">
                  <FiUsers size={32} />
                </div>
                <h3 className="text-xl font-bold text-[#1A1A2E] mb-2">No employees found</h3>
                <p className="text-[#6B6B7E] max-w-xs mx-auto mb-8">
                  {searchQuery ? `No employees match your search "${searchQuery}"` : "We couldn't find any employees in the database."}
                </p>
              </div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#F4F3EF] bg-transparent">
                    <th className="pl-8 py-4 text-[11px] font-bold text-[#94a3b8] uppercase tracking-widest text-left">Employee Name</th>
                    <th className="px-8 py-4 text-[11px] font-bold text-[#94a3b8] uppercase tracking-widest text-left">Role / Department</th>
                    <th className="px-8 py-4 text-[11px] font-bold text-[#94a3b8] uppercase tracking-widest text-left">Present Logins</th>
                    <th className="px-8 py-4 text-[11px] font-bold text-[#94a3b8] uppercase tracking-widest text-left">Net Salary</th>
                    <th className="px-8 py-4 text-[11px] font-bold text-[#94a3b8] uppercase tracking-widest text-left">Payroll Status</th>
                    <th className="px-8 py-4 text-[11px] font-bold text-[#94a3b8] uppercase tracking-widest text-left">PF & Bank Info</th>
                    <th className="px-8 py-4"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F4F3EF]">
                  {filteredEmployees.map((emp) => (
                    <tr
                      key={emp.id}
                      onClick={() => setSelectedEmployeeDetail(emp)}
                      className="hover:bg-[#F8FAFF] transition-all group cursor-pointer"
                    >
                      <td className="pl-8 py-4">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-[#EEF2FB] text-[#1B4DA0] flex items-center justify-center font-black">
                            {emp.name.substring(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <p className="text-[14px] font-bold text-[#1A1A2E]">{emp.name}</p>
                            <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">{emp.status}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-4 text-left">
                        <p className="text-[13px] font-bold text-[#1A1A2E]">{emp.role}</p>
                        <p className="text-[10px] font-medium text-[#6B6B7E] mt-0.5">{emp.department}</p>
                      </td>
                      <td className="px-8 py-4 text-left">
                        <div className="inline-flex items-center px-4 py-2 rounded-xl bg-blue-50 text-[#1B4DA0] text-[11px] font-black uppercase tracking-widest">
                          {emp.presentDays} / {emp.workingDays} Days
                        </div>
                      </td>
                      <td className="px-8 py-4 text-left">
                        <div className="flex flex-col">
                          <span className="text-[13px] font-black text-[#1A1A2E]">
                            ₹{emp.netSalary?.toLocaleString('en-IN') || '0'}
                          </span>
                          <span className="text-[10px] uppercase tracking-widest text-[#6B6B7E] font-bold">
                            Salary: ₹{(emp.basicSalary || 0).toLocaleString('en-IN')}
                          </span>
                        </div>
                      </td>
                      <td className="px-8 py-4 text-left">
                        <div className={`inline-flex items-center px-4 py-2 rounded-xl text-[11px] font-black uppercase tracking-widest ${
                          emp.payrollStatus === 'Paid' ? 'bg-emerald-50 text-emerald-600' :
                          emp.payrollStatus === 'Generated' ? 'bg-blue-50 text-blue-600' :
                          'bg-amber-50 text-amber-600'
                        }`}>
                          {emp.payrollStatus || 'Pending'}
                        </div>
                      </td>
                      <td className="px-8 py-4 text-left">
                        <div className="flex flex-col gap-1 text-[11px] font-bold text-[#6B6B7E]">
                          <div className="flex items-center gap-1">
                            <FiCreditCard size={12} className="text-[#1B4DA0]" />
                            {emp.bankAccount || 'N/A'}
                          </div>
                          <div className="text-[9px] uppercase tracking-wider text-[#9B9BAD]">
                            PF: {emp.pfNumber || 'N/A'}
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-4 text-right">
                        <FiChevronRight className="inline-block text-[#9B9BAD]" size={18} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </motion.div>

      {/* Drawer */}
      {createPortal(
        <AnimatePresence>
          {selectedEmployeeDetail && (
            <React.Fragment>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-[#1A1A2E]/40 backdrop-blur-md z-[200000]"
                onClick={() => setSelectedEmployeeDetail(null)}
              />
              <motion.div
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: "spring", damping: 30, stiffness: 200 }}
                className="fixed inset-y-0 right-0 w-full max-w-[698px] bg-white shadow-2xl border-l border-[#F4F3EF] flex flex-col z-[200001] overflow-hidden"
              >
                {/* Drawer Header */}
                <div className="p-6 border-b border-[#F4F3EF] flex items-center justify-between bg-gradient-to-r from-blue-50/30 to-white">
                  <h3 className="text-xl font-bold text-[#1A1A2E]" style={{ fontFamily: "'Syne', sans-serif" }}>Employee Profile</h3>
                  <button onClick={() => setSelectedEmployeeDetail(null)} className="w-10 h-10 rounded-2xl flex items-center justify-center text-[#9B9BAD] hover:text-red-500 hover:bg-red-50 transition-all duration-300">
                    <FiX size={20} />
                  </button>
                </div>

                {/* Drawer Content */}
                <div className="flex-1 overflow-y-auto px-10 py-8 space-y-10 custom-scrollbar text-left">
                  
                  {/* Profile Header (Centered) */}
                  <div className="flex flex-col items-center text-center">
                    <div className="relative mb-6">
                      <div className="w-24 h-24 rounded-[32px] bg-[#1B4DA0] flex items-center justify-center text-white text-3xl font-extrabold shadow-xl shadow-blue-500/20 overflow-hidden"
                           style={{ background: 'linear-gradient(135deg, #1B4DA0 0%, #0D47A1 100%)' }}>
                        <span>{(selectedEmployeeDetail.name || 'E').substring(0, 2).toUpperCase()}</span>
                      </div>
                    </div>
                    <div className="space-y-1.5 w-full flex flex-col items-center">
                      <h4 className="text-2xl font-bold text-[#1A1A2E] tracking-tight font-syne">{selectedEmployeeDetail.name}</h4>
                      <p className="text-[11px] font-bold text-[#0D47A1] uppercase tracking-[3px]">{selectedEmployeeDetail.role}</p>
                    </div>
                  </div>

                  {/* Information Grid */}
                  <div className="bg-[#FAFAF8] rounded-[32px] border border-[#F4F3EF] p-8 space-y-10 shadow-sm">
                    
                    {/* Basic Details */}
                    <div className="space-y-6">
                      <div className="flex items-center gap-3 border-b border-[#F4F3EF] pb-4">
                        <FiUser className="text-[#1B4DA0]" size={18} />
                        <h5 className="text-[12px] font-black text-[#1A1A2E] uppercase tracking-wider">Basic Details</h5>
                      </div>
                      <div className="grid grid-cols-2 gap-x-8 gap-y-6">
                        <InfoItem label="Email Address" value={selectedEmployeeDetail.email} />
                        <InfoItem label="Phone Number" value={selectedEmployeeDetail.phone} />
                        <InfoItem label="Department" value={selectedEmployeeDetail.department} />
                        <InfoItem label="Location" value={selectedEmployeeDetail.location || 'Gurgaon'} />
                      </div>
                    </div>

                    {/* Payroll Details */}
                    <div className="space-y-6">
                      <div className="flex items-center gap-3 border-b border-[#F4F3EF] pb-4">
                        <FaRupeeSign className="text-[#1B4DA0]" size={18} />
                        <h5 className="text-[12px] font-black text-[#1A1A2E] uppercase tracking-wider">Payroll Information</h5>
                      </div>
                      <div className="grid grid-cols-2 gap-x-8 gap-y-6 text-left">
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold text-[#9B9BAD] uppercase tracking-[2px]">Bank Account</label>
                          <input
                            type="text"
                            value={bankAccount}
                            onChange={(e) => setBankAccount(e.target.value)}
                            className="w-full bg-white border border-[#F4F3EF] rounded-xl px-4 py-3 text-sm font-bold text-[#1A1A2E] focus:ring-2 focus:ring-blue-100 outline-none"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold text-[#9B9BAD] uppercase tracking-[2px]">PF Number</label>
                          <input
                            type="text"
                            value={pfNumber}
                            onChange={(e) => setPfNumber(e.target.value)}
                            className="w-full bg-white border border-[#F4F3EF] rounded-xl px-4 py-3 text-sm font-bold text-[#1A1A2E] focus:ring-2 focus:ring-blue-100 outline-none"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold text-[#9B9BAD] uppercase tracking-[2px]">UAN Number</label>
                          <input
                            type="text"
                            value={uanNumber}
                            onChange={(e) => setUanNumber(e.target.value)}
                            className="w-full bg-white border border-[#F4F3EF] rounded-xl px-4 py-3 text-sm font-bold text-[#1A1A2E] focus:ring-2 focus:ring-blue-100 outline-none"
                          />
                        </div>
                        <InfoItem label="Join Date" value={selectedEmployeeDetail.joinDate} />
                      </div>
                    </div>
                  </div>

                  {/* Process Payslip Form */}
                  <form onSubmit={handleSavePayslip} className="bg-[#FAFAF8] rounded-[32px] border border-[#F4F3EF] p-8 space-y-6 shadow-sm">
                    <div className="flex items-center gap-3 border-b border-[#F4F3EF] pb-4">
                      <FiFileText className="text-[#1B4DA0]" size={18} />
                      <h5 className="text-[12px] font-black text-[#1A1A2E] uppercase tracking-wider">
                        Process Payslip ({['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'][payrollMonth]} {payrollYear})
                      </h5>
                    </div>

                    <div className="grid grid-cols-2 gap-6 text-left">
                      {/* Salary per Month */}
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-[#9B9BAD] uppercase tracking-[2px]">Salary per Month</label>
                        <input
                          type="number"
                          value={basicSalary}
                          onChange={(e) => setBasicSalary(parseFloat(e.target.value) || 0)}
                          className="w-full bg-white border border-[#F4F3EF] rounded-xl px-4 py-3 text-sm font-bold text-[#1A1A2E] focus:ring-2 focus:ring-blue-100 outline-none"
                        />
                      </div>

                      {/* Leaves per Month */}
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-[#9B9BAD] uppercase tracking-[2px]">Leaves per Month</label>
                        <input
                          type="number"
                          step="0.5"
                          value={leaves}
                          onChange={(e) => setLeaves(parseFloat(e.target.value) || 0)}
                          className="w-full bg-white border border-[#F4F3EF] rounded-xl px-4 py-3 text-sm font-bold text-[#1A1A2E] focus:ring-2 focus:ring-blue-100 outline-none"
                        />
                      </div>

                      {/* Status */}
                      <div className="space-y-1.5 col-span-2">
                        <label className="text-[10px] font-bold text-[#9B9BAD] uppercase tracking-[2px]">Payroll Status</label>
                        <select
                          value={payrollStatus}
                          onChange={(e) => setPayrollStatus(e.target.value)}
                          className="w-full bg-white border border-[#F4F3EF] rounded-xl px-4 py-3 text-sm font-bold text-[#1A1A2E] focus:ring-2 focus:ring-blue-100 outline-none cursor-pointer"
                        >
                          <option value="Pending">Pending (Not Processed)</option>
                          <option value="Generated">Generated (Invoice Sent)</option>
                          <option value="Paid">Paid (Completed)</option>
                        </select>
                      </div>
                    </div>

                    {/* Salary Calculation Readout & Submits */}
                    <div className="bg-white rounded-2xl p-6 border border-[#F4F3EF] space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-[10px] font-bold text-[#9B9BAD] uppercase tracking-wider">Attendance Factor</p>
                          <p className="text-xs font-bold text-[#1A1A2E]">
                            {selectedEmployeeDetail.presentDays} Present / {selectedEmployeeDetail.workingDays} Working Days
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-[10px] font-bold text-[#9B9BAD] uppercase tracking-wider">Calculated Net Salary</p>
                          <p className="text-xl font-black text-[#1B4DA0]">
                            ₹{calculatedNetSalary.toLocaleString('en-IN')}
                          </p>
                        </div>
                      </div>

                      <div className="flex gap-3">
                        <button
                          type="submit"
                          disabled={savingPayroll}
                          className="flex-1 py-3.5 bg-[#1B4DA0] text-white rounded-xl text-xs font-black uppercase tracking-widest hover:opacity-90 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                          {savingPayroll ? (
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          ) : saveSuccess ? (
                            <>
                              <FiCheckCircle size={16} /> Saved Successfully
                            </>
                          ) : (
                            <>
                              <FiCheckSquare size={16} /> Save Payslip Details
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </form>

                  {/* Quick View Buttons */}
                  <div className="pt-6 border-t border-[#F4F3EF]">
                    <button
                      onClick={() => {
                        setAttendanceMonth(payrollMonth);
                        setAttendanceYear(payrollYear);
                        setIsAttendanceModalOpen(true);
                      }}
                      className="w-full py-4 bg-[#F8FAFF] border border-blue-100 rounded-2xl text-[10px] font-black uppercase tracking-widest text-[#1B4DA0] hover:bg-blue-50 transition-all flex items-center justify-center gap-2"
                    >
                      <FiUsers size={14} /> View Attendance Calendar
                    </button>
                  </div>

                </div>
              </motion.div>
            </React.Fragment>
          )}
        </AnimatePresence>,
        document.body
      )}

      {/* Attendance Calendar Modal */}
      {isAttendanceModalOpen && createPortal(
        <div className="fixed inset-0 z-[2000000] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsAttendanceModalOpen(false)}
            className="absolute inset-0 bg-[#1A1A2E]/60 backdrop-blur-xl"
          />
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            className="relative bg-white rounded-[40px] shadow-2xl p-10 w-full max-w-[500px] border border-[#F4F3EF] flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4 text-left">
                <div className="w-12 h-12 bg-blue-50 text-[#1B4DA0] rounded-2xl flex items-center justify-center">
                  <FiUsers size={24} />
                </div>
                <div>
                  <h3 className="text-[18px] font-black text-[#1A1A2E] tracking-tight font-syne uppercase">Attendance</h3>
                  <p className="text-[10px] font-bold text-[#9B9BAD] uppercase tracking-widest">Tracking for {selectedEmployeeDetail?.name}</p>
                </div>
              </div>
              <button onClick={() => setIsAttendanceModalOpen(false)} className="w-10 h-10 rounded-full bg-[#F4F3EF] flex items-center justify-center text-[#9B9BAD] hover:bg-red-50 hover:text-red-500 transition-all">
                <FiX size={20} />
              </button>
            </div>

            {/* Filters */}
            <div className="flex gap-3 mb-8">
              <div className="flex-1 relative">
                <select
                  value={attendanceMonth}
                  onChange={(e) => setAttendanceMonth(parseInt(e.target.value))}
                  className="w-full bg-[#FAFAFA] border border-[#E5E7EB] rounded-2xl py-3 px-4 text-xs font-bold text-[#1A1A2E] appearance-none cursor-pointer outline-none focus:border-[#1B4DA0]"
                >
                  {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map((m, i) => (
                    <option key={m} value={i}>{m}</option>
                  ))}
                </select>
                <FiChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-[#9B9BAD] pointer-events-none" />
              </div>
              <div className="w-32 relative">
                <select
                  value={attendanceYear}
                  onChange={(e) => setAttendanceYear(parseInt(e.target.value))}
                  className="w-full bg-[#FAFAFA] border border-[#E5E7EB] rounded-2xl py-3 px-4 text-xs font-bold text-[#1A1A2E] appearance-none cursor-pointer outline-none focus:border-[#1B4DA0]"
                >
                  {[2024, 2025, 2026].map(y => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
                <FiChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-[#9B9BAD] pointer-events-none" />
              </div>
            </div>

            {/* Calendar Grid */}
            <div className="space-y-4">
              <div className="grid grid-cols-7 gap-2">
                {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map(d => (
                  <div key={d} className="text-[9px] font-black text-[#9B9BAD] text-center uppercase py-2 tracking-widest">{d}</div>
                ))}
              </div>
              {loadingAttendance ? (
                <div className="h-[200px] flex flex-col items-center justify-center">
                  <div className="w-8 h-8 border-4 border-[#1B4DA0] border-t-transparent rounded-full animate-spin mb-2" />
                  <p className="text-xs text-[#6B6B7E] font-medium">Loading attendance...</p>
                </div>
              ) : (
                <div className="grid grid-cols-7 gap-2">
                  {(() => {
                    const formatTime = (isoString) => {
                      if (!isoString) return '';
                      try {
                        const date = new Date(isoString);
                        return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
                      } catch {
                        return '';
                      }
                    };

                    const getActiveTime = (rec) => {
                      if (rec.workHours && rec.workHours > 0) {
                        const hours = Math.floor(rec.workHours);
                        const mins = Math.round((rec.workHours - hours) * 60);
                        return `${hours}h ${mins}m`;
                      }
                      if (rec.checkIn) {
                        try {
                          const checkInDate = new Date(rec.checkIn);
                          const checkOutDate = rec.checkOut ? new Date(rec.checkOut) : new Date();
                          const todayStr = new Date().toISOString().split('T')[0];
                          if (!rec.checkOut && rec.date !== todayStr) {
                            return '8h 00m';
                          }
                          const diffMs = checkOutDate - checkInDate;
                          if (diffMs > 0) {
                            const diffHrs = diffMs / (1000 * 60 * 60);
                            const hours = Math.floor(diffHrs);
                            const mins = Math.round((diffHrs - hours) * 60);
                            return `${hours}h ${mins}m`;
                          }
                        } catch {
                          return '8h 00m';
                        }
                      }
                      return '8h 00m';
                    };

                    const getCheckoutTime = (rec) => {
                      if (rec.checkOut) return formatTime(rec.checkOut);
                      const todayStr = new Date().toISOString().split('T')[0];
                      if (rec.date === todayStr) return 'Active';
                      if (rec.checkIn && rec.workHours && rec.workHours > 0) {
                        try {
                          const cin = new Date(rec.checkIn);
                          const cout = new Date(cin.getTime() + rec.workHours * 60 * 60 * 1000);
                          return formatTime(cout.toISOString());
                        } catch {
                          return '—';
                        }
                      }
                      return '—';
                    };

                    const daysInMonth = new Date(attendanceYear, attendanceMonth + 1, 0).getDate();
                    const firstDayOfMonth = new Date(attendanceYear, attendanceMonth, 1).getDay();
                    const days = [];

                    // Empty slots for previous month
                    for (let i = 0; i < firstDayOfMonth; i++) {
                      days.push(<div key={`empty-${i}`} className="aspect-square" />);
                    }

                    // Actual days
                    for (let d = 1; d <= daysInMonth; d++) {
                      const date = new Date(attendanceYear, attendanceMonth, d);
                      const isWeekend = date.getDay() === 0 || date.getDay() === 6;
                      
                      const dateStr = `${attendanceYear}-${String(attendanceMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
                      const record = attendanceRecords.find(r => r.date === dateStr);
                      const isPresent = record?.status === 'Present';
                      const isWFH = record?.status === 'WFH';
                      const isHalfDay = record?.status === 'Half Day';
                      const isAbsent = record?.status === 'Absent';
                      const isOnLeave = record?.status === 'On Leave';

                      let cellClass = 'bg-white text-[#9B9BAD] border-[#F4F3EF]';
                      if (isWeekend) {
                        cellClass = 'bg-[#FAFAFA] text-[#D1D1D1] border-transparent';
                      } else if (isPresent) {
                        cellClass = 'bg-[#E8F5E9] text-[#2E7D32] border-[#C8E6C9]';
                      } else if (isWFH) {
                        cellClass = 'bg-[#E0F7FA] text-[#00838F] border-[#B2EBF2]';
                      } else if (isHalfDay) {
                        cellClass = 'bg-[#FFF3E0] text-[#EF6C00] border-[#FFE0B2]';
                      } else if (isAbsent) {
                        cellClass = 'bg-[#FFEBEE] text-[#C62828] border-[#FFCDD2]';
                      } else if (isOnLeave) {
                        cellClass = 'bg-[#F3E5F5] text-[#6A1B9A] border-[#E1BEE7]';
                      }

                      const hasTimeTracking = isPresent || isWFH || isHalfDay;

                      days.push(
                        <div
                          key={d}
                          className={`relative aspect-square rounded-2xl flex flex-col items-center justify-center transition-all border ${cellClass}`}
                          title={
                            record
                              ? `Status: ${record.status}\nCheck-in: ${record.checkIn ? formatTime(record.checkIn) : '09:00 AM'}\nCheck-out: ${record.checkOut ? formatTime(record.checkOut) : hasTimeTracking ? 'Active' : '—'}\nActive Time: ${getActiveTime(record)}\nNotes: ${record.notes || 'None'}`
                              : undefined
                          }
                        >
                          <span className="text-[12px] font-black">{d}</span>
                          {hasTimeTracking && (
                            <div className="flex flex-col items-center mt-0.5 w-full px-1">
                              <span className="text-[8px] font-extrabold tracking-tighter leading-none mb-0.5">
                                {getActiveTime(record)}
                              </span>
                              <div className="flex flex-col text-[6.5px] font-semibold leading-[7.5px] tracking-tighter text-center opacity-90">
                                <span className="text-blue-600">
                                  In: {record.checkIn ? formatTime(record.checkIn) : '09:00 AM'}
                                </span>
                                <span className="text-[#C62828]">
                                  Out: {getCheckoutTime(record)}
                                </span>
                              </div>
                            </div>
                          )}
                          {isAbsent && (
                            <span className="text-[7px] font-black tracking-widest mt-1 opacity-70">
                              ABSENT
                            </span>
                          )}
                          {isOnLeave && (
                            <span className="text-[7px] font-black tracking-widest mt-1 opacity-70">
                              LEAVE
                            </span>
                          )}
                        </div>
                      );
                    }
                    return days;
                  })()}
                </div>
              )}
            </div>

            {/* Legend */}
            <div className="mt-8 pt-8 border-t border-[#F4F3EF] flex flex-col items-center gap-4">
              <div className="flex justify-center flex-wrap gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-[#4CAF50] shadow-[0_0_8px_rgba(76,175,80,0.3)]" />
                  <span className="text-[9px] font-bold text-[#6B6B7E] uppercase">Present</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-[#00BCD4] shadow-[0_0_8px_rgba(0,188,212,0.3)]" />
                  <span className="text-[9px] font-bold text-[#6B6B7E] uppercase">WFH</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-[#FF9800] shadow-[0_0_8px_rgba(255,152,0,0.3)]" />
                  <span className="text-[9px] font-bold text-[#6B6B7E] uppercase">Half Day</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-[#9C27B0] shadow-[0_0_8px_rgba(156,39,176,0.3)]" />
                  <span className="text-[9px] font-bold text-[#6B6B7E] uppercase">Leave</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-[#F44336] shadow-[0_0_8px_rgba(244,67,54,0.3)]" />
                  <span className="text-[9px] font-bold text-[#6B6B7E] uppercase">Absent</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-[#EEEEEE]" />
                  <span className="text-[9px] font-bold text-[#6B6B7E] uppercase">Weekend</span>
                </div>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 rounded-lg">
                 <FiZap className="text-blue-500" size={10} />
                 <span className="text-[9px] font-black text-blue-600 uppercase tracking-widest">Admin Note: Exact login time is hidden from employee view.</span>
              </div>
            </div>
          </motion.div>
        </div>,
        document.body
      )}

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #E5E7EB; border-radius: 20px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #D1D5DB; }
      `}</style>
    </>
  );
};

export default AccountsEmployeesPayrollTab;
