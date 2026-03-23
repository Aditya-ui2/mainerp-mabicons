import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiActivity,
  FiUser,
  FiCheckCircle,
  FiClock,
  FiCalendar,
  FiFileText,
  FiUsers,
  FiBriefcase,
  FiDollarSign,
  FiMail,
  FiRefreshCw,
  FiFilter,
} from 'react-icons/fi';
import { getDepartmentActivityLogs } from '../../../service/api';

const ActivityTypeIcon = ({ type }) => {
  const icons = {
    task: FiCheckCircle,
    leave: FiCalendar,
    payroll: FiDollarSign,
    attendance: FiClock,
    candidate: FiUser,
    interview: FiBriefcase,
    offer: FiMail,
    general: FiActivity,
  };
  const Icon = icons[type] || icons.general;
  return <Icon style={{width:'16px',height:'16px'}} />;
};

const getActionGradient = (action) => {
  if (action?.includes('completed') || action?.includes('approved') || action?.includes('accepted')) {
    return 'linear-gradient(135deg, #10b981, #0d9488)';
  }
  if (action?.includes('rejected') || action?.includes('deleted')) {
    return 'linear-gradient(135deg, #ef4444, #e11d48)';
  }
  if (action?.includes('assigned') || action?.includes('scheduled')) {
    return 'linear-gradient(135deg, #3b82f6, #4f46e5)';
  }
  if (action?.includes('updated') || action?.includes('modified')) {
    return 'linear-gradient(135deg, #f59e0b, #ea580c)';
  }
  return 'linear-gradient(135deg, #8b5cf6, #9333ea)';
};

const formatTimeAgo = (date) => {
  const now = new Date();
  const past = new Date(date);
  const diffInSeconds = Math.floor((now - past) / 1000);

  if (diffInSeconds < 60) return 'Just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
  return past.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
};

