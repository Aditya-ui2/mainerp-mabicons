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
  const rawToken = localStorage.getItem('token');
  const token = rawToken ? String(rawToken).replace(/^"|"$/g, '').trim() : null;
  const department = localStorage.getItem('department');
  const userType = localStorage.getItem('userType');

  // ✅ No token = go to login
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // ✅ Get department directly from localStorage (no JWT decode needed)
  const userDepartment = department ? String(department).replace(/^"|"$/g, '').trim() : 'Both';

  // ✅ 'Both' allowedDepartment = access to everything
  if (allowedDepartment === 'Both') {
    return children;
  }

  // ✅ User with 'Both' department can access any department route
  if (userDepartment === 'Both') {
    return children;
  }

  // ✅ Exact department match = allow
  if (userDepartment === allowedDepartment) {
    return children;
  }

  // User is not authorized for this specific department
  console.log(`Access denied for ${userDepartment}. Requires ${allowedDepartment}`);

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
