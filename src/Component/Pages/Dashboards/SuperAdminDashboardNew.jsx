import React, { useState, useEffect, useMemo, useRef } from 'react';
import { createPortal } from 'react-dom';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiHome,
  FiUsers,
  FiSettings,
  FiUserPlus,
  FiBarChart2,
  FiBriefcase,
  FiTrendingUp,
  FiDollarSign,
  FiTarget,
  FiActivity,
  FiPieChart,
  FiShield,
  FiDatabase,
  FiCreditCard,
  FiClipboard,
  FiPieChart as FiChart,
  FiX,
  FiUser,
  FiChevronRight,
  FiChevronDown,
  FiMail,
  FiCalendar,
  FiMapPin,
  FiZap,
  FiSearch,
  FiHelpCircle,
  FiLock,
  FiList,
  FiBell,
  FiFileText,
  FiWifi,
  FiTruck,
  FiTool,
  FiCheckSquare,
  FiDownload
} from 'react-icons/fi';
import { FaRupeeSign } from 'react-icons/fa';
import { Line, Doughnut, Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend, Filler } from 'chart.js';
import AdminLayout, { StatCard, StatsBar, DataTable } from './AdminLayout';
import ClientsTab from './Tabs/CRM/ClientsTab';
import TeamTabs from './Tabs/Teamtabs';
import TaskTab from './Tabs/TaskTab';
import AdminTab from './Tabs/AdminTab';
import BdTab from './Tabs/BdTab';
import SettingsTab from './Tabs/SettingsTab';
import ClientPipelineTab from './Tabs/CRM/ClientPipelineTab';
import MyProfileTab from './Tabs/Common/MyProfileTab';
import HiringLifecycleTab from './Tabs/KAMRecruitment/HiringLifecycleTab';
import TeamPerformanceTab from './Tabs/TeamPerformanceTab';
import PolicyTab from './Tabs/KAM/PolicyTab';
import NotesTab from './Tabs/KAM/NotesTab';
import AnnouncementsTab from './Tabs/Common/AnnouncementsTab';
import SuperAdminTaskAssignmentTab from './Tabs/Common/SuperAdminTaskAssignmentTab';
import SuperAdminTotalOpenPositionsTab from './Tabs/Common/SuperAdminTotalOpenPositionsTab';
import SuperAdminInterviewsTab from './Tabs/Common/SuperAdminInterviewsTab';
import SuperAdminShortlistedCandidatesTab from './Tabs/Common/SuperAdminShortlistedCandidatesTab';
import SuperAdminInternalSupportTab from './Tabs/Common/SuperAdminInternalSupportTab';
import BillingInvoicesTab from './Tabs/BillingInvoicesTab';
import ExpenseVendorsTab from './Tabs/ExpenseVendorsTab';
import SuperAdminExternalSupportTab from './Tabs/Common/SuperAdminExternalSupportTab';
import HelpSupportTab from './Tabs/Common/HelpSupportTab';
import SuperAdminAccountsTab from './Tabs/Account/SuperAdminAccountsTab';
import AccountsClientsTab from './Tabs/Account/AccountsClientsTab';
import AccountsEmployeesPayrollTab from './Tabs/Account/AccountsEmployeesPayrollTab';
import AccountsBillingInvoicesTab from './Tabs/Account/AccountsBillingInvoicesTab';
import AccountsExpenseVendorsTab from './Tabs/Account/AccountsExpenseVendorsTab';
import AccountsPendingPaymentsTab from './Tabs/Account/AccountsPendingPaymentsTab';
import ReportsProfitabilityDashboard from './Tabs/Account/ReportsProfitabilityDashboard';
import SuperAdminMISTab from './Tabs/Common/SuperAdminMISTab';
import LeadsTab from './Tabs/Sales/LeadsTab';
import MeetingsTab from './Tabs/Sales/MeetingsTab';
import FollowUpsTab from './Tabs/Sales/FollowUpsTab';
import ProposalsTab from './Tabs/Sales/ProposalsTab';
import ClosuresTab from './Tabs/Sales/ClosuresTab';
import TeamReportTab from './Tabs/Common/TeamReportTab';
import CompleteOnboardingTab from './Tabs/CRM/CompleteOnboardingTab';
import MeetingWithClientTab from './Tabs/CRM/MeetingWithClientTab';
import ClientReportingTab from './Tabs/CRM/ClientReportingTab';
import ClientReviewTab from './Tabs/CRM/ClientReviewTab';
import { getAllClients, getAllTasks, getAllNotifications, markNotificationRead, markAllNotificationsRead, logout, getSuperAdminDashboardStats, getDashboardKpiDetails, getMyProfile } from '../service/api';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend, Filler);

// Sidebar menu configuration matching User's Handwritten Notes
const sidebarConfig = [
  {
    items: [
      {
        id: 'Dashboard',
        title: 'Dashboard',
        icon: FiHome,
      },
      {
        id: 'All Employees',
        title: 'All Employees',
        icon: FiUsers,
      },
      {
        id: 'All Clients',
        title: 'All Clients',
        icon: FiUserPlus,
      },

      {
        id: 'Announcements',
        title: 'Announcements',
        icon: FiBell,
      },
      {
        id: 'Task Assignment',
        title: 'Task Assignment',
        icon: FiCheckSquare,
      },
      {
        id: 'HR Policy',
        title: 'HR Policy',
        icon: FiClipboard,
      },
      {
        id: 'Recruitment Management',
        title: 'Recruitment Management',
        icon: FiBriefcase,
        submenu: [
          { id: 'Total Open Positions', title: 'Total Open Positions' },
          { id: 'Shortlisted Candidates', title: 'Shortlisted Candidates' },
          { id: 'Interviews', title: 'Interviews' },
          { id: 'Joined Candidates', title: 'Joined Candidates' },
        ]
      },
      {
        id: 'Operations Management',
        title: 'Operations Management',
        icon: FiActivity,
        submenu: [
          { id: 'Performance Tracking', title: 'Performance Tracking' },
          { id: 'Resource Allocation', title: 'Resource Allocation' },
        ]
      },
      {
        id: 'CRM Management',
        title: 'CRM Management',
        icon: FiTarget,
        submenu: [
          { id: 'CRM Client Onboarding', title: 'Client Onboarding' },
          { id: 'CRM Client Review', title: 'Client Review' },
          { id: 'CRM Client Meeting', title: 'Client Meeting' },
          { id: 'CRM Client Report', title: 'Client Report' },
        ]
      },
      {
        id: 'Sales Management',
        title: 'Sales Management',
        icon: FaRupeeSign,
        submenu: [
          { id: 'Leads', title: 'Leads' },
          { id: 'Meetings', title: 'Meetings' },
          { id: 'Follow ups', title: 'Follow ups' },
          { id: 'Proposals', title: 'Proposals' },
          { id: 'Closures', title: 'Closures' },
        ]
      },
      {
        id: 'Account Management',
        title: 'Account Management',
        icon: FiCreditCard,
        submenu: [
          { id: 'Accounts Clients', title: 'Clients' },
          { id: 'Accounts Billing & Invoices', title: 'Billing & Invoices' },
          { id: 'Accounts Pending Payments', title: 'Pending Payments' },
          { id: 'Accounts Employees & Payroll', title: 'Employees & Payroll' },
          { id: 'Accounts Expenses & Vendors', title: 'Expenses & Vendors' },
          { id: 'Accounts Reports & Profitability', title: 'Reports & Profitability' }
        ]
      },
      {
        id: 'Help & Support',
        title: 'Help & Support',
        icon: FiHelpCircle,
        submenu: [
          { id: 'Internal', title: 'Internal' },
          { id: 'External', title: 'External' },
        ]
      },
      {
        id: 'MIS Reports',
        title: 'MIS Reports',
        icon: FiClipboard,
      },
      {
        id: 'Team Report',
        title: 'Team Report',
        icon: FiUsers,
      },
      {
        id: 'Notes',
        title: 'Notes',
        icon: FiFileText,
      },
      {
        id: 'My Profile',
        title: 'My Profile',
        icon: FiUser,
      },
    ]
  }
];

