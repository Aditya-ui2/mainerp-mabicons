import React, { useState, useEffect } from "react";
import {
  Button,
  Card,
  CardBody,
  Typography,
  Dialog,
  Input,
} from "@material-tailwind/react";
import {
  FiHome,
  FiUsers,
  FiBarChart2,
  FiSettings,
  FiPlus,
  FiSend,
  FiEdit2,
  FiTrash2,
  FiInbox,
  FiLogOut,
  FiDownload,
  FiUpload,
  FiSearch,
  FiBell,
  FiX,
  FiCheckSquare,
  FiTrendingUp,
  FiFileText,
  FiUser,
} from "react-icons/fi";
import { Pie, Bar, Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  LineElement,
  PointElement,
} from "chart.js";
import * as XLSX from "xlsx";
import PropTypes from 'prop-types';
import { motion, AnimatePresence } from "framer-motion";
import { getAllLeads, createLead, updateLead, deleteLead, sendProposal, sendProfile } from '../service/api';

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  LineElement,
  PointElement
);

const sidebarItems = [
  { 
    name: "Dashboard", 
    icon: FiHome, 
    color: "from-gray-100 to-gray-50",
    gradient: "hover:from-gray-200 hover:to-gray-100",
    iconGradient: "from-gray-500 to-gray-400"
  },
  { 
    name: "Leads", 
    icon: FiUsers, 
    color: "from-gray-100 to-gray-50",
    gradient: "hover:from-gray-200 hover:to-gray-100",
    iconGradient: "from-gray-500 to-gray-400"
  },
  { 
    name: "Reports", 
    icon: FiBarChart2, 
    color: "from-gray-100 to-gray-50",
    gradient: "hover:from-gray-200 hover:to-gray-100",
    iconGradient: "from-gray-500 to-gray-400"
  },
  { 
    name: "Settings", 
    icon: FiSettings, 
    color: "from-gray-100 to-gray-50",
    gradient: "hover:from-gray-200 hover:to-gray-100",
    iconGradient: "from-gray-500 to-gray-400"
  }
];

