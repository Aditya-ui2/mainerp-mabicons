import React, { useState, useEffect, useRef } from 'react';
import {jwtDecode} from 'jwt-decode';
import { DndContext, DragOverlay, closestCorners, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { Column } from './KanbanComponents/Column';
import { Card } from './KanbanComponents/Card';
import { PlusIcon, TrashIcon, XMarkIcon, PencilIcon, CalendarIcon, ArrowPathIcon, FunnelIcon, UsersIcon } from '@heroicons/react/24/outline';
import { getAllTasks, getAdminHierarchy, getTeamLeaderHierarchy, createTaskByTL, getClientsForTeamLeader, getAllClients, updateTaskStatus, getTeamLeaderDetails, getEmployeeTasks, getAllRecurringTasks, deleteOrDeactivateRecurringTask, getRecurringTasksByTeamLeader, deleteTask } from '../../service/api';
import axios from 'axios';
import Select from 'react-select';

// Add these constants at the top of your file
const FREQUENCY_OPTIONS = {
  ONCE: 'once',
  DAILY: 'daily',
  ALTERNATE_DAYS: 'alternate_days',
  WEEKLY: 'weekly',
  BIWEEKLY: 'biweekly',
  MONTHLY: 'monthly',
};

const FREQUENCY_LABELS = {
  [FREQUENCY_OPTIONS.ONCE]: 'One-time Task',
  [FREQUENCY_OPTIONS.DAILY]: 'Daily',
  [FREQUENCY_OPTIONS.ALTERNATE_DAYS]: 'Alternate Days',
  [FREQUENCY_OPTIONS.WEEKLY]: 'Weekly',
  [FREQUENCY_OPTIONS.BIWEEKLY]: 'Bi-weekly',
  [FREQUENCY_OPTIONS.MONTHLY]: 'Monthly',
};

// Add this function near the top of the file, after imports
const getAvatarUrl = (id) => {
  // You can replace this with your actual avatar generation logic
  // For now, we'll use a placeholder service
  return `https://ui-avatars.com/api/?name=${id}&background=random`;
};

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

// Add the frequencyOptions constant near the top of your file
const frequencyOptions = [
  {
    category: "Daily Options",
    options: [
        { label: "Daily at midnight", value: "Daily at midnight" },
        { label: "Daily at noon", value: "Daily at noon" },
        { label: "Every 15 minutes", value: "Every 15 minutes" },
        { label: "Every 30 minutes", value: "Every 30 minutes" },
        { label: "Every hour", value: "Every hour" },
        { label: "Every 2 hours", value: "Every 2 hours" },
        { label: "Every 4 hours", value: "Every 4 hours" },
        { label: "Every 6 hours", value: "Every 6 hours" },
        { label: "Every 8 hours", value: "Every 8 hours" },
        { label: "Every 12 hours", value: "Every 12 hours" },
        { label: "Twice daily (9am,5pm)", value: "Twice daily (9am,5pm)" },
        { label: "Three times daily (9am,1pm,5pm)", value: "Three times daily (9am,1pm,5pm)" }
    ]
},
{
    category: "Weekly Options",
    options: [
        { label: "Every Monday", value: "Every Monday" },
        { label: "Every Tuesday", value: "Every Tuesday" },
        { label: "Every Wednesday", value: "Every Wednesday" },
        { label: "Every Thursday", value: "Every Thursday" },
        { label: "Every Friday", value: "Every Friday" },
        { label: "Every Saturday", value: "Every Saturday" },
        { label: "Every Sunday", value: "Every Sunday" },
        { label: "Every weekday", value: "Every weekday" },
        { label: "Every weekend", value: "Every weekend" },
        { label: "Every week", value: "Every week" },
        { label: "Twice a week", value: "Twice a week" }
    ]
},
{
    category: "Monthly Options",
    options: [
        { label: "First day of month", value: "First day of month" },
        { label: "Last day of month", value: "Last day of month" },
        { label: "First Monday of month", value: "First Monday of month" },
        { label: "Last Friday of month", value: "Last Friday of month" },
        { label: "Every 1st of Month", value: "Every 1st of Month" },
        { label: "Every 2nd of Month", value: "Every 2nd of Month" },
        { label: "Every 3rd of Month", value: "Every 3rd of Month" },
        { label: "Every 4th of Month", value: "Every 4th of Month" },
        { label: "Every 5th of Month", value: "Every 5th of Month" },
        { label: "Every 6th of Month", value: "Every 6th of Month" },
        { label: "Every 7th of Month", value: "Every 7th of Month" },
        { label: "Every 8th of Month", value: "Every 8th of Month" },
        { label: "Every 9th of Month", value: "Every 9th of Month" },
        { label: "Every 10th of Month", value: "Every 10th of Month" },
        { label: "Every 11th of Month", value: "Every 11th of Month" },
        { label: "Every 12th of Month", value: "Every 12th of Month" },
        { label: "Every 13th of Month", value: "Every 13th of Month" },
        { label: "Every 14th of Month", value: "Every 14th of Month" },
        { label: "Every 15th of Month", value: "Every 15th of Month" },
        { label: "Every 16th of Month", value: "Every 16th of Month" },
        { label: "Every 17th of Month", value: "Every 17th of Month" },
        { label: "Every 18th of Month", value: "Every 18th of Month" },
        { label: "Every 19th of Month", value: "Every 19th of Month" },
        { label: "Every 20th of Month", value: "Every 20th of Month" },
        { label: "Every 21st of Month", value: "Every 21st of Month" },
        { label: "Every 22nd of Month", value: "Every 22nd of Month" },
        { label: "Every 23rd of Month", value: "Every 23rd of Month" },
        { label: "Every 24th of Month", value: "Every 24th of Month" },
        { label: "Every 25th of Month", value: "Every 25th of Month" },
        { label: "Every 26th of Month", value: "Every 26th of Month" },
        { label: "Every 27th of Month", value: "Every 27th of Month" },
        { label: "Every 28th of Month", value: "Every 28th of Month" },
        { label: "Every 29th of Month", value: "Every 29th of Month" },
        { label: "Every 30th of Month", value: "Every 30th of Month" },
        { label: "Every 31st of Month", value: "Every 31st of Month" }
    ]
},
{
    category: "Business Hours",
    options: [
        { label: "Every weekday at 9am", value: "Every weekday at 9am" },
        { label: "Every weekday at 5pm", value: "Every weekday at 5pm" }
    ]
},
{
    category: "Quarterly",
    options: [
        { label: "First day of quarter", value: "First day of quarter" }
    ]
}
];
  // ... other categories

// Convert options for react-select
const groupedOptions = frequencyOptions.map(group => ({
  label: group.category,
  options: group.options
}));

const TaskTab = ({ isDarkMode }) => {
  const [activeId, setActiveId] = useState(null);
  const [newTaskText, setNewTaskText] = useState('');
  const [addingToColumn, setAddingToColumn] = useState(null);
  const [columns, setColumns] = useState({
    'active': { id: 'active', title: 'Active', tasks: [] },
    'work in progress': { id: 'work in progress', title: 'Work in Progress', tasks: [] },
    'review': { id: 'review', title: 'Review', tasks: [] },
    'pending': { id: 'pending', title: 'Pending', tasks: [] },
    'resolved': { id: 'resolved', title: 'Resolved', tasks: [] }
  });
  const [teamMembers, setTeamMembers] = useState([]);
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [newTaskData, setNewTaskData] = useState({
    title: '',
    description: '',
    clientId: '',
    category: 'Deadline', // Default to Deadline
    dueDate: '',
    frequency: '',
    priority: 'Medium',
    assignedUserId: '',
    employeeId: '',
    assignedUserType: 'TeamLeader'
  });
  const [selectedTask, setSelectedTask] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [activeFilters, setActiveFilters] = useState({
    taskType: 'all',
    priority: 'all',
    employee: 'all'
  });
  const [isLoading, setIsLoading] = useState(true);
  const [clients, setClients] = useState([]);
  const [userRole, setUserRole] = useState(null);
  const [userId, setUserId] = useState(null);
  const [isRecurringModalOpen, setIsRecurringModalOpen] = useState(false);
  const [recurringTasks, setRecurringTasks] = useState([]);
  const [isActionLoading, setIsActionLoading] = useState(false);

  const filterRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (filterRef.current && !filterRef.current.contains(event.target)) {
        setFilterOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Add this near the top of your component
  const sampleDescriptions = {
    'task-1': `Design comprehensive dashboard wireframes that focus on user experience and modern design principles.

Key Requirements:
• Create responsive layouts for mobile and desktop
• Include data visualization components
• Design user-friendly navigation system
• Implement dark/light mode toggles

Additional Notes:
Working closely with the UX team to ensure consistency across all platform features.`,

    'task-2': `Update the existing user documentation to reflect recent system changes and new features.

Documentation Scope:
• User interface changes
• New feature tutorials
• Troubleshooting guides
• FAQ section updates

Target Audience:
- End users
- System administrators
- Support team members`,

    'task-3': `Conduct thorough research on competitor features and market positioning.

Research Areas:
• Feature comparison
• Pricing strategies
• User experience analysis
• Market positioning

Deliverables:
- Detailed comparison matrix
- SWOT analysis
- Recommendations report`,

    'task-4': `Implement a secure authentication system using JWT tokens and OAuth 2.0.

Technical Specifications:
• User registration and login flows
• Password reset functionality
• Social media integration
• Two-factor authentication

Security Measures:
- Password hashing using bcrypt
- Rate limiting for API endpoints
- Session management
- XSS and CSRF protection`,

    'task-5': `Create comprehensive API documentation for external developers.

Documentation Components:
• Authentication methods
• Endpoint descriptions
• Request/response examples
• Rate limiting details

Format:
- OpenAPI/Swagger specification
- Interactive documentation
- Code samples in multiple languages`,

    // ... add more descriptions as needed
  };

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const findContainer = (id) => {
    if (id in columns) return id;
    
    for (const [columnId, column] of Object.entries(columns)) {
      if (column.tasks.some(task => task.id === id)) {
        return columnId;
      }
    }
    return null;
  };

  const handleDragStart = (event) => {
    const { active } = event;
    
    // Find which column the task is in
    const sourceColumn = findContainer(active.id);
    
    // Prevent dragging if employee and task is in resolved column
    if (userRole === 'employee' && sourceColumn === 'resolved') {
      console.log('Employees cannot move tasks from resolved');
      return;
    }
    
    setActiveId(active.id);
  };

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    
    if (!over) return;

    const taskId = active.id;
    const overColumnId = over.id;
    
    if (!taskId || !overColumnId) return;

    // Early return if employee tries to move to resolved
    if (userRole === 'employee' && overColumnId === 'resolved') {
      console.log('Employees cannot mark tasks as resolved');
      setActiveId(null); // Reset active drag state
      return;
    }

    // Map column IDs to status values
    const statusMap = {
      'active': 'Active',
      'work in progress': 'Work in Progress',
      'review': 'Review',
      'pending': 'Pending',
      'resolved': 'Resolved'
    };

    try {
      const newStatus = statusMap[overColumnId];
      console.log('Attempting to update task:', { taskId, newStatus });

      // Make API call to update status
      const response = await updateTaskStatus(taskId, newStatus);
      
      if (!response.success) {
        throw new Error(response.message || 'Failed to update task status');
      }

      // Update local state after successful API call
      setColumns(prev => {
        const updatedColumns = { ...prev };
        
        // Find and remove task from old column
        for (const columnId in updatedColumns) {
          const taskIndex = updatedColumns[columnId].tasks.findIndex(t => t.id === taskId);
          if (taskIndex !== -1) {
            const [task] = updatedColumns[columnId].tasks.splice(taskIndex, 1);
            // Add task to new column with updated status
            updatedColumns[overColumnId].tasks.push({
              ...task,
              status: newStatus
            });
            break;
          }
        }
        
        return updatedColumns;
      });

      console.log('Task status updated successfully');

    } catch (error) {
      console.error('Error updating task status:', error);
      
      // Refresh the board to ensure UI is in sync with backend
      try {
        const tasksResponse = await getAllTasks();
        if (tasksResponse.tasks) {
          // Refresh columns with latest data
          // ... existing refresh code ...
        }
      } catch (refreshError) {
        console.error('Error refreshing tasks:', refreshError);
      }
    }

    setActiveId(null);
  };

  const handleDragOver = (event) => {
    const { active, over } = event;
    if (!over) return;

    const activeContainer = findContainer(active.id);
    const overContainer = findContainer(over.id);

    if (activeContainer !== overContainer) {
      setColumns(prev => {
        const activeItems = prev[activeContainer].tasks;
        const overItems = prev[overContainer].tasks;
        const activeIndex = activeItems.findIndex(item => item.id === active.id);
        const overIndex = overItems.findIndex(item => item.id === over.id);
        const activeTask = activeItems[activeIndex];

        return {
          ...prev,
          [activeContainer]: {
            ...prev[activeContainer],
            tasks: activeItems.filter(item => item.id !== active.id)
          },
          [overContainer]: {
            ...prev[overContainer],
            tasks: [
              ...overItems.slice(0, overIndex),
              activeTask,
              ...overItems.slice(overIndex)
            ]
          }
        };
      });
    }
  };

  // Add new task
  const handleAddTask = (columnId) => {
    if (!newTaskText.trim()) return;
    
    const newTask = {
      id: `task-${Date.now()}`,
      content: newTaskText,
      priority: 'medium', // default priority
    };

    setColumns(prev => ({
      ...prev,
      [columnId]: {
        ...prev[columnId],
        tasks: [...prev[columnId].tasks, newTask]
      }
    }));

    setNewTaskText('');
    setAddingToColumn(null);
  };

  // Update the delete task function
  const handleDeleteTask = (taskId, columnId) => {
    setColumns(prevColumns => {
      const updatedTasks = prevColumns[columnId].tasks.filter(task => task.id !== taskId);
      return {
        ...prevColumns,
        [columnId]: {
          ...prevColumns[columnId],
          tasks: updatedTasks
        }
      };
    });
  };

  // Add this function to handle task fetching
  const fetchTasks = async () => {
    try {
      setIsLoading(true);
      let tasksArray = [];
      
      if (userRole === 'employee') {
        const response = await getEmployeeTasks(userId);
        tasksArray = response.tasks || [];
      } else if (userRole === 'teamleader') {
        const response = await getTeamLeaderDetails(userId);
        tasksArray = response.teamLeader?.tasks || [];
      } else if (userRole === 'admin') {
        const response = await getAllTasks();
        tasksArray = response.tasks || [];
      }

      // Map tasks to columns
      const updatedColumns = {
        'active': { id: 'active', title: 'Active', tasks: [] },
        'work in progress': { id: 'work in progress', title: 'Work in Progress', tasks: [] },
        'pending': { id: 'pending', title: 'Pending', tasks: [] },
        'review': { id: 'review', title: 'Review', tasks: [] },
        'resolved': { id: 'resolved', title: 'Resolved', tasks: [] }
      };

      // Map tasks to a common format
      const mappedTasks = tasksArray.map(task => ({
        id: task.id || task._id,
        content: task.title,
        description: task.description,
        priority: (task.priority || 'Medium').toLowerCase(),
        assignedTo: task.assignedTo?.userId?.name || task.assignedToName || 'Assigned',
        assignedUserType: task.assignedToType || task.assignedTo?.userType,
        assignedUserId: task.assignedToId || task.assignedTo?.userId?._id || task.assignedTo?.userId,
        deadline: task.dueDate,
        status: task.status || 'Active',
        client: task.client?.name || task.client?.companyName || 'No Client',
        clientId: task.clientId || task.client?.id || task.client?._id,
        category: task.category,
        frequency: task.frequency,
        createdAt: task.createdAt,
        assignedToDetails: userRole === 'admin' ? {
          userId: task.assignedTo.userId?._id,
          userType: task.assignedTo.userId.userType,
          email: task.assignedTo.userId?.email,
          name: task.assignedTo.userId?.name
        } : null,
        clientDetails: userRole === 'admin' ? task.client.companyName : null
      }));

      // Distribute tasks to columns
      mappedTasks.forEach(task => {
        const columnKey = (task.status || 'active').toLowerCase();
        if (updatedColumns[columnKey]) {
          updatedColumns[columnKey].tasks.push(task);
        } else {
          updatedColumns['active'].tasks.push(task);
        }
      });

      setColumns(updatedColumns);
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      setIsLoading(false);
    }
  };

  // Update the handleGlobalAddTask function
  const handleGlobalAddTask = async (e) => {
    e.preventDefault();
    try {
      const taskData = { ...newTaskData };

      if (taskData.category === 'Deadline') {
        if (taskData.dueDate) {
          try {
            const date = new Date(taskData.dueDate);
            if (isNaN(date.getTime())) {
              throw new Error('Invalid date');
            }
            taskData.dueDate = date.toISOString();
          } catch (dateError) {
            console.error('Invalid date format:', dateError);
            throw new Error('Please enter a valid due date');
          }
        }
        delete taskData.frequency;
      } else if (taskData.category === 'Frequency') {
        if (!taskData.frequency) {
          throw new Error('Please select a frequency');
        }
        delete taskData.dueDate;
      }

      const response = await createTaskByTL(taskData);
      
      if (response.message === "Deadline task created successfully." || 
          response.message === "Frequency task created successfully.") {
        // Close the modal
        setIsAddingTask(false);
        
        // Reset form data
        setNewTaskData({
          title: '',
          description: '',
          clientId: '',
          category: 'Deadline',
          dueDate: '',
          frequency: '',
          priority: 'Medium',
          assignedUserId: '',
          employeeId: '',
          assignedUserType: 'TeamLeader'
        });
        
        // Refresh tasks immediately
        await fetchTasks();
        
        // Optional: Show success message
        alert('Task created successfully!');
      } else {
        throw new Error(response.message || 'Failed to create task');
      }

    } catch (error) {
      console.error('Failed to create task:', error);
      alert(error.message || 'Failed to create task');
    }
  };

  // Add these helper functions to TaskTab
  const getInitials = (name) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase();
  };

  const formatDate = (dateString) => {
    const options = { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  const handleOpenModal = (task) => {
    setSelectedTask(task);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setSelectedTask(null);
    setIsModalOpen(false);
  };

  // Add this helper function to filter tasks
  const getFilteredTasks = (tasks) => {
    return tasks.filter(task => {
      // Task Type Filter
      if (activeFilters.taskType !== 'all') {
        if (activeFilters.taskType === 'recurring' && task.category !== 'Frequency') return false;
        if (activeFilters.taskType === 'deadline' && task.category !== 'Deadline') return false;
      }
      
      // Priority Filter
      if (activeFilters.priority !== 'all' && 
          task.priority.toLowerCase() !== activeFilters.priority.toLowerCase()) {
        return false;
      }
      
      // Employee Filter
      if (activeFilters.employee !== 'all') {
        // Handle different data structures for admin and team leader views
        const assignedUserId = typeof task.assignedTo === 'object' 
          ? task.assignedTo.userId?._id || task.assignedTo.userId 
          : task.assignedUserId;
        
        if (assignedUserId !== activeFilters.employee) {
          return false;
        }
      }
      
      return true;
    });
  };

  const fetchClientsForTeamLeader = async (teamLeaderId) => {
    try {
      console.log('Fetching clients for team leader:', teamLeaderId);
      const response = await getClientsForTeamLeader(teamLeaderId);
      console.log('Clients response:', response);
      setClients(response.data?.clients || []);
    } catch (error) {
      console.error('Failed to fetch clients:', error);
      setClients([]);
    }
  };

  const fetchRecurringTasks = async () => {
    try {
      const token = localStorage.getItem('token');
      const decoded = jwtDecode(token);
      const currentUserRole = decoded.role.toLowerCase();
      const currentUserId = decoded.id;

      let response;
      if (currentUserRole === 'admin') {
        response = await getAllRecurringTasks();
      } else if (currentUserRole === 'teamleader') {
        response = await getRecurringTasksByTeamLeader(currentUserId);
      }

      setRecurringTasks(response.recurringTasks || []);
    } catch (error) {
      console.error('Failed to fetch recurring tasks:', error);
    }
  };

  const openRecurringTasksModal = async () => {
    await fetchRecurringTasks();
    setIsRecurringModalOpen(true);
  };

  const closeRecurringTasksModal = () => {
    setIsRecurringModalOpen(false);
  };

  // Add this function to handle task actions
  const handleTaskAction = async (taskId, action) => {
    setIsActionLoading(true);
    try {
      await deleteOrDeactivateRecurringTask(taskId, action);
      // Refresh the recurring tasks list
      await fetchRecurringTasks();
    } catch (error) {
      console.error(`Failed to ${action} task:`, error);
      alert(error.message || `Failed to ${action} task`);
    } finally {
      setIsActionLoading(false);
    }
  };

  // Add this new function to handle bulk deletion
  const handleDeleteAllTasks = async (columnId) => {
    if (window.confirm(`Are you sure you want to delete all tasks in ${columns[columnId].title}?`)) {
      try {
        // Get all tasks in the column
        const tasksToDelete = getFilteredTasks(columns[columnId].tasks);
        
        // Delete each task using the existing deleteTask API
        for (const task of tasksToDelete) {
          await deleteTask(task.id);
        }
        
        // Update the local state after successful deletion
        setColumns(prev => ({
          ...prev,
          [columnId]: {
            ...prev[columnId],
            tasks: []
          }
        }));

      } catch (error) {
        console.error('Error deleting tasks:', error);
        alert('Failed to delete all tasks: ' + (error.message || 'Unknown error'));
      }
    }
  };

  useEffect(() => {
    const initializeData = async () => {
      try {
        console.log('Starting initialization...');
        const token = localStorage.getItem('token');
        if (!token) {
          console.error('No token found');
          return;
        }

        // Decode token and set user role and ID
        const decoded = jwtDecode(token);
        const currentRole = decoded.role.toLowerCase();
        const currentUserId = decoded.id;
        
        setUserRole(currentRole);
        setUserId(currentUserId);

        // Initialize columns with empty arrays
        const updatedColumns = {
          'active': { id: 'active', title: 'Active', tasks: [] },
          'work in progress': { id: 'work in progress', title: 'Work in Progress', tasks: [] },
          'pending': { id: 'pending', title: 'Pending', tasks: [] },
          'review': { id: 'review', title: 'Review', tasks: [] },
          'resolved': { id: 'resolved', title: 'Resolved', tasks: [] }
        };

        let tasksArray = [];
        
        if (currentRole === 'employee') {
          const response = await getEmployeeTasks(currentUserId);
          tasksArray = response.tasks || [];
        } 
        else if (currentRole === 'teamleader') {
          const response = await getTeamLeaderDetails(currentUserId);
          if (response.teamLeader?.tasks) {
            tasksArray = response.teamLeader.tasks;
          }
        } 
        else if (currentRole === 'admin') {
          const response = await getAllTasks();
          tasksArray = response.tasks || [];
        }

        // Map tasks to a common format regardless of user role
        const mappedTasks = tasksArray.map(task => ({
          id: task.id || task._id,
          content: task.title,
          description: task.description,
          priority: (task.priority || 'Medium').toLowerCase(),
          assignedTo: task.assignedTo?.userId?.name || task.assignedToName || 'Assigned',
          assignedUserType: task.assignedToType || task.assignedTo?.userType,
          assignedUserId: task.assignedToId || task.assignedTo?.userId?._id || task.assignedTo?.userId,
          deadline: task.dueDate,
          status: task.status || 'Active',
          client: task.client?.name || task.client?.companyName || 'No Client',
          clientId: task.clientId || task.client?.id || task.client?._id,
          category: task.category,
          frequency: task.frequency,
          createdAt: task.createdAt,
          // Additional fields for admin view
          assignedToDetails: currentRole === 'admin' ? {
            userId: task.assignedTo.userId?._id,
            userType: task.assignedTo.userType,
            email: task.assignedTo.userId?.email
          } : null,
          clientDetails: currentRole === 'admin' ? task.client : null
        }));

        // Distribute tasks to columns
        mappedTasks.forEach(task => {
          const columnKey = (task.status || 'active').toLowerCase();
          if (updatedColumns[columnKey]) {
            updatedColumns[columnKey].tasks.push(task);
          } else {
            updatedColumns['active'].tasks.push(task);
          }
        });

        console.log('Updated columns:', updatedColumns);
        setColumns(updatedColumns);
        setIsLoading(false);

      } catch (error) {
        console.error('Error in initialization:', error);
        setIsLoading(false);
      }
    };

    initializeData();

    // Set up interval to fetch tasks every 15 minutes
    const intervalId = setInterval(() => {
      fetchTasks();
    }, 15 * 60 * 1000); // 15 minutes in milliseconds

    // Clean up interval on component unmount
    return () => clearInterval(intervalId);
  }, []);

  // Add this state logging
  useEffect(() => {
    console.log('Current clients state:', clients);
  }, [clients]);

  const openAddTaskModal = async () => {
    try {
      const token = localStorage.getItem('token');
      const decoded = jwtDecode(token);
      const currentUserRole = decoded.role.toLowerCase();
      const currentUserId = decoded.id;

      console.log('Current user role:', currentUserRole);

      if (currentUserRole === 'admin') {
        // For admin, fetch all team leaders and their employees
        const response = await getAdminHierarchy(currentUserId, 'Admin');
        
        // Flatten the hierarchy into a single array of team members
        const allMembers = [];
        
        // Add team leaders and their employees
        response.adminHierarchy.teamLeaders.forEach(teamLeader => {
          allMembers.push({
            id: teamLeader._id,
            name: teamLeader.name,
            email: teamLeader.email,
            type: 'TeamLeader'
          });
          
          if (teamLeader.employees?.length > 0) {
            teamLeader.employees.forEach(employee => {
              if (!allMembers.some(member => member.id === employee._id)) {
                allMembers.push({
                  id: employee._id,
                  name: employee.name,
                  email: employee.email,
                  type: 'Employee',
                  teamLeaderId: teamLeader._id
                });
              }
            });
          }
        });
        
        setTeamMembers(allMembers);

        // Fetch all clients for admin
        const clientResponse = await getAllClients();
        console.log('Admin client response:', clientResponse);
        setClients(clientResponse.data?.clients || []);
        
      } else if (currentUserRole === 'teamleader') {
        // Fetch the teamleader hierarchy
        const response = await getTeamLeaderHierarchy(currentUserId);
        
        const allMembers = [
          {
            id: currentUserId,
            name: decoded.name,
            email: decoded.email,
            type: 'TeamLeader'
          }
        ];
        
        if (response.teamLeader.employees?.length > 0) {
          response.teamLeader.employees.forEach(employee => {
            allMembers.push({
              id: employee._id,
              name: employee.name,
              email: employee.email,
              type: 'Employee'
            });
          });
        }
        
        setTeamMembers(allMembers);
        setNewTaskData(prev => ({
          ...prev,
          assignedUserId: currentUserId,
          assignedUserType: 'TeamLeader'
        }));

        // Fetch clients for the teamleader
        const clientResponse = await getClientsForTeamLeader({ teamLeaderId: currentUserId });
        console.log('TeamLeader client response:', clientResponse.clients);
        setClients(clientResponse.clients || []);
      }
      
      setIsAddingTask(true);
    } catch (error) {
      console.error('Failed to prepare add task modal:', error);
      setClients([]);
      setTeamMembers([]);
      setIsAddingTask(true);
    }
  };

  // Update the assignment section render function
  const renderAssignmentSection = () => {
    const token = localStorage.getItem('token');
    const userRole = token ? jwtDecode(token).role.toLowerCase() : '';
    
    return (
      <div className="space-y-4">
        {userRole === 'admin' && (
          <div>
            <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
              Assign To
            </label>
            <select
              value={newTaskData.assignedUserId}
              onChange={(e) => {
                const selectedMember = teamMembers.find(member => member.id === e.target.value);
                setNewTaskData(prev => ({
                  ...prev,
                  assignedUserId: e.target.value,
                  assignedUserType: selectedMember?.type || 'TeamLeader'
                }));
              }}
              className={`w-full p-2 rounded border ${
                isDarkMode 
                  ? 'bg-gray-700 border-gray-600 text-white' 
                  : 'bg-white border-gray-300'
              }`}
            >
              <option value="">Select Team Member</option>
              {teamMembers
                .filter(member => member.type === 'TeamLeader')
                .map(teamLeader => (
                  <optgroup key={teamLeader.id} label={`TeamLeader: ${teamLeader.name}`}>
                    <option value={teamLeader.id}>{teamLeader.name}</option>
                    {teamMembers
                      .filter(member => 
                        member.type === 'Employee' && 
                        member.teamLeaderId === teamLeader.id
                      )
                      .map(employee => (
                        <option key={employee.id} value={employee.id}>
                          └─ {employee.name}
                        </option>
                      ))
                    }
                  </optgroup>
                ))}
            </select>
          </div>
        )}

        {(userRole === 'teamleader' || userRole === 'employee') && (
          <div>
            <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
              Assign To
            </label>
            <select
              value={newTaskData.assignedUserId}
              onChange={(e) => {
                const selectedMember = teamMembers.find(member => member.id === e.target.value);
                setNewTaskData(prev => ({
                  ...prev,
                  assignedUserId: e.target.value,
                  assignedUserType: selectedMember?.type || 'Employee'
                }));
              }}
              className={`w-full p-2 rounded border ${
                isDarkMode 
                  ? 'bg-gray-700 border-gray-600 text-white' 
                  : 'bg-white border-gray-300'
              }`}
              disabled={userRole === 'employee'} // Disable dropdown for employees
            >
              <option value="">Select Team Member</option>
              {teamMembers.map(member => (
                <option key={member.id} value={member.id}>
                  {member.name} ({member.type})
                </option>
              ))}
            </select>
          </div>
        )}
      </div>
    );
  };

  // Update the renderClientSection function
  const renderClientSection = () => {
    console.log('Rendering client section with clients:', clients);
    
    return (
      <div>
        <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
          Client*
        </label>
        <select
          value={newTaskData.clientId}
          onChange={(e) => {
            console.log('Selected client ID:', e.target.value);
            setNewTaskData(prev => ({ ...prev, clientId: e.target.value }));
          }}
          className={`w-full p-2 rounded border ${
            isDarkMode 
              ? 'bg-gray-700 border-gray-600 text-white' 
              : 'bg-white border-gray-300'
          }`}
          required
        >
          <option value="">Select Client</option>
          {Array.isArray(clients) && clients.length > 0 ? (
            clients.map(client => (
              <option key={client._id} value={client._id}>
                {client.companyName} - {client.name}
              </option>
            ))
          ) : (
            <option value="" disabled>No clients available</option>
          )}
        </select>
      </div>
    );
  };

  // Update the filter dropdown section in the render
  const renderFilterDropdown = () => {
    const isAdmin = userRole === 'admin';

    return (
      <div ref={filterRef} className={`absolute left-0 top-full mt-2 w-80 rounded-xl shadow-xl z-50 
        ${isDarkMode ? 'bg-gray-800/95' : 'bg-white'} 
        backdrop-blur-sm border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}
      >
        <div className="p-5 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 pb-4">
            <h3 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
              Filter Tasks
            </h3>
            <button
              onClick={() => {
                setActiveFilters({
                  taskType: 'all',
                  priority: 'all',
                  employee: 'all'
                });
              }}
              className={`text-sm ${isDarkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-500 hover:text-blue-600'}`}
            >
              Reset all
            </button>
          </div>

          {/* Task Type Filter */}
          <div>
            <label className={`block text-sm font-medium mb-3 
              ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Task Type
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { value: 'all', label: 'All' },
                { value: 'deadline', label: 'Deadline' },
                { value: 'recurring', label: 'Recurring' },
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() => setActiveFilters(prev => ({ ...prev, taskType: option.value }))}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200
                    ${activeFilters.taskType === option.value
                      ? (isDarkMode 
                          ? 'bg-blue-500 text-white' 
                          : 'bg-blue-50 text-blue-600')
                      : (isDarkMode 
                          ? 'bg-gray-700/50 text-gray-300' 
                          : 'bg-gray-50 text-gray-600')
                    }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Priority Filter */}
          <div>
            <label className={`block text-sm font-medium mb-3 
              ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Priority Level
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[
                { value: 'all', label: 'All' },
                { value: 'high', label: 'High' },
                { value: 'medium', label: 'Medium' },
                { value: 'low', label: 'Low' },
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() => setActiveFilters(prev => ({ ...prev, priority: option.value }))}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200
                    ${activeFilters.priority === option.value
                      ? (isDarkMode 
                          ? 'bg-blue-500 text-white' 
                          : 'bg-blue-50 text-blue-600')
                      : (isDarkMode 
                          ? 'bg-gray-700/50 text-gray-300' 
                          : 'bg-gray-50 text-gray-600')
                    }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Employee Filter - Show different options based on role */}
          <div>
            <label className={`block text-sm font-medium mb-3 
              ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              {isAdmin ? 'Team Members' : 'Assigned To'}
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setActiveFilters(prev => ({ ...prev, employee: 'all' }))}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200
                  ${activeFilters.employee === 'all'
                    ? (isDarkMode 
                        ? 'bg-blue-500 text-white' 
                        : 'bg-blue-50 text-blue-600')
                    : (isDarkMode 
                        ? 'bg-gray-700/50 text-gray-300' 
                        : 'bg-gray-50 text-gray-600')
                  }`}
                >
                  All
                </button>
              {teamMembers.map((member) => (
                <button
                  key={member.id}
                  onClick={() => setActiveFilters(prev => ({ ...prev, employee: member.id }))}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200
                    ${activeFilters.employee === member.id
                      ? (isDarkMode 
                          ? 'bg-blue-500 text-white' 
                          : 'bg-blue-50 text-blue-600')
                      : (isDarkMode 
                          ? 'bg-gray-700/50 text-gray-300' 
                          : 'bg-gray-50 text-gray-600')
                    }`}
                >
                  {member.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        {/* Left Side */}
        <div className="flex flex-col text-left gap-4">
          <div className="flex flex-col text-left">
            <h1 className="text-3xl font-bold text-[#1A1A2E] tracking-tight font-syne">Resource Allocation</h1>
          </div>
          
          {/* Filter Button and Dropdown */}
          <div className="relative mt-2">
            <button
              onClick={() => setFilterOpen(!filterOpen)}
              className="flex items-center gap-2 px-4 py-2.5 bg-white border border-[#F4F3EF] text-[#1A1A2E] rounded-xl text-sm font-bold hover:border-[#E8E7E2] transition-all shadow-sm active:scale-95"
            >
              <FunnelIcon className="w-5 h-5" />
              <span className="text-sm font-medium">Filter</span>
              {(activeFilters.taskType !== 'all' || activeFilters.priority !== 'all') && (
                <span className="w-2 h-2 rounded-full bg-blue-500"></span>
              )}
            </button>

            {/* Filter Dropdown */}
            {filterOpen && renderFilterDropdown()}
          </div>
        </div>

        {/* Right Side - Add Task Button */}
        {userRole !== 'employee' && (
          <div className="flex items-center gap-4">
            <button
              onClick={openAddTaskModal}
              className="px-6 py-2.5 bg-[#1A1A2E] text-white rounded-xl text-sm font-bold hover:bg-[#2A2A3E] transition-all shadow-lg shadow-slate-200 flex items-center gap-2 active:scale-95"
            >
              <PlusIcon className="w-5 h-5" />
              Add Task
            </button>

            {/* Button to open Recurring Tasks Modal */}
            <button
              onClick={openRecurringTasksModal}
              className="px-4 py-2.5 bg-white border border-[#F4F3EF] text-[#1A1A2E] rounded-xl text-sm font-bold hover:border-[#E8E7E2] transition-all shadow-sm flex items-center gap-2 active:scale-95"
            >
              <span>View Recurring Tasks</span>
            </button>
          </div>
        )}
      </div>

      {/* Updated Global Add Task Modal */}
      {isAddingTask && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 w-[480px]`}>
            <div className="flex justify-between items-center mb-4">
              <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                Add New Task
              </h3>
              <button
                onClick={() => setIsAddingTask(false)}
                className={`p-1 rounded-full ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-200'}`}
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>

            {/* Add form element with onSubmit handler */}
            <form onSubmit={handleGlobalAddTask} className="space-y-4">
              {/* Task Title */}
              <div>
                <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                  Task Title*
                </label>
                <input
                  type="text"
                  name="title"
                  value={newTaskData.title}
                  onChange={(e) => setNewTaskData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Enter task title"
                  className={`w-full p-2 rounded border ${
                    isDarkMode 
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                      : 'bg-white border-gray-300 placeholder-gray-500'
                  }`}
                />
              </div>

              {/* Task Description */}
              <div>
                <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                  Task Description*
                </label>
                <textarea
                  name="description"
                  value={newTaskData.description}
                  onChange={(e) => setNewTaskData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Enter task description"
                  rows="3"
                  className={`w-full p-2 rounded border ${
                    isDarkMode 
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                      : 'bg-white border-gray-300 placeholder-gray-500'
                  }`}
                />
              </div>

              {/* Client Selection */}
              {renderClientSection()}

              {/* Category Selection */}
              <div>
                <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                  Category
                </label>
                <select
                  name="category"
                  value={newTaskData.category}
                  onChange={(e) => setNewTaskData(prev => ({ ...prev, category: e.target.value }))}
                  className={`w-full p-2 rounded border ${
                    isDarkMode 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300'
                  }`}
                >
                  <option value="Deadline">Deadline</option>
                  <option value="Frequency">Frequency</option>
                </select>
              </div>

              {/* Conditional rendering based on category */}
              {newTaskData.category === 'Deadline' ? (
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                    Due Date
                  </label>
                  <input
                    type="datetime-local"
                    name="dueDate"
                    value={newTaskData.dueDate}
                    onChange={(e) => setNewTaskData(prev => ({ ...prev, dueDate: e.target.value }))}
                    className={`w-full p-2 rounded-lg border ${
                      isDarkMode 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-300'
                    }`}
                  />
                </div>
              ) : (
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                    Frequency
                  </label>
                  <Select
                    value={groupedOptions
                      .flatMap(group => group.options)
                      .find(option => option.value === newTaskData.frequency)}
                    onChange={(selected) => setNewTaskData(prev => ({ 
                      ...prev, 
                      frequency: selected.value 
                    }))}
                    options={groupedOptions}
                    className={`${isDarkMode ? 'select-dark' : ''}`}
                    styles={{
                      control: (base) => ({
                        ...base,
                        backgroundColor: isDarkMode ? '#374151' : 'white',
                        borderColor: isDarkMode ? '#4B5563' : '#D1D5DB',
                        '&:hover': {
                          borderColor: isDarkMode ? '#6B7280' : '#9CA3AF'
                        }
                      }),
                      menu: (base) => ({
                        ...base,
                        backgroundColor: isDarkMode ? '#1F2937' : 'white',
                        border: `1px solid ${isDarkMode ? '#4B5563' : '#D1D5DB'}`
                      }),
                      option: (base, state) => ({
                        ...base,
                        backgroundColor: state.isFocused
                          ? isDarkMode ? '#374151' : '#F3F4F6'
                          : 'transparent',
                        color: isDarkMode ? 'white' : 'black',
                        '&:hover': {
                          backgroundColor: isDarkMode ? '#4B5563' : '#E5E7EB'
                        }
                      }),
                      group: (base) => ({
                        ...base,
                        paddingTop: 8,
                        paddingBottom: 8
                      }),
                      groupHeading: (base) => ({
                        ...base,
                        color: isDarkMode ? '#9CA3AF' : '#6B7280',
                        fontWeight: 600,
                        fontSize: '0.875rem'
                      }),
                      singleValue: (base) => ({
                        ...base,
                        color: isDarkMode ? 'white' : 'black'
                      }),
                      input: (base) => ({
                        ...base,
                        color: isDarkMode ? 'white' : 'black'
                      })
                    }}
                    placeholder="Select frequency..."
                  />
                </div>
              )}

              {/* Priority */}
              <div>
                <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                  Priority
                </label>
                <select
                  name="priority"
                  value={newTaskData.priority}
                  onChange={(e) => setNewTaskData(prev => ({ ...prev, priority: e.target.value }))}
                  className={`w-full p-2 rounded border ${
                    isDarkMode 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300'
                  }`}
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
              </div>

              {/* Assigned To Dropdown */}
              {renderAssignmentSection()}

              {/* Add Submit Button */}
              <div className="flex justify-end mt-6">
                <button
                  type="submit"
                  className="inline-flex justify-center py-2 px-4 border border-transparent 
                    shadow-sm text-sm font-medium rounded-md text-white 
                    bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 
                    focus:ring-offset-2 focus:ring-blue-500"
                >
                  Create Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Recurring Tasks Modal */}
      {isRecurringModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 w-[80vw] max-w-4xl max-h-[80vh] overflow-y-auto`}>
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                  Recurring Tasks
                </h3>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Total Tasks: {recurringTasks.length}
                </p>
              </div>
              <button 
                onClick={closeRecurringTasksModal} 
                className={`p-2 rounded-lg hover:bg-gray-100 ${isDarkMode ? 'hover:bg-gray-700' : ''}`}
              >
                <XMarkIcon className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="space-y-4">
              {recurringTasks.length === 0 ? (
                <p className={`text-center ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  No recurring tasks found
                </p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {recurringTasks.map(task => (
                    <div 
                      key={task.id || task._id} 
                      className={`p-4 rounded-lg ${
                        isDarkMode ? 'bg-gray-700' : 'bg-gray-50'
                      } border ${
                        isDarkMode ? 'border-gray-600' : 'border-gray-200'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <h4 className={`text-base font-semibold ${
                          isDarkMode ? 'text-white' : 'text-gray-900'
                        }`}>
                          {task.title}
                        </h4>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          task.priority === 'High' ? 'bg-red-100 text-red-800' :
                          task.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {task.priority}
                        </span>
                      </div>

                      <p className={`mt-2 text-sm ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-600'
                      }`}>
                        {task.description}
                      </p>

                      <div className="mt-3 space-y-2 text-sm">
                        <div className="flex items-start gap-2">
                          <span className={`font-medium ${
                            isDarkMode ? 'text-gray-400' : 'text-gray-500'
                          }`}>
                            Client:
                          </span>
                          <span className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>
                            {task.client ? (
                              <>
                                {task.client.name}
                                {task.client.companyName && (
                                  <span className="text-gray-500"> ({task.client.companyName})</span>
                                )}
                              </>
                            ) : 'No Client Assigned'}
                          </span>
                        </div>

                        <div className="flex items-start gap-2">
                          <span className={`font-medium ${
                            isDarkMode ? 'text-gray-400' : 'text-gray-500'
                          }`}>
                            Frequency:
                          </span>
                          <span className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>
                            {task.frequency}
                          </span>
                        </div>

                        <div className="flex items-start gap-2">
                          <span className={`font-medium ${
                            isDarkMode ? 'text-gray-400' : 'text-gray-500'
                          }`}>
                            Assigned To:
                          </span>
                          <span className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>
                            {task.assignedTo.userId ? (
                              <>
                                {task.assignedTo.userId.name}
                                <span className="text-gray-500"> ({task.assignedTo.userType})</span>
                              </>
                            ) : (
                              `Unassigned ${task.assignedTo.userType}`
                            )}
                          </span>
                        </div>

                        <div className="flex items-start gap-2">
                          <span className={`font-medium ${
                            isDarkMode ? 'text-gray-400' : 'text-gray-500'
                          }`}>
                            Created:
                          </span>
                          <span className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>
                            {new Date(task.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>

                      {/* Add Action Buttons */}
                      <div className="mt-4 flex justify-end space-x-2">
                        <button
                          onClick={() => handleTaskAction(task.id || task._id, 'deactivate')}
                          disabled={isActionLoading || !task.active}
                          className={`px-3 py-1 rounded text-sm font-medium ${
                            isDarkMode 
                              ? 'bg-yellow-600 hover:bg-yellow-700 text-white' 
                              : 'bg-yellow-100 hover:bg-yellow-200 text-yellow-800'
                          } ${(!task.active || isActionLoading) && 'opacity-50 cursor-not-allowed'}`}
                        >
                          {task.active ? 'Deactivate' : 'Inactive'}
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm('Are you sure you want to delete this recurring task? This action cannot be undone.')) {
                              handleTaskAction(task.id || task._id, 'delete');
                            }
                          }}
                          disabled={isActionLoading}
                          className={`px-3 py-1 rounded text-sm font-medium ${
                            isDarkMode 
                              ? 'bg-red-600 hover:bg-red-700 text-white' 
                              : 'bg-red-100 hover:bg-red-200 text-red-800'
                          } ${isActionLoading && 'opacity-50 cursor-not-allowed'}`}
                        >
                          Delete
                        </button>
                      </div>

                      {/* Add Status Badge */}
                      <div className="mt-2">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          task.active 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {task.active ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-2 sm:gap-3">
          {[...Array(5)].map((_, index) => (
            <div key={index} className={`w-full ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'} rounded-lg p-2 sm:p-3`}>
              <div className="flex justify-between items-center mb-4">
                <div className={`h-4 w-24 rounded ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'} animate-pulse`}></div>
                <div className={`h-4 w-8 rounded ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'} animate-pulse`}></div>
              </div>
              
              <div className="space-y-3">
                {[...Array(3)].map((_, taskIndex) => (
                  <div 
                    key={taskIndex} 
                    className={`w-full h-24 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'} animate-pulse`}
                  ></div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
          onDeleteTask={handleDeleteTask}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-2 sm:gap-3">
            {Object.values(columns).map((column) => (
              <div key={column.id}>
                <div className={`w-full ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'} rounded-lg p-2 sm:p-3`}>
                  <div className="flex justify-between items-center mb-2">
                    <h3 className={`text-xs sm:text-sm font-semibold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                      {column.title} ({getFilteredTasks(column.tasks).length})
                    </h3>
                    
                    {/* Delete All Button - Only show for admin and teamleader */}
                    {getFilteredTasks(column.tasks).length > 0 && 
                     (userRole === 'admin' || userRole === 'teamleader') && (
                      <button
                        onClick={() => handleDeleteAllTasks(column.id)}
                        className={`p-1 rounded-lg transition-colors duration-200 group
                          ${isDarkMode 
                            ? 'hover:bg-red-500/20 text-gray-400 hover:text-red-400' 
                            : 'hover:bg-red-100 text-gray-500 hover:text-red-600'}`}
                        title={`Delete all tasks in ${column.title}`}
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  <Column
                    id={column.id}
                    title={column.title}
                    tasks={getFilteredTasks(column.tasks)}
                    isDarkMode={isDarkMode}
                    onDeleteTask={handleDeleteTask}
                    activeId={activeId}
                    userRole={userRole}
                  />
                </div>
              </div>
            ))}
          </div>
          <DragOverlay dropAnimation={null}>
            {activeId ? (
              <Card
                task={columns[findContainer(activeId)]?.tasks.find(task => task.id === activeId)}
                isDarkMode={isDarkMode}
                onDeleteTask={handleDeleteTask}
                isDragging={true}
                columnId={findContainer(activeId)}
                userRole={userRole}
                isOverlay={true}
              />
            ) : null}
          </DragOverlay>
        </DndContext>
      )}

      {/* Add this CSS for custom scrollbar */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-track {
          background: ${isDarkMode ? '#374151' : '#f3f4f6'};
          border-radius: 6px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: ${isDarkMode ? '#4b5563' : '#d1d5db'};
          border-radius: 6px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: ${isDarkMode ? '#6b7280' : '#9ca3af'};
        }
      `}</style>
    </div>
  );
};

export default TaskTab;








  