import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, ChevronDown, Calendar, Clock, Check, X, Shield, RefreshCw, Save, AlertCircle, Info, ChevronRight, User
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { saveEmployeeAttendance } from '../../../service/api';
import EmployeeDetailView from './EmployeeDetailView';

const CorrectionRegularizationTab = ({ isDarkMode = false, selectedClient }) => {
  const [activeTab, setActiveTab] = useState('Employee Wise');
  const [employeeType, setEmployeeType] = useState('Current Employees');
  const [searchTerm, setSearchTerm] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  
  // Date states
  const [dateFrom, setDateFrom] = useState('2026-06-01');
  const [dateTo, setDateTo] = useState('2026-06-13');
  const [loadedLogs, setLoadedLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedRows, setSelectedRows] = useState({});

  // Drawer and override states
  const [isDetailDrawerOpen, setIsDetailDrawerOpen] = useState(false);
  const [musterOverrides, setMusterOverrides] = useState({});
  const [shiftOverrides, setShiftOverrides] = useState({});

  // Date Wise Tab states
  const [selectedDate, setSelectedDate] = useState('2026-06-15');
  const [dateLogs, setDateLogs] = useState([]);
  const [dateSelectedRows, setDateSelectedRows] = useState({});
  const [dateFilterDept, setDateFilterDept] = useState('all');

  // Shift Override Tab states
  const [shiftDateFrom, setShiftDateFrom] = useState('2026-06-01');
  const [shiftDateTo, setShiftDateTo] = useState('2026-06-13');
  const [shiftLoadedLogs, setShiftLoadedLogs] = useState([]);
  const [shiftSelectedRows, setShiftSelectedRows] = useState({});
  const [shiftSearchTerm, setShiftSearchTerm] = useState('');
  const [shiftSelectedEmployee, setShiftSelectedEmployee] = useState(null);
  const [shiftShowDropdown, setShiftShowDropdown] = useState(false);

  // Override / Bulk Actions states
  const [bulkDateFrom, setBulkDateFrom] = useState('2026-06-01');
  const [bulkDateTo, setBulkDateTo] = useState('2026-06-15');
  const [bulkStatus, setBulkStatus] = useState('P');
  const [bulkRemarks, setBulkRemarks] = useState('');
  const [bulkShift, setBulkShift] = useState('GEN');
  const [bulkActionType, setBulkActionType] = useState('status'); 
  const [selectedBulkEmployees, setSelectedBulkEmployees] = useState({});
  const [lateGraceMinutes, setLateGraceMinutes] = useState(15);
  const [autoApproveGeofence, setAutoApproveGeofence] = useState(true);

  useEffect(() => {
    const overrides = JSON.parse(localStorage.getItem('mabicons_muster_overrides') || '{}');
    setMusterOverrides(overrides);
    const shifts = JSON.parse(localStorage.getItem('mabicons_shift_overrides') || '{}');
    setShiftOverrides(shifts);
  }, []);

  // Employee Swipes Tab states
  const [swipeDateFrom, setSwipeDateFrom] = useState('2026-06-15');
  const [swipeDateTo, setSwipeDateTo] = useState('2026-06-15');
  const [swipeDateType, setSwipeDateType] = useState('Swipe Date');
  const [swipeSearchTerm, setSwipeSearchTerm] = useState('');
  const [swipeShowDropdown, setSwipeShowDropdown] = useState(false);
  const [swipeSelectedEmployee, setSwipeSelectedEmployee] = useState(null);

  const [swipeRecords, setSwipeRecords] = useState([]);
  const [swipeSelectedRows, setSwipeSelectedRows] = useState({});
  const [swipeSelectedRecord, setSwipeSelectedRecord] = useState(null);

  // Load mock swipe records based on dates and filters
  useEffect(() => {
    if (activeTab === 'Employee Swipes') {
      setLoading(true);
      const timer = setTimeout(() => {
        const start = new Date(swipeDateFrom);
        const end = new Date(swipeDateTo);
        const records = [];
        
        const employeesList = [
          { empId: 'F0026', name: 'Anjali Saini', shift: '11:00 AM to 06:30 PM', source: 'Mobile Sign In', device: 'V2339', card: '-', location: 'Office', mobileId: '22bdbb0ab439ad3d', lat: 26.9195232, lng: 75.7972175, time: '10:50:03' },
          { empId: 'E0047', name: 'Aruna Rathore', shift: '10:30 AM to 06:30 PM', source: 'ESSL', device: 'eSSL-F12', card: '1004721', location: 'Gate 1', mobileId: '-', lat: 26.9112232, lng: 75.7865175, time: '10:28:28' },
          { empId: 'E0059', name: 'Nitin Jangid', shift: 'Male Shift', source: 'ESSL', device: 'eSSL-F12', card: '1005932', location: 'Gate 1', mobileId: '-', lat: 26.9112232, lng: 75.7865175, time: '10:23:35' },
          { empId: 'E0012', name: 'Prahlad Kumar Sharma', shift: 'Male Shift', source: 'Mobile Sign In', device: 'iPhone 13', card: '-', location: 'Field Site A', mobileId: 'a12bcde345f67890', lat: 26.858421, lng: 75.761502, time: '10:18:01' },
          { empId: 'E0004', name: 'Satya Narain Sharma', shift: 'Male Shift', source: 'Mobile Sign In', device: 'OnePlus Nord', card: '-', location: 'Office', mobileId: '9876543210abcdef', lat: 26.9195232, lng: 75.7972175, time: '10:14:45' },
          { empId: 'E0065', name: 'Pawan Kumar Dhakad', shift: 'Male Shift', source: 'Mobile Sign In', device: 'Redmi Note 11', card: '-', location: 'Office', mobileId: 'abcdef0123456789', lat: 26.9195232, lng: 75.7972175, time: '10:14:34' },
          { empId: 'E0009', name: 'Manoj Kumar', shift: 'Male Shift', source: 'ESSL', device: 'eSSL-F12', card: '1000951', location: 'Gate 2', mobileId: '-', lat: 26.9115232, lng: 75.7872175, time: '09:58:52' }
        ];

        for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
          const dateStr = d.toISOString().split('T')[0];
          const displayDateStr = d.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
          
          employeesList.forEach((emp, idx) => {
            const query = swipeSearchTerm.toLowerCase();
            const matchesSearch = !swipeSearchTerm || 
                                  emp.name.toLowerCase().includes(query) || 
                                  emp.empId.toLowerCase().includes(query) ||
                                  (swipeSelectedEmployee && emp.empId === swipeSelectedEmployee.empId);

            if (matchesSearch) {
              const statusKey = `swipe_status_${emp.empId}_${dateStr}`;
              const storedStatus = localStorage.getItem(statusKey) || 'Approved';
              records.push({
                id: `${emp.empId}_${dateStr}_${idx}`,
                empId: emp.empId,
                name: emp.name,
                shift: emp.shift,
                source: emp.source,
                device: emp.device,
                card: emp.card,
                location: emp.location,
                mobileId: emp.mobileId,
                lat: emp.lat,
                lng: emp.lng,
                time: emp.time,
                dateStr,
                displayDate: displayDateStr,
                swipeTimeDate: `${emp.time}\n${displayDateStr}`,
                receivedOn: `${emp.time}\n${displayDateStr}`,
                status: storedStatus
              });
            }
          });
        }
        
        setSwipeRecords(records);
        if (records.length > 0) {
          setSwipeSelectedRecord(records[0]);
        } else {
          setSwipeSelectedRecord(null);
        }
        setLoading(false);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [activeTab, swipeDateFrom, swipeDateTo, swipeSearchTerm, swipeSelectedEmployee]);

  const handleApproveSwipes = () => {
    const selectedKeys = Object.keys(swipeSelectedRows).filter(k => swipeSelectedRows[k]);
    let targets = [];
    if (selectedKeys.length > 0) {
      targets = selectedKeys.map(k => swipeRecords[parseInt(k)]);
    } else if (swipeSelectedRecord) {
      targets = [swipeSelectedRecord];
    }
    
    if (targets.length === 0) {
      toast.error('Please select a swipe to approve');
      return;
    }
    
    targets.forEach(rec => {
      const statusKey = `swipe_status_${rec.empId}_${rec.dateStr}`;
      localStorage.setItem(statusKey, 'Approved');
    });
    
    setSwipeRecords(prev => prev.map(rec => {
      const isTarget = targets.some(t => t.id === rec.id);
      return isTarget ? { ...rec, status: 'Approved' } : rec;
    }));
    
    if (swipeSelectedRecord && targets.some(t => t.id === swipeSelectedRecord.id)) {
      setSwipeSelectedRecord(prev => ({ ...prev, status: 'Approved' }));
    }
    
    setSwipeSelectedRows({});
    toast.success(`Successfully approved ${targets.length} swipe record(s)!`);
  };

  const handleRejectSwipes = () => {
    const selectedKeys = Object.keys(swipeSelectedRows).filter(k => swipeSelectedRows[k]);
    let targets = [];
    if (selectedKeys.length > 0) {
      targets = selectedKeys.map(k => swipeRecords[parseInt(k)]);
    } else if (swipeSelectedRecord) {
      targets = [swipeSelectedRecord];
    }
    
    if (targets.length === 0) {
      toast.error('Please select a swipe to reject');
      return;
    }
    
    targets.forEach(rec => {
      const statusKey = `swipe_status_${rec.empId}_${rec.dateStr}`;
      localStorage.setItem(statusKey, 'Rejected');
    });
    
    setSwipeRecords(prev => prev.map(rec => {
      const isTarget = targets.some(t => t.id === rec.id);
      return isTarget ? { ...rec, status: 'Rejected' } : rec;
    }));
    
    if (swipeSelectedRecord && targets.some(t => t.id === swipeSelectedRecord.id)) {
      setSwipeSelectedRecord(prev => ({ ...prev, status: 'Rejected' }));
    }
    
    setSwipeSelectedRows({});
    toast.success(`Successfully rejected ${targets.length} swipe record(s)!`);
  };

  // Auto-load logs for Employee Wise tab
  useEffect(() => {
    if (selectedEmployee) {
      handleShowLogs();
    }
  }, [selectedEmployee, dateFrom, dateTo]);

  // Auto-load logs for Shift Override tab
  useEffect(() => {
    if (shiftSelectedEmployee) {
      handleShowShiftLogs();
    }
  }, [shiftSelectedEmployee, shiftDateFrom, shiftDateTo]);

  // Auto-load logs for Date Wise tab
  useEffect(() => {
    handleShowDateLogs();
  }, [selectedDate]);

  const getStatusConfig = (status) => {
    const config = {
      present: {
        bg: 'bg-emerald-50 dark:bg-emerald-500/10',
        text: 'text-emerald-600 dark:text-emerald-400',
        dot: 'bg-emerald-500',
        label: 'Approved'
      },
      absent: {
        bg: 'bg-rose-50 dark:bg-rose-500/10',
        text: 'text-rose-600 dark:text-rose-400',
        dot: 'bg-rose-500',
        label: 'Absent'
      },
      halfday: {
        bg: 'bg-amber-50 dark:bg-amber-500/10',
        text: 'text-amber-600 dark:text-amber-400',
        dot: 'bg-amber-500',
        label: 'Half Day'
      },
      leave: {
        bg: 'bg-blue-50 dark:bg-blue-500/10',
        text: 'text-blue-600 dark:text-blue-400',
        dot: 'bg-blue-500',
        label: 'On Leave'
      },
    };
    return config[status] || config.present;
  };

  const getCellStatus = (emp, dayNum) => {
    if (!emp) return 'P';
    if (musterOverrides[emp.empId]?.[dayNum]) {
      return musterOverrides[emp.empId][dayNum];
    }
    const d = new Date(2026, 5, dayNum);
    const dayOfWeek = d.getDay();
    if (dayOfWeek === 0) return 'OFF';
    if (dayNum === 15) return 'H';

    const leaveQuota = emp.stats?.L || 0;
    if (leaveQuota > 0 && dayNum % 11 === 0) return 'L';
    if (leaveQuota > 2 && dayNum % 8 === 0) return 'L';
    
    return 'P';
  };

  const handleUpdateStatus = (empId, dayNum, newStatus) => {
    const overrides = JSON.parse(localStorage.getItem('mabicons_muster_overrides') || '{}');
    if (!overrides[empId]) {
      overrides[empId] = {};
    }
    overrides[empId][dayNum] = newStatus;
    localStorage.setItem('mabicons_muster_overrides', JSON.stringify(overrides));

    const displayDateStr = `2026-06-${String(dayNum).padStart(2, '0')}`;
    
    saveEmployeeAttendance({
      memberId: empId,
      memberName: selectedEmployee?.name || '',
      department: selectedEmployee?.department || 'HR Operations',
      date: displayDateStr,
      status: newStatus === 'P' ? 'Present' : newStatus === 'A' ? 'Absent' : newStatus === 'L' ? 'On Leave' : 'Present',
      notes: 'Manual Override via Profile Drawer'
    }).catch(err => {
      console.error('Failed to sync to database for date:', displayDateStr, err);
    });

    setLoadedLogs(prev => {
      return prev.map(log => {
        if (log.dayNum === dayNum) {
          return {
            ...log,
            session1: newStatus,
            session2: newStatus
          };
        }
        return log;
      });
    });

    setMusterOverrides(prev => ({
      ...prev,
      [empId]: {
        ...(prev[empId] || {}),
        [dayNum]: newStatus
      }
    }));

    toast.success(`June ${dayNum} status set to ${newStatus}!`);
  };

  const getEmployeeShift = (empId, dayNum) => {
    if (shiftOverrides[empId]?.[dayNum]) {
      return shiftOverrides[empId][dayNum];
    }
    return 'GEN';
  };

  const handleShowDateLogs = () => {
    setLoading(true);
    setTimeout(() => {
      const dayNum = parseInt(selectedDate.split('-')[2]) || 15;
      const displayDateStr = new Date(selectedDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
      const weekday = new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'short' });
      
      const logs = musterEmployees.map(emp => {
        const status = getCellStatus(emp, dayNum);
        const shiftCode = getEmployeeShift(emp.empId, dayNum);
        
        let firstIn = '-';
        let lastOut = '-';
        if (status === 'P') {
          firstIn = `${displayDateStr} @ 09:30:${10 + (dayNum % 20)}`;
          lastOut = `${displayDateStr} @ 18:30:${20 + (dayNum % 20)}`;
        }
        
        return {
          empId: emp.empId,
          name: emp.name,
          designation: emp.designation,
          dayNum,
          dateStr: selectedDate,
          displayDate: displayDateStr,
          weekday,
          shiftCode,
          status,
          firstIn,
          lastOut,
          overrideStatus: status,
          remarks: ''
        };
      });
      
      setDateLogs(logs);
      setLoading(false);
      setDateSelectedRows({});
    }, 400);
  };

  const handleDateOverrideChange = (index, field, value) => {
    setDateLogs(prev => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        [field]: value
      };
      return updated;
    });
  };

  const handleSaveDateOverrides = async () => {
    const keys = Object.keys(dateSelectedRows).filter(k => dateSelectedRows[k]);
    if (keys.length === 0) {
      toast.error('Please select at least one employee using the checkbox');
      return;
    }

    const overrides = JSON.parse(localStorage.getItem('mabicons_muster_overrides') || '{}');
    let successCount = 0;

    for (const key of keys) {
      const idx = parseInt(key);
      const log = dateLogs[idx];
      
      if (!overrides[log.empId]) {
        overrides[log.empId] = {};
      }
      overrides[log.empId][log.dayNum] = log.overrideStatus;

      try {
        await saveEmployeeAttendance({
          memberId: log.empId,
          memberName: log.name,
          department: 'HR Operations',
          date: log.dateStr,
          status: log.overrideStatus === 'P' ? 'Present' : log.overrideStatus === 'A' ? 'Absent' : log.overrideStatus === 'L' ? 'On Leave' : 'Present',
          notes: log.remarks || 'Date Wise Override'
        });
        successCount++;
      } catch (err) {
        console.error('Failed to save override:', err);
      }
    }

    localStorage.setItem('mabicons_muster_overrides', JSON.stringify(overrides));
    setMusterOverrides(overrides);
    toast.success(`Successfully saved overrides for ${successCount} record(s)!`);
  };

  const handleShowShiftLogs = () => {
    if (!shiftSelectedEmployee) {
      toast.error('Please select an employee first');
      return;
    }
    
    setLoading(true);
    setTimeout(() => {
      const start = new Date(shiftDateFrom);
      const end = new Date(shiftDateTo);
      const logs = [];
      
      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        const dayNum = d.getDate();
        const dateStr = d.toISOString().split('T')[0];
        const displayDate = d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
        const weekday = d.toLocaleDateString('en-US', { weekday: 'short' });
        
        const shiftCode = getEmployeeShift(shiftSelectedEmployee.empId, dayNum);
        
        logs.push({
          dayNum,
          dateStr,
          displayDate,
          weekday,
          currentShift: shiftCode,
          overrideShift: shiftCode,
          remarks: ''
        });
      }
      
      setShiftLoadedLogs(logs);
      setLoading(false);
      setShiftSelectedRows({});
    }, 400);
  };

  const handleShiftOverrideChange = (index, field, value) => {
    setShiftLoadedLogs(prev => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        [field]: value
      };
      return updated;
    });
  };

  const handleSaveShiftOverrides = () => {
    const keys = Object.keys(shiftSelectedRows).filter(k => shiftSelectedRows[k]);
    if (keys.length === 0) {
      toast.error('Please select at least one row using the checkbox');
      return;
    }

    const shifts = JSON.parse(localStorage.getItem('mabicons_shift_overrides') || '{}');
    if (!shifts[shiftSelectedEmployee.empId]) {
      shifts[shiftSelectedEmployee.empId] = {};
    }

    keys.forEach(key => {
      const idx = parseInt(key);
      const log = shiftLoadedLogs[idx];
      shifts[shiftSelectedEmployee.empId][log.dayNum] = log.overrideShift;
    });

    localStorage.setItem('mabicons_shift_overrides', JSON.stringify(shifts));
    setShiftOverrides(shifts);
    toast.success(`Successfully saved shift overrides for ${keys.length} day(s)!`);
  };

  const handleApplyBulkOverride = () => {
    const empIds = Object.keys(selectedBulkEmployees).filter(id => selectedBulkEmployees[id]);
    if (empIds.length === 0) {
      toast.error('Please select at least one employee for bulk override');
      return;
    }

    const start = new Date(bulkDateFrom);
    const end = new Date(bulkDateTo);
    
    if (bulkActionType === 'status') {
      const overrides = JSON.parse(localStorage.getItem('mabicons_muster_overrides') || '{}');
      empIds.forEach(empId => {
        if (!overrides[empId]) overrides[empId] = {};
        for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
          const dayNum = d.getDate();
          overrides[empId][dayNum] = bulkStatus;
        }
      });
      localStorage.setItem('mabicons_muster_overrides', JSON.stringify(overrides));
      setMusterOverrides(overrides);
      toast.success(`Bulk status set to ${bulkStatus} for ${empIds.length} employee(s)!`);
    } else {
      const shifts = JSON.parse(localStorage.getItem('mabicons_shift_overrides') || '{}');
      empIds.forEach(empId => {
        if (!shifts[empId]) shifts[empId] = {};
        for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
          const dayNum = d.getDate();
          shifts[empId][dayNum] = bulkShift;
        }
      });
      localStorage.setItem('mabicons_shift_overrides', JSON.stringify(shifts));
      setShiftOverrides(shifts);
      toast.success(`Bulk shift set to ${bulkShift} for ${empIds.length} employee(s)!`);
    }
  };

  const shiftFilteredEmployees = useMemo(() => {
    if (!shiftSearchTerm) return [];
    const q = shiftSearchTerm.toLowerCase();
    return musterEmployees.filter(
      emp => emp.name.toLowerCase().includes(q) || emp.empId.toLowerCase().includes(q)
    );
  }, [shiftSearchTerm]);

  const handleSelectShiftEmployee = (emp) => {
    setShiftSelectedEmployee(emp);
    setShiftSearchTerm(`${emp.name} (#${emp.empId})`);
    setShiftShowDropdown(false);
    setShiftLoadedLogs([]);
  };

  // Employee list matching musterEmployees
  const musterEmployees = [
    { empId: 'E0064', name: 'Adil Ali Khan', designation: 'VKI Team Member', stats: { P: 22, L: 2, H: 4, A: 0, OFF: 4 } },
    { empId: 'F0026', name: 'Anjali Saini', designation: 'CRM Manager, JAIPUR', stats: { P: 18, L: 4, H: 4, A: 0, OFF: 4 } },
    { empId: 'E0070', name: 'Ankita Kumawat', designation: 'CRM, JAIPUR', stats: { P: 15, L: 7, H: 4, A: 0, OFF: 4 } },
    { empId: 'E0047', name: 'Aruna Rathore', designation: 'Back Office Executive, JAIPUR', stats: { P: 24, L: 0, H: 4, A: 0, OFF: 4 } },
    { empId: 'F0021', name: 'Ashish Kumar Sankhla', designation: 'Tender Executive, JAIPUR', stats: { P: 19, L: 3, H: 4, A: 0, OFF: 4 } },
    { empId: 'E0019', name: 'Avinash Rajpoot', designation: 'Plant Manager, SEPL, JAIPUR', stats: { P: 21, L: 1, H: 4, A: 0, OFF: 4 } },
    { empId: 'E0006', name: 'Dinesh Kumar', designation: 'VKI Employee', stats: { P: 20, L: 2, H: 4, A: 0, OFF: 4 } },
    { empId: 'F0036', name: 'Durga Prasad', designation: 'VKI Technician', stats: { P: 17, L: 5, H: 4, A: 0, OFF: 4 } },
    { empId: 'E0082', name: 'Gaurav Kumawat', designation: 'VKI Operator', stats: { P: 22, L: 2, H: 4, A: 0, OFF: 4 } },
    { empId: 'EMP001', name: 'Sarah Connor', designation: 'HR Operations Executive', stats: { P: 21, L: 1, H: 4, A: 0, OFF: 4 } },
    { empId: 'EMP002', name: 'John Smith', designation: 'Operations Manager', stats: { P: 20, L: 2, H: 4, A: 0, OFF: 4 } },
    { empId: 'EMP003', name: 'Alice Johnson', designation: 'Compliance Lead', stats: { P: 18, L: 4, H: 4, A: 0, OFF: 4 } }
  ];

  // Autocomplete filter
  const filteredEmployees = useMemo(() => {
    if (!searchTerm) return [];
    const q = searchTerm.toLowerCase();
    return musterEmployees.filter(
      emp => emp.name.toLowerCase().includes(q) || emp.empId.toLowerCase().includes(q)
    );
  }, [searchTerm]);

  const handleSelectEmployee = (emp) => {
    setSelectedEmployee(emp);
    setSearchTerm(`${emp.name} (#${emp.empId})`);
    setShowDropdown(false);
    setLoadedLogs([]);
  };

  // Generate logs between dates
  const handleShowLogs = () => {
    if (!selectedEmployee) {
      toast.error('Please select an employee first');
      return;
    }
    
    setLoading(true);
    
    setTimeout(() => {
      const start = new Date(dateFrom);
      const end = new Date(dateTo);
      const logs = [];
      const overrides = JSON.parse(localStorage.getItem('mabicons_muster_overrides') || '{}');
      const empOverrides = overrides[selectedEmployee.empId] || {};

      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        const dayNum = d.getDate();
        const dateStr = d.toISOString().split('T')[0];
        const dayOfWeek = d.getDay(); // 0 = Sunday
        const weekday = d.toLocaleDateString('en-US', { weekday: 'short' });
        const displayDate = d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
        
        let defaultStatus = 'P';
        if (dayOfWeek === 0) defaultStatus = 'OFF';
        else if (dayNum === 15) defaultStatus = 'H';
        else {
          const leaveQuota = selectedEmployee.stats?.L || 0;
          if (leaveQuota > 0 && dayNum % 11 === 0) defaultStatus = 'L';
          else if (leaveQuota > 2 && dayNum % 8 === 0) defaultStatus = 'L';
        }

        // Load overrides if any
        let session1 = empOverrides[dayNum] || defaultStatus;
        let session2 = empOverrides[dayNum] || defaultStatus;

        // Mock Swipe Times
        let firstIn = '-';
        let lastOut = '-';
        if (session1 === 'P' && session2 === 'P') {
          firstIn = `${displayDate} @ 09:30:${10 + (dayNum % 20)}`;
          lastOut = `${displayDate} @ 18:30:${20 + (dayNum % 20)}`;
        } else if (session1 === 'P' && session2 === 'A') {
          firstIn = `${displayDate} @ 09:30:15`;
          lastOut = `${displayDate} @ 14:00:00`;
        } else if (session1 === 'A' && session2 === 'P') {
          firstIn = `${displayDate} @ 14:31:00`;
          lastOut = `${displayDate} @ 19:00:00`;
        }

        logs.push({
          dayNum,
          dateStr,
          displayDate,
          weekday,
          shiftCode: 'GEN',
          session1,
          session2,
          firstIn,
          lastOut,
          remarks: ''
        });
      }
      
      setLoadedLogs(logs);
      setLoading(false);
      setSelectedRows({});
    }, 400);
  };

  const handleOverrideChange = (index, field, value) => {
    setLoadedLogs(prev => {
      const updated = [...prev];
      if (field === 'status') {
        updated[index] = {
          ...updated[index],
          session1: value,
          session2: value
        };
      } else {
        updated[index] = {
          ...updated[index],
          [field]: value
        };
      }
      return updated;
    });
  };

  const handleToggleSelectRow = (index) => {
    setSelectedRows(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const handleToggleSelectAll = () => {
    const allSelected = Object.keys(selectedRows).length === loadedLogs.length;
    if (allSelected) {
      setSelectedRows({});
    } else {
      const nextSelected = {};
      loadedLogs.forEach((_, idx) => {
        nextSelected[idx] = true;
      });
      setSelectedRows(nextSelected);
    }
  };

  const handleSaveOverrides = async () => {
    const keys = Object.keys(selectedRows).filter(k => selectedRows[k]);
    if (keys.length === 0) {
      toast.error('Please select at least one row using the checkbox');
      return;
    }

    const overrides = JSON.parse(localStorage.getItem('mabicons_muster_overrides') || '{}');
    if (!overrides[selectedEmployee.empId]) {
      overrides[selectedEmployee.empId] = {};
    }

    let successCount = 0;

    for (const key of keys) {
      const idx = parseInt(key);
      const log = loadedLogs[idx];
      
      // Update local overrides
      const savedStatus = log.session1 === log.session2 ? log.session1 : log.session1;
      overrides[selectedEmployee.empId][log.dayNum] = savedStatus;

      // Call API to save to backend
      try {
        await saveEmployeeAttendance({
          memberId: selectedEmployee.empId,
          memberName: selectedEmployee.name,
          department: selectedEmployee.department || 'HR Operations',
          date: log.dateStr,
          status: savedStatus === 'P' ? 'Present' : savedStatus === 'A' ? 'Absent' : savedStatus === 'L' ? 'On Leave' : 'Present',
          notes: log.remarks || 'Manual Override via Admin Page'
        });
        successCount++;
      } catch (err) {
        console.error('Failed to sync to database for date:', log.dateStr, err);
      }
    }

    localStorage.setItem('mabicons_muster_overrides', JSON.stringify(overrides));
    toast.success(`Successfully saved overrides for ${successCount} record(s)!`);
  };

  const getStatusDisplay = (s1) => {
    switch (s1) {
      case 'P': return 'Present';
      case 'A': return 'Absent';
      case 'L': return 'On Leave';
      case 'H': return 'Holiday';
      case 'OFF': return 'Weekly Off';
      default: return 'Present';
    }
  };

  const filteredDateLogs = useMemo(() => {
    if (dateFilterDept === 'all') return dateLogs;
    return dateLogs.filter(log => {
      const design = (log.designation || '').toLowerCase();
      if (dateFilterDept === 'VKI') return design.includes('vki');
      if (dateFilterDept === 'CRM') return design.includes('crm');
      if (dateFilterDept === 'Operations') return design.includes('operations') || design.includes('manager') || design.includes('lead');
      if (dateFilterDept === 'Admin') return design.includes('back office') || design.includes('tender');
      return true;
    });
  }, [dateLogs, dateFilterDept]);

  const allDateFilteredSelected = useMemo(() => {
    if (filteredDateLogs.length === 0) return false;
    return filteredDateLogs.every((log) => {
      const origIdx = dateLogs.findIndex(l => l.empId === log.empId);
      return origIdx !== -1 && dateSelectedRows[origIdx];
    });
  }, [filteredDateLogs, dateSelectedRows, dateLogs]);

  const handleToggleDateSelectAll = () => {
    if (allDateFilteredSelected) {
      setDateSelectedRows(prev => {
        const next = { ...prev };
        filteredDateLogs.forEach(log => {
          const origIdx = dateLogs.findIndex(l => l.empId === log.empId);
          if (origIdx !== -1) {
            delete next[origIdx];
          }
        });
        return next;
      });
    } else {
      setDateSelectedRows(prev => {
        const next = { ...prev };
        filteredDateLogs.forEach(log => {
          const origIdx = dateLogs.findIndex(l => l.empId === log.empId);
          if (origIdx !== -1) {
            next[origIdx] = true;
          }
        });
        return next;
      });
    }
  };

  const allBulkEmployeesSelected = useMemo(() => {
    return musterEmployees.every(emp => !!selectedBulkEmployees[emp.empId]);
  }, [selectedBulkEmployees, musterEmployees]);

  const handleToggleAllBulkEmployees = () => {
    if (allBulkEmployeesSelected) {
      setSelectedBulkEmployees({});
    } else {
      const next = {};
      musterEmployees.forEach(emp => {
        next[emp.empId] = true;
      });
      setSelectedBulkEmployees(next);
    }
  };

  return (
    <div className={`flex flex-col gap-6 p-6 min-h-screen ${isDarkMode ? 'bg-slate-900 text-white' : 'bg-[#fcfdff] text-slate-800'}`} style={{ fontFamily: "'Calibri', sans-serif" }}>
      
      {/* Header section */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between border-b pb-5 border-[#F4F3EF] dark:border-slate-800 gap-4">
        <div className="text-left">
          <h2 className="text-3xl font-bold tracking-tight font-syne text-[#1A1A2E] dark:text-white">Regularization and Correction</h2>
           
        </div>
        
        <div className="flex items-center gap-3">
          <div className="bg-[#FAF9F6] dark:bg-slate-800 p-1.5 rounded-2xl flex items-center border border-[#F4F3EF] dark:border-slate-700">
            {['Shift Override', 'Employee Wise', 'Date Wise', 'Override', 'Employee Swipes'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-5 py-2 rounded-xl text-xs font-bold transition-all ${
                  activeTab === tab 
                    ? 'bg-white dark:bg-slate-900 text-[#0D47A1] dark:text-blue-400 shadow-sm font-black' 
                    : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </div>

      {activeTab === 'Employee Wise' && (
        <div className="space-y-6">
          {/* Filters card */}
          <div className={`p-6 rounded-[28px] border ${isDarkMode ? 'bg-slate-900/50 border-slate-800' : 'bg-white border-[#F4F3EF] shadow-sm'} space-y-6`}>
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-end">
              
              {/* Employee Type dropdown */}
              <div className="col-span-12 md:col-span-2 space-y-1.5 text-left">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block pl-1">Employee Type</label>
                <div className="relative">
                  <select
                    value={employeeType}
                    onChange={(e) => setEmployeeType(e.target.value)}
                    className={`w-full text-xs font-bold rounded-xl pl-4 pr-10 py-3 outline-none border cursor-pointer appearance-none ${
                      isDarkMode ? 'bg-slate-800 text-white border-slate-700' : 'bg-[#FAFAF8] text-[#1A1A2E] border-[#E8E7E2]'
                    }`}
                  >
                    <option>Current Employees</option>
                    <option>Resigned Employees</option>
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={14} />
                </div>
              </div>

              {/* Search Box */}
              <div className="col-span-12 md:col-span-4 space-y-1.5 text-left relative">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block pl-1">Search Employee</label>
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setShowDropdown(true);
                      if (selectedEmployee) setSelectedEmployee(null);
                    }}
                    onFocus={() => setShowDropdown(true)}
                    placeholder="Search by Emp No/ Name"
                    className={`w-full text-xs font-bold rounded-xl pl-11 pr-24 py-3 outline-none border ${
                      isDarkMode ? 'bg-slate-800 text-white border-slate-700' : 'bg-[#FAFAF8] text-[#1A1A2E] border-[#E8E7E2]'
                    }`}
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                    {selectedEmployee && (
                      <button
                        onClick={() => setIsDetailDrawerOpen(true)}
                        className="px-2.5 py-1 text-[10px] font-bold bg-[#0D47A1]/10 text-[#0D47A1] dark:bg-blue-500/10 dark:text-blue-400 hover:bg-[#0D47A1]/20 rounded-lg transition-all"
                      >
                        View Details
                      </button>
                    )}
                    {searchTerm && (
                      <button 
                        onClick={() => {
                          setSearchTerm('');
                          setSelectedEmployee(null);
                          setLoadedLogs([]);
                          setShowDropdown(false);
                        }}
                        className="text-slate-400 hover:text-red-500"
                      >
                        <X size={14} />
                      </button>
                    )}
                  </div>
                </div>

                {/* Autocomplete dropdown list */}
                <AnimatePresence>
                  {showDropdown && filteredEmployees.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className={`absolute left-0 right-0 top-full mt-2 rounded-2xl border shadow-xl z-50 max-h-60 overflow-y-auto ${
                        isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-[#E8E7E2] text-slate-800'
                      }`}
                    >
                      {filteredEmployees.map((emp) => (
                        <div
                          key={emp.empId}
                          onClick={() => handleSelectEmployee(emp)}
                          className={`flex items-center gap-3 px-4 py-3 cursor-pointer text-xs font-semibold border-b last:border-b-0 ${
                            isDarkMode ? 'hover:bg-slate-700 border-slate-700/50' : 'hover:bg-blue-50/50 border-slate-100'
                          }`}
                        >
                          <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-[#0D47A1] flex items-center justify-center font-bold">
                            {emp.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                          </div>
                          <div className="text-left">
                            <p className="font-bold text-slate-800 dark:text-white leading-tight">{emp.name}</p>
                            <p className="text-[10px] text-slate-400 font-semibold">{emp.empId} · {emp.designation}</p>
                          </div>
                        </div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Date From */}
              <div className="col-span-6 md:col-span-3 space-y-1.5 text-left">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block pl-1">Date From</label>
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  onClick={(e) => e.target.showPicker && e.target.showPicker()}
                  className={`w-full text-xs font-bold rounded-xl px-3 py-2.5 outline-none border cursor-pointer relative ${
                    isDarkMode ? 'bg-slate-800 text-white border-slate-700' : 'bg-[#FAFAF8] text-[#1A1A2E] border-[#E8E7E2]'
                  }`}
                />
              </div>

              {/* Date To */}
              <div className="col-span-6 md:col-span-3 space-y-1.5 text-left">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block pl-1">Date To</label>
                <input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  onClick={(e) => e.target.showPicker && e.target.showPicker()}
                  className={`w-full text-xs font-bold rounded-xl px-3 py-2.5 outline-none border cursor-pointer relative ${
                    isDarkMode ? 'bg-slate-800 text-white border-slate-700' : 'bg-[#FAFAF8] text-[#1A1A2E] border-[#E8E7E2]'
                  }`}
                />
              </div>

            </div>
          </div>

          {/* Logs table card */}
          {loadedLogs.length > 0 ? (
            <div className={`rounded-[28px] border overflow-hidden ${isDarkMode ? 'bg-slate-900/30 border-slate-800' : 'bg-white border-[#F4F3EF] shadow-sm'}`}>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left">
                  <thead>
                    <tr className="border-b border-[#F4F3EF] dark:border-slate-800 bg-[#FAFAF8] dark:bg-slate-900/60">
                      <th className="px-6 py-5 text-left w-12">
                        <input
                          type="checkbox"
                          checked={Object.keys(selectedRows).length === loadedLogs.length}
                          onChange={handleToggleSelectAll}
                          className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                        />
                      </th>
                      <th className="px-6 py-5 text-left text-[10px] font-black text-[#9B9BAD] uppercase tracking-widest">Date</th>
                      <th className="px-6 py-5 text-left text-[10px] font-black text-[#9B9BAD] uppercase tracking-widest">Shift Code</th>
                      <th className="px-6 py-5 text-left text-[10px] font-black text-[#9B9BAD] uppercase tracking-widest">Status</th>
                      <th className="px-6 py-5 text-left text-[10px] font-black text-[#9B9BAD] uppercase tracking-widest">Swipe (First In / Last Out)</th>
                      <th className="px-6 py-5 text-left text-[10px] font-black text-[#9B9BAD] uppercase tracking-widest w-48">Override</th>
                      <th className="px-6 py-5 text-left text-[10px] font-black text-[#9B9BAD] uppercase tracking-widest">Remarks</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loadedLogs.map((log, index) => {
                      const isRowSelected = !!selectedRows[index];
                      return (
                        <tr 
                          key={log.dateStr}
                          className={`border-b border-[#F4F3EF] dark:border-slate-800/60 hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-all ${
                            isRowSelected ? 'bg-blue-50/20 dark:bg-blue-950/10' : ''
                          }`}
                        >
                          <td className="px-6 py-4 text-left w-12">
                            <input
                              type="checkbox"
                              checked={isRowSelected}
                              onChange={() => handleToggleSelectRow(index)}
                              className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                            />
                          </td>
                          <td className="px-6 py-4 text-left text-xs font-bold text-slate-800 dark:text-white">
                            {log.displayDate}
                          </td>
                          <td className="px-6 py-4 text-left text-xs font-black text-slate-400">
                            {log.shiftCode}
                          </td>
                          <td className="px-6 py-4 text-left">
                            <span className={`px-2.5 py-1 rounded-md text-[10px] font-black border ${
                              log.session1 === 'OFF' 
                                ? 'bg-slate-100 dark:bg-slate-800 text-slate-500 border-slate-200 dark:border-slate-700'
                                : log.session1 === 'H'
                                ? 'bg-purple-100 dark:bg-purple-900/20 text-purple-700 border-purple-200'
                                : log.session1 === 'A' && log.session2 === 'A'
                                ? 'bg-red-50 dark:bg-red-950/20 text-red-600 border-red-100'
                                : log.session1 === 'A' || log.session2 === 'A'
                                ? 'bg-amber-50 dark:bg-amber-950/20 text-amber-600 border-amber-100'
                                : 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 border-emerald-100'
                            }`}>
                              {getStatusDisplay(log.session1)}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-left text-xs font-semibold text-slate-600 dark:text-slate-300">
                            <div className="space-y-1 text-left">
                              <p className="flex items-center gap-1.5 leading-none">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                                {log.firstIn}
                              </p>
                              <p className="flex items-center gap-1.5 leading-none">
                                <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                                {log.lastOut}
                              </p>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-left w-48">
                            <div className="relative w-full">
                              <select
                                value={log.session1}
                                onChange={(e) => handleOverrideChange(index, 'status', e.target.value)}
                                className={`w-full text-xs font-bold rounded-lg pl-3 pr-8 py-2.5 outline-none border appearance-none cursor-pointer ${
                                  isDarkMode ? 'bg-slate-800 text-white border-slate-700' : 'bg-white text-slate-700 border-[#E8E7E2]'
                                }`}
                              >
                                <option value="P">Present</option>
                                <option value="A">Absent</option>
                                <option value="L">Leave</option>
                                <option value="H">Holiday</option>
                                <option value="OFF">Off Day</option>
                              </select>
                              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={12} />
                            </div>
                          </td>
                          <td className="px-6 py-4 text-left">
                            <input
                              type="text"
                              value={log.remarks}
                              onChange={(e) => handleOverrideChange(index, 'remarks', e.target.value)}
                              placeholder="Remarks..."
                              className={`w-full text-xs font-semibold rounded-lg px-3 py-2 outline-none border ${
                                isDarkMode ? 'bg-slate-800 text-white border-slate-700' : 'bg-white text-slate-700 border-[#E8E7E2]'
                              }`}
                            />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Action Buttons Panel */}
              <div className="p-6 bg-[#FAFAF8] dark:bg-slate-900/60 border-t border-[#F4F3EF] dark:border-slate-800 flex items-center justify-between">
                <p className="text-xs font-bold text-slate-400">
                  {Object.keys(selectedRows).filter(k => selectedRows[k]).length} of {loadedLogs.length} rows selected
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setLoadedLogs([]);
                      setSelectedRows({});
                    }}
                    className={`px-5 py-2.5 rounded-xl text-xs font-bold border ${
                      isDarkMode ? 'border-slate-700 text-slate-300 hover:bg-slate-850' : 'border-[#E8E7E2] text-slate-500 hover:bg-slate-50'
                    } transition-all`}
                  >
                    Clear Search
                  </button>
                  <button
                    onClick={handleSaveOverrides}
                    className="px-6 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-500/10 active:scale-95 transition-all flex items-center gap-1.5"
                  >
                    <Save size={14} />
                    Save overrides
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className={`p-12 text-center rounded-[32px] border flex flex-col items-center justify-center min-h-[350px] ${
              isDarkMode ? 'bg-slate-900/20 border-slate-800' : 'bg-white border-[#F4F3EF] shadow-sm'
            }`}>
              <div className="w-16 h-16 rounded-[24px] bg-[#FAF9F6] dark:bg-slate-800 text-slate-400 flex items-center justify-center mb-6">
                <User size={24} />
              </div>
              <h4 className="text-xl font-bold text-[#1A1A2E] dark:text-white mb-2 leading-tight">Start searching to see specific employee details here</h4>
              <p className="text-xs text-[#9B9BAD] max-w-sm leading-relaxed">
                Select an employee from the dropdown list above and specify the date range to load their punch records.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Shift Override Tab */}
      {activeTab === 'Shift Override' && (
        <div className="space-y-6">
          {/* Filters card */}
          <div className={`p-6 rounded-[28px] border ${isDarkMode ? 'bg-slate-900/50 border-slate-800' : 'bg-white border-[#F4F3EF] shadow-sm'} space-y-6`}>
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-end">
              
              {/* Employee Type dropdown */}
              <div className="col-span-12 md:col-span-2 space-y-1.5 text-left">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block pl-1">Employee Type</label>
                <div className="relative">
                  <select
                    value={employeeType}
                    onChange={(e) => setEmployeeType(e.target.value)}
                    className={`w-full text-xs font-bold rounded-xl pl-4 pr-10 py-3 outline-none border cursor-pointer appearance-none ${
                      isDarkMode ? 'bg-slate-800 text-white border-slate-700' : 'bg-[#FAFAF8] text-[#1A1A2E] border-[#E8E7E2]'
                    }`}
                  >
                    <option>Current Employees</option>
                    <option>Resigned Employees</option>
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={14} />
                </div>
              </div>

              {/* Search Box */}
              <div className="col-span-12 md:col-span-4 space-y-1.5 text-left relative">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block pl-1">Search Employee</label>
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
                  <input
                    type="text"
                    value={shiftSearchTerm}
                    onChange={(e) => {
                      setShiftSearchTerm(e.target.value);
                      setShiftShowDropdown(true);
                      if (shiftSelectedEmployee) setShiftSelectedEmployee(null);
                    }}
                    onFocus={() => setShiftShowDropdown(true)}
                    placeholder="Search by Emp No/ Name"
                    className={`w-full text-xs font-bold rounded-xl pl-11 pr-24 py-3 outline-none border ${
                      isDarkMode ? 'bg-slate-800 text-white border-slate-700' : 'bg-[#FAFAF8] text-[#1A1A2E] border-[#E8E7E2]'
                    }`}
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                    {shiftSearchTerm && (
                      <button 
                        onClick={() => {
                          setShiftSearchTerm('');
                          setShiftSelectedEmployee(null);
                          setShiftLoadedLogs([]);
                          setShiftShowDropdown(false);
                        }}
                        className="text-slate-400 hover:text-red-500"
                      >
                        <X size={14} />
                      </button>
                    )}
                  </div>
                </div>

                {/* Autocomplete dropdown list */}
                <AnimatePresence>
                  {shiftShowDropdown && shiftFilteredEmployees.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className={`absolute left-0 right-0 top-full mt-2 rounded-2xl border shadow-xl z-50 max-h-60 overflow-y-auto ${
                        isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-[#E8E7E2] text-slate-800'
                      }`}
                    >
                      {shiftFilteredEmployees.map((emp) => (
                        <div
                          key={emp.empId}
                          onClick={() => handleSelectShiftEmployee(emp)}
                          className={`flex items-center gap-3 px-4 py-3 cursor-pointer text-xs font-semibold border-b last:border-b-0 ${
                            isDarkMode ? 'hover:bg-slate-700 border-slate-700/50' : 'hover:bg-blue-50/50 border-slate-100'
                          }`}
                        >
                          <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-[#0D47A1] flex items-center justify-center font-bold text-xs">
                            {emp.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                          </div>
                          <div className="text-left">
                            <p className="font-bold text-slate-800 dark:text-white leading-tight">{emp.name}</p>
                            <p className="text-[10px] text-slate-400 font-semibold">{emp.empId} · {emp.designation}</p>
                          </div>
                        </div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Date From */}
              <div className="col-span-6 md:col-span-3 space-y-1.5 text-left">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block pl-1">Date From</label>
                <input
                  type="date"
                  value={shiftDateFrom}
                  onChange={(e) => setShiftDateFrom(e.target.value)}
                  onClick={(e) => e.target.showPicker && e.target.showPicker()}
                  className={`w-full text-xs font-bold rounded-xl px-3 py-2.5 outline-none border cursor-pointer relative ${
                    isDarkMode ? 'bg-slate-800 text-white border-slate-700' : 'bg-[#FAFAF8] text-[#1A1A2E] border-[#E8E7E2]'
                  }`}
                />
              </div>

              {/* Date To */}
              <div className="col-span-6 md:col-span-3 space-y-1.5 text-left">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block pl-1">Date To</label>
                <input
                  type="date"
                  value={shiftDateTo}
                  onChange={(e) => setShiftDateTo(e.target.value)}
                  onClick={(e) => e.target.showPicker && e.target.showPicker()}
                  className={`w-full text-xs font-bold rounded-xl px-3 py-2.5 outline-none border cursor-pointer relative ${
                    isDarkMode ? 'bg-slate-800 text-white border-slate-700' : 'bg-[#FAFAF8] text-[#1A1A2E] border-[#E8E7E2]'
                  }`}
                />
              </div>

            </div>
          </div>

          {/* Logs table card */}
          {shiftLoadedLogs.length > 0 ? (
            <div className={`rounded-[28px] border overflow-hidden ${isDarkMode ? 'bg-slate-900/30 border-slate-800' : 'bg-white border-[#F4F3EF] shadow-sm'}`}>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left">
                  <thead>
                    <tr className="border-b border-[#F4F3EF] dark:border-slate-800 bg-[#FAFAF8] dark:bg-slate-900/60">
                      <th className="px-6 py-5 text-left w-12">
                        <input
                          type="checkbox"
                          checked={Object.keys(shiftSelectedRows).length === shiftLoadedLogs.length && shiftLoadedLogs.length > 0}
                          onChange={() => {
                            const allSelected = Object.keys(shiftSelectedRows).length === shiftLoadedLogs.length;
                            if (allSelected) {
                              setShiftSelectedRows({});
                            } else {
                              const nextSelected = {};
                              shiftLoadedLogs.forEach((_, idx) => {
                                nextSelected[idx] = true;
                              });
                              setShiftSelectedRows(nextSelected);
                            }
                          }}
                          className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                        />
                      </th>
                      <th className="px-6 py-5 text-left text-[10px] font-black text-[#9B9BAD] uppercase tracking-widest">Date</th>
                      <th className="px-6 py-5 text-left text-[10px] font-black text-[#9B9BAD] uppercase tracking-widest">Current Shift</th>
                      <th className="px-6 py-5 text-left text-[10px] font-black text-[#9B9BAD] uppercase tracking-widest w-64">Shift Assignment Override</th>
                      <th className="px-6 py-5 text-left text-[10px] font-black text-[#9B9BAD] uppercase tracking-widest">Remarks</th>
                    </tr>
                  </thead>
                  <tbody>
                    {shiftLoadedLogs.map((log, index) => {
                      const isRowSelected = !!shiftSelectedRows[index];
                      return (
                        <tr 
                          key={log.dateStr}
                          className={`border-b border-[#F4F3EF] dark:border-slate-800/60 hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-all ${
                            isRowSelected ? 'bg-blue-50/20 dark:bg-blue-950/10' : ''
                          }`}
                        >
                          <td className="px-6 py-4 text-left w-12">
                            <input
                              type="checkbox"
                              checked={isRowSelected}
                              onChange={() => {
                                setShiftSelectedRows(prev => ({
                                  ...prev,
                                  [index]: !prev[index]
                                }));
                              }}
                              className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                            />
                          </td>
                          <td className="px-6 py-4 text-left text-xs font-bold text-slate-800 dark:text-white">
                            {log.displayDate} ({log.weekday})
                          </td>
                          <td className="px-6 py-4 text-left text-xs font-black text-slate-400">
                            {log.currentShift}
                          </td>
                          <td className="px-6 py-4 text-left w-64">
                            <div className="relative w-full">
                              <select
                                value={log.overrideShift}
                                onChange={(e) => handleShiftOverrideChange(index, 'overrideShift', e.target.value)}
                                className={`w-full text-xs font-bold rounded-lg pl-3 pr-8 py-2.5 outline-none border appearance-none cursor-pointer ${
                                  isDarkMode ? 'bg-slate-800 text-white border-slate-700' : 'bg-white text-slate-700 border-[#E8E7E2]'
                                }`}
                              >
                                <option value="GEN">GEN (09:30 AM - 06:30 PM)</option>
                                <option value="MOR">MOR (06:00 AM - 02:00 PM)</option>
                                <option value="EVE">EVE (02:00 PM - 10:00 PM)</option>
                                <option value="NHT">NHT (10:00 PM - 06:00 AM)</option>
                              </select>
                              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={12} />
                            </div>
                          </td>
                          <td className="px-6 py-4 text-left">
                            <input
                              type="text"
                              value={log.remarks}
                              onChange={(e) => handleShiftOverrideChange(index, 'remarks', e.target.value)}
                              placeholder="Remarks..."
                              className={`w-full text-xs font-semibold rounded-lg px-3 py-2 outline-none border ${
                                isDarkMode ? 'bg-slate-800 text-white border-slate-700' : 'bg-white text-slate-700 border-[#E8E7E2]'
                              }`}
                            />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Action Buttons Panel */}
              <div className="p-6 bg-[#FAFAF8] dark:bg-slate-900/60 border-t border-[#F4F3EF] dark:border-slate-800 flex items-center justify-between">
                <p className="text-xs font-bold text-slate-400">
                  {Object.keys(shiftSelectedRows).filter(k => shiftSelectedRows[k]).length} of {shiftLoadedLogs.length} rows selected
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setShiftLoadedLogs([]);
                      setShiftSelectedRows({});
                    }}
                    className={`px-5 py-2.5 rounded-xl text-xs font-bold border ${
                      isDarkMode ? 'border-slate-700 text-slate-300 hover:bg-slate-850' : 'border-[#E8E7E2] text-slate-500 hover:bg-slate-50'
                    } transition-all`}
                  >
                    Clear Search
                  </button>
                  <button
                    onClick={handleSaveShiftOverrides}
                    className="px-6 py-2.5 rounded-xl text-xs font-bold bg-[#0D47A1] hover:bg-[#0a3a82] text-white shadow-lg shadow-blue-500/10 active:scale-95 transition-all flex items-center gap-1.5"
                  >
                    <Save size={14} />
                    Save Shift Overrides
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className={`p-12 text-center rounded-[32px] border flex flex-col items-center justify-center min-h-[350px] ${
              isDarkMode ? 'bg-slate-900/20 border-slate-800' : 'bg-white border-[#F4F3EF] shadow-sm'
            }`}>
              <div className="w-16 h-16 rounded-[24px] bg-[#FAF9F6] dark:bg-slate-800 text-slate-400 flex items-center justify-center mb-6">
                <Clock size={24} />
              </div>
              <h4 className="text-xl font-bold text-[#1A1A2E] dark:text-white mb-2 leading-tight">Start searching to see shift schedules here</h4>
              <p className="text-xs text-[#9B9BAD] max-w-sm leading-relaxed">
                Select an employee from the dropdown list above and specify the date range to load their shift records.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Date Wise Tab */}
      {activeTab === 'Date Wise' && (
        <div className="space-y-6">
          {/* Filters card */}
          <div className={`p-6 rounded-[28px] border ${isDarkMode ? 'bg-slate-900/50 border-slate-800' : 'bg-white border-[#F4F3EF] shadow-sm'} space-y-6`}>
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-end">
              
              {/* Date Selector */}
              <div className="col-span-12 md:col-span-6 space-y-1.5 text-left">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block pl-1">Target Date</label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  onClick={(e) => e.target.showPicker && e.target.showPicker()}
                  className={`w-full text-xs font-bold rounded-xl px-4 py-3 outline-none border cursor-pointer relative ${
                    isDarkMode ? 'bg-slate-800 text-white border-slate-700' : 'bg-[#FAFAF8] text-[#1A1A2E] border-[#E8E7E2]'
                  }`}
                />
              </div>

              {/* Department/Designation Filter */}
              <div className="col-span-12 md:col-span-6 space-y-1.5 text-left">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block pl-1">Department / Group</label>
                <div className="relative">
                  <select
                    value={dateFilterDept}
                    onChange={(e) => setDateFilterDept(e.target.value)}
                    className={`w-full text-xs font-bold rounded-xl pl-4 pr-10 py-3 outline-none border cursor-pointer appearance-none ${
                      isDarkMode ? 'bg-slate-800 text-white border-slate-700' : 'bg-[#FAFAF8] text-[#1A1A2E] border-[#E8E7E2]'
                    }`}
                  >
                    <option value="all">All Departments / Groups</option>
                    <option value="VKI">VKI Operations Team</option>
                    <option value="CRM">CRM & Customer Support</option>
                    <option value="Admin">Back Office & Tenders</option>
                    <option value="Operations">Management & Operations</option>
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={14} />
                </div>
              </div>

            </div>
          </div>

          {/* Logs table card */}
          {dateLogs.length > 0 ? (
            <div className={`rounded-[28px] border overflow-hidden ${isDarkMode ? 'bg-slate-900/30 border-slate-800' : 'bg-white border-[#F4F3EF] shadow-sm'}`}>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left">
                  <thead>
                    <tr className="border-b border-[#F4F3EF] dark:border-slate-800 bg-[#FAFAF8] dark:bg-slate-900/60">
                      <th className="px-6 py-5 text-left w-12">
                        <input
                          type="checkbox"
                          checked={allDateFilteredSelected}
                          onChange={handleToggleDateSelectAll}
                          className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                        />
                      </th>
                      <th className="px-6 py-5 text-left text-[10px] font-black text-[#9B9BAD] uppercase tracking-widest">Employee Name & ID</th>
                      <th className="px-6 py-5 text-left text-[10px] font-black text-[#9B9BAD] uppercase tracking-widest">Shift</th>
                      <th className="px-6 py-5 text-left text-[10px] font-black text-[#9B9BAD] uppercase tracking-widest">Swipe Times</th>
                      <th className="px-6 py-5 text-left text-[10px] font-black text-[#9B9BAD] uppercase tracking-widest">Current Status</th>
                      <th className="px-6 py-5 text-left text-[10px] font-black text-[#9B9BAD] uppercase tracking-widest w-48">Status Override</th>
                      <th className="px-6 py-5 text-left text-[10px] font-black text-[#9B9BAD] uppercase tracking-widest">Remarks</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredDateLogs.map((log) => {
                      const origIdx = dateLogs.findIndex(l => l.empId === log.empId);
                      const isRowSelected = origIdx !== -1 && !!dateSelectedRows[origIdx];
                      return (
                        <tr 
                          key={log.empId}
                          className={`border-b border-[#F4F3EF] dark:border-slate-800/60 hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-all ${
                            isRowSelected ? 'bg-blue-50/20 dark:bg-blue-950/10' : ''
                          }`}
                        >
                          <td className="px-6 py-4 text-left w-12">
                            <input
                              type="checkbox"
                              checked={isRowSelected}
                              onChange={() => {
                                if (origIdx !== -1) {
                                  setDateSelectedRows(prev => ({
                                    ...prev,
                                    [origIdx]: !prev[origIdx]
                                  }));
                                }
                              }}
                              className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                            />
                          </td>
                          <td className="px-6 py-4 text-left">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-[#0D47A1] dark:text-blue-400 flex items-center justify-center font-bold text-xs">
                                {log.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                              </div>
                              <div className="text-left">
                                <p className="font-bold text-slate-800 dark:text-white leading-tight">{log.name}</p>
                                <p className="text-[10px] text-slate-400 font-semibold">{log.empId} · {log.designation}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-left text-xs font-black text-slate-400">
                            {log.shiftCode}
                          </td>
                          <td className="px-6 py-4 text-left text-xs font-semibold text-slate-600 dark:text-slate-300">
                            <div className="space-y-1 text-left">
                              <p className="flex items-center gap-1.5 leading-none">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                                {log.firstIn}
                              </p>
                              <p className="flex items-center gap-1.5 leading-none">
                                <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                                {log.lastOut}
                              </p>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-left">
                            <span className={`px-2.5 py-1 rounded-md text-[10px] font-black border ${
                              log.status === 'OFF' 
                                ? 'bg-slate-100 dark:bg-slate-800 text-slate-500 border-slate-200 dark:border-slate-700'
                                : log.status === 'H'
                                ? 'bg-purple-100 dark:bg-purple-900/20 text-purple-700 border-purple-200'
                                : log.status === 'A'
                                ? 'bg-rose-50 dark:bg-rose-950/20 text-rose-600 border-rose-100'
                                : log.status === 'L'
                                ? 'bg-blue-50 dark:bg-blue-950/20 text-blue-600 border-blue-100'
                                : 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 border-emerald-100'
                            }`}>
                              {getStatusDisplay(log.status)}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-left w-48">
                            <div className="relative w-full">
                              <select
                                value={log.overrideStatus}
                                onChange={(e) => {
                                  if (origIdx !== -1) {
                                    handleDateOverrideChange(origIdx, 'overrideStatus', e.target.value);
                                  }
                                }}
                                className={`w-full text-xs font-bold rounded-lg pl-3 pr-8 py-2.5 outline-none border appearance-none cursor-pointer ${
                                  isDarkMode ? 'bg-slate-800 text-white border-slate-700' : 'bg-white text-slate-700 border-[#E8E7E2]'
                                }`}
                              >
                                <option value="P">Present</option>
                                <option value="A">Absent</option>
                                <option value="L">Leave</option>
                                <option value="H">Holiday</option>
                                <option value="OFF">Off Day</option>
                              </select>
                              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={12} />
                            </div>
                          </td>
                          <td className="px-6 py-4 text-left">
                            <input
                              type="text"
                              value={log.remarks}
                              onChange={(e) => {
                                if (origIdx !== -1) {
                                  handleDateOverrideChange(origIdx, 'remarks', e.target.value);
                                }
                              }}
                              placeholder="Remarks..."
                              className={`w-full text-xs font-semibold rounded-lg px-3 py-2 outline-none border ${
                                isDarkMode ? 'bg-slate-800 text-white border-slate-700' : 'bg-white text-slate-700 border-[#E8E7E2]'
                              }`}
                            />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Action Buttons Panel */}
              <div className="p-6 bg-[#FAFAF8] dark:bg-slate-900/60 border-t border-[#F4F3EF] dark:border-slate-800 flex items-center justify-between">
                <p className="text-xs font-bold text-slate-400">
                  {Object.keys(dateSelectedRows).filter(k => dateSelectedRows[k]).length} of {dateLogs.length} rows selected
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setDateLogs([]);
                      setDateSelectedRows({});
                    }}
                    className={`px-5 py-2.5 rounded-xl text-xs font-bold border ${
                      isDarkMode ? 'border-slate-700 text-slate-300 hover:bg-slate-850' : 'border-[#E8E7E2] text-[#9B9BAD] hover:bg-slate-50'
                    } transition-all`}
                  >
                    Clear Logs
                  </button>
                  <button
                    onClick={handleSaveDateOverrides}
                    className="px-6 py-2.5 rounded-xl text-xs font-bold bg-[#0D47A1] hover:bg-[#0a3a82] text-white shadow-lg shadow-blue-500/10 active:scale-95 transition-all flex items-center gap-1.5"
                  >
                    <Save size={14} />
                    Save overrides
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className={`p-12 text-center rounded-[32px] border flex flex-col items-center justify-center min-h-[350px] ${
              isDarkMode ? 'bg-slate-900/20 border-slate-800' : 'bg-white border-[#F4F3EF] shadow-sm'
            }`}>
              <div className="w-16 h-16 rounded-[24px] bg-[#FAF9F6] dark:bg-slate-800 text-slate-400 flex items-center justify-center mb-6">
                <Calendar size={24} />
              </div>
              <h4 className="text-xl font-bold text-[#1A1A2E] dark:text-white mb-2 leading-tight">Select a date to see daily logs here</h4>
              <p className="text-xs text-[#9B9BAD] max-w-sm leading-relaxed">
                Choose a target date and optional department filters to view and override values in bulk.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Override Tab */}
      {activeTab === 'Override' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Bulk Ingestion Tool - Left Column */}
          <div className={`lg:col-span-7 p-6 rounded-[28px] border ${isDarkMode ? 'bg-slate-900/50 border-slate-800' : 'bg-white border-[#F4F3EF] shadow-sm'} space-y-6`}>
            <div className="text-left border-b border-[#F4F3EF] dark:border-slate-850 pb-4">
              <h3 className="text-lg font-bold text-[#1A1A2E] dark:text-white">Bulk Ingestion & Policy Overrides</h3>
              <p className="text-xs text-slate-400 mt-1">Apply attendance status overrides or shift re-allocations to multiple employees in one batch.</p>
            </div>

            {/* Inputs grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
              {/* Date From */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block pl-1">Date From</label>
                <input
                  type="date"
                  value={bulkDateFrom}
                  onChange={(e) => setBulkDateFrom(e.target.value)}
                  onClick={(e) => e.target.showPicker && e.target.showPicker()}
                  className={`w-full text-xs font-bold rounded-xl px-3.5 py-2.5 outline-none border cursor-pointer relative ${
                    isDarkMode ? 'bg-slate-800 text-white border-slate-700' : 'bg-[#FAFAF8] text-[#1A1A2E] border-[#E8E7E2]'
                  }`}
                />
              </div>

              {/* Date To */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block pl-1">Date To</label>
                <input
                  type="date"
                  value={bulkDateTo}
                  onChange={(e) => setBulkDateTo(e.target.value)}
                  onClick={(e) => e.target.showPicker && e.target.showPicker()}
                  className={`w-full text-xs font-bold rounded-xl px-3.5 py-2.5 outline-none border cursor-pointer relative ${
                    isDarkMode ? 'bg-slate-800 text-white border-slate-700' : 'bg-[#FAFAF8] text-[#1A1A2E] border-[#E8E7E2]'
                  }`}
                />
              </div>

              {/* Override Action Type */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block pl-1">Override Type</label>
                <div className="relative">
                  <select
                    value={bulkActionType}
                    onChange={(e) => setBulkActionType(e.target.value)}
                    className={`w-full text-xs font-bold rounded-xl pl-4 pr-10 py-3 outline-none border cursor-pointer appearance-none ${
                      isDarkMode ? 'bg-slate-800 text-white border-slate-700' : 'bg-[#FAFAF8] text-[#1A1A2E] border-[#E8E7E2]'
                    }`}
                  >
                    <option value="status">Override Attendance Status</option>
                    <option value="shift">Override Shift Assignment</option>
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={14} />
                </div>
              </div>

              {/* Target Value Selector */}
              {bulkActionType === 'status' ? (
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block pl-1">Apply Status</label>
                  <div className="relative">
                    <select
                      value={bulkStatus}
                      onChange={(e) => setBulkStatus(e.target.value)}
                      className={`w-full text-xs font-bold rounded-xl pl-4 pr-10 py-3 outline-none border cursor-pointer appearance-none ${
                        isDarkMode ? 'bg-slate-800 text-white border-slate-700' : 'bg-[#FAFAF8] text-[#1A1A2E] border-[#E8E7E2]'
                      }`}
                    >
                      <option value="P">Present (Approved)</option>
                      <option value="A">Absent</option>
                      <option value="L">On Leave</option>
                      <option value="H">Holiday</option>
                      <option value="OFF">Weekly Off Day</option>
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={14} />
                  </div>
                </div>
              ) : (
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block pl-1">Apply Shift Code</label>
                  <div className="relative">
                    <select
                      value={bulkShift}
                      onChange={(e) => setBulkShift(e.target.value)}
                      className={`w-full text-xs font-bold rounded-xl pl-4 pr-10 py-3 outline-none border cursor-pointer appearance-none ${
                        isDarkMode ? 'bg-slate-800 text-white border-slate-700' : 'bg-[#FAFAF8] text-[#1A1A2E] border-[#E8E7E2]'
                      }`}
                    >
                      <option value="GEN">GEN (09:30 AM - 06:30 PM)</option>
                      <option value="MOR">MOR (06:00 AM - 02:00 PM)</option>
                      <option value="EVE">EVE (02:00 PM - 10:00 PM)</option>
                      <option value="NHT">NHT (10:00 PM - 06:00 AM)</option>
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={14} />
                  </div>
                </div>
              )}
            </div>

            {/* Employee Checklist Selection */}
            <div className="space-y-2 text-left">
              <div className="flex items-center justify-between pl-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Select Target Employees</label>
                <button
                  type="button"
                  onClick={handleToggleAllBulkEmployees}
                  className="text-[10px] font-bold text-[#0D47A1] dark:text-blue-400 hover:underline"
                >
                  {allBulkEmployeesSelected ? 'Deselect All' : 'Select All'}
                </button>
              </div>
              <div className={`border rounded-xl p-4 max-h-48 overflow-y-auto space-y-2 ${
                isDarkMode ? 'bg-slate-800/20 border-slate-700' : 'bg-[#FAFAF8] border-[#E8E7E2]'
              }`}>
                {musterEmployees.map((emp) => {
                  const isChecked = !!selectedBulkEmployees[emp.empId];
                  return (
                    <label
                      key={emp.empId}
                      className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-all hover:bg-slate-100 dark:hover:bg-slate-800/40 ${
                        isChecked ? 'bg-blue-50/30 dark:bg-blue-900/10' : ''
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {
                            setSelectedBulkEmployees(prev => ({
                              ...prev,
                              [emp.empId]: !prev[emp.empId]
                            }));
                          }}
                          className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                        />
                        <div>
                          <p className="text-xs font-bold text-slate-800 dark:text-white">{emp.name}</p>
                          <p className="text-[9px] text-slate-400 font-semibold">{emp.empId} · {emp.designation}</p>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold text-slate-400">{emp.stats?.P} Present</span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Remarks */}
            <div className="space-y-1.5 text-left">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block pl-1">Override Reason / Remarks</label>
              <input
                type="text"
                value={bulkRemarks}
                onChange={(e) => setBulkRemarks(e.target.value)}
                placeholder="Specify regulatory context (e.g. Server sync lag, biometric device offline)"
                className={`w-full text-xs font-semibold rounded-xl px-4 py-3 outline-none border ${
                  isDarkMode ? 'bg-slate-800 text-white border-slate-700' : 'bg-[#FAFAF8] text-[#1A1A2E] border-[#E8E7E2]'
                }`}
              />
            </div>

            {/* Save Actions */}
            <div className="border-t border-[#F4F3EF] dark:border-slate-800 pt-4 flex justify-between items-center">
              <p className="text-xs font-bold text-slate-400">
                {Object.keys(selectedBulkEmployees).filter(k => selectedBulkEmployees[k]).length} of {musterEmployees.length} employees selected
              </p>
              <button
                onClick={handleApplyBulkOverride}
                className="px-6 py-3 rounded-xl text-xs font-bold bg-[#0D47A1] hover:bg-[#0a3a82] text-white shadow-lg shadow-blue-500/10 active:scale-95 transition-all flex items-center gap-1.5"
              >
                <Save size={14} />
                Apply Bulk Override
              </button>
            </div>

          </div>

          {/* Biometric Integration Rules - Right Column */}
          <div className="lg:col-span-5 space-y-6 text-left">
            
            {/* Core Biometric Settings card */}
            <div className={`p-6 rounded-[28px] border ${isDarkMode ? 'bg-slate-900/50 border-slate-800' : 'bg-white border-[#F4F3EF] shadow-sm'} space-y-6`}>
              <div className="border-b border-[#F4F3EF] dark:border-slate-850 pb-4">
                <div className="flex items-center gap-2">
                  <Shield className="text-blue-500" size={20} />
                  <h3 className="text-lg font-bold text-[#1A1A2E] dark:text-white">Integration Rules</h3>
                </div>
                <p className="text-xs text-slate-400 mt-1">Configure company-wide policies for grace periods and automated biometric approvals.</p>
              </div>

              {/* Grace Period minutes */}
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block pl-1">Punch-in Late Grace Period (Minutes)</label>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    value={lateGraceMinutes}
                    onChange={(e) => setLateGraceMinutes(parseInt(e.target.value) || 0)}
                    min="0"
                    max="120"
                    className={`w-24 text-xs font-bold rounded-xl px-4 py-2.5 outline-none border ${
                      isDarkMode ? 'bg-slate-800 text-white border-slate-700' : 'bg-[#FAFAF8] text-[#1A1A2E] border-[#E8E7E2]'
                    }`}
                  />
                  <span className="text-xs text-slate-500 font-semibold">minutes from shift start time</span>
                </div>
              </div>

              {/* Auto approve toggle */}
              <div className="flex items-center justify-between p-3.5 rounded-xl border border-dashed border-[#E8E7E2] dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/30">
                <div className="max-w-[75%]">
                  <p className="text-xs font-bold text-slate-800 dark:text-white">Auto-approve Geofenced Swipes</p>
                  <p className="text-[10px] text-slate-400 font-medium mt-0.5">Allow automatic approval of punches synced from external partner apps (Emgage, Greythr, eSSL) if coordinates verify within workplace geofence.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setAutoApproveGeofence(!autoApproveGeofence)}
                  className={`w-11 h-6 rounded-full transition-all relative flex items-center p-1 ${
                    autoApproveGeofence ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-700'
                  }`}
                >
                  <span className={`w-4 h-4 rounded-full bg-white transition-all shadow ${
                    autoApproveGeofence ? 'translate-x-5' : 'translate-x-0'
                  }`} />
                </button>
              </div>

              {/* Info Box */}
              <div className="p-4 rounded-xl bg-blue-50/30 dark:bg-blue-950/10 border border-blue-100/30 dark:border-blue-900/20 text-xs text-blue-600 dark:text-blue-400 flex gap-3">
                <Info size={16} className="shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-bold">Active API Sync Adapters</p>
                  <p className="text-[10px] leading-relaxed opacity-80">Attendance database connects securely with external APIs of Emgage, Greythr, eSSL, and HROne. Status overrides set here override biometric punch inputs.</p>
                </div>
              </div>
            </div>

            {/* Geofence Status summary */}
            <div className={`p-6 rounded-[28px] border ${isDarkMode ? 'bg-slate-900/50 border-slate-800' : 'bg-white border-[#F4F3EF] shadow-sm'} space-y-4`}>
              <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest pl-1">Integration Status</h4>
              <div className="space-y-3">
                {[
                  { name: 'eSSL Biometric Server', status: 'Online', desc: 'Syncing every 10 mins' },
                  { name: 'Emgage Mobile App API', status: 'Connected', desc: 'Realtime Webhook active' },
                  { name: 'GreyHR API Adapter', status: 'Connected', desc: 'Daily poll at 23:59' },
                  { name: 'HROne API Sync', status: 'Standby', desc: 'Manual sync triggered' }
                ].map(api => (
                  <div key={api.name} className="flex items-center justify-between py-1.5 border-b last:border-0 border-slate-100 dark:border-slate-800">
                    <div>
                      <p className="text-xs font-bold text-slate-800 dark:text-white">{api.name}</p>
                      <p className="text-[10px] text-slate-400 font-semibold">{api.desc}</p>
                    </div>
                    <span className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-500">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                      {api.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>
      )}

      {activeTab === 'Employee Swipes' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start animate-in fade-in duration-300">
          
          {/* Main List Table - Left Column */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Filters panel */}
            <div className={`p-6 rounded-[28px] border ${isDarkMode ? 'bg-slate-900/50 border-slate-800' : 'bg-white border-[#F4F3EF] shadow-sm'} space-y-6`}>
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-end">
                {/* Date range pickers */}
                <div className="col-span-12 md:col-span-3 space-y-1.5 text-left">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block pl-1">Date From</label>
                  <input
                    type="date"
                    value={swipeDateFrom}
                    onChange={(e) => setSwipeDateFrom(e.target.value)}
                    onClick={(e) => e.target.showPicker && e.target.showPicker()}
                    className={`w-full text-xs font-bold rounded-xl px-3.5 py-3 outline-none border cursor-pointer relative ${
                      isDarkMode ? 'bg-slate-800 text-white border-slate-700' : 'bg-[#FAFAF8] text-[#1A1A2E] border-[#E8E7E2]'
                    }`}
                  />
                </div>

                <div className="col-span-12 md:col-span-3 space-y-1.5 text-left">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block pl-1">Date To</label>
                  <input
                    type="date"
                    value={swipeDateTo}
                    onChange={(e) => setSwipeDateTo(e.target.value)}
                    onClick={(e) => e.target.showPicker && e.target.showPicker()}
                    className={`w-full text-xs font-bold rounded-xl px-3.5 py-3 outline-none border cursor-pointer relative ${
                      isDarkMode ? 'bg-slate-800 text-white border-slate-700' : 'bg-[#FAFAF8] text-[#1A1A2E] border-[#E8E7E2]'
                    }`}
                  />
                </div>

                {/* Date Type */}
                <div className="col-span-12 md:col-span-3 space-y-1.5 text-left">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block pl-1">Date Type</label>
                  <div className="relative">
                    <select
                      value={swipeDateType}
                      onChange={(e) => setSwipeDateType(e.target.value)}
                      className={`w-full text-xs font-bold rounded-xl pl-4 pr-10 py-3.5 outline-none border cursor-pointer appearance-none ${
                        isDarkMode ? 'bg-slate-800 text-white border-slate-700' : 'bg-[#FAFAF8] text-[#1A1A2E] border-[#E8E7E2]'
                      }`}
                    >
                      <option>Swipe Date</option>
                      <option>Received Date</option>
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={14} />
                  </div>
                </div>

                {/* Search Employee input */}
                <div className="col-span-12 md:col-span-3 space-y-1.5 text-left relative z-40">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block pl-1">Search Employee</label>
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
                    <input
                      type="text"
                      value={swipeSearchTerm}
                      onChange={(e) => {
                        setSwipeSearchTerm(e.target.value);
                        setSwipeShowDropdown(true);
                      }}
                      onFocus={() => setSwipeShowDropdown(true)}
                      placeholder="Search Employee"
                      className={`w-full text-xs font-bold rounded-xl pl-11 pr-10 py-3 outline-none border ${
                        isDarkMode ? 'bg-slate-800 text-white border-slate-700' : 'bg-[#FAFAF8] text-[#1A1A2E] border-[#E8E7E2]'
                      }`}
                    />
                    {swipeSearchTerm && (
                      <button 
                        onClick={() => {
                          setSwipeSearchTerm('');
                          setSwipeSelectedEmployee(null);
                          setSwipeShowDropdown(false);
                        }}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-red-500"
                      >
                        <X size={14} />
                      </button>
                    )}
                  </div>

                  {/* Autocomplete dropdown */}
                  <AnimatePresence>
                    {swipeShowDropdown && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className={`absolute left-0 right-0 top-full mt-2 rounded-2xl border shadow-xl z-50 max-h-60 overflow-y-auto ${
                          isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-[#E8E7E2] text-slate-800'
                        }`}
                      >
                        {musterEmployees
                          .filter(emp => emp.name.toLowerCase().includes(swipeSearchTerm.toLowerCase()) || emp.empId.toLowerCase().includes(swipeSearchTerm.toLowerCase()))
                          .map((emp) => (
                            <div
                              key={emp.empId}
                              onClick={() => {
                                setSwipeSelectedEmployee(emp);
                                setSwipeSearchTerm(`${emp.name} (#${emp.empId})`);
                                setSwipeShowDropdown(false);
                              }}
                              className={`flex items-center gap-3 px-4 py-3 cursor-pointer text-xs font-semibold border-b last:border-b-0 text-left ${
                                isDarkMode ? 'hover:bg-slate-700 border-slate-700/50' : 'hover:bg-blue-50/50 border-slate-100'
                              }`}
                            >
                              <div className="w-8 h-8 rounded-lg bg-[#0D47A1]/10 text-[#0D47A1] flex items-center justify-center font-bold">
                                {emp.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                              </div>
                              <div className="text-left">
                                <p className="font-bold text-slate-800 dark:text-white leading-tight">{emp.name}</p>
                                <p className="text-[10px] text-slate-400 font-semibold">{emp.empId} · {emp.designation}</p>
                              </div>
                            </div>
                          ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>

            {/* Swipes Table card */}
            {loading ? (
              <div className={`p-12 text-center rounded-[28px] border min-h-[350px] flex items-center justify-center ${
                isDarkMode ? 'bg-slate-900/20 border-slate-800' : 'bg-white border-[#F4F3EF] shadow-sm'
              }`}>
                <div className="w-10 h-10 border-4 border-[#0D47A1] border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : swipeRecords.length > 0 ? (
              <div className={`rounded-[28px] border overflow-hidden ${isDarkMode ? 'bg-slate-900/30 border-slate-800' : 'bg-white border-[#F4F3EF] shadow-sm'}`}>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse text-left">
                    <thead>
                      <tr className="border-b border-[#F4F3EF] dark:border-slate-800 bg-[#FAFAF8] dark:bg-slate-900/60">
                        <th className="px-6 py-5 text-left w-12">
                          <input
                            type="checkbox"
                            checked={Object.keys(swipeSelectedRows).length === swipeRecords.length && swipeRecords.length > 0}
                            onChange={() => {
                              const allSelected = Object.keys(swipeSelectedRows).length === swipeRecords.length;
                              if (allSelected) {
                                setSwipeSelectedRows({});
                              } else {
                                const next = {};
                                swipeRecords.forEach((_, idx) => { next[idx] = true; });
                                setSwipeSelectedRows(next);
                              }
                            }}
                            className="w-4 h-4 rounded border-slate-300 text-[#0D47A1] focus:ring-[#0D47A1] cursor-pointer"
                          />
                        </th>
                        <th className="px-6 py-5 text-left text-[10px] font-black text-[#9B9BAD] uppercase tracking-widest">Employee Name</th>
                        <th className="px-6 py-5 text-left text-[10px] font-black text-[#9B9BAD] uppercase tracking-widest">Swipe Time & Date</th>
                        <th className="px-6 py-5 text-left text-[10px] font-black text-[#9B9BAD] uppercase tracking-widest">Shift</th>
                        <th className="px-6 py-5 text-left text-[10px] font-black text-[#9B9BAD] uppercase tracking-widest">Received On</th>
                        <th className="px-6 py-5 text-left text-[10px] font-black text-[#9B9BAD] uppercase tracking-widest">Door/Address</th>
                        <th className="px-6 py-5 text-left text-[10px] font-black text-[#9B9BAD] uppercase tracking-widest font-black">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {swipeRecords.map((rec, index) => {
                        const isRowSelected = !!swipeSelectedRows[index];
                        const isRecordActive = swipeSelectedRecord && swipeSelectedRecord.id === rec.id;
                        return (
                          <tr 
                            key={rec.id}
                            onClick={() => setSwipeSelectedRecord(rec)}
                            className={`border-b border-[#F4F3EF] dark:border-slate-800/60 hover:bg-slate-50/50 dark:hover:bg-slate-800/20 cursor-pointer transition-all ${
                              isRowSelected ? 'bg-blue-50/20 dark:bg-blue-950/10' : ''
                            } ${isRecordActive ? 'bg-blue-50/40 dark:bg-blue-900/20 border-l-4 border-l-[#0D47A1]' : ''}`}
                          >
                            <td className="px-6 py-4 text-left w-12" onClick={(e) => e.stopPropagation()}>
                              <input
                                type="checkbox"
                                checked={isRowSelected}
                                onChange={() => {
                                  setSwipeSelectedRows(prev => ({
                                    ...prev,
                                    [index]: !prev[index]
                                  }));
                                }}
                                className="w-4 h-4 rounded border-slate-300 text-[#0D47A1] focus:ring-[#0D47A1] cursor-pointer"
                              />
                            </td>
                            <td className="px-6 py-4 text-left">
                              <div className="flex flex-col text-left">
                                <span className="text-xs font-bold text-slate-850 dark:text-white leading-tight">{rec.name}</span>
                                <span className="text-[10px] text-slate-400 font-bold mt-0.5">{rec.empId}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-left text-xs font-semibold text-slate-600 dark:text-slate-300 whitespace-pre-line leading-relaxed">
                              {rec.swipeTimeDate}
                            </td>
                            <td className="px-6 py-4 text-left text-xs font-semibold text-slate-500 leading-normal">
                              {rec.shift}
                            </td>
                            <td className="px-6 py-4 text-left text-xs font-semibold text-slate-600 dark:text-slate-300 whitespace-pre-line leading-relaxed">
                              {rec.receivedOn}
                            </td>
                            <td className="px-6 py-4 text-left text-xs font-semibold text-slate-500">
                              {rec.source}
                            </td>
                            <td className="px-6 py-4 text-left">
                              <span className={`px-2.5 py-1 rounded-full text-[10px] font-black tracking-wider border uppercase ${
                                rec.status === 'Approved'
                                  ? 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 border-emerald-100 dark:border-emerald-900'
                                  : rec.status === 'Rejected'
                                  ? 'bg-rose-50 dark:bg-rose-950/20 text-rose-600 border-rose-100 dark:border-rose-900'
                                  : 'bg-amber-50 dark:bg-amber-950/20 text-amber-600 border-amber-100 dark:border-amber-900'
                              }`}>
                                {rec.status}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Footer status bar */}
                <div className="p-5 bg-[#FAFAF8] dark:bg-slate-900/60 border-t border-[#F4F3EF] dark:border-slate-800 flex items-center justify-between text-xs font-bold text-slate-400">
                  <span>
                    {Object.keys(swipeSelectedRows).filter(k => swipeSelectedRows[k]).length} of {swipeRecords.length} swipes selected
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setSwipeSelectedRows({});
                      }}
                      className="px-4 py-2 rounded-lg border border-[#E8E7E2] dark:border-slate-700 text-slate-500 hover:bg-slate-55 dark:hover:bg-slate-800 transition-all"
                    >
                      Clear Selection
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className={`p-12 text-center rounded-[28px] border flex flex-col items-center justify-center min-h-[350px] ${
                isDarkMode ? 'bg-slate-900/20 border-slate-800' : 'bg-white border-[#F4F3EF] shadow-sm'
              }`}>
                <Clock className="text-slate-400 mb-4 animate-bounce" size={24} />
                <h4 className="text-sm font-bold text-[#1A1A2E] dark:text-white mb-2 leading-tight">No swipe records found</h4>
                <p className="text-xs text-[#9B9BAD] max-w-sm leading-relaxed">
                  Try adjusting the date range or employee search filter.
                </p>
              </div>
            )}
          </div>

          {/* Sidebar Detail Card - Right Column */}
          <div className="lg:col-span-4">
            <div className={`p-6 rounded-[28px] border text-left flex flex-col justify-between min-h-[500px] ${
              isDarkMode ? 'bg-slate-900/50 border-slate-800 bg-[#1e293b]/40' : 'bg-[#FAFAF8] border-[#F4F3EF] shadow-sm'
            }`}>
              {swipeSelectedRecord ? (
                <div className="space-y-6 flex-1 flex flex-col justify-between">
                  <div className="space-y-6">
                    {/* Detail Header */}
                    <div className="flex items-center gap-3 pb-4 border-b border-[#F4F3EF] dark:border-slate-800">
                      <div className="w-12 h-12 rounded-2xl bg-[#0D47A1]/10 text-[#0D47A1] dark:text-blue-450 flex items-center justify-center font-black">
                        <User size={22} />
                      </div>
                      <div>
                        <h4 className="text-sm font-black text-slate-850 dark:text-white leading-tight">Manual Mobile sign in</h4>
                        <p className="text-[10px] text-slate-400 font-bold mt-0.5">Device Type: Mobile App</p>
                      </div>
                    </div>

                    {/* Swipe Time Block */}
                    <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-[#F4F3EF] dark:border-slate-800 text-left space-y-1">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Swipe-In Time</p>
                      <p className="text-xl font-extrabold text-[#0D47A1] dark:text-blue-400">{swipeSelectedRecord.time}</p>
                    </div>

                    {/* Swipe Details Grid */}
                    <div className="space-y-4">
                      <h5 className="text-[10px] font-black text-slate-450 uppercase tracking-widest block pl-1">Swipe Details</h5>
                      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-[#F4F3EF] dark:border-slate-800 p-4 space-y-3.5 text-xs font-semibold text-slate-700 dark:text-slate-300">
                        <div className="flex justify-between items-center py-0.5">
                          <span className="text-slate-400">Mobile Name</span>
                          <span className="text-slate-800 dark:text-white font-bold">{swipeSelectedRecord.device}</span>
                        </div>
                        <div className="flex justify-between items-center py-0.5">
                          <span className="text-slate-400">Access Card</span>
                          <span className="text-slate-800 dark:text-white font-bold">{swipeSelectedRecord.card}</span>
                        </div>
                        <div className="flex justify-between items-center py-0.5">
                          <span className="text-slate-400">Door/Address</span>
                          <span className="text-slate-800 dark:text-white font-bold">{swipeSelectedRecord.source}</span>
                        </div>
                        <div className="flex justify-between items-center py-0.5">
                          <span className="text-slate-400">Remarks</span>
                          <span className="text-slate-850 dark:text-white font-bold">{swipeSelectedRecord.location}</span>
                        </div>
                        <div className="flex justify-between items-center py-0.5">
                          <span className="text-slate-400">Mobile ID</span>
                          <span className="text-[10px] font-mono text-slate-500 max-w-[150px] truncate" title={swipeSelectedRecord.mobileId}>{swipeSelectedRecord.mobileId}</span>
                        </div>
                        <div className="flex justify-between items-center py-0.5">
                          <span className="text-slate-400">Location Details</span>
                          <span className="text-slate-855 dark:text-white font-bold">{swipeSelectedRecord.location}</span>
                        </div>
                        <div className="flex justify-between items-center py-0.5">
                          <span className="text-slate-400">Latitude</span>
                          <span className="text-slate-800 dark:text-white font-bold">{swipeSelectedRecord.lat}</span>
                        </div>
                        <div className="flex justify-between items-center py-0.5">
                          <span className="text-slate-400">Longitude</span>
                          <span className="text-slate-800 dark:text-white font-bold">{swipeSelectedRecord.lng}</span>
                        </div>
                        <div className="flex justify-between items-center pt-2 border-t border-[#F4F3EF] dark:border-slate-800">
                          <span className="text-slate-400 font-bold">Google Maps Link</span>
                          <a
                            href={`https://www.google.com/maps?q=${swipeSelectedRecord.lat},${swipeSelectedRecord.lng}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[#0D47A1] dark:text-blue-400 hover:underline font-extrabold"
                          >
                            Open Maps
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions Confirmation */}
                  <div className="pt-4 border-t border-[#F4F3EF] dark:border-slate-800 space-y-2">
                    <p className="text-[10px] font-bold text-slate-400 italic">Select individual swipes to approve/reject</p>
                    <div className="flex gap-3">
                      <button
                        onClick={handleRejectSwipes}
                        className="flex-1 py-3.5 rounded-xl border border-rose-250 dark:border-rose-900 bg-rose-50/10 hover:bg-rose-50 dark:hover:bg-rose-950/20 text-rose-600 font-bold text-xs transition-all active:scale-95"
                      >
                        Reject
                      </button>
                      <button
                        onClick={handleApproveSwipes}
                        className="flex-1 py-3.5 rounded-xl bg-blue-400 hover:bg-blue-500 text-white font-bold text-xs shadow-lg shadow-blue-400/20 transition-all active:scale-95 animate-in"
                      >
                        Approve
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
                  <User className="text-slate-350 dark:text-slate-600 mb-4 animate-pulse" size={36} />
                  <p className="text-xs text-slate-400 font-bold">No record selected</p>
                  <p className="text-[10px] text-slate-400 mt-1 max-w-[200px] leading-relaxed">Click a row on the left table to inspect details.</p>
                </div>
              )}
            </div>
          </div>

        </div>
      )}
      {/* Right Side Drawer for Employee Details */}
      {typeof document !== 'undefined' && createPortal(
        <AnimatePresence>
          {isDetailDrawerOpen && selectedEmployee && (
            <>
              <motion.div
                key="backdrop"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsDetailDrawerOpen(false)}
                className="fixed inset-0 bg-[#1A1A2E]/40 backdrop-blur-md z-[200000]"
              />
              <motion.div
                key="drawer"
                initial={{ x: '100%', opacity: 0.5 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: '100%', opacity: 0.5 }}
                transition={{ type: "spring", damping: 30, stiffness: 300 }}
                className={`fixed inset-y-0 right-0 w-full sm:w-[600px] md:w-[750px] shadow-2xl z-[200001] border-l flex flex-col overflow-hidden ${
                  isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-[#F4F3EF]'
                }`}
              >
                <EmployeeDetailView
                  employee={selectedEmployee}
                  onBack={() => setIsDetailDrawerOpen(false)}
                  isDarkMode={isDarkMode}
                  getStatusConfig={getStatusConfig}
                  getCellStatus={getCellStatus}
                  onUpdateStatus={handleUpdateStatus}
                  musterOverrides={musterOverrides}
                />
              </motion.div>
            </>
          )}
        </AnimatePresence>,
        document.body
      )}

    </div>
  );
};

export default CorrectionRegularizationTab;
