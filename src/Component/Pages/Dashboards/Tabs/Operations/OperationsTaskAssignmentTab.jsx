import React from 'react';
import TaskAssignmentTab from '../Common/TaskAssignmentTab';

const OperationsTaskAssignmentTab = (props) => {
  return (
    <TaskAssignmentTab 
      department="HR Operations" 
      {...props} 
    />
  );
};

export default OperationsTaskAssignmentTab;