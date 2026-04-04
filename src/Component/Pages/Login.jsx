import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, useAnimation, AnimatePresence } from 'framer-motion';
// import { superAdminLogin, adminLogin, teamLeaderLogin, employeeLogin, bdExecutiveLogin, departmentTeamLogin } from './service/api';
import { FiMail, FiEye, FiEyeOff, FiSun, FiMoon } from 'react-icons/fi';

const BackgroundAnimation = () => (
  <div className="relative w-full h-full">
    {/* Gradient Background */}
    <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-purple-700" />
    
    {/* Animated Grid */}
    <div className="absolute inset-0" 
      style={{
        backgroundImage: `linear-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px), 
                         linear-gradient(90deg, rgba(255, 255, 255, 0.1) 1px, transparent 1px)`,
        backgroundSize: '50px 50px',
        animation: 'moveGrid 20s linear infinite',
      }}
    />

    {/* Floating Elements */}
    {[...Array(15)].map((_, i) => (
      <motion.div
        key={i}
        className="absolute rounded-full bg-white bg-opacity-20"
        style={{
          width: Math.random() * 100 + 50,
          height: Math.random() * 100 + 50,
          left: `${Math.random() * 100}%`,
          top: `${Math.random() * 100}%`,
        }}
        animate={{
          y: [0, -20, 0],
          opacity: [0.2, 0.5, 0.2],
          scale: [1, 1.2, 1],
        }}
        transition={{
          duration: 5 + Math.random() * 5,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
    ))}

    {/* Content Overlay */}
    <div className="relative z-10 h-full flex flex-col items-center justify-center text-white">
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-5xl font-bold mb-6"
      >
        Mabicons-ERP 
      </motion.h1>
  
    </div>
  </div>
);

const Star = ({ x, y, size }) => (
  <motion.div
    className={`absolute rounded-full bg-white ${size}`}
    style={{ x, y }}
    animate={{
      opacity: [0, 1, 0],
      scale: [0, 1, 0],
    }}
    transition={{
      duration: 2 + Math.random() * 3,
      repeat: Infinity,
      repeatType: "reverse",
    }}
  />
);

const Starfield = () => {
  const [stars, setStars] = useState([]);

  useEffect(() => {
    const newStars = [...Array(200)].map(() => ({
      x: Math.random() * 100 + '%',
      y: Math.random() * 100 + '%',
      size: Math.random() > 0.9 ? 'w-1 h-1' : 'w-0.5 h-0.5',
    }));
    setStars(newStars);
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {stars.map((star, i) => (
        <Star key={i} {...star} />
      ))}
    </div>
  );
};

const Toast = ({ message, isVisible, onClose, isDarkMode }) => (
  <AnimatePresence>
    {isVisible && (
      <motion.div
        initial={{ opacity: 0, y: -50, x: '-50%' }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -50 }}
        transition={{ duration: 0.5 }}
        className={`fixed top-4 left-1/2 transform -translate-x-1/2 ${
          isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'
        } px-6 py-3 rounded-lg shadow-lg z-50`}
      >
        <p>{message}</p>
        <Rocket isDarkMode={isDarkMode} />
        <motion.div
          className="absolute bottom-0 left-0 right-0 h-1 bg-blue-500"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 3 }}
          onAnimationComplete={onClose}
        />
      </motion.div>
    )}
  </AnimatePresence>
);

const Rocket = ({ isDarkMode }) => (
  <motion.div
    className="w-12 h-24 mx-auto mt-2"
    initial={{ y: 16 }}
    animate={{ y: -16 }}
    transition={{ duration: 2, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}
  >
    <svg width="100%" height="100%" viewBox="0 0 100 200" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Rocket body */}
      <path d="M50 0L80 120H20L50 0Z" fill={isDarkMode ? "#D1D5DB" : "#4B5563"}/>
      <path d="M50 0L65 120H35L50 0Z" fill={isDarkMode ? "#F3F4F6" : "#9CA3AF"}/>
      
      {/* Windows */}
      <circle cx="50" cy="50" r="10" fill="#60A5FA"/>
      <circle cx="50" cy="80" r="8" fill="#60A5FA"/>
      
      {/* Fins */}
      <path d="M20 120L0 180V120H20Z" fill={isDarkMode ? "#9CA3AF" : "#6B7280"}/>
      <path d="M80 120L100 180V120H80Z" fill={isDarkMode ? "#9CA3AF" : "#6B7280"}/>
      
      {/* Flame */}
      <motion.path
        d="M30 120C30 150 50 160 50 180C50 160 70 150 70 120H30Z"
        fill="#FCD34D"
        initial={{ scaleY: 0.8, y: 0 }}
        animate={{ scaleY: 1.2, y: 10 }}
        transition={{ duration: 0.5, repeat: Infinity, repeatType: "reverse" }}
      />
      <motion.path
        d="M40 120C40 140 50 150 50 160C50 150 60 140 60 120H40Z"
        fill="#F59E0B"
        initial={{ scaleY: 0.8, y: 0 }}
        animate={{ scaleY: 1.2, y: 5 }}
        transition={{ duration: 0.3, repeat: Infinity, repeatType: "reverse" }}
      />
    </svg>
  </motion.div>
);