const ActivityFeedTab = ({ department = 'HR Operations' }) => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [refreshing, setRefreshing] = useState(false);

  const actionTypes = ['all', 'task', 'leave', 'payroll', 'attendance', 'candidate', 'interview', 'general'];

  useEffect(() => {
    fetchActivities();
  }, [department, filter]);

  const fetchActivities = async () => {
    try {
      setLoading(true);
      const actionType = filter === 'all' ? null : filter;
      const response = await getDepartmentActivityLogs(department, 50, actionType);
      setActivities(response.activities || []);
    } catch (error) {
      console.error('Error fetching activities:', error);
      // Mock data for demo
      setActivities([
        { _id: '1', performedByName: 'Manju Sharma', action: 'completed_task', actionType: 'task', description: 'Completed payroll processing for March 2026', createdAt: new Date(Date.now() - 1000 * 60 * 5) },
        { _id: '2', performedByName: 'Jyoti Verma', action: 'approved_leave', actionType: 'leave', description: 'Approved leave request for Rahul (Mar 20-22)', createdAt: new Date(Date.now() - 1000 * 60 * 30) },
        { _id: '3', performedByName: 'Priya Singh', action: 'updated_attendance', actionType: 'attendance', description: 'Updated attendance records for TechCorp employees', createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2) },
        { _id: '4', performedByName: 'Ramesh Kumar', action: 'assigned_task', actionType: 'task', description: 'Assigned document verification task to Manju', createdAt: new Date(Date.now() - 1000 * 60 * 60 * 4) },
        { _id: '5', performedByName: 'Manju Sharma', action: 'processed_payroll', actionType: 'payroll', description: 'Processed salary disbursement for StartupXYZ', createdAt: new Date(Date.now() - 1000 * 60 * 60 * 6) },
        { _id: '6', performedByName: 'Jyoti Verma', action: 'rejected_leave', actionType: 'leave', description: 'Rejected leave request for Amit (insufficient balance)', createdAt: new Date(Date.now() - 1000 * 60 * 60 * 8) },
        { _id: '7', performedByName: 'Priya Singh', action: 'completed_task', actionType: 'task', description: 'Completed employee onboarding documentation', createdAt: new Date(Date.now() - 1000 * 60 * 60 * 12) },
        { _id: '8', performedByName: 'Ramesh Kumar', action: 'added_team_member', actionType: 'general', description: 'Added new team member Neha to the team', createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24) },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchActivities();
    setRefreshing(false);
  };

  const filteredActivities = activities.filter(a => 
    filter === 'all' || a.actionType === filter
  );

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div className="h-8 w-48 rounded-lg bg-gray-200 animate-pulse" />
          <div className="h-10 w-24 rounded-lg bg-gray-200 animate-pulse" />
        </div>
        {[1, 2, 3, 4, 5].map(i => (
          <div key={i} className="flex items-start gap-4 p-4 bg-gray-100 rounded-xl animate-pulse">
            <div className="w-10 h-10 rounded-full bg-gray-200" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-32 bg-gray-200 rounded" />
              <div className="h-3 w-full bg-gray-200 rounded" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg">
            <FiActivity style={{width:'24px',height:'24px',color:'#fff'}} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Activity Feed</h2>
            <p className="text-sm text-gray-500">Recent activity from your team</p>
          </div>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleRefresh}
          disabled={refreshing}
          className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
        >
          <FiRefreshCw style={{width:'16px',height:'16px'}} className={refreshing ? 'animate-spin' : ''} />
          Refresh
        </motion.button>
      </div>

      {/* Filter Pills */}
      <div className="flex flex-wrap gap-2">
        {actionTypes.map(type => (
          <button
            key={type}
            onClick={() => setFilter(type)}
            style={filter === type ? {
              background: 'linear-gradient(to right, #7c3aed, #9333ea)',
              color: '#fff',
              boxShadow: '0 10px 15px -3px rgba(139,92,246,0.25)',
              padding: '6px 12px', borderRadius: '9999px', fontSize: '12px', fontWeight: 500,
              textTransform: 'capitalize', border: 'none', cursor: 'pointer',
            } : {
              background: '#f3f4f6', color: '#4b5563',
              padding: '6px 12px', borderRadius: '9999px', fontSize: '12px', fontWeight: 500,
              textTransform: 'capitalize', border: 'none', cursor: 'pointer',
            }}
          >
            {type}
          </button>
        ))}
      </div>

      {/* Activity List */}
      {filteredActivities.length === 0 ? (
        <div className="text-center py-16 text-gray-500">
          <FiActivity style={{width:'48px',height:'48px',margin:'0 auto 12px',opacity:0.3}} />
          <p className="font-medium">No activities found</p>
          <p className="text-sm mt-1">Activity will appear here as your team works</p>
        </div>
      ) : (
        <div className="space-y-3">
          <AnimatePresence>
            {filteredActivities.map((activity, idx) => (
              <motion.div
                key={activity._id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ delay: idx * 0.03 }}
                className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-start gap-4">
                  {/* Avatar with action color */}
                  <div style={{
                    flexShrink: 0, width: '40px', height: '40px', borderRadius: '50%',
                    background: getActionGradient(activity.action),
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#fff', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
                  }}>
                    <ActivityTypeIcon type={activity.actionType} />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-gray-900">{activity.performedByName}</span>
                      <span style={{
                        fontSize: '12px', padding: '2px 8px', borderRadius: '9999px', textTransform: 'capitalize',
                        ...(activity.actionType === 'task' ? { background: '#d1fae5', color: '#047857' } :
                           activity.actionType === 'leave' ? { background: '#dbeafe', color: '#1d4ed8' } :
                           activity.actionType === 'payroll' ? { background: '#fef3c7', color: '#b45309' } :
                           activity.actionType === 'attendance' ? { background: '#ede9fe', color: '#6d28d9' } :
                           { background: '#f3f4f6', color: '#4b5563' })
                      }}>
                        {activity.actionType}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{activity.description}</p>
                  </div>

                  {/* Time */}
                  <div className="flex-shrink-0 text-xs text-gray-400">
                    {formatTimeAgo(activity.createdAt)}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Load More */}
      {filteredActivities.length >= 10 && (
        <div className="text-center">
          <button className="px-4 py-2 text-sm font-medium text-violet-600 hover:text-violet-700 hover:bg-violet-50 rounded-lg transition-colors">
            Load More Activities
          </button>
        </div>
      )}
    </div>
  );
};

export default ActivityFeedTab;
