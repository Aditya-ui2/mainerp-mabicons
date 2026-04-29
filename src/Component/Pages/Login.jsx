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
    <div className="flex min-h-screen bg-white overflow-hidden font-outfit">
      {/* Left Side - Login Form */}
      <div className="w-full lg:w-1/2 flex flex-col px-8 md:px-16 lg:px-24 py-12">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-md w-full mx-auto flex-1 flex flex-col justify-center -mt-16"
        >
          {/* Logo Section - Enhanced with animations */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2, type: "spring" }}
            className="flex justify-center mb-10"
          >
            <div className="w-56 h-20 flex items-center justify-center relative">
              <img src={mabiconsLogo} alt="Mabicons Logo" className="w-full h-full object-contain relative z-10" />
              <motion.div 
                animate={{ 
                  scale: [1, 1.2, 1],
                  opacity: [0.3, 0.1, 0.3]
                }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute inset-0 bg-blue-400/20 blur-3xl rounded-full"
              />
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mb-10 text-center"
          >
            <h1 className="text-3xl font-medium text-[#1A1A2E] mb-2 tracking-tight">Welcome Back</h1>
            <p className="text-sm font-normal text-slate-500 tracking-wide">Please enter your credentials to log in.</p>
          </motion.div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="block text-[10px] font-black text-slate-500 px-1 uppercase tracking-[2px]">Email Address</label>
              <div className="relative group">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#F9FBFF] border border-slate-100 rounded-2xl px-5 py-4 text-sm font-medium outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 transition-all placeholder:text-slate-300"
                  placeholder="name@mabicons.com"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-[10px] font-black text-slate-500 px-1 uppercase tracking-[2px]">Password</label>
              <div className="relative group">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[#F9FBFF] border border-slate-100 rounded-2xl px-5 py-4 text-sm font-medium outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 transition-all placeholder:text-slate-300"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-600 transition-colors"
                >
                  {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between px-1">
              <label className="flex items-center gap-2.5 cursor-pointer group">
                <div className={`w-5 h-5 rounded-lg border-2 flex items-center justify-center transition-all ${rememberMe ? 'bg-blue-600 border-blue-600' : 'border-slate-200 group-hover:border-blue-400 bg-white'}`} onClick={() => setRememberMe(!rememberMe)}>
                  {rememberMe && <FiCheck className="text-white text-xs stroke-[3px]" />}
                </div>
                <span className="text-xs font-medium text-slate-500 group-hover:text-slate-700 transition-colors">Remember Me</span>
              </label>
              <Link to="/forgot-password" title="Forgot Password" className="text-xs font-semibold text-blue-600 hover:text-blue-700">Forgot Password?</Link>
            </div>

            <motion.button
              whileHover={{ y: -2, shadow: "0 20px 40px rgba(37, 99, 235, 0.2)" }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white rounded-2xl py-4.5 text-sm font-bold uppercase tracking-[2px] shadow-lg shadow-blue-600/20 hover:bg-blue-700 transition-all disabled:opacity-70 disabled:cursor-not-allowed mt-4 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Signing In...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <FiArrowRight size={18} />
                </>
              )}
            </motion.button>
            {error && <p className="text-rose-500 text-xs font-semibold text-center">{error}</p>}

            <div className="relative py-2">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-100"></div></div>
              <div className="relative flex justify-center text-[10px] uppercase tracking-widest"><span className="bg-white px-4 text-slate-400 font-semibold">Or continue with</span></div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button type="button" className="flex items-center justify-center gap-2 py-3 border border-slate-100 rounded-xl hover:bg-slate-50 transition-all text-xs font-semibold text-slate-600">
                <FcGoogle size={18} /> Google
              </button>
              <button type="button" className="flex items-center justify-center gap-2 py-3 border border-slate-100 rounded-xl hover:bg-slate-50 transition-all text-xs font-semibold text-slate-600">
                <FaApple size={18} /> Apple
              </button>
            </div>
          </form>
        </motion.div>
      </div>

      {/* Right Side - Marketing/Dashboard Mockup */}
      <div className="hidden lg:flex w-1/2 bg-[#1B4DA0] relative overflow-hidden p-20 flex-col justify-center">
        {/* Animated Background Elements */}
        <motion.div
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.03, 0.06, 0.03]
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-0 right-0 w-[1000px] h-[1000px] bg-white rounded-full -mr-[500px] -mt-[500px]"
        />

        <div className="relative z-10 space-y-12">
          <div className="max-w-md">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5, duration: 0.8 }}
            >
              <h2 className="text-[40px] font-bold text-white mb-6 leading-[1.2] font-syne tracking-tight">
                Empower your recruitment operations.
              </h2>
              <div className="w-16 h-1 bg-blue-400 rounded-full mb-8" />
              <p className="text-blue-100/70 text-base font-medium leading-relaxed">
                Log in to access your unified ERP dashboard, manage candidate pipelines, and streamline your entire hiring lifecycle.
              </p>
            </motion.div>
          </div>

          {/* Mockup Container with premium animation */}
          <motion.div
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.8, duration: 1.2, ease: "easeOut" }}
            className="relative group"
          >
            <div className="bg-white/5 backdrop-blur-xl rounded-[40px] p-4 shadow-2xl border border-white/10 overflow-hidden">
              <img
                src={loginMockup}
                alt="Dashboard Mockup"
                className="rounded-[28px] w-full shadow-2xl transition-all duration-1000 group-hover:scale-[1.02]"
              />
            </div>

            {/* Floating UI Elements */}
            <motion.div
              animate={{ y: [0, -12, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -top-6 -right-6 w-32 h-32 bg-white/10 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/20 hidden xl:flex items-center justify-center p-6"
            >
              <div className="space-y-3 w-full">
                <div className="h-1.5 w-full bg-white/20 rounded-full overflow-hidden">
                  <motion.div animate={{ width: ["0%", "80%", "80%"] }} transition={{ duration: 2, delay: 1.5 }} className="h-full bg-blue-400" />
                </div>
                <div className="h-1.5 w-2/3 bg-white/20 rounded-full overflow-hidden">
                  <motion.div animate={{ width: ["0%", "50%", "50%"] }} transition={{ duration: 2, delay: 1.7 }} className="h-full bg-blue-300" />
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Login;
