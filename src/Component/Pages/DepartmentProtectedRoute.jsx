import { Navigate } from 'react-router-dom';

/**
 * Protected Route Component for Department-based Access Control
 * ✅ JWT decode hata diya — sirf localStorage use karta hai
 *
 * @param {Object} props
 * @param {React.Component} props.children - The component to render if authorized
 * @param {string} props.allowedDepartment - 'HR Operations' | 'HR Recruitment' | 'Both'
 * @param {string} props.redirectPath - Path to redirect if unauthorized
 */
const DepartmentProtectedRoute = ({ children, allowedDepartment, redirectPath = '/login' }) => {
  const token = localStorage.getItem('token');
  const department = localStorage.getItem('department');
  const userType = localStorage.getItem('userType');

  // ✅ No token = go to login
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // ✅ Get department directly from localStorage (no JWT decode needed)
  const userDepartment = department || 'Both';

  // ✅ 'Both' allowedDepartment = access to everything
  if (allowedDepartment === 'Both') {
    return children;
  }

  // ✅ Exact department match = allow
  if (userDepartment === allowedDepartment) {
    return children;
  }

  // ✅ Wrong department = redirect to correct dashboard
  if (userDepartment === 'HR Recruitment') {
    return <Navigate to="/kam-recruitment-dashboard" replace />;
  }

  if (userDepartment === 'HR Operations') {
    return <Navigate to="/kam-operations-dashboard" replace />;
  }

  // Fallback
  return <Navigate to={redirectPath} replace />;
};

/**
 * Hook to get current user's department
 */
export const useUserDepartment = () => {
  return localStorage.getItem('department') || 'Both';
};

/**
 * Check if user has access to a specific department
 */
export const hasAccessTo = (department) => {
  const userDepartment = localStorage.getItem('department') || 'Both';
  if (userDepartment === 'Both') return true;
  return userDepartment === department;
};

export default DepartmentProtectedRoute;