// Clients Explorer Component - Standalone for Performance & Stability
const ClientsExplorerModal = ({ isOpen, onClose, clientsList }) => {
  const [selectedClient, setSelectedClient] = useState(null);

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[1100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-[#1A1A2E]/40 backdrop-blur-md"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative w-full max-w-[1160px] bg-[#FFFFFF] rounded-[48px] shadow-2xl overflow-hidden border border-white flex h-[85vh]"
          >
            <div className="flex-1 flex flex-col h-full overflow-hidden">
              <div className="px-12 py-8 border-b border-[#F4F3EF] flex items-center justify-between bg-gradient-to-r from-white to-[#FBFCFF]">
                <h3 className="text-3xl font-bold text-[#1A1A2E] tracking-tight font-syne text-left">
                  Clients
                </h3>
                <button
                  onClick={onClose}
                  className="w-14 h-14 rounded-3xl bg-[#F4F3EF] text-[#6B6B7E] hover:bg-red-50 hover:text-red-500 transition-all flex items-center justify-center shadow-sm group/close"
                >
                  <FiX size={28} className="transition-transform duration-300" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto custom-scrollbar bg-white">
                <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-sm px-12 py-5 border-b border-[#F1F5F9] grid grid-cols-[2fr_1fr] gap-6 text-[11px] font-bold uppercase tracking-[2px] text-[#94A3B8]">
                  <div className="flex items-center gap-5">
                    <div className="w-12 h-12 flex-shrink-0" />
                    <span className="text-left">Client</span>
                  </div>
                  <div className="flex items-center justify-end pr-[58px]">Openings</div>
                </div>

                <div className="px-6">
                  {clientsList.map((client) => (
                    <div
                      key={client.id || client._id}
                      onClick={() => setSelectedClient(client)}
                      className="group grid grid-cols-[2fr_1fr] items-center gap-6 px-6 py-6 border-b border-[#F8FAFC] hover:bg-[#FBFDFF] transition-all cursor-pointer relative"
                    >
                      <div className="flex items-center gap-5">
                        <div className="w-12 h-12 rounded-[14px] bg-[#F8FAFC] text-[#475569] flex items-center justify-center font-bold text-sm border border-[#F1F5F9] group-hover:border-blue-200 group-hover:bg-blue-50 transition-all duration-300">
                          {(client.name || 'C').slice(0, 2).toUpperCase()}
                        </div>
                        <h4 className="text-[15px] font-bold text-[#1e293b] group-hover:text-blue-600 transition-colors leading-tight">
                          {client.name}
                        </h4>
                      </div>
                      <div className="flex items-center justify-end gap-10">
                        <div className="text-right">
                          <p className="text-[14px] font-bold text-[#334155]">{client.jobCount || 0}</p>
                          <p className="text-[9px] font-black text-[#94a3b8] uppercase tracking-tighter">Active</p>
                        </div>
                        <FiChevronRight size={18} className="text-[#CBD5E1] group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <AnimatePresence>
              {selectedClient && (
                <React.Fragment>
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-white/40 backdrop-blur-md z-[55]"
                    onClick={() => setSelectedClient(null)}
                  />
                  <motion.div
                    initial={{ x: '100%' }}
                    animate={{ x: 0 }}
                    exit={{ x: '100%' }}
                    transition={{ type: "spring", damping: 35, stiffness: 250 }}
                    className="absolute inset-y-0 right-0 w-full max-w-[698px] bg-white shadow-2xl border-l border-[#F4F3EF] flex flex-col z-[60] overflow-hidden"
                  >
                    <div className="p-6 border-b border-[#F4F3EF] bg-gradient-to-r from-blue-50/30 to-white flex items-center justify-between">
                      <h3 className="text-xl font-bold text-[#1A1A2E]" style={{ fontFamily: "'Syne', sans-serif" }}>Client Details</h3>
                      <button onClick={() => setSelectedClient(null)} className="w-10 h-10 rounded-2xl flex items-center justify-center text-[#9B9BAD] hover:text-red-500 hover:bg-red-50 transition-all duration-300 shadow-sm">
                        <FiX size={20} />
                      </button>
                    </div>

                    <div className="flex-1 overflow-y-auto custom-scrollbar px-10 py-8 space-y-10">
                      <div className="flex flex-col items-center text-center">
                        <div className="w-24 h-24 rounded-[32px] bg-[#F8FAFC] text-[#475569] flex items-center justify-center text-3xl font-extrabold shadow-xl border border-[#F1F5F9] mb-6">
                          {(selectedClient.name || 'C').slice(0, 2).toUpperCase()}
                        </div>
                        <div className="space-y-1.5">
                          <h4 className="text-2xl font-bold text-[#1A1A2E] tracking-tight" style={{ fontFamily: "'Syne', sans-serif" }}>{selectedClient.name}</h4>
                          <p className="text-[14px] font-bold text-[#1B4DA0] tracking-tight uppercase tracking-[3px]">{selectedClient.industry || 'Technology'} Sector</p>
                        </div>
                      </div>

                      <div className="bg-[#FAFAF8] rounded-[32px] border border-[#F4F3EF] p-10 space-y-8">
                        {[
                          { label: 'Location HQ', value: selectedClient.location || 'Bangalore / Remote' },
                          { label: 'Active Openings', value: `${selectedClient.jobCount || 0} Positions` },
                          { label: 'Total Hires', value: '0 Placements' },
                          { label: 'Hiring SPOC', value: selectedClient.spocName || 'N/A' }
                        ].map((item, idx) => (
                          <div key={idx} className="flex items-center justify-between">
                            <span className="text-sm font-medium text-[#9B9BAD]">{item.label}</span>
                            <span className="text-sm font-bold text-[#1A1A2E]">{item.value}</span>
                          </div>
                        ))}
                      </div>

                      <div className="flex gap-4">
                        <button
                          onClick={() => window.open(`mailto:contact@${selectedClient.name.toLowerCase().replace(/\s/g, '')}.com?subject=Inquiry from Super Admin`, '_blank')}
                          className="flex-1 flex items-center justify-center gap-3 py-4 bg-white border-2 border-[#F4F3EF] rounded-2xl text-[11px] font-black uppercase tracking-widest text-[#6B6B7E] hover:bg-slate-50 transition-all"
                        >
                          <FiMail size={16} /> Contact Client
                        </button>
                        <button
                          onClick={() => window.open('https://meet.google.com/', '_blank')}
                          className="flex-1 flex items-center justify-center gap-3 py-4 bg-[#0D47A1] rounded-2xl text-[11px] font-black uppercase tracking-widest text-white hover:bg-[#0a3a82] shadow-lg shadow-blue-500/10 transition-all"
                        >
                          <FiCalendar size={16} /> Schedule Call
                        </button>
                      </div>
                    </div>
                  </motion.div>
                </React.Fragment>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
};

// Mock Data for KPI Popups
const kpiMockData = {
  'Outstanding': {
    title: 'Outstanding Payments',
    total: '₹0',
    details: []
  },
  'Monthly MRR': {
    title: 'Monthly Recurring Revenue',
    total: '₹0',
    details: []
  },
  'Projected ARR': {
    title: 'Projected Annual Revenue',
    total: '₹0',
    details: []
  },
  'Salaries': {
    title: 'Employee Salaries',
    total: '₹0',
    details: []
  },
  'Rent': {
    title: 'Office Rent & Maintenance',
    total: '₹0',
    details: []
  }
};

const DashboardKpiModal = ({ isOpen, onClose, type, data, loading, setSelectedInvoice }) => {
  const [searchTerm, setSearchTerm] = useState('');

  if (!isOpen) return null;

  const isInvoiceType = ['total_monthly_billing', 'total_yearly_revenue', 'operations_billing', 'recruitment_billing', 'sales_revenue', 'total_revenue', 'pending_collections'].includes(type);

  const getTitle = () => {
    switch (type) {
      case 'clients': return 'Active Clients';
      case 'admins': return 'Total Admins';
      case 'kams': return 'Total KAMs';
      case 'employees': return 'Active Employees';
      case 'total_monthly_billing': return 'Total Monthly Billing';
      case 'total_yearly_revenue': return 'Total Yearly Revenue';
      case 'operations_billing': return 'Operations Billing';
      case 'recruitment_billing': return 'Recruitment Billing';
      case 'sales_revenue': return 'Sales Department Revenue';
      case 'salary_payout': return 'Salary Payout';
      case 'office_rent': return 'Office Rent & Expenses';
      case 'net_profit': return 'Net Profit';
      case 'total_revenue': return 'Total Revenue';
      case 'pending_collections': return 'Pending Collections';
      default: return 'KPI Details';
    }
  };

  const filteredData = (data || []).filter(item => {
    const term = searchTerm.toLowerCase();
    return (
      (item.name || '').toLowerCase().includes(term) ||
      (item.email || '').toLowerCase().includes(term) ||
      (item.phone || '').toLowerCase().includes(term) ||
      (item.role || '').toLowerCase().includes(term) ||
      (item.designation || '').toLowerCase().includes(term) ||
      (item.department || '').toLowerCase().includes(term) ||
      (item.industry || '').toLowerCase().includes(term) ||
      (item.location || '').toLowerCase().includes(term) ||
      (item.ref || '').toLowerCase().includes(term)
    );
  });

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[200000] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-[#1A1A2E]/60 backdrop-blur-xl"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative w-full max-w-5xl bg-white rounded-[40px] shadow-2xl overflow-hidden border border-[#F4F3EF] z-[200001] flex flex-col h-[75vh]"
          >
            {/* Modal Header */}
            <div className="px-10 py-6 border-b border-[#F4F3EF] flex items-center justify-between bg-gradient-to-r from-blue-50/20 to-white">
              <div className="text-left">
                <h3 className="text-2xl font-bold text-[#1A1A2E] font-syne">{getTitle()}</h3>
                <p className="text-[10px] font-black text-[#1B4DA0] uppercase tracking-widest mt-1">Live Database Records</p>
              </div>
              
              {/* Search input inside modal */}
              <div className="relative flex-1 max-w-xs mx-6">
                <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9B9BAD]" size={16} />
                <input
                  type="text"
                  placeholder="Search records..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-[#F4F3EF] border-none rounded-xl py-2.5 pl-10 pr-4 text-xs font-semibold focus:ring-2 focus:ring-[#F4F3EF]/50 outline-none transition-all placeholder:text-[#9B9BAD]"
                />
              </div>

              <button onClick={onClose} className="w-10 h-10 rounded-2xl bg-[#F4F3EF] text-[#9B9BAD] hover:text-red-500 hover:bg-red-50 transition-all flex items-center justify-center">
                <FiX size={20} />
              </button>
            </div>

            {/* Modal Content / Table */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-10 bg-white">
              {loading ? (
                <div className="flex flex-col items-center justify-center h-full py-20">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1B4DA0] mb-4"></div>
                  <p className="text-xs font-bold text-[#9B9BAD] uppercase tracking-wider">Loading real-time records...</p>
                </div>
              ) : filteredData.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full py-20 text-center">
                  <FiUsers size={48} className="text-[#9B9BAD] mb-4 opacity-30" />
                  <p className="text-sm font-bold text-slate-800">No records found</p>
                  <p className="text-xs text-[#9B9BAD] mt-1">Try resetting your search query or verify database records.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-[#F4F3EF]">
                        <th className="text-left pb-4 text-[10px] uppercase tracking-[2px] text-[#9B9BAD] font-black">Name</th>
                        <th className="text-left pb-4 text-[10px] uppercase tracking-[2px] text-[#9B9BAD] font-black">Email</th>
                        <th className="text-left pb-4 text-[10px] uppercase tracking-[2px] text-[#9B9BAD] font-black">Phone</th>
                        {type === 'clients' ? (
                          <>
                            <th className="text-left pb-4 text-[10px] uppercase tracking-[2px] text-[#9B9BAD] font-black">Sector</th>
                            <th className="text-left pb-4 text-[10px] uppercase tracking-[2px] text-[#9B9BAD] font-black">Location</th>
                          </>
                        ) : ['total_monthly_billing', 'total_yearly_revenue', 'operations_billing', 'recruitment_billing', 'sales_revenue', 'salary_payout', 'office_rent', 'net_profit', 'total_revenue', 'pending_collections'].includes(type) ? (
                          <>
                            <th className="text-left pb-4 text-[10px] uppercase tracking-[2px] text-[#9B9BAD] font-black">Amount</th>
                            <th className="text-left pb-4 text-[10px] uppercase tracking-[2px] text-[#9B9BAD] font-black">Reference</th>
                          </>
                        ) : (
                          <>
                            <th className="text-left pb-4 text-[10px] uppercase tracking-[2px] text-[#9B9BAD] font-black">Role / Designation</th>
                            <th className="text-left pb-4 text-[10px] uppercase tracking-[2px] text-[#9B9BAD] font-black">Department</th>
                          </>
                        )}
                        <th className="text-left pb-4 text-[10px] uppercase tracking-[2px] text-[#9B9BAD] font-black">Status</th>
                        {isInvoiceType && <th className="text-left pb-4 text-[10px] uppercase tracking-[2px] text-[#9B9BAD] font-black">Action</th>}
                      </tr>
                    </thead>
                    <tbody>
                      {filteredData.map((item, idx) => (
                        <tr key={item.id || idx} className="border-b border-[#F8F8F8] hover:bg-[#FAFBFF] transition-all">
                          <td className="py-4 font-bold text-[#1A1A2E] text-sm text-left">{item.name}</td>
                          <td className="py-4 text-slate-600 text-sm text-left">{item.email}</td>
                          <td className="py-4 text-slate-500 text-sm text-left font-semibold">{item.phone}</td>
                          {type === 'clients' ? (
                            <>
                              <td className="py-4 text-left">
                                <span className="px-2.5 py-1 rounded-lg bg-blue-50 text-[#1B4DA0] text-[10px] font-black uppercase tracking-wider">
                                  {item.industry}
                                </span>
                              </td>
                              <td className="py-4 text-slate-500 text-sm text-left truncate max-w-xs">{item.location}</td>
                            </>
                          ) : ['total_monthly_billing', 'total_yearly_revenue', 'operations_billing', 'recruitment_billing', 'sales_revenue', 'salary_payout', 'office_rent', 'net_profit', 'total_revenue', 'pending_collections'].includes(type) ? (
                            <>
                              <td className="py-4 text-left">
                                <span className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase tracking-wider">
                                  {item.amount || 'N/A'}
                                </span>
                              </td>
                              <td className="py-4 text-slate-500 text-sm text-left truncate max-w-xs">{item.ref || item.id || 'N/A'}</td>
                            </>
                          ) : (
                            <>
                              <td className="py-4 text-left">
                                <span className="px-2.5 py-1 rounded-lg bg-purple-50 text-purple-600 text-[10px] font-black uppercase tracking-wider">
                                  {item.designation || item.role || 'Member'}
                                </span>
                              </td>
                              <td className="py-4 text-slate-600 text-sm text-left font-bold">{item.department || 'N/A'}</td>
                            </>
                          )}
                          <td className="py-4 text-left">
                            <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${
                              String(item.status).toLowerCase() === 'active' || String(item.status).toLowerCase() === 'accepted' || String(item.status).toLowerCase() === 'paid'
                                ? 'bg-emerald-50 text-emerald-600'
                                : 'bg-rose-50 text-rose-500'
                            }`}>
                              {item.status}
                            </span>
                          </td>
                          {isInvoiceType && (
                            <td className="py-4 text-left">
                              <button
                                onClick={() => setSelectedInvoice(item)}
                                className="px-3 py-1.5 rounded-lg bg-[#F4F3EF] hover:bg-[#1B4DA0] hover:text-white transition-all text-[10px] font-black uppercase tracking-widest"
                              >
                                View
                              </button>
                            </td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-10 py-6 bg-[#F8FAFC] border-t border-[#F4F3EF] flex items-center justify-between">
              <p className="text-[11px] font-bold text-[#9B9BAD]">Showing {filteredData.length} records</p>
              <button onClick={onClose} className="px-6 py-2.5 bg-white border border-[#F4F3EF] rounded-xl text-[10px] font-black uppercase tracking-widest text-[#1A1A2E] hover:bg-gray-50 transition-all shadow-sm">
                Close View
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
};

const KpiDetailModal = ({ isOpen, onClose, kpiType }) => {
  const data = kpiMockData[kpiType];
  if (!data) return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[200000] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-[#1A1A2E]/60 backdrop-blur-xl"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-md bg-white rounded-[40px] shadow-2xl overflow-hidden border border-[#F4F3EF] z-[200001]"
          >
            <div className="p-8 border-b border-[#F4F3EF] flex items-center justify-between bg-gradient-to-r from-blue-50/20 to-white">
              <div className="text-left">
                <h3 className="text-xl font-bold text-[#1A1A2E] font-syne">{data.title}</h3>
                <p className="text-[11px] font-black text-[#1B4DA0] uppercase tracking-widest mt-1">Detailed Breakdown</p>
              </div>
              <button onClick={onClose} className="w-10 h-10 rounded-2xl bg-[#F4F3EF] text-[#9B9BAD] hover:text-red-500 transition-all flex items-center justify-center">
                <FiX size={20} />
              </button>
            </div>

            <div className="p-8 space-y-6">
              <div className="bg-[#FAFAF8] rounded-3xl p-6 border border-[#F4F3EF] text-center">
                <p className="text-[10px] font-black text-[#9B9BAD] uppercase tracking-widest mb-1">Total Value</p>
                <p className="text-4xl font-black text-[#1A1A2E] tracking-tight">{data.total}</p>
              </div>

              <div className="space-y-3 max-h-[300px] overflow-y-auto custom-scrollbar pr-2">
                {data.details.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between p-4 bg-white rounded-2xl border border-[#F4F3EF] hover:border-blue-100 transition-all group text-left">
                    <div>
                      <p className="text-sm font-bold text-[#1A1A2E]">{item.name || item.department || item.category || item.location}</p>
                      <p className="text-[10px] font-medium text-[#9B9BAD]">
                        {item.status || item.dueDate || (item.count ? `${item.count} Units` : item.type) || ''}
                      </p>
                    </div>
                    <p className="text-sm font-black text-[#1B4DA0] group-hover:scale-110 transition-transform">{item.amount}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-8 bg-[#F8FAFC] border-t border-[#F4F3EF] flex justify-end">
              <button onClick={onClose} className="px-8 py-4 bg-white border border-[#F4F3EF] rounded-2xl text-[11px] font-black uppercase tracking-widest text-[#1A1A2E] hover:bg-gray-50 transition-all shadow-sm">
                Close Report
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
};

const InvoiceDetailDrawer = ({ isOpen, onClose, invoice, handleDownload }) => {
  return createPortal(
    <AnimatePresence>
      {isOpen && invoice && (
        <React.Fragment>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-[#1A1A2E]/40 backdrop-blur-md z-[300000]"
            onClick={onClose}
          />

          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: "spring", damping: 30, stiffness: 200 }}
            className="fixed inset-y-0 right-0 w-full max-w-[698px] bg-[#F8FAFC] shadow-2xl border-l border-[#F4F3EF] flex flex-col z-[300001] overflow-hidden text-left"
            style={{ fontFamily: "'Calibri', sans-serif" }}
          >
            <div className="flex-none p-8 bg-white border-b border-[#E2E8F0]">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-3xl font-bold text-[#0F172A] font-syne mb-2">Invoice Details</h2>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-bold text-[#64748B]">{invoice.id || invoice.ref}</span>
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest
                      ${invoice.status === 'Paid' || invoice.status === 'Active' ? 'bg-emerald-50 text-emerald-600' : 
                        invoice.status === 'Pending' || invoice.status === 'Sent' ? 'bg-amber-50 text-amber-600' : 
                        invoice.status === 'Overdue' ? 'bg-red-50 text-red-500' : 
                        'bg-gray-100 text-gray-600'}`}
                    >
                      {invoice.status}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => handleDownload(invoice)}
                    className="w-10 h-10 rounded-xl bg-[#F1F5F9] text-[#64748B] flex items-center justify-center hover:bg-[#E2E8F0] hover:text-[#0F172A] transition-all"
                    title="Download Invoice Document"
                  >
                    <FiDownload size={18} />
                  </button>
                  <button
                    onClick={onClose}
                    className="w-10 h-10 rounded-xl bg-red-50 text-[#EF4444] flex items-center justify-center hover:bg-red-100 transition-all ml-2"
                  >
                    <FiX size={20} />
                  </button>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-8 space-y-6 bg-white">
              <div className="grid grid-cols-2 gap-6">
                <div className="bg-[#F8FAFC] p-6 rounded-[24px] border border-[#E2E8F0] shadow-sm">
                  <p className="text-[10px] font-black text-[#94A3B8] uppercase tracking-widest mb-1">Billed To</p>
                  <p className="text-[16px] font-bold text-[#0F172A]">{invoice.client || invoice.name}</p>
                  <p className="text-[13px] font-medium text-[#64748B] mt-2 flex items-center gap-2">
                    <FiMail size={14} /> {invoice.email || `accounts@${(invoice.client || invoice.name || 'company').toLowerCase().replace(/\s+/g, '')}.com`}
                  </p>
                  <p className="text-[13px] font-medium text-[#64748B] mt-1">SPOC: {invoice.spoc || 'N/A'}</p>
                </div>
                <div className="bg-[#F8FAFC] p-6 rounded-[24px] border border-[#E2E8F0] shadow-sm">
                  <p className="text-[10px] font-black text-[#94A3B8] uppercase tracking-widest mb-1">Invoice Info</p>
                  <p className="text-[14px] font-bold text-[#0F172A] mt-2">Date: <span className="font-medium text-[#64748B]">{invoice.date}</span></p>
                  <p className="text-[14px] font-bold text-[#0F172A] mt-1">Due Date: <span className="font-medium text-[#64748B]">{invoice.dueDate}</span></p>
                  <p className="text-[14px] font-bold text-[#0F172A] mt-1">Department: <span className="font-medium text-[#64748B]">{invoice.dept || 'N/A'}</span></p>
                </div>
              </div>

              <div className="bg-[#F8FAFC] rounded-[24px] border border-[#E2E8F0] shadow-sm overflow-hidden">
                <div className="p-6 border-b border-[#E2E8F0] bg-white">
                  <h3 className="text-[14px] font-bold text-[#0F172A] uppercase tracking-wider">Payment Breakdown</h3>
                </div>
                <div className="p-6 space-y-4">
                  <div className="flex justify-between items-center text-[14px]">
                    <span className="font-bold text-[#64748B]">Subtotal</span>
                    <span className="font-black text-[#0F172A]">{invoice.amount}</span>
                  </div>
                  <div className="flex justify-between items-center text-[14px]">
                    <span className="font-bold text-[#64748B]">GST (18%)</span>
                    <span className="font-black text-[#0F172A]">
                      {invoice.gst && invoice.gst.includes('₹') ? invoice.gst.split('₹')[1]?.replace(/[()]/g, '') : invoice.gst || 'N/A'}
                    </span>
                  </div>
                  <div className="w-full h-px bg-[#E2E8F0] my-4"></div>
                  <div className="flex justify-between items-center text-[18px]">
                    <span className="font-black text-[#0F172A]">Total Amount</span>
                    <span className="font-black text-blue-600">{invoice.total || invoice.amount}</span>
                  </div>
                </div>
              </div>

              {invoice.invoiceFileName && (
                <div className="bg-[#F8FAFC] p-6 rounded-[24px] border border-[#E2E8F0] shadow-sm space-y-3">
                  <p className="text-[10px] font-black text-[#94A3B8] uppercase tracking-widest mb-1">Attached Document</p>
                  <div className="p-3 bg-white rounded-xl border border-gray-100 flex items-center justify-between">
                    <div className="flex items-center gap-2 overflow-hidden flex-1">
                      <FiClipboard className="text-blue-500 flex-shrink-0" size={16} />
                      <span className="text-xs font-bold text-[#0F172A] truncate" title={invoice.invoiceFileName}>
                        {invoice.invoiceFileName}
                      </span>
                    </div>
                    <button
                      onClick={() => handleDownload(invoice)}
                      className="px-3 py-1 bg-blue-50 text-blue-700 text-[10px] font-black uppercase tracking-wider rounded-lg hover:bg-blue-100 transition-all flex items-center gap-1"
                    >
                      <FiDownload size={12} /> Download
                    </button>
                  </div>

                  {invoice.invoiceFileData && (
                    <div className="mt-2 p-2 bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm flex flex-col items-center justify-center min-h-[150px]">
                      {invoice.invoiceFileData.startsWith('data:image/') ? (
                        <img
                          src={invoice.invoiceFileData}
                          alt="Invoice Preview"
                          className="max-w-full max-h-[300px] object-contain rounded-xl hover:scale-[1.01] transition-all cursor-zoom-in"
                          onClick={() => {
                            const imgWindow = window.open();
                            imgWindow.document.write(`<img src="${invoice.invoiceFileData}" style="max-width:100%;" />`);
                          }}
                        />
                      ) : invoice.invoiceFileData.startsWith('data:application/pdf') ? (
                        <iframe
                          src={invoice.invoiceFileData}
                          title="Invoice PDF Preview"
                          className="w-full h-[300px] rounded-xl border-none"
                        ></iframe>
                      ) : (
                        <div className="text-center p-4">
                          <p className="text-xs font-bold text-[#64748B]">Document Preview Not Available</p>
                          <p className="text-[10px] text-[#94A3B8] mt-1">Use download button to save and view the file.</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {(invoice.status === 'Pending' || invoice.status === 'Sent' || invoice.status === 'Overdue') && (
                <div className="bg-amber-50 p-6 rounded-[24px] border border-amber-200">
                  <h3 className="text-[14px] font-bold text-amber-800 uppercase tracking-wider mb-2">Action Required</h3>
                  <p className="text-[13px] text-amber-700">This invoice is awaiting payment. A reminder can be dispatched to speed up collections.</p>
                  <button 
                    onClick={() => toast.success('Payment reminder sent to client!')}
                    className="mt-4 px-6 py-3 rounded-xl bg-amber-500 text-white text-xs font-black uppercase tracking-widest hover:bg-amber-600 transition-all"
                  >
                    Send Reminder
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        </React.Fragment>
      )}
    </AnimatePresence>,
    document.body
  );
};

const SuperAdminDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(() => localStorage.getItem('superadmin_active_tab') || 'Dashboard');
  const [selectedKpi, setSelectedKpi] = useState(null);
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  const [showKpiModal, setShowKpiModal] = useState(false);
  const [kpiModalType, setKpiModalType] = useState(null);
  const [kpiModalData, setKpiModalData] = useState([]);
  const [kpiModalLoading, setKpiModalLoading] = useState(false);

  const handleKpiCardClick = async (type) => {
    setKpiModalType(type);
    setShowKpiModal(true);
    setKpiModalLoading(true);

    try {
      const response = await getDashboardKpiDetails(type);

      console.log("TYPE =", type);
      console.log("FULL RESPONSE =", response);
      console.log("DATA =", response?.data);

      if (response?.success) {
        setKpiModalData(response.data || []);
      } else if (response?.data?.success) {
        setKpiModalData(response.data.data || []);
      } else {
        setKpiModalData([]);
      }

    } catch (error) {
      console.log(error);
      setKpiModalData([]);
    } finally {
      setKpiModalLoading(false);
    }
  };

  const handleDownloadInvoice = (invoice) => {
    if (!invoice) return;
    if (invoice.invoiceFileData) {
      try {
        const parts = invoice.invoiceFileData.split(';base64,');
        const contentType = parts[0].split(':')[1];
        const base64ToBlob = (base64Data, contentType) => {
          const byteCharacters = atob(base64Data.split(',')[1] || base64Data);
          const byteArrays = [];
          for (let offset = 0; offset < byteCharacters.length; offset += 512) {
            const slice = byteCharacters.slice(offset, offset + 512);
            const byteNumbers = new Array(slice.length);
            for (let i = 0; i < slice.length; i++) {
              byteNumbers[i] = slice.charCodeAt(i);
            }
            const byteArray = new Uint8Array(byteNumbers);
            byteArrays.push(byteArray);
          }
          return new Blob(byteArrays, { type: contentType });
        };
        const blob = base64ToBlob(invoice.invoiceFileData, contentType);
        const blobUrl = URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.href = blobUrl;
        link.download = invoice.invoiceFileName || `Invoice_${invoice.id}`;
        link.click();
        
        setTimeout(() => URL.revokeObjectURL(blobUrl), 100);
        toast.success(`Downloaded attached file: ${invoice.invoiceFileName}`);
        return;
      } catch (err) {
        console.error('Blob download failed, trying direct link:', err);
        const link = document.createElement('a');
        link.href = invoice.invoiceFileData;
        link.download = invoice.invoiceFileName || `Invoice_${invoice.id}`;
        link.click();
        toast.success(`Downloaded attached file: ${invoice.invoiceFileName}`);
        return;
      }
    }

    // Fallback: Generate a text invoice receipt
    const textContent = `MABICONS ERP - BILLING INVOICE
=================================
Invoice ID: ${invoice.id || invoice.ref || 'N/A'}
Client: ${invoice.client || invoice.name || 'N/A'}
Contact Email: ${invoice.email || 'N/A'}
Department: ${invoice.dept || 'N/A'}
Amount: ${invoice.amount}
GST: ${invoice.gst}
Total Amount: ${invoice.total || invoice.amount}
Date: ${invoice.date}
Due Date: ${invoice.dueDate}
Status: ${invoice.status}
`;
    const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `Invoice_Receipt_${invoice.id || invoice.ref || 'Receipt'}.txt`;
    link.click();
    toast.success('Invoice receipt text file downloaded successfully!');
  };

  const [notifications, setNotifications] = useState([]);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const notificationRef = useRef(null);

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

  useEffect(() => {
    localStorage.setItem('superadmin_active_tab', activeTab);
  }, [activeTab]);

  const [loading, setLoading] = useState(true);
  const [revenueFilter, setRevenueFilter] = useState('This Year');
  const [customDateRange, setCustomDateRange] = useState({ start: '', end: '' });
  const [customMonth, setCustomMonth] = useState('');
  const [customYear, setCustomYear] = useState('');
  const [summaryData, setSummaryData] = useState({
    totalRevenue: '₹0',
    activeClients: 0,
    totalHiring: 0,
    activeEmployees: 0,
    totalAdmins: 0,
    totalKAMs: 0,
    retentionRate: '0%',
    outstandingPayment: '₹0',
    totalMRR: '₹0',
    projectedARR: '₹0',
    totalSalaries: '₹0',
    totalRent: '₹0'
  });

  const [showClientsModal, setShowClientsModal] = useState(false);
  const [selectedClientForModal, setSelectedClientForModal] = useState(null);
  const [clientsList, setClientsList] = useState([]);

  const [userInfo, setUserInfo] = useState({ name: 'Ashish', role: 'Super Admin', avatar: '', picture: '' });

  const refreshUserInfo = () => {
    const token = localStorage.getItem('token');
    const localName = localStorage.getItem('userName');
    const localRole = localStorage.getItem('userType');
    const localPic = localStorage.getItem('userPicture');
    let decodedName = 'Ashish';
    let decodedRole = 'Super Admin';
    if (token) {
      try {
        const decoded = JSON.parse(atob(token.split('.')[1]));
        decodedName = decoded.name || 'Ashish';
        decodedRole = decoded.userType || decoded.role || 'Super Admin';
      } catch (e) { }
    }
    setUserInfo({
      name: localName || decodedName,
      role: localRole || decodedRole,
      avatar: localPic || '',
      picture: localPic || ''
    });
  };

  useEffect(() => {
    window.addEventListener('profileUpdate', refreshUserInfo);

    // Sync latest user profile from backend on mount
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

  const loadAllData = async () => {
    try {
      const [clientsRes, statsRes] = await Promise.allSettled([
        getAllClients(),
        getSuperAdminDashboardStats()
      ]);
      if (clientsRes.status === 'fulfilled' && clientsRes.value?.success) {
        setClientsList(clientsRes.value.data || []);
      }
      if (statsRes.status === 'fulfilled' && statsRes.value?.success) {
        setSummaryData(prev => ({
          ...prev,
          ...statsRes.value.data
        }));
      }
    } catch (error) {
      console.error("Failed to fetch superadmin dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshUserInfo();
    loadAllData();
    const interval = setInterval(loadAllData, 15000);
    return () => clearInterval(interval);
  }, []);

  const getFilteredChartData = () => {
    let labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    let revenueData = [120, 150, 180, 200, 250, 280].map(v => v * 1000);
    let expenseData = [80, 90, 110, 120, 140, 150].map(v => v * 1000);

    if (revenueFilter === 'This Year') {
        labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        revenueData = [120, 150, 180, 200, 250, 280, 300, 320, 350, 380, 400, 450].map(v => v * 1000);
        expenseData = [80, 90, 110, 120, 140, 150, 160, 180, 200, 210, 220, 250].map(v => v * 1000);
    } else if (revenueFilter === 'Last Year') {
        labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        revenueData = [100, 120, 140, 160, 180, 200, 220, 240, 260, 280, 300, 320].map(v => v * 1000);
        expenseData = [60, 70, 80, 90, 100, 110, 120, 130, 140, 150, 160, 170].map(v => v * 1000);
    } else if (revenueFilter === 'This Week') {
        labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
        revenueData = [5, 8, 12, 15, 10, 6, 4].map(v => v * 1000);
        expenseData = [3, 4, 6, 7, 5, 2, 1].map(v => v * 1000);
    } else if (revenueFilter === 'Month') {
        labels = ['Week 1', 'Week 2', 'Week 3', 'Week 4'];
        revenueData = [45, 55, 60, 50].map(v => v * 1000);
        expenseData = [25, 30, 35, 28].map(v => v * 1000);
    } else if (revenueFilter === 'Year') {
        labels = ['Q1', 'Q2', 'Q3', 'Q4'];
        revenueData = [450, 730, 970, 1230].map(v => v * 1000);
        expenseData = [280, 410, 520, 680].map(v => v * 1000);
    } else if (revenueFilter === 'Custom Date') {
        labels = ['Start', 'Mid', 'End'];
        revenueData = [150, 200, 250].map(v => v * 1000);
        expenseData = [90, 120, 140].map(v => v * 1000);
    }

    if (summaryData.monthlyChartLabels && summaryData.monthlyChartLabels.length > 0 && revenueFilter === 'This Year') {
        labels = summaryData.monthlyChartLabels;
        revenueData = summaryData.monthlyRevenue || revenueData;
        expenseData = summaryData.monthlyExpenses || expenseData;
    }

    return { labels, revenueData, expenseData };
  };

  const chartDataComputed = getFilteredChartData();

  // Billing Chart Data
  const billingChartData = {
    labels: chartDataComputed.labels,
    datasets: [
      {
        label: 'Revenue',
        data: chartDataComputed.revenueData,
        borderColor: '#3D37F1',
        backgroundColor: 'rgba(61, 55, 241, 0.1)',
        fill: true,
        tension: 0.4
      },
      {
        label: 'Expenses',
        data: chartDataComputed.expenseData,
        borderColor: '#EF4444',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        fill: true,
        tension: 0.4
      }
    ]
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'All Clients':
        return <ClientsTab notificationBell={renderNotificationBell()} />;

      case 'Accounts':
      case 'Account Management':
        return <SuperAdminAccountsTab notificationBell={renderNotificationBell()} />;
      case 'Accounts Clients':
      case 'Clients':
        return <AccountsClientsTab notificationBell={renderNotificationBell()} />;
      case 'Accounts Employees & Payroll':
      case 'Employees & Payroll':
        return <AccountsEmployeesPayrollTab notificationBell={renderNotificationBell()} />;
      case 'Accounts Billing & Invoices':
      case 'Billing & Invoices':
        return <AccountsBillingInvoicesTab notificationBell={renderNotificationBell()} readOnly={true} />;
      case 'Accounts Expenses & Vendors':
      case 'Expenses & Vendors':
      case 'Expense & Vendors':
        return <AccountsExpenseVendorsTab notificationBell={renderNotificationBell()} readOnly={true} />;
      case 'Accounts Pending Payments':
      case 'Pending Payments':
        return <AccountsPendingPaymentsTab notificationBell={renderNotificationBell()} readOnly={true} />;
      case 'Accounts Reports & Profitability':
      case 'Reports & Profitability':
        return <ReportsProfitabilityDashboard notificationBell={renderNotificationBell()} readOnly={true} />;

      case 'Recruitment Management':
        return <HiringLifecycleTab notificationBell={renderNotificationBell()} />;
      case 'Total Open Positions':
        return <SuperAdminTotalOpenPositionsTab notificationBell={renderNotificationBell()} />;
      case 'Interviews':
        return <SuperAdminInterviewsTab notificationBell={renderNotificationBell()} />;
      case 'Shortlisted Candidates':
        return <SuperAdminShortlistedCandidatesTab notificationBell={renderNotificationBell()} />;
      case 'Joined Candidates':
        return <HiringLifecycleTab notificationBell={renderNotificationBell()} />;

      case 'Team Performance':
        return <TeamPerformanceTab fixedDepartment="HR Recruitment" notificationBell={renderNotificationBell()} />;

      case 'Company Overview':
      case 'Analytics':
        return (
          <div className="space-y-8 animate-in fade-in duration-500 text-left">
            <div className="flex items-center justify-between mb-8">
              <h1 className="text-3xl font-bold text-[#1A1A2E] font-syne">Analytics & Insights</h1>
              <div className="flex items-center gap-3">
                {renderNotificationBell()}
              </div>
            </div>
            <div className="flex flex-col items-center justify-center h-[50vh] text-center bg-white rounded-[32px] border border-[#F4F3EF] shadow-sm p-8">
              <FiPieChart size={64} className="text-blue-500 mb-4 opacity-20" />
              <h2 className="text-2xl font-bold text-slate-800">Analytics & Insights</h2>
              <p className="text-slate-500 max-w-md mt-2">Comprehensive business analytics and company-wide overview reports are being generated.</p>
            </div>
          </div>
        );

      case 'All Employees':
        return <TeamTabs notificationBell={renderNotificationBell()} />;

      case 'Operations Management':
        return (
          <div className="space-y-8 animate-in fade-in duration-500 text-left">
            <div className="flex items-center justify-between mb-8">
              <h1 className="text-3xl font-bold text-[#1A1A2E] font-syne">Operations Management</h1>
              <div className="flex items-center gap-3">
                {renderNotificationBell()}
              </div>
            </div>
            <div className="flex flex-col items-center justify-center h-[50vh] text-center bg-white rounded-[32px] border border-[#F4F3EF] shadow-sm p-8">
              <FiActivity size={64} className="text-blue-500 mb-4 opacity-20" />
              <h2 className="text-2xl font-bold text-slate-800">Operations Management</h2>
              <p className="text-slate-500 max-w-md mt-2">Operational efficiency modules are being prepared.</p>
            </div>
          </div>
        );
      case 'Resource Allocation':
        return <TaskTab isDarkMode={false} notificationBell={renderNotificationBell()} />;
      case 'Performance Tracking':
        return <TeamPerformanceTab fixedDepartment="HR Operations" notificationBell={renderNotificationBell()} />;

      case 'CRM Management':
      case 'CRM Client Onboarding':
      case 'Client Onboarding':
        return <CompleteOnboardingTab notificationBell={renderNotificationBell()} />;
      case 'CRM Client Review':
      case 'Client Review':
        return <ClientReviewTab notificationBell={renderNotificationBell()} />;
      case 'CRM Client Meeting':
      case 'Client Meeting':
        return <MeetingWithClientTab clients={clientsList} notificationBell={renderNotificationBell()} />;
      case 'CRM Client Report':
      case 'Client Report':
        return <ClientReportingTab clients={clientsList} notificationBell={renderNotificationBell()} />;

      case 'Leads':
        return <LeadsTab notificationBell={renderNotificationBell()} readOnly={true} />;
      case 'Meetings':
        return <MeetingsTab notificationBell={renderNotificationBell()} readOnly={true} />;
      case 'Follow ups':
        return <FollowUpsTab notificationBell={renderNotificationBell()} readOnly={true} />;
      case 'Proposals':
        return <ProposalsTab notificationBell={renderNotificationBell()} readOnly={true} />;
      case 'Closures':
        return <ClosuresTab notificationBell={renderNotificationBell()} readOnly={true} />;

      case 'Help & Support':
      case 'Internal':
        return <HelpSupportTab userRole={userInfo.role} userName={userInfo.name} />;
      case 'External':
        return <SuperAdminExternalSupportTab notificationBell={renderNotificationBell()} />;

      case 'Announcements':
        return <AnnouncementsTab department="All" isHead={true} notificationBell={renderNotificationBell()} />;

      case 'Task Assignment':
        return <SuperAdminTaskAssignmentTab notificationBell={renderNotificationBell()} />;

      case 'HR Policy':
        return <PolicyTab isDarkMode={false} notificationBell={renderNotificationBell()} />;

      case 'Notes':
        return <NotesTab department="Super Admin" notificationBell={renderNotificationBell()} />;

      case 'Settings':
      case 'My Profile':
        return <MyProfileTab onProfileUpdate={refreshUserInfo} />;

      case 'MIS Overview':
      case 'MIS Reports':
        return <SuperAdminMISTab notificationBell={renderNotificationBell()} />;

      case 'Team Report':
        return <TeamReportTab notificationBell={renderNotificationBell()} />;

      default:
      case 'Dashboard':
      case 'Total Revenue':
      case 'Total Clients':
      case 'Active Employees':
        return (
          <div className="space-y-12">
            {/* Sticky Welcome Header */}
            <div className="sticky top-0 z-[30] bg-[#FDFDFD]/80 backdrop-blur-md -mt-6 -mx-6 px-6 py-6 mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100/50">
              <div className="flex flex-col items-start text-left">
                <h2 className="text-3xl font-bold text-slate-900 mb-1">
                  Welcome {userInfo.name.split(' ')[0]}
                </h2>
              </div>
              <div className="flex items-center gap-3">
                {renderNotificationBell()}
              </div>
            </div>

            {/* Financial KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">

              <StatCard
                title="Total Monthly Billing"
                value={summaryData.totalMonthlyBilling || "₹0"}
                icon={FaRupeeSign}
                color="white"
                onClick={() => handleKpiCardClick('total_monthly_billing')}
              />

              <StatCard
                title="Total Yearly Revenue"
                value={summaryData.totalYearlyRevenue || "₹0"}
                icon={FiTrendingUp}
                color="white"
                onClick={() => handleKpiCardClick('total_yearly_revenue')}
              />

              <StatCard
                title="Operations Billing"
                value={summaryData.operationsBilling || "₹0"}
                icon={FiActivity}
                color="white"
                onClick={() => handleKpiCardClick('operations_billing')}
              />

              <StatCard
                title="Recruitment Billing"
                value={summaryData.recruitmentBilling || "₹0"}
                icon={FiBriefcase}
                color="white"
                onClick={() => handleKpiCardClick('recruitment_billing')}
              />

              <StatCard
                title="Sales Department Revenue"
                value={summaryData.crmConvertedRevenue || "₹0"}
                icon={FiTarget}
                color="white"
                onClick={() => handleKpiCardClick('sales_revenue')}
              />

              <StatCard
                title="Salary Payout"
                value={summaryData.salaryPayout || "₹0"}
                icon={FiUsers}
                color="white"
                onClick={() => handleKpiCardClick('salary_payout')}
              />

              <StatCard
                title="Office Rent & Expenses"
                value={summaryData.officeRentExpenses || "₹0"}
                icon={FiHome}
                color="white"
                onClick={() => handleKpiCardClick('office_rent')}
              />

              <StatCard
                title="Net Profit"
                value={summaryData.netProfit || "₹0"}
                icon={FiPieChart}
                color="white"
                onClick={() => handleKpiCardClick('net_profit')}
              />
            </div>

            {/* Notebook Requirements Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
              <StatCard
                title="Total Revenue"
                value={summaryData.totalRevenue}
                icon={FaRupeeSign}
                color="white"
                change="+14.2%"
                onClick={() => handleKpiCardClick('total_revenue')}
              />
              <StatCard
                title="Active Clients"
                value={summaryData.activeClients}
                icon={FiUsers}
                color="white"
                onClick={() => handleKpiCardClick('clients')}
              />
              <StatCard
                title="Total Admins"
                value={summaryData.totalAdmins}
                icon={FiShield}
                color="white"
                onClick={() => handleKpiCardClick('admins')}
              />
              <StatCard
                title="Total KAMs"
                value={summaryData.totalKAMs}
                icon={FiTarget}
                color="white"
                onClick={() => handleKpiCardClick('kams')}
              />
              <StatCard
                title="Active Employees"
                value={summaryData.activeEmployees}
                icon={FiActivity}
                color="white"
                onClick={() => handleKpiCardClick('employees')}
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

            {/* Revenue Graph */}
            <div className="lg:col-span-2 bg-white rounded-[40px] p-8 border border-gray-100 shadow-sm">

              <div className="flex items-center justify-between mb-8">
                <h3 className="text-xl font-bold text-[#1A1A2E] font-syne">
                  Revenue Graphs
                </h3>

                <select
                  className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 text-sm"
                >
                  <option>This Year</option>
                  <option>Last Year</option>
                  <option>This Month</option>
                </select>
              </div>

              <div className="bg-white rounded-[32px] p-8 border border-[#F4F3EF] shadow-sm mt-8">

                  <div className="flex items-center justify-between mb-8">

                    <div>
                      <h3 className="text-2xl font-bold text-[#1A1A2E]">
                        Recent Invoices
                      </h3>

                      <p className="text-sm text-[#9B9BAD] mt-1">
                        Central invoice and billing management
                      </p>
                    </div>

                  </div>

                  <div className="overflow-x-auto">

                    <table className="w-full">

                      <thead>
                        <tr className="border-b border-[#F4F3EF]">

                          {[
                            "Invoice ID",
                            "Client",
                            "Department",
                            "Amount",
                            "GST",
                            "Status",
                            "Date",
                            "Action"
                          ].map((item, index) => (
                            <th
                              key={item}
                              className={`text-left py-4 text-[11px] uppercase tracking-[2px] text-[#9B9BAD] font-black ${
                                index === 0 ? 'pl-8 pr-6' : 'px-6'
                              }`}
                            >
                              {item}
                            </th>
                          ))}

                        </tr>
                      </thead>

                      <tbody>
                        {(summaryData.recentInvoices || []).length === 0 ? (
                          <tr>
                            <td colSpan={8} className="py-8 text-center text-sm font-bold text-[#9B9BAD]">
                              No recent invoices found
                            </td>
                          </tr>
                        ) : (
                          (summaryData.recentInvoices || []).map((invoice, idx) => (
                            <tr
                              key={idx}
                              className="border-b border-[#F8F8F8] hover:bg-[#FAFBFF] transition-all"
                            >
                              <td className="py-5 pl-8 pr-6 font-black text-[#1A1A2E] text-left text-sm">
                                {invoice.id}
                              </td>
                              <td className="py-5 px-6 font-semibold text-left text-sm text-slate-700">
                                {invoice.client}
                              </td>
                              <td className="py-5 px-6 text-left">
                                <span className={`px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-widest
                                  ${
                                    invoice.dept === 'Recruitment'
                                      ? 'bg-blue-50 text-[#1B4DA0]'
                                      : invoice.dept === 'Operations'
                                      ? 'bg-emerald-50 text-emerald-600'
                                      : 'bg-purple-50 text-purple-600'
                                  }`}>
                                  {invoice.dept}
                                </span>
                              </td>
                              <td className="py-5 px-6 font-bold text-emerald-600 text-left text-sm">
                                {invoice.amount}
                              </td>
                              <td className="py-5 px-6 text-left text-sm text-slate-500">
                                {invoice.gst}
                              </td>
                              <td className="py-5 px-6 text-left">
                                <span className={`px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-widest
                                ${
                                  invoice.status === 'Paid'
                                    ? 'bg-emerald-50 text-emerald-600'
                                    : invoice.status === 'Pending'
                                    ? 'bg-amber-50 text-amber-600'
                                    : 'bg-red-50 text-red-500'
                                }`}>
                                  {invoice.status}
                                </span>
                              </td>
                              <td className="py-5 px-6 text-[#6B7280] text-left text-sm">
                                {invoice.date}
                              </td>
                              <td className="py-5 px-6 text-left">
                                <button 
                                  onClick={() => setSelectedInvoice(invoice)}
                                  className="px-4 py-2 rounded-xl bg-[#F4F3EF] hover:bg-[#1B4DA0] hover:text-white transition-all text-[10px] font-black uppercase tracking-widest"
                                >
                                  View
                                </button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>

                  </div>

                </div>

             

              <div className="h-80">
                <Bar
                  data={{
                    labels: summaryData.monthlyChartLabels || ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                    datasets: [
                      {
                        label: 'Revenue',
                        data: summaryData.monthlyRevenue || [0, 0, 0, 0, 0, 0],
                        backgroundColor: '#3D37F1',
                        borderRadius: 10,
                      },
                    ],
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: { display: false },
                    },
                  }}
                />
              </div>
            </div>

            {/* Expense Breakdown */}
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
                        data: (summaryData.expenseBreakdown?.salary || summaryData.expenseBreakdown?.office || summaryData.expenseBreakdown?.marketing || summaryData.expenseBreakdown?.tools)
                          ? [
                              summaryData.expenseBreakdown.salary,
                              summaryData.expenseBreakdown.office,
                              summaryData.expenseBreakdown.marketing,
                              summaryData.expenseBreakdown.tools
                            ]
                          : [45, 20, 15, 20],
                        backgroundColor: [
                          '#3D37F1',
                          '#10B981',
                          '#F59E0B',
                          '#EF4444',
                        ],
                        borderWidth: 0,
                      },
                    ],
                  }}
                  options={{
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: 'bottom',
                      },
                    },
                  }}
                />
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">

          <div 
            onClick={() => handleKpiCardClick('pending_collections')}
            className="bg-white rounded-[32px] p-6 border border-gray-100 shadow-sm cursor-pointer hover:shadow-md hover:scale-[1.01] active:scale-[0.99] transition-all duration-300 text-left"
          >
            <h3 className="text-lg font-bold text-[#1A1A2E] mb-4">
              Pending Collections
            </h3>

            <p className="text-4xl font-black text-red-500">
              {summaryData.outstandingPayment || "₹0"}
            </p>

            <p className="text-sm text-gray-500 mt-2">
              Pending from {summaryData.pendingCollectionsClientsCount || 0} clients
            </p>
          </div>

          <div 
            onClick={() => setShowClientsModal(true)}
            className="bg-white rounded-[32px] p-6 border border-gray-100 shadow-sm cursor-pointer hover:shadow-md hover:scale-[1.01] active:scale-[0.99] transition-all duration-300 text-left"
          >
            <h3 className="text-lg font-bold text-[#1A1A2E] mb-4">
              Active Clients
            </h3>

            <p className="text-4xl font-black text-blue-600">
              {summaryData.activeClients || 0}
            </p>

            <p className="text-sm text-gray-500 mt-2">
              Currently active companies
            </p>
          </div>

          <div className="bg-white rounded-[32px] p-6 border border-gray-100 shadow-sm text-left">
            <h3 className="text-lg font-bold text-[#1A1A2E] mb-4">
              Department Wise Profit
            </h3>

            <div className="space-y-1.5 mt-4">

              <div 
                onClick={() => handleKpiCardClick('operations_billing')}
                className="flex justify-between items-center p-2.5 hover:bg-gray-50 rounded-xl cursor-pointer transition-all duration-200 group"
              >
                <span className="text-sm font-semibold text-slate-700 group-hover:text-slate-900 transition-colors">Operations</span>
                <span className="font-bold text-green-600 group-hover:scale-105 transition-transform">{summaryData.operationsBilling || "₹0"}</span>
              </div>

              <div 
                onClick={() => handleKpiCardClick('recruitment_billing')}
                className="flex justify-between items-center p-2.5 hover:bg-gray-50 rounded-xl cursor-pointer transition-all duration-200 group"
              >
                <span className="text-sm font-semibold text-slate-700 group-hover:text-slate-900 transition-colors">Recruitment</span>
                <span className="font-bold text-blue-600 group-hover:scale-105 transition-transform">{summaryData.recruitmentBilling || "₹0"}</span>
              </div>

              <div 
                onClick={() => handleKpiCardClick('sales_revenue')}
                className="flex justify-between items-center p-2.5 hover:bg-gray-50 rounded-xl cursor-pointer transition-all duration-200 group"
              >
                <span className="text-sm font-semibold text-slate-700 group-hover:text-slate-900 transition-colors">Sales</span>
                <span className="font-bold text-purple-600 group-hover:scale-105 transition-transform">{summaryData.crmConvertedRevenue || "₹0"}</span>
              </div>

            </div>
          </div>

        </div>


            {/* Quick Insights Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 bg-white rounded-[40px] p-8 border border-gray-100 shadow-sm">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
                  <h3 className="text-xl font-bold text-[#1A1A2E] font-syne">Revenue Trend</h3>
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
                    data={billingChartData}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: { legend: { display: false } },
                      scales: { x: { grid: { display: false } }, y: { border: { display: false } } }
                    }}
                  />
                </div>
              </div>
              <div className="bg-white rounded-[40px] p-8 border border-gray-100 shadow-sm">
                <h3 className="text-xl font-bold text-[#1A1A2E] mb-8 font-syne">Team Distribution</h3>
                <div className="h-64">
                  <Doughnut
                    data={{
                      labels: ['Ops', 'Recruitment', 'Admin', 'BD'],
                      datasets: [{
                        data: [0, 0, 0, 0],
                        backgroundColor: ['#3D37F1', '#10B981', '#F59E0B', '#6366F1'],
                        borderWidth: 0,
                        cutout: '75%'
                      }]
                    }}
                    options={{ maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { usePointStyle: true, font: { size: 10, weight: 'bold' } } } } }}
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
      dashboardTitle={activeTab}
      userInfo={userInfo}
      isLoading={loading}
      dashboardTabName={null}
      showBottomTab={false}
      hideDailyLogout={true}
      showGlobalHeader={false}
      notifications={notifications}
    >
      {renderContent()}
      {/* Clients List Modal - PORTAL Component Match */}
      <ClientsExplorerModal
        isOpen={showClientsModal}
        onClose={() => setShowClientsModal(false)}
        clientsList={clientsList}
      />

      {/* KPI Detail Modal */}
      <KpiDetailModal
        isOpen={!!selectedKpi}
        onClose={() => setSelectedKpi(null)}
        kpiType={selectedKpi}
      />

      {/* Dashboard KPI Details Modal */}
      <DashboardKpiModal
        isOpen={showKpiModal}
        onClose={() => setShowKpiModal(false)}
        type={kpiModalType}
        data={kpiModalData}
        loading={kpiModalLoading}
        setSelectedInvoice={setSelectedInvoice}
      />

      {/* Invoice Detail Modal/Drawer */}
      <InvoiceDetailDrawer
        isOpen={!!selectedInvoice}
        onClose={() => setSelectedInvoice(null)}
        invoice={selectedInvoice}
        handleDownload={handleDownloadInvoice}
      />
    </AdminLayout>
  );
};

export default SuperAdminDashboard;
