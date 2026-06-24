import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { Card } from './Card';

export function Column({ id, tasks, isDarkMode, onDeleteTask, activeId, userRole }) {
  const isDropDisabled = userRole === 'employee' && id === 'resolved';
  
  const { setNodeRef, isOver } = useDroppable({
    id: id,
    data: {
      type: 'column',
      id: id
    },
    disabled: isDropDisabled
  });

  return (
    <div
      ref={setNodeRef}
      className={`flex flex-col gap-3 p-2 rounded-lg ${
        isDropDisabled 
          ? (isDarkMode ? 'bg-gray-700/50 cursor-not-allowed' : 'bg-gray-200/50 cursor-not-allowed')
          : isOver 
            ? (isDarkMode ? 'bg-gray-600/50' : 'bg-gray-200/80')
            : ''
      }`}
    >
      {tasks.map((task) => (
        <Card
          key={task.id}
          task={task}
          isDarkMode={isDarkMode}
          onDeleteTask={onDeleteTask}
          isDragging={task.id === activeId}
          columnId={id}
          userRole={userRole}
        />
      ))}
    </div>
  );
}
