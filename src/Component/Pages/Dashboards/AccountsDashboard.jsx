import React, { useState, useEffect, useRef, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiDollarSign,
  FiTrendingUp,
  FiUsers,
  FiUser,
  FiHome,
  FiPieChart,
  FiTarget,
  FiBriefcase,
  FiActivity,
  FiBell,
  FiClipboard,
  FiFileText,
  FiCreditCard,
  FiTruck,
  FiClock,
  FiSettings,
  FiChevronDown
} from 'react-icons/fi';
import { Bar, Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend } from 'chart.js';
import AdminLayout, { StatCard } from './AdminLayout';
import { FaRupeeSign } from 'react-icons/fa';
import {
  getAllNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  getFinanceClientAccounts,
  getAllClients,
  getFinanceExpenses,
  getFinanceInvoices,
  getFinanceEmployeesPayroll,
  getMyProfile
} from '../service/api';
import AccountsClientsTab from './Tabs/Account/AccountsClientsTab';
import AccountsEmployeesPayrollTab from './Tabs/Account/AccountsEmployeesPayrollTab';
import AccountsBillingInvoicesTab from './Tabs/Account/AccountsBillingInvoicesTab';
import AccountsExpenseVendorsTab from './Tabs/Account/AccountsExpenseVendorsTab';
import AccountsCollectionsTab from './Tabs/Account/AccountsCollectionsTab';
import AccountsPendingPaymentsTab from './Tabs/Account/AccountsPendingPaymentsTab';
import AccountsMyProfileTab from './Tabs/Account/AccountsMyProfileTab';
import ReportsProfitabilityDashboard from './Tabs/Account/ReportsProfitabilityDashboard';
import PolicyTab from './Tabs/KAM/PolicyTab';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend);

const sidebarConfig = [
  {
    items: [
      { id: 'Dashboard', title: 'Dashboard', icon: FiPieChart },
      { id: 'Clients', title: 'Clients', icon: FiUsers },
      { id: 'Billing & Invoices', title: 'Billing & Invoices', icon: FiFileText },
      { id: 'Pending Payments', title: 'Pending Payments', icon: FiClock },
      { id: 'Employees & Payroll', title: 'Employees & Payroll', icon: FiClipboard },
      { id: 'Expenses & Vendors', title: 'Expenses & Vendors', icon: FiTruck },
      { id: 'Reports & Profitability', title: 'Reports & Profitability', icon: FiTrendingUp },
      { id: 'My Profile', title: 'My Profile', icon: FiUser }
    ]
  }
];

const AccountsDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(() => {
    return localStorage.getItem('accountsActiveTab') || 'Dashboard';
  });
  const [userInfo, setUserInfo] = useState({ name: 'Accounts Admin', role: 'Accounts' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    localStorage.setItem('accountsActiveTab', activeTab);
  }, [activeTab]);



  // Finance stats state
  const [financeStats, setFinanceStats] = useState({
    totalOutstanding: 0,
    totalCleared: 0,
    activeClients: 0,
    overdueCount: 0,
    totalMonthlyBilling: 0,
    totalYearlyRevenue: 0,
    operationsBilling: 0,
    recruitmentBilling: 0,
    salesBilling: 0,
    salaryPayout: 0,
    officeRentExpenses: 0,
    netProfit: 0,
    pendingCollections: 0,
    departmentProfit: {
      Operations: 0,
      Recruitment: 0,
      Sales: 0
    },
    revenueData: [0, 0, 0, 0, 0, 0],
    expenseData: [0, 0, 0, 0]
  });

  const handleKPIClick = (kpi) => {
    setSelectedKPI(kpi);
  };
  const [selectedKPI, setSelectedKPI] = useState(null);
  const [kpiSearchQuery, setKpiSearchQuery] = useState('');
  const [notifications, setNotifications] = useState([]);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const notificationRef = useRef(null);


  const getInvoiceDepartment = (invoice) => {
    let dept = invoice.department || invoice.serviceDepartment || invoice.dept || 'Recruitment';
    if (invoice.notes && invoice.notes.includes('Department:')) {
      invoice.notes.split(' | ').forEach(part => {
        if (part.startsWith('Department:')) {
          dept = part.replace('Department:', '').trim();
        }
      });
    }
    return dept;
  };

  const normalizeDepartment = (value) => {
    const dept = String(value || '').toLowerCase();
    if (dept.includes('operation')) return 'Operations';
    if (dept.includes('recruit')) return 'Recruitment';
    if (dept.includes('crm') || dept.includes('sales')) return 'Sales';
    return '';
  };

  const getKPIRecords = () => {
    let records = [];
    if (selectedKPI === 'Operations Billing' || selectedKPI === 'Recruitment Billing' || selectedKPI === 'Sales Department Revenue') {
      let targetDept = '';
      if (selectedKPI === 'Operations Billing') targetDept = 'Operations';
      if (selectedKPI === 'Recruitment Billing') targetDept = 'Recruitment';
      if (selectedKPI === 'Sales Department Revenue') targetDept = 'Sales';

      records = invoicesList
        .filter(inv => normalizeDepartment(getInvoiceDepartment(inv)).toLowerCase() === targetDept.toLowerCase())
        .map((inv, idx) => ({
          name: inv.companyName || (inv.Client && inv.Client.companyName) || 'Unknown Client',
          email: (inv.Client && inv.Client.email) || `accounts@${(inv.companyName || 'company').toLowerCase().replace(/\s+/g, '')}.com`,
          ref: inv.invoiceNumber || inv.id || inv._id || `INV-${idx + 1}`,
          amount: formatCurrency(inv.totalAmount || inv.amount),
          status: inv.status || 'Pending',
          label3: 'Department',
          val3: getInvoiceDepartment(inv)
        }));
    } else if (selectedKPI === 'Total Monthly Billing' || selectedKPI === 'Billing & Invoices') {
      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();
      
      let filteredInvoices = invoicesList;
      if (selectedKPI === 'Total Monthly Billing') {
        filteredInvoices = invoicesList.filter(inv => {
          const invDate = inv.createdAt ? new Date(inv.createdAt) : new Date();
          return invDate.getMonth() === currentMonth && invDate.getFullYear() === currentYear;
        });
      }

      records = filteredInvoices.map((inv, idx) => {
        let dept = getInvoiceDepartment(inv);
        return {
          name: inv.companyName || (inv.Client && inv.Client.companyName) || 'Unknown Client',
          email: (inv.Client && inv.Client.email) || `accounts@${(inv.companyName || 'company').toLowerCase().replace(/\s+/g, '')}.com`,
          ref: inv.invoiceNumber || inv.id,
          amount: `₹${Number(inv.totalAmount || inv.amount || 0).toLocaleString('en-IN')}`,
          status: inv.status || 'Pending',
          label3: 'Department',
          val3: dept
        };
      });
    } else if (selectedKPI === 'Office Rent & Expenses' || selectedKPI === 'Expenses & Vendors') {
      records = expensesList.map(exp => ({
        name: exp.vendor || 'Unknown Vendor',
        email: 'N/A',
        ref: `#EXP-${exp.id ? exp.id.substring(0, 4).toUpperCase() : 'N/A'}`,
        amount: `₹${Number(exp.amount).toLocaleString('en-IN')}`,
        status: exp.status || 'Pending',
        label3: 'Category',
        val3: exp.category || 'General'
      }));
    } else if (selectedKPI === 'Salary Payout' || selectedKPI === 'Employees & Payroll') {
      records = payrollList.map(p => {
        const name = p.col2 || p.name || 'Unknown Employee';
        const email = p.details?.email || p.email || 'N/A';
        const dept = p.col3 || p.department || 'N/A';
        const amtStr = typeof p.col4 === 'string' ? p.col4 : `₹${Number(p.amount || 0).toLocaleString('en-IN')}`;
        const status = p.col5 || p.status || 'Processed';
        return {
          name,
          email,
          ref: p.col1 || `#EMP-${p.id ? String(p.id).substring(0, 4).toUpperCase() : 'N/A'}`,
          amount: amtStr,
          status,
          label3: 'Department',
          val3: dept
        };
      });
    } else if (selectedKPI === 'Total Yearly Revenue' || selectedKPI === 'Reports & Profitability') {
      const currentYear = new Date().getFullYear();
      let filteredInvoices = invoicesList;
      if (selectedKPI === 'Total Yearly Revenue') {
        filteredInvoices = invoicesList.filter(inv => {
          const invDate = inv.createdAt ? new Date(inv.createdAt) : new Date();
          return invDate.getFullYear() === currentYear && inv.status === 'Paid';
        });
      }

      records = filteredInvoices.map((inv, idx) => {
        let dept = getInvoiceDepartment(inv);
        return {
          name: inv.companyName || (inv.Client && inv.Client.companyName) || 'Unknown Client',
          email: (inv.Client && inv.Client.email) || `accounts@${(inv.companyName || 'company').toLowerCase().replace(/\s+/g, '')}.com`,
          ref: inv.invoiceNumber || inv.id,
          amount: `₹${Number(inv.totalAmount || inv.amount || 0).toLocaleString('en-IN')}`,
          status: inv.status || 'Pending',
          label3: 'Service',
          val3: dept + ' Services'
        };
      });
    } else if (selectedKPI === 'Net Profit') {
      const currentYear = new Date().getFullYear();
      // Income (Paid Invoices)
      const incomeRecords = invoicesList
        .filter(inv => {
          const invDate = inv.createdAt ? new Date(inv.createdAt) : new Date();
          return invDate.getFullYear() === currentYear && inv.status === 'Paid';
        })
        .map((inv, idx) => ({
          name: inv.companyName || (inv.Client && inv.Client.companyName) || 'Unknown Client',
          email: (inv.Client && inv.Client.email) || 'N/A',
          ref: inv.invoiceNumber || inv.id || `INC-${idx + 1}`,
          amount: `+₹${Number(inv.totalAmount || inv.amount || 0).toLocaleString('en-IN')}`,
          status: 'Paid',
          label3: 'Type',
          val3: 'Revenue (' + (getInvoiceDepartment(inv) || 'General') + ')'
        }));

      // Expenses
      const expenseRecords = expensesList.map((exp, idx) => ({
        name: exp.vendor || 'Unknown Vendor',
        email: 'N/A',
        ref: `#EXP-${exp.id ? exp.id.substring(0, 4).toUpperCase() : 'N/A'}`,
        amount: `-₹${Number(exp.amount).toLocaleString('en-IN')}`,
        status: exp.status || 'Paid',
        label3: 'Category',
        val3: `Expense (${exp.category || 'General'})`
      }));

      // Salary Payouts
      const salaryRecords = payrollList.map((p, idx) => {
        const name = p.col2 || p.name || 'Unknown Employee';
        const amtStr = String(p.col4 || p.amount || '0').replace(/[^\d.]/g, '');
        const amt = parseFloat(amtStr) || 0;
        return {
          name,
          email: p.email || 'N/A',
          ref: p.col1 || `#SAL-${p.id ? String(p.id).substring(0, 4).toUpperCase() : 'N/A'}`,
          amount: `-₹${amt.toLocaleString('en-IN')}`,
          status: p.col5 || p.status || 'Processed',
          label3: 'Type',
          val3: 'Salary Payout'
        };
      });

      records = [...incomeRecords, ...expenseRecords, ...salaryRecords];
    } else if (selectedKPI === 'Active Clients') {
      records = clientsList
        .filter(client => {
          const status = String(client.status || '').toLowerCase();
          return !status || status === 'active';
        })
        .map((client, idx) => ({
          name: getClientName(client),
          email: getClientContact(client),
          ref: getClientId(client) || `CLIENT-${idx + 1}`,
          amount: formatCurrency(client.totalBilling || client.monthlyBilling || client.outstandingAmount || 0),
          status: client.status || 'Active',
          label3: 'Client',
          val3: client.department || client.industry || client.serviceType || 'Active'
        }));
    } else if (selectedKPI === 'Pending Collections') {
      const pendingAccounts = financeAccountsList.filter(account => {
        const outstanding = Number(account.totalOutstanding || account.outstanding || account.pendingAmount || 0);
        const status = String(account.status || '').toLowerCase();
        return outstanding > 0 || status === 'pending' || status === 'overdue';
      });

      records = pendingAccounts.length > 0
        ? pendingAccounts.map((account, idx) => {
          const client = clientsList.find(c => String(getClientId(c)) === String(account.clientId));
          return {
            name: account.companyName || getClientName(client || {}),
            email: getClientContact(client || account),
            ref: account.lastInvoiceNumber || account.invoiceNumber || account.id || account._id || `COL-${idx + 1}`,
            amount: formatCurrency(account.totalOutstanding || account.outstanding || account.pendingAmount),
            status: account.status === 'Cleared' ? 'Paid' : account.status || 'Pending',
            label3: 'Pending Invoices',
            val3: account.pendingInvoicesCount || account.invoiceCount || 'Pending'
          };
        })
        : invoicesList
          .filter(inv => String(inv.status || '').toLowerCase() !== 'paid')
          .map((inv, idx) => ({
            name: inv.companyName || inv.Client?.companyName || 'Unknown Client',
            email: inv.Client?.email || inv.contactEmail || 'N/A',
            ref: inv.invoiceNumber || inv.id || inv._id || `INV-${idx + 1}`,
            amount: formatCurrency(inv.totalAmount || inv.amount),
            status: inv.status || 'Pending',
            label3: 'Invoice',
            val3: inv.dueDate ? new Date(inv.dueDate).toLocaleDateString('en-IN') : 'Pending'
          }));
    }

    if (kpiSearchQuery.trim() !== '') {
      const q = kpiSearchQuery.toLowerCase();
      records = records.filter(r =>
        String(r.name || '').toLowerCase().includes(q) ||
        String(r.email || '').toLowerCase().includes(q) ||
        String(r.ref || '').toLowerCase().includes(q) ||
        String(r.val3 || '').toLowerCase().includes(q)
      );
    }
    return records;
  };

  const [invoicesList, setInvoicesList] = useState([]);
  const [expensesList, setExpensesList] = useState([]);
  const [payrollList, setPayrollList] = useState([]);
  const [clientsList, setClientsList] = useState([]);
  const [financeAccountsList, setFinanceAccountsList] = useState([]);

  const [revenueFilter, setRevenueFilter] = useState('This Year');
  const [customDateRange, setCustomDateRange] = useState({ start: '', end: '' });
  const [customMonth, setCustomMonth] = useState('');
  const [customYear, setCustomYear] = useState('');

  const revenueChartData = useMemo(() => {
    let labels = [];
    let data = [];
    
    if (revenueFilter === 'This Year' || revenueFilter === 'Last Year' || revenueFilter === 'Year') {
      labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      data = new Array(12).fill(0);
      let targetYear = new Date().getFullYear();
      if (revenueFilter === 'Last Year') targetYear -= 1;
      if (revenueFilter === 'Year' && customYear) targetYear = parseInt(customYear, 10);
      
      invoicesList.forEach(inv => {
        const d = inv.createdAt ? new Date(inv.createdAt) : new Date();
        if (d.getFullYear() === targetYear && inv.status === 'Paid') {
          data[d.getMonth()] += parseFloat(inv.totalAmount || inv.amount || 0);
        }
      });
    } else if (revenueFilter === 'This Week') {
      labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
      data = new Array(7).fill(0);
      const curr = new Date();
      const first = curr.getDate() - curr.getDay() + 1;
      const firstDay = new Date(curr.setDate(first));
      firstDay.setHours(0,0,0,0);
      const lastDay = new Date(firstDay);
      lastDay.setDate(lastDay.getDate() + 6);
      lastDay.setHours(23,59,59,999);
      
      invoicesList.forEach(inv => {
        const d = inv.createdAt ? new Date(inv.createdAt) : new Date();
        if (inv.status === 'Paid' && d >= firstDay && d <= lastDay) {
          let dayIdx = d.getDay() - 1;
          if (dayIdx === -1) dayIdx = 6;
          data[dayIdx] += parseFloat(inv.totalAmount || inv.amount || 0);
        }
      });
    } else if (revenueFilter === 'Month') {
      const year = customMonth ? parseInt(customMonth.split('-')[0]) : new Date().getFullYear();
      const month = customMonth ? parseInt(customMonth.split('-')[1]) - 1 : new Date().getMonth();
      const daysInMonth = new Date(year, month + 1, 0).getDate();
      labels = Array.from({length: daysInMonth}, (_, i) => `${i + 1}`);
      data = new Array(daysInMonth).fill(0);
      
      invoicesList.forEach(inv => {
        const d = inv.createdAt ? new Date(inv.createdAt) : new Date();
        if (inv.status === 'Paid' && d.getFullYear() === year && d.getMonth() === month) {
          data[d.getDate() - 1] += parseFloat(inv.totalAmount || inv.amount || 0);
        }
      });
    } else if (revenueFilter === 'Custom Date') {
       if (customDateRange.start && customDateRange.end) {
          const start = new Date(customDateRange.start);
          start.setHours(0,0,0,0);
          const end = new Date(customDateRange.end);
          end.setHours(23,59,59,999);
          
          const diffDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
          labels = Array.from({length: diffDays}, (_, i) => {
            const d = new Date(start);
            d.setDate(d.getDate() + i);
            return `${d.getDate()}/${d.getMonth()+1}`;
          });
          data = new Array(diffDays).fill(0);
          
          invoicesList.forEach(inv => {
            const d = inv.createdAt ? new Date(inv.createdAt) : new Date();
            if (inv.status === 'Paid' && d >= start && d <= end) {
              const idx = Math.floor((d - start) / (1000 * 60 * 60 * 24));
              if (idx >= 0 && idx < diffDays) {
                 data[idx] += parseFloat(inv.totalAmount || inv.amount || 0);
              }
            }
          });
       } else {
          labels = ['Select Date Range'];
          data = [0];
       }
    }
    
    return { labels, data };
  }, [revenueFilter, customDateRange, customMonth, customYear, invoicesList]);

  const formatCurrency = (value) => `\u20b9${Number(value || 0).toLocaleString('en-IN')}`;

  const formatCompactCurrency = (value) => {
    const amount = Number(value || 0);
    const sign = amount < 0 ? '-' : '';
    const absAmount = Math.abs(amount);
    if (absAmount >= 100000) return `${sign}\u20b9${(absAmount / 100000).toFixed(1)}L`;
    return `${sign}\u20b9${absAmount.toLocaleString('en-IN')}`;
  };

  const getClientName = (client) => (
    client.companyName ||
    client.name ||
    client.clientName ||
    client.businessName ||
    'Unknown Client'
  );

  const getClientContact = (client) => (
    client.spocEmail ||
    client.email ||
    client.authorizedSignatory?.email ||
    client.contactEmail ||
    client.contactNumber ||
    client.spocContact ||
    'N/A'
  );

  const getClientId = (client) => client._id || client.id || client.clientId;

  const refreshUserInfo = () => {
    const localName = localStorage.getItem('userName');
    const localRole = localStorage.getItem('userType');
    const localPicture = localStorage.getItem('userPicture');
    setUserInfo({
      name: localName || 'Accounts Admin',
      role: localRole || 'Accounts',
      avatar: localPicture || ''
    });
  };

  useEffect(() => {
    refreshUserInfo();
    window.addEventListener('profileUpdate', refreshUserInfo);

    getMyProfile()
      .then(res => {
        if (res && res.success && res.member) {
          const pic = res.member.picture || res.member.avatar || '';
          localStorage.setItem('userPicture', pic);
          if (res.member.name) {
            localStorage.setItem('userName', res.member.name);
          }
          refreshUserInfo();
        }
      })
      .catch(err => console.error('Failed to sync profile on mount:', err));

    return () => window.removeEventListener('profileUpdate', refreshUserInfo);
  }, []);

  // Fetch real finance stats
  const loadStats = async () => {
    try {
      const [financeRes, clientsRes, invoicesRes, expensesRes, payrollRes] = await Promise.allSettled([
        getFinanceClientAccounts(),
        getAllClients(),
        getFinanceInvoices(),
        getFinanceExpenses(),
        getFinanceEmployeesPayroll()
      ]);

      let totalOutstanding = 0, totalCleared = 0, overdueCount = 0;
      if (financeRes.status === 'fulfilled' && financeRes.value?.summary) {
        const s = financeRes.value.summary;
        totalOutstanding = s.totalOutstanding || 0;
        totalCleared = s.totalCleared || 0;
        overdueCount = s.overdueCount || 0;
      }
      if (financeRes.status === 'fulfilled') {
        const accountData = financeRes.value;
        const accounts = accountData?.data?.accounts || accountData?.data || accountData?.accounts || (Array.isArray(accountData) ? accountData : []);
        setFinanceAccountsList(Array.isArray(accounts) ? accounts : []);
      }

      let activeClients = 0;
      if (clientsRes.status === 'fulfilled') {
        const cData = clientsRes.value;
        const clients = cData?.data?.clients || cData?.clients || (Array.isArray(cData?.data) ? cData.data : null) || (Array.isArray(cData) ? cData : []);
        setClientsList(Array.isArray(clients) ? clients : []);
        activeClients = clients.filter(c => (c.status || '').toLowerCase() === 'active').length || clients.length;
      }

      let invoices = [];
      if (invoicesRes.status === 'fulfilled' && invoicesRes.value?.data) {
        invoices = Array.isArray(invoicesRes.value.data) ? invoicesRes.value.data : [];
      }
      setInvoicesList(invoices);

      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();

      let totalMonthlyBilling = 0;
      let totalYearlyRevenue = 0;
      let operationsBilling = 0;
      let recruitmentBilling = 0;
      let salesBilling = 0;

      const revenueByMonth = [0, 0, 0, 0, 0, 0];

      invoices.forEach(inv => {
        const amt = parseFloat(inv.totalAmount || inv.amount || 0);
        const invDate = inv.createdAt ? new Date(inv.createdAt) : new Date();
        const invMonth = invDate.getMonth();
        const invYear = invDate.getFullYear();

        let dept = getInvoiceDepartment(inv);

        if (invYear === currentYear) {
          if (invMonth === currentMonth) {
            totalMonthlyBilling += amt;
          }
          if (inv.status === 'Paid') {
            totalYearlyRevenue += amt;
          }
          if (invMonth >= 0 && invMonth < 6) {
            revenueByMonth[invMonth] += amt;
          }
        }

        dept = normalizeDepartment(dept) || 'Recruitment';
        if (dept === 'Operations') {
          operationsBilling += amt;
        } else if (dept === 'Recruitment') {
          recruitmentBilling += amt;
        } else if (dept === 'Sales') {
          salesBilling += amt;
        }
      });

      let expenses = [];
      if (expensesRes.status === 'fulfilled' && expensesRes.value?.data) {
        expenses = Array.isArray(expensesRes.value.data) ? expensesRes.value.data : [];
      }
      setExpensesList(expenses);

      let officeRentExpenses = 0;
      let marketingExpenses = 0;
      let softwareExpenses = 0;
      let otherExpenses = 0;
      const directExpenseByDept = { Operations: 0, Recruitment: 0, Sales: 0 };
      let commonExpenses = 0;

      expenses.forEach(exp => {
        const amt = parseFloat(exp.amount || 0);
        const category = exp.category || '';
        const expDept = normalizeDepartment(exp.department || exp.dept || exp.serviceDepartment || exp.departmentName);
        if (category === 'Office Rent' || category === 'Electricity' || category === 'Internet') {
          officeRentExpenses += amt;
        } else if (category === 'Marketing') {
          marketingExpenses += amt;
        } else if (category === 'Software Costs' || category === 'Tools') {
          softwareExpenses += amt;
        } else {
          otherExpenses += amt;
        }

        if (expDept) {
          directExpenseByDept[expDept] += amt;
        } else {
          commonExpenses += amt;
        }
      });

      let payroll = [];
      if (payrollRes.status === 'fulfilled' && payrollRes.value?.data) {
        payroll = Array.isArray(payrollRes.value.data) ? payrollRes.value.data : [];
      } else if (payrollRes.status === 'fulfilled' && Array.isArray(payrollRes.value)) {
        payroll = payrollRes.value;
      }
      setPayrollList(payroll);

      let salaryPayout = 0;
      const salaryByDept = { Operations: 0, Recruitment: 0, Sales: 0 };
      payroll.forEach(p => {
        const amtStr = String(p.col4 || p.amount || '0').replace(/[^\d.]/g, '');
        const amt = parseFloat(amtStr) || 0;
        const payrollDept = normalizeDepartment(p.col3 || p.department || p.departmentName);
        salaryPayout += amt;
        if (payrollDept) {
          salaryByDept[payrollDept] += amt;
        } else {
          commonExpenses += amt;
        }
      });

      const totalExpenses = officeRentExpenses + marketingExpenses + softwareExpenses + otherExpenses + salaryPayout;
      const netProfit = totalYearlyRevenue - totalExpenses;
      const revenueByDept = {
        Operations: operationsBilling,
        Recruitment: recruitmentBilling,
        Sales: salesBilling
      };
      const totalDeptRevenue = Object.values(revenueByDept).reduce((sum, val) => sum + val, 0);
      const departmentProfit = Object.keys(revenueByDept).reduce((acc, dept) => {
        const revenueShare = totalDeptRevenue > 0 ? revenueByDept[dept] / totalDeptRevenue : 1 / 3;
        const allocatedCommonExpense = commonExpenses * revenueShare;
        acc[dept] = revenueByDept[dept] - directExpenseByDept[dept] - salaryByDept[dept] - allocatedCommonExpense;
        return acc;
      }, { Operations: 0, Recruitment: 0, Sales: 0 });

      const pendingCollections = totalOutstanding || invoices.filter(i => i.status !== 'Paid').reduce((sum, i) => sum + parseFloat(i.totalAmount || i.amount || 0), 0);

      setFinanceStats({
        totalOutstanding,
        totalCleared,
        activeClients: activeClients,
        overdueCount,
        totalMonthlyBilling: totalMonthlyBilling,
        totalYearlyRevenue: totalYearlyRevenue,
        operationsBilling: operationsBilling,
        recruitmentBilling: recruitmentBilling,
        salesBilling: salesBilling,
        salaryPayout: salaryPayout,
        officeRentExpenses: officeRentExpenses,
        netProfit: netProfit,
        pendingCollections: pendingCollections,
        departmentProfit,
        revenueData: revenueByMonth,
        expenseData: [salaryPayout, officeRentExpenses, marketingExpenses, softwareExpenses + otherExpenses]
      });
    } catch (e) {
      console.warn('Failed to load finance stats:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
    const interval = setInterval(loadStats, 15000);
    return () => clearInterval(interval);
  }, []);

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        const decoded = JSON.parse(atob(token.split('.')[1]));
        const userId = decoded.id || decoded.userId;
        if (userId) {
          const res = await getAllNotifications(userId);
          setNotifications(res?.data || []);
        }
      }
    } catch (e) {
      console.warn("Failed to fetch notifications:", e);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setNotificationsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMarkRead = async (id) => {
    try {
      await markNotificationRead(id);
      setNotifications(prev => prev.map(n => n._id === id || n.id === id ? { ...n, isRead: true, read: true } : n));
    } catch (e) {
      console.error(e);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        const decoded = JSON.parse(atob(token.split('.')[1]));
        const userId = decoded.id || decoded.userId;
        if (userId) {
          await markAllNotificationsRead(userId);
          setNotifications(prev => prev.map(n => ({ ...n, isRead: true, read: true })));
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  const unreadCount = notifications.filter(n => n.status !== 'read' && !n.isRead && !n.read).length;

  const renderNotificationBell = () => {
    return (
      <div className="relative inline-block text-left z-[9999]" ref={notificationRef}>
        <button
          onClick={() => setNotificationsOpen(!notificationsOpen)}
          className="w-11 h-11 flex items-center justify-center rounded-2xl bg-gradient-to-tr from-[#FFFDF9] to-[#FFF9E6] border border-[#F5E6C4] shadow-sm hover:shadow-[0_4px_20px_rgba(212,175,55,0.25)] text-[#D4AF37] hover:scale-105 active:scale-95 transition-all relative outline-none"
          title="Notifications"
        >
          <FiBell className="w-5 h-5 animate-pulse" />
          {unreadCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 min-w-[20px] h-5 px-1.5 bg-[#D4AF37] text-white text-[10px] font-black rounded-full border-2 border-white flex items-center justify-center shadow-sm">
              {unreadCount}
            </span>
          )}
        </button>

        <AnimatePresence>
          {notificationsOpen && (
            <motion.div
              initial={{ opacity: 0, y: 15, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 15, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="absolute right-0 mt-3 w-80 bg-white rounded-[24px] shadow-[0_20px_50px_rgba(0,0,0,0.12)] border border-[#F4F3EF] overflow-hidden z-[99999]"
            >
              <div className="p-4 border-b border-[#F4F3EF] bg-[#FFFDF9] flex items-center justify-between">
                <h3 className="text-[11px] font-black text-[#D4AF37] uppercase tracking-[3px]">Notifications</h3>
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllRead}
                    className="text-[9px] font-black text-[#1B4DA0] uppercase tracking-wider hover:underline bg-transparent border-none p-0 cursor-pointer text-left"
                  >
                    Mark all read
                  </button>
                )}
              </div>
              <div className="max-h-80 overflow-y-auto divide-y divide-[#F4F3EF] custom-scrollbar">
                {notifications.length === 0 ? (
                  <div className="p-8 text-center text-[#9B9BAD]">
                    <FiBell size={32} className="mx-auto mb-3 opacity-20 text-[#D4AF37]" />
                    <p className="text-xs font-bold">No new alerts</p>
                  </div>
                ) : (
                  notifications.map((n, idx) => (
                    <div
                      key={n._id || n.id || idx}
                      onClick={() => handleMarkRead(n._id || n.id)}
                      className={`p-4 hover:bg-[#FFFDF9]/40 cursor-pointer transition-colors text-left ${(!n.isRead && !n.read) ? 'bg-[#FFFDF9]/70' : ''}`}
                    >
                      <p className={`text-[12px] text-[#1A1A2E] leading-tight ${(!n.isRead && !n.read) ? 'font-bold' : 'font-medium'}`}>{n.message}</p>
                      <p className="text-[9px] text-[#9B9BAD] mt-1.5 font-bold uppercase tracking-wider">
                        {n.createdAt ? new Date(n.createdAt).toLocaleDateString() : n.time || 'JUST NOW'}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'Reports & Profitability':
        return <ReportsProfitabilityDashboard notificationBell={renderNotificationBell()} onDataChange={loadStats} />;
      case 'HR Policy':
        return <PolicyTab isReadOnly={true} notificationBell={renderNotificationBell()} />;
      case 'My Profile':
        return <AccountsMyProfileTab onProfileUpdate={refreshUserInfo} />;
      case 'Pending Payments':
        return <AccountsPendingPaymentsTab notificationBell={renderNotificationBell()} onDataChange={loadStats} />;
      case 'Expenses & Vendors':
        return <AccountsExpenseVendorsTab notificationBell={renderNotificationBell()} onDataChange={loadStats} />;
      case 'Billing & Invoices':
        return <AccountsBillingInvoicesTab notificationBell={renderNotificationBell()} onDataChange={loadStats} />;
      case 'Employees & Payroll':
        return <AccountsEmployeesPayrollTab notificationBell={renderNotificationBell()} onDataChange={loadStats} />;
      case 'Clients':
        return <AccountsClientsTab notificationBell={renderNotificationBell()} onDataChange={loadStats} />;
      default:
      case 'Dashboard':
        return (
          <div className="space-y-12">
            {/* Sticky Welcome Header */}
            <div className="sticky top-0 z-[30] bg-[#FDFDFD]/80 backdrop-blur-md -mt-6 -mx-6 px-6 py-6 mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100/50">
              <div className="flex flex-col items-start text-left">
                <h2 className="text-3xl font-bold text-slate-900 mb-1 font-syne">
                  Welcome {userInfo.name.split(' ')[0]}
                </h2>
              </div>
              <div className="flex items-center gap-3">
                {renderNotificationBell()}
              </div>
            </div>

            {/* STATS */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
              <div onClick={() => handleKPIClick('Total Monthly Billing')} className="cursor-pointer hover:scale-[1.02] transition-all">
                <StatCard
                  title="Total Monthly Billing"
                  value={"₹" + Number(financeStats.totalMonthlyBilling).toLocaleString('en-IN')}
                  icon={FaRupeeSign}
                  color="white"
                />
              </div>

              <div onClick={() => handleKPIClick('Total Yearly Revenue')} className="cursor-pointer hover:scale-[1.02] transition-all">
                <StatCard
                  title="Total Yearly Revenue"
                  value={"₹" + Number(financeStats.totalYearlyRevenue).toLocaleString('en-IN')}
                  icon={FiTrendingUp}
                  color="white"
                />
              </div>

              <div onClick={() => handleKPIClick('Operations Billing')} className="cursor-pointer hover:scale-[1.02] transition-all">
                <StatCard
                  title="Operations Billing"
                  value={"₹" + Number(financeStats.operationsBilling).toLocaleString('en-IN')}
                  icon={FiActivity}
                  color="white"
                />
              </div>

              <div onClick={() => handleKPIClick('Recruitment Billing')} className="cursor-pointer hover:scale-[1.02] transition-all">
                <StatCard
                  title="Recruitment Billing"
                  value={"₹" + Number(financeStats.recruitmentBilling).toLocaleString('en-IN')}
                  icon={FiBriefcase}
                  color="white"
                />
              </div>

              <div onClick={() => handleKPIClick('Sales Department Revenue')} className="cursor-pointer hover:scale-[1.02] transition-all">
                <StatCard
                  title="Sales Department Revenue"
                  value={"₹" + Number(financeStats.salesBilling).toLocaleString('en-IN')}
                  icon={FiTarget}
                  color="white"
                />
              </div>

              <div onClick={() => handleKPIClick('Salary Payout')} className="cursor-pointer hover:scale-[1.02] transition-all">
                <StatCard
                  title="Salary Payout"
                  value={"₹" + Number(financeStats.salaryPayout).toLocaleString('en-IN')}
                  icon={FiUsers}
                  color="white"
                />
              </div>

              <div onClick={() => handleKPIClick('Office Rent & Expenses')} className="cursor-pointer hover:scale-[1.02] transition-all">
                <StatCard
                  title="Office Rent & Expenses"
                  value={"₹" + Number(financeStats.officeRentExpenses).toLocaleString('en-IN')}
                  icon={FiHome}
                  color="white"
                />
              </div>

              <div onClick={() => handleKPIClick('Net Profit')} className="cursor-pointer hover:scale-[1.02] transition-all">
                <StatCard
                  title="Net Profit"
                  value={"₹" + Number(financeStats.netProfit).toLocaleString('en-IN')}
                  icon={FiPieChart}
                  color="white"
                />
              </div>
            </div>  

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div 
                onClick={() => handleKPIClick('Pending Collections')} 
                className="bg-white rounded-[32px] p-6 border border-gray-100 shadow-sm cursor-pointer hover:scale-[1.02] transition-all"
              >
                <h3 className="text-lg font-bold text-[#1A1A2E] mb-4">
                  Pending Collections
                </h3>
                <p className="text-4xl font-black text-red-500">
                  {"₹" + Number(financeStats.pendingCollections).toLocaleString('en-IN')}
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  Pending from active clients
                </p>
              </div>

              <div 
                onClick={() => handleKPIClick('Active Clients')} 
                className="bg-white rounded-[32px] p-6 border border-gray-100 shadow-sm cursor-pointer hover:scale-[1.02] transition-all"
              >
                <h3 className="text-lg font-bold text-[#1A1A2E] mb-4">
                  Active Clients
                </h3>
                <p className="text-4xl font-black text-blue-600">
                  {financeStats.activeClients}
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  Currently active companies
                </p>
              </div>

              <div className="bg-white rounded-[32px] p-6 border border-gray-100 shadow-sm">
                <h3 className="text-lg font-bold text-[#1A1A2E] mb-4">
                  Department Wise Profit
                </h3>
                <div className="space-y-3 mt-4">
                  <div 
                    onClick={() => handleKPIClick('Operations Billing')}
                    className="flex justify-between cursor-pointer hover:bg-slate-50 p-1.5 rounded-lg transition-all"
                  >
                    <span className="font-medium">Operations</span>
                    <span className="font-bold text-green-600">
                      {financeStats.operationsBilling >= 100000 
                        ? "₹" + (financeStats.operationsBilling / 100000).toFixed(1) + "L" 
                        : "₹" + Number(financeStats.operationsBilling).toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div 
                    onClick={() => handleKPIClick('Recruitment Billing')}
                    className="flex justify-between cursor-pointer hover:bg-slate-50 p-1.5 rounded-lg transition-all"
                  >
                    <span className="font-medium">Recruitment</span>
                    <span className="font-bold text-blue-600">
                      {financeStats.recruitmentBilling >= 100000 
                        ? "₹" + (financeStats.recruitmentBilling / 100000).toFixed(1) + "L" 
                        : "₹" + Number(financeStats.recruitmentBilling).toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div 
                    onClick={() => handleKPIClick('Sales Department Revenue')}
                    className="flex justify-between cursor-pointer hover:bg-slate-50 p-1.5 rounded-lg transition-all"
                  >
                    <span className="font-medium">Sales</span>
                    <span className="font-bold text-purple-600">
                      {financeStats.salesBilling >= 100000 
                        ? "₹" + (financeStats.salesBilling / 100000).toFixed(1) + "L" 
                        : "₹" + Number(financeStats.salesBilling).toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* CHARTS */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 bg-white rounded-[40px] p-8 border border-gray-100 shadow-sm">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
                  <h3 className="text-xl font-bold text-[#1A1A2E] font-syne">
                    Revenue Graph
                  </h3>
                  <div className="flex flex-wrap items-center gap-3">
                    <AnimatePresence mode="wait">
                      {revenueFilter === 'Custom Date' && (
                        <motion.div initial={{ opacity: 0, width: 0 }} animate={{ opacity: 1, width: 'auto' }} exit={{ opacity: 0, width: 0 }} className="flex gap-2 items-center overflow-hidden">
                          <input type="date" className="bg-gray-50 border border-gray-200 rounded-xl px-3 py-1.5 text-xs font-bold text-gray-600 outline-none focus:border-blue-500 transition-colors" value={customDateRange.start} onChange={(e) => setCustomDateRange({ ...customDateRange, start: e.target.value })} />
                          <span className="text-gray-400 font-bold">-</span>
                          <input type="date" className="bg-gray-50 border border-gray-200 rounded-xl px-3 py-1.5 text-xs font-bold text-gray-600 outline-none focus:border-blue-500 transition-colors" value={customDateRange.end} onChange={(e) => setCustomDateRange({ ...customDateRange, end: e.target.value })} />
                        </motion.div>
                      )}
                      {revenueFilter === 'Month' && (
                        <motion.div initial={{ opacity: 0, width: 0 }} animate={{ opacity: 1, width: 'auto' }} exit={{ opacity: 0, width: 0 }} className="overflow-hidden">
                          <input type="month" className="bg-gray-50 border border-gray-200 rounded-xl px-3 py-1.5 text-xs font-bold text-gray-600 outline-none focus:border-blue-500 transition-colors" value={customMonth} onChange={(e) => setCustomMonth(e.target.value)} />
                        </motion.div>
                      )}
                      {revenueFilter === 'Year' && (
                        <motion.div initial={{ opacity: 0, width: 0 }} animate={{ opacity: 1, width: 'auto' }} exit={{ opacity: 0, width: 0 }} className="overflow-hidden">
                          <input type="number" min="2000" max="2100" placeholder="YYYY" className="bg-gray-50 border border-gray-200 rounded-xl px-3 py-1.5 text-xs font-bold text-gray-600 outline-none w-24 focus:border-blue-500 transition-colors" value={customYear} onChange={(e) => setCustomYear(e.target.value)} />
                        </motion.div>
                      )}
                    </AnimatePresence>
                    <div className="relative">
                      <select 
                        value={revenueFilter}
                        onChange={(e) => setRevenueFilter(e.target.value)}
                        className="bg-gray-50 border border-gray-100 rounded-xl pl-4 pr-8 py-2 text-xs font-bold text-gray-600 outline-none cursor-pointer appearance-none shadow-sm hover:bg-gray-100 transition-colors"
                      >
                        <option value="This Year">This Year</option>
                        <option value="Last Year">Last Year</option>
                        <option value="This Week">This Week</option>
                        <option value="Month">Month</option>
                        <option value="Year">Year</option>
                        <option value="Custom Date">Custom Date</option>
                      </select>
                      <FiChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={14} />
                    </div>
                  </div>
                </div>
                <div className="h-80">
                  <Bar
                    data={{
                      labels: revenueChartData.labels,
                      datasets: [
                        {
                          label: 'Revenue',
                          data: revenueChartData.data,
                          backgroundColor: '#3D37F1',
                          borderRadius: 10
                        }
                      ]
                    }}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: { display: false }
                      }
                    }}
                  />
                </div>
              </div>

              <div className="bg-white rounded-[40px] p-8 border border-gray-100 shadow-sm">
                <h3 className="text-xl font-bold text-[#1A1A2E] mb-8 font-syne">
                  Expense Breakdown
                </h3>
                <div className="h-64">
                  <Doughnut
                    data={{
                      labels: ['Salary', 'Office', 'Marketing', 'Tools'],
                      datasets: [
                        {
                          data: financeStats.expenseData,
                          backgroundColor: [
                            '#3D37F1',
                            '#10B981',
                            '#F59E0B',
                            '#EF4444'
                          ],
                          borderWidth: 0
                        }
                      ]
                    }}
                    options={{
                      maintainAspectRatio: false,
                      plugins: {
                        legend: { position: 'bottom' }
                      }
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
     <AdminLayout
      sidebarItems={sidebarConfig}
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      dashboardTitle="Accounts Dashboard"
      userInfo={userInfo}
      isLoading={loading}
      dashboardTabName={null}
      showBottomTab={false}
      showGlobalHeader={false}
      notifications={notifications}
    >
      {renderContent()}

      {selectedKPI && typeof document !== 'undefined' && createPortal(
        <div 
          className="fixed inset-0 bg-[#1A1A2E]/40 backdrop-blur-md flex items-center justify-center z-[99999] p-4"
          onClick={() => {
            setSelectedKPI(null);
            setKpiSearchQuery('');
          }}
        >
          <div 
            className="bg-white rounded-[32px] w-full max-w-5xl h-[650px] max-h-[85vh] overflow-hidden relative shadow-2xl border border-[#F4F3EF] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-10 py-6 border-b border-[#F4F3EF] bg-gradient-to-r from-white to-[#F8FAFF]">
              <div>
                <h2 className="text-3xl font-bold text-[#1A1A2E]" style={{ fontFamily: "'Syne', sans-serif" }}>
                  {selectedKPI}
                </h2>
                <p className="text-[10px] font-black tracking-[2px] text-blue-600 uppercase mt-1">
                  Live Database Records
                </p>
              </div>

              <div className="flex items-center gap-4">
                <input
                  type="text"
                  value={kpiSearchQuery}
                  onChange={(e) => setKpiSearchQuery(e.target.value)}
                  placeholder="Search records..."
                  className="w-72 h-11 px-4 rounded-xl bg-gray-100 outline-none text-sm font-semibold placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500/20"
                />

                <button
                  onClick={() => {
                    setSelectedKPI(null);
                    setKpiSearchQuery('');
                  }}
                  className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 text-lg font-bold flex items-center justify-center transition-colors"
                >
                  ×
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-auto custom-scrollbar">
              <table className="w-full text-left">
                <thead className="sticky top-0 bg-white/95 backdrop-blur z-10 border-b border-[#F4F3EF] bg-gray-50/50">
                  <tr className="border-b">
                    <th className="p-5 text-[11px] font-bold text-[#94a3b8] uppercase tracking-widest text-left">Name / Payee</th>
                    <th className="p-5 text-[11px] font-bold text-[#94a3b8] uppercase tracking-widest text-left">Contact Info</th>
                    <th className="p-5 text-[11px] font-bold text-[#94a3b8] uppercase tracking-widest text-left">Reference ID</th>
                    <th className="p-5 text-[11px] font-bold text-[#94a3b8] uppercase tracking-widest text-left">Type / Department</th>
                    <th className="p-5 text-[11px] font-bold text-[#94a3b8] uppercase tracking-widest text-left">Amount</th>
                    <th className="p-5 text-[11px] font-bold text-[#94a3b8] uppercase tracking-widest text-left">Status</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-[#F4F3EF]">
                  {getKPIRecords().length === 0 ? (
                    <tr>
                      <td colSpan="6" className="py-20 text-center text-[#9B9BAD] text-xs font-bold uppercase tracking-widest">
                        No records found
                      </td>
                    </tr>
                  ) : (
                    getKPIRecords().map((row, idx) => (
                      <tr key={idx} className="hover:bg-slate-50 transition-colors">
                        <td className="p-5 text-sm font-bold text-[#1A1A2E]">{row.name}</td>
                        <td className="p-5 text-sm text-[#64748B]">{row.email}</td>
                        <td className="p-5 text-sm font-semibold text-[#1A1A2E]">{row.ref}</td>
                        <td className="p-5 text-sm">
                          <span className="px-2.5 py-1 rounded-lg bg-gray-50 text-gray-600 text-[10px] font-black uppercase tracking-widest">
                            {row.val3}
                          </span>
                        </td>
                        <td className="p-5 text-sm font-black text-[#1B4DA0]">{row.amount}</td>
                        <td className="p-5 text-sm">
                          <span className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest
                            ${['Paid', 'Processed', 'Approved'].includes(row.status) ? 'bg-emerald-50 text-emerald-600' : 
                              ['Pending', 'Draft', 'Requested'].includes(row.status) ? 'bg-amber-50 text-amber-600' : 
                              'bg-red-50 text-red-500'}`}
                          >
                            {row.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="border-t border-[#F4F3EF] px-10 py-4 flex justify-between items-center bg-[#FAFAF8]">
              <span className="text-[11px] font-black text-[#9B9BAD] uppercase tracking-widest">
                Showing {getKPIRecords().length} records
              </span>

              <button
                onClick={() => {
                  setSelectedKPI(null);
                  setKpiSearchQuery('');
                }}
                className="px-6 py-2.5 rounded-xl bg-white border border-gray-200 text-xs font-bold uppercase tracking-wider hover:bg-gray-50 transition-colors shadow-sm"
              >
                Close View
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </AdminLayout>
  );
};

export default AccountsDashboard;
