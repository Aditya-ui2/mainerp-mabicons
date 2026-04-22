import { useEffect, useMemo, useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import {
  FiUsers,
  FiUserPlus,
  FiTrendingUp,
  FiTarget,
  FiDollarSign,
  FiRefreshCw,
  FiDownload,
  FiX,
  FiPlus,
  FiSearch,
  FiFilePlus,
  FiChevronDown,
  FiUpload,
  FiMail,
  FiLock,
  FiFileText,
  FiBriefcase,
  FiCalendar,
  FiEdit3,
  FiGrid,
  FiLayout,
  FiLayers,
  FiClipboard,
  FiShare2,
  FiUser,
  FiActivity,
} from 'react-icons/fi';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend, Filler } from 'chart.js';
import AdminLayout, { StatCard, StatsBar, DataTable } from './AdminLayout';
import { getAllClients, getAllLeads, getBDMetrics, clientSignup } from '../service/api';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import ClientPipelineTab from './Tabs/CRM/ClientPipelineTab';
import CRMTeamTab from './Tabs/CRM/CRMTeamTab';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend, Filler);

const sidebarConfig = [
  {
    items: [
      { id: 2, title: 'Client', icon: FiUsers },
      { id: 3, title: 'Client Pipeline', icon: FiActivity },
      { id: 6, title: 'My Team', icon: FiUserPlus },
      { id: 4, title: 'Work Handover', icon: FiShare2 },
      { id: 5, title: 'Report to Client', icon: FiClipboard },
    ]
  },
];

const dashboardStyles = `
  .custom-scrollbar::-webkit-scrollbar {
    width: 6px;
    height: 6px;
  }
  .custom-scrollbar::-webkit-scrollbar-track {
    background: transparent;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb {
    background: #e2e8f0;
    border-radius: 10px;
    transition: all 0.3s;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background: #cbd5e1;
  }
  .custom-scrollbar {
    scrollbar-width: thin;
    scrollbar-color: #e2e8f0 transparent;
  }
`;

const CRMDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [loading, setLoading] = useState(false);
  const [clients, setClients] = useState([]);
  const [leads, setLeads] = useState([]);
  const [metrics, setMetrics] = useState(null);
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    rep: 'All',
    segment: 'All',
  });
  const [userInfo, setUserInfo] = useState({ name: 'User', role: 'CRM' });
  const [submitting, setSubmitting] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [formStep, setFormStep] = useState(1);
  const [clientQuery, setClientQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedClients, setSelectedClients] = useState([]);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [viewClient, setViewClient] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [errors, setErrors] = useState({});
  const [isOfferOpen, setIsOfferOpen] = useState(false);
  const [offerData, setOfferData] = useState({
    candidateName: '',
    candidateEmail: '',
    client: '',
    ctc: '',
    joiningDate: '',
    address: '',
    offerDate: new Date().toISOString().split('T')[0]
  });
  const logoInputRef = useRef(null);

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error('Logo size must be less than 2MB');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewClient(prev => ({ ...prev, logoUrl: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };
  const [newClient, setNewClient] = useState({
    companyName: '',
    corporateAddress: '',
    contactNumber: '',
    gstNumber: '',
    numberOfCompanies: '',
    website: '',
    logoUrl: '',
    spocName: '',
    spocEmail: '',
    spocContact: '',
    authorizedSignatoryName: '',
    authorizedSignatoryEmail: '',
    authorizedSignatoryContact: '',
    ownerName: '',
    ownerEmail: '',
    ownerContact: '',
    category: [],
    documents: [],
  });

  const validateField = (name, value) => {
    let error = '';
    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    switch (name) {
      case 'companyName':
        if (!value?.trim()) error = 'Company Name is required';
        break;
      case 'spocEmail':
      case 'authorizedSignatoryEmail':
      case 'ownerEmail':
        if (value && !emailRe.test(value)) error = 'Invalid email format';
        if (name === 'spocEmail' && !value) error = 'SPOC Email is required';
        break;
      case 'spocName':
        if (!value?.trim()) error = 'SPOC Name is required';
        break;
      case 'gstNumber':
        if (value && !/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(value)) {
          error = 'Invalid GST format';
        }
        break;
      default:
        break;
    }
    setErrors(prev => ({ ...prev, [name]: error }));
    return !error;
  };

  const checkDuplicate = () => {
    const exists = clients.find(c =>
      (c.companyName?.toLowerCase() === newClient.companyName?.toLowerCase()) ||
      (newClient.gstNumber && c.gstNumber === newClient.gstNumber)
    );
    if (exists) {
      toast.error(`Client already exists: ${exists.companyName}`);
      return true;
    }
    return false;
  };

  const nextStep = () => {
    let canProceed = true;
    if (formStep === 1) {
      canProceed = validateField('companyName', newClient.companyName);
    } else if (formStep === 2) {
      canProceed = validateField('spocName', newClient.spocName) && validateField('spocEmail', newClient.spocEmail);
    }
    if (canProceed) setFormStep(prev => prev + 1);
  };

  const prevStep = () => setFormStep(prev => prev - 1);

  const toggleSelection = (id) => {
    setSelectedClients(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const toggleAll = () => {
    if (selectedClients.length > 0 && selectedClients.length === clients.length) {
      setSelectedClients([]);
    } else {
      setSelectedClients(clients.map(c => c._id || c.id));
    }
  };

  const deleteMultipleClients = async (ids) => {
    if (!window.confirm(`Are you sure you want to delete ${ids.length} clients?`)) return;
    toast.success(`Deleted ${ids.length} clients`);
    fetchData();
    setSelectedClients([]);
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded = JSON.parse(atob(token.split('.')[1]));
        setUserInfo({
          name: decoded.name || decoded.email?.split('@')[0] || 'User',
          role: decoded.role || 'CRM',
        });
      } catch (_) { }
    }
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [clientsRes, leadsRes] = await Promise.allSettled([
        getAllClients(),
        getAllLeads(),
      ]);
      const bdMetricsRes = await Promise.allSettled([getBDMetrics()]);

      const clientList = clientsRes.status === 'fulfilled'
        ? (clientsRes.value.data?.clients || clientsRes.value.clients || clientsRes.value || [])
        : [];
      setClients(Array.isArray(clientList) ? clientList : []);

      const leadList = leadsRes.status === 'fulfilled'
        ? (leadsRes.value.data?.leads || leadsRes.value.leads || leadsRes.value || [])
        : [];
      setLeads(Array.isArray(leadList) ? leadList : []);

      const m = bdMetricsRes[0].status === 'fulfilled'
        ? (bdMetricsRes[0].value.data || bdMetricsRes[0].value || null)
        : null;
      setMetrics(m);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const parseDate = (value) => {
    if (!value) return null;
    if (value instanceof Date) return value;
    const d = new Date(value);
    if (!isNaN(d)) return d;
    return null;
  };

  const inRange = (date) => {
    const d = parseDate(date);
    if (!d) return true;
    const s = filters.startDate ? new Date(filters.startDate) : null;
    const e = filters.endDate ? new Date(filters.endDate) : null;
    if (s && d < s) return false;
    if (e && d > e) return false;
    return true;
  };

  const getRepName = (lead) => {
    return lead.owner?.name || lead.bdOwner?.name || lead.assignedTo?.name || lead.owner || lead.bdOwner || lead.assignedTo || 'Unassigned';
  };

  const getSegment = (lead) => {
    return lead.segment || lead.status || 'Unknown';
  };

  const filteredLeads = useMemo(() => {
    return leads.filter(l => {
      const created = l.createdAt || l.created_on || l.date || l.created_at || null;
      if (!inRange(created)) return false;
      if (filters.rep !== 'All' && getRepName(l) !== filters.rep) return false;
      if (filters.segment !== 'All' && getSegment(l) !== filters.segment) return false;
      return true;
    });
  }, [leads, filters]);

  const totalCustomers = clients.length;
  const totalLeads = filteredLeads.length;
  const converted = filteredLeads.filter(l => String(l.status || '').toLowerCase() === 'converted').length;
  const conversionRate = totalLeads ? Math.round((converted / totalLeads) * 100) : 0;
  const pipelineOpen = filteredLeads.filter(l => {
    const s = String(l.status || '').toLowerCase();
    return ['in progress', 'follow up', 'proposal', 'negotiation', 'open', 'new', 'qualified'].includes(s);
  }).length;
  const cac = metrics?.cac || metrics?.customerAcquisitionCost || null;
  const ltv = metrics?.ltv || metrics?.lifetimeValue || null;

  const reps = useMemo(() => {
    const set = new Set(leads.map(getRepName).filter(Boolean));
    return ['All', ...Array.from(set)];
  }, [leads]);

  const segments = useMemo(() => {
    const set = new Set(leads.map(getSegment).filter(Boolean));
    return ['All', ...Array.from(set)];
  }, [leads]);

  const monthlySeries = useMemo(() => {
    const map = new Map();
    filteredLeads.forEach(l => {
      const d = parseDate(l.createdAt || l.created_on || l.date || l.created_at) || new Date();
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      map.set(key, (map.get(key) || 0) + 1);
    });
    const keys = Array.from(map.keys()).sort();
    const values = keys.map(k => map.get(k));
    return { labels: keys, values };
  }, [filteredLeads]);

  const statusCounts = useMemo(() => {
    const map = new Map();
    filteredLeads.forEach(l => {
      const s = l.status || 'Unknown';
      map.set(s, (map.get(s) || 0) + 1);
    });
    const labels = Array.from(map.keys());
    const values = labels.map(l => map.get(l));
    return { labels, values };
  }, [filteredLeads]);

  const repPerf = useMemo(() => {
    const map = new Map();
    filteredLeads.forEach(l => {
      const rep = getRepName(l);
      const isConverted = String(l.status || '').toLowerCase() === 'converted' ? 1 : 0;
      const obj = map.get(rep) || { leads: 0, converted: 0 };
      obj.leads += 1;
      obj.converted += isConverted;
      map.set(rep, obj);
    });
    const labels = Array.from(map.keys());
    const leadsData = labels.map(r => map.get(r).leads);
    const convData = labels.map(r => map.get(r).converted);
    return { labels, leadsData, convData };
  }, [filteredLeads]);

  const pieData = {
    labels: statusCounts.labels,
    datasets: [{
      data: statusCounts.values,
      backgroundColor: ['#10B981', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4', '#94A3B8'],
      borderWidth: 0,
    }]
  };

  const lineData = {
    labels: monthlySeries.labels,
    datasets: [{
      label: 'Leads',
      data: monthlySeries.values,
      borderColor: '#3B82F6',
      backgroundColor: 'rgba(59, 130, 246, 0.1)',
      fill: true,
      tension: 0.35,
    }]
  };

  const barData = {
    labels: repPerf.labels,
    datasets: [
      {
        label: 'Leads',
        data: repPerf.leadsData,
        backgroundColor: 'rgba(99, 102, 241, 0.6)',
      },
      {
        label: 'Converted',
        data: repPerf.convData,
        backgroundColor: 'rgba(16, 185, 129, 0.6)',
      }
    ]
  };

  const statsBarData = [
    { label: 'New Leads', value: String(totalLeads), percentage: totalLeads ? '100%' : '0%', color: 'bg-blue-500' },
    { label: 'Pipeline Open', value: String(pipelineOpen), percentage: totalLeads ? `${Math.round(pipelineOpen / totalLeads * 100)}%` : '0%', color: 'bg-indigo-500' },
    { label: 'Converted', value: String(converted), percentage: totalLeads ? `${Math.round(converted / totalLeads * 100)}%` : '0%', color: 'bg-green-500' },
    { label: 'Conversion Rate', value: `${conversionRate}%`, percentage: `${conversionRate}%`, color: 'bg-purple-500' },
    { label: 'Reps', value: String(Math.max(0, reps.length - 1)), percentage: '100%', color: 'bg-teal-500' },
  ];

  const handleExport = () => {
    const rows = [['Section', 'Name', 'Value']];
    rows.push(['KPI', 'Total Customers', totalCustomers]);
    rows.push(['KPI', 'New Leads', totalLeads]);
    rows.push(['KPI', 'Converted', converted]);
    rows.push(['KPI', 'Conversion Rate', `${conversionRate}%`]);
    rows.push(['KPI', 'Pipeline Open', pipelineOpen]);
    rows.push(['KPI', 'CAC', cac ?? '']);
    rows.push(['KPI', 'LTV', ltv ?? '']);
    statusCounts.labels.forEach((l, i) => rows.push(['Pipeline', l, statusCounts.values[i]]));
    monthlySeries.labels.forEach((l, i) => rows.push(['Trend', l, monthlySeries.values[i]]));
    const csv = rows.map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `crm-dashboard-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const breadcrumbs = [
    { label: 'Home', path: '/' },
    { label: 'CRM', path: '/crm-dashboard' },
    { label: activeTab }
  ];

  const handleClientInput = (e) => {
    const { name, value } = e.target;
    setNewClient(prev => ({ ...prev, [name]: value }));
    validateField(name, value);
  };

  const handleCreateClient = async () => {
    if (checkDuplicate()) return;

    setSubmitting(true);
    try {
      toast.dismiss();
      toast.loading('Onboarding client...');

      const payload = {
        name: newClient.spocName,
        email: newClient.spocEmail,
        companyName: newClient.companyName,
        corporateAddress: newClient.corporateAddress,
        contactNumber: newClient.spocContact || newClient.contactNumber,
        gstNumber: newClient.gstNumber,
        panNumber: newClient.panNumber,
        cinNumber: newClient.cinNumber,
        numberOfCompanies: newClient.numberOfCompanies,
        website: newClient.website || null,
        authorizedSignatory: {
          name: newClient.authorizedSignatoryName,
          email: newClient.authorizedSignatoryEmail,
          contact: newClient.authorizedSignatoryContact,
        },
        ownerDirectorDetails: [
          {
            name: newClient.ownerName,
            email: newClient.ownerEmail,
            contact: newClient.ownerContact,
          }
        ],
        logoUrl: newClient.logoUrl || null,
        category: newClient.category,
      };

      const res = await clientSignup(payload);
      if (res.status === 'success' || res.success) {
        toast.dismiss();
        toast.success('Client onboarded successfully!');

        // Simulate sending credentials to client email
        setTimeout(() => {
          toast.success(`Credentials sent to ${newClient.spocEmail}`, {
            icon: '📧',
            duration: 5000,
          });
        }, 1500);

        setShowSuccess(true);
        fetchData();
      } else {
        throw new Error(res.message || 'Failed to onboard client');
      }
    } catch (err) {
      toast.dismiss();
      toast.error(err.message || 'Error connecting to server');
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AdminLayout
      sidebarItems={sidebarConfig}
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      dashboardTitle="CRM Dashboard"
      breadcrumbs={breadcrumbs}
      userInfo={userInfo}
      showSearch={false}
      showGlobalHeader={false}
      isLoading={loading}
      bottomTabName="My Profile"
    >
      <div style={{ fontFamily: "'Calibri', sans-serif" }}>
        <style>{dashboardStyles}</style>
        <div className="space-y-6 pt-0">
          <AnimatePresence mode="wait">
            {activeTab === 'Client' && (
              <motion.div
                key="client"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.4 }}
                className="space-y-10"
              >
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="text-left">
                    <h1 className="text-3xl font-bold text-[#1A1A2E] tracking-tight" style={{ fontFamily: '"Syne", sans-serif' }}>Client Directory</h1>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="flex items-center gap-2 px-6 py-3 bg-white text-[#0D47A1] border border-[#F4F3EF] rounded-xl text-sm font-bold hover:bg-[#F4F3EF] transition-all shadow-sm active:scale-95">
                      <FiFilePlus size={14} />
                      Bulk Upload
                    </button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => { setFormStep(1); setShowSuccess(false); setIsAddOpen(true); }}
                      className="flex items-center gap-2 px-6 py-3 bg-[#0D47A1] text-white rounded-xl text-sm font-bold hover:bg-[#0a3a82] transition-all shadow-lg shadow-[#0D47A1]/20 active:scale-95"
                    >
                      <FiPlus size={18} />
                      Add New Client
                    </motion.button>
                  </div>
                </div>

                {/* Search Bar */}
                <div className="bg-white rounded-[24px] p-2 border border-[#F4F3EF] shadow-sm flex items-center gap-3 flex-wrap mb-6">
                  <div className="relative flex-1 group min-w-[200px]">
                    <FiSearch className="absolute left-5 top-1/2 -translate-y-1/2 text-[#9B9BAD] transition-colors" size={18} />
                    <input
                      type="text"
                      value={clientQuery}
                      onChange={e => setClientQuery(e.target.value)}
                      placeholder="Search by client name, location, email..."
                      className="w-full bg-[#F4F3EF] border-none rounded-2xl py-3 pl-14 pr-5 text-sm font-medium focus:ring-2 focus:ring-[#F4F3EF] outline-none transition-all placeholder:text-[#9B9BAD]"
                    />
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="bg-[#F4F3EF] text-[10px] font-black uppercase tracking-[2px] text-[#1A1A2E] rounded-xl pl-4 pr-10 py-2.5 outline-none border-0 cursor-pointer appearance-none min-w-[150px]"
                      >
                        <option value="All">All Clients</option>
                        <option value="Active">Active</option>
                        <option value="Inactive">Inactive</option>
                      </select>
                      <FiChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9B9BAD] pointer-events-none" size={14} />
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-[32px] shadow-sm border border-[#F4F3EF] overflow-hidden relative">
                  <div className="overflow-x-auto min-h-[300px]">
                    {/* Grid Header */}
                    <div className="grid grid-cols-[40px_2fr_1.5fr_2fr_100px_40px] gap-4 px-8 py-4 border-b border-[#F4F3EF] bg-transparent">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          checked={clients.length > 0 && selectedClients.length === clients.length}
                          onChange={toggleAll}
                          className="w-4 h-4 rounded border-gray-300 text-[#1B4DA0] focus:ring-[#1B4DA0] cursor-pointer shadow-sm"
                        />
                      </div>
                      {["Company", "GST", "Email", "Contact", ""].map((h, i) => (
                        <div key={i} className="text-[11px] font-bold text-[#94a3b8] uppercase tracking-widest text-left flex items-start">
                          {h}
                        </div>
                      ))}
                    </div>

                    {/* Grid Rows */}
                    {loading ? (
                      <div className="py-24 text-center">
                        <p className="text-[#9B9BAD] text-sm font-bold uppercase tracking-widest">Loading Clients...</p>
                      </div>
                    ) : clients.length === 0 ? (
                      <div className="py-24 text-center">
                        <p className="text-[#9B9BAD] text-sm font-bold uppercase tracking-widest">No Clients found</p>
                      </div>
                    ) : (
                      (clients || []).filter(c => {
                        const rowData = {
                          company: (c.companyName || c.name || '').toLowerCase(),
                          gst: (c.gstNumber || '').toLowerCase(),
                          owner: (c.ownerName || c.owner?.name || '').toLowerCase(),
                          email: (c.email || '').toLowerCase()
                        };
                        const matchesQuery = clientQuery
                          ? Object.values(rowData).some(v => v.includes(clientQuery.toLowerCase()))
                          : true;
                        const matchesStatus = statusFilter === 'All' || c.status === statusFilter;
                        return matchesQuery && matchesStatus;
                      }).map((c) => (
                        <div
                          key={c._id || c.id}
                          onClick={() => { setViewClient(c); setIsViewOpen(true); }}
                          className="grid grid-cols-[40px_2fr_1.5fr_2fr_100px_40px] gap-4 items-center px-8 py-3 border-b border-[#F4F3EF] last:border-0 hover:bg-[#F8FAFF] cursor-pointer transition-all group"
                        >
                          {/* Checkbox */}
                          <div className="flex items-center" onClick={(e) => e.stopPropagation()}>
                            <input
                              type="checkbox"
                              checked={selectedClients.includes(c._id || c.id)}
                              onChange={() => toggleSelection(c._id || c.id)}
                              className="w-4 h-4 rounded border-gray-300 text-[#1B4DA0] focus:ring-[#1B4DA0] cursor-pointer shadow-sm"
                            />
                          </div>

                          {/* Company / Member column */}
                          <div className="flex items-center gap-4 min-w-0 py-1">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-50 to-[#F4F3EF] flex items-center justify-center text-[#1B4DA0] text-sm font-black border border-[#F4F3EF] group-hover:scale-105 transition-transform shrink-0 overflow-hidden">
                              {c.logoUrl ? (
                                <img src={c.logoUrl} alt={c.companyName} className="w-full h-full object-contain" />
                              ) : (
                                <span>{String(c.companyName || 'C').charAt(0).toUpperCase()}</span>
                              )}
                            </div>
                            <p className="text-[14px] font-bold text-[#0f172a] truncate group-hover:text-[#0D47A1] transition-colors text-left uppercase">
                              {c.companyName || c.name}
                            </p>
                          </div>

                          {/* GST / Role */}
                          <div className="text-[13px] font-medium text-[#64748b] truncate py-1 text-left uppercase">
                            {c.gstNumber || '—'}
                          </div>

                          {/* Email */}
                          <div className="text-[13px] font-medium text-[#64748b] truncate py-1 text-left lowercase">
                            {c.email || '—'}
                          </div>

                          {/* Contact Icons */}
                          <div className="flex items-center justify-start gap-2 py-1" onClick={(e) => e.stopPropagation()}>
                            <button className="p-2 bg-[#F4F3EF] text-[#9B9BAD] hover:text-[#1B4DA0] rounded-lg transition-all" title="Email Client">
                              <FiMail size={14} />
                            </button>
                            <button className="p-2 bg-[#F4F3EF] text-[#9B9BAD] hover:text-[#1B4DA0] rounded-lg transition-all" title="Call Client">
                              <FiPhone size={14} />
                            </button>
                          </div>

                          {/* Arrow */}
                          <div className="flex justify-end items-center">
                            <div className="w-8 h-8 rounded-xl bg-transparent group-hover:bg-[#0D47A1]/5 flex items-center justify-center transition-all">
                              <FiChevronRight size={18} className="text-[#C5C5D2] group-hover:text-[#0D47A1] transition-all" />
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Floating Action Bar */}
                  <AnimatePresence>
                    {selectedClients.length > 0 && (
                      <div className="absolute bottom-6 left-0 w-full flex justify-center z-[100] pointer-events-none">
                        <motion.div
                          initial={{ opacity: 0, y: 30, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 30, scale: 0.95 }}
                          className="bg-[#111827] text-white px-5 py-2.5 rounded-[12px] shadow-2xl flex items-center pointer-events-auto"
                        >
                          <div className="flex items-center">
                            <span className="text-[13.5px] font-semibold pr-4 border-r border-[#374151]">
                              {selectedClients.length} clients selected
                            </span>
                            <div className="flex items-center gap-5 pl-4 text-[13px] font-semibold">
                              <button
                                onClick={() => deleteMultipleClients(selectedClients)}
                                className="text-rose-400 hover:text-rose-300 flex items-center gap-2 transition-colors"
                              >
                                <FiTrash2 className="w-4 h-4 stroke-[2.5]" /> Remove
                              </button>
                            </div>
                            <button
                              onClick={() => setSelectedClients([])}
                              className="ml-6 p-1 text-gray-400 hover:text-white hover:bg-white/10 rounded-md transition-all"
                              title="Clear Selection"
                            >
                              <FiX className="w-4 h-4" />
                            </button>
                          </div>
                        </motion.div>
                      </div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            )}

            {/* Other tabs will render placeholders below */}

            {activeTab === 'Dashboard' && (
              <motion.div
                key="dashboard"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.4 }}
                className="space-y-6"
              >
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="text-left">
                    <h1 className="text-3xl font-bold text-[#1A1A2E] tracking-tight" style={{ fontFamily: '"Syne", sans-serif' }}>CRM Dashboard</h1>
                    <p className="text-sm font-medium text-[#9B9BAD] mt-1">Real-time performance metrics</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <button onClick={handleExport} className="px-5 py-2.5 rounded-xl bg-white border border-[#F4F3EF] text-[#0D47A1] text-sm font-bold flex items-center gap-2 hover:bg-gray-50 transition-all shadow-sm">
                      <FiDownload className="w-4 h-4" />
                      Export Report
                    </button>
                  </div>
                </div>

                <StatsBar stats={statsBarData} />

                <div className="bg-white rounded-[32px] p-6 shadow-sm border border-[#F4F3EF]">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div>
                      <p className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-widest mb-2.5">Start Date</p>
                      <input type="date" className="w-full bg-[#F4F3EF] border-0 rounded-2xl px-5 py-3 text-sm font-bold text-[#1A1A2E] outline-none transition-all focus:bg-[#EEF2FB] focus:ring-2 focus:ring-[#0D47A1]/10" value={filters.startDate} onChange={e => setFilters(f => ({ ...f, startDate: e.target.value }))} />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-widest mb-2.5">End Date</p>
                      <input type="date" className="w-full bg-[#F4F3EF] border-0 rounded-2xl px-5 py-3 text-sm font-bold text-[#1A1A2E] outline-none transition-all focus:bg-[#EEF2FB] focus:ring-2 focus:ring-[#0D47A1]/10" value={filters.endDate} onChange={e => setFilters(f => ({ ...f, endDate: e.target.value }))} />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-widest mb-2.5">Sales Rep</p>
                      <select className="w-full bg-[#F4F3EF] border-0 rounded-2xl px-5 py-3 text-sm font-bold text-[#1A1A2E] outline-none transition-all focus:bg-[#EEF2FB] focus:ring-2 focus:ring-[#0D47A1]/10 appearance-none" value={filters.rep} onChange={e => setFilters(f => ({ ...f, rep: e.target.value }))}>
                        {reps.map(r => <option key={r} value={r}>{r}</option>)}
                      </select>
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-widest mb-2.5">Segment</p>
                      <select className="w-full bg-[#F4F3EF] border-0 rounded-2xl px-5 py-3 text-sm font-bold text-[#1A1A2E] outline-none transition-all focus:bg-[#EEF2FB] focus:ring-2 focus:ring-[#0D47A1]/10 appearance-none" value={filters.segment} onChange={e => setFilters(f => ({ ...f, segment: e.target.value }))}>
                        {segments.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-white rounded-[32px] p-8 shadow-sm border border-[#F4F3EF]">
                    <h3 className="text-xl font-bold text-[#1A1A2E] mb-6 tracking-tight" style={{ fontFamily: '"Syne", sans-serif' }}>Sales Trend</h3>
                    <div className="h-80">
                      <Line data={lineData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }} />
                    </div>
                  </div>
                  <div className="bg-white rounded-[32px] p-8 shadow-sm border border-[#F4F3EF]">
                    <h3 className="text-xl font-bold text-[#1A1A2E] mb-6 tracking-tight" style={{ fontFamily: '"Syne", sans-serif' }}>Segmentation</h3>
                    <div className="h-80">
                      <Doughnut data={pieData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { usePointStyle: true, padding: 20, font: { weight: 'bold', size: 10 } } } } }} />
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-[32px] p-8 shadow-sm border border-[#F4F3EF]">
                  <h3 className="text-xl font-bold text-[#1A1A2E] mb-6 tracking-tight" style={{ fontFamily: '"Syne", sans-serif' }}>Team Performance</h3>
                  <div className="h-96">
                    <Bar
                      data={barData}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        scales: { x: { stacked: false, grid: { display: false } }, y: { beginAtZero: true, grid: { color: '#F4F3EF' } } },
                      }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white rounded-[32px] p-8 shadow-sm border border-[#F4F3EF] flex items-center justify-between">
                    <div>
                      <p className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-[2px]">Acquisition Cost</p>
                      <p className="mt-2 text-3xl font-black text-[#1A1A2E]">{cac ? `₹${cac}` : '—'}</p>
                    </div>
                    <div className="w-14 h-14 rounded-2xl bg-rose-50 flex items-center justify-center text-rose-500 shadow-sm shadow-rose-500/10">
                      <FiDollarSign className="w-7 h-7" />
                    </div>
                  </div>
                  <div className="bg-white rounded-[32px] p-8 shadow-sm border border-[#F4F3EF] flex items-center justify-between">
                    <div>
                      <p className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-[2px]">Lifetime Value</p>
                      <p className="mt-2 text-3xl font-black text-[#1A1A2E]">{ltv ? `₹${ltv}` : '—'}</p>
                    </div>
                    <div className="w-14 h-14 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-500 shadow-sm shadow-emerald-500/10">
                      <FiDollarSign className="w-7 h-7" />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'Client Pipeline' && (
              <ClientPipelineTab />
            )}

            {activeTab === 'My Team' && (
              <CRMTeamTab />
            )}

            {activeTab === 'Work Handover' && (
              <motion.div
                key="handover"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="bg-white rounded-[32px] p-12 text-center border border-[#F4F3EF]"
              >
                <div className="w-20 h-20 bg-indigo-50 text-indigo-500 rounded-3xl flex items-center justify-center mx-auto mb-6">
                  <FiShare2 className="w-10 h-10" />
                </div>
                <h3 className="text-2xl font-bold text-[#1A1A2E] tracking-tight" style={{ fontFamily: '"Syne", sans-serif' }}>Work Handover</h3>
                <p className="text-[#9B9BAD] max-w-md mx-auto mt-2">Manage project transitions and handover documentation.</p>
              </motion.div>
            )}

            {activeTab === 'Report to Client' && (
              <motion.div
                key="report_client"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="bg-white rounded-[32px] p-12 text-center border border-[#F4F3EF]"
              >
                <div className="w-20 h-20 bg-teal-50 text-teal-500 rounded-3xl flex items-center justify-center mx-auto mb-6">
                  <FiClipboard className="w-10 h-10" />
                </div>
                <h3 className="text-2xl font-bold text-[#1A1A2E] tracking-tight" style={{ fontFamily: '"Syne", sans-serif' }}>Report to Client</h3>
                <p className="text-[#9B9BAD] max-w-md mx-auto mt-2">Generate and manage performance reports for your clients.</p>
              </motion.div>
            )}

            {activeTab === 'My Profile' && (
              <motion.div
                key="profile"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="bg-white rounded-[32px] p-12 text-center border border-[#F4F3EF]"
              >
                <div className="w-20 h-20 bg-purple-50 text-purple-500 rounded-3xl flex items-center justify-center mx-auto mb-6">
                  <FiUser className="w-10 h-10" />
                </div>
                <h3 className="text-2xl font-bold text-[#1A1A2E] tracking-tight" style={{ fontFamily: '"Syne", sans-serif' }}>My Profile</h3>
                <p className="text-[#9B9BAD] max-w-md mx-auto mt-2">Manage your personal settings and profile information.</p>
              </motion.div>
            )}

            {activeTab === 'Reports' && (
              <motion.div
                key="reports"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="bg-white rounded-[32px] p-12 text-center border border-[#F4F3EF]"
              >
                <div className="w-20 h-20 bg-blue-50 text-blue-500 rounded-3xl flex items-center justify-center mx-auto mb-6">
                  <FiTrendingUp className="w-10 h-10" />
                </div>
                <h3 className="text-2xl font-bold text-[#1A1A2E] tracking-tight" style={{ fontFamily: '"Syne", sans-serif' }}>Advanced Reports</h3>
                <p className="text-[#9B9BAD] max-w-md mx-auto mt-2">Comprehensive CRM analytics and reporting module is being prepared for your account.</p>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
          {isAddOpen && createPortal(
            <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md transition-all duration-300">
                <motion.div
                  initial={{ scale: 0.9, opacity: 0, y: 20 }}
                  animate={{ scale: 1, opacity: 1, y: 0 }}
                  exit={{ scale: 0.95, opacity: 0, y: 10 }}
                  transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                  className="relative w-full max-w-2xl sm:max-w-3xl bg-white rounded-[48px] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
                >
                  {/* Header with Progress */}
                  <div className="sticky top-0 z-20 px-10 py-10 border-b border-[#F4F3EF] bg-white">
                    <div className="flex items-center justify-between mb-10">
                      <div>
                        <h2 className="text-3xl font-black text-[#1A1A2E] tracking-tight" style={{ fontFamily: '"Syne", sans-serif' }}>
                          {showSuccess ? 'Onboarding Complete' : 'Create New Client'}
                        </h2>
                        <p className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-[4px] mt-2">
                          {showSuccess ? 'Detailed Summary' : `Step ${formStep} of 4: ${['Company Info', 'Contacts', 'Preferences', 'Documents'][formStep - 1]}`}
                        </p>
                      </div>
                      {!submitting && (
                        <button 
                          onClick={() => setIsAddOpen(false)} 
                          className="w-14 h-14 rounded-2xl bg-[#F4F3EF] text-[#1A1A2E] hover:bg-rose-50 hover:text-rose-500 transition-all flex items-center justify-center shadow-sm border border-[#E8E7E2]"
                        >
                          <FiX className="w-6 h-6" />
                        </button>
                      )}
                    </div>
                    {!showSuccess && (
                      <div className="flex gap-3 h-2 w-full bg-[#F4F3EF] rounded-full overflow-hidden">
                        {[1, 2, 3, 4].map(s => (
                          <div key={s} className={`flex-1 transition-all duration-700 ease-out ${formStep >= s ? 'bg-[#0D47A1]' : 'bg-transparent'}`} />
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex-1 overflow-y-auto p-12 custom-scrollbar">
                    {showSuccess ? (
                      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-10 text-center py-6">
                        <div className="w-32 h-32 bg-emerald-50 text-emerald-500 rounded-[40px] flex items-center justify-center mx-auto mb-6 shadow-sm border border-emerald-100">
                          <FiTarget className="w-14 h-14" />
                        </div>
                        <div className="space-y-2">
                          <h3 className="text-3xl font-black text-[#1A1A2E] tracking-tight">{newClient.companyName}</h3>
                          <p className="text-sm font-black text-[#9B9BAD] uppercase tracking-[2px]">Successfully onboarded to ecosystem</p>
                        </div>
                        <div className="grid grid-cols-2 gap-6 text-left max-w-lg mx-auto bg-[#FAFAF9] p-10 rounded-[40px] border border-[#F4F3EF] shadow-sm">
                          <div>
                            <p className="text-[9px] font-black text-[#9B9BAD] uppercase tracking-widest mb-1.5 px-1">GST Registry</p>
                            <p className="text-sm font-bold text-[#1A1A2E] bg-white px-4 py-2.5 rounded-xl border border-[#F4F3EF]">{newClient.gstNumber || 'N/A'}</p>
                          </div>
                          <div>
                            <p className="text-[9px] font-black text-[#9B9BAD] uppercase tracking-widest mb-1.5 px-1">Lead SPOC</p>
                            <p className="text-sm font-bold text-[#1A1A2E] bg-white px-4 py-2.5 rounded-xl border border-[#F4F3EF]">{newClient.spocName}</p>
                          </div>
                          <div className="col-span-2">
                            <p className="text-[9px] font-black text-[#9B9BAD] uppercase tracking-widest mb-1.5 px-1">Account Mail</p>
                            <p className="text-sm font-bold text-[#1A1A2E] bg-white px-4 py-2.5 rounded-xl border border-[#F4F3EF]">{newClient.spocEmail}</p>
                          </div>
                          <div className="col-span-2 pt-6 border-t border-[#F4F3EF] mt-2">
                            <div className="flex items-center gap-3 text-emerald-600 mb-2">
                              <FiMail className="w-4 h-4" />
                              <p className="text-[10px] font-black uppercase tracking-[2px]">Credentials Dispatched</p>
                            </div>
                            <p className="text-[11px] text-[#6B6B7E] font-medium leading-relaxed">System access details has been securely dispatched to the SPOC's registered email address.</p>
                          </div>
                        </div>
                        <button
                          onClick={() => { setIsAddOpen(false); setShowSuccess(false); setFormStep(1); }}
                          className="px-14 py-5 bg-[#0D47A1] text-white rounded-2xl text-[11px] font-black uppercase tracking-[3px] shadow-xl shadow-blue-500/20 hover:bg-[#0a3a82] active:scale-95 transition-all"
                        >
                          Access Directory
                        </button>
                      </motion.div>
                    ) : (
                      <form onSubmit={e => e.preventDefault()} className="space-y-12">
                        <AnimatePresence mode="wait">
                          {formStep === 1 && (
                            <motion.div key="s1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-3">
                                  <label className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-[3px] pl-1">Company Name *</label>
                                  <input name="companyName" value={newClient.companyName} onChange={handleClientInput} className={`w-full bg-[#F4F3EF] border-2 border-transparent rounded-[24px] px-8 py-5 text-sm font-bold text-[#1A1A2E] outline-none transition-all focus:border-[#0D47A1]/10 focus:bg-white focus:shadow-inner ${errors.companyName ? 'border-red-500/20 bg-red-50/10' : ''}`} placeholder="e.g. Rominios Pizza" />
                                  {errors.companyName && <p className="text-[10px] text-red-500 font-bold ml-4 uppercase tracking-widest">{errors.companyName}</p>}
                                </div>
                                <div className="space-y-3">
                                  <label className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-[3px] pl-1">GST Number</label>
                                  <input name="gstNumber" value={newClient.gstNumber} onChange={handleClientInput} className={`w-full bg-[#F4F3EF] border-2 border-transparent rounded-[24px] px-8 py-5 text-sm font-bold text-[#1A1A2E] outline-none transition-all focus:border-[#0D47A1]/10 focus:bg-white focus:shadow-inner ${errors.gstNumber ? 'border-red-500/20 bg-red-50/10' : ''}`} placeholder="22AAAAA0000A1Z5" />
                                  {errors.gstNumber && <p className="text-[10px] text-red-500 font-bold ml-4 uppercase tracking-widest">{errors.gstNumber}</p>}
                                </div>
                              </div>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-3">
                                  <label className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-[3px] pl-1">Digital Website</label>
                                  <input name="website" value={newClient.website} onChange={handleClientInput} className="w-full bg-[#F4F3EF] border-2 border-transparent rounded-[24px] px-8 py-5 text-sm font-bold text-[#1A1A2E] outline-none transition-all focus:border-[#0D47A1]/10 focus:bg-white focus:shadow-inner" placeholder="https://..." />
                                </div>
                              </div>
                              <div className="space-y-3">
                                <label className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-[3px] pl-1">HQ Corporate Address</label>
                                <textarea name="corporateAddress" value={newClient.corporateAddress} onChange={handleClientInput} rows={3} className="w-full bg-[#F4F3EF] border-2 border-transparent rounded-[24px] px-8 py-5 text-sm font-bold text-[#1A1A2E] outline-none transition-all focus:border-[#0D47A1]/10 focus:bg-white focus:shadow-inner resize-none min-h-[120px]" placeholder="Enter full physical address..." />
                              </div>
                            </motion.div>
                          )}

                          {formStep === 2 && (
                            <motion.div key="s2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-10">
                              <div className="space-y-8">
                                <h4 className="text-[11px] font-black text-[#0D47A1] uppercase tracking-[4px] pl-1 border-l-4 border-[#0D47A1] leading-none mb-6">Primary Contact Node</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                  <div className="space-y-3">
                                    <label className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-[3px] pl-1">Node Name *</label>
                                    <input name="spocName" value={newClient.spocName} onChange={handleClientInput} className={`w-full bg-[#F4F3EF] border-2 border-transparent rounded-[24px] px-8 py-5 text-sm font-bold text-[#1A1A2E] outline-none transition-all focus:border-[#0D47A1]/10 focus:bg-white focus:shadow-inner ${errors.spocName ? 'border-red-500/20 bg-red-50/10' : ''}`} placeholder="Full Name" />
                                    {errors.spocName && <p className="text-[10px] text-red-500 font-bold ml-4 uppercase tracking-widest">{errors.spocName}</p>}
                                  </div>
                                  <div className="space-y-3">
                                    <label className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-[3px] pl-1">Email Terminal *</label>
                                    <input name="spocEmail" type="email" value={newClient.spocEmail} onChange={handleClientInput} className={`w-full bg-[#F4F3EF] border-2 border-transparent rounded-[24px] px-8 py-5 text-sm font-bold text-[#1A1A2E] outline-none transition-all focus:border-[#0D47A1]/10 focus:bg-white focus:shadow-inner ${errors.spocEmail ? 'border-red-500/20 bg-red-50/10' : ''}`} placeholder="email@example.com" />
                                    {errors.spocEmail && <p className="text-[10px] text-red-500 font-bold ml-4 uppercase tracking-widest">{errors.spocEmail}</p>}
                                  </div>
                                </div>
                              </div>
                              <div className="space-y-8 pt-10 border-t border-[#F4F3EF]">
                                <h4 className="text-[11px] font-black text-[#0D47A1] uppercase tracking-[4px] pl-1 border-l-4 border-[#0D47A1] leading-none mb-6">Commercial Stakeholder</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                  <input name="ownerName" value={newClient.ownerName} onChange={handleClientInput} className="bg-[#F4F3EF] border-2 border-transparent rounded-[24px] px-8 py-5 text-sm font-bold text-[#1A1A2E] outline-none transition-all focus:border-[#0D47A1]/10" placeholder="Owner Name" />
                                  <input name="ownerEmail" value={newClient.ownerEmail} onChange={handleClientInput} className="bg-[#F4F3EF] border-2 border-transparent rounded-[24px] px-8 py-5 text-sm font-bold text-[#1A1A2E] outline-none transition-all focus:border-[#0D47A1]/10" placeholder="Owner Email" />
                                </div>
                              </div>
                            </motion.div>
                          )}

                          {formStep === 3 && (
                            <motion.div key="s3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-10">
                              <div className="space-y-4">
                                <label className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-[3px] pl-1">Brand Assets</label>
                                <div className="flex items-center gap-10 p-10 bg-[#FAFAF9] rounded-[48px] border-2 border-dashed border-[#F4F3EF] group hover:border-[#0D47A1]/20 transition-all">
                                  <div
                                    onClick={() => logoInputRef.current?.click()}
                                    className="w-32 h-32 rounded-[32px] bg-white flex items-center justify-center border-2 border-[#F4F3EF] overflow-hidden group hover:border-[#0D47A1]/40 transition-all cursor-pointer relative shadow-sm"
                                  >
                                    {newClient.logoUrl ? (
                                      <>
                                        <img src={newClient.logoUrl} alt="Logo Preview" className="w-full h-full object-contain p-4 transition-transform group-hover:scale-110" />
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                          <FiRefreshCw className="text-white w-8 h-8 animate-spin-slow" />
                                        </div>
                                      </>
                                    ) : (
                                      <div className="flex flex-col items-center gap-2">
                                        <div className="w-12 h-12 rounded-2xl bg-[#F8FAFF] flex items-center justify-center text-[#9B9BAD] group-hover:text-[#0D47A1] transition-all">
                                          <FiUpload size={24} />
                                        </div>
                                        <span className="text-[8px] font-black text-[#9B9BAD] uppercase tracking-widest">Brand Logo</span>
                                      </div>
                                    )}
                                    <input
                                      type="file"
                                      ref={logoInputRef}
                                      onChange={handleLogoChange}
                                      accept="image/*"
                                      className="hidden"
                                    />
                                  </div>
                                  <div className="flex-1 space-y-3">
                                    <div className="flex items-center justify-between">
                                      <p className="text-lg font-black text-[#1A1A2E] tracking-tight">Identity Canvas</p>
                                      {newClient.logoUrl && (
                                        <button
                                          onClick={() => setNewClient(p => ({ ...p, logoUrl: '' }))}
                                          className="text-[10px] font-black text-rose-500 uppercase tracking-widest hover:bg-rose-50 px-3 py-1.5 rounded-lg transition-all"
                                        >
                                          Reset
                                        </button>
                                      )}
                                    </div>
                                    <p className="text-[10px] text-[#9B9BAD] font-bold uppercase tracking-[2px] leading-relaxed">
                                      Maximum resolution: 2048px.<br />
                                      Formats: Transparent PNG, SVG, JPG.
                                    </p>
                                    {newClient.logoUrl && (
                                      <div className="flex items-center gap-2 text-emerald-600 bg-white px-4 py-2 rounded-xl border border-emerald-100 w-fit">
                                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                        <span className="text-[9px] font-black uppercase tracking-widest">Asset Locked</span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                              <div className="space-y-6">
                                <label className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-[3px] pl-1">Strategic Markets</label>
                                <div className="flex flex-wrap gap-3">
                                  {['Retail', 'Tech', 'Healthcare', 'Finance', 'Logistics', 'Food', 'Auto', 'EdTech'].map(cat => (
                                    <button
                                      key={cat}
                                      type="button"
                                      onClick={() => {
                                        const has = newClient.category.includes(cat);
                                        setNewClient(p => ({ ...p, category: has ? p.category.filter(c => c !== cat) : [...p.category, cat] }));
                                      }}
                                      className={`px-8 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-[3px] border-2 transition-all duration-300 ${newClient.category.includes(cat) ? 'bg-[#0D47A1] border-[#0D47A1] text-white shadow-xl shadow-blue-500/10 -translate-y-1' : 'bg-white border-[#F4F3EF] text-[#9B9BAD] hover:border-[#0D47A1]/20 hover:text-[#1A1A2E]'}`}
                                    >
                                      {cat}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            </motion.div>
                          )}

                          {formStep === 4 && (
                            <motion.div key="s4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-10">
                              <div className="border-2 border-dashed border-[#F4F3EF] rounded-[48px] p-16 text-center space-y-6 hover:border-[#0D47A1]/20 transition-all cursor-pointer bg-[#FAFAF9] group">
                                <div className="w-24 h-24 bg-white rounded-[32px] shadow-sm flex items-center justify-center mx-auto text-[#0D47A1] group-hover:scale-110 transition-transform">
                                  <FiDownload className="w-10 h-10" />
                                </div>
                                <div className="space-y-2">
                                  <p className="text-xl font-black text-[#1A1A2E] tracking-tight">Contractual Repository</p>
                                  <p className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-[3px]">PDF Archive, DOCX up to 15MB</p>
                                </div>
                              </div>
                              <div className="bg-amber-50/50 p-8 rounded-[32px] border border-amber-100 flex gap-6">
                                <div className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center text-amber-500 shadow-sm border border-amber-100/50 shrink-0">
                                  <FiTarget className="w-7 h-7" />
                                </div>
                                <div className="space-y-1 pt-1">
                                  <p className="text-[10px] font-black text-amber-900 uppercase tracking-widest pl-1">Compliance Check</p>
                                  <p className="text-xs font-bold text-amber-800 leading-relaxed opacity-80">Final submission acknowledges that all data adheres to corporate vetting standards.</p>
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>

                        {/* Footer Actions */}
                        <div className="flex gap-6 pt-10 border-t border-[#F4F3EF]">
                          {formStep > 1 ? (
                            <button type="button" onClick={prevStep} className="flex-1 h-16 rounded-[24px] border-2 border-[#F4F3EF] text-[11px] font-black uppercase tracking-[3px] text-[#6B6B7E] hover:bg-[#F4F3EF] transition-all">Previous Phase</button>
                          ) : (
                            <button type="button" onClick={() => setIsAddOpen(false)} className="flex-1 h-16 rounded-[24px] border-2 border-[#F4F3EF] text-[11px] font-black uppercase tracking-[3px] text-[#6B6B7E] hover:bg-[#F4F3EF] transition-all">Abort Action</button>
                          )}

                          <motion.button
                            whileHover={{ scale: 1.02, y: -2 }}
                            whileTap={{ scale: 0.98, y: 0 }}
                            type="button"
                            onClick={formStep < 4 ? nextStep : handleCreateClient}
                            disabled={submitting}
                            className={`flex-[2] h-16 bg-[#0D47A1] text-white rounded-[24px] text-[11px] font-black uppercase tracking-[3px] shadow-2xl shadow-blue-500/30 hover:bg-[#0a3a82] transition-all ${submitting ? 'opacity-40 grayscale pointer-events-none' : ''}`}
                          >
                            {submitting ? 'Synchronizing Node...' : (formStep < 4 ? 'Advance Phase' : 'Commit Onboarding')}
                          </motion.button>
                        </div>
                      </form>
                    )}
                  </div>
                </motion.div>
            </div>,
            document.body
          )}
          </AnimatePresence>

          {/* Generate Offer Modal */}
          <AnimatePresence>
            {isOfferOpen && (
              <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setIsOfferOpen(false)}
                  className="absolute inset-0 bg-[#1A1A2E]/60 backdrop-blur-md"
                />
                <motion.div
                  initial={{ scale: 0.9, opacity: 0, y: 30 }}
                  animate={{ scale: 1, opacity: 1, y: 0 }}
                  exit={{ scale: 0.95, opacity: 0, y: 20 }}
                  className="relative w-full max-w-6xl bg-[#F8FAFF] rounded-[48px] shadow-2xl overflow-hidden flex h-[85vh]"
                >
                  {/* Left: Form */}
                  <div className="w-1/2 p-8 overflow-y-auto bg-white space-y-6 relative" style={{ fontFamily: "'Calibri', sans-serif" }}>
                    {/* Header */}
                    <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
                      <div>
                        <h3 className="text-2xl font-black text-[#1A1A2E] tracking-tight">Generate New Offer</h3>
                        <p className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-[2px] mt-1">Offer Lifecycle Management</p>
                      </div>
                      <button onClick={() => setIsOfferOpen(false)} className="w-12 h-12 rounded-2xl bg-[#F4F3EF] text-[#1A1A2E] hover:bg-red-50 hover:text-red-500 transition-all flex items-center justify-center shadow-sm">
                        <FiX size={20} />
                      </button>
                    </div>

                    <div className="space-y-6">
                      <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-widest">Candidate Name</label>
                          <div className="relative">
                            <FiUserPlus className="absolute left-5 top-1/2 -translate-y-1/2 text-[#9B9BAD]" />
                            <input
                              value={offerData.candidateName}
                              onChange={e => setOfferData(p => ({ ...p, candidateName: e.target.value }))}
                              className="w-full bg-[#F4F3EF] border-0 rounded-2xl pl-12 pr-6 py-4 text-sm font-bold text-[#1A1A2E] outline-none transition-all focus:ring-2 focus:ring-[#0D47A1]/10"
                              placeholder="Search candidate..."
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-widest">Email Address</label>
                          <div className="relative">
                            <FiMail className="absolute left-5 top-1/2 -translate-y-1/2 text-[#9B9BAD]" />
                            <input
                              value={offerData.candidateEmail}
                              onChange={e => setOfferData(p => ({ ...p, candidateEmail: e.target.value }))}
                              className="w-full bg-[#F4F3EF] border-0 rounded-2xl pl-12 pr-6 py-4 text-sm font-bold text-[#1A1A2E] outline-none transition-all focus:ring-2 focus:ring-[#0D47A1]/10"
                              placeholder="email@example.com"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-widest">Hiring Client</label>
                          <div className="relative">
                            <FiBriefcase className="absolute left-5 top-1/2 -translate-y-1/2 text-[#9B9BAD]" />
                            <select
                              value={offerData.client}
                              onChange={e => setOfferData(p => ({ ...p, client: e.target.value }))}
                              className="w-full bg-[#F4F3EF] border-0 rounded-2xl pl-12 pr-10 py-4 text-sm font-bold text-[#1A1A2E] outline-none transition-all appearance-none cursor-pointer"
                            >
                              <option value="">Select Client</option>
                              {clients.map(c => <option key={c.id} value={c.companyName}>{c.companyName}</option>)}
                              <option value="Voltiq Energy">Voltiq Energy</option>
                            </select>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-widest">Proposed CTC (Monthly)</label>
                          <div className="relative">
                            <FiDollarSign className="absolute left-5 top-1/2 -translate-y-1/2 text-[#9B9BAD]" />
                            <input
                              value={offerData.ctc}
                              onChange={e => setOfferData(p => ({ ...p, ctc: e.target.value }))}
                              className="w-full bg-[#F4F3EF] border-0 rounded-2xl pl-12 pr-6 py-4 text-sm font-bold text-[#1A1A2E] outline-none transition-all focus:ring-2 focus:ring-[#0D47A1]/10"
                              placeholder="e.g. 15,000"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-widest">Offer Date</label>
                          <div className="relative">
                            <FiCalendar className="absolute left-5 top-1/2 -translate-y-1/2 text-[#9B9BAD]" />
                            <input
                              type="date"
                              value={offerData.offerDate}
                              onChange={e => setOfferData(p => ({ ...p, offerDate: e.target.value }))}
                              className="w-full bg-[#F4F3EF] border-0 rounded-2xl pl-12 pr-6 py-4 text-sm font-bold text-[#1A1A2E] outline-none"
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-widest">Joining Date</label>
                          <div className="relative">
                            <FiCalendar className="absolute left-5 top-1/2 -translate-y-1/2 text-[#9B9BAD]" />
                            <input
                              type="date"
                              value={offerData.joiningDate}
                              onChange={e => setOfferData(p => ({ ...p, joiningDate: e.target.value }))}
                              className="w-full bg-[#F4F3EF] border-0 rounded-2xl pl-12 pr-6 py-4 text-sm font-bold text-[#1A1A2E] outline-none"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-widest">Permanent Address</label>
                        <textarea
                          value={offerData.address}
                          onChange={e => setOfferData(p => ({ ...p, address: e.target.value }))}
                          rows={3}
                          className="w-full bg-[#F4F3EF] border-0 rounded-2xl px-6 py-4 text-sm font-bold text-[#1A1A2E] outline-none resize-none"
                          placeholder="Naga road, kali mandir, Raxaul..."
                        />
                      </div>

                      <div className="pt-6">
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => {
                            toast.success('Offer Letter generated and sent to ' + offerData.candidateEmail);
                            setIsOfferOpen(false);
                          }}
                          className="w-full py-5 bg-[#0D47A1] text-white rounded-[24px] font-black uppercase tracking-[2px] shadow-xl shadow-blue-500/20 hover:bg-[#0a3a82] transition-all flex items-center justify-center gap-3"
                        >
                          <FiMail size={18} />
                          Generate & Send to Candidate
                        </motion.button>
                      </div>
                    </div>
                  </div>

                  {/* Right: PDF Preview */}
                  <div className="w-1/2 bg-[#525659] p-12 overflow-y-auto flex justify-center">
                    <div className="w-[595px] h-[842px] bg-white shadow-2xl relative p-12 font-serif text-[#1A1A2E] text-[11px] leading-relaxed">
                      {/* Template Header */}
                      <div className="flex justify-between items-start mb-8">
                        <div className="w-32">
                          {offerData.client === 'Voltiq Energy' ? (
                            <div className="space-y-1">
                              <div className="text-[#2E7D32] font-black text-2xl flex items-center gap-1">
                                voltiq <div className="w-4 h-4 bg-[#0D47A1] rounded-full" />
                              </div>
                              <p className="text-[8px] font-bold text-[#9B9BAD] uppercase tracking-widest">Energy Solutions</p>
                            </div>
                          ) : (
                            <div className="w-12 h-12 bg-[#F4F3EF] rounded-xl flex items-center justify-center text-[#9B9BAD] font-bold">Logo</div>
                          )}
                        </div>
                        <div className="text-right text-[8px] text-[#9B9BAD] space-y-0.5">
                          <p className="font-bold text-[#1A1A2E]">{offerData.client || 'Company Name'}</p>
                          <p>GSTIN: 08AABFV3593B1ZM</p>
                          <p>Phone: +91 7300435820</p>
                          <p>Mail: info@voltiqenergy.com</p>
                          <p>ADDRESS: 5th Floor, 89, HNB, New</p>
                          <p>Aatish Market, Mansarovar, Jaipur- 302021</p>
                        </div>
                      </div>

                      <div className="space-y-6">
                        <div>
                          <p className="font-bold">Date: {offerData.offerDate ? new Date(offerData.offerDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : '—'}</p>
                          <p className="font-bold">Mr. {offerData.candidateName || 'Candidate Name'}</p>
                        </div>

                        <div>
                          <p className="font-bold text-[9px] uppercase tracking-widest text-[#9B9BAD]">Permanent address:-</p>
                          <p className="whitespace-pre-line">{offerData.address || '—'}</p>
                        </div>

                        <div className="text-center py-2 border-y border-[#F4F3EF]">
                          <p className="font-bold uppercase tracking-widest">Subject: Appointment Letter – {offerData.client || 'Company'}</p>
                        </div>

                        <p>Dear {offerData.candidateName?.split(' ')[0] || 'Candidate'},</p>

                        <p>
                          Further to the Offer Letter dated {offerData.offerDate ? new Date(offerData.offerDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : '—'}, we are pleased to formally appoint you as "<span className="font-bold text-[#0D47A1]">Sales Partner</span>" with {offerData.client || 'Company'} on a full-time basis. Your date of joining is {offerData.joiningDate ? new Date(offerData.joiningDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : '—'}.
                        </p>

                        <p>
                          You will be on a probation period of 3 (three) months from the date of joining. Upon successful completion of probation, you will be confirmed as a permanent employee. During probation, the Company reserves the right to terminate employment with 7 days' notice or salary in lieu thereof. You will be paid a salary of <span className="font-bold">₹{offerData.ctc || '0'} (Rupees {offerData.ctc ? 'Fifteen Thousand Only' : '—'})</span> per month conditional to the target given by the company.
                        </p>

                        <p>
                          Your reporting time is 9:30 AM daily, with working hours from 9:30 AM to 6:00 PM, Monday to Saturday. You are eligible for 1 casual leave during the period of your probation, with leave applications to be submitted at least one day in advance.
                        </p>

                        <div className="flex justify-between items-end pt-12">
                          <div className="space-y-1">
                            <p className="font-bold border-t border-[#1A1A2E] pt-2">{offerData.candidateName || 'Candidate Name'}</p>
                          </div>
                          <div className="text-right space-y-1">
                            <p className="font-bold text-[#0D47A1]">Kushagra Tandon</p>
                            <p className="text-[9px] font-bold uppercase tracking-widest">Partner</p>
                            <p className="text-[9px] text-[#9B9BAD]">{offerData.client || 'Company'}</p>
                          </div>
                        </div>
                      </div>

                      {/* Template Decoration */}
                      <div className="absolute top-0 right-0 w-32 h-1 bg-[#0D47A1]" />
                      <div className="absolute bottom-0 left-0 w-full h-1 bg-[#1A1A2E]" />
                    </div>
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>

          {/* View Client Modal */}
          <AnimatePresence>
            {isViewOpen && viewClient && (
              <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setIsViewOpen(false)}
                  className="absolute inset-0 bg-[#1A1A2E]/40 backdrop-blur-sm"
                />
                <motion.div
                  initial={{ scale: 0.9, opacity: 0, y: 20 }}
                  animate={{ scale: 1, opacity: 1, y: 0 }}
                  exit={{ scale: 0.95, opacity: 0, y: 10 }}
                  className="relative w-full max-w-2xl bg-white rounded-[40px] shadow-2xl overflow-hidden"
                >
                  <div className="px-10 py-8 border-b border-[#F4F3EF] flex items-center justify-between bg-gradient-to-r from-white to-[#F8FAFF]">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-2xl bg-white border border-[#F4F3EF] flex items-center justify-center overflow-hidden p-2 shadow-sm">
                        {viewClient.logoUrl ? (
                          <img src={viewClient.logoUrl} alt={viewClient.company} className="w-full h-full object-contain" />
                        ) : (
                          <div className="w-full h-full bg-[#0D47A1]/10 flex items-center justify-center text-[#0D47A1] font-bold text-lg">
                            {String(viewClient.company || 'C').charAt(0)}
                          </div>
                        )}
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-[#1A1A2E]">{viewClient.company}</h3>
                        <p className="text-[10px] font-bold text-[#9B9BAD] uppercase tracking-widest mt-0.5">Client Profile</p>
                      </div>
                    </div>
                    <button onClick={() => setIsViewOpen(false)} className="w-10 h-10 rounded-xl bg-[#F4F3EF] text-[#6B6B7E] hover:bg-red-50 hover:text-red-500 transition-all flex items-center justify-center">
                      <FiX />
                    </button>
                  </div>
                  <div className="p-10 grid grid-cols-2 gap-8">
                    <div className="space-y-1">
                      <p className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-widest">GST Number</p>
                      <p className="text-sm font-bold text-[#1A1A2E]">{viewClient.gst || '—'}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-widest">Owner / Director</p>
                      <p className="text-sm font-bold text-[#1A1A2E]">{viewClient.owner || '—'}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-widest">Email Address</p>
                      <p className="text-sm font-bold text-[#1A1A2E] truncate">{viewClient.email || '—'}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-widest">Contact Phone</p>
                      <p className="text-sm font-bold text-[#1A1A2E]">{viewClient.phone || '—'}</p>
                    </div>
                    <div className="col-span-2 pt-4 border-t border-[#F4F3EF]">
                      <div className="flex items-center justify-between bg-[#F8FAFF] p-4 rounded-2xl border border-[#EEF2FB]">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                            <FiMail size={14} />
                          </div>
                          <p className="text-[10px] font-bold text-[#1A1A2E] uppercase tracking-widest">Account Status</p>
                        </div>
                        <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 text-[10px] font-bold uppercase tracking-widest border border-emerald-100">
                          {viewClient.status}
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </AdminLayout>
  );
};

export default CRMDashboard;
