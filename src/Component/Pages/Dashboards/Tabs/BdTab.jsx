import { useState, useEffect } from 'react';
import {
  Card,
  CardBody,
  Typography,
  List,
  ListItem,
  ListItemPrefix,
  Progress,
  IconButton,
  Tooltip,
  Tabs,
  TabsHeader,
  Tab,
  Divider,
  Avatar,
  Badge,
  Button,
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
  Input,
  Select,
  Option
} from "@material-tailwind/react";
import { FiPlus, FiEdit2, FiTrash2 } from 'react-icons/fi';
import { createBDExecutive, getAllBDExecutives, getAllLeads, getClosedDeals, getPendingAgreements, getUpcomingActivities, getBDMetrics } from '../../service/api';
import { motion } from 'framer-motion';
import {
  UserIcon,
  ChartBarIcon,
  BriefcaseIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  CalendarIcon,
  PhoneIcon,
  EnvelopeIcon,
  CheckCircleIcon,
  ClockIcon,
  ExclamationCircleIcon,
  XMarkIcon,
  StarIcon,
  TrashIcon
} from "@heroicons/react/24/solid";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

// Lead status definitions
const leadStatuses = {
  prospecting: {
    label: "Prospecting",
    color: "bg-blue-50 text-blue-600",
    badge: "bg-blue-100",
  },
  Discussion_pending: {
    label: "Discussion Pending",
    color: "bg-green-50 text-green-600",
    badge: "bg-green-100",
  },
  negotiation: {
    label: "Negotiation",
    color: "bg-blue-50 text-blue-600",
    badge: "bg-blue-100",
  },
  proposal: {
    label: "Proposal Sent",
    color: "bg-green-50 text-green-600",
    badge: "bg-green-100",
  },
  closedWon: {
    label: "Closed Won",
    color: "bg-blue-50 text-blue-600",
    badge: "bg-blue-100",
  },
  closedLost: {
    label: "Closed Lost",
    color: "bg-red-50 text-red-600",
    badge: "bg-red-100",
  },
  onHold: {
    label: "On Hold",
    color: "bg-amber-50 text-amber-600",
    badge: "bg-amber-100",
  },
  followUp: {
    label: "Follow Up",
    color: "bg-green-50 text-green-600",
    badge: "bg-green-100",
  },
  Meeting_Done: {
    label: "Meeting Done",
    color: "bg-blue-50 text-blue-600",
    badge: "bg-blue-100",
  },
  Meeting_Scheduled: {
    label: "Meeting Scheduled",
    color: "bg-green-50 text-green-600",
    badge: "bg-green-100",
  },
  Agreement_Inprocess: {
    label: "Agreement Inprocess",
    color: "bg-blue-50 text-blue-600",
    badge: "bg-blue-100",
  },
  Software_Demo: {
    label: "Software Demo",
    color: "bg-green-50 text-green-600",
    badge: "bg-green-100",
  },
};

