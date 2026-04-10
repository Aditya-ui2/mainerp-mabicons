  import { useEffect, useMemo, useState, useRef } from 'react';
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
  } from 'react-icons/fi';
  import { Line, Bar, Doughnut } from 'react-chartjs-2';
  import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend, Filler } from 'chart.js';
  import AdminLayout, { StatCard, StatsBar, DataTable } from './AdminLayout';
  import { getAllClients, getAllLeads, getBDMetrics, clientSignup } from '../service/api';
  import { toast } from 'react-hot-toast';
  import { motion, AnimatePresence } from 'framer-motion';

  ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend, Filler);

  const sidebarConfig = [
    {
      heading: 'CRM',
      items: [
        { id: 1, title: 'Client', icon: FiUserPlus },
        { id: 2, title: 'Offers', icon: FiFileText },
      ]
    },
  ];

  const CRMDashboard = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('Client');
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

    useEffect(() => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const decoded = JSON.parse(atob(token.split('.')[1]));
          setUserInfo({
            name: decoded.name || decoded.email?.split('@')[0] || 'User',
            role: decoded.role || 'CRM',
          });
        } catch (_) {}
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
      >
        <div className="space-y-10 font-['Plus_Jakarta_Sans'] pt-2 lg:pt-4">
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
                    <h2 className="text-3xl font-bold text-[#1A1A2E]">Client Directory</h2>
                    <p className="text-sm font-medium text-[#9B9BAD] mt-1">
                      <span className="text-[#0D47A1] font-bold">{clients.length}</span> Active Clients in CRM
                    </p>
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

                <div className="bg-white rounded-[32px] p-3 border border-[#F4F3EF] shadow-sm flex items-center gap-4 flex-wrap">
                  <div className="relative flex-1 group min-w-[300px]">
                    <FiSearch className="absolute left-6 top-1/2 -translate-y-1/2 text-[#9B9BAD] group-focus-within:text-[#0D47A1] transition-colors" size={20} />
                    <input
                      type="text"
                      value={clientQuery}
                      onChange={e => setClientQuery(e.target.value)}
                      placeholder="Search clients or location..."
                      className="w-full bg-[#F4F3EF]/50 border-none rounded-[24px] py-4 pl-16 pr-6 text-sm font-medium focus:bg-white focus:ring-2 focus:ring-[#0D47A1]/10 outline-none transition-all placeholder:text-[#9B9BAD]"
                    />
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <select className="bg-[#F4F3EF]/50 text-[10px] font-black uppercase tracking-[2px] text-[#1A1A2E] rounded-2xl pl-6 pr-12 py-4 outline-none border-0 cursor-pointer appearance-none min-w-[160px] hover:bg-white hover:ring-2 hover:ring-[#0D47A1]/10 transition-all">
                        <option>All Clients</option>
                      </select>
                      <FiChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 text-[#9B9BAD] pointer-events-none" size={16} />
                    </div>

                    <div className="relative">
                      <select className="bg-[#F4F3EF]/50 text-[10px] font-black uppercase tracking-[2px] text-[#1A1A2E] rounded-2xl pl-6 pr-12 py-4 outline-none border-0 cursor-pointer appearance-none min-w-[160px] hover:bg-white hover:ring-2 hover:ring-[#0D47A1]/10 transition-all">
                        <option>All Status</option>
                      </select>
                      <FiChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 text-[#9B9BAD] pointer-events-none" size={16} />
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-[40px] p-8 shadow-sm border border-[#F4F3EF]">
                  {(() => {
                    const columns = [
                      { 
                        header: 'Company', 
                        accessor: 'company',
                        render: (row) => (
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-[#F4F3EF] flex items-center justify-center overflow-hidden border border-[#F4F3EF] shrink-0">
                              {row.logoUrl ? (
                                <img src={row.logoUrl} alt={row.company} className="w-full h-full object-contain" />
                              ) : (
                                <div className="w-full h-full bg-[#0D47A1]/10 flex items-center justify-center text-[#0D47A1] font-bold text-xs uppercase">
                                  {String(row.company || 'C').charAt(0)}
                                </div>
                              )}
                            </div>
                            <span className="font-bold text-[#1A1A2E]">{row.company}</span>
                          </div>
                        )
                      },
                      { header: 'GST', accessor: 'gst' },
                      { header: 'Owner', accessor: 'owner' },
                      { header: 'Email', accessor: 'email' },
                      { header: 'Phone', accessor: 'phone' },
                      {
                        header: 'Status',
                        render: (row) => (
                          <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 text-[10px] font-bold uppercase tracking-widest border border-emerald-100">
                            {row.status}
                          </span>
                        )
                      },
                      {
                        header: 'Action',
                        render: (row) => (
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => { setViewClient(row._raw || row); setIsViewOpen(true); }}
                              className="px-3 py-1.5 rounded-xl border border-[#F4F3EF] text-[#1A1A2E] text-xs font-bold hover:bg-[#F8FAFF]"
                            >
                              View
                            </button>
                          </div>
                        )
                      }
                    ];
                    const rows = (clients || []).map(c => ({
                      _raw: c,
                      company: c.companyName || c.name || '—',
                      logoUrl: c.logoUrl || null,
                      gst: c.gstNumber || '—',
                      owner: c.ownerName || c.owner?.name || c.authorizedSignatory?.name || '—',
                      email: c.email || c.ownerEmail || c.authorizedSignatory?.email || '—',
                      phone: c.contactNumber || c.ownerContact || c.authorizedSignatory?.contact || '—',
                      status: c.status || 'Active',
                    })).filter(row =>
                      clientQuery
                        ? Object.values(row).some(v => String(v).toLowerCase().includes(clientQuery.toLowerCase()))
                        : true
                    );
                    return <DataTable columns={columns} data={rows} />;
                  })()}
                </div>
              </motion.div>
            )}

            {activeTab === 'Offers' && (
              <motion.div
                key="offers"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.4 }}
                className="space-y-10"
              >
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="text-left">
                    <h2 className="text-3xl font-bold text-[#1A1A2E]">Offer Management</h2>
                    <p className="text-sm font-medium text-[#9B9BAD] mt-1">Automated offer lifecycle management</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setIsOfferOpen(true)}
                      className="flex items-center gap-2 px-6 py-3 bg-[#0D47A1] text-white rounded-xl text-sm font-bold hover:bg-[#0a3a82] transition-all shadow-lg shadow-[#0D47A1]/20 active:scale-95"
                    >
                      <FiPlus size={18} />
                      Generate Offer
                    </motion.button>
                  </div>
                </div>

                <div className="bg-white rounded-[32px] p-3 border border-[#F4F3EF] shadow-sm flex items-center gap-4 flex-wrap">
                  <div className="relative flex-1 group min-w-[300px]">
                    <FiSearch className="absolute left-6 top-1/2 -translate-y-1/2 text-[#9B9BAD] group-focus-within:text-[#0D47A1] transition-colors" size={20} />
                    <input
                      type="text"
                      placeholder="Search candidate, role, or client..."
                      className="w-full bg-[#F4F3EF]/50 border-none rounded-[24px] py-4 pl-16 pr-6 text-sm font-medium focus:bg-white focus:ring-2 focus:ring-[#0D47A1]/10 outline-none transition-all placeholder:text-[#9B9BAD]"
                    />
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <select className="bg-[#F4F3EF]/50 text-[10px] font-black uppercase tracking-[2px] text-[#1A1A2E] rounded-2xl pl-6 pr-12 py-4 outline-none border-0 cursor-pointer appearance-none min-w-[160px] hover:bg-white hover:ring-2 hover:ring-[#0D47A1]/10 transition-all">
                        <option>All Clients</option>
                      </select>
                      <FiChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 text-[#9B9BAD] pointer-events-none" size={16} />
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-[40px] p-8 shadow-sm border border-[#F4F3EF]">
                  <DataTable 
                    columns={[
                      { header: 'Candidate', accessor: 'name' },
                      { header: 'Client', accessor: 'client' },
                      { header: 'CTC (LPA)', accessor: 'ctc' },
                      { header: 'Status', render: () => <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-[10px] font-bold uppercase tracking-widest border border-blue-100">Sent</span> },
                      { header: 'Date', accessor: 'date' },
                    ]} 
                    data={[
                      { name: 'Priyanshu Sharma', client: 'Voltiq Energy', ctc: '15,000/mo', date: 'March 24, 2026' }
                    ]} 
                  />
                </div>
              </motion.div>
            )}

            {activeTab === 'Overview' && (
              <motion.div
                key="overview"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.4 }}
                className="space-y-10"
              >
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="text-left">
                    <h2 className="text-3xl font-bold text-[#1A1A2E]">CRM Overview</h2>
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

                <div className="bg-white rounded-[32px] p-8 shadow-sm border border-[#F4F3EF]">
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

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="bg-white rounded-[32px] p-8 shadow-sm border border-[#F4F3EF]">
                    <h3 className="text-xl font-bold text-[#1A1A2E] mb-6">Sales Trend</h3>
                    <div className="h-80">
                      <Line data={lineData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }} />
                    </div>
                  </div>
                  <div className="bg-white rounded-[32px] p-8 shadow-sm border border-[#F4F3EF]">
                    <h3 className="text-xl font-bold text-[#1A1A2E] mb-6">Segmentation</h3>
                    <div className="h-80">
                      <Doughnut data={pieData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { usePointStyle: true, padding: 20, font: { weight: 'bold', size: 10 } } } } }} />
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-[32px] p-8 shadow-sm border border-[#F4F3EF]">
                  <h3 className="text-xl font-bold text-[#1A1A2E] mb-6">Team Performance</h3>
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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
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
                <h3 className="text-2xl font-bold text-[#1A1A2E]">Advanced Reports</h3>
                <p className="text-[#9B9BAD] max-w-md mx-auto mt-2">Comprehensive CRM analytics and reporting module is being prepared for your account.</p>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {isAddOpen && (
              <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 md:p-10">
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => { if (!submitting) setIsAddOpen(false); }}
                  className="absolute inset-0 bg-[#1A1A2E]/50 backdrop-blur-md"
                />
                <motion.div
                  initial={{ scale: 0.9, opacity: 0, y: 20 }}
                  animate={{ scale: 1, opacity: 1, y: 0 }}
                  exit={{ scale: 0.95, opacity: 0, y: 10 }}
                  transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                  className="relative w-full max-w-2xl sm:max-w-3xl bg-white rounded-[32px] shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
                >
                  {/* Header with Progress */}
                  <div className="sticky top-0 z-20 px-8 py-6 border-b border-[#F4F3EF] bg-white">
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h2 className="text-2xl font-bold text-[#1A1A2E] font-syne">
                          {showSuccess ? 'Onboarding Complete' : 'Create New Client'}
                        </h2>
                        <p className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-[3px] mt-1">
                          {showSuccess ? 'Detailed Summary' : `Step ${formStep} of 4: ${['Company Info', 'Contacts', 'Preferences', 'Documents'][formStep - 1]}`}
                        </p>
                      </div>
                      {!submitting && (
                        <button onClick={() => setIsAddOpen(false)} className="w-12 h-12 rounded-2xl bg-[#F4F3EF] text-[#6B6B7E] hover:bg-red-50 hover:text-red-500 transition-all flex items-center justify-center shadow-sm">
                          <FiX className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                    {!showSuccess && (
                      <div className="flex gap-2 h-1.5 w-full bg-[#F4F3EF] rounded-full overflow-hidden">
                        {[1, 2, 3, 4].map(s => (
                          <div key={s} className={`flex-1 transition-all duration-500 ${formStep >= s ? 'bg-[#0D47A1]' : 'bg-transparent'}`} />
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex-1 overflow-y-auto p-10 custom-scrollbar">
                    {showSuccess ? (
                      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-8 text-center">
                        <div className="w-24 h-24 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
                          <FiTarget className="w-12 h-12" />
                        </div>
                        <div className="space-y-2">
                          <h3 className="text-2xl font-bold text-[#1A1A2E]">{newClient.companyName}</h3>
                          <p className="text-[#9B9BAD] font-medium">Successfully onboarded to CRM</p>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-left max-w-lg mx-auto bg-[#F4F3EF]/50 p-6 rounded-3xl border border-[#F4F3EF]">
                          <div>
                            <p className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-widest">GST</p>
                            <p className="text-sm font-bold text-[#1A1A2E]">{newClient.gstNumber || 'N/A'}</p>
                          </div>
                          <div>
                            <p className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-widest">SPOC</p>
                            <p className="text-sm font-bold text-[#1A1A2E]">{newClient.spocName}</p>
                          </div>
                          <div className="col-span-2">
                            <p className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-widest">Email</p>
                            <p className="text-sm font-bold text-[#1A1A2E]">{newClient.spocEmail}</p>
                          </div>
                          <div className="col-span-2 pt-4 border-t border-[#F4F3EF]">
                            <div className="flex items-center gap-3 text-emerald-600">
                              <FiMail className="w-4 h-4" />
                              <p className="text-[10px] font-bold uppercase tracking-widest">Login Credentials Sent</p>
                            </div>
                            <p className="text-[11px] text-[#9B9BAD] mt-1">A welcome email with temporary password has been dispatched to {newClient.spocEmail}.</p>
                          </div>
                        </div>
                        <button
                          onClick={() => { setIsAddOpen(false); setShowSuccess(false); setFormStep(1); }}
                          className="px-10 py-4 bg-[#0D47A1] text-white rounded-full text-xs font-bold uppercase tracking-widest"
                        >
                          Back to Directory
                        </button>
                      </motion.div>
                    ) : (
                      <form onSubmit={e => e.preventDefault()} className="space-y-10">
                        <AnimatePresence mode="wait">
                          {formStep === 1 && (
                            <motion.div key="s1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                  <label className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-widest">Company Name *</label>
                                  <input name="companyName" value={newClient.companyName} onChange={handleClientInput} className={`w-full bg-[#F4F3EF] border-0 rounded-2xl px-6 py-4 text-sm font-bold text-[#1A1A2E] outline-none transition-all focus:ring-2 focus:ring-[#0D47A1]/10 ${errors.companyName ? 'ring-2 ring-red-500/20' : ''}`} placeholder="e.g. Rominios Pizza" />
                                  {errors.companyName && <p className="text-[10px] text-red-500 font-bold ml-2 uppercase tracking-tighter">{errors.companyName}</p>}
                                </div>
                                <div className="space-y-2">
                                  <label className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-widest">GST Number</label>
                                  <input name="gstNumber" value={newClient.gstNumber} onChange={handleClientInput} className={`w-full bg-[#F4F3EF] border-0 rounded-2xl px-6 py-4 text-sm font-bold text-[#1A1A2E] outline-none transition-all focus:ring-2 focus:ring-[#0D47A1]/10 ${errors.gstNumber ? 'ring-2 ring-red-500/20' : ''}`} placeholder="22AAAAA0000A1Z5" />
                                  {errors.gstNumber && <p className="text-[10px] text-red-500 font-bold ml-2 uppercase tracking-tighter">{errors.gstNumber}</p>}
                                </div>
                              </div>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                
                                <div className="space-y-2">
                                  <label className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-widest">Website</label>
                                  <input name="website" value={newClient.website} onChange={handleClientInput} className="w-full bg-[#F4F3EF] border-0 rounded-2xl px-6 py-4 text-sm font-bold text-[#1A1A2E] outline-none transition-all focus:ring-2 focus:ring-[#0D47A1]/10" placeholder="https://..." />
                                </div>
                              </div>
                              <div className="space-y-2">
                                <label className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-widest">Corporate Address</label>
                                <textarea name="corporateAddress" value={newClient.corporateAddress} onChange={handleClientInput} rows={3} className="w-full bg-[#F4F3EF] border-0 rounded-2xl px-6 py-4 text-sm font-bold text-[#1A1A2E] outline-none transition-all focus:ring-2 focus:ring-[#0D47A1]/10 resize-none" placeholder="Enter full address..." />
                              </div>
                            </motion.div>
                          )}

                          {formStep === 2 && (
                            <motion.div key="s2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
                              <div className="space-y-6">
                                <h4 className="text-[11px] font-black text-[#0D47A1] uppercase tracking-[2px]">Primary Contact (SPOC)</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                  <div className="space-y-2">
                                    <label className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-widest">Name *</label>
                                    <input name="spocName" value={newClient.spocName} onChange={handleClientInput} className={`w-full bg-[#F4F3EF] border-0 rounded-2xl px-6 py-4 text-sm font-bold text-[#1A1A2E] outline-none transition-all focus:ring-2 focus:ring-[#0D47A1]/10 ${errors.spocName ? 'ring-2 ring-red-500/20' : ''}`} placeholder="Full Name" />
                                    {errors.spocName && <p className="text-[10px] text-red-500 font-bold ml-2 uppercase tracking-tighter">{errors.spocName}</p>}
                                  </div>
                                  <div className="space-y-2">
                                    <label className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-widest">Email *</label>
                                    <input name="spocEmail" type="email" value={newClient.spocEmail} onChange={handleClientInput} className={`w-full bg-[#F4F3EF] border-0 rounded-2xl px-6 py-4 text-sm font-bold text-[#1A1A2E] outline-none transition-all focus:ring-2 focus:ring-[#0D47A1]/10 ${errors.spocEmail ? 'ring-2 ring-red-500/20' : ''}`} placeholder="email@example.com" />
                                    {errors.spocEmail && <p className="text-[10px] text-red-500 font-bold ml-2 uppercase tracking-tighter">{errors.spocEmail}</p>}
                                  </div>
                                </div>
                              </div>
                              <div className="space-y-6 pt-8 border-t border-[#F4F3EF]">
                                <h4 className="text-[11px] font-black text-[#0D47A1] uppercase tracking-[2px]">Business Owner</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                  <input name="ownerName" value={newClient.ownerName} onChange={handleClientInput} className="bg-[#F4F3EF] border-0 rounded-2xl px-6 py-4 text-sm font-bold text-[#1A1A2E] outline-none transition-all" placeholder="Owner Name" />
                                  <input name="ownerEmail" value={newClient.ownerEmail} onChange={handleClientInput} className="bg-[#F4F3EF] border-0 rounded-2xl px-6 py-4 text-sm font-bold text-[#1A1A2E] outline-none transition-all" placeholder="Owner Email" />
                                </div>
                              </div>
                            </motion.div>
                          )}

                          {formStep === 3 && (
                            <motion.div key="s3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
                              <div className="space-y-4">
                                <label className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-widest">Company Logo</label>
                                <div className="flex items-center gap-6 p-6 bg-[#F4F3EF]/50 rounded-[32px] border border-[#F4F3EF]">
                                  <div 
                                    onClick={() => logoInputRef.current?.click()}
                                    className="w-24 h-24 rounded-2xl bg-white flex items-center justify-center border-2 border-dashed border-[#F4F3EF] overflow-hidden group hover:border-[#0D47A1]/40 transition-all cursor-pointer relative"
                                  >
                                    {newClient.logoUrl ? (
                                      <>
                                        <img src={newClient.logoUrl} alt="Logo Preview" className="w-full h-full object-contain p-2" />
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                          <FiRefreshCw className="text-white w-6 h-6 animate-spin-slow" />
                                        </div>
                                      </>
                                    ) : (
                                      <div className="flex flex-col items-center gap-1">
                                        <FiUpload className="w-8 h-8 text-[#9B9BAD] group-hover:text-[#0D47A1] transition-colors" />
                                        <span className="text-[8px] font-bold text-[#9B9BAD] uppercase">Upload</span>
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
                                  <div className="flex-1 space-y-2">
                                    <div className="flex items-center justify-between">
                                      <p className="text-sm font-bold text-[#1A1A2E]">Company Identity</p>
                                      {newClient.logoUrl && (
                                        <button 
                                          onClick={() => setNewClient(p => ({ ...p, logoUrl: '' }))}
                                          className="text-[10px] font-bold text-rose-500 uppercase tracking-widest hover:underline"
                                        >
                                          Remove
                                        </button>
                                      )}
                                    </div>
                                    <p className="text-[10px] text-[#9B9BAD] font-bold uppercase tracking-widest leading-relaxed">
                                      Click the box to upload your logo.<br/>
                                      Supports PNG, JPG (Max 2MB)
                                    </p>
                                    {newClient.logoUrl && (
                                      <div className="flex items-center gap-2 text-emerald-600">
                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                        <span className="text-[10px] font-bold uppercase">Logo Selected</span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                              <div className="space-y-4">
                                <label className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-widest">Industry Categories</label>
                                <div className="flex flex-wrap gap-2">
                                  {['Retail', 'Tech', 'Healthcare', 'Finance', 'Logistics', 'Food'].map(cat => (
                                    <button
                                      key={cat}
                                      type="button"
                                      onClick={() => {
                                        const has = newClient.category.includes(cat);
                                        setNewClient(p => ({ ...p, category: has ? p.category.filter(c => c !== cat) : [...p.category, cat] }));
                                      }}
                                      className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all ${newClient.category.includes(cat) ? 'bg-[#0D47A1] border-[#0D47A1] text-white shadow-md' : 'bg-white border-[#F4F3EF] text-[#9B9BAD]'}`}
                                    >
                                      {cat}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            </motion.div>
                          )}

                          {formStep === 4 && (
                            <motion.div key="s4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
                              <div className="border-2 border-dashed border-[#F4F3EF] rounded-[32px] p-12 text-center space-y-4 hover:border-[#0D47A1]/20 transition-all cursor-pointer bg-[#F8FAFF]/50">
                                <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center mx-auto text-[#0D47A1]">
                                  <FiDownload className="w-8 h-8" />
                                </div>
                                <div>
                                  <p className="text-sm font-bold text-[#1A1A2E]">Upload Contracts & Agreements</p>
                                  <p className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-widest mt-1">PDF, DOC up to 10MB</p>
                                </div>
                              </div>
                              <div className="bg-amber-50 p-6 rounded-3xl border border-amber-100 flex gap-4">
                                <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-amber-500 shrink-0">
                                  <FiTarget className="w-5 h-5" />
                                </div>
                                <p className="text-xs font-medium text-amber-800 leading-relaxed">By submitting, you agree that the client information is accurate and matches the provided documents.</p>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>

                        {/* Footer Actions */}
                        <div className="flex gap-4 pt-10 border-t border-[#F4F3EF]">
                          {formStep > 1 ? (
                            <button type="button" onClick={prevStep} className="flex-1 py-5 rounded-3xl border-2 border-[#F4F3EF] text-sm font-bold text-[#6B6B7E] hover:bg-[#F4F3EF] transition-all">Back</button>
                          ) : (
                            <button type="button" onClick={() => setIsAddOpen(false)} className="flex-1 py-5 rounded-3xl border-2 border-[#F4F3EF] text-sm font-bold text-[#6B6B7E] hover:bg-[#F4F3EF] transition-all">Cancel</button>
                          )}
                          
                          {formStep < 4 ? (
                            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} type="button" onClick={nextStep} className="flex-[2] py-5 bg-[#0D47A1] text-white rounded-full text-[11px] font-bold uppercase tracking-widest shadow-lg shadow-blue-500/20 hover:bg-[#0a3a82]">Next Step</motion.button>
                          ) : (
                            <motion.button
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              type="button"
                              onClick={handleCreateClient}
                              disabled={submitting}
                              className={`flex-[2] py-5 bg-[#0D47A1] text-white rounded-full text-[11px] font-bold uppercase tracking-widest shadow-lg shadow-blue-500/20 hover:bg-[#0a3a82] ${submitting ? 'opacity-40 grayscale' : ''}`}
                            >
                              {submitting ? 'Processing...' : 'Onboard Client'}
                            </motion.button>
                          )}
                        </div>
                      </form>
                    )}
                  </div>
                </motion.div>
              </div>
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
                  <div className="w-1/2 p-12 overflow-y-auto bg-white">
                    <div className="flex items-center justify-between mb-10">
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
      </AdminLayout>
    );
  };

  export default CRMDashboard;
