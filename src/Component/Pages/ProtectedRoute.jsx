import { Navigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const token = localStorage.getItem('token');

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
        default:
          return <Navigate to="/login" />;
      }
    }

    // Since your token doesn't have exp, you might want to use iat to check token age
    // For example, expire token after 24 hours
    const tokenAge = Date.now() / 1000 - decoded.iat;
    if (tokenAge > 24 * 60 * 60) { // 24 hours in seconds
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
