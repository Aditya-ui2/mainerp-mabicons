import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiMail, FiLock, FiEye, FiEyeOff, FiCheck, FiArrowRight } from 'react-icons/fi';
import { FcGoogle } from 'react-icons/fc';
import { FaApple } from 'react-icons/fa';
import loginMockup from '../../assets/login-mockup.png';
import mabiconsLogo from '../../assets/images/mabicons logo blue.png';

// Predefined user credentials (kept from original)
const USER_CREDENTIALS = {
  'superadmin.mabicons@gmail.com': { password: 'Mabicons@123', role: 'superAdmin', department: null, name: 'Ashish (Super Admin)' },
  'ashish.mabicons@gmail.com': { password: 'Ashish@123', role: 'superAdmin', department: null, name: 'Ashish (Super Admin)' },
  'admin.mabicons@gmail.com': { password: 'Mabicons@123', role: 'admin', department: null, name: 'Admin' },
  'ashwin.mabicons@gmail.com': { id: '28e15eed-8297-440a-b8cd-976be26bc048', password: 'Ashwin@123', role: 'manager', department: 'Management', name: 'Ashwin (Manager)' },
  'operation.mabicons@gmail.com': { password: 'Mabicons@123', role: 'hrOperations', department: 'HR Operations', name: 'Ramesh (HR Operations Head)' },
  'ramesh.mabicons@gmail.com': { password: 'Ramesh@123', role: 'hrOperations', department: 'HR Operations', name: 'Ramesh (HR Operations Head)' },
  'recruitment.mabicons@gmail.com': { id: '60de4380-0140-49ff-b26d-a8d06333af11', password: 'Mabicons@123', role: 'recruitmentHead', department: 'HR Recruitment', name: 'Sachin (Recruitment Head)' },
  'sachin.mabicons@gmail.com': { id: '60de4380-0140-49ff-b26d-a8d06333af11', password: 'Sachin@123', role: 'recruitmentHead', department: 'HR Recruitment', name: 'Sachin (Recruitment Head)' },
  'priyanshi.recruitment@gmail.com': { password: 'Priyanshi@123', role: 'kamRecruitment', department: 'HR Recruitment', name: 'Priyanshi Sharma', supervisor: 'Sachin' },
  'manju.recruitment@gmail.com': { password: 'Manju@123', role: 'kamRecruitment', department: 'HR Recruitment', name: 'Manju', supervisor: 'Sachin' },
  'jyoti.recruitment@gmail.com': { password: 'Jyoti@123', role: 'kamRecruitment', department: 'HR Recruitment', name: 'Jyoti', supervisor: 'Sachin' },
  'employee.mabicons@gmail.com': { password: 'Employee@123', role: 'employee', department: null, name: 'Employee' },
  'teamleader.mabicons@gmail.com': { password: 'TeamLeader@123', role: 'teamLeader', department: null, name: 'Team Leader' },
  'bd.mabicons@gmail.com': { password: 'BD@123', role: 'bdExecutive', department: null, name: 'BD Executive' },
  'crm@mabicons.com': { password: 'Crm@123', role: 'bd', department: null, name: 'CRM Executive' },
};

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const normalizeRole = (role, department = '') => {
    const value = String(role || '').trim().toLowerCase();
    const dept = String(department || '').trim().toLowerCase();
    if (['superadmin', 'super_admin', 'super admin'].includes(value)) return 'superadmin';
    if (['admin'].includes(value)) return 'admin';
    if (['teamleader', 'team_leader', 'team leader'].includes(value)) return 'teamleader';
    if (['employee'].includes(value)) return 'employee';
    if (['bdexecutive', 'bd_executive', 'bd executive', 'bd'].includes(value)) return 'bd';
    if (['hroperations', 'hr_operations', 'hr operations', 'operations'].includes(value)) return 'hrOperations';
    if (['recruitmenthead', 'recruitment_head', 'recruitment head', 'recruitment'].includes(value)) return 'recruitmentHead';
    if (['kamrecruitment', 'kam_recruitment', 'kam recruitment', 'kam'].includes(value)) return 'kamRecruitment';
    return value;
  };

  const navigateByRole = (role, emailLower, user) => {
    if (emailLower === 'crm@mabicons.com' || emailLower.includes('ashwin')) {
      navigate('/crm-dashboard'); return;
    }
    const isRecruitmentHead = role === 'recruitmentHead' || emailLower.includes('sachin') || emailLower.includes('recruitment.mabicons');
    const isKAM = role === 'kamRecruitment' || emailLower.includes('priyanshi') || emailLower.includes('manju') || emailLower.includes('jyoti');
    const isOperations = role === 'hrOperations' || emailLower.includes('operation') || emailLower.includes('ramesh');

    if (isRecruitmentHead) navigate('/recruitment-head-dashboard');
    else if (isKAM) navigate('/kam-member-dashboard');
    else if (isOperations) navigate('/kam-operations-dashboard');
    else if (role === 'superAdmin' || role === 'manager') navigate('/manager-dashboard');
    else if (role === 'admin') navigate('/admin-dashboard');
    else if (role === 'teamLeader') navigate('/teamleader-dashboard');
    else if (role === 'bdExecutive') navigate('/bd-dashboard');
    else navigate('/employee-dashboard');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const emailLower = email.toLowerCase().trim();
    const passTrim = password.trim();

    // Helper function to create mock token (fallback)
    const createMockToken = (userData) => {
      const payload = {
        id: userData.id || btoa(emailLower).slice(0, 24),
        email: emailLower,
        name: userData.name,
        role: userData.role,
        department: userData.department,
        exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60)
      };
      return btoa(JSON.stringify({ alg: 'HS256' })) + '.' + btoa(JSON.stringify(payload)) + '.mock-signature';
    };

    // Fallback logic
    const localLogin = () => {
      const userData = USER_CREDENTIALS[emailLower];
      if (userData && userData.password === passTrim) {
        const mockToken = createMockToken(userData);
        const normalizedRole = normalizeRole(userData.role, userData.department);
        localStorage.setItem('token', mockToken);
        localStorage.setItem('userType', normalizedRole);
        localStorage.setItem('userName', userData.name);
        localStorage.setItem('userEmail', emailLower);
        if (userData.department) localStorage.setItem('department', userData.department);
        return { success: true, user: userData, userType: normalizedRole, token: mockToken };
      }
      return null;
    };

    try {
      const {
        superAdminLogin, adminLogin, teamLeaderLogin, employeeLogin, departmentTeamLogin
      } = await import('./service/api');

      let response;
      if (emailLower.includes('superadmin') || emailLower.includes('ashish')) {
        response = await superAdminLogin({ email: emailLower, password });
      } else if (emailLower.includes('admin.') || emailLower.includes('ashwin')) {
        response = await adminLogin({ email: emailLower, password });
      } else if (emailLower.includes('teamleader')) {
        response = await teamLeaderLogin({ email: emailLower, password });
      } else if (emailLower.includes('employee')) {
        response = await employeeLogin({ email: emailLower, password });
      } else if (emailLower.includes('recruitment') || emailLower.includes('operation') ||
        emailLower.includes('sachin') || emailLower.includes('ramesh') ||
        emailLower.includes('priyanshi') || emailLower.includes('manju') || emailLower.includes('jyoti')) {
        response = await departmentTeamLogin({ email: emailLower, password });
      } else {
        response = await adminLogin({ email: emailLower, password });
      }

      if (response && response.success) {
        const user = response.user;
        const role = response.userType || user.role || user.userType;
        const normalizedRole = normalizeRole(role, user.department);

        if (response.token) localStorage.setItem('token', response.token);
        localStorage.setItem('userType', normalizedRole);
        localStorage.setItem('userName', user.name);
        localStorage.setItem('userEmail', emailLower);
        if (user.department) localStorage.setItem('department', user.department);

        // Clear dashboard tab persistence
        ['admin_active_tab', 'crm_active_tab', 'hroperations_active_tab', 'rh_active_tab', 'superadmin_active_tab'].forEach(key => localStorage.removeItem(key));

        setTimeout(() => navigateByRole(normalizedRole, emailLower, user), 800);
        return;
      }

      // Fallback
      const localResult = localLogin();
      if (localResult) {
        setTimeout(() => navigateByRole(localResult.userType, emailLower, localResult.user), 800);
        return;
      }

      throw new Error(response?.message || 'Login failed');
    } catch (err) {
      console.error("Login Error:", err);
      const localResult = localLogin();
      if (localResult) {
        setTimeout(() => navigateByRole(localResult.userType, emailLower, localResult.user), 800);
        return;
      }
      setError(err.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-white overflow-hidden font-inter">
      {/* Left Side - Auth Form */}
      <div className="w-full lg:w-[45%] flex flex-col px-12 md:px-20 lg:px-24 py-12 relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-md w-full mx-auto flex-1 flex flex-col justify-center"
        >
          {/* Centered Logo */}
          <div className="flex justify-center mb-10">
            <img src={mabiconsLogo} alt="Mabicons Logo" className="h-12 object-contain" />
          </div>

          <div className="mb-10 text-center">
            <h1 className="text-[36px] font-bold text-[#1A1A2E] mb-2 font-syne tracking-tight">Welcome Back</h1>
            <p className="text-base font-medium text-[#9B9BAD]">Please enter your credentials to log in.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-7">
            <div className="space-y-2">
              <label className="block text-[11px] font-black text-[#9B9BAD] uppercase tracking-[2px] px-1">Email Address</label>
              <div className="relative group">
                <div className="absolute left-6 top-1/2 -translate-y-1/2 text-[#9B9BAD] group-focus-within:text-[#1B4DA0] transition-colors">
                  <FiMail size={18} />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#F3F5F9] border-none rounded-2xl py-5 pl-14 pr-6 text-sm font-bold text-[#1A1A2E] outline-none transition-all focus:ring-4 focus:ring-[#1B4DA0]/5 placeholder:text-[#9B9BAD]/40"
                  placeholder="ashwin.mabicons@gmail.com"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-[11px] font-black text-[#9B9BAD] uppercase tracking-[2px] px-1">Password</label>
              <div className="relative group">
                <div className="absolute left-6 top-1/2 -translate-y-1/2 text-[#9B9BAD] group-focus-within:text-[#1B4DA0] transition-colors">
                  <FiLock size={18} />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[#F3F5F9] border-none rounded-2xl py-5 pl-14 pr-6 text-sm font-bold text-[#1A1A2E] outline-none transition-all focus:ring-4 focus:ring-[#1B4DA0]/5 placeholder:text-[#9B9BAD]/40"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-6 top-1/2 -translate-y-1/2 text-[#9B9BAD] hover:text-[#1B4DA0] transition-colors"
                >
                  {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between px-1">
              <label className="flex items-center gap-3 cursor-pointer group">
                <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${rememberMe ? 'bg-[#1B4DA0] border-[#1B4DA0]' : 'border-[#E5E7EB] bg-white group-hover:border-[#1B4DA0]'}`} onClick={() => setRememberMe(!rememberMe)}>
                  {rememberMe && <FiCheck className="text-white text-xs stroke-[4px]" />}
                </div>
                <span className="text-sm font-bold text-[#6B6B7E] group-hover:text-[#1A1A2E] transition-colors">Remember Me</span>
              </label>
              <Link to="/forgot-password" title="Forgot Password" className="text-sm font-bold text-[#1B4DA0] hover:underline transition-all">Forgot Password?</Link>
            </div>

            <motion.button
              whileHover={{ y: -2, shadow: "0 20px 40px rgba(27, 77, 160, 0.25)" }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className="w-full bg-[#1B4DA0] text-white rounded-2xl py-5 text-sm font-black uppercase tracking-[2px] shadow-xl shadow-[#1B4DA0]/20 hover:bg-[#153e82] transition-all disabled:opacity-70 flex items-center justify-center gap-3"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Signing In...</span>
                </>
              ) : (
                <>
                  SIGN IN <FiArrowRight size={18} strokeWidth={3} />
                </>
              )}
            </motion.button>
            {error && <p className="text-rose-500 text-xs font-bold text-center mt-4 uppercase tracking-widest">{error}</p>}
            <div className="grid grid-cols-2 gap-4">
            </div>
          </form>

          {/* Footer Copyright */}
          <div className="mt-16 text-center">
            <p className="text-[12px] font-medium text-[#9B9BAD]">© 2024 Mabicons. All rights reserved.</p>
          </div>
        </motion.div>
      </div>

      {/* Right Side - Brand Showcase */}
      <div className="hidden lg:flex flex-1 bg-[#1B4DA0] relative overflow-hidden px-16 py-12 flex-col justify-center items-center text-center">
        {/* Animated Background Elements */}
        <motion.div
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.03, 0.05, 0.03]
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-[10%] -right-[10%] w-[800px] h-[800px] bg-white rounded-full blur-[100px]"
        />

        <div className="relative z-10 w-full flex flex-col items-center flex-1 min-h-0">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="max-w-xl mb-10 shrink-0"
          >
            <h2 className="text-[40px] font-bold text-white mb-6 leading-[1.1] font-syne tracking-tight">
              Empower your recruitment operations.
            </h2>
            <div className="w-20 h-1.5 bg-blue-400 rounded-full mb-10 shadow-[0_0_20px_rgba(96,165,250,0.5)] mx-auto" />
            <p className="text-lg text-blue-100/70 font-medium leading-relaxed">
              Log in to access your unified ERP dashboard, manage candidate pipelines, and streamline your entire hiring lifecycle.
            </p>
          </motion.div>

          {/* Dashboard Preview Mockup - Flex container to handle dynamic height */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, delay: 0.6, ease: "easeOut" }}
            className="relative w-full flex-1 min-h-0 flex items-center justify-center"
          >
            {/* Glassmorphic Container with max-height to prevent overflow */}
            <div className="p-4 bg-white/10 backdrop-blur-xl rounded-[40px] border border-white/20 shadow-[0_40px_100px_rgba(0,0,0,0.3)] max-w-[85%] max-h-full overflow-hidden">
              <div className="overflow-hidden rounded-[28px] relative group h-full">
                <img
                  src={loginMockup}
                  alt="Dashboard Preview"
                  className="w-full h-full object-contain transform group-hover:scale-105 transition-transform duration-1000"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#1B4DA0]/30 to-transparent pointer-events-none" />
              </div>
            </div>

            {/* Floating UI Elements */}
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
              className="absolute top-0 -right-4 w-32 h-20 bg-white/10 backdrop-blur-2xl rounded-2xl border border-white/20 shadow-2xl flex items-center justify-center p-4"
            >
              <div className="w-full space-y-3">
                <div className="h-1.5 w-full bg-blue-400/30 rounded-full overflow-hidden">
                  <motion.div
                    animate={{ width: ["0%", "80%", "80%"] }}
                    transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                    className="h-full bg-blue-400 shadow-[0_0_15px_#60A5FA]"
                  />
                </div>
                <div className="h-1.5 w-[60%] bg-white/20 rounded-full" />
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Login;
