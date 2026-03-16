import React, { useState, useRef, useEffect } from 'react';
import { useDraggable } from '@dnd-kit/core';
import { TrashIcon, CalendarIcon, XMarkIcon, PencilIcon, EyeIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import { deleteTask } from '../../../service/api';

// Add these constants at the top of the file
const FREQUENCY_OPTIONS = {
  ONCE: 'once',
  DAILY: 'daily',
  ALTERNATE_DAYS: 'alternate_days',
  WEEKLY: 'weekly',
  BIWEEKLY: 'biweekly',
  MONTHLY: 'monthly',
};

const FREQUENCY_LABELS = {
  [FREQUENCY_OPTIONS.DAILY]: 'Daily',
  [FREQUENCY_OPTIONS.ALTERNATE_DAYS]: 'Alternate Days',
  [FREQUENCY_OPTIONS.WEEKLY]: 'Weekly',
  [FREQUENCY_OPTIONS.BIWEEKLY]: 'Bi-weekly',
  [FREQUENCY_OPTIONS.MONTHLY]: 'Monthly',
};

// Add this priorityColors object at the top of your Card component file
const priorityColors = {
  high: {
    bg: 'bg-red-100/90',
    text: 'text-red-800',
    border: 'border-red-300',
    gradient: 'from-red-50 to-red-100/50'
  },
  medium: {
    bg: 'bg-yellow-100/90',
    text: 'text-yellow-800',
    border: 'border-yellow-300',
    gradient: 'from-yellow-50 to-yellow-100/50'
  },
  low: {
    bg: 'bg-green-100/90',
    text: 'text-green-800',
    border: 'border-green-300',
    gradient: 'from-green-50 to-green-100/50'
  }
};

export function Card({ 
  task, 
  isDarkMode, 
  onDeleteTask, 
  isDragging, 
  columnId, 
  userRole,
  isOverlay
}) {
  // Move all hooks to the top level
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isHolding, setIsHolding] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [holdProgress, setHoldProgress] = useState(0);
  const holdTimerRef = useRef(null);
  const animationFrameRef = useRef(null);
  const clickCountRef = useRef(0);
  const clickTimeoutRef = useRef(null);
  const holdDuration = 500;

  const isDragDisabled = userRole === 'employee' && columnId === 'resolved';
  
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: task.id,
    data: {
      type: 'task',
      task: task,
      id: task.id,
      status: task.status
    },
    disabled: isDragDisabled
  });

  // Clean up timeouts on unmount
  useEffect(() => {
    return () => {
      if (clickTimeoutRef.current) {
        clearTimeout(clickTimeoutRef.current);
      }
    };
  }, []);

  // Handle click logic
  const handleClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    clickCountRef.current += 1;
    
    if (clickTimeoutRef.current) {
      clearTimeout(clickTimeoutRef.current);
    }
    
    clickTimeoutRef.current = setTimeout(() => {
      clickCountRef.current = 0;
    }, 300);
    
    if (clickCountRef.current > 1) {
      e.preventDefault();
      clickCountRef.current = 0;
      return false;
    }
  };

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
  } : undefined;

  // Make sure to convert priority to lowercase when accessing priorityColors
  const priority = (task.priority || 'medium').toLowerCase();
  const priorityStyle = priorityColors[priority];

  // Add this helper function near the top of your component
  const getAvatarUrl = (userId) => {
    return `https://i.pravatar.cc/300?img=${userId % 70}`; // Pravatar has images 1-70
  };

  // Update task content mapping to correctly handle the API structure
  const taskContent = {
    id: task._id || task.id,
    title: task.title || task.content,
    content: task.description || task.content,
    assignedTo: task.assignedToData?.userId?.name || 
                task.assignedTo || // Fallback to existing property
                'Unassigned',
    priority: task.priority?.toLowerCase() || 'medium',
    deadline: task.dueDate || task.deadline,
    status: task.status,
    teamLeader: task.teamLeader?.name || 'Not specified',
    teamLeaderId: task.teamLeader?._id,
    category: task.category,
    createdAt: task.createdAt,
    // Add the complete assignedTo object
    assignedToData: task.assignedToData,
    frequency: task.frequency || null,
  };

  // Debugging logs
  console.log('Assigned To:', task.assignedTo);
  console.log('Task Object:', task);

  // If this is the original card and it's being dragged, render nothing
  if (isDragging && !isOverlay) {
    return null;
  }

  const getInitials = (name) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase();
  };

  // Update the formatDate function to better handle the date
  const formatDate = (dateString) => {
    if (!dateString) return 'No deadline set';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Invalid date';
      
      return date.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        hour12: true
      });
    } catch (error) {
      console.error('Date formatting error:', error);
      return 'No deadline set';
    }
  };

  const getScheduleDisplay = (task) => {
    if (task.scheduleType === FREQUENCY_OPTIONS.ONCE) {
      return formatDate(task.deadline);
    } else if (task.frequency) {
      let displayText = FREQUENCY_LABELS[task.frequency] || task.frequency;
      if (task.startDate && task.endDate) {
        const startDate = new Date(task.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        const endDate = new Date(task.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        displayText += ` (${startDate} - ${endDate})`;
      }
      return displayText;
    }
    return formatDate(task.deadline); // fallback to deadline if no schedule type
  };

  const handlePointerDown = (e) => {
    e.stopPropagation();
    setIsHolding(true);
    setHoldProgress(0);
    
    const startTime = Date.now();
    const animate = () => {
      const progress = Math.min((Date.now() - startTime) / holdDuration, 1);
      setHoldProgress(progress);
      
      if (progress < 1) {
        animationFrameRef.current = requestAnimationFrame(animate);
      }
    };
    
    animationFrameRef.current = requestAnimationFrame(animate);
    
    holdTimerRef.current = setTimeout(() => {
      setIsModalOpen(true);
      setIsHolding(false);
      setHoldProgress(0);
    }, holdDuration);
  };

  const handlePointerUp = (e) => {
    e.stopPropagation();
    setIsHolding(false);
    setHoldProgress(0);
    if (holdTimerRef.current) {
      clearTimeout(holdTimerRef.current);
    }
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
  };

  const handleDelete = async (e, taskId) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDeleting(true);
    
    try {
      await deleteTask(taskId);
      
      if (onDeleteTask) {
        onDeleteTask(taskId, columnId);
      }
    } catch (error) {
      console.error('Error deleting task:', error);
      setIsDeleting(false);
    }
  };

  // Add this helper function to format frequency display
  const getFrequencyDisplay = (task) => {
    if (task.category !== 'Frequency') return null;
    
    if (!task.frequency) return ' Frequency ';
    
    // If it's a predefined frequency from FREQUENCY_LABELS
    if (FREQUENCY_LABELS[task.frequency]) {
      return FREQUENCY_LABELS[task.frequency];
    }
    
    // Return the custom frequency as is
    return task.frequency;
  };

  // Add a transition end handler
  const handleTransitionEnd = (e) => {
    if (e.propertyName === 'transform') {
      const element = e.target;
      element.style.transform = '';
    }
  };

  return (
    <>
      <div
        ref={setNodeRef}
        style={style}
        {...(isDragDisabled ? {} : { ...listeners, ...attributes })}
        onClick={handleClick}
        className={`group relative 
          ${isDarkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-white'}
          p-4 md:p-5 rounded-lg
          ${isDragDisabled ? 'cursor-not-allowed opacity-75' : 'cursor-pointer'}
          transition-all duration-200
          border-l-4 ${priorityStyle.border}
          ${!isDragDisabled && `hover:${priorityStyle.gradient}`}
          max-w-sm w-full mx-auto
          ${isDeleting ? 'animate-crumple' : ''}
          hover:-translate-y-1 hover:shadow
          z-10
          ${isOverlay ? 'shadow-xl' : ''}`}
        onTransitionEnd={handleTransitionEnd}
      >
        <div className="space-y-3.5">
          {/* Priority Badge */}
          <div className="flex justify-between items-start">
            <span className={`text-xs md:text-sm px-2.5 py-1 rounded-full ${priorityStyle.bg} 
              ${priorityStyle.text} font-medium tracking-wide`}>
              {priority}
            </span>
            <div className="flex gap-2">
              
            
            </div>
          </div>

          {/* Task Content */}
          <div className="space-y-2">
            <h3 className={`text-sm md:text-base font-semibold leading-relaxed overflow-hidden ${
              isDarkMode ? 'text-white' : 'text-gray-800'
            }`}>
              {taskContent.title}
            </h3>
            <p className={`text-xs md:text-sm leading-relaxed ${
              isDarkMode ? 'text-gray-300' : 'text-gray-600'
            } line-clamp-2`}>
              {taskContent.content}
            </p>

            {/* Add Frequency Display if category is Frequency */}
            {task.category === 'Frequency' && (
              <div className={`text-xs md:text-sm text-center ${
                isDarkMode ? 'text-green-100' : 'text-gray-600'
              } flex items-center gap-1.5 bg-[##e7fbec59] rounded-full p-1.5 justify-center`}>
                <ArrowPathIcon className="w-4 h-4 animate-spin"/>
                <span className=' text-green-500 text-center font-bold'>{getFrequencyDisplay(task)}</span>
              </div>
            )}
          </div>

          {/* Task Details */}
          <div className="flex flex-col xs:flex-row items-start xs:items-center gap-2 
            pt-3 border-t border-gray-200/80 dark:border-gray-600/80 flex-wrap">
            {/* Assignee */}
            {taskContent.assignedTo && (
              <div className="flex items-center gap-2 min-w-[100px] overflow-hidden">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${isDarkMode ? 'bg-gray-600 text-white' : 'bg-gray-200 text-gray-600'}`}>
                  {getInitials(taskContent.assignedTo)}
                </div>
                <span className={`text-xs overflow-hidden whitespace-nowrap text-ellipsis ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  {taskContent.assignedTo}
                </span>
              </div>
            )}

            {/* View Details Button */}
            <button
              onPointerDown={handlePointerDown}
              onPointerUp={handlePointerUp}
              onPointerLeave={handlePointerUp}
              className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs relative overflow-hidden
                ${isHolding ? 'scale-95' : 'scale-100'}
                ${isDarkMode 
                  ? 'bg-gray-600 hover:bg-gray-500 text-white' 
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
                } transition-all duration-200`}
            >
              <div
                className="absolute left-0 top-0 bottom-0"
                style={{
                  width: `${holdProgress * 100}%`,
                  transition: 'width 0.1s linear',
                  background: isDarkMode 
                    ? 'linear-gradient(90deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.2) 50%, rgba(255,255,255,0.1) 100%)'
                    : 'linear-gradient(90deg, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.15) 50%, rgba(0  ,0,0,0.1) 100%)',
                  backgroundSize: '200% 100%',
                  animation: isHolding ? 'liquidFlow 1s linear infinite' : 'none'
                }}
              />
              <div className="relative z-10 flex items-center gap-1">
                <EyeIcon className="w-3.5 h-3.5" />
                Hold to View
              </div>
            </button>

            {/* Deadline/Frequency */}
            <div className={`flex items-center gap-2 text-xs ${
              isDarkMode ? 'text-gray-300' : 'text-gray-600'
            }`}>
              <CalendarIcon className="w-4 h-4" />
              <span>{formatDate(taskContent.deadline)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Task Details Modal */}
      {!isOverlay && isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className={`${isDarkMode ? 'bg-gray-800/95' : 'bg-white'} rounded-2xl p-6 w-full max-w-2xl mx-4 shadow-xl overflow-y-auto max-h-[90vh]`}>
            {/* Modal Header */}
            <div className="flex justify-between items-start mb-6">
              <div className="flex items-center gap-3">
                <span className={`px-4 py-1.5 rounded-full text-sm font-medium
                  ${priorityStyle.bg} 
                  ${priorityStyle.text}`}>
                  {priority} Priority
                </span>
                <span className={`px-4 py-1.5 rounded-full text-sm font-medium
                  ${isDarkMode ? 'bg-gray-700 text-gray-200' : 'bg-gray-100 text-gray-700'}`}>
                  {task.category || 'Deadline'}
                </span>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className={`p-2 rounded-full transition-colors duration-200
                  ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>

            {/* Task Content */}
            <div className={`space-y-6 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
              {/* Title and Description */}
              <div>
                <h3 className={`text-xl font-semibold mb-4 overflow-hidden whitespace-nowrap text-ellipsis`}>
                  {taskContent.title}
                </h3>
                <div className={`p-4 rounded-xl ${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'} border ${isDarkMode ? 'border-gray-600' : 'border-gray-100'}`}>
                  <p className="text-sm leading-relaxed max-h-[200px] overflow-y-auto custom-scrollbar">
                    {taskContent.content || 'No detailed description provided.'}
                  </p>
                </div>
              </div>

              {/* Task Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Assignment Details */}
                <div className={`p-4 rounded-xl ${
                  isDarkMode ? 'bg-gray-700/30' : 'bg-gray-50/50'
                }`}>
                  <h4 className="text-sm font-medium mb-3">Assignment Details</h4>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full overflow-hidden">
                        <img 
                          src={getAvatarUrl(task.assignedUserId || 1)} 
                          alt={taskContent.assignedTo}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <p className="text-sm font-medium">{taskContent.assignedTo}</p>
                        <p className="text-xs text-gray-500">{task.assignedUserType || 'Employee'}</p>
                      </div>
                    </div>
                    {task.teamLeader && (
                      <div className="flex items-center gap-2 mt-2">
                        <div className="w-8 h-8 rounded-full overflow-hidden">
                          <img 
                            src={getAvatarUrl(task.teamLeaderId || 2)} 
                            alt={taskContent.teamLeader}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div>
                          <p className="text-sm font-medium">{taskContent.teamLeader}</p>
                          <p className="text-xs text-gray-500">Team Leader</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Time Details */}
                <div className={`p-4 rounded-xl ${
                  isDarkMode ? 'bg-gray-700/30' : 'bg-gray-50/50'
                }`}>
                  <h4 className="text-sm font-medium mb-3">Time Details</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <CalendarIcon className="w-4 h-4 text-gray-400" />
                      <span>Created: {formatDate(task.createdAt)}</span>
                    </div>
                    {task.category === 'Frequency' ? (
                      <div className="flex items-center gap-2">
                        <ArrowPathIcon className="w-4 h-4 text-gray-400" />
                        <span>Frequency: {getFrequencyDisplay(task)}</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <CalendarIcon className="w-4 h-4 text-gray-400" />
                        <span>Deadline: {formatDate(task.deadline)}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Schedule Details (if applicable) */}
                {task.category === 'Frequency' && (
                  <div className={`p-4 rounded-xl ${
                    isDarkMode ? 'bg-gray-700/30' : 'bg-gray-50/50' 
                  }`}>
                    <h4 className="text-sm font-medium mb-3">Schedule Details</h4>
                    <div className="space-y-2 text-sm">
                      <p>Frequency: {FREQUENCY_LABELS[task.frequency] || task.frequency}</p>
                      {task.startDate && (
                        <p>Start Date: {formatDate(task.startDate)}</p>
                      )}
                      {task.endDate && (
                        <p>End Date: {formatDate(task.endDate)}</p>
                      )}
                    </div>
                  </div>
                )}

                {/* Client Details (if available) */}
                {task.client && (
                  <div className={`p-4 rounded-xl ${
                    isDarkMode ? 'bg-gray-700/30' : 'bg-gray-50/50'
                  }`}>
                    <h4 className="text-sm font-medium mb-3">Client Information</h4>
                    <div className="space-y-2 text-sm">
                      <p>Client: {task.client}</p>
                      {task.clientDetails && (
                        <>
                          <p>Email: {task.clientDetails.email || 'N/A'}</p>
                          <p>Contact: {task.clientDetails.phone || 'N/A'}</p>
                        </>
                      )}
                    </div>
                  </div>
                )}

                {/* Status Details */}
                <div className={`p-4 rounded-xl ${
                  isDarkMode ? 'bg-gray-700/30' : 'bg-gray-50/50'
                }`}>
                  <h4 className="text-sm font-medium mb-3">Status Information</h4>
                  <div className="space-y-2 text-sm">
                    <p>Current Status: {task.status}</p>
                    <p>Priority Level: {task.priority}</p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-6 mt-6 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className={`px-4 py-2 rounded-lg transition-colors duration-200 ${
                    isDarkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'
                  }`}
                >
                  Close
                </button>
                {userRole !== 'employee' && (
                  <button
                    onClick={(e) => {
                      setIsModalOpen(false);
                      handleDelete(e, taskContent.id);
                    }}
                    className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 flex items-center gap-2"
                  >
                    <TrashIcon className="w-4 h-4" />
                    Delete Task
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

<style jsx>{`
  @keyframes liquidFlow {
    0% {
      background-position: 100% 0;
    }
    100% {
      background-position: -100% 0;
    }
  }
  
  .custom-scrollbar {
    scrollbar-width: thin;
    scrollbar-color: rgba(156, 163, 175, 0.5) transparent;
  }
  
  .custom-scrollbar::-webkit-scrollbar {
    width: 6px;
  }
  
  .custom-scrollbar::-webkit-scrollbar-track {
    background: transparent;
  }
  
  .custom-scrollbar::-webkit-scrollbar-thumb {
    background-color: rgba(156, 163, 175, 0.5);
    border-radius: 3px;
  }
  
  .custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background-color: rgba(156, 163, 175, 0.7);
  }

  @keyframes crumple {
    0% {
      transform: scale(1) rotate(0);
      opacity: 1;
    }
    25% {
      transform: scale(0.9) rotate(-3deg);
    }
    50% {
      transform: scale(0.7) rotate(5deg);
    }
    75% {
      transform: scale(0.5) rotate(-8deg);
    }
    100% {
      transform: scale(0) rotate(10deg);
      opacity: 0;
    }
  }

  .animate-crumple {
    animation: crumple 0.5s ease-in forwards;
    pointer-events: none;
  }
`}</style>