const BdTab = () => {
  // State for data
  const [bdTeamMembers, setBdTeamMembers] = useState([]);
  const [leads, setLeads] = useState([]);
  const [closedDeals, setClosedDeals] = useState([]);
  const [pendingAgreements, setPendingAgreements] = useState([]);
  const [upcomingActivities, setUpcomingActivities] = useState([]);
  const [metrics, setMetrics] = useState({
    totalLeads: { value: '0', change: 0, icon: UserIcon, description: 'Total Leads This Quarter' },
    activeDeals: { value: '0', change: 0, icon: BriefcaseIcon, description: 'Active Deals' },
    closedDeals: { value: '0', change: 0, icon: CheckCircleIcon, description: 'Deals Closed This Month' },
    conversion: { value: '0%', change: 0, icon: ChartBarIcon, description: 'Conversion Rate' }
  });

  // State for modals and UI
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [memberToDelete, setMemberToDelete] = useState(null);
  const [activeTeamTab, setActiveTeamTab] = useState('performance');

  // Form data state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    targetRevenue: '',
    targetLeads: ''
  });

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [
        bdExecutivesResponse,
        leadsResponse,
        closedDealsResponse,
        pendingAgreementsResponse,
        upcomingActivitiesResponse,
        metricsResponse
      ] = await Promise.all([
        getAllBDExecutives(),
        getAllLeads(),
        getClosedDeals(),
        getPendingAgreements(),
        getUpcomingActivities(),
        getBDMetrics()
      ]);

      setBdTeamMembers(bdExecutivesResponse.data);
      setLeads(leadsResponse.data);
      setClosedDeals(closedDealsResponse.data);
      setPendingAgreements(pendingAgreementsResponse.data);
      setUpcomingActivities(upcomingActivitiesResponse.data);
      setMetrics(metricsResponse.data);
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    let processedValue = value;
    if (name === 'phone') {
      processedValue = value.replace(/\D/g, '').slice(0, 10);
    }
    setFormData(prev => ({
      ...prev,
      [name]: processedValue
    }));
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await createBDExecutive(formData);
      setIsModalOpen(false);
      fetchAllData(); // Refresh the list
      setFormData({
        name: '',
        email: '',
        password: '',
        phone: '',
        targetRevenue: '',
        targetLeads: ''
      });
    } catch (error) {
      setError(error.message || 'Failed to create BD executive');
    } finally {
      setLoading(false);
    }
  };

  // Delete handler
  const handleDeleteMember = () => {
    if (memberToDelete) {
      // Filter out the member to delete
      const updatedMembers = bdTeamMembers.filter(member => member.id !== memberToDelete.id);
      setBdTeamMembers(updatedMembers);
      setDeleteConfirmOpen(false);
      setMemberToDelete(null);
    }
  };

  // Get performance color based on member's performance level
  const getPerformanceColor = (performance) => {
    switch(performance) {
      case 'high': return 'text-green-500';
      case 'medium': return 'text-blue-500';
      case 'low': return 'text-orange-500';
      default: return 'text-gray-500';
    }
  };

  // Get trend icon based on member's trend
  const getTrendIcon = (trend) => {
    if (trend === 'up') {
      return <ArrowUpIcon className="h-4 w-4 text-green-500" />;
    } else {
      return <ArrowDownIcon className="h-4 w-4 text-red-500" />;
    }
  };

  // View Components
  const [topDeals] = useState([
    { id: 1, name: 'Enterprise Solutions Inc.', value: '$245,000', status: 'Negotiation', contact: 'Sarah Johnson', avatar: 'ES', color: 'blue', progress: 75, daysLeft: 14 },
    { id: 2, name: 'Global Tech Partners', value: '$180,000', status: 'Proposal', contact: 'Michael Chen', avatar: 'GT', color: 'purple', progress: 45, daysLeft: 21 },
    { id: 3, name: 'Innovate Systems Ltd.', value: '$135,000', status: 'Discovery', contact: 'Alex Rodriguez', avatar: 'IS', color: 'green', progress: 25, daysLeft: 30 },
    { id: 4, name: 'Strategic Services Group', value: '$120,000', status: 'Closing', contact: 'Emma Wilson', avatar: 'SS', color: 'amber', progress: 90, daysLeft: 7 },
  ]);

  const getStatusIcon = (status) => {
    switch(status) {
      case 'Negotiation': return <ExclamationCircleIcon className="h-4 w-4 text-amber-500" />;
      case 'Proposal': return <ClockIcon className="h-4 w-4 text-blue-500" />;
      case 'Discovery': return <ClockIcon className="h-4 w-4 text-purple-500" />;
      case 'Closing': return <CheckCircleIcon className="h-4 w-4 text-green-500" />;
      default: return <ClockIcon className="h-4 w-4 text-gray-500" />;
    }
  };

  const getActivityIcon = (type) => {
    switch(type) {
      case 'Meeting': return <CalendarIcon className="h-5 w-5 text-blue-500" />;
      case 'Call': return <PhoneIcon className="h-5 w-5 text-green-500" />;
      case 'Deadline': return <ClockIcon className="h-5 w-5 text-red-500" />;
      case 'Email': return <EnvelopeIcon className="h-5 w-5 text-purple-500" />;
      default: return <CalendarIcon className="h-5 w-5 text-gray-500" />;
    }
  };

  // Add mock data for chart
  const generateChartData = () => {
    const dates = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    return dates.map(date => ({
      name: date,
      leads: Math.floor(Math.random() * 20) + 5,
      meetings: Math.floor(Math.random() * 10) + 2,
      revenue: Math.floor(Math.random() * 50000) + 10000,
    }));
  };

  const [chartData, setChartData] = useState(generateChartData());

  // Add function to handle member selection with chart data
  const handleMemberSelect = (member) => {
    setSelectedMember(member);
    setDetailViewOpen(true);
    setChartData(generateChartData()); // In real app, fetch actual data
    setDateMetrics({
      leads: [
        { date: '2024-01-01', count: 12 },
        { date: '2024-01-02', count: 15 },
        { date: '2024-01-03', count: 8 },
      ],
      meetings: [
        { date: '2024-01-01', count: 4 },
        { date: '2024-01-02', count: 6 },
        { date: '2024-01-03', count: 3 },
      ],
      revenue: [
        { date: '2024-01-01', amount: 25000 },
        { date: '2024-01-02', amount: 35000 },
        { date: '2024-01-03', amount: 15000 },
      ]
    });
  };

  const handleDateChange = (date) => {
    setSelectedDate(date);
    // In a real app, you would fetch new metrics for the selected date
  };

  return (
    <div className="p-6 bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-blue-900/10 min-h-screen">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <Typography variant="h3" className="font-bold text-gray-800 dark:text-gray-100">
              Business Development Dashboard
            </Typography>
            <Typography variant="paragraph" className="mt-1 text-blue-gray-500 dark:text-blue-gray-300">
              Overview of your sales pipeline and business metrics
            </Typography>
          </div>
          <div className="mt-4 md:mt-0 flex gap-2">
          
            <IconButton variant="outlined" className="rounded-full dark:border-gray-700 dark:text-gray-300">
              <EnvelopeIcon className="h-4 w-4" />
            </IconButton>
            <IconButton variant="outlined" className="rounded-full dark:border-gray-700 dark:text-gray-300">
              <CalendarIcon className="h-4 w-4" />
            </IconButton>
            <IconButton variant="filled" color="blue" className="rounded-full">
              <UserIcon className="h-4 w-4" />
            </IconButton>
          </div>
        </div>
      
      {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Object.entries(metrics).map(([key, data]) => (
            <Card key={key} className="overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl">
              <CardBody className="p-6">
                <div className="flex items-center gap-4">
                  <div className={`rounded-xl p-3 ${data.change > 0 ? 'bg-green-500 text-white' : 'bg-blue-500 text-white'}`}>
                    <data.icon className="h-6 w-6" />
                  </div>
                  <div className="flex-grow">
                    <Typography variant="small" className="font-medium mb-1 text-blue-gray-600 dark:text-blue-gray-300">
                      {data.description}
                    </Typography>
                    <Typography variant="h4" className="font-bold bg-gradient-to-r from-gray-900 to-blue-900 dark:from-white dark:to-blue-200 bg-clip-text text-transparent">
                      {data.value}
                    </Typography>
                    <div className={`flex items-center text-xs font-medium mt-2 ${data.change > 0 ? 'text-green-500 dark:text-green-400' : 'text-red-500 dark:text-red-400'}`}>
                      {data.change > 0 ? 
                        <ArrowUpIcon className="h-3 w-3 mr-1" /> : 
                        <ArrowDownIcon className="h-3 w-3 mr-1" />
                      }
                      <span className="font-semibold">{Math.abs(data.change)}%</span>
                      <span className="ml-1 text-blue-gray-500 dark:text-blue-gray-400">from last quarter</span>
                    </div>
                  </div>
                </div>
              </CardBody>
            </Card>
        ))}
      </div>

        {/* Lead Status Counters */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
          {Object.entries(leadStatuses).map(([key, status], index) => (
            <Card key={key} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl">
              <CardBody className="p-4">
                <div className={`flex flex-col h-24 justify-between ${status.color} rounded-xl p-4 transition-all duration-300 hover:scale-[1.02] border ${status.color.includes('blue') ? 'border-blue-200' : status.color.includes('green') ? 'border-green-200' : status.color.includes('red') ? 'border-red-200' : 'border-amber-200'}`}>
                  <div className="flex justify-between items-start">
                    <Typography variant="small" className="font-medium">
                      {status.label}
                    </Typography>
                    <div className={`${status.badge} p-2 rounded-full shadow-sm`}>
                      <ChartBarIcon className={`h-5 w-5 ${status.color.split(' ')[1]}`} />
                    </div>
                  </div>
                  <Typography variant="h4" className={`font-bold mt-2 ${status.color.includes('blue') ? 'text-blue-600' : status.color.includes('green') ? 'text-green-600' : status.color.includes('red') ? 'text-red-600' : 'text-amber-600'}`}>
                    {bdTeamMembers.filter(member => member.status === key).length}
                  </Typography>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Top Deals */}
          <Card className="col-span-1 lg:col-span-2 border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl">
          <CardBody>
              <div className="flex justify-between items-center mb-6">
                <Typography variant="h5" className="font-semibold bg-gradient-to-r from-gray-900 to-blue-900 dark:from-white dark:to-blue-200 bg-clip-text text-transparent">
                  Deals Closed This Month
              </Typography>
                <Badge content="New" className="bg-green-500">
                <IconButton variant="text" size="sm">
                    <CheckCircleIcon className="h-5 w-5 text-green-500" />
                </IconButton>
                </Badge>
              </div>
              {closedDeals.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-max table-auto text-left">
                    <thead>
                      <tr>
                        <th className="border-b border-blue-gray-100 bg-gradient-to-r from-gray-50 to-blue-50 dark:from-gray-800 dark:to-blue-900/20 p-4 transition-colors">
                          <Typography variant="small" color="blue-gray" className="font-semibold leading-none opacity-70">
                            Company
                          </Typography>
                        </th>
                        <th className="border-b border-blue-gray-100 bg-gradient-to-r from-gray-50 to-blue-50 dark:from-gray-800 dark:to-blue-900/20 p-4 transition-colors">
                          <Typography variant="small" color="blue-gray" className="font-semibold leading-none opacity-70">
                            Contact
                          </Typography>
                        </th>
                        <th className="border-b border-blue-gray-100 bg-gradient-to-r from-gray-50 to-blue-50 dark:from-gray-800 dark:to-blue-900/20 p-4 transition-colors">
                          <Typography variant="small" color="blue-gray" className="font-semibold leading-none opacity-70">
                            Closing Date
                          </Typography>
                        </th>
                        <th className="border-b border-blue-gray-100 bg-gradient-to-r from-gray-50 to-blue-50 dark:from-gray-800 dark:to-blue-900/20 p-4 transition-colors">
                          <Typography variant="small" color="blue-gray" className="font-semibold leading-none opacity-70">
                            BD Representative
                          </Typography>
                        </th>
                        <th className="border-b border-blue-gray-100 bg-gradient-to-r from-gray-50 to-blue-50 dark:from-gray-800 dark:to-blue-900/20 p-4 transition-colors">
                          <Typography variant="small" color="blue-gray" className="font-semibold leading-none opacity-70">
                            Status
                          </Typography>
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {closedDeals.map((deal, index) => (
                        <tr key={deal.id} className={`${index !== closedDeals.length - 1 ? "border-b border-blue-gray-50" : ""} hover:bg-blue-gray-50/50 dark:hover:bg-blue-gray-800/50 transition-colors`}>
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              <div className={`flex items-center justify-center w-10 h-10 rounded-xl bg-${deal.color}-500 text-white text-sm font-medium shadow-md`}>
                                {deal.avatar}
                              </div>
                              <Typography variant="small" color="blue-gray" className="font-semibold">
                                {deal.name}
                              </Typography>
                            </div>
                          </td>
                          <td className="p-4">
                            <Typography variant="small" color="blue-gray">
                              {deal.contact}
                            </Typography>
                          </td>
                          <td className="p-4">
                            <Typography variant="small" color="blue-gray">
                              {deal.closingDate}
                            </Typography>
                          </td>
                          <td className="p-4">
                            <Typography variant="small" color="blue-gray">
                              {deal.bdRepresentative}
                            </Typography>
                          </td>
                          <td className="p-4">
                            <div className="flex items-center gap-2">
                              <CheckCircleIcon className="h-4 w-4 text-green-500" />
                              <Typography variant="small" color="blue-gray">
                                Closed Won
                              </Typography>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : null}
            </CardBody>

            
          </Card>
            <Card className="border-0 shadow-sm bg-white dark:bg-gray-800 mt-6">
            <CardBody className="p-4">
              <div className="flex justify-between items-center mb-4">
                <Typography variant="h5" className="font-medium text-gray-800 dark:text-gray-100">
                  Demos Scheduled
                </Typography>
                <Badge content="3" className="bg-blue-500">
                  <IconButton variant="text" size="sm">
                    <CalendarIcon className="h-5 w-5 text-blue-500" />
                  </IconButton>
                </Badge>
              </div>
              <div className="space-y-4">
                {/* Demo 1 */}
                <div className="p-3 border border-blue-100 rounded-lg bg-blue-50/50">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                        <CalendarIcon className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <Typography variant="small" className="font-medium text-gray-800">
                          Enterprise Solutions Demo
                        </Typography>
                        <Typography variant="small" className="text-gray-600 text-sm">
                          Enterprise Solutions Inc.
                        </Typography>
                      </div>
                    </div>
                    <Typography variant="small" className="text-blue-600 font-medium">
                      Tomorrow, 2:00 PM
                    </Typography>
                  </div>
                  <div className="flex justify-between items-center mt-2 text-sm">
                    <div className="flex items-center gap-1">
                      <UserIcon className="h-4 w-4 text-gray-500" />
                      <Typography variant="small" className="text-gray-600">
                        John Anderson (CTO)
                      </Typography>
                    </div>
                    <Typography variant="small" className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                      Product Demo
                    </Typography>
                  </div>
                </div>
                
                {/* Demo 2 */}
                <div className="p-3 border border-green-100 rounded-lg bg-green-50/50">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                        <CalendarIcon className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <Typography variant="small" className="font-medium text-gray-800">
                          DataFlow Systems Walkthrough
                        </Typography>
                        <Typography variant="small" className="text-gray-600 text-sm">
                          DataFlow Systems
                        </Typography>
                      </div>
                    </div>
                    <Typography variant="small" className="text-green-600 font-medium">
                      Oct 18, 11:30 AM
                    </Typography>
                  </div>
                  <div className="flex justify-between items-center mt-2 text-sm">
                    <div className="flex items-center gap-1">
                      <UserIcon className="h-4 w-4 text-gray-500" />
                      <Typography variant="small" className="text-gray-600">
                        Lisa Anderson (CEO)
                      </Typography>
                    </div>
                    <Typography variant="small" className="bg-green-100 text-green-700 px-2 py-0.5 rounded">
                      Solution Overview
                    </Typography>
                  </div>
                </div>
                
                {/* Demo 3 */}
                <div className="p-3 border border-purple-100 rounded-lg bg-purple-50/50">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center">
                        <CalendarIcon className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <Typography variant="small" className="font-medium text-gray-800">
                          Smart Analytics Technical Demo
                        </Typography>
                        <Typography variant="small" className="text-gray-600 text-sm">
                          Smart Analytics Co
                        </Typography>
                      </div>
                    </div>
                    <Typography variant="small" className="text-purple-600 font-medium">
                      Oct 22, 3:00 PM
                    </Typography>
                  </div>
                  <div className="flex justify-between items-center mt-2 text-sm">
                    <div className="flex items-center gap-1">
                      <UserIcon className="h-4 w-4 text-gray-500" />
                      <Typography variant="small" className="text-gray-600">
                        Mark Thompson (CIO)
                      </Typography>
                    </div>
                    <Typography variant="small" className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded">
                      Technical Demo
                    </Typography>
                  </div>
                </div>
              </div>
              
              <div className="mt-4 text-center">
                <Button 
                  className="bg-blue-500 hover:bg-blue-600 transition-all duration-200 normal-case font-normal text-sm py-2 px-4 rounded-lg"
                >
                  View All Scheduled Demos
                </Button>
              </div>
            </CardBody>
          </Card>

          {/* Agreements Pending */}
          <Card className="col-span-1 lg:col-span-2 border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl mt-6">
            <CardBody>
              <div className="flex justify-between items-center mb-6">
                <Typography variant="h5" className="font-semibold bg-gradient-to-r from-gray-900 to-blue-900 dark:from-white dark:to-blue-200 bg-clip-text text-transparent">
                  Agreements Pending
                </Typography>
                <Badge content="In Process" className="bg-amber-500">
                  <IconButton variant="text" size="sm">
                    <ClockIcon className="h-5 w-5 text-amber-500" />
                  </IconButton>
                </Badge>
            </div>
              {pendingAgreements.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-max table-auto text-left">
                    <thead>
                      <tr>
                        <th className="border-b border-blue-gray-100 bg-blue-gray-50/50 p-4">
                          <Typography variant="small" color="blue-gray" className="font-medium leading-none">
                            Company
                          </Typography>
                        </th>
                        <th className="border-b border-blue-gray-100 bg-blue-gray-50/50 p-4">
                          <Typography variant="small" color="blue-gray" className="font-medium leading-none">
                            Contact
                          </Typography>
                        </th>
                        <th className="border-b border-blue-gray-100 bg-blue-gray-50/50 p-4">
                          <Typography variant="small" color="blue-gray" className="font-medium leading-none">
                            Start Date
                          </Typography>
                        </th>
                        <th className="border-b border-blue-gray-100 bg-blue-gray-50/50 p-4">
                          <Typography variant="small" color="blue-gray" className="font-medium leading-none">
                            BD Representative
                          </Typography>
                        </th>
                        <th className="border-b border-blue-gray-100 bg-blue-gray-50/50 p-4">
                          <Typography variant="small" color="blue-gray" className="font-medium leading-none">
                            Status
                          </Typography>
                        </th>
                        <th className="border-b border-blue-gray-100 bg-blue-gray-50/50 p-4">
                          <Typography variant="small" color="blue-gray" className="font-medium leading-none">
                            Days Pending
                          </Typography>
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {pendingAgreements.map((agreement, index) => (
                        <tr key={agreement.id} className={index !== pendingAgreements.length - 1 ? "border-b border-blue-gray-50" : ""}>
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              <div className={`flex items-center justify-center w-8 h-8 rounded-full bg-${agreement.color}-500 text-white text-xs font-medium`}>
                                {agreement.avatar}
                              </div>
                              <Typography variant="small" color="blue-gray" className="font-semibold">
                                {agreement.name}
                              </Typography>
                            </div>
                          </td>
                          <td className="p-4">
                            <Typography variant="small" color="blue-gray">
                              {agreement.contact}
                            </Typography>
                          </td>
                          <td className="p-4">
                            <Typography variant="small" color="blue-gray">
                              {agreement.startDate}
                            </Typography>
                          </td>
                          <td className="p-4">
                              <Typography variant="small" color="blue-gray">
                              {agreement.bdRepresentative}
                              </Typography>
                          </td>
                          <td className="p-4">
                            <div className="flex items-center gap-2">
                              <ClockIcon className="h-4 w-4 text-amber-500" />
                                <Typography variant="small" color="blue-gray">
                                {agreement.status}
                                </Typography>
                            </div>
                          </td>
                          <td className="p-4">
                            <Typography variant="small" className={`font-medium ${agreement.daysPending > 7 ? 'text-red-500' : 'text-blue-gray-600'}`}>
                              {agreement.daysPending} days
                            </Typography>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : null}
            </CardBody>
          </Card>

          

          {/* Upcoming Activities */}
          <Card className="border-0 shadow-sm bg-white dark:bg-gray-800">
            <CardBody className="p-4">
              <div className="flex justify-between items-center mb-4">
                <Typography variant="h5" className="font-medium text-gray-800 dark:text-gray-100">
                  Upcoming Activities
                </Typography>
                {upcomingActivities.length > 0 && (
                  <Badge content={upcomingActivities.length} className="bg-red-500">
                    <IconButton variant="text" size="sm">
                      <CalendarIcon className="h-5 w-5 text-red-500" />
                    </IconButton>
                  </Badge>
                )}
              </div>
              {upcomingActivities.length > 0 ? (
                <div className="space-y-4">
                  {upcomingActivities.map((activity) => (
                    <div key={activity.id} className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
                        {getActivityIcon(activity.type)}
                      </div>
                      <div className="flex-grow">
                        <Typography variant="small" className="font-medium text-gray-800 dark:text-gray-200">
                          {activity.title}
                        </Typography>
                        <Typography variant="small" className="text-gray-600 dark:text-gray-400 text-sm">
                          {activity.client}
                        </Typography>
                      </div>
                      <Typography variant="small" className="text-gray-500 dark:text-gray-400 text-sm whitespace-nowrap">
                        {activity.date}
                      </Typography>
                    </div>
                  ))}
                </div>
              ) : null}
              <div className="mt-4 text-center">
                <Button 
                  className="bg-blue-500 hover:bg-blue-600 transition-all duration-200 normal-case font-normal text-sm py-2 px-4 rounded-lg"
                >
                  View All Activities
                </Button>
              </div>
            </CardBody>
          </Card>

          {/* Demos Scheduled */}
        
        </div>

        {/* BD Team Performance */}
        <Card className="border-0 shadow-sm bg-white dark:bg-gray-800">
          <CardBody>
            <div className="flex justify-between items-center mb-4">
              <Typography variant="h5" className="font-medium text-gray-800 dark:text-gray-100">
                Business Development Team
              </Typography>
              <div className="flex items-center gap-3">
                <Tabs value={activeTeamTab} onChange={(value) => setActiveTeamTab(value)} className="dark:border-gray-700">
                  <TabsHeader className="bg-gray-100 dark:bg-gray-700">
                    <Tab value="performance" className="dark:text-gray-300">
                      <div className="flex items-center gap-2">
                        <ChartBarIcon className="h-4 w-4" />
                        <span>Performance</span>
                      </div>
                    </Tab>
                    <Tab value="members" className="dark:text-gray-300">
                      <div className="flex items-center gap-2">
                        <UserIcon className="h-4 w-4" />
                        <span>Members</span>
                      </div>
                    </Tab>
                  </TabsHeader>
                </Tabs>
                {(localStorage.getItem('userType') === 'superadmin' || localStorage.getItem('userEmail') === 'ashwin.mabicons@gmail.com') && (
                  <Button 
                    className="bg-blue-500 hover:bg-blue-600 transition-all duration-200 flex items-center gap-2 text-white"
                    size="sm"
                    onClick={() => setIsModalOpen(true)}
                  >
                    <FiPlus className="h-4 w-4" /> ADD MEMBER
                  </Button>
                )}
              </div>
            </div>

            {activeTeamTab === 'performance' ? (
              bdTeamMembers.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-max table-auto text-left">
                    <thead>
                      <tr className="border-b border-blue-gray-100">
                        <th className="p-4">
                          <Typography variant="small" className="font-medium text-blue-gray-600">
                            Team Member
                          </Typography>
                        </th>
                        <th className="p-4">
                          <Typography variant="small" className="font-medium text-blue-gray-600">
                            Total Leads
                          </Typography>
                        </th>
                        <th className="p-4">
                          <Typography variant="small" className="font-medium text-blue-gray-600">
                            Converted
                          </Typography>
                        </th>
                        <th className="p-4">
                          <Typography variant="small" className="font-medium text-blue-gray-600">
                            Conversion Rate
                          </Typography>
                        </th>
                        <th className="p-4">
                          <Typography variant="small" className="font-medium text-blue-gray-600">
                            Active Deals
                          </Typography>
                        </th>
                        <th className="p-4">
                          <Typography variant="small" className="font-medium text-blue-gray-600">
                            Performance
                          </Typography>
                        </th>
                        <th className="p-4">
                          <Typography variant="small" className="font-medium text-blue-gray-600">
                            Actions
                          </Typography>
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {bdTeamMembers.map((member, index) => (
                        <tr key={member.id} className={index !== bdTeamMembers.length - 1 ? "border-b border-blue-gray-50" : ""}>
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              <div className={`flex items-center justify-center w-10 h-10 rounded-full bg-${member.color}-500 text-white text-sm font-medium`}>
                                {member.avatar}
                              </div>
                              <div>
                                <Typography variant="small" className="font-medium text-gray-800">
                                  {member.name}
                                </Typography>
                                <Typography variant="small" className="text-gray-600">
                                  {member.role}
                                </Typography>
                              </div>
                            </div>
                          </td>
                          <td className="p-4">
                            <Typography variant="small" className="font-medium text-gray-800">
                              {member.totalLeads}
                            </Typography>
                          </td>
                          <td className="p-4">
                            <Typography variant="small" className="font-medium text-gray-800">
                              {member.convertedLeads}
                            </Typography>
                          </td>
                          <td className="p-4">
                            <div className="flex items-center gap-1">
                              <Typography variant="small" className="font-medium text-gray-800">
                                {member.conversionRate}%
                              </Typography>
                              {getTrendIcon(member.trend)}
                            </div>
                          </td>
                          <td className="p-4">
                            <Typography variant="small" className="font-medium text-gray-800">
                              {member.activeDeals}
                            </Typography>
                          </td>
                          <td className="p-4">
                            <Typography variant="small" className={`font-medium ${
                              member.performance === 'high' ? 'text-yellow-500' : 
                              member.performance === 'medium' ? 'text-blue-500' : 
                              'text-orange-500'
                            }`}>
                              {member.performance === 'high' && <StarIcon className="h-4 w-4 text-yellow-500 inline mr-1" />}
                              {member.performance.charAt(0).toUpperCase() + member.performance.slice(1)}
                            </Typography>
                          </td>
                          <td className="p-4">
                            <div className="flex items-center gap-2">
                              <Button
                                size="sm"
                                variant="outlined"
                                color="blue"
                                className="flex items-center gap-1 py-1.5 px-3 text-xs"
                                onClick={() => handleMemberSelect(member)}
                              >
                                <CalendarIcon className="h-3 w-3" /> VIEW DETAILS
                              </Button>
                              <IconButton
                                size="sm"
                                variant="text"
                                color="red"
                                onClick={() => {
                                  setMemberToDelete(member);
                                  setDeleteConfirmOpen(true);
                                }}
                              >
                                <TrashIcon className="h-4 w-4" />
                              </IconButton>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : null
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {bdTeamMembers.length > 0 ? 
                  bdTeamMembers.map((member) => (
                    <Card 
                      key={member.id} 
                      className="border shadow-sm hover:shadow-md transition-all dark:bg-gray-800 dark:border-gray-700"
                    >
                      <CardBody>
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className={`flex items-center justify-center w-10 h-10 rounded-full bg-${member.color}-500 text-white text-sm font-medium`}>
                              {member.avatar}
                            </div>
                            <div>
                              <Typography variant="h6" color="blue-gray">
                                {member.name}
                              </Typography>
                              <Typography variant="small" color="blue-gray" className="opacity-70">
                                {member.role}
                              </Typography>
                            </div>
                          </div>
                          <IconButton
                            variant="text"
                            color="red"
                            size="sm"
                            onClick={() => {
                              setMemberToDelete(member);
                              setDeleteConfirmOpen(true);
                            }}
                          >
                            <TrashIcon className="h-4 w-4" />
                          </IconButton>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-3 mb-4">
                          <div className="bg-blue-gray-50/50 p-3 rounded-lg">
                            <Typography variant="small" color="blue-gray" className="font-medium">
                              Total Leads
                            </Typography>
                            <Typography variant="h6" color="blue-gray" className="font-bold">
                              {member.totalLeads}
                            </Typography>
                          </div>
                          <div className="bg-blue-gray-50/50 p-3 rounded-lg">
                            <Typography variant="small" color="blue-gray" className="font-medium">
                              Converted
                            </Typography>
                            <Typography variant="h6" color="blue-gray" className="font-bold">
                              {member.convertedLeads}
                            </Typography>
                          </div>
                        </div>
                        
                        <div className="mb-4">
                          <div className="flex justify-between mb-1">
                            <Typography variant="small" color="blue-gray" className="font-medium">
                              Conversion Rate
                            </Typography>
                            <div className="flex items-center gap-1">
                              {getTrendIcon(member.trend)}
                              <Typography variant="small" color="blue-gray" className="font-medium">
                                {member.conversionRate}%
                              </Typography>
                            </div>
                          </div>
                          <Progress 
                            value={member.conversionRate} 
                            size="sm" 
                            color={member.performance === 'high' ? 'green' : member.performance === 'medium' ? 'blue' : 'amber'} 
                          />
                        </div>
                        
                        <div className="flex justify-between items-center mb-4">
                          <Typography variant="small" color="blue-gray">
                            {member.territory}
                          </Typography>
                          <Typography variant="small" color="blue-gray" className="font-medium">
                            {member.revenue}
                          </Typography>
                        </div>

                        <div className="flex justify-end">
                          <Button
                            size="sm"
                            variant="outlined"
                            color="blue"
                            className="flex items-center gap-2"
                            onClick={() => handleMemberSelect(member)}
                          >
                            <CalendarIcon className="h-4 w-4" /> View Details
                          </Button>
                        </div>
                      </CardBody>
                    </Card>
                  )) 
                : null}
                <Card className="border border-dashed shadow-none hover:bg-blue-gray-50/30 transition-all cursor-pointer dark:border-gray-700 dark:hover:bg-gray-800/50" onClick={() => setIsModalOpen(true)}>
                  <CardBody className="flex flex-col items-center justify-center h-full py-10">
                    <FiPlus className="h-12 w-12 text-blue-gray-300 dark:text-blue-gray-600 mb-3" />
                    <Typography className="font-medium text-blue-gray-500 dark:text-blue-gray-400">
                      Add New Team Member
                    </Typography>
                  </CardBody>
                </Card>
              </div>
            )}
          </CardBody>
        </Card>
      </div>

      {/* Add BD Member Modal */}
      <Dialog open={isModalOpen} handler={() => setIsModalOpen(false)} size="md" className="dark:bg-gray-800">
        <DialogHeader className="flex items-center justify-between">
          <Typography variant="h5" className="text-blue-gray-700 dark:text-blue-gray-200">
            Add Business Development Member
          </Typography>
          <IconButton variant="text" className="text-blue-gray-500 dark:text-blue-gray-400" onClick={() => setIsModalOpen(false)}>
            <XMarkIcon className="h-5 w-5" />
          </IconButton>
        </DialogHeader>
        <DialogBody divider className="overflow-y-auto">
          <div className="grid grid-cols-1 gap-6">
            <div>
              <Typography variant="small" color="blue-gray" className="mb-2 font-medium">
                Full Name
              </Typography>
              <Input
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Enter full name"
                className="!border-t-blue-gray-200 focus:!border-blue-500"
                labelProps={{
                  className: "before:content-none after:content-none",
                }}
              />
            </div>
            
            <div>
              <Typography variant="small" color="blue-gray" className="mb-2 font-medium">
                Email Address
              </Typography>
              <Input
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Enter email address"
                className="!border-t-blue-gray-200 focus:!border-blue-500"
                labelProps={{
                  className: "before:content-none after:content-none",
                }}
              />
            </div>
            
            <div>
              <Typography variant="small" color="blue-gray" className="mb-2 font-medium">
                Phone Number
              </Typography>
              <Input
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="Enter phone number"
                className="!border-t-blue-gray-200 focus:!border-blue-500"
                labelProps={{
                  className: "before:content-none after:content-none",
                }}
              />
            </div>
            
            <div>
              <Typography variant="small" color="blue-gray" className="mb-2 font-medium">
                Password
              </Typography>
              <Input
                name="password"
                type="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="Enter password"
                className="!border-t-blue-gray-200 focus:!border-blue-500"
                labelProps={{
                  className: "before:content-none after:content-none",
                }}
              />
            </div>

            <div>
              <Typography variant="small" color="blue-gray" className="mb-2 font-medium">
                Target Revenue
              </Typography>
              <Input
                name="targetRevenue"
                type="number"
                value={formData.targetRevenue}
                onChange={handleInputChange}
                placeholder="Enter target revenue"
                className="!border-t-blue-gray-200 focus:!border-blue-500"
                labelProps={{
                  className: "before:content-none after:content-none",
                }}
              />
            </div>

            <div>
              <Typography variant="small" color="blue-gray" className="mb-2 font-medium">
                Target Leads
              </Typography>
              <Input
                name="targetLeads"
                type="number"
                value={formData.targetLeads}
                onChange={handleInputChange}
                placeholder="Enter target leads"
                className="!border-t-blue-gray-200 focus:!border-blue-500"
                labelProps={{
                  className: "before:content-none after:content-none",
                }}
              />
            </div>
          </div>
        </DialogBody>
        <DialogFooter className="space-x-2">
          <Button variant="outlined" color="blue-gray" onClick={() => setIsModalOpen(false)}>
            Cancel
          </Button>
          <Button variant="gradient" color="blue" onClick={handleSubmit}>
            Add Member
          </Button>
        </DialogFooter>
      </Dialog>

      {/* Add Delete Confirmation Dialog */}
      <Dialog open={deleteConfirmOpen} handler={() => setDeleteConfirmOpen(false)} size="xs" className="dark:bg-gray-800">
        <DialogHeader className="flex items-center justify-between">
          <Typography variant="h5" color="blue-gray">
            Confirm Delete
          </Typography>
          <IconButton variant="text" color="blue-gray" onClick={() => setDeleteConfirmOpen(false)}>
            <XMarkIcon className="h-5 w-5" />
          </IconButton>
        </DialogHeader>
        <DialogBody divider>
          <Typography color="blue-gray" className="font-normal">
            Are you sure you want to delete {memberToDelete?.name}? This action cannot be undone.
          </Typography>
        </DialogBody>
        <DialogFooter className="space-x-2">
          <Button variant="outlined" color="blue-gray" onClick={() => setDeleteConfirmOpen(false)}>
            Cancel
          </Button>
          <Button variant="filled" color="red" onClick={handleDeleteMember}>
            Delete
          </Button>
        </DialogFooter>
      </Dialog>
    </div>
  );
}

export default BdTab;