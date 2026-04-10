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
    const userRole = decoded.role.toLowerCase(); // Convert to lowercase for consistent comparison

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
