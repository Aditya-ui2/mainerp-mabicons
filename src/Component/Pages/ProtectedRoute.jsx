import { Navigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import { useEffect } from 'react';
import { getAllNotifications } from './service/api';
const normalizeRole = (role) => {
  const value = String(role || '').trim().toLowerCase();
  if (['superadmin', 'super_admin', 'super admin'].includes(value)) return 'superadmin';
  if (['admin'].includes(value)) return 'admin';
  if (['teamleader', 'team_leader', 'team leader'].includes(value)) return 'teamleader';
  if (['employee'].includes(value)) return 'employee';
  if (['bdexecutive', 'bd_executive', 'bd executive', 'bd'].includes(value)) return 'bd';
  if (['hroperations', 'hr_operations', 'hr operations', 'operations', 'ops_kam', 'operations_kam'].includes(value)) return 'hroperations';
  if (['recruitmenthead', 'recruitment_head', 'recruitment head', 'recruitment'].includes(value)) return 'recruitmenthead';
  if (['kamrecruitment', 'kam_recruitment', 'kam recruitment', 'kam', 'hr recruitment', 'hr executive', 'recruitment_kam', 'recruitmentkam'].includes(value)) return 'kamrecruitment';
  if (['client', 'customer'].includes(value)) return 'client';
  if (['accounts', 'accountsmanager', 'accounts manager'].includes(value)) return 'accounts';
  if (['tech'].includes(value)) return 'tech';
  if (['sales'].includes(value)) return 'sales';
  if (['saleskam', 'sales_kam', 'sales kam'].includes(value)) return 'saleskam';
  return value;
};

const ProtectedRoute = ({ children, allowedRoles }) => {
  const rawToken = localStorage.getItem('token');
  const token = rawToken ? String(rawToken).replace(/^"|"$/g, '').trim() : null;

  // Poll for user status every 30s. The interceptor in api.jsx will catch 401 and auto-logout.
  useEffect(() => {
    if (!token) return;
    
    // Initial check and interval setup
    const checkStatus = () => {
      // Lightest API call to verify the session is still active
      getAllNotifications().catch(err => {
        // We only care if it's explicitly unauthorized (handled by interceptor)
        console.debug('Background status check:', err?.message || 'Error');
      });
    };
    
    const interval = setInterval(checkStatus, 30000);
    return () => clearInterval(interval);
  }, [token]);

  // Check if token exists
  if (!token) {
    return <Navigate to="/login" />;
  }

  try {
    // Decode the token to get user information
    const decoded = jwtDecode(token);
    const userRole = normalizeRole(decoded.role);
    const userEmail = (decoded.email || localStorage.getItem('userEmail') || '').toLowerCase();

    // Special restriction: Ashwin can ONLY access the CRM dashboard
    if (userEmail.includes('ashwin') && !window.location.pathname.includes('/crm-dashboard')) {
      console.log('Restriction: Ashwin redirected to CRM Dashboard');
      return <Navigate to="/crm-dashboard" />;
    }

    // Check if user's role is allowed to access this route
    if (!allowedRoles.map(role => normalizeRole(role)).includes(userRole)) {
      // Redirect to appropriate dashboard based on user role
      switch (userRole) {
        case 'teamleader':
          return <Navigate to="/teamleader-dashboard" />;
        case 'admin':
          return <Navigate to="/client-dashboard" />;
        case 'customer':
          return <Navigate to="/customer-dashboard" />;
        case 'superadmin':
          return <Navigate to="/superadmin-dashboard" />;
        case 'employee':
          return <Navigate to="/employee-dashboard" />;
        case 'bd':
          return <Navigate to="/bd-dashboard" />;
        case 'crm':
          return <Navigate to="/crm-dashboard" />;
        case 'candidate':
          return <Navigate to="/candidate-dashboard" />;
        case 'kamrecruitment':
        case 'hr executive':
        case 'hr recruitment':
          return <Navigate to="/kam-member-dashboard" />;
        case 'saleskam':
          return <Navigate to="/sales-kam-dashboard" />;
        case 'sales':
          return <Navigate to="/sales-dashboard" />;
        case 'tech':
          return <Navigate to="/tech-dashboard" />;
        default:
          return <Navigate to="/login" />;
      }
    }

    // Prefer JWT exp if present; fallback to iat-based window.
    if (decoded.exp && Date.now() / 1000 > decoded.exp) {
      localStorage.removeItem('token');
      return <Navigate to="/login" />;
    }

    const tokenAge = decoded.iat ? (Date.now() / 1000 - decoded.iat) : 0;
    if (tokenAge > 7 * 24 * 60 * 60) { // 7 days in seconds
      localStorage.removeItem('token');
      return <Navigate to="/login" />;
    }

    return children;
  } catch (error) {
    // If token is invalid or there's an error decoding
    console.error('Error decoding token:', error);
    localStorage.removeItem('token');
    return <Navigate to="/login" />;
  }
};

export default ProtectedRoute;
