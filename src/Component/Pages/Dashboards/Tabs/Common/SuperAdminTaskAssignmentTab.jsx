import React, { useState } from 'react';
import TaskAssignmentTab from './TaskAssignmentTab';
import { FiChevronDown } from 'react-icons/fi';

const SuperAdminTaskAssignmentTab = ({ notificationBell }) => {
  const [selectedDepartment, setSelectedDepartment] = useState('HR Recruitment');

  const departments = [
    'HR Recruitment',
    'HR Operations',
    'CRM',
    'Account',
    'Sales',
    'Tech',
    'KAM'
  ];

  const customNotificationBell = (
    <div className="flex items-center gap-4">
      {notificationBell}
    </div>
  );

  const customFilter = (
    <div className="relative group">
      <select
        value={selectedDepartment}
        onChange={(e) => setSelectedDepartment(e.target.value)}
        className="bg-[#F4F3EF] text-[11px] font-black uppercase tracking-widest text-[#1A1A2E] rounded-xl pl-4 pr-10 py-2.5 outline-none border-0 cursor-pointer appearance-none min-w-[140px] hover:bg-[#EEF2FB] transition-all"
      >
        {departments.map((dept) => (
          <option key={dept} value={dept}>
            {dept} Dept
          </option>
        ))}
      </select>
      <FiChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#1B4DA0] opacity-50 group-hover:opacity-100 transition-all pointer-events-none" />
    </div>
  );

  return (
    <div className="flex flex-col h-full">
      <TaskAssignmentTab 
        department={selectedDepartment} 
        userRole="superadmin" 
        notificationBell={customNotificationBell} 
        customFilter={customFilter}
      />
    </div>
  );
};

export default SuperAdminTaskAssignmentTab;
