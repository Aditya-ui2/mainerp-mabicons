import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  FiFileText,
  FiCheckCircle,
  FiClock,
  FiAlertTriangle,
  FiChevronRight,
  FiCalendar,
  FiDollarSign,
  FiUsers,
  FiTarget,
  FiInfo,
  FiDownload,
} from 'react-icons/fi';

const ServiceAgreementCard = ({ agreements = [], clientData = {}, isDarkMode = false }) => {
  const [expandedService, setExpandedService] = useState(null);

  // Default service agreement structure (should come from API)
  const defaultAgreements = [
    {
      id: 1,
      serviceName: 'Recruitment Services',
      description: 'End-to-end recruitment support including sourcing, screening, and onboarding',
      status: 'active',
      startDate: '2026-01-01',
      endDate: '2026-12-31',
      deliverables: [
        { name: 'Candidate Sourcing', status: 'included' },
        { name: 'Resume Screening', status: 'included' },
        { name: 'Interview Scheduling', status: 'included' },
        { name: 'Background Verification', status: 'included' },
        { name: 'Onboarding Support', status: 'included' },
      ],
      limits: {
        positionsPerMonth: 10,
        positionsUsed: 3,
      }
    },
    {
      id: 2,
      serviceName: 'HR Management',
      description: 'Complete HR operations including payroll, compliance, and employee management',
      status: 'active',
      startDate: '2026-01-01',
      endDate: '2026-12-31',
      deliverables: [
        { name: 'Payroll Processing', status: 'included' },
        { name: 'Compliance Management', status: 'included' },
        { name: 'Leave Management', status: 'included' },
        { name: 'Performance Reviews', status: 'extra' },
        { name: 'Training Programs', status: 'extra' },
      ],
      limits: {
        employeesManaged: 50,
        employeesUsed: 32,
      }
    },
    {
      id: 3,
      serviceName: 'Accounting & Finance',
      description: 'Financial management including bookkeeping, GST filing, and financial reports',
      status: 'active',
      startDate: '2026-01-01',
      endDate: '2026-12-31',
      deliverables: [
        { name: 'Bookkeeping', status: 'included' },
        { name: 'GST Filing', status: 'included' },
        { name: 'TDS Returns', status: 'included' },
        { name: 'Financial Statements', status: 'included' },
        { name: 'Audit Support', status: 'extra' },
      ],
      limits: {
        transactionsPerMonth: 500,
        transactionsUsed: 245,
      }
    },
  ];

  const servicesData = agreements.length > 0 ? agreements : defaultAgreements;

  const getStatusBadge = (status) => {
    const badges = {
      'active': { color: 'bg-green-100 text-green-700', icon: FiCheckCircle, label: 'Active' },
      'pending': { color: 'bg-amber-100 text-amber-700', icon: FiClock, label: 'Pending' },
      'expired': { color: 'bg-red-100 text-red-700', icon: FiAlertTriangle, label: 'Expired' },
    };
    return badges[status] || badges['active'];
  };

  const getDeliverableStatus = (status) => {
    if (status === 'included') return { color: 'text-green-600', bg: 'bg-green-50', icon: FiCheckCircle };
    if (status === 'extra') return { color: 'text-amber-600', bg: 'bg-amber-50', icon: FiInfo };
    return { color: 'text-gray-400', bg: 'bg-gray-50', icon: FiClock };
  };

  const calculateUsagePercent = (used, total) => {
    return Math.min(Math.round((used / total) * 100), 100);
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  return (
    <div className={`rounded-3xl border shadow-xl overflow-hidden ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
      {/* Header */}
      <div className="p-6 bg-gradient-to-r from-emerald-500 to-teal-600 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-white/20 rounded-xl">
              <FiFileText className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Service Agreement</h2>
              <p className="text-emerald-100 text-sm mt-1">Your contracted services & scope</p>
            </div>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-medium transition-colors">
            <FiDownload className="w-4 h-4" />
            Download Contract
          </button>
        </div>

        {/* Client Info */}
        <div className="mt-6 grid grid-cols-3 gap-4">
          <div className="p-3 bg-white/10 rounded-xl">
            <p className="text-emerald-100 text-xs">Company</p>
            <p className="font-semibold mt-1">{clientData.companyName || 'Your Company'}</p>
          </div>
          <div className="p-3 bg-white/10 rounded-xl">
            <p className="text-emerald-100 text-xs">Account Manager</p>
            <p className="font-semibold mt-1">{clientData.teamLeader?.name || 'Assigned KAM'}</p>
          </div>
          <div className="p-3 bg-white/10 rounded-xl">
            <p className="text-emerald-100 text-xs">Contract Period</p>
            <p className="font-semibold mt-1">Jan 2026 - Dec 2026</p>
          </div>
        </div>
      </div>

      {/* Important Notice */}
      <div className={`px-6 py-4 flex items-center gap-3 border-b ${isDarkMode ? 'bg-amber-900/20 border-gray-700' : 'bg-amber-50 border-amber-100'}`}>
        <FiAlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0" />
        <p className={`text-sm ${isDarkMode ? 'text-amber-200' : 'text-amber-700'}`}>
          <strong>Note:</strong> Only work within your agreed scope will be processed. Additional services require prior approval.
        </p>
      </div>

      {/* Services List */}
      <div className="p-6">
        <div className="space-y-4">
          {servicesData.map((service, index) => {
            const statusBadge = getStatusBadge(service.status);
            const StatusIcon = statusBadge.icon;
            const isExpanded = expandedService === service.id;
            const limitKey = Object.keys(service.limits || {})[0];
            const limitValue = service.limits?.[limitKey];
            const usedKey = Object.keys(service.limits || {})[1];
            const usedValue = service.limits?.[usedKey];
            const usagePercent = limitValue && usedValue ? calculateUsagePercent(usedValue, limitValue) : 0;

            return (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`rounded-xl border overflow-hidden ${isDarkMode ? 'border-gray-600' : 'border-gray-200'}`}
              >
                {/* Service Header */}
                <div
                  onClick={() => setExpandedService(isExpanded ? null : service.id)}
                  className={`p-4 cursor-pointer transition-colors ${
                    isDarkMode ? 'bg-gray-700/50 hover:bg-gray-700' : 'bg-gray-50 hover:bg-gray-100'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${isDarkMode ? 'bg-gray-600' : 'bg-white'}`}>
                        <FiTarget className={`w-5 h-5 ${isDarkMode ? 'text-emerald-400' : 'text-emerald-600'}`} />
                      </div>
                      <div>
                        <h3 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                          {service.serviceName}
                        </h3>
                        <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          {service.description}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${statusBadge.color}`}>
                        <StatusIcon className="w-3 h-3" />
                        {statusBadge.label}
                      </span>
                      <FiChevronRight className={`w-5 h-5 transition-transform ${isExpanded ? 'rotate-90' : ''} ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                    </div>
                  </div>

                  {/* Usage Bar */}
                  {limitValue && usedValue && (
                    <div className="mt-3">
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>
                          Usage: {usedValue} / {limitValue}
                        </span>
                        <span className={usagePercent > 80 ? 'text-amber-500' : (isDarkMode ? 'text-gray-400' : 'text-gray-500')}>
                          {usagePercent}%
                        </span>
                      </div>
                      <div className={`h-2 rounded-full overflow-hidden ${isDarkMode ? 'bg-gray-600' : 'bg-gray-200'}`}>
                        <div
                          className={`h-full rounded-full transition-all ${
                            usagePercent > 80 ? 'bg-amber-500' : usagePercent > 50 ? 'bg-blue-500' : 'bg-emerald-500'
                          }`}
                          style={{ width: `${usagePercent}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Expanded Content */}
                {isExpanded && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className={`border-t ${isDarkMode ? 'border-gray-600 bg-gray-800' : 'border-gray-200 bg-white'}`}
                  >
                    <div className="p-4">
                      {/* Contract Period */}
                      <div className="flex items-center gap-4 mb-4">
                        <div className="flex items-center gap-2">
                          <FiCalendar className="w-4 h-4 text-gray-400" />
                          <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                            {formatDate(service.startDate)} - {formatDate(service.endDate)}
                          </span>
                        </div>
                      </div>

                      {/* Deliverables */}
                      <h4 className={`font-medium mb-3 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                        Included Deliverables
                      </h4>
                      <div className="grid grid-cols-2 gap-2">
                        {service.deliverables?.map((item, idx) => {
                          const deliverableStatus = getDeliverableStatus(item.status);
                          const DelIcon = deliverableStatus.icon;
                          return (
                            <div
                              key={idx}
                              className={`flex items-center gap-2 p-2 rounded-lg ${deliverableStatus.bg}`}
                            >
                              <DelIcon className={`w-4 h-4 ${deliverableStatus.color}`} />
                              <span className={`text-sm ${deliverableStatus.color}`}>{item.name}</span>
                              {item.status === 'extra' && (
                                <span className="text-xs bg-amber-200 text-amber-700 px-1.5 py-0.5 rounded">
                                  Extra
                                </span>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Footer */}
      <div className={`px-6 py-4 border-t ${isDarkMode ? 'border-gray-700 bg-gray-700/50' : 'border-gray-100 bg-gray-50'}`}>
        <p className={`text-xs text-center ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
          For scope changes or additional services, please contact your Account Manager
        </p>
      </div>
    </div>
  );
};

export default ServiceAgreementCard;
