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

    // Check local credentials first for known users to ensure reliability
    const localResult = (() => {
      const userData = USER_CREDENTIALS[emailLower];
      if (userData && userData.password === passTrim) {
        const normalizedRole = normalizeRole(userData.role, userData.department);
        
        // Generate a valid-format mock JWT so jwt-decode doesn't throw in ProtectedRoute
        const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
        const payload = btoa(JSON.stringify({ 
          role: userData.role, // Use original role from credentials
          email: emailLower, 
          name: userData.name,
          iat: Math.floor(Date.now() / 1000),
          exp: Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60) // 7 days
        }));
        const mockToken = `${header}.${payload}.mock-signature`;

        localStorage.setItem('token', mockToken);
        localStorage.setItem('userType', normalizedRole);
        localStorage.setItem('userName', userData.name);
        localStorage.setItem('userEmail', emailLower);
        if (userData.department) localStorage.setItem('department', userData.department);
        ['admin_active_tab', 'crm_active_tab', 'hroperations_active_tab', 'rh_active_tab', 'superadmin_active_tab'].forEach(key => localStorage.removeItem(key));
        return { success: true, user: userData, userType: normalizedRole };
      }
      return null;
    })();

    if (localResult) {
      setTimeout(() => {
        navigateByRole(localResult.userType, emailLower, localResult.user);
        setLoading(false);
      }, 800);
      return;
    }

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
        ['admin_active_tab', 'crm_active_tab', 'hroperations_active_tab', 'rh_active_tab', 'superadmin_active_tab'].forEach(key => localStorage.removeItem(key));
        setTimeout(() => navigateByRole(normalizedRole, emailLower, user), 800);
        return;
      }

      throw new Error(response?.message || 'Login failed');
    } catch (err) {
      setError(err.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-white overflow-hidden font-inter">
      {/* Left Side - Auth Form */}
      <div className="w-full lg:w-[45%] flex flex-col px-12 md:px-20 lg:px-24 py-10 relative overflow-y-auto custom-scrollbar">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-[420px] w-full mx-auto flex flex-col h-full"
        >
          {/* Logo */}
          <div className="flex justify-start mb-16 shrink-0">
            <img src={mabiconsLogo} alt="Mabicons Logo" className="h-8 object-contain" />
          </div>

          <div className="flex-1 flex flex-col justify-center">
            <div className="mb-10 text-center">
              <h1 className="text-[38px] font-bold text-[#1A1A2E] mb-3 font-syne tracking-tight">Welcome Back</h1>
              <p className="text-[15px] font-medium text-[#9B9BAD]">Enter your email and password to access your account.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="block text-[13px] font-bold text-[#1A1A2E] px-1">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-white border border-[#E5E7EB] rounded-xl py-4 px-5 text-sm font-medium text-[#1A1A2E] outline-none transition-all focus:border-[#3D37F1] focus:ring-4 focus:ring-[#3D37F1]/5 placeholder:text-[#9B9BAD]/50"
                  placeholder="sellostore@company.com"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="block text-[13px] font-bold text-[#1A1A2E] px-1">Password</label>
                <div className="relative group">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-white border border-[#E5E7EB] rounded-xl py-4 px-5 text-sm font-medium text-[#1A1A2E] outline-none transition-all focus:border-[#3D37F1] focus:ring-4 focus:ring-[#3D37F1]/5 placeholder:text-[#9B9BAD]/50"
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-5 top-1/2 -translate-y-1/2 text-[#9B9BAD] hover:text-[#3D37F1] transition-colors"
                  >
                    {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between px-1">
                <label className="flex items-center gap-2.5 cursor-pointer group">
                  <div className={`w-4.5 h-4.5 rounded border border-[#D1D5DB] flex items-center justify-center transition-all ${rememberMe ? 'bg-[#3D37F1] border-[#3D37F1]' : 'bg-white group-hover:border-[#3D37F1]'}`} onClick={() => setRememberMe(!rememberMe)}>
                    {rememberMe && <FiCheck className="text-white text-[10px] stroke-[4px]" />}
                  </div>
                  <span className="text-[14px] font-medium text-[#6B7280] group-hover:text-[#1A1A2E] transition-colors">Remember Me</span>
                </label>
                <Link to="/forgot-password" title="Forgot Password" className="text-[14px] font-bold text-[#3D37F1] hover:underline transition-all">Forgot Your Password?</Link>
              </div>

              <motion.button
                whileHover={{ scale: 1.005 }}
                whileTap={{ scale: 0.995 }}
                type="submit"
                disabled={loading}
                className="w-full bg-[#3D37F1] text-white rounded-xl py-4 text-[16px] font-bold shadow-lg shadow-[#3D37F1]/20 hover:bg-[#312BC7] transition-all disabled:opacity-70 flex items-center justify-center gap-3"
              >
                {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : "Log In"}
              </motion.button>

              <div className="relative py-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-[#F3F4F6]"></div>
                </div>
              </div>

            </form>
          </div>

          {/* Footer Copyright */}
          <div className="mt-auto pt-8 flex items-center justify-between border-t border-[#F3F4F6] shrink-0">
            <p className="text-[11px] font-medium text-[#9CA3AF]">Copyright © 2026 Mabicons Enterprises Ltd.</p>
            <Link to="/privacy" className="text-[11px] font-medium text-[#9CA3AF] hover:text-[#1A1A2E]">Privacy Policy</Link>
          </div>
        </motion.div>
      </div>

      {/* Right Side - Brand Showcase */}
      <div className="hidden lg:flex lg:flex-1 bg-[#3D37F1] relative overflow-hidden flex-col justify-center p-20">
        <div className="absolute top-0 right-0 w-[1000px] h-[1000px] bg-white/5 blur-[150px] rounded-full -mr-40 -mt-40" />

        <div className="relative z-10 w-full max-w-2xl mx-auto flex flex-col items-start text-left">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="mb-12"
          >
            <h2 className="text-[48px] font-bold text-white mb-6 leading-[1.1] font-syne tracking-tight">
              Effortlessly manage your team and operations.
            </h2>
            <p className="text-xl text-white/70 font-medium leading-relaxed max-w-lg">
              Log in to access your CRM dashboard and manage your team.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.2, delay: 0.4 }}
            className="relative w-full"
          >
            <div className="p-2 bg-white/5 backdrop-blur-xl rounded-[32px] border border-white/10 shadow-[0_50px_100px_rgba(0,0,0,0.3)]">
              <div className="overflow-hidden rounded-[24px] bg-white p-2">
                <img
                  src={loginMockup}
                  alt="Dashboard Preview"
                  className="w-full h-auto object-cover rounded-[18px] shadow-sm"
                />
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #F3F4F6;
          border-radius: 10px;
        }
      `}</style>
    </div>
  );
};

export default Login;
