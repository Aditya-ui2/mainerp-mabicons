/**
 * RecruitmentContext - Role-based context for KAM Recruitment Dashboard
 * Manages user roles, team data, and permissions
 */

import { createContext, useContext, useState, useEffect } from 'react';

const RecruitmentContext = createContext(null);

// Team hierarchy data
const TEAM_DATA = {
  kam: {
    id: '',
    name: '',
    email: '',
    role: 'KAM',
    designation: '',
    photo: null,
  },
  members: [],
};

// Permissions by role
const PERMISSIONS = {
  KAM: {
    canViewAllCandidates: true,
    canAssignWork: true,
    canManageTeam: true,
    canViewAnalytics: true,
    canEditClients: true,
    canDeleteCandidates: true,
    canApproveOffers: true,
    canSyncSharePoint: true,
    canViewAllTasks: true,
    canAssignClients: true,
  },
  Employee: {
    canViewAllCandidates: false,
    canAssignWork: false,
    canManageTeam: false,
    canViewAnalytics: false,
    canEditClients: false,
    canDeleteCandidates: false,
    canApproveOffers: false,
    canSyncSharePoint: false,
    canViewAllTasks: false,
    canAssignClients: false,
    // Employee-specific permissions
    canViewAssignedCandidates: true,
    canUpdateCandidateStatus: true,
    canScheduleInterviews: true,
    canViewAssignedClients: true,
    canSubmitReports: true,
    canViewOwnTasks: true,
    canUpdateTaskStatus: true,
  },
};

export const RecruitmentProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [permissions, setPermissions] = useState({});
  const [teamMembers, setTeamMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate fetching user data from auth
    const fetchUserData = async () => {
      try {
        // In real app, get from auth context/API
        const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
        
        // Determine role based on user data
        let user = null;
        let role = 'Employee';
        
        // Check if user is KAM (Sachin)
        if (storedUser.email === 'sachin@mabicons.com' || 
            storedUser.role === 'KAM' ||
            storedUser.designation?.includes('Head')) {
          user = TEAM_DATA.kam;
          role = 'KAM';
        } else {
          // Find in team members
          const member = TEAM_DATA.members.find(
            m => m.email === storedUser.email || m.id === storedUser.id
          );
          if (member) {
            user = member;
            role = 'Employee';
          } else {
            // Default to first member for testing
            user = TEAM_DATA.members[0];
            role = 'Employee';
          }
        }

        setCurrentUser(user);
        setUserRole(role);
        setPermissions(PERMISSIONS[role] || PERMISSIONS.Employee);
        setTeamMembers(TEAM_DATA.members);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching user data:', error);
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  // Check if user has specific permission
  const hasPermission = (permission) => {
    return permissions[permission] === true;
  };

  // Get team member by ID
  const getTeamMember = (id) => {
    return teamMembers.find(m => m.id === id);
  };

  // Switch role for testing (dev only)
  const switchRole = (role) => {
    if (role === 'KAM') {
      setCurrentUser(TEAM_DATA.kam);
      setUserRole('KAM');
      setPermissions(PERMISSIONS.KAM);
    } else {
      setCurrentUser(TEAM_DATA.members[0]);
      setUserRole('Employee');
      setPermissions(PERMISSIONS.Employee);
    }
  };

  const value = {
    currentUser,
    userRole,
    permissions,
    teamMembers,
    loading,
    hasPermission,
    getTeamMember,
    switchRole, // For testing
    isKAM: userRole === 'KAM',
    isEmployee: userRole === 'Employee',
    kamInfo: TEAM_DATA.kam,
  };

  return (
    <RecruitmentContext.Provider value={value}>
      {children}
    </RecruitmentContext.Provider>
  );
};

export const useRecruitment = () => {
  const context = useContext(RecruitmentContext);
  if (!context) {
    throw new Error('useRecruitment must be used within a RecruitmentProvider');
  }
  return context;
};

export default RecruitmentContext;