// Predefined user credentials for Mabicons ERP
// Super-Admin: Ashish (Boss) - Can see everything
// Admins: Sachin (Recruitment Head), Ashwin (Manager), Ramesh (Operation Head)
// KAMs under Sachin: Priyanshi Sharma, Manju, Jyoti
const USER_CREDENTIALS = {
  // Super Admin - Ashish (Boss)
  'superadmin.mabicons@gmail.com': { password: 'SuperAdmin@123', role: 'superAdmin', department: null, name: 'Ashish (Super Admin)' },
  'ashish.mabicons@gmail.com': { password: 'Ashish@123', role: 'superAdmin', department: null, name: 'Ashish (Super Admin)' },
  
  // Admins
  'admin.mabicons@gmail.com': { password: 'Admin@123', role: 'admin', department: null, name: 'Admin' },
  'ashwin.mabicons@gmail.com': { password: 'Ashwin@123', role: 'admin', department: null, name: 'Ashwin (Manager)' },
  
  // Operation Head - Ramesh
  'operation.mabicons@gmail.com': { password: 'Operation@123', role: 'hrOperations', department: 'HR Operations', name: 'Ramesh (HR Operations Head)' },
  'ramesh.mabicons@gmail.com': { password: 'Ramesh@123', role: 'hrOperations', department: 'HR Operations', name: 'Ramesh (HR Operations Head)' },
  
  // Recruitment Head - Sachin
  'recruitment.mabicons@gmail.com': { password: 'Recruitment@123', role: 'recruitmentHead', department: 'HR Recruitment', name: 'Sachin (Recruitment Head)' },
  'sachin.mabicons@gmail.com': { password: 'Sachin@123', role: 'recruitmentHead', department: 'HR Recruitment', name: 'Sachin (Recruitment Head)' },
  
  // KAM - Priyanshi Sharma (Under Sachin)
  'priyanshi.mabicons@gmail.com': { password: 'Priyanshi@123', role: 'kamRecruitment', department: 'HR Recruitment', name: 'Priyanshi Sharma', supervisor: 'Sachin' },
  'priyanshi.sharma@mabicons.com': { password: 'Priyanshi@123', role: 'kamRecruitment', department: 'HR Recruitment', name: 'Priyanshi Sharma', supervisor: 'Sachin' },
  
  // KAM - Manju (Under Sachin)
  'manju.mabicons@gmail.com': { password: 'Manju@123', role: 'kamRecruitment', department: 'HR Recruitment', name: 'Manju', supervisor: 'Sachin' },
  'manju@mabicons.com': { password: 'Manju@123', role: 'kamRecruitment', department: 'HR Recruitment', name: 'Manju', supervisor: 'Sachin' },
  
  // KAM - Jyoti (Under Sachin)
  'jyoti.mabicons@gmail.com': { password: 'Jyoti@123', role: 'kamRecruitment', department: 'HR Recruitment', name: 'Jyoti', supervisor: 'Sachin' },
  'jyoti@mabicons.com': { password: 'Jyoti@123', role: 'kamRecruitment', department: 'HR Recruitment', name: 'Jyoti', supervisor: 'Sachin' },
  
  // Other roles
  'employee.mabicons@gmail.com': { password: 'Employee@123', role: 'employee', department: null, name: 'Employee' },
  'teamleader.mabicons@gmail.com': { password: 'TeamLeader@123', role: 'teamLeader', department: null, name: 'Team Leader' },
  'bd.mabicons@gmail.com': { password: 'BD@123', role: 'bdExecutive', department: null, name: 'BD Executive' },
};

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [isError, setIsError] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const ROLE_MAP = {
    superAdmin: 'superadmin',
    admin: 'admin',
    teamLeader: 'teamleader',
    employee: 'employee',
    bdExecutive: 'bd',
    hrOperations: 'hr',
    hrRecruitment: 'hr',
    recruitmentHead: 'recruitmentHead',
    kamRecruitment: 'kamRecruitment'
  };

  // Navigation helper function
  const navigateByRole = (role, emailLower, user) => {
    const isRecruitmentHead = role === 'recruitmentHead' || 
      (role === 'hrRecruitment' && emailLower.includes('sachin')) || 
      emailLower.includes('recruitment.mabicons');
    const isKAM = role === 'kamRecruitment' || 
      emailLower.includes('priyanshi') || 
      emailLower.includes('manju') || 
      emailLower.includes('jyoti');
    const isOperations = role === 'hrOperations' || 
      role === 'hr_operations' || 
      (role === 'Department Head' && user?.department === 'HR Operations') || 
      emailLower.includes('operation') || 
      emailLower.includes('ramesh');

    if (isRecruitmentHead) {
      navigate('/recruitment-head-dashboard');
    } else if (isKAM) {
      navigate('/kam-member-dashboard');
    } else if (isOperations) {
      navigate('/kam-operations-dashboard');
    } else if (role === 'superAdmin' || role === 'super_admin') {
      navigate('/superadmin-dashboard');
    } else if (role === 'admin') {
      navigate('/admin-dashboard');
    } else if (role === 'teamLeader' || role === 'team_leader') {
      navigate('/teamleader-dashboard');
    } else if (role === 'bdExecutive' || role === 'bd') {
      navigate('/bd-dashboard');
    } else {
      navigate('/employee-dashboard');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    const emailLower = email.toLowerCase().trim();
    setLoading(true);

    // Helper function to create mock token
    const createMockToken = (userData) => {
      const payload = {
        id: '123e4567-e89b-12d3-a456-426614174000', // Valid UUID format for development
        email: emailLower,
        name: userData.name,
        role: userData.role,
        department: userData.department,
        supervisor: userData.supervisor || null,
        exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60) // 24 hours
      };
      return btoa(JSON.stringify({ alg: 'HS256' })) + '.' + btoa(JSON.stringify(payload)) + '.mock-signature';
    };

    // Helper function for local/development mode login
    const localLogin = () => {
      const userData = USER_CREDENTIALS[emailLower];
      if (userData && userData.password === password) {
        const mockToken = createMockToken(userData);
        localStorage.setItem('token', mockToken);
        localStorage.setItem('userType', userData.role);
        localStorage.setItem('userName', userData.name);
        localStorage.setItem('userEmail', emailLower);
        if (userData.department) {
          localStorage.setItem('department', userData.department);
        }
        return {
          success: true,
          user: userData,
          userType: userData.role,
          token: mockToken,
          isLocal: true
        };
      }
      return null;
    };

    try {
      // First try local login for development/demo mode
      const localResult = localLogin();
      if (localResult) {
        console.log('✅ Local/Demo login successful:', localResult.user.name);
        setToastMessage(`Welcome, ${localResult.user.name}! (Demo Mode)`);
        setShowToast(true);
        setIsError(false);

        setTimeout(() => {
          navigateByRole(localResult.user.role, emailLower, localResult.user);
        }, 800);
        return;
      }

      // If local login fails, try backend API
      const { 
        superAdminLogin, 
        adminLogin, 
        teamLeaderLogin, 
        employeeLogin,
        departmentTeamLogin 
      } = await import('./service/api');
      
      let response;
      
      // Select the correct API based on the email
      if (emailLower.includes('superadmin') || emailLower.includes('ashish')) {
        response = await superAdminLogin({ email: emailLower, password });
      } else if (emailLower.includes('admin.') || emailLower.includes('ashwin')) {
        response = await adminLogin({ email: emailLower, password });
      } else if (emailLower.includes('teamleader')) {
        response = await teamLeaderLogin({ email: emailLower, password });
      } else if (emailLower.includes('employee')) {
        response = await employeeLogin({ email: emailLower, password });
      } else if (emailLower.includes('recruitment') || emailLower.includes('operation') || 
                 emailLower.includes('sachin') || emailLower.includes('ramesh')) {
        response = await departmentTeamLogin({ email: emailLower, password });
      } else if (emailLower.includes('priyanshi') || emailLower.includes('manju') || emailLower.includes('jyoti')) {
        response = await departmentTeamLogin({ email: emailLower, password });
      } else {
        // Default to admin login if pattern doesn't match
        response = await adminLogin({ email: emailLower, password });
      }

      if (response && response.success) {
        const user = response.user;
        const role = response.userType || user.role || user.userType;
        console.log("✅ API Login SUCCESS! Role:", role, "User:", user);
        
        // Save necessary info for ProtectedRoutes
        if (response.token) localStorage.setItem('token', response.token);
        localStorage.setItem('userType', role);
        localStorage.setItem('userName', user.name);
        localStorage.setItem('userEmail', emailLower);
        if (user.department) {
          localStorage.setItem('department', user.department);
        }
        
        setToastMessage(`Welcome, ${user.name}!`);
        setShowToast(true);
        setIsError(false);
  
        setTimeout(() => {
          navigateByRole(role, emailLower, user);
        }, 800);
      } else {
        throw new Error(response.message || 'Login failed');
      }
    } catch (error) {
      console.error("Login Error:", error);
      setToastMessage(error.message || 'Invalid email or password. Please check your credentials.');
      setShowToast(true);
      setIsError(true);
    } finally {
      setLoading(false);
    }
  };

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  return (
    <div className={`flex h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-100'} relative overflow-hidden`}>
      <div className="hidden lg:block w-1/2 relative overflow-hidden">
        <BackgroundAnimation />
      </div>

      {/* Right half - Login form */}
      <div className={`w-full lg:w-1/2 flex items-center justify-center px-8 py-12 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'} relative z-10`}>
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-xl"
        >
          <form onSubmit={handleSubmit} className={`${
            isDarkMode ? 'bg-gray-800/50 backdrop-blur-lg' : 'bg-white'
          } rounded-2xl shadow-2xl px-8 pt-8 pb-8 border ${
            isDarkMode ? 'border-gray-700' : 'border-gray-100'
          }`}>
            {/* Dark Mode Toggle */}
            <div className="flex justify-end mb-6">
              <button
                type="button"
                onClick={toggleDarkMode}
                className={`${
                  isDarkMode 
                    ? 'bg-gray-700 text-yellow-400' 
                    : 'bg-gray-100 text-gray-600'
                } px-4 py-2 rounded-full text-sm font-medium hover:shadow-md transition-all duration-300 flex items-center gap-2`}
              >
                {isDarkMode ? (
                  <>
                    <FiSun className="text-lg" />
                    Light Mode
                  </>
                ) : (
                  <>
                    <FiMoon className="text-lg" />
                    Dark Mode
                  </>
                )}
              </button>
            </div>

            {/* Welcome Text */}
            <div className="text-center mb-8">
              <h2 className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-2`}>
                Welcome 
              </h2>
              <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Please sign in to your account
              </p>
            </div>

            {/* Email Field */}
            <div className="mb-6">
              <label className={`block text-sm font-medium mb-2 ${
                isDarkMode ? 'text-gray-300' : 'text-gray-600'
              }`}>
                Email Address
              </label>
              <div className="relative">
                <input
                  className={`w-full px-4 py-3 rounded-xl ${
                    isDarkMode 
                      ? 'bg-gray-700 text-white border-gray-600' 
                      : 'bg-gray-50 text-gray-900 border-gray-200'
                  } border focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300`}
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <FiMail className={`absolute right-3 top-1/2 transform -translate-y-1/2 ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-500'
                }`} />
              </div>
            </div>

            {/* Password Field */}
            <div className="mb-6">
              <label className={`block text-sm font-medium mb-2 ${
                isDarkMode ? 'text-gray-300' : 'text-gray-600'
              }`}>
                Password
              </label>
              <div className="relative">
                <input
                  className={`w-full px-4 py-3 rounded-xl ${
                    isDarkMode 
                      ? 'bg-gray-700 text-white border-gray-600' 
                      : 'bg-gray-50 text-gray-900 border-gray-200'
                  } border focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300`}
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className={`absolute right-3 top-1/2 transform -translate-y-1/2 ${
                    isDarkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-600 hover:text-gray-700'
                  }`}
                >
                  {showPassword ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between mb-6">
              <label className="flex items-center">
               
                
              </label>
              <Link 
                to="/forgot-password" 
                className="text-sm text-blue-500 hover:text-blue-600 transition-colors duration-300"
              >
                Forgot Password?
              </Link>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full ${loading ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'} text-white font-medium py-3 px-4 rounded-xl
                transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] focus:outline-none
                focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 shadow-lg flex items-center justify-center`}
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Signing In...
                </div>
              ) : "Sign In"}
            </button>

            {/* Client Login Link */}
            <div className="mt-6 text-center">
              <Link 
                to="/client-login" 
                className={`text-sm ${
                  isDarkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-600 hover:text-gray-800'
                } transition-colors duration-300`}
              >
                Are you a client? Login here
              </Link>
            </div>

            {/* Error Message */}
            {isError && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 p-3 rounded-lg bg-red-100 text-red-700 text-sm"
              >
                Invalid email or password. Please try again.
              </motion.div>
            )}
          </form>
        </motion.div>
      </div>
      
      <Toast 
        message={toastMessage} 
        isVisible={showToast} 
        onClose={() => setShowToast(false)} 
        isDarkMode={isDarkMode}
      />
    </div>
  );
};

const styles = `
@keyframes moveGrid {
  0% {
    transform: translateY(0);
  }
  100% {
    transform: translateY(50px);
  }
}
`;

export default Login;