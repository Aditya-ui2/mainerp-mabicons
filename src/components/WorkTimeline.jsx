import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  FiCheckCircle,
  FiClock,
  FiFileText,
  FiMessageCircle,
  FiUpload,
  FiUser,
  FiCalendar,
  FiActivity,
  FiFilter,
  FiChevronDown,
} from 'react-icons/fi';

const WorkTimeline = ({ activities = [], tasks = [], isDarkMode = false }) => {
  const [filter, setFilter] = useState('all');
  const [showAll, setShowAll] = useState(false);

  // Generate timeline from tasks and activities
  const timelineItems = useMemo(() => {
    const items = [];

    // Add task status changes
    tasks.forEach(task => {
      if (task.createdAt) {
        items.push({
          id: `task-created-${task._id}`,
          type: 'task_created',
          title: `Task Created: ${task.title}`,
          description: task.description?.substring(0, 100) || 'New task assigned to your account',
          timestamp: new Date(task.createdAt),
          icon: FiFileText,
          color: 'blue',
          priority: task.priority,
        });
      }

      if (task.status?.toLowerCase() === 'resolved' || task.status?.toLowerCase() === 'completed') {
        items.push({
          id: `task-completed-${task._id}`,
          type: 'task_completed',
          title: `Task Completed: ${task.title}`,
          description: 'This task has been successfully completed',
          timestamp: task.updatedAt ? new Date(task.updatedAt) : new Date(task.createdAt),
          icon: FiCheckCircle,
          color: 'green',
        });
      }

      if (task.status?.toLowerCase() === 'review') {
        items.push({
          id: `task-review-${task._id}`,
          type: 'task_review',
          title: `Under Review: ${task.title}`,
          description: 'This task is under review',
          timestamp: task.updatedAt ? new Date(task.updatedAt) : new Date(task.createdAt),
          icon: FiActivity,
          color: 'purple',
        });
      }
    });

    // Add custom activities
    activities.forEach(activity => {
      items.push({
        id: activity.id || `activity-${Date.now()}-${Math.random()}`,
        type: activity.type || 'update',
        title: activity.title,
        description: activity.description,
        timestamp: new Date(activity.timestamp || activity.createdAt),
        icon: getActivityIcon(activity.type),
        color: getActivityColor(activity.type),
        user: activity.user,
      });
    });

    // Sort by timestamp descending
    return items.sort((a, b) => b.timestamp - a.timestamp);
  }, [tasks, activities]);

  const filteredItems = useMemo(() => {
    let filtered = timelineItems;
    if (filter !== 'all') {
      filtered = timelineItems.filter(item => {
        if (filter === 'tasks') return item.type.includes('task');
        if (filter === 'messages') return item.type === 'message';
        if (filter === 'documents') return item.type === 'document';
        return true;
      });
    }
    return showAll ? filtered : filtered.slice(0, 10);
  }, [timelineItems, filter, showAll]);

  const formatTimestamp = (date) => {
    const now = new Date();
    const diff = now - date;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor(diff / (1000 * 60));

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const getColorClasses = (color) => {
    const colors = {
      blue: { bg: 'bg-blue-100', text: 'text-blue-600', border: 'border-blue-200', dot: 'bg-blue-500' },
      green: { bg: 'bg-green-100', text: 'text-green-600', border: 'border-green-200', dot: 'bg-green-500' },
      amber: { bg: 'bg-amber-100', text: 'text-amber-600', border: 'border-amber-200', dot: 'bg-amber-500' },
      purple: { bg: 'bg-purple-100', text: 'text-purple-600', border: 'border-purple-200', dot: 'bg-purple-500' },
      red: { bg: 'bg-red-100', text: 'text-red-600', border: 'border-red-200', dot: 'bg-red-500' },
      gray: { bg: 'bg-gray-100', text: 'text-gray-600', border: 'border-gray-200', dot: 'bg-gray-500' },
    };
    return colors[color] || colors.gray;
  };

  return (
    <div className={`rounded-3xl border shadow-xl overflow-hidden ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
      {/* Header */}
      <div className={`p-6 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-100'}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl">
              <FiActivity className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                Activity Timeline
              </h2>
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                Recent updates and progress on your work
              </p>
            </div>
          </div>

          {/* Filter Dropdown */}
          <div className="relative">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className={`appearance-none px-4 py-2 pr-8 rounded-lg border text-sm font-medium cursor-pointer ${isDarkMode
                ? 'bg-gray-700 border-gray-600 text-white'
                : 'bg-gray-50 border-gray-200 text-gray-700'
                }`}
            >
              <option value="all">All Activity</option>
              <option value="tasks">Tasks Only</option>
              <option value="messages">Messages</option>
              <option value="documents">Documents</option>
            </select>
            <FiFilter className={`absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
          </div>
        </div>
      </div>

      {/* Timeline Content */}
      <div className="p-6 max-h-[600px] overflow-y-auto">
        {filteredItems.length === 0 ? (
          <div className="text-center py-12">
            <FiActivity className={`w-16 h-16 mx-auto mb-4 ${isDarkMode ? 'text-gray-600' : 'text-gray-300'}`} />
            <p className={`text-lg font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>No activity yet</p>
            <p className={`text-sm ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
              Updates will appear here as work progresses
            </p>
          </div>
        ) : (
          <div className="relative">
            {/* Timeline Line */}
            <div className={`absolute left-6 top-0 bottom-0 w-0.5 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`} />

            {/* Timeline Items */}
            <div className="space-y-6">
              {filteredItems.map((item, index) => {
                const colorClasses = getColorClasses(item.color);
                const Icon = item.icon;

                return (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="relative flex gap-4 pl-12"
                  >
                    {/* Timeline Dot */}
                    <div className={`absolute left-4 w-5 h-5 rounded-full border-4 ${colorClasses.dot} border-white dark:border-gray-800 shadow-sm`} />

                    {/* Content Card */}
                    <div className={`flex-1 p-4 rounded-xl border ${isDarkMode ? 'bg-gray-700/50 border-gray-600' : 'bg-gray-50 border-gray-100'}`}>
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3">
                          <div className={`p-2 rounded-lg ${colorClasses.bg}`}>
                            <Icon className={`w-4 h-4 ${colorClasses.text}`} />
                          </div>
                          <div>
                            <h3 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                              {item.title}
                            </h3>
                            <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                              {item.description}
                            </p>
                            {item.user && (
                              <div className="flex items-center gap-2 mt-2">
                                <FiUser className="w-3 h-3 text-gray-400" />
                                <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                  {item.user}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                        <span className={`text-xs whitespace-nowrap ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                          {formatTimestamp(item.timestamp)}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Show More Button */}
            {timelineItems.length > 10 && !showAll && (
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                onClick={() => setShowAll(true)}
                className={`mt-6 ml-12 flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${isDarkMode
                  ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
              >
                <FiChevronDown className="w-4 h-4" />
                Show {timelineItems.length - 10} more activities
              </motion.button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// Helper functions
const getActivityIcon = (type) => {
  const icons = {
    'task_created': FiFileText,
    'task_completed': FiCheckCircle,
    'task_review': FiActivity,
    'message': FiMessageCircle,
    'document': FiUpload,
    'meeting': FiCalendar,
    'update': FiActivity,
  };
  return icons[type] || FiActivity;
};

const getActivityColor = (type) => {
  const colors = {
    'task_created': 'blue',
    'task_completed': 'green',
    'task_review': 'purple',
    'message': 'amber',
    'document': 'blue',
    'meeting': 'purple',
    'update': 'gray',
  };
  return colors[type] || 'gray';
};

export default WorkTimeline;
