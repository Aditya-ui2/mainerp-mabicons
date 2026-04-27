import { Navigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const rawToken = localStorage.getItem('token');
  const token = rawToken ? String(rawToken).replace(/^"|"$/g, '').trim() : null;

  // Check if token exists
  if (!token) {
    return <Navigate to="/login" />;
  }

  try {
    // Decode the token to get user information
    const decoded = jwtDecode(token);
    const userRole = decoded.role.toLowerCase();
    const userEmail = (decoded.email || localStorage.getItem('userEmail') || '').toLowerCase();

    // Special restriction: Ashwin can ONLY access the CRM dashboard
    if (userEmail.includes('ashwin') && !window.location.pathname.includes('/crm-dashboard')) {
      console.log('Restriction: Ashwin redirected to CRM Dashboard');
      return <Navigate to="/crm-dashboard" />;
    }

    // Check if user's role is allowed to access this route
    if (!allowedRoles.map(role => role.toLowerCase()).includes(userRole)) {
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
