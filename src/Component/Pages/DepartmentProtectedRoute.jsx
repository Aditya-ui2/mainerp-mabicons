import { Navigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

/**
 * Protected Route Component for Department-based Access Control
 * 
 * @param {Object} props
 * @param {React.Component} props.children - The component to render if authorized
 * @param {string} props.allowedDepartment - 'HR Operations' | 'HR Recruitment' | 'Both'
 * @param {string} props.redirectPath - Path to redirect if unauthorized
 */
const DepartmentProtectedRoute = ({ children, allowedDepartment, redirectPath = '/login' }) => {
  const token = localStorage.getItem('token');
  const userType = localStorage.getItem('userType');

  // If no token, redirect to login
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  try {
    const decoded = jwtDecode(token);
    const userDepartment = decoded.department || localStorage.getItem('department') || 'Both';

    // Check if token is expired
    if (decoded.exp && decoded.exp * 1000 < Date.now()) {
      localStorage.removeItem('token');
      localStorage.removeItem('userType');
      localStorage.removeItem('department');
      return <Navigate to="/login" replace />;
    }

    // Check department access
    // 'Both' department has access to everything
    if (userDepartment === 'Both') {
      return children;
    }

    // Check specific department access
    if (allowedDepartment === 'HR Operations' && userDepartment !== 'HR Operations') {
      // User doesn't have HR Operations access, redirect to their allowed dashboard
      return <Navigate to={userDepartment === 'HR Recruitment' ? '/kam-recruitment-dashboard' : redirectPath} replace />;
    }

    if (allowedDepartment === 'HR Recruitment' && userDepartment !== 'HR Recruitment') {
      // User doesn't have HR Recruitment access, redirect to their allowed dashboard
      return <Navigate to={userDepartment === 'HR Operations' ? '/kam-operations-dashboard' : redirectPath} replace />;
    }

    return children;
  } catch (error) {
    console.error('Error decoding token:', error);
    localStorage.removeItem('token');
    return <Navigate to="/login" replace />;
  }
};

/**
 * Hook to get current user's department access
 */
export const useUserDepartment = () => {
  try {
    const token = localStorage.getItem('token');
    if (!token) return null;

    const decoded = jwtDecode(token);
    return decoded.department || localStorage.getItem('department') || 'Both';
  } catch (error) {
    return null;
  }
};

/**
 * Check if user has access to a specific department
 */
export const hasAccessTo = (department) => {
  const userDepartment = useUserDepartment();
  if (!userDepartment) return false;
  if (userDepartment === 'Both') return true;
  return userDepartment === department;
};

export default DepartmentProtectedRoute;
