import { useState, useEffect, useRef, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { toast } from 'react-hot-toast';
import { 
  FiClock, 
  FiCalendar, 
  FiCheckCircle, 
  FiXCircle, 
  FiCoffee, 
  FiDownload, 
  FiSearch, 
  FiChevronDown, 
  FiTrendingUp, 
  FiUsers, 
  FiArrowLeft, 
  FiLogIn, 
  FiLogOut,
  FiRefreshCw, 
  FiSettings, 
  FiCpu, 
  FiDatabase, 
  FiLink, 
  FiServer,
  FiCheck,
  FiPlay,
  FiAlertTriangle,
  FiX,
  FiGrid,
  FiList,
  FiSmartphone
} from 'react-icons/fi';
import { Search, ChevronDown, ChevronRight, MapPin, Users as UsersIcon, Check, MoreVertical, Mail, Phone, Calendar, Briefcase, Award, User, Clock, Shield } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getDeptAttendance, getDepartmentMember } from '../../../service/api';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

import EmployeeDetailView, { getAttendanceCellStyle } from './EmployeeDetailView';



const AttendanceTab = ({ isDarkMode, selectedClient }) => {
  const [attendanceData, setAttendanceData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().slice(0, 10));
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedDept, setSelectedDept] = useState('all');
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [musterOverrides, setMusterOverrides] = useState({});
  const [musterSearchTerm, setMusterSearchTerm] = useState('');
  const [activeCellEdit, setActiveCellEdit] = useState(null);
  const [musterViewMode, setMusterViewMode] = useState('grid');

  // New sub-tab state: 'daily', 'muster', 'integrations'
  const [activeSubTab, setActiveSubTab] = useState('daily');

  // Integrations states
  const [integrations, setIntegrations] = useState([
    {
      id: 'essl',
      name: 'eSSL Biometrics',
      logo: 'eSSL',
      icon: FiServer,
      description: 'Sync attendance data directly from biometric fingerprint/facial recognition machines.',
      status: 'Connected',
      lastSynced: '10 mins ago',
      config: {
        serverIp: '192.168.1.150',
        port: '8080',
        apiKey: 'essl_sec_key_2026_op',
        devices: 'Device_VKI_Gate1, Device_VKI_Gate2'
      }
    },
    {
      id: 'greythr',
      name: 'greytHR',
      logo: 'greythr',
      icon: FiLink,
      description: 'Connect with greytHR to pull employee registers and sync attendance muster reports.',
      status: 'Disconnected',
      lastSynced: 'Never',
      config: {
        domain: 'shashi-engicon.greythr.com',
        clientId: 'mabicons_client_674',
        clientSecret: '••••••••••••••••••••'
      }
    },
    {
      id: 'keka',
      name: 'Keka HR Portal',
      logo: 'Keka',
      icon: FiCpu,
      description: 'Fetch real-time punch logs and regularizations using Keka Developer REST APIs.',
      status: 'Connected',
      lastSynced: '2 hours ago',
      config: {
        tenantUrl: 'https://mabicons.keka.com/api',
        authToken: 'keka_oauth_token_7718',
        clientSecretId: '••••••••••••••••••••'
      }
    },
    {
      id: 'emgage',
      name: 'Emgage HRMS',
      logo: 'Emgage',
      icon: FiSmartphone,
      description: 'Synchronize employee attendance, swipe times, and leaves from Emgage portal.',
      status: 'Connected',
      lastSynced: 'Just now',
      config: {
        orgId: 'emg_mab_901',
        apiKey: 'emgage_api_key_mab_90',
        authToken: '••••••••••••••••••••'
      }
    },
    {
      id: 'hrone',
      name: 'HROne Mobile App',
      logo: 'HROne',
      icon: FiSmartphone,
      description: 'Fetch mobile punch registers and active geofencing logs from HROne APIs.',
      status: 'Connected',
      lastSynced: '5 mins ago',
      config: {
        tenantName: 'mabicons.hrone.cloud',
        apiKey: 'hrone_api_key_secure_2026',
        portalUrl: 'https://api.hrone.cloud/v2'
      }
    }
  ]);

  const [configuringIntegration, setConfiguringIntegration] = useState(null);
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [tempConfig, setTempConfig] = useState({});
  const [syncingPlatform, setSyncingPlatform] = useState(null);
  const [syncLogs, setSyncLogs] = useState([]);
  const [showSyncTerminal, setShowSyncTerminal] = useState(false);

  // Month select state for Muster Grid
  const [selectedMonth, setSelectedMonth] = useState('June 2026');

  // Hardcoded Muster grid employee database
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
    { empId: 'EMP026', name: 'Aryan Rawat', designation: 'Intern', stats: { P: 25, L: 1, H: 4, A: 0, OFF: 4 } },
    { empId: 'EMP001', name: 'Sarah Connor', designation: 'HR Operations Executive', stats: { P: 21, L: 1, H: 4, A: 0, OFF: 4 } },
    { empId: 'EMP002', name: 'John Smith', designation: 'Operations Manager', stats: { P: 20, L: 2, H: 4, A: 0, OFF: 4 } },
    { empId: 'EMP003', name: 'Alice Johnson', designation: 'Compliance Lead', stats: { P: 18, L: 4, H: 4, A: 0, OFF: 4 } }
  ];

  const filteredMusterEmployees = useMemo(() => {
    if (!musterSearchTerm) return [];
    const query = musterSearchTerm.toLowerCase();
    return musterEmployees.filter(
      (emp) =>
        emp.name.toLowerCase().includes(query) ||
        emp.empId.toLowerCase().includes(query)
    );
  }, [musterSearchTerm]);

  // Helper to generate calendar days for June 2026 (30 days)
  const getDaysInMonth = () => {
    const days = [];
    const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    for (let i = 1; i <= 30; i++) {
      const dayIndex = (i) % 7; 
      const weekday = weekdays[dayIndex];
      days.push({ dayNum: i, weekday });
    }
    return days;
  };

  const calendarDays = getDaysInMonth();

  const getCellStatus = (emp, dayNum) => {
    if (!emp) return 'P';
    if (musterOverrides[emp.empId]?.[dayNum]) {
      return musterOverrides[emp.empId][dayNum];
    }
    if (dayNum === 7 || dayNum === 14 || dayNum === 21 || dayNum === 28) return 'OFF';
    if (dayNum === 15) return 'H';

    const leaveQuota = emp.stats?.L || 0;
    if (leaveQuota > 0 && dayNum % 11 === 0) return 'L';
    if (leaveQuota > 2 && dayNum % 8 === 0) return 'L';
    
    return 'P';
  };

  const handleUpdateStatus = (empId, dayNum, newStatus) => {
    setMusterOverrides(prev => ({
      ...prev,
      [empId]: {
        ...(prev[empId] || {}),
        [dayNum]: newStatus
      }
    }));
    toast.success(`June ${dayNum} status set to ${newStatus} for this member`, {
      style: {
        borderRadius: '12px',
        background: '#1A1A2E',
        color: '#fff',
        fontSize: '13px',
        fontWeight: 'bold',
      }
    });
  };

  const getEmpStats = (emp) => {
    let P = 0, A = 0, L = 0, H = 0, OFF = 0;
    for (let dayNum = 1; dayNum <= 30; dayNum++) {
      const status = getCellStatus(emp, dayNum);
      if (status === 'P') P++;
      else if (status === 'A') A++;
      else if (status === 'L') L++;
      else if (status === 'H') H++;
      else if (status === 'OFF') OFF++;
    }
    return { P, A, L, H, OFF };
  };

  const exportMusterToCSV = () => {
    // Generate headers
    const headers = [
      'Employee Name',
      'Employee ID',
      'Designation',
      ...Array.from({ length: 30 }, (_, i) => `Day ${i + 1}`),
      'P (Present)',
      'L (Leave)',
      'H (Holiday)',
      'A (Absent)',
      'OFF (Weekly Off)'
    ];

    // Generate rows
    const rows = musterEmployees.map(emp => {
      const dayStatuses = Array.from({ length: 30 }, (_, i) => getCellStatus(emp, i + 1));
      const empStats = getEmpStats(emp);
      
      return [
        `"${emp.name.replace(/"/g, '""')}"`,
        emp.empId,
        `"${emp.designation.replace(/"/g, '""')}"`,
        ...dayStatuses,
        empStats.P,
        empStats.L,
        empStats.H,
        empStats.A,
        empStats.OFF
      ];
    });

    const csvContent = [
      headers.join(','),
      ...rows.map(r => r.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Monthly_Muster_Report_${selectedMonth.replace(/\s+/g, '_')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success('Monthly Muster report downloaded successfully!', {
      style: {
        borderRadius: '12px',
        background: '#1A1A2E',
        color: '#fff',
        fontSize: '13px',
        fontWeight: 'bold',
      }
    });
  };

  const exportDailyToCSV = () => {
    if (attendanceData.length === 0) {
      toast.error('No attendance records available to export.');
      return;
    }

    const headers = [
      'Employee Name',
      'Employee ID',
      'Punch In Time',
      'Punch Out Time',
      'Work Hours',
      'Status'
    ];

    const rows = attendanceData.map(record => {
      return [
        `"${record.name.replace(/"/g, '""')}"`,
        record.empId,
        record.checkIn,
        record.checkOut,
        record.hours,
        record.status.toUpperCase()
      ];
    });

    const csvContent = [
      headers.join(','),
      ...rows.map(r => r.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Daily_Attendance_Report_${selectedDate}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success('Daily Attendance report downloaded successfully!', {
      style: {
        borderRadius: '12px',
        background: '#1A1A2E',
        color: '#fff',
        fontSize: '13px',
        fontWeight: 'bold',
      }
    });
  };

  // Fetch real attendance data from backend
  const fetchAttendanceData = async () => {
    setLoading(true);
    try {
      const params = {
        date: selectedDate,
        department: 'HR Operations' 
      };
      const response = await getDeptAttendance(params);
      if (response.success && response.records && response.records.length > 0) {
        const mappedData = response.records.map(record => {
          const mapStatus = (status) => {
            if (!status) return 'absent';
            const s = status.toLowerCase();
            if (s.includes('present')) return 'present';
            if (s.includes('absent')) return 'absent';
            if (s.includes('half')) return 'halfday';
            if (s.includes('leave')) return 'leave';
            if (s.includes('wfh')) return 'present';
            return 'present';
          };

          const formatTime = (timeStr) => {
            if (!timeStr || timeStr === '-') return '-';
            try {
              if (typeof timeStr === 'string' && timeStr.length === 5 && timeStr.includes(':')) return timeStr;
              const d = new Date(timeStr);
              if (isNaN(d.getTime())) return '-';
              return d.toLocaleTimeString('en-IN', { 
                hour: '2-digit', 
                minute: '2-digit', 
                hour12: true 
              });
            } catch (e) {
              return '-';
            }
          };

          return {
            id: record.id,
            memberId: record.memberId,
            empId: record.memberId?.slice(0, 6) || 'EMP' + record.id.toString().slice(0, 3),
            name: record.memberName || 'Unknown Member',
            date: record.date,
            checkIn: formatTime(record.checkIn),
            checkOut: formatTime(record.checkOut),
            status: mapStatus(record.status),
            hours: record.workHours ? `${record.workHours}h` : '0h',
            overtime: '0h',
            avatar: record.memberName ? record.memberName.split(' ').map(n => n[0]).join('') : '??',
            photo: null
          };
        });
        setAttendanceData(mappedData);
      } else {
        // Fallback: Generate mock data from musterEmployees for this date
        const mockRecords = musterEmployees.map((emp) => {
          const dayNum = parseInt(selectedDate.split('-')[2]) || 15;
          const status = getCellStatus(emp, dayNum);
          
          let checkIn = '-';
          let checkOut = '-';
          let statusMapped = 'absent';
          let hours = '0.0h';
          let punchInSource = null;
          let punchOutSource = null;
          let punchInGps = null;
          
          if (status === 'P') {
            if (emp.name === 'Aryan Rawat') {
              checkIn = '09:11 am';
              checkOut = '-';
              statusMapped = 'present';
              hours = '1.3h';
              punchInSource = 'Emgage App';
              punchInGps = '92%';
            } else {
              const nameHash = emp.name.charCodeAt(0) + emp.name.charCodeAt(emp.name.length - 1);
              const minOffset = nameHash % 25; 
              const checkInHour = 9;
              const checkInMin = minOffset;
              checkIn = `${String(checkInHour).padStart(2, '0')}:${String(checkInMin).padStart(2, '0')} am`;
              
              const checkOutHour = 6;
              const checkOutMin = 15 + (nameHash % 30);
              checkOut = `0${checkOutHour}:${String(checkOutMin).padStart(2, '0')} pm`;
              
              statusMapped = 'present';
              hours = `${(9 + (nameHash % 2) - 0.5).toFixed(1)}h`;
              
              const sourceIdx = nameHash % 4;
              if (sourceIdx === 0) {
                punchInSource = 'eSSL Biometrics';
                punchOutSource = 'eSSL Biometrics';
              } else if (sourceIdx === 1) {
                punchInSource = 'Emgage App';
                punchOutSource = 'Emgage App';
                punchInGps = `${85 + (nameHash % 15)}%`;
              } else if (sourceIdx === 2) {
                punchInSource = 'greytHR API';
                punchOutSource = 'greytHR API';
              } else {
                punchInSource = 'HROne App';
                punchOutSource = 'HROne App';
                punchInGps = `${90 + (nameHash % 9)}%`;
              }
            }
          } else if (status === 'L') {
            statusMapped = 'leave';
          } else if (status === 'H') {
            statusMapped = 'present';
            checkIn = '09:30 am';
            checkOut = '06:30 pm';
            hours = '9.0h';
            punchInSource = 'eSSL Biometrics';
            punchOutSource = 'eSSL Biometrics';
          } else if (status === 'OFF') {
            statusMapped = 'leave';
          }
          
          return {
            id: `mock-${emp.empId}`,
            memberId: emp.empId,
            empId: emp.empId,
            name: emp.name,
            date: selectedDate,
            checkIn,
            checkOut,
            status: statusMapped,
            hours,
            overtime: '0h',
            avatar: emp.name.split(' ').map(n => n[0]).join('').slice(0, 2),
            photo: null,
            punchInSource,
            punchOutSource,
            punchInGps
          };
        });
        setAttendanceData(mockRecords);
      }
    } catch (error) {
      console.error('Error fetching attendance data:', error);
      setAttendanceData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendanceData();
  }, [selectedDate, selectedClient]);

  useEffect(() => {
    if (selectedEmployee) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [selectedEmployee]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'TEXTAREA') {
        return;
      }

      if (!activeCellEdit) return;

      // Arrow key navigation inside grid or search calendar
      if (e.key === 'ArrowRight' || e.key === 'ArrowLeft' || e.key === 'ArrowUp' || e.key === 'ArrowDown') {
        e.preventDefault();
        const currentEmpIndex = filteredMusterEmployees.findIndex(emp => emp.empId === activeCellEdit.empId);
        let newEmpId = activeCellEdit.empId;
        let newDayNum = activeCellEdit.dayNum;

        if (e.key === 'ArrowRight') {
          if (newDayNum < 30) newDayNum += 1;
        } else if (e.key === 'ArrowLeft') {
          if (newDayNum > 1) newDayNum -= 1;
        } else if (e.key === 'ArrowDown') {
          if (currentEmpIndex < filteredMusterEmployees.length - 1) {
            newEmpId = filteredMusterEmployees[currentEmpIndex + 1].empId;
          }
        } else if (e.key === 'ArrowUp') {
          if (currentEmpIndex > 0) {
            newEmpId = filteredMusterEmployees[currentEmpIndex - 1].empId;
          }
        }

        setActiveCellEdit({ empId: newEmpId, dayNum: newDayNum });
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
        setActiveCellEdit(null);
        return;
      }

      if (newStatus) {
        handleUpdateStatus(activeCellEdit.empId, activeCellEdit.dayNum, newStatus);
        // Auto advance to next day
        if (activeCellEdit.dayNum < 30) {
          setActiveCellEdit({
            empId: activeCellEdit.empId,
            dayNum: activeCellEdit.dayNum + 1
          });
        } else {
          setActiveCellEdit(null);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [activeCellEdit, filteredMusterEmployees]);



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

  const getAvatarColor = (name) => {
    const colors = [
      'from-purple-500 to-indigo-600',
      'from-blue-500 to-blue-600',
      'from-green-500 to-green-600',
      'from-red-500 to-pink-600',
      'from-yellow-500 to-orange-600',
      'from-indigo-500 to-purple-600',
    ];
    return colors[name.charCodeAt(0) % colors.length];
  };

  const filteredData = attendanceData.filter(emp => {
    const matchesSearch = emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.empId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || emp.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  const handleConfigure = (platform) => {
    setConfiguringIntegration(platform);
    setTempConfig({ ...platform.config });
    setShowConfigModal(true);
  };

  const saveConfiguration = () => {
    setIntegrations(prev => prev.map(p => {
      if (p.id === configuringIntegration.id) {
        return {
          ...p,
          status: 'Connected',
          config: tempConfig
        };
      }
      return p;
    }));
    setShowConfigModal(false);
  };

  const triggerSync = (platform) => {
    setSyncingPlatform(platform);
    setShowSyncTerminal(true);
    setSyncLogs([]);

    let logMessages = [];
    if (platform.id === 'essl') {
      logMessages = [
        `Initializing biometric machine connection via TCP/IP...`,
        `Ping success on ${platform.config.serverIp || '192.168.1.150'}:${platform.config.port || '8080'}...`,
        `Verifying API Key credentials: ${platform.config.apiKey ? '••••••••' : 'default'}...`,
        `Downloading raw punch registers from ${platform.config.devices || 'Device_Gate1'}...`,
        `Parsing 142 biometric scan transactions...`,
        `Mapping fingerprint database UID hashes to employee cards...`,
        `Success: Synchronized 15 biometric check-ins successfully!`
      ];
    } else if (platform.id === 'emgage') {
      logMessages = [
        `Initializing API handshake with Emgage Mobile Gateway...`,
        `Authenticating Org ID: ${platform.config.orgId || 'emg_mab_901'}...`,
        `Establishing secure HTTPS endpoint tunnel...`,
        `Querying swipe events for date: ${selectedDate}...`,
        `Found active punch for employee Aryan Rawat (In: 09:11 AM, GPS: 92%)...`,
        `Validating geofencing boundary coordinates...`,
        `Success: Synchronized 18 Emgage Mobile App check-ins successfully!`
      ];
    } else if (platform.id === 'greythr') {
      logMessages = [
        `Connecting to greytHR API endpoint (https://api.greythr.com/v2)...`,
        `Validating OAuth token client identity: ${platform.config.clientId || 'mabicons_client'}...`,
        `Requesting employee swipe registers and attendance muster...`,
        `Processing 28 raw employee check-in registers...`,
        `Success: Synchronized 14 greytHR employee check-in registers successfully!`
      ];
    } else if (platform.id === 'keka') {
      logMessages = [
        `Connecting to Keka Developer Rest API (https://company.keka.com/api)...`,
        `Authorizing access token credentials...`,
        `Fetching real-time punch logs and regularizations...`,
        `Parsing 32 transaction payloads...`,
        `Success: Synchronized 12 Keka portal swipe records successfully!`
      ];
    } else if (platform.id === 'hrone') {
      logMessages = [
        `Connecting to HROne Portal API (https://api.hrone.cloud/v2)...`,
        `Validating API security token credentials...`,
        `Fetching geofenced swipe records and face verification logs...`,
        `Processing 45 geofence verification logs...`,
        `Success: Synchronized 20 HROne geofenced swipe records successfully!`
      ];
    } else {
      logMessages = [
        `Initializing authentication pipeline with ${platform.name} gateway...`,
        `Validating API security token credentials...`,
        `Establishing secure HTTPS tunnel...`,
        `Importing user access schedules...`,
        `Success: Synchronized 15 new attendance records successfully!`
      ];
    }

    let delay = 0;
    logMessages.forEach((msg, idx) => {
      delay += idx === 0 ? 500 : idx === logMessages.length - 1 ? 1200 : 700;
      setTimeout(() => {
        const timestamp = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        setSyncLogs(prev => [...prev, `[${timestamp}] ${msg}`]);
        
        if (idx === logMessages.length - 1) {
          setIntegrations(prev => prev.map(p => {
            if (p.id === platform.id) {
              return { ...p, status: 'Connected', lastSynced: 'Just now' };
            }
            return p;
          }));
          
          setAttendanceData(prev => {
            const extraPunchIn = [
              {
                id: 'sync-1',
                empId: 'E0064',
                name: 'Adil Ali Khan',
                date: selectedDate,
                checkIn: '09:15 am',
                checkOut: '06:00 pm',
                status: 'present',
                hours: '8.75h',
                overtime: '0h',
                avatar: 'AK',
                photo: null,
                punchInSource: platform.name,
                punchOutSource: platform.name
              },
              {
                id: 'sync-2',
                empId: 'F0026',
                name: 'Anjali Saini',
                date: selectedDate,
                checkIn: '09:30 am',
                checkOut: '-',
                status: 'present',
                hours: '6.5h',
                overtime: '0h',
                avatar: 'AS',
                photo: null,
                punchInSource: platform.name,
                punchOutSource: platform.name
              },
              {
                id: 'sync-3',
                empId: 'E0047',
                name: 'Aruna Rathore',
                date: selectedDate,
                checkIn: '09:02 am',
                checkOut: '-',
                status: 'present',
                hours: '7.2h',
                overtime: '0h',
                avatar: 'AR',
                photo: null,
                punchInSource: platform.name,
                punchOutSource: platform.name
              }
            ];
            
            const existingIds = new Set(prev.map(e => e.empId));
            const filteredExtra = extraPunchIn.filter(e => !existingIds.has(e.empId));
            return [...prev, ...filteredExtra];
          });
          
          setTimeout(() => {
            setSyncingPlatform(null);
          }, 1500);
        }
      }, delay);
    });
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div className="space-y-2">
            <div className={`h-8 w-64 rounded-lg animate-pulse ${isDarkMode ? 'bg-slate-700' : 'bg-slate-200'}`}></div>
            <div className={`h-4 w-32 rounded-lg animate-pulse ${isDarkMode ? 'bg-slate-700' : 'bg-slate-200'}`}></div>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className={`h-32 rounded-2xl animate-pulse ${isDarkMode ? 'bg-slate-800' : 'bg-slate-200'}`}></div>
          ))}
        </div>
        <div className={`h-96 rounded-2xl animate-pulse ${isDarkMode ? 'bg-slate-800' : 'bg-slate-200'}`}></div>
      </div>
    );
  }

  return (
    <div 
      className={`w-full min-h-screen ${isDarkMode ? 'bg-slate-900 text-white' : 'bg-[#fcfdff] text-slate-800'}`}
      style={{ fontFamily: "'Calibri', sans-serif" }}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key="dashboard-view"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -50, transition: { duration: 0.2 } }}
          className="space-y-8"
        >
          {/* Header section with modern Banner */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-8"
          >
            <div className="flex items-center gap-4">
              <div className="text-left">
                <h2 className={`text-3xl font-bold tracking-tight mb-1 font-syne ${isDarkMode ? 'text-white' : 'text-[#1A1A2E]'}`}>
                  Monthly Attendance 
                </h2>
                <div className="flex items-center gap-3 mt-1 text-left">
                  <p className={`text-sm font-medium flex items-center gap-1.5 ${isDarkMode ? 'text-slate-500' : 'text-[#9B9BAD]'}`} style={{ fontFamily: "'Calibri', sans-serif" }}>
                    <FiUsers className="w-4 h-4" />
                    {selectedClient ? `Client: ${selectedClient}` : 'All Employees'}
                  </p>
                  <span className={`${isDarkMode ? 'text-slate-700' : 'text-[#F4F3EF]'}`}>|</span>
                  <p className={`text-sm font-medium flex items-center gap-1.5 ${isDarkMode ? 'text-slate-500' : 'text-[#9B9BAD]'}`} style={{ fontFamily: "'Calibri', sans-serif" }}>
                    <FiCalendar className="w-4 h-4" />
                    {formatDate(selectedDate)}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {activeSubTab === 'daily' && (
                <>
                  <div className="relative group flex items-center">
                    <FiCalendar className="absolute right-5 w-4 h-4 text-white pointer-events-none z-10" />
                    <input
                      type="date"
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      onClick={(e) => e.target.showPicker && e.target.showPicker()}
                      className="flex items-center gap-2 pl-6 pr-12 py-3 rounded-xl text-sm font-medium cursor-pointer transition-all shadow-lg active:scale-95 bg-[#0D47A1] text-white border-transparent hover:bg-[#0a3a82] shadow-blue-500/20 appearance-none relative"
                      style={{ 
                        fontFamily: "'Calibri', sans-serif",
                        colorScheme: 'dark'
                      }}
                    />
                  </div>
                  <button 
                    onClick={exportDailyToCSV}
                    className="flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold border border-emerald-500/30 bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 transition-all animate-fade-in"
                  >
                    <FiDownload className="w-4 h-4" />
                    Export Excel
                  </button>
                </>
              )}
              {activeSubTab === 'muster' && (
                <button 
                  onClick={exportMusterToCSV}
                  className="flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold border border-emerald-500/30 bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 transition-all animate-fade-in"
                >
                  <FiDownload className="w-4 h-4" />
                  Export Excel
                </button>
              )}
            </div>
          </motion.div>

          {/* Sub Navigation Bar (Daily Dashboard / Monthly Muster / Integrations) */}
          <div className="flex border-b border-[#F4F3EF] dark:border-slate-800 gap-8 mb-6">
            <button 
              onClick={() => setActiveSubTab('daily')}
              className={`pb-4 text-[13px] font-bold uppercase tracking-wider transition-all border-b-2 ${
                activeSubTab === 'daily' 
                  ? 'border-[#0D47A1] text-[#0D47A1]' 
                  : 'border-transparent text-[#9B9BAD] hover:text-[#1A1A2E]'
              }`}
            >
              Daily Dashboard
            </button>
            <button 
              onClick={() => setActiveSubTab('muster')}
              className={`pb-4 text-[13px] font-bold uppercase tracking-wider transition-all border-b-2 ${
                activeSubTab === 'muster' 
                  ? 'border-[#0D47A1] text-[#0D47A1]' 
                  : 'border-transparent text-[#9B9BAD] hover:text-[#1A1A2E]'
              }`}
            >
              Monthly Muster Report
            </button>
            <button 
              onClick={() => setActiveSubTab('integrations')}
              className={`pb-4 text-[13px] font-bold uppercase tracking-wider transition-all border-b-2 ${
                activeSubTab === 'integrations' 
                  ? 'border-[#0D47A1] text-[#0D47A1]' 
                  : 'border-transparent text-[#9B9BAD] hover:text-[#1A1A2E]'
              }`}
            >
              Biometric & API Integrations
            </button>
          </div>

          {/* DAILY DASHBOARD TAB */}
          {activeSubTab === 'daily' && (
            <>


              {/* Search & Filters */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`rounded-[24px] p-2 border flex items-center gap-3 flex-wrap ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-[#F4F3EF] shadow-sm'}`}
              >
                {/* Search Bar */}
                <div className="relative flex-1 group min-w-[200px]">
                  <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-[#9B9BAD] transition-colors" size={18} />
                  <input
                    type="text"
                    placeholder="Search by name or Employee ID..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className={`w-full border-none rounded-2xl py-3 pl-14 pr-5 text-sm font-medium outline-none transition-all placeholder:text-[#9B9BAD] ${isDarkMode ? 'bg-slate-800 text-white focus:ring-2 focus:ring-slate-700' : 'bg-[#F4F3EF] text-[#1A1A2E] focus:ring-2 focus:ring-[#F4F3EF]'}`}
                  />
                </div>

                {/* Status Filter */}
                <div className="relative group">
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className={`text-[11px] font-black uppercase tracking-widest rounded-xl pl-4 pr-10 py-2.5 outline-none border-0 cursor-pointer appearance-none min-w-[150px] transition-all hover:bg-[#EEF2FB] ${isDarkMode ? 'bg-slate-800 text-white' : 'bg-[#F4F3EF] text-[#1A1A2E]'}`}
                  >
                    <option value="all">All Status</option>
                    <option value="present">Present</option>
                    <option value="absent">Absent</option>
                    <option value="halfday">Half Day</option>
                    <option value="leave">On Leave</option>
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-[#1B4DA0] opacity-50 group-hover:opacity-100 transition-all pointer-events-none" size={14} />
                </div>

                {/* Department Filter */}
                <div className="relative group">
                  <select
                    value={selectedDept}
                    onChange={(e) => setSelectedDept(e.target.value)}
                    className={`text-[11px] font-black uppercase tracking-widest rounded-xl pl-4 pr-10 py-2.5 outline-none border-0 cursor-pointer appearance-none min-w-[150px] transition-all hover:bg-[#EEF2FB] ${isDarkMode ? 'bg-slate-800 text-white' : 'bg-[#F4F3EF] text-[#1A1A2E]'}`}
                  >
                    <option value="all">Departments</option>
                    <option value="hr">HR Dept</option>
                    <option value="it">IT Team</option>
                    <option value="sales">Sales Hub</option>
                    <option value="ops">Operations</option>
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-[#1B4DA0] opacity-50 group-hover:opacity-100 transition-all pointer-events-none" size={14} />
                </div>
              </motion.div>

              {/* Attendance Table */}
              <div className={`rounded-[32px] border overflow-x-auto transition-all ${isDarkMode ? 'bg-slate-900/40 border-slate-800' : 'bg-white border-[#F4F3EF] shadow-sm'} custom-scrollbar`}>
                <div className="min-w-[900px] w-full">
                  <div className={`grid grid-cols-[2.8fr_1.5fr_1.5fr_1.8fr_0.4fr] gap-4 px-8 py-4 border-b ${isDarkMode ? 'border-slate-800 bg-transparent' : 'border-[#F4F3EF] bg-transparent'}`}>
                    {["Employee", "Punch In", "Punch Out", "Status", ""].map((h, i) => (
                      <div key={i} className="text-[11px] font-bold text-[#94a3b8] uppercase tracking-widest text-left flex items-start justify-start">
                        {h}
                      </div>
                    ))}
                  </div>

                  <div className="flex flex-col">
                    <AnimatePresence mode="popLayout">
                      {filteredData.length === 0 ? (
                        <div className="py-24 text-center">
                          <p className="text-[#9B9BAD] text-sm font-bold uppercase tracking-widest">No matching records found</p>
                        </div>
                      ) : (
                        filteredData.map((emp, index) => {
                          const statusConfig = getStatusConfig(emp.status);
                          return (
                            <motion.div
                              key={emp.id}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              exit={{ opacity: 0, scale: 0.95 }}
                              transition={{ delay: index * 0.05 }}
                              onClick={() => setSelectedEmployee(emp)}
                              className={`grid grid-cols-[2.8fr_1.5fr_1.5fr_1.8fr_0.4fr] gap-4 items-center px-8 py-3 border-b last:border-0 cursor-pointer transition-all group relative ${
                                isDarkMode ? 'border-slate-800 hover:bg-slate-800/40' : 'border-[#F4F3EF] hover:bg-[#F8FAFF]'
                              }`}
                            >
                              <div className="flex items-center gap-4 min-w-0 py-1">
                                <div 
                                  className="w-[42px] h-[42px] rounded-[14px] flex items-center justify-center font-bold shadow-sm transition-transform group-hover:scale-110 bg-[#F0F7FF]"
                                  style={{ 
                                    color: '#1B4DA0',
                                    fontSize: '13px',
                                    fontFamily: "'Calibri', sans-serif"
                                  }}
                                >
                                  {emp.name.charAt(0).toUpperCase()}
                                </div>
                                <div className="flex flex-col min-w-0">
                                  <p className={`text-[16px] font-bold truncate transition-colors ${isDarkMode ? 'text-white group-hover:text-blue-400' : 'text-[#1A1A2E] group-hover:text-[#0D47A1]'}`}>
                                    {emp.name}
                                  </p>
                                  <p className="text-[10px] font-bold text-[#9B9BAD] uppercase tracking-wider mt-0.5 truncate">{emp.empId}</p>
                                </div>
                              </div>

                               <div className="flex items-center gap-2 justify-start text-left w-full flex-wrap">
                                 <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></span>
                                 <span className={`text-[15px] font-bold ${isDarkMode ? 'text-slate-300' : 'text-[#1A1A2E]'}`}>
                                   {emp.checkIn === '-' ? 'No Punch' : emp.checkIn}
                                 </span>
                                 {emp.checkIn !== '-' && emp.punchInSource && (
                                   <span 
                                     className={`text-[8.5px] px-1.5 py-0.5 rounded-md font-bold border leading-none tracking-wider ${
                                       emp.punchInSource.includes('Emgage') 
                                         ? 'bg-blue-50 text-blue-600 border-blue-100 dark:bg-blue-950/20 dark:text-blue-400 dark:border-transparent' 
                                         : emp.punchInSource.includes('eSSL')
                                         ? 'bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-transparent'
                                         : emp.punchInSource.includes('greytHR')
                                         ? 'bg-purple-50 text-purple-600 border-purple-100 dark:bg-purple-950/20 dark:text-purple-400 dark:border-transparent'
                                         : 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-transparent'
                                     }`}
                                     title={emp.punchInGps ? `GPS accuracy: ${emp.punchInGps}` : ''}
                                   >
                                     {emp.punchInSource.replace(' API', '').replace(' App', '').replace(' Biometrics', '')}
                                     {emp.punchInGps && ` (${emp.punchInGps})`}
                                   </span>
                                 )}
                               </div>

                               <div className="flex items-center gap-2 justify-start text-left w-full flex-wrap">
                                 <span className={`w-1.5 h-1.5 rounded-full ${emp.checkOut === '-' ? 'bg-slate-300' : 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]'}`}></span>
                                 <span className={`text-[15px] font-bold ${isDarkMode ? 'text-slate-300' : 'text-[#1A1A2E]'}`}>
                                   {emp.checkOut === '-' ? 'No Punch' : emp.checkOut}
                                 </span>
                                 {emp.checkOut !== '-' && emp.punchOutSource && (
                                   <span 
                                     className={`text-[8.5px] px-1.5 py-0.5 rounded-md font-bold border leading-none tracking-wider ${
                                       emp.punchOutSource.includes('Emgage') 
                                         ? 'bg-blue-50 text-blue-600 border-blue-100 dark:bg-blue-950/20 dark:text-blue-400 dark:border-transparent' 
                                         : emp.punchOutSource.includes('eSSL')
                                         ? 'bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-transparent'
                                         : emp.punchOutSource.includes('greytHR')
                                         ? 'bg-purple-50 text-purple-600 border-purple-100 dark:bg-purple-950/20 dark:text-purple-400 dark:border-transparent'
                                         : 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-transparent'
                                     }`}
                                   >
                                     {emp.punchOutSource.replace(' API', '').replace(' App', '').replace(' Biometrics', '')}
                                   </span>
                                 )}
                               </div>

                               <div className="flex items-center justify-start text-left w-full">
                                 <span className={`inline-flex items-center justify-center px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest w-fit border shadow-sm ${statusConfig.bg} ${statusConfig.text} ${isDarkMode ? 'border-transparent' : 'border-current/10'}`}>
                                  <span className={`w-1.5 h-1.5 rounded-full mr-2 ${statusConfig.dot}`}></span>
                                  {statusConfig.label}
                                </span>
                               </div>

                              <div className="flex justify-end pr-2">
                                <ChevronRight size={20} className={`transition-all ${isDarkMode ? 'text-slate-700 group-hover:text-blue-400' : 'text-[#C5C5D2] group-hover:text-[#0D47A1]'}`} />
                              </div>
                            </motion.div>
                          );
                        })
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* MONTHLY MUSTER REPORT TAB */}
          {activeSubTab === 'muster' && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className={`rounded-[32px] border overflow-hidden p-6 ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-[#F4F3EF] shadow-sm'}`}
            >
              {/* Muster Filters */}
              <div className="flex items-center justify-between flex-wrap gap-4 mb-6 border-b border-[#F4F3EF] pb-6">
                <div className="flex items-center gap-4 flex-wrap">
                  <div className="relative group">
                    <select
                      value={selectedMonth}
                      onChange={(e) => setSelectedMonth(e.target.value)}
                      className={`text-[12px] font-bold rounded-xl pl-4 pr-10 py-2.5 outline-none border cursor-pointer appearance-none min-w-[160px] ${isDarkMode ? 'bg-slate-800 text-white border-slate-700' : 'bg-[#FAFAF8] text-[#1A1A2E] border-[#E8E7E2]'}`}
                    >
                      <option value="June 2026">Month: June 2026</option>
                      <option value="May 2026">Month: May 2026</option>
                      <option value="April 2026">Month: April 2026</option>
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={14} />
                  </div>

                  <div className="relative group">
                    <select
                      className={`text-[12px] font-bold rounded-xl pl-4 pr-10 py-2.5 outline-none border cursor-pointer appearance-none min-w-[200px] ${isDarkMode ? 'bg-slate-800 text-white border-slate-700' : 'bg-[#FAFAF8] text-[#1A1A2E] border-[#E8E7E2]'}`}
                    >
                      <option>Default Attendance Cycle</option>
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={14} />
                  </div>

                  <div className="relative group">
                    <select
                      value={musterSearchTerm === '' ? 'All' : musterSearchTerm}
                      onChange={(e) => {
                        const val = e.target.value;
                        setMusterSearchTerm(val === 'All' ? '' : val);
                      }}
                      className={`text-[12px] font-bold rounded-xl pl-4 pr-10 py-2.5 outline-none border cursor-pointer appearance-none min-w-[140px] ${isDarkMode ? 'bg-slate-800 text-white border-slate-700' : 'bg-[#FAFAF8] text-[#1A1A2E] border-[#E8E7E2]'}`}
                    >
                      <option value="All">Employee: All</option>
                      {musterEmployees.map(emp => (
                        <option key={emp.empId} value={emp.name}>{emp.name}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={14} />
                  </div>
                </div>

                {/* Search & Calendar View next to it */}
                <div className="flex items-center gap-3 w-full max-w-[500px] shrink-0">
                  <div className="relative group flex-1">
                    <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      value={musterSearchTerm}
                      onChange={(e) => setMusterSearchTerm(e.target.value)}
                      placeholder="Search employee muster..."
                      className={`w-full text-xs font-semibold rounded-xl pl-10 pr-4 py-2.5 outline-none border ${isDarkMode ? 'bg-slate-800 text-white border-slate-700' : 'bg-[#FAFAF8] text-[#1A1A2E] border-[#E8E7E2]'}`}
                    />
                  </div>

                  {/* Calendar view month selector button next to search */}
                  <div className="relative group flex items-center shrink-0">
                    <input
                      type="month"
                      value="2026-06"
                      onChange={(e) => {
                        const val = e.target.value;
                        toast.success(`Muster view changed to ${val}`, {
                          style: {
                            borderRadius: '12px',
                            background: '#1A1A2E',
                            color: '#fff',
                            fontSize: '12px',
                            fontWeight: 'bold'
                          }
                        });
                      }}
                      className={`text-xs font-semibold rounded-xl pl-4 pr-10 py-2.5 outline-none border cursor-pointer appearance-none relative ${
                        isDarkMode ? 'bg-slate-800 text-white border-slate-700' : 'bg-[#FAFAF8] text-[#1A1A2E] border-[#E8E7E2]'
                      }`}
                      style={{ colorScheme: isDarkMode ? 'dark' : 'light' }}
                    />
                    <FiCalendar className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={14} />
                  </div>

                  {/* View mode toggle buttons (Grid vs Calendar) */}
                  <div className="flex items-center gap-1.5 border border-[#F4F3EF] dark:border-slate-800 rounded-2xl p-1 bg-[#FAFAF8] dark:bg-slate-800/40 shrink-0">
                    <button
                      onClick={() => setMusterViewMode('grid')}
                      className={`p-2 rounded-xl transition-all flex items-center justify-center ${
                        musterViewMode === 'grid'
                          ? 'bg-[#0D47A1] text-white shadow-md shadow-blue-500/10'
                          : 'text-[#9B9BAD] hover:text-[#1A1A2E] dark:hover:text-white'
                      }`}
                      title="Muster Register Grid"
                    >
                      <FiList size={16} />
                    </button>
                    <button
                      onClick={() => setMusterViewMode('calendar')}
                      className={`p-2 rounded-xl transition-all flex items-center justify-center ${
                        musterViewMode === 'calendar'
                          ? 'bg-[#0D47A1] text-white shadow-md shadow-blue-500/10'
                          : 'text-[#9B9BAD] hover:text-[#1A1A2E] dark:hover:text-white'
                      }`}
                      title="Calendar Grid View"
                    >
                      <FiGrid size={16} />
                    </button>
                  </div>
                </div>
              </div>

              {musterSearchTerm === '' ? (
                <div className="py-24 flex flex-col items-center justify-center text-center max-w-md mx-auto space-y-4">
                  <div className="w-16 h-16 rounded-[24px] bg-[#0D47A1]/10 dark:bg-blue-500/10 text-[#0D47A1] dark:text-blue-400 flex items-center justify-center">
                    <FiCalendar size={28} />
                  </div>
                  <div className="space-y-1.5">
                    <h4 className="text-sm font-bold text-[#1A1A2E] dark:text-white uppercase tracking-widest font-syne">Search Employee Muster</h4>
                    <p className="text-xs text-slate-400 dark:text-slate-500 leading-relaxed">
                      Enter an employee's name or ID in the search field, or select an employee from the dropdown above to load their monthly attendance muster calendar.
                    </p>
                  </div>
                </div>
              ) : musterViewMode === 'grid' ? (
                /* Muster Grid Container with Horizontal Scroll */
                <div className="overflow-x-auto w-full custom-scrollbar">
                  <table className="w-full border-collapse select-none text-left">
                    <thead>
                      <tr className="border-b border-[#F4F3EF] dark:border-slate-800">
                        <th className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-widest text-left py-3 pr-6 sticky left-0 bg-white dark:bg-slate-900 z-10 min-w-[180px]">Employee</th>
                        {calendarDays.map((day) => (
                          <th key={day.dayNum} className="text-center py-2 px-1 min-w-[28px] border-l border-[#F4F3EF] dark:border-slate-800">
                            <p className="text-[9px] font-black text-[#9B9BAD]">{day.dayNum}</p>
                            <p className={`text-[7px] font-bold uppercase mt-0.5 ${day.weekday === 'Sun' ? 'text-rose-500' : 'text-slate-400'}`}>{day.weekday.slice(0, 2)}</p>
                          </th>
                        ))}
                        {/* Summary Columns */}
                        {['P', 'L', 'H', 'A', 'OFF'].map(s => (
                          <th key={s} className="text-center py-2 px-2 min-w-[32px] border-l border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800">
                            <p className="text-[9px] font-black text-[#0D47A1]">{s}</p>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {filteredMusterEmployees.length === 0 ? (
                        <tr>
                          <td colSpan={36} className="py-12 text-center text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                            No matching employees found
                          </td>
                        </tr>
                      ) : (
                        filteredMusterEmployees.map((emp) => (
                          <tr 
                            key={emp.empId} 
                            onClick={() => setSelectedEmployee(emp)}
                            className="border-b border-[#F4F3EF] dark:border-slate-800 hover:bg-[#F8FAFF] dark:hover:bg-slate-800/20 transition-all cursor-pointer"
                          >
                            {/* Name & ID column stuck to the left */}
                            <td className="py-3 pr-6 sticky left-0 bg-white dark:bg-slate-900 z-10 border-r border-[#F4F3EF] dark:border-slate-800 text-left min-w-[180px]">
                              <p className="text-xs font-bold text-[#1A1A2E] dark:text-white truncate">{emp.name}</p>
                              <p className="text-[8px] font-black text-[#9B9BAD] uppercase mt-0.5 tracking-wider truncate">{emp.empId} | {emp.designation}</p>
                            </td>

                            {/* Calendar cells */}
                            {calendarDays.map((day) => {
                              const status = getCellStatus(emp, day.dayNum);
                              
                              const isEditingThisCell = activeCellEdit && activeCellEdit.empId === emp.empId && activeCellEdit.dayNum === day.dayNum;

                              return (
                                <td 
                                  key={day.dayNum} 
                                  className="text-center p-1 border-l border-[#F4F3EF] dark:border-slate-800 relative cursor-pointer"
                                  onClick={(e) => {
                                    e.stopPropagation(); // Stop row click (drawer open)
                                    if (document.activeElement && typeof document.activeElement.blur === 'function') {
                                      document.activeElement.blur();
                                    }
                                    setActiveCellEdit(isEditingThisCell ? null : { empId: emp.empId, dayNum: day.dayNum });
                                  }}
                                >
                                  <span 
                                    style={getAttendanceCellStyle(status, isDarkMode)}
                                    className={`w-6 h-6 rounded-md text-[9px] flex items-center justify-center mx-auto transition-all duration-200 hover:scale-110 hover:shadow-sm border font-bold ${
                                      isEditingThisCell ? 'ring-2 ring-[#0D47A1]' : ''
                                    }`}
                                  >
                                    {status}
                                  </span>

                                  {/* Backdrop overlay to clear selection on outside click */}
                                  <AnimatePresence>
                                    {isEditingThisCell && (
                                      <div 
                                        className="fixed inset-0 z-30" 
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setActiveCellEdit(null);
                                        }} 
                                      />
                                    )}
                                  </AnimatePresence>
                                </td>
                              );
                            })}

                            {/* Summary totals */}
                            {(() => {
                              const currentStats = getEmpStats(emp);
                              return (
                                <>
                                  <td className="text-center font-bold text-xs py-2 px-1 border-l border-slate-300 dark:border-slate-700 bg-slate-50/50 text-emerald-600">{currentStats.P}</td>
                                  <td className="text-center font-bold text-xs py-2 px-1 border-l border-slate-300 dark:border-slate-700 bg-slate-50/50 text-blue-600">{currentStats.L}</td>
                                  <td className="text-center font-bold text-xs py-2 px-1 border-l border-slate-300 dark:border-slate-700 bg-slate-50/50 text-purple-600">{currentStats.H}</td>
                                  <td className="text-center font-bold text-xs py-2 px-1 border-l border-slate-300 dark:border-slate-700 bg-slate-50/50 text-rose-500">{currentStats.A}</td>
                                  <td className="text-center font-bold text-xs py-2 px-1 border-l border-slate-300 dark:border-slate-700 bg-slate-50/50 text-slate-500">{currentStats.OFF}</td>
                                </>
                              );
                            })()}
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              ) : (
                /* Monthly Calendar View Cards for Searched Employees */
                <div className="grid grid-cols-1 gap-8 py-4">
                  {filteredMusterEmployees.length === 0 ? (
                    <div className="py-12 text-center text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                      No matching employees found
                    </div>
                  ) : (
                    filteredMusterEmployees.map((emp) => {
                      const empStats = getEmpStats(emp);
                      return (
                        <div 
                          key={emp.empId} 
                          className={`rounded-[32px] border p-6 md:p-8 flex flex-col transition-all text-left ${
                            isDarkMode ? 'bg-slate-900/40 border-slate-800' : 'bg-[#FAFAF8] border-[#F4F3EF] shadow-sm'
                          }`}
                        >
                          {/* Card Header: Profile Info & Stats */}
                          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-[#F4F3EF] dark:border-slate-800 pb-6 mb-6">
                            <div className="flex items-center gap-4">
                              <div className="w-14 h-14 rounded-2xl bg-[#1B4DA0] flex items-center justify-center text-white text-lg font-extrabold shadow-md shadow-blue-500/10 overflow-hidden"
                                   style={{ background: 'linear-gradient(135deg, #1B4DA0 0%, #0D47A1 100%)' }}>
                                <span>{emp.name.substring(0, 2).toUpperCase()}</span>
                              </div>
                              <div className="text-left">
                                <h4 className="text-base font-bold text-[#1A1A2E] dark:text-white font-syne">{emp.name}</h4>
                                <p className="text-[9px] font-black text-[#0D47A1] dark:text-blue-400 uppercase tracking-widest mt-0.5">{emp.empId} | {emp.designation}</p>
                              </div>
                            </div>
                            
                            {/* Summary Mini Badges */}
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-[9px] font-black uppercase text-slate-400 mr-2 tracking-widest">June 2026:</span>
                              {[
                                { k: 'P', label: 'Present', val: empStats.P, color: isDarkMode ? 'bg-emerald-950/20 text-emerald-400 border-emerald-900/40' : 'bg-emerald-50 text-emerald-600 border-emerald-100' },
                                { k: 'A', label: 'Absent', val: empStats.A, color: isDarkMode ? 'bg-rose-950/20 text-rose-400 border-rose-900/40' : 'bg-rose-50 text-rose-500 border-rose-100' },
                                { k: 'L', label: 'Leave', val: empStats.L, color: isDarkMode ? 'bg-blue-950/20 text-blue-400 border-blue-900/40' : 'bg-blue-50 text-blue-600 border-blue-100' },
                                { k: 'H', label: 'Holiday', val: empStats.H, color: isDarkMode ? 'bg-purple-950/20 text-purple-400 border-purple-900/40' : 'bg-purple-50 text-purple-600 border-purple-100' },
                                { k: 'OFF', label: 'Off', val: empStats.OFF, color: isDarkMode ? 'bg-slate-800/40 text-slate-400 border-slate-700/40' : 'bg-slate-50 text-slate-500 border-slate-200' },
                              ].map(b => (
                                <div key={b.k} className={`px-2.5 py-1 rounded-xl border flex items-center gap-1.5 text-[9px] font-bold ${b.color}`}>
                                  <span>{b.k}:</span>
                                  <span className="font-extrabold">{b.val}</span>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* 7-Column Calendar Grid */}
                          <div className="w-full">
                            {/* Calendar Headers */}
                            <div className="grid grid-cols-7 gap-2 mb-2 text-center">
                              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(wd => (
                                <div key={wd} className="py-2 text-[9px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-wider">
                                  {wd}
                                </div>
                              ))}
                            </div>

                            {/* Calendar Cells */}
                            <div className="grid grid-cols-7 gap-2">
                              {(() => {
                                const paddingDays = 1;
                                const daysInJune = 30;
                                const cells = [];
                                for (let i = 0; i < paddingDays; i++) cells.push(null);
                                for (let i = 1; i <= daysInJune; i++) cells.push(i);

                                return cells.map((dayNum, index) => {
                                  if (dayNum === null) {
                                    return <div key={`calendar-pad-${index}`} className="aspect-square rounded-2xl opacity-0" />;
                                  }

                                  const status = getCellStatus(emp, dayNum);
                                  const isSelected = activeCellEdit && activeCellEdit.empId === emp.empId && activeCellEdit.dayNum === dayNum;

                                  return (
                                    <div
                                      key={`calendar-day-${emp.empId}-${dayNum}`}
                                      style={getAttendanceCellStyle(status, isDarkMode)}
                                      className={`aspect-square rounded-2xl border flex flex-col justify-between p-2.5 relative cursor-pointer select-none transition-all duration-300 ${
                                        isSelected 
                                          ? 'ring-2 ring-[#0D47A1] dark:ring-blue-500 border-transparent shadow-lg scale-105 z-30' 
                                          : 'hover:scale-105 hover:shadow-md'
                                      }`}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        if (document.activeElement && typeof document.activeElement.blur === 'function') {
                                          document.activeElement.blur();
                                        }
                                        setActiveCellEdit(isSelected ? null : { empId: emp.empId, dayNum });
                                      }}
                                    >
                                      <span className="text-[10px] font-extrabold text-left leading-none">
                                        {dayNum < 10 ? `0${dayNum}` : dayNum}
                                      </span>

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
                                              setActiveCellEdit(null);
                                            }} 
                                          />
                                        )}
                                      </AnimatePresence>
                                    </div>
                                  );
                                });
                              })()}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              )}

              {/* Grid Legend */}
              <div className="flex items-center gap-6 mt-6 flex-wrap border-t border-[#F4F3EF] pt-4">
                <span className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-wider">Legend:</span>
                <div className="flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-md flex items-center justify-center text-[8px] font-bold border" style={getAttendanceCellStyle('P', isDarkMode)}>P</span>
                  <span className="text-xs font-semibold text-slate-500">Present</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-md flex items-center justify-center text-[8px] font-bold border" style={getAttendanceCellStyle('A', isDarkMode)}>A</span>
                  <span className="text-xs font-semibold text-slate-500">Absent</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-md flex items-center justify-center text-[8px] font-bold border" style={getAttendanceCellStyle('L', isDarkMode)}>L</span>
                  <span className="text-xs font-semibold text-slate-500">Leave</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-md flex items-center justify-center text-[8px] font-bold border" style={getAttendanceCellStyle('H', isDarkMode)}>H</span>
                  <span className="text-xs font-semibold text-slate-500">Holiday</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-md flex items-center justify-center text-[8px] font-bold border" style={getAttendanceCellStyle('OFF', isDarkMode)}>OFF</span>
                  <span className="text-xs font-semibold text-slate-500">Weekly Off</span>
                </div>
              </div>
            </motion.div>
          )}

          {/* BIOMETRIC & API INTEGRATIONS TAB */}
          {activeSubTab === 'integrations' && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6 animate-fade-in"
            >
              <div className="text-left max-w-2xl mb-8">
                <p className="text-sm text-slate-500 leading-relaxed">
                  Integrate your client biometrics hardware (eSSL machines) or third-party HR portals (Keka, greytHR, Emgage) directly. Once connected, employees can punch in/out on their local systems and all check-in records will automatically sync here in real-time.
                </p>
              </div>

              {/* Integrations Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {integrations.map((platform) => {
                  const PlatformIcon = platform.icon;
                  const isConnected = platform.status === 'Connected';
                  return (
                    <motion.div
                      key={platform.id}
                      whileHover={{ y: -4 }}
                      className={`rounded-3xl border p-6 flex flex-col justify-between transition-all ${
                        isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-[#F4F3EF] shadow-sm'
                      }`}
                    >
                      <div className="space-y-4">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3.5">
                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-inner ${
                              isConnected ? 'bg-blue-500/10 text-[#0D47A1]' : 'bg-slate-100 text-slate-400'
                            }`}>
                              <PlatformIcon size={24} />
                            </div>
                            <div className="text-left">
                              <h4 className="text-base font-bold text-[#1A1A2E] dark:text-white">{platform.name}</h4>
                              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-0.5">Biometrics Punch API</p>
                            </div>
                          </div>

                          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider ${
                            isConnected ? 'bg-emerald-500/10 text-emerald-600' : 'bg-slate-100 text-slate-400'
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`}></span>
                            {platform.status}
                          </span>
                        </div>

                        <p className="text-xs text-slate-500 leading-relaxed text-left pl-1">
                          {platform.description}
                        </p>

                        {isConnected && (
                          <div className="bg-[#FAFAF8] dark:bg-slate-800/40 rounded-2xl p-4 flex items-center justify-between text-left text-xs">
                            <div>
                              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Active Endpoint</p>
                              <p className="font-bold text-slate-600 truncate max-w-[200px]">
                                {platform.config.serverIp || platform.config.domain || platform.config.tenantUrl}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Last Synced</p>
                              <p className="font-bold text-slate-600">{platform.lastSynced}</p>
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-3 border-t border-[#F4F3EF] dark:border-slate-800 mt-6 pt-4 w-full">
                        <button
                          onClick={() => handleConfigure(platform)}
                          className="flex-1 py-3 rounded-xl text-xs font-bold border border-[#F4F3EF] dark:border-slate-800 text-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-all flex items-center justify-center gap-1.5"
                        >
                          <FiSettings className="w-3.5 h-3.5" />
                          Configure
                        </button>
                        <button
                          disabled={!isConnected}
                          onClick={() => triggerSync(platform)}
                          className={`flex-1 py-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                            isConnected 
                              ? 'bg-[#0D47A1] hover:bg-[#0a3a82] text-white shadow-md shadow-blue-500/10' 
                              : 'bg-slate-100 text-slate-400 cursor-not-allowed border border-[#F4F3EF]'
                          }`}
                        >
                          <FiRefreshCw className={`w-3.5 h-3.5 ${syncingPlatform?.id === platform.id ? 'animate-spin' : ''}`} />
                          Sync Now
                        </button>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Right Side Drawer for Employee Details */}
      {typeof document !== 'undefined' && createPortal(
        <AnimatePresence>
          {selectedEmployee && (
            <>
              <motion.div
                key="backdrop"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setSelectedEmployee(null)}
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
                  onBack={() => setSelectedEmployee(null)}
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

      {/* CONFIGURATION DIALOG MODAL */}
      <AnimatePresence>
        {showConfigModal && (
          <div className="fixed inset-0 flex items-center justify-center z-[200]">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowConfigModal(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm"
            />
            
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl p-8 shadow-2xl max-w-md w-full relative z-[210] border border-[#F4F3EF] text-left"
            >
              <button 
                onClick={() => setShowConfigModal(false)}
                className="absolute top-5 right-5 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 transition-all flex items-center justify-center"
              >
                <FiX className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 rounded-2xl bg-blue-500/10 text-[#0D47A1]">
                  <FiSettings size={20} />
                </div>
                <div>
                  <h4 className="text-lg font-bold text-[#1A1A2E]">Configure {configuringIntegration?.name}</h4>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-0.5">Integration Settings</p>
                </div>
              </div>

              <div className="space-y-4">
                {configuringIntegration?.id === 'essl' && (
                  <>
                    <div className="space-y-1.5 w-full">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block pl-1">Server IP Address *</label>
                      <input 
                        type="text" 
                        value={tempConfig.serverIp || ''}
                        onChange={(e) => setTempConfig({ ...tempConfig, serverIp: e.target.value })}
                        placeholder="e.g. 192.168.1.150"
                        className="w-full bg-[#F8FAFF] border border-[#F4F3EF] rounded-2xl py-3 px-4 text-sm font-bold text-[#1A1A2E] outline-none focus:ring-2 focus:ring-[#0D47A1]/20"
                      />
                    </div>
                    <div className="space-y-1.5 w-full">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block pl-1">Port Number *</label>
                      <input 
                        type="text" 
                        value={tempConfig.port || ''}
                        onChange={(e) => setTempConfig({ ...tempConfig, port: e.target.value })}
                        placeholder="e.g. 8080"
                        className="w-full bg-[#F8FAFF] border border-[#F4F3EF] rounded-2xl py-3 px-4 text-sm font-bold text-[#1A1A2E] outline-none focus:ring-2 focus:ring-[#0D47A1]/20"
                      />
                    </div>
                    <div className="space-y-1.5 w-full">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block pl-1">API Authentication Token *</label>
                      <input 
                        type="password" 
                        value={tempConfig.apiKey || ''}
                        onChange={(e) => setTempConfig({ ...tempConfig, apiKey: e.target.value })}
                        placeholder="e.g. essl_secret_key"
                        className="w-full bg-[#F8FAFF] border border-[#F4F3EF] rounded-2xl py-3 px-4 text-sm font-bold text-[#1A1A2E] outline-none focus:ring-2 focus:ring-[#0D47A1]/20"
                      />
                    </div>
                    <div className="space-y-1.5 w-full">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block pl-1">Connected Device IDs</label>
                      <input 
                        type="text" 
                        value={tempConfig.devices || ''}
                        onChange={(e) => setTempConfig({ ...tempConfig, devices: e.target.value })}
                        placeholder="e.g. Device_Gate1, Device_Gate2"
                        className="w-full bg-[#F8FAFF] border border-[#F4F3EF] rounded-2xl py-3 px-4 text-sm font-bold text-[#1A1A2E] outline-none focus:ring-2 focus:ring-[#0D47A1]/20"
                      />
                    </div>
                  </>
                )}

                {configuringIntegration?.id === 'greythr' && (
                  <>
                    <div className="space-y-1.5 w-full">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block pl-1">greytHR Domain Link *</label>
                      <input 
                        type="text" 
                        value={tempConfig.domain || ''}
                        onChange={(e) => setTempConfig({ ...tempConfig, domain: e.target.value })}
                        placeholder="e.g. client-name.greythr.com"
                        className="w-full bg-[#F8FAFF] border border-[#F4F3EF] rounded-2xl py-3 px-4 text-sm font-bold text-[#1A1A2E] outline-none focus:ring-2 focus:ring-[#0D47A1]/20"
                      />
                    </div>
                    <div className="space-y-1.5 w-full">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block pl-1">OAuth Client ID *</label>
                      <input 
                        type="text" 
                        value={tempConfig.clientId || ''}
                        onChange={(e) => setTempConfig({ ...tempConfig, clientId: e.target.value })}
                        placeholder="e.g. client_id_code"
                        className="w-full bg-[#F8FAFF] border border-[#F4F3EF] rounded-2xl py-3 px-4 text-sm font-bold text-[#1A1A2E] outline-none focus:ring-2 focus:ring-[#0D47A1]/20"
                      />
                    </div>
                    <div className="space-y-1.5 w-full">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block pl-1">OAuth Client Secret *</label>
                      <input 
                        type="password" 
                        value={tempConfig.clientSecret || ''}
                        onChange={(e) => setTempConfig({ ...tempConfig, clientSecret: e.target.value })}
                        placeholder="••••••••••••••••••••"
                        className="w-full bg-[#F8FAFF] border border-[#F4F3EF] rounded-2xl py-3 px-4 text-sm font-bold text-[#1A1A2E] outline-none focus:ring-2 focus:ring-[#0D47A1]/20"
                      />
                    </div>
                  </>
                )}

                {configuringIntegration?.id === 'keka' && (
                  <>
                    <div className="space-y-1.5 w-full">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block pl-1">Keka Tenant API URL *</label>
                      <input 
                        type="text" 
                        value={tempConfig.tenantUrl || ''}
                        onChange={(e) => setTempConfig({ ...tempConfig, tenantUrl: e.target.value })}
                        placeholder="e.g. https://company.keka.com/api"
                        className="w-full bg-[#F8FAFF] border border-[#F4F3EF] rounded-2xl py-3 px-4 text-sm font-bold text-[#1A1A2E] outline-none focus:ring-2 focus:ring-[#0D47A1]/20"
                      />
                    </div>
                    <div className="space-y-1.5 w-full">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block pl-1">Access Token *</label>
                      <input 
                        type="text" 
                        value={tempConfig.authToken || ''}
                        onChange={(e) => setTempConfig({ ...tempConfig, authToken: e.target.value })}
                        placeholder="e.g. keka_auth_token"
                        className="w-full bg-[#F8FAFF] border border-[#F4F3EF] rounded-2xl py-3 px-4 text-sm font-bold text-[#1A1A2E] outline-none focus:ring-2 focus:ring-[#0D47A1]/20"
                      />
                    </div>
                    <div className="space-y-1.5 w-full">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block pl-1">Client Secret ID *</label>
                      <input 
                        type="password" 
                        value={tempConfig.clientSecretId || ''}
                        onChange={(e) => setTempConfig({ ...tempConfig, clientSecretId: e.target.value })}
                        placeholder="••••••••••••••••••••"
                        className="w-full bg-[#F8FAFF] border border-[#F4F3EF] rounded-2xl py-3 px-4 text-sm font-bold text-[#1A1A2E] outline-none focus:ring-2 focus:ring-[#0D47A1]/20"
                      />
                    </div>
                  </>
                )}

                {configuringIntegration?.id === 'emgage' && (
                  <>
                    <div className="space-y-1.5 w-full">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block pl-1">Emgage Organization ID *</label>
                      <input 
                        type="text" 
                        value={tempConfig.orgId || ''}
                        onChange={(e) => setTempConfig({ ...tempConfig, orgId: e.target.value })}
                        placeholder="e.g. emg_mab_901"
                        className="w-full bg-[#F8FAFF] border border-[#F4F3EF] rounded-2xl py-3 px-4 text-sm font-bold text-[#1A1A2E] outline-none focus:ring-2 focus:ring-[#0D47A1]/20"
                      />
                    </div>
                    <div className="space-y-1.5 w-full">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block pl-1">API Key *</label>
                      <input 
                        type="text" 
                        value={tempConfig.apiKey || ''}
                        onChange={(e) => setTempConfig({ ...tempConfig, apiKey: e.target.value })}
                        placeholder="e.g. emgage_api_key_xxxx"
                        className="w-full bg-[#F8FAFF] border border-[#F4F3EF] rounded-2xl py-3 px-4 text-sm font-bold text-[#1A1A2E] outline-none focus:ring-2 focus:ring-[#0D47A1]/20"
                      />
                    </div>
                    <div className="space-y-1.5 w-full">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block pl-1">Auth Token *</label>
                      <input 
                        type="password" 
                        value={tempConfig.authToken || ''}
                        onChange={(e) => setTempConfig({ ...tempConfig, authToken: e.target.value })}
                        placeholder="Auth token..."
                        className="w-full bg-[#F8FAFF] border border-[#F4F3EF] rounded-2xl py-3 px-4 text-sm font-bold text-[#1A1A2E] outline-none focus:ring-2 focus:ring-[#0D47A1]/20"
                      />
                    </div>
                  </>
                )}

                {configuringIntegration?.id === 'hrone' && (
                  <>
                    <div className="space-y-1.5 w-full">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block pl-1">HROne Tenant Domain *</label>
                      <input 
                        type="text" 
                        value={tempConfig.tenantName || ''}
                        onChange={(e) => setTempConfig({ ...tempConfig, tenantName: e.target.value })}
                        placeholder="e.g. company.hrone.cloud"
                        className="w-full bg-[#F8FAFF] border border-[#F4F3EF] rounded-2xl py-3 px-4 text-sm font-bold text-[#1A1A2E] outline-none focus:ring-2 focus:ring-[#0D47A1]/20"
                      />
                    </div>
                    <div className="space-y-1.5 w-full">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block pl-1">API Key *</label>
                      <input 
                        type="text" 
                        value={tempConfig.apiKey || ''}
                        onChange={(e) => setTempConfig({ ...tempConfig, apiKey: e.target.value })}
                        placeholder="e.g. hrone_api_key_xxxx"
                        className="w-full bg-[#F8FAFF] border border-[#F4F3EF] rounded-2xl py-3 px-4 text-sm font-bold text-[#1A1A2E] outline-none focus:ring-2 focus:ring-[#0D47A1]/20"
                      />
                    </div>
                    <div className="space-y-1.5 w-full">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block pl-1">API Endpoint URL</label>
                      <input 
                        type="text" 
                        value={tempConfig.portalUrl || ''}
                        onChange={(e) => setTempConfig({ ...tempConfig, portalUrl: e.target.value })}
                        placeholder="e.g. https://api.hrone.cloud/v2"
                        className="w-full bg-[#F8FAFF] border border-[#F4F3EF] rounded-2xl py-3 px-4 text-sm font-bold text-[#1A1A2E] outline-none focus:ring-2 focus:ring-[#0D47A1]/20"
                      />
                    </div>
                  </>
                )}
              </div>

              <div className="flex items-center gap-3 mt-8">
                <button
                  onClick={() => setShowConfigModal(false)}
                  className="flex-1 py-3 rounded-xl text-xs font-bold border border-[#F4F3EF] text-slate-500 hover:bg-slate-50 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={saveConfiguration}
                  className="flex-1 py-3 rounded-xl text-xs font-bold bg-[#0D47A1] hover:bg-[#0a3a82] text-white shadow-lg shadow-blue-500/15 transition-all"
                >
                  Save Connection
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* SYNCHRONIZATION PROGRESS MODAL TERMINAL */}
      <AnimatePresence>
        {showSyncTerminal && (
          <div className="fixed inset-0 flex items-center justify-center z-[250]">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            />
            
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-slate-950 text-emerald-400 rounded-3xl p-6 shadow-2xl max-w-lg w-full relative z-[260] border border-slate-800 text-left font-mono"
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-3.5 h-3.5 rounded-full bg-rose-500"></div>
                  <div className="w-3.5 h-3.5 rounded-full bg-amber-500"></div>
                  <div className="w-3.5 h-3.5 rounded-full bg-emerald-500"></div>
                  <span className="text-xs text-slate-500 font-bold ml-2">Sync Terminal — {syncingPlatform?.name}</span>
                </div>
                {syncingPlatform === null && (
                  <button 
                    onClick={() => setShowSyncTerminal(false)}
                    className="text-xs font-bold text-slate-400 hover:text-white transition-all"
                  >
                    [CLOSE]
                  </button>
                )}
              </div>

              <div className="space-y-2.5 h-64 overflow-y-auto custom-scrollbar text-xs">
                {syncLogs.length === 0 ? (
                  <p className="text-slate-600">Starting synchronizer process daemon...</p>
                ) : (
                  syncLogs.map((log, i) => {
                    const isSuccess = log.includes('Success:');
                    return (
                      <p 
                        key={i} 
                        className={isSuccess ? 'text-emerald-300 font-black' : 'text-slate-300'}
                      >
                        {log}
                      </p>
                    );
                  })
                )}

                {syncingPlatform && (
                  <p className="text-slate-600 animate-pulse">
                    Connecting... <span className="inline-block w-1.5 h-4 bg-emerald-400 align-middle ml-1"></span>
                  </p>
                )}
              </div>

              {!syncingPlatform && (
                <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-emerald-300 font-bold text-xs">
                    <FiCheckCircle className="w-4 h-4 animate-bounce" />
                    Synchronized 15 records!
                  </div>
                  <button
                    onClick={() => setShowSyncTerminal(false)}
                    className="px-6 py-2 rounded-xl text-xs font-bold bg-emerald-500 text-slate-950 hover:bg-emerald-400 transition-all"
                  >
                    Close
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AttendanceTab;
