import React from 'react';
import { Card, Typography, Badge, Chip, Tooltip } from "@material-tailwind/react";
import { 
  CheckCircleIcon, 
  ClockIcon, 
  XCircleIcon,
  CalendarIcon,
  ArrowPathIcon,
  UserCircleIcon,
  FireIcon
} from "@heroicons/react/24/solid";

const Timeline = () => {
  // Sample tasks data
  const tasks = [
    {
      id: 1,
      title: "Project Initiation",
      description: "Initial project setup and requirements gathering",
      dueDate: "2024-03-20",
      status: "completed",
      completedDate: "2024-03-19",
      assignee: "John Doe",
      priority: "high"
    },
    {
      id: 2,
      title: "Design Phase",
      description: "UI/UX design and prototyping",
      dueDate: "2024-03-25",
      status: "completed",
      completedDate: "2024-03-24",
      assignee: "Jane Smith",
      priority: "medium"
    },
    {
      id: 3,
      title: "Development",
      description: "Frontend and backend implementation",
      dueDate: "2024-04-10",
      status: "in-progress",
      assignee: "Mike Johnson",
      priority: "high"
    },
    {
      id: 4,
      title: "Testing",
      description: "Quality assurance and bug fixes",
      dueDate: "2024-04-20",
      status: "pending",
      assignee: "Sarah Williams",
      priority: "medium"
    }
  ];

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircleIcon className="h-6 w-6 text-green-500 dark:text-green-400" />;
      case 'in-progress':
        return <ArrowPathIcon className="h-6 w-6 text-blue-500 dark:text-blue-400 animate-spin" />;
      case 'pending':
        return <ClockIcon className="h-6 w-6 text-gray-500 dark:text-gray-400" />;
      default:
        return <XCircleIcon className="h-6 w-6 text-red-500 dark:text-red-400" />;
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'red';
      case 'medium':
        return 'amber';
      case 'low':
        return 'green';
      default:
        return 'blue-gray';
    }
  };

  return (
    <Card className="p-6 shadow-xl bg-white dark:bg-gray-900 border dark:border-gray-800">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-50 dark:bg-blue-500/10 rounded-lg">
            <FireIcon className="h-6 w-6 text-blue-500 dark:text-blue-400" />
          </div>
          <Typography variant="h5" className="font-bold dark:text-white">
            Project Timeline
          </Typography>
        </div>
        
        <div className="flex gap-3">
          <Badge content={tasks.filter(t => t.status === 'completed').length}>
            <Chip
              value="Completed"
              color="green"
              variant="gradient"
              className="rounded-full"
            />
          </Badge>
          <Badge content={tasks.filter(t => t.status === 'in-progress').length}>
            <Chip
              value="In Progress"
              color="blue"
              variant="gradient"
              className="rounded-full"
            />
          </Badge>
          <Badge content={tasks.filter(t => t.status === 'pending').length}>
            <Chip
              value="Pending"
              variant="gradient"
              className="rounded-full bg-gray-500/10 text-gray-500 dark:bg-gray-700 dark:text-gray-300"
            />
          </Badge>
        </div>
      </div>

      <div className="relative">
        {tasks.map((task, index) => (
          <div key={task.id} className="mb-8">
            <div className="flex gap-4">
              <div className="flex flex-col items-center">
                <Tooltip content={task.status.toUpperCase()}>
                  <div className="z-10 bg-white dark:bg-gray-800 rounded-full p-1 shadow-lg">
                    {getStatusIcon(task.status)}
                  </div>
                </Tooltip>
                {index < tasks.length - 1 && (
                  <div className="w-0.5 h-full bg-gray-300 dark:bg-gray-700 transform translate-y-2" />
                )}
              </div>
              
              <div className="flex-1 bg-gray-50 dark:bg-gray-800 rounded-xl p-4 shadow-md hover:shadow-lg transition-shadow duration-300">
                <div className="flex justify-between items-start mb-2">
                  <Typography variant="h6" className="font-bold">
                    {task.title}
                  </Typography>
                  <Chip
                    value={task.priority}
                    color={getPriorityColor(task.priority)}
                    size="sm"
                    className="capitalize"
                  />
                </div>
                
                <Typography className="text-gray-700 dark:text-gray-300 mb-3">
                  {task.description}
                </Typography>
                
                <div className="flex justify-between items-center text-sm">
                  <div className="flex items-center gap-2">
                    <CalendarIcon className="h-4 w-4 text-blue-500" />
                    <Typography variant="small" color="gray" className="flex items-center">
                      Due: {task.dueDate}
                    </Typography>
                  </div>
                  
                  <Tooltip content="Assignee">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs">
                        {task.assignee.split(' ').map(n => n[0]).join('')}
                      </div>
                      <Typography variant="small" color="gray">
                        {task.assignee}
                      </Typography>
                    </div>
                  </Tooltip>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};

export default Timeline;
