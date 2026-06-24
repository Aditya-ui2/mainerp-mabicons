import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  FiCheckCircle,
  FiClock,
  FiAlertCircle,
  FiTrendingUp,
  FiFilter,
  FiChevronRight,
  FiCalendar,
  FiUser,
  FiFileText,
} from 'react-icons/fi';

const TaskProgressSection = ({ tasks = [], isDarkMode = false }) => {
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedTask, setSelectedTask] = useState(null);

  // Calculate progress stats
  const stats = {
    total: tasks.length,
    completed: tasks.filter(t => t.status?.toLowerCase() === 'resolved' || t.status?.toLowerCase() === 'completed').length,
    inProgress: tasks.filter(t => t.status?.toLowerCase() === 'active' || t.status?.toLowerCase() === 'work in progress').length,
    pending: tasks.filter(t => t.status?.toLowerCase() === 'pending').length,
    review: tasks.filter(t => t.status?.toLowerCase() === 'review').length,
  };

  const completionPercentage = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;

  const getStatusConfig = (status) => {
    const configs = {
      'resolved': { color: 'bg-green-500', textColor: 'text-green-600', bgLight: 'bg-green-50', icon: FiCheckCircle, label: 'Completed' },
      'completed': { color: 'bg-green-500', textColor: 'text-green-600', bgLight: 'bg-green-50', icon: FiCheckCircle, label: 'Completed' },
      'active': { color: 'bg-blue-500', textColor: 'text-blue-600', bgLight: 'bg-blue-50', icon: FiTrendingUp, label: 'In Progress' },
      'work in progress': { color: 'bg-blue-500', textColor: 'text-blue-600', bgLight: 'bg-blue-50', icon: FiTrendingUp, label: 'In Progress' },
      'pending': { color: 'bg-amber-500', textColor: 'text-amber-600', bgLight: 'bg-amber-50', icon: FiClock, label: 'Pending' },
      'review': { color: 'bg-purple-500', textColor: 'text-purple-600', bgLight: 'bg-purple-50', icon: FiAlertCircle, label: 'Under Review' },
    };
    return configs[status?.toLowerCase()] || configs['pending'];
  };

  const getPriorityBadge = (priority) => {
    const badges = {
      'high': 'bg-red-100 text-red-700 border-red-200',
      'medium': 'bg-amber-100 text-amber-700 border-amber-200',
      'low': 'bg-green-100 text-green-700 border-green-200',
    };
    return badges[priority?.toLowerCase()] || badges['medium'];
  };

  const filteredTasks = tasks.filter(task => {
    if (filterStatus === 'all') return true;
    if (filterStatus === 'completed') return task.status?.toLowerCase() === 'resolved' || task.status?.toLowerCase() === 'completed';
    if (filterStatus === 'in-progress') return task.status?.toLowerCase() === 'active' || task.status?.toLowerCase() === 'work in progress';
    if (filterStatus === 'pending') return task.status?.toLowerCase() === 'pending';
    if (filterStatus === 'review') return task.status?.toLowerCase() === 'review';
    return true;
  });

  const formatDate = (dateString) => {
    if (!dateString) return 'Not set';
    try {
      return new Date(dateString).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
    } catch {
      return 'Invalid date';
    }
  };

  return (
    <div className={`rounded-3xl border shadow-xl overflow-hidden ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
      {/* Header with Overall Progress */}
      <div className="p-6 bg-gradient-to-r from-blue-500 to-indigo-600 text-white">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold">Your Work Progress</h2>
            <p className="text-blue-100 mt-1">Track all tasks assigned to your account</p>
          </div>
          <div className="text-right">
            <div className="text-4xl font-bold">{completionPercentage}%</div>
            <p className="text-blue-100 text-sm">Overall Complete</p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="h-3 bg-white/20 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${completionPercentage}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
            className="h-full bg-white rounded-full"
          />
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-4 gap-4 mt-6">
          <div className="text-center p-3 bg-white/10 rounded-xl">
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-blue-100">Total Tasks</p>
          </div>
          <div className="text-center p-3 bg-white/10 rounded-xl">
            <div className="text-2xl font-bold">{stats.completed}</div>
            <p className="text-xs text-blue-100">Completed</p>
          </div>
          <div className="text-center p-3 bg-white/10 rounded-xl">
            <div className="text-2xl font-bold">{stats.inProgress}</div>
            <p className="text-xs text-blue-100">In Progress</p>
          </div>
          <div className="text-center p-3 bg-white/10 rounded-xl">
            <div className="text-2xl font-bold">{stats.pending}</div>
            <p className="text-xs text-blue-100">Pending</p>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className={`flex gap-2 p-4 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-100'}`}>
        {[
          { key: 'all', label: 'All' },
          { key: 'in-progress', label: 'In Progress' },
          { key: 'pending', label: 'Pending' },
          { key: 'review', label: 'Review' },
          { key: 'completed', label: 'Completed' },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setFilterStatus(tab.key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              filterStatus === tab.key
                ? 'bg-blue-500 text-white'
                : `${isDarkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Task List */}
      <div className="p-4 max-h-[500px] overflow-y-auto">
        {filteredTasks.length === 0 ? (
          <div className="text-center py-12">
            <FiFileText className={`w-16 h-16 mx-auto mb-4 ${isDarkMode ? 'text-gray-600' : 'text-gray-300'}`} />
            <p className={`text-lg font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>No tasks found</p>
            <p className={`text-sm ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>Tasks will appear here when assigned</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredTasks.map((task, index) => {
              const statusConfig = getStatusConfig(task.status);
              const StatusIcon = statusConfig.icon;

              return (
                <motion.div
                  key={task._id || index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => setSelectedTask(selectedTask?._id === task._id ? null : task)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all hover:shadow-md ${
                    isDarkMode ? 'bg-gray-700/50 border-gray-600 hover:bg-gray-700' : 'bg-gray-50 border-gray-100 hover:bg-white'
                  } ${selectedTask?._id === task._id ? 'ring-2 ring-blue-500' : ''}`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 flex-1">
                      <div className={`p-2 rounded-lg ${statusConfig.bgLight}`}>
                        <StatusIcon className={`w-5 h-5 ${statusConfig.textColor}`} />
                      </div>
                      <div className="flex-1">
                        <h3 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                          {task.title || 'Untitled Task'}
                        </h3>
                        <p className={`text-sm mt-1 line-clamp-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          {task.description || 'No description provided'}
                        </p>
                        
                        {/* Expanded Details */}
                        {selectedTask?._id === task._id && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600"
                          >
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div className="flex items-center gap-2">
                                <FiCalendar className="w-4 h-4 text-gray-400" />
                                <span className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>
                                  Due: {formatDate(task.dueDate)}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <FiUser className="w-4 h-4 text-gray-400" />
                                <span className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>
                                  Assigned: {task.assignedTo?.name || 'Team'}
                                </span>
                              </div>
                            </div>
                            {task.notes && (
                              <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                                <p className="text-sm text-blue-600 dark:text-blue-300">{task.notes}</p>
                              </div>
                            )}
                          </motion.div>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusConfig.bgLight} ${statusConfig.textColor}`}>
                        {statusConfig.label}
                      </span>
                      {task.priority && (
                        <span className={`px-2 py-0.5 rounded border text-xs font-medium ${getPriorityBadge(task.priority)}`}>
                          {task.priority}
                        </span>
                      )}
                      <FiChevronRight className={`w-4 h-4 transition-transform ${selectedTask?._id === task._id ? 'rotate-90' : ''} ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`} />
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskProgressSection;