const AddLeadForm = React.memo(({ onSubmit, initialValues, onClose, leadStatuses }) => {
  const [formData, setFormData] = useState(initialValues);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const leadSources = [
    "Website", 
    "Referral", 
    "Email Campaign", 
    "Trade Show", 
    "Exisiting Customer", 
    "Partner", 
    "Management Guru",
    "BNI",
    "Linkedin",
    "Facebook",
    "Instagram",
    "Inside Sale"
  ];

  const leadTypes = [
    "Talent Acquisition",
    "Payroll & Compliance",
    "HR Software",
    "HR Genralist ",
    "HRMS & Software",
    "Talent Acquisition & HRMS",
    "PMS"
  ];

  return (
    <div className="p-6 bg-white rounded-lg">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Add New Lead</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="border-b border-gray-200 pb-4">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">Company Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="companyName" className="block text-sm font-medium text-gray-700 mb-1">
                Company Name <span className="text-red-500">*</span>
              </label>
              <Input
                type="text"
                id="companyName"
                name="companyName"
                placeholder="Enter company name"
                value={formData.companyName}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label htmlFor="website" className="block text-sm font-medium text-gray-700 mb-1">
                Website
              </label>
              <Input
                type="text"
                id="website"
                name="website"
                placeholder="Enter website URL"
                value={formData.website}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
                Location
              </label>
              <Input
                type="text"
                id="location"
                name="location"
                placeholder="Enter location"
                value={formData.location}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label htmlFor="companySize" className="block text-sm font-medium text-gray-700 mb-1">
                Company Size
              </label>
              <Input
                type="text"
                id="companySize"
                name="companySize"
                placeholder="Enter company size (e.g., 50-100)"
                value={formData.companySize}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        <div className="border-b border-gray-200 pb-4">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">Contact Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="personName" className="block text-sm font-medium text-gray-700 mb-1">
                Contact Person Name <span className="text-red-500">*</span>
              </label>
              <Input
                type="text"
                id="personName"
                name="personName"
                placeholder="Enter contact person's name"
                value={formData.personName}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label htmlFor="personEmail" className="block text-sm font-medium text-gray-700 mb-1">
                Contact Email <span className="text-red-500">*</span>
              </label>
              <Input
                type="email"
                id="personEmail"
                name="personEmail"
                placeholder="Enter contact email"
                value={formData.personEmail}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label htmlFor="personNumber" className="block text-sm font-medium text-gray-700 mb-1">
                Contact Number
              </label>
              <Input
                type="text"
                id="personNumber"
                name="personNumber"
                placeholder="Enter contact number"
                value={formData.personNumber}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-gray-700 mb-4">Lead Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {Object.entries(leadStatuses).map(([key, status]) => (
                  <option key={key} value={key}>
                    {status.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="source" className="block text-sm font-medium text-gray-700 mb-1">
                Lead Source
              </label>
              <select
                id="source"
                name="source"
                value={formData.source || ""}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="" disabled>Select a source</option>
                {leadSources.map((source) => (
                  <option key={source} value={source}>
                    {source}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="leadType" className="block text-sm font-medium text-gray-700 mb-1">
                Lead Type
              </label>
              <select
                id="leadType"
                name="leadType"
                value={formData.leadType || ""}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="" disabled>Select a lead type</option>
                {leadTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-4 pt-4">
          <Button
            type="button"
            color="gray"
            onClick={onClose}
            className="px-6 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            color="blue"
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white"
          >
            Add Lead
          </Button>
        </div>
      </form>
    </div>
  );
});

AddLeadForm.displayName = 'AddLeadForm';

AddLeadForm.propTypes = {
  onSubmit: PropTypes.func.isRequired,
  initialValues: PropTypes.shape({
    companyName: PropTypes.string,
    personName: PropTypes.string,
    personEmail: PropTypes.string,
    personNumber: PropTypes.string,
    website: PropTypes.string,
    location: PropTypes.string,
    companySize: PropTypes.string,
    status: PropTypes.string,
    source: PropTypes.string,
    leadType: PropTypes.string
  }).isRequired,
  onClose: PropTypes.func.isRequired,
  leadStatuses: PropTypes.object.isRequired
};

function BdDashboard() {
  const [activeSidebarItem, setActiveSidebarItem] = useState("Dashboard");
  const [leads, setLeads] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState("");
  const [notificationType, setNotificationType] = useState("success");
  const [newLead, setNewLead] = useState({
    companyName: "",
    personName: "",
    personEmail: "",
    personNumber: "",
    website: "",
    location: "",
    companySize: "",
    status: "prospecting",
    source: "",
    leadType: ""
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    totalLeads: 0,
    activeDeals: 0,
    dealsClosed: 0,
    conversionRate: 0
  });

  const leadStatuses = {
    prospecting: {
      label: "Prospecting",
      color: "bg-gray-100 text-gray-800",
      badge: "bg-gray-200",
    },
    qualified: {
      label: "Qualified",
      color: "bg-blue-100 text-blue-800",
      badge: "bg-blue-200",
    },
    negotiation: {
      label: "Negotiation",
      color: "bg-purple-100 text-purple-800",
      badge: "bg-purple-200",
    },
    proposal: {
      label: "Proposal Sent",
      color: "bg-yellow-100 text-yellow-800",
      badge: "bg-yellow-200",
    },
    closedWon: {
      label: "Closed Won",
      color: "bg-green-100 text-green-800",
      badge: "bg-green-200",
    },
    closedLost: {
      label: "Closed Lost",
      color: "bg-red-100 text-red-800",
      badge: "bg-red-200",
    },
    onHold: {
      label: "On Hold",
      color: "bg-orange-100 text-orange-800",
      badge: "bg-orange-200",
    },
    followUp: {
      label: "Follow Up",
      color: "bg-pink-100 text-pink-800",
      badge: "bg-pink-200",
    },
    Meeting_Done: {
      label: "Meeting Done",
      color: "bg-purple-100 text-purple-800",
      badge: "bg-purple-200",
    },
    Meeting_Scheduled: {
      label: "Meeting Scheduled",
      color: "bg-purple-100 text-purple-800",
      badge: "bg-purple-200",
    },
    Agreement_Inprocess: {
      label: "Agreement Inprocess",
      color: "bg-purple-100 text-purple-800",
      badge: "bg-purple-200",
    },
    Software_Demo: {
      label: "Software Demo",
      color: "bg-purple-100 text-purple-800",
      badge: "bg-purple-200",
    },
  };

  const fetchLeadsAndStats = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getAllLeads();
      setLeads(response.data || []);
      
      const totalLeads = response.data.length;
      const activeDeals = response.data.filter(lead => lead.status === 'Negotiation').length;
      const dealsClosed = response.data.filter(lead => lead.status === 'Closed Won').length;
      const conversionRate = totalLeads > 0 ? ((dealsClosed / totalLeads) * 100).toFixed(1) : 0;

      setStats({
        totalLeads,
        activeDeals,
        dealsClosed,
        conversionRate
      });
    } catch (err) {
      setError('Failed to fetch leads. Please try again.');
      console.error('Error fetching leads:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeadsAndStats();
  }, []);

  const getLeadStatusDistribution = () => {
    const statusCounts = leads.reduce((acc, lead) => {
      acc[lead.status] = (acc[lead.status] || 0) + 1;
      return acc;
    }, {});

    return {
      Prospecting: statusCounts['Prospecting'] || 0,
      'Discussion Pending': statusCounts['Discussion Pending'] || 0,
      Negotiation: statusCounts['Negotiation'] || 0,
      'Proposal Sent': statusCounts['Proposal Sent'] || 0,
      'Closed Won': statusCounts['Closed Won'] || 0,
      'Closed Lost': statusCounts['Closed Lost'] || 0,
      'On Hold': statusCounts['On Hold'] || 0,
      'Follow Up': statusCounts['Follow Up'] || 0,
      'Meeting Done': statusCounts['Meeting Done'] || 0,
      'Meeting Scheduled': statusCounts['Meeting Scheduled'] || 0,
      'Agreement Inprocess': statusCounts['Agreement Inprocess'] || 0,
      'Software Demo': statusCounts['Software Demo'] || 0
    };
  };

  const handleAction = async (leadId, action) => {
    setLoading(true);
    setError(null);
    try {
      switch (action) {
        case 'sendProposal':
          await sendProposal({ leadId });
          break;
        case 'sendProfile':
          await sendProfile({ leadId });
          break;
        case 'delete':
          await deleteLead(leadId);
          break;
        default:
          break;
      }
      fetchLeadsAndStats();
    } catch (err) {
      setError(`Failed to ${action} lead. Please try again.`);
      console.error(`Error performing ${action}:`, err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (leadId, newStatus) => {
    setLoading(true);
    setError(null);
    try {
      await updateLead(leadId, { status: newStatus });
      fetchLeadsAndStats();
    } catch (err) {
      setError('Failed to update lead status. Please try again.');
      console.error('Error updating lead status:', err);
    } finally {
      setLoading(false);
    }
  };

  const prepareChartData = () => {
    const statusCounts = getLeadStatusDistribution();
    const labels = Object.keys(statusCounts);
    const data = Object.values(statusCounts);

    const backgroundColors = [
      '#4F46E5', '#3B82F6', '#8B5CF6', '#F59E0B', '#10B981', '#EF4444', '#F97316', '#EC4899', '#6366F1', '#14B8A6', '#84CC16', '#A855F7'
    ];

    return {
      labels,
      datasets: [
        {
          data,
          backgroundColor: backgroundColors.slice(0, data.length),
          borderColor: backgroundColors.slice(0, data.length).map(color => color + 'CC'),
          borderWidth: 2,
        },
      ],
    };
  };

  const chartOptions = {
    plugins: {
      legend: {
        position: 'right',
        labels: {
          padding: 20,
          font: {
            size: 12,
            family: "'Inter', sans-serif",
          },
          usePointStyle: true,
          pointStyle: 'circle',
        },
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const value = context.raw;
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = ((value / total) * 100).toFixed(1);
            return `${context.label}: ${value} leads (${percentage}%)`;
          },
        },
        padding: 12,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleFont: {
          size: 14,
          family: "'Inter', sans-serif",
        },
        bodyFont: {
          size: 13,
          family: "'Inter', sans-serif",
        },
      },
    },
    maintainAspectRatio: false,
    cutout: '60%',
    layout: {
      padding: {
        top: 20,
        bottom: 20,
        left: 20,
        right: 120
      }
    },
    responsive: true,
  };

  const getStatusColor = (status) => {
    return leadStatuses[status]?.color || "bg-gray-100 text-gray-800";
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewLead((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const showNotificationMessage = (message, type = "success") => {
    setNotificationMessage(message);
    setNotificationType(type);
    setShowNotification(true);
    setTimeout(() => setShowNotification(false), 3000);
  };

  const addNewLead = async (formData) => {
    try {
      setLoading(true);
      const leadData = {
        contactPerson: {
          name: formData.personName,
          email: formData.personEmail
        },
        companyDetails: {
          name: formData.companyName,
          location: formData.location,
          website: formData.website
        },
        status: formData.status,
        dealValue: {
          estimatedValue: formData.dealValue || 0,
          currency: "₹"
        },
        followUp: {
          nextDate: new Date().toISOString(),
          lastContactDate: new Date().toISOString()
        }
      };

      await createLead(leadData);
      showNotificationMessage('Lead added successfully');
      fetchLeadsAndStats();
    } catch (err) {
      showNotificationMessage('Failed to add lead', 'error');
    } finally {
      setLoading(false);
    }
  };

  const downloadTemplate = () => {
    const template = [
      {
        "Company Name": "",
        Website: "",
        Location: "",
        "Company Size": "",
        "Contact Person Name": "",
        "Contact Email": "",
        "Contact Number": "",
        Status: "Hot/Cold/Lukewarm",
        "Lead Type": ""
      },
    ];

    const ws = XLSX.utils.json_to_sheet(template);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Template");
    XLSX.writeFile(wb, "leads_template.xlsx");
  };

  const handleBulkUpload = (event) => {
    const file = event.target.files[0];

    if (!file) return;

    if (!["xlsx", "xls"].includes(file.name.split(".").pop().toLowerCase())) {
      showNotificationMessage(
        "Please upload an Excel file (.xlsx or .xls)",
        "error"
      );
      return;
    }

    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        if (jsonData.length === 0) {
          showNotificationMessage("The uploaded file is empty", "error");
          return;
        }

        const newLeads = jsonData.map((item, index) => {
          if (
            !item["Company Name"] ||
            !item["Contact Person Name"] ||
            !item["Contact Email"]
          ) {
            throw new Error("Missing required fields");
          }

          return {
            id: leads.length + index + 1,
            companyName: item["Company Name"],
            website: item["Website"] || "",
            location: item["Location"] || "",
            companySize: item["Company Size"] || "",
            personName: item["Contact Person Name"],
            personEmail: item["Contact Email"],
            personNumber: item["Contact Number"] || "",
            status: ["Hot", "Cold", "Lukewarm"].includes(item["Status"])
              ? item["Status"]
              : "Hot",
            leadType: item["Lead Type"] || "New Business"
          };
        });

        setLeads([...leads, ...newLeads]);
        showNotificationMessage(
          `Successfully uploaded ${newLeads.length} leads`
        );
      } catch (error) {
        showNotificationMessage(
          "Error processing file: " + error.message,
          "error"
        );
      }
    };

    reader.onerror = () => {
      showNotificationMessage("Error reading file", "error");
    };

    reader.readAsArrayBuffer(file);
  };

  const exportReport = (reportType) => {
    let reportData;
    let fileName;

    switch (reportType) {
      case "leads":
        reportData = leads;
        fileName = "leads_report.xlsx";
        break;
      case "conversion":
        reportData = leads.map((lead) => ({
          Company: lead.companyName,
          Status: lead.status,
          "Conversion Date": new Date().toLocaleDateString(),
        }));
        fileName = "conversion_report.xlsx";
        break;
      case "performance":
        reportData = [
          {
            "Total Leads": leads.length,
            "Hot Leads": leads.filter((lead) => lead.status === "Hot").length,
            "Cold Leads": leads.filter((lead) => lead.status === "Cold").length,
            "Lukewarm Leads": leads.filter((lead) => lead.status === "Lukewarm").length,
            "Conversion Rate": `${(
              (leads.filter((lead) => lead.status === "Hot").length /
                leads.length) *
              100
            ).toFixed(1)}%`,
          },
        ];
        fileName = "performance_report.xlsx";
        break;
      default:
        return;
    }

    const ws = XLSX.utils.json_to_sheet(reportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Report");
    XLSX.writeFile(wb, fileName);
  };

  const DashboardView = () => {
    return (
      <motion.div 
        className="space-y-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Total Leads</h3>
              <div className="p-2 bg-gray-100 rounded-lg">
                <FiUsers className="w-5 h-5 text-gray-600" />
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-900">{stats.totalLeads}</p>
            <p className="text-sm text-gray-500 mt-2">Active leads in pipeline</p>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Qualified Leads</h3>
              <div className="p-2 bg-gray-100 rounded-lg">
                <FiCheckSquare className="w-5 h-5 text-gray-600" />
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-900">
              {leads.filter((lead) => lead.status === "qualified").length}
            </p>
            <p className="text-sm text-gray-500 mt-2">Ready for negotiation</p>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Won Deals</h3>
              <div className="p-2 bg-gray-100 rounded-lg">
                <FiTrendingUp className="w-5 h-5 text-gray-600" />
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-900">
              {leads.filter((lead) => lead.status === "closedWon").length}
            </p>
            <p className="text-sm text-gray-500 mt-2">Successfully closed</p>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Active Deals</h3>
              <div className="p-2 bg-gray-100 rounded-lg">
                <FiBarChart2 className="w-5 h-5 text-gray-600" />
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-900">
              {stats.activeDeals}
            </p>
            <p className="text-sm text-gray-500 mt-2">In progress</p>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm hover:shadow-md transition-all duration-300"
          >
            <Typography variant="h6" className="text-gray-800 mb-4 font-semibold">
              Lead Status Distribution
            </Typography>
            <div className="h-[400px] relative">
              <Pie data={prepareChartData()} options={{
                ...chartOptions,
                plugins: {
                  ...chartOptions.plugins,
                  legend: {
                    ...chartOptions.plugins.legend,
                    labels: {
                      ...chartOptions.plugins.legend.labels,
                      color: '#4B5563',
                      font: {
                        ...chartOptions.plugins.legend.labels.font,
                        family: 'Inter, sans-serif'
                      }
                    }
                  }
                }
              }} />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm hover:shadow-md transition-all duration-300"
          >
            <Typography variant="h6" className="text-gray-800 mb-4 font-semibold">
              Recent Leads
            </Typography>
            <div className="space-y-3">
              {leads.slice(-5).reverse().map((lead) => (
                <motion.div
                  key={lead.id}
                  whileHover={{ scale: 1.01 }}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-all duration-300"
                >
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      <div className="h-10 w-10 rounded-lg bg-gray-200 flex items-center justify-center">
                        <span className="text-sm font-medium text-gray-600">
                          {lead.personName.charAt(0)}
                        </span>
                      </div>
                    </div>
                    <div>
                      <Typography variant="small" className="font-medium text-gray-900">
                        {lead.personName}
                      </Typography>
                      <Typography variant="small" className="text-gray-500">
                        {lead.companyName}
                      </Typography>
                    </div>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="px-3 py-1 rounded-lg text-xs font-medium bg-gray-200 text-gray-800">
                      {leadStatuses[lead.status].label}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </motion.div>
    );
  };

  const LeadsView = () => (
    <div>
      <div className="flex justify-between items-center mb-4">
        <Typography variant="h5" className="text-black">
          All Leads
        </Typography>
        <div className="flex space-x-4">
          <Button
            className="bg-gradient-to-r from-gray-800 to-gray-700 text-white hover:from-gray-700 hover:to-gray-600 flex items-center px-4 py-2 rounded-lg shadow-md hover:shadow-lg transition-all duration-200"
            onClick={downloadTemplate}
          >
            <FiDownload className="mr-2" /> Download Template
          </Button>

          <div className="relative">
            <Button className="bg-gradient-to-r from-gray-800 to-gray-700 text-white hover:from-gray-700 hover:to-gray-600 flex items-center px-4 py-2 rounded-lg shadow-md hover:shadow-lg transition-all duration-200">
              <FiUpload className="mr-2" /> Bulk Upload
              <input
                type="file"
                accept=".xlsx, .xls"
                onChange={handleBulkUpload}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
            </Button>
          </div>

          <Button
            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-500 hover:to-purple-500 flex items-center px-4 py-2 rounded-lg shadow-md hover:shadow-lg transition-all duration-200"
            onClick={() => setIsModalOpen(true)}
          >
            <FiPlus className="mr-2" /> Add Lead
          </Button>

          <Dialog open={isModalOpen} handler={() => setIsModalOpen(false)} className="rounded-lg shadow-lg">
            <AddLeadForm 
              onSubmit={(formData) => {
                addNewLead(formData);
                setIsModalOpen(false);
              }}
              initialValues={newLead}
              onClose={() => setIsModalOpen(false)}
              leadStatuses={leadStatuses}
            />
          </Dialog>
        </div>
      </div>

      <div className="overflow-hidden bg-white rounded-xl shadow-lg border border-gray-100">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Contact Person
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Company Details
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Follow Up
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {leads.map((lead) => (
                <tr
                  key={lead.id}
                  className="hover:bg-gray-50/50 transition-colors duration-200"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white shadow-md">
                          <span className="text-sm font-medium">
                            {lead.personName.charAt(0)}
                          </span>
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-semibold text-gray-900">
                          {lead.personName}
                        </div>
                        <div className="text-sm text-gray-500">
                          {lead.personEmail}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">
                      {lead.companyName}
                    </div>
                    <div className="text-sm text-gray-500">{lead.location}</div>
                    <div className="text-sm text-gray-500">
                      <a
                        href={lead.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800"
                      >
                        {lead.website}
                      </a>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <select
                      value={lead.status}
                      onChange={(e) => handleStatusChange(lead.id, e.target.value)}
                      className={`${getStatusColor(
                        lead.status
                      )} px-3 py-1 rounded-full text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
                    >
                      {Object.entries(leadStatuses).map(([key, status]) => (
                        <option key={key} value={key}>
                          {status.label}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {new Date(lead.nextFollowUp).toLocaleDateString()}
                    </div>
                    <div className="text-xs text-gray-500">
                      Last: {new Date(lead.lastContact).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <div className="flex space-x-1">
                        <button
                          onClick={() => handleAction(lead.id, 'sendProfile')}
                          className="bg-gradient-to-r from-purple-500/10 to-purple-600/10 text-purple-700 hover:from-purple-500/20 hover:to-purple-600/20 px-4 py-2 rounded-lg text-sm font-medium flex items-center space-x-2 transition-all duration-200 shadow-sm hover:shadow-md"
                        >
                          <FiFileText className="w-4 h-4" />
                          <span>Send Profile</span>
                        </button>
                        <button
                          onClick={() => handleAction(lead.id, 'sendProposal')}
                          className="bg-gradient-to-r from-blue-500/10 to-blue-600/10 text-blue-700 hover:from-blue-500/20 hover:to-blue-600/20 px-4 py-2 rounded-lg text-sm font-medium flex items-center space-x-2 transition-all duration-200 shadow-sm hover:shadow-md"
                        >
                          <FiFileText className="w-4 h-4" />
                          <span>Send Proposal</span>
                        </button>
                      </div>
                      <div className="flex space-x-1">
                        <button
                          onClick={() => handleAction(lead.id, 'delete')}
                          className="text-red-600 hover:text-red-900"
                        >
                          <FiTrash2 className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const ReportsView = () => {
    const monthlyLeadData = {
      labels: [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ],
      datasets: [
        {
          label: "Leads Generated",
          data: [12, 19, 15, 25, 22, 30, 28, 35, 32, 40, 38, 45],
          backgroundColor: "rgba(59, 130, 246, 0.5)",
          borderColor: "rgb(59, 130, 246)",
          borderWidth: 1,
        },
      ],
    };

    const conversionTrendData = {
      labels: ["Week 1", "Week 2", "Week 3", "Week 4"],
      datasets: [
        {
          label: "Conversion Rate (%)",
          data: [25, 30, 35, 40],
          borderColor: "rgb(34, 197, 94)",
          backgroundColor: "rgba(34, 197, 94, 0.1)",
          fill: true,
          tension: 0.4,
        },
      ],
    };

    const leadSourceData = {
      labels: ["Website", "Referral", "Social Media", "Email", "Trade Show"],
      datasets: [
        {
          data: [35, 25, 20, 15, 5],
          backgroundColor: [
            "rgba(59, 130, 246, 0.8)",
            "rgba(34, 197, 94, 0.8)",
            "rgba(249, 115, 22, 0.8)",
            "rgba(168, 85, 247, 0.8)",
            "rgba(236, 72, 153, 0.8)",
          ],
          borderWidth: 0,
        },
      ],
    };

    const barOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: "top",
        },
        title: {
          display: true,
          text: "Monthly Lead Generation",
        },
      },
      scales: {
        y: {
          beginAtZero: true,
        },
      },
    };

    const lineOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: "top",
        },
        title: {
          display: true,
          text: "Conversion Rate Trend",
        },
      },
    };

    const pieOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: "right",
        },
        title: {
          display: true,
          text: "Lead Source Distribution",
        },
      },
    };

    return (
      <div className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="bg-white shadow-lg">
            <CardBody>
              <Typography variant="h6" color="blue-gray" className="mb-2">
                Total Leads
              </Typography>
              <Typography variant="h3" color="blue-gray">
                {stats.totalLeads}
              </Typography>
              <Typography variant="small" className="text-gray-600">
                All time leads generated
              </Typography>
            </CardBody>
          </Card>

          <Card className="bg-white shadow-lg">
            <CardBody>
              <Typography variant="h6" color="blue-gray" className="mb-2">
                Conversion Rate
              </Typography>
              <Typography variant="h3" color="blue-gray">
                {stats.conversionRate}%
              </Typography>
              <Typography variant="small" className="text-gray-600">
                Hot leads conversion
              </Typography>
            </CardBody>
          </Card>

          <Card className="bg-white shadow-lg">
            <CardBody>
              <Typography variant="h6" color="blue-gray" className="mb-2">
                Average Deal Size
              </Typography>
              <Typography variant="h3" color="blue-gray">
                $45K
              </Typography>
              <Typography variant="small" className="text-gray-600">
                Past 30 days
              </Typography>
            </CardBody>
          </Card>

          <Card className="bg-white shadow-lg">
            <CardBody>
              <Typography variant="h6" color="blue-gray" className="mb-2">
                Response Rate
              </Typography>
              <Typography variant="h3" color="blue-gray">
                85%
              </Typography>
              <Typography variant="small" className="text-gray-600">
                Average response rate
              </Typography>
            </CardBody>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="bg-white shadow-lg">
            <CardBody>
              <div className="h-[400px]">
                <Bar data={monthlyLeadData} options={barOptions} />
              </div>
            </CardBody>
          </Card>

          <Card className="bg-white shadow-lg">
            <CardBody>
              <div className="h-[400px]">
                <Line data={conversionTrendData} options={lineOptions} />
              </div>
            </CardBody>
          </Card>

          <Card className="bg-white shadow-lg">
            <CardBody>
              <div className="h-[400px]">
                <Pie data={leadSourceData} options={pieOptions} />
              </div>
            </CardBody>
          </Card>

          <Card className="bg-white shadow-lg">
            <CardBody>
              <Typography variant="h6" color="blue-gray" className="mb-4">
                Lead Status Overview
              </Typography>
              <div className="space-y-4">
                {["Hot", "Cold", "Lukewarm"].map((status) => {
                  const count = leads.filter(
                    (lead) => lead.status === status
                  ).length;
                  const percentage = ((count / leads.length) * 100).toFixed(1);
                  return (
                    <div
                      key={status}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center">
                        <span
                          className={`w-3 h-3 rounded-full mr-2 ${
                            status === "Hot"
                              ? "bg-red-500"
                              : status === "Cold"
                              ? "bg-blue-500"
                              : "bg-yellow-500"
                          }`}
                        ></span>
                        <span className="text-gray-700">{status}</span>
                      </div>
                      <div className="flex items-center space-x-4">
                        <span className="text-gray-600">{count} leads</span>
                        <div className="w-32 bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${
                              status === "Hot"
                                ? "bg-red-500"
                                : status === "Cold"
                                ? "bg-blue-500"
                                : "bg-yellow-500"
                            }`}
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                        <span className="text-gray-700 font-medium">
                          {percentage}%
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardBody>
          </Card>
        </div>

        <Card className="bg-white shadow-lg">
          <CardBody>
            <Typography variant="h6" color="blue-gray" className="mb-4">
              Export Reports
            </Typography>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button
                className="bg-blue-500 hover:bg-blue-600 flex items-center justify-center"
                onClick={() => exportReport("leads")}
              >
                <FiDownload className="mr-2" /> Export Leads Report
              </Button>
              <Button
                className="bg-green-500 hover:bg-green-600 flex items-center justify-center"
                onClick={() => exportReport("conversion")}
              >
                <FiDownload className="mr-2" /> Export Conversion Report
              </Button>
              <Button
                className="bg-purple-500 hover:bg-purple-600 flex items-center justify-center"
                onClick={() => exportReport("performance")}
              >
                <FiDownload className="mr-2" /> Export Performance Report
              </Button>
            </div>
          </CardBody>
        </Card>
      </div>
    );
  };

  return (
    <div className="flex min-h-screen bg-white">
      <aside className="w-64 bg-white border-r border-gray-200 text-gray-800 h-screen fixed left-0 top-0 overflow-y-auto z-30">
        <div className="p-6 border-b border-gray-200">
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-2xl font-bold text-gray-800 relative"
          >
            BD Dashboard
            <div className="absolute -bottom-2 left-0 right-0 h-0.5 bg-gray-200 rounded-full"></div>
          </motion.h1>
        </div>

        <nav className="mt-6 px-3">
          <div className="space-y-1">
            {sidebarItems.map((item) => (
              <motion.a
                key={item.name}
                whileHover={{ scale: 1.01, x: 2 }}
                whileTap={{ scale: 0.99 }}
                href="#"
                onClick={() => setActiveSidebarItem(item.name)}
                className={`flex items-center px-4 py-3 rounded-lg transition-all duration-200 group relative overflow-hidden ${
                  activeSidebarItem === item.name
                    ? 'bg-gray-100 text-gray-900'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <div className={`p-2 rounded-lg ${
                  activeSidebarItem === item.name
                    ? 'text-gray-900'
                    : 'text-gray-500'
                } mr-3`}>
                  <item.icon className={`w-5 h-5 transition-transform duration-300 group-hover:scale-110`} />
                </div>
                
                <span className={`font-medium text-sm ${
                  activeSidebarItem === item.name
                    ? 'text-gray-900'
                    : 'text-gray-600'
                }`}>
                  {item.name}
                </span>
                
                {activeSidebarItem === item.name && (
                  <motion.div
                    layoutId="activeIndicator"
                    className="absolute right-2 w-1 h-6 bg-gray-300 rounded-full"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.2 }}
                  />
                )}
              </motion.a>
            ))}
          </div>
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4">
          <div className="p-4 rounded-lg bg-gray-50 border border-gray-200">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="flex flex-col space-y-4"
            >
              <div className="flex items-center">
                <div className="relative">
                  <div className="h-10 w-10 rounded-lg bg-gray-200 flex items-center justify-center shadow-sm">
                    <span className="text-sm font-medium text-gray-600">BD</span>
                  </div>
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-800">Business Development</p>
                  <p className="text-xs text-gray-500 mt-0.5">View Profile</p>
                </div>
              </div>

              <div className="border-t border-gray-200"></div>

              <button 
                onClick={() => {
                  showNotificationMessage('Signing out...', 'success');
                }}
                className="w-full flex items-center justify-center px-4 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all duration-200 space-x-2"
              >
                <FiLogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </motion.div>
          </div>
        </div>
      </aside>

      <main className="flex-1 ml-64 p-8 bg-white">
        <div className="max-w-7xl mx-auto">


          {activeSidebarItem === "Dashboard" && (
            <DashboardView />
          )}
          {activeSidebarItem === "Leads" && (
            <LeadsView />
          )}
          {activeSidebarItem === "Reports" && (
            <ReportsView />
          )}
          {activeSidebarItem === "Settings" && (
            <div className="text-center mt-10">
              <Typography variant="h5" className="text-gray-800">Settings content coming soon...</Typography>
            </div>
          )}

          {showNotification && (
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              className={`fixed bottom-4 right-4 bg-white border ${
                notificationType === "success"
                  ? "border-green-500 text-green-600"
                  : "border-red-500 text-red-600"
              } px-6 py-3 rounded-lg shadow-lg flex items-center`}
            >
              {notificationType === "success" ? (
                <FiCheckSquare className="w-5 h-5 mr-2" />
              ) : (
                <FiX className="w-5 h-5 mr-2" />
              )}
              {notificationMessage}
              <button
                onClick={() => setShowNotification(false)}
                className="ml-4 text-gray-400 hover:text-gray-600 transition-colors duration-200"
              >
                <FiX />
              </button>
            </motion.div>
          )}
        </div>
      </main>
    </div>
  );
}

export default BdDashboard;
